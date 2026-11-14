"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { audit, fail, type ActionResult } from "@/lib/server/audit";

const statusSchema = z.enum(["new", "contacted", "negotiating", "proposal_sent", "won", "lost"]);

export async function updateLeadStatus(leadId: string, status: string): Promise<ActionResult> {
  try {
    const session = await assertPermission("leads.write");
    const s = statusSchema.parse(status);
    const supabase = await createClient();
    const { data, error } = await supabase.from("leads").update({ status: s, seen_at: new Date().toISOString() }).eq("id", leadId).select("event_id, company").single();
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: "lead.status", entity: "lead", entityId: leadId, eventId: data.event_id, summary: `Alterou status de ${data.company} para ${s}` });
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Status atualizado." };
  } catch (e) {
    return fail(e);
  }
}

export async function updateLeadDetails(leadId: string, values: { assigned_to?: string | null; estimated_value?: string | number | null }): Promise<ActionResult> {
  try {
    const session = await assertPermission("leads.write");
    const parsed = z
      .object({
        assigned_to: z.union([z.uuid(), z.literal(""), z.null()]).transform((v) => v || null),
        estimated_value: z.union([z.literal(""), z.null(), z.coerce.number().min(0)]).transform((v) => (v === "" || v == null ? null : Number(v))),
      })
      .safeParse(values);
    if (!parsed.success) return { ok: false, error: "Valores inválidos." };
    const supabase = await createClient();
    const { error } = await supabase.from("leads").update(parsed.data).eq("id", leadId);
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: "lead.update", entity: "lead", entityId: leadId, summary: "Atualizou responsável/valor do lead" });
    revalidatePath(`/admin/leads/${leadId}`);
    return { ok: true, message: "Lead atualizado." };
  } catch (e) {
    return fail(e);
  }
}

export async function addLeadInteraction(leadId: string, values: { kind: string; body: string }): Promise<ActionResult> {
  try {
    const session = await assertPermission("leads.write");
    const parsed = z
      .object({ kind: z.enum(["note", "call", "email", "meeting", "whatsapp", "proposal"]), body: z.string().trim().min(2, "Escreva o registro.").max(4000) })
      .safeParse(values);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Registro inválido." };
    const supabase = await createClient();
    const { error } = await supabase.from("lead_interactions").insert({ lead_id: leadId, author_id: session.userId, ...parsed.data });
    if (error) throw new Error(error.message);
    await supabase.from("leads").update({ seen_at: new Date().toISOString() }).eq("id", leadId).is("seen_at", null);
    revalidatePath(`/admin/leads/${leadId}`);
    return { ok: true, message: "Registro adicionado ao histórico." };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteLeadInteraction(leadId: string, interactionId: string): Promise<ActionResult> {
  try {
    await assertPermission("leads.write");
    const supabase = await createClient();
    const { error } = await supabase.from("lead_interactions").delete().eq("id", interactionId).eq("lead_id", leadId);
    if (error) throw new Error(error.message);
    revalidatePath(`/admin/leads/${leadId}`);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function markLeadSeen(leadId: string) {
  try {
    await assertPermission("leads.read");
    const supabase = await createClient();
    await supabase.from("leads").update({ seen_at: new Date().toISOString() }).eq("id", leadId).is("seen_at", null);
  } catch {
    /* sem permissão de escrita: apenas não marca */
  }
}

/** Exclusão definitiva (direito de eliminação — LGPD). Apenas administradores. */
export async function deleteLead(leadId: string): Promise<ActionResult> {
  try {
    const session = await assertPermission("users.manage");
    const supabase = await createClient();
    const { data, error } = await supabase.from("leads").delete().eq("id", leadId).select("event_id").single();
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: "lead.delete", entity: "lead", entityId: leadId, eventId: data.event_id, summary: "Excluiu um lead (solicitação de eliminação de dados)" });
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Lead excluído definitivamente." };
  } catch (e) {
    return fail(e);
  }
}
