"use server";
import { z } from "zod";
import { assertPermission, type Permission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { audit, fail, revalidateEvent, zodFieldErrors, type ActionResult } from "@/lib/server/audit";
import { COLLECTION_TABLES, collectionSchemas, type CollectionTable } from "@/lib/validation/content";

const LABEL: Record<CollectionTable, string> = {
  event_metrics: "indicador",
  event_results: "resultado",
  event_audience: "dado de público",
  event_testimonials: "depoimento",
  sponsorship_opportunities: "oportunidade",
  sponsorship_tiers: "cota",
  event_sponsors: "patrocinador",
  event_media: "mídia",
};

function permissionFor(table: CollectionTable): Permission {
  return table === "event_media" ? "media.write" : "events.write";
}

function assertTable(table: string): asserts table is CollectionTable {
  if (!COLLECTION_TABLES.includes(table as CollectionTable)) throw new Error("Tabela inválida.");
}

/**
 * Salva (cria ou atualiza) um item de uma coleção do evento.
 * A validação é por tabela; o RLS garante a autorização no banco.
 */
export async function saveCollectionItem(table: string, eventId: string, id: string | null, values: Record<string, unknown>): Promise<ActionResult<{ id: string }>> {
  try {
    assertTable(table);
    // Perfil comercial pode atualizar somente as vendas das cotas.
    const salesOnly = table === "sponsorship_tiers" && id != null;
    let session;
    try {
      session = await assertPermission(permissionFor(table));
    } catch (e) {
      if (!salesOnly) throw e;
      session = await assertPermission("tiers.sales");
      const sold = z.coerce.number().int().min(0).safeParse(values.quantity_sold);
      if (!sold.success) return { ok: false, error: "Quantidade inválida." };
      const supabase = await createClient();
      const { error } = await supabase.from("sponsorship_tiers").update({ quantity_sold: sold.data }).eq("id", id!).eq("event_id", eventId);
      if (error) throw new Error(error.message);
      await audit({ actorId: session.userId, action: "tier.sales", entity: table, entityId: id, eventId, summary: `Atualizou vendas da cota para ${sold.data}` });
      await revalidateEvent(eventId);
      return { ok: true, data: { id: id! }, message: "Vendas atualizadas." };
    }

    const schema = collectionSchemas[table];
    const parsed = schema.safeParse(values);
    if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
    const supabase = await createClient();
    const row = parsed.data as Record<string, unknown>;

    // Só um indicador em destaque por evento.
    if (table === "event_metrics" && row.featured) {
      await supabase.from("event_metrics").update({ featured: false }).eq("event_id", eventId).neq("id", id ?? "00000000-0000-0000-0000-000000000000");
    }

    if (id) {
      const { error } = await supabase.from(table).update(row as never).eq("id", id).eq("event_id", eventId);
      if (error) throw new Error(error.message);
      await audit({ actorId: session.userId, action: `${table}.update`, entity: table, entityId: id, eventId, summary: `Editou ${LABEL[table]}` });
      await revalidateEvent(eventId);
      return { ok: true, data: { id }, message: "Alterações salvas." };
    }
    const { data: last } = await supabase.from(table).select("position").eq("event_id", eventId).order("position", { ascending: false }).limit(1).maybeSingle();
    const position = ((last as { position?: number } | null)?.position ?? -1) + 1;
    const { data, error } = await supabase
      .from(table)
      .insert({ ...row, event_id: eventId, position } as never)
      .select("id")
      .single();
    if (error) throw new Error(/duplicate key/.test(error.message) ? "Essa marca já está vinculada com esse tipo de relação." : error.message);
    const newId = (data as { id: string }).id;
    await audit({ actorId: session.userId, action: `${table}.create`, entity: table, entityId: newId, eventId, summary: `Adicionou ${LABEL[table]}` });
    await revalidateEvent(eventId);
    return { ok: true, data: { id: newId }, message: "Item adicionado." };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCollectionItem(table: string, eventId: string, id: string): Promise<ActionResult> {
  try {
    assertTable(table);
    const session = await assertPermission(permissionFor(table));
    const supabase = await createClient();
    if (table === "event_media") {
      const { data: m } = await supabase.from("event_media").select("storage_path").eq("id", id).eq("event_id", eventId).maybeSingle();
      const { error } = await supabase.from("event_media").delete().eq("id", id).eq("event_id", eventId);
      if (error) throw new Error(error.message);
      if (m?.storage_path) {
        const { count } = await supabase.from("event_media").select("id", { count: "exact", head: true }).eq("storage_path", m.storage_path);
        if (!count) await supabase.storage.from("media").remove([m.storage_path]);
      }
    } else {
      const { error } = await supabase.from(table).delete().eq("id", id).eq("event_id", eventId);
      if (error) throw new Error(error.message);
    }
    await audit({ actorId: session.userId, action: `${table}.delete`, entity: table, entityId: id, eventId, summary: `Removeu ${LABEL[table]}` });
    await revalidateEvent(eventId);
    return { ok: true, message: "Item removido." };
  } catch (e) {
    return fail(e);
  }
}

export async function reorderCollection(table: string, eventId: string, ids: string[]): Promise<ActionResult> {
  try {
    assertTable(table);
    await assertPermission(permissionFor(table));
    const parsed = z.array(z.uuid()).max(300).safeParse(ids);
    if (!parsed.success) return { ok: false, error: "Ordem inválida." };
    const supabase = await createClient();
    const results = await Promise.all(parsed.data.map((id, position) => supabase.from(table).update({ position } as never).eq("id", id).eq("event_id", eventId)));
    const err = results.find((r) => r.error)?.error;
    if (err) throw new Error(err.message);
    await revalidateEvent(eventId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
