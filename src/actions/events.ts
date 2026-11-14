"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { audit, fail, revalidateEvent, zodFieldErrors, type ActionResult } from "@/lib/server/audit";
import { brandingSchema, eventBasicsSchema, eventContactSchema, integrationsSchema, sectionSchema, seoSchema, slugSchema } from "@/lib/validation/content";
import { slugify } from "@/lib/format";
import type { Json } from "@/lib/supabase/database.types";
import { FONT_OPTIONS } from "@/lib/fonts";

async function uniqueSlug(base: string) {
  const supabase = await createClient();
  const root = slugify(base) || "evento";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const { data } = await supabase.from("events").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export async function checkSlug(slug: string, exceptId?: string): Promise<{ available: boolean; suggestion: string }> {
  await assertPermission("events.read");
  const supabase = await createClient();
  const clean = slugify(slug);
  let q = supabase.from("events").select("id").eq("slug", clean);
  if (exceptId) q = q.neq("id", exceptId);
  const { data } = await q.maybeSingle();
  return { available: !data && slugSchema.safeParse(clean).success, suggestion: data ? await uniqueSlug(clean) : clean };
}

/** Etapa 1 do assistente: cria o evento como rascunho e segue para a identidade visual. */
export async function createEvent(_: unknown, form: FormData): Promise<ActionResult> {
  try {
    const session = await assertPermission("events.write");
    const raw = Object.fromEntries(form);
    const slug = raw.slug ? String(raw.slug) : await uniqueSlug(String(raw.name ?? ""));
    const parsed = eventBasicsSchema.safeParse({ ...raw, slug });
    if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .insert({ ...parsed.data, status: "draft", created_by: session.userId, updated_by: session.userId })
      .select("id, name")
      .single();
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: "event.create", entity: "event", entityId: data.id, eventId: data.id, summary: `Criou o evento ${data.name}` });
    revalidatePath("/admin", "layout");
    redirect(`/admin/eventos/${data.id}/assistente/2`);
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e; // redirect
    return fail(e);
  }
}

export async function updateEventBasics(eventId: string, values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const session = await assertPermission("events.write");
    const parsed = eventBasicsSchema.safeParse(values);
    if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
    const supabase = await createClient();
    const { data: before } = await supabase.from("events").select("slug").eq("id", eventId).single();
    const { error } = await supabase.from("events").update({ ...parsed.data, updated_by: session.userId }).eq("id", eventId);
    if (error) throw new Error(error.message);
    if (before && before.slug !== parsed.data.slug) revalidatePath(`/eventos/${before.slug}`);
    await audit({ actorId: session.userId, action: "event.update", entity: "event", entityId: eventId, eventId, summary: "Atualizou informações gerais" });
    await revalidateEvent(eventId);
    return { ok: true, message: "Informações salvas." };
  } catch (e) {
    return fail(e);
  }
}

export async function updateEventContact(eventId: string, values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const session = await assertPermission("events.write");
    const parsed = eventContactSchema.safeParse(values);
    if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
    const supabase = await createClient();
    const { error } = await supabase
      .from("events")
      .update({ ...parsed.data, social_links: parsed.data.social_links as NonNullable<Json>, footer_links: parsed.data.footer_links as NonNullable<Json>, updated_by: session.userId })
      .eq("id", eventId);
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: "event.update", entity: "event", entityId: eventId, eventId, summary: "Atualizou contatos e formulário" });
    await revalidateEvent(eventId);
    return { ok: true, message: "Contatos salvos." };
  } catch (e) {
    return fail(e);
  }
}

export async function updateSeo(eventId: string, values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const session = await assertPermission("events.write");
    const parsed = seoSchema.safeParse(values);
    if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
    const supabase = await createClient();
    const { error } = await supabase.from("events").update({ ...parsed.data, updated_by: session.userId }).eq("id", eventId);
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: "event.update", entity: "event", entityId: eventId, eventId, summary: "Atualizou SEO e compartilhamento" });
    await revalidateEvent(eventId);
    return { ok: true, message: "SEO salvo." };
  } catch (e) {
    return fail(e);
  }
}

export async function updateIntegrations(eventId: string, values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const session = await assertPermission("integrations.write");
    const parsed = integrationsSchema.safeParse(values);
    if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
    const supabase = await createClient();
    const { error } = await supabase.from("event_integrations").upsert({ event_id: eventId, ...parsed.data });
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: "integrations.update", entity: "event_integrations", entityId: eventId, eventId, summary: "Atualizou rastreamento e notificações" });
    await revalidateEvent(eventId);
    return { ok: true, message: "Integrações salvas." };
  } catch (e) {
    return fail(e);
  }
}

export async function updateBranding(eventId: string, values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const session = await assertPermission("events.write");
    const parsed = brandingSchema.safeParse(values);
    if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
    const fonts = FONT_OPTIONS.map((f) => f.family);
    if (!fonts.includes(parsed.data.font_heading) || !fonts.includes(parsed.data.font_body)) return { ok: false, error: "Tipografia não disponível." };
    const supabase = await createClient();
    const { error } = await supabase.from("event_branding").upsert({ event_id: eventId, ...parsed.data });
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: "branding.update", entity: "event_branding", entityId: eventId, eventId, summary: "Atualizou a identidade visual" });
    await revalidateEvent(eventId);
    return { ok: true, message: "Identidade visual salva." };
  } catch (e) {
    return fail(e);
  }
}

export async function updateSection(eventId: string, values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const session = await assertPermission("events.write");
    const parsed = sectionSchema.safeParse(values);
    if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
    const { id, ...rest } = parsed.data;
    const supabase = await createClient();
    const { error } = await supabase
      .from("event_sections")
      .update({ ...rest, settings: sanitizeSettings(rest.settings) as NonNullable<Json> })
      .eq("id", id)
      .eq("event_id", eventId);
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: "section.update", entity: "event_section", entityId: id, eventId, summary: "Atualizou uma seção" });
    await revalidateEvent(eventId);
    return { ok: true, message: "Seção salva." };
  } catch (e) {
    return fail(e);
  }
}

/** Mantém apenas valores simples (string/number/boolean/arrays de objetos simples) e limita tamanhos. */
function sanitizeSettings(input: Record<string, unknown>, depth = 0): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input).slice(0, 40)) {
    if (!/^[a-z_]{1,40}$/.test(k)) continue;
    if (typeof v === "string") out[k] = v.slice(0, 2000);
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "boolean" || v === null) out[k] = v;
    else if (Array.isArray(v) && depth < 2) out[k] = v.slice(0, 30).map((x) => (x && typeof x === "object" ? sanitizeSettings(x as Record<string, unknown>, depth + 1) : x));
  }
  return out;
}

export async function toggleSection(eventId: string, sectionId: string, enabled: boolean): Promise<ActionResult> {
  try {
    const session = await assertPermission("events.write");
    const supabase = await createClient();
    const { error } = await supabase.from("event_sections").update({ enabled }).eq("id", sectionId).eq("event_id", eventId);
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: enabled ? "section.enable" : "section.disable", entity: "event_section", entityId: sectionId, eventId });
    await revalidateEvent(eventId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function reorderSections(eventId: string, ids: string[]): Promise<ActionResult> {
  try {
    await assertPermission("events.write");
    const parsed = z.array(z.uuid()).max(20).safeParse(ids);
    if (!parsed.success) return { ok: false, error: "Ordem inválida." };
    const supabase = await createClient();
    // Abertura sempre primeiro e rodapé sempre por último.
    const { data: rows } = await supabase.from("event_sections").select("id, type").eq("event_id", eventId);
    const byId = new Map((rows ?? []).map((r) => [r.id, r.type]));
    const middle = parsed.data.filter((id) => byId.has(id) && !["hero", "footer"].includes(byId.get(id)!));
    const hero = rows?.find((r) => r.type === "hero");
    const footer = rows?.find((r) => r.type === "footer");
    const order = [hero?.id, ...middle, footer?.id].filter(Boolean) as string[];
    await Promise.all(order.map((id, position) => supabase.from("event_sections").update({ position }).eq("id", id).eq("event_id", eventId)));
    await revalidateEvent(eventId);
    return { ok: true, message: "Ordem atualizada." };
  } catch (e) {
    return fail(e);
  }
}

export async function setEventStatus(eventId: string, status: "draft" | "published" | "archived"): Promise<ActionResult> {
  try {
    const session = await assertPermission(status === "published" ? "events.publish" : "events.write");
    const supabase = await createClient();
    const { data: ev, error } = await supabase.from("events").update({ status, updated_by: session.userId }).eq("id", eventId).select("name, slug").single();
    if (error) throw new Error(error.message);
    const label = { draft: "Despublicou", published: "Publicou", archived: "Arquivou" }[status];
    await audit({ actorId: session.userId, action: `event.${status}`, entity: "event", entityId: eventId, eventId, summary: `${label} o evento ${ev.name}` });
    await revalidateEvent(eventId);
    revalidatePath("/admin", "layout");
    return { ok: true, message: status === "published" ? `Publicado em /eventos/${ev.slug}` : `${label} com sucesso.` };
  } catch (e) {
    return fail(e);
  }
}

export async function duplicateEvent(sourceId: string, values: { name: string; slug?: string; copyTiers: boolean; copyMedia: boolean }): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await assertPermission("events.write");
    const name = String(values.name ?? "").trim();
    if (name.length < 2) return { ok: false, error: "Informe o nome do novo evento." };
    const slug = values.slug ? slugify(values.slug) : await uniqueSlug(name);
    if (!slugSchema.safeParse(slug).success) return { ok: false, error: "Endereço inválido." };
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("duplicate_event", {
      p_source: sourceId,
      p_name: name,
      p_slug: slug,
      p_copy_tiers: values.copyTiers,
      p_copy_media: values.copyMedia,
    });
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: "event.duplicate", entity: "event", entityId: data, eventId: data, summary: `Duplicou um evento como ${name}`, meta: { source: sourceId } });
    revalidatePath("/admin", "layout");
    return { ok: true, data: { id: data }, message: "Evento duplicado como rascunho." };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteEvent(eventId: string, confirmName: string): Promise<ActionResult> {
  try {
    const session = await assertPermission("events.delete");
    const supabase = await createClient();
    const { data: ev } = await supabase.from("events").select("name, slug").eq("id", eventId).single();
    if (!ev) return { ok: false, error: "Evento não encontrado." };
    if (confirmName.trim() !== ev.name) return { ok: false, error: "Digite o nome exato do evento para confirmar." };
    // Remove arquivos do storage que só este evento usa.
    const { data: files } = await supabase.from("event_media").select("storage_path").eq("event_id", eventId).not("storage_path", "is", null);
    const paths = (files ?? []).map((f) => f.storage_path!).filter(Boolean);
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) throw new Error(error.message);
    if (paths.length) {
      const { data: stillUsed } = await supabase.from("event_media").select("storage_path").in("storage_path", paths);
      const used = new Set((stillUsed ?? []).map((r) => r.storage_path));
      const orphan = paths.filter((p) => !used.has(p));
      if (orphan.length) await supabase.storage.from("media").remove(orphan);
    }
    await audit({ actorId: session.userId, action: "event.delete", entity: "event", entityId: eventId, summary: `Excluiu o evento ${ev.name}` });
    revalidatePath(`/eventos/${ev.slug}`);
    revalidatePath("/");
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Evento excluído." };
  } catch (e) {
    return fail(e);
  }
}
