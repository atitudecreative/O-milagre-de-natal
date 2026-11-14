"use server";
import { revalidatePath } from "next/cache";
import { assertPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { audit, fail, zodFieldErrors, type ActionResult } from "@/lib/server/audit";
import { sponsorSchema } from "@/lib/validation/content";
import type { SponsorRow } from "@/lib/types";

export async function saveSponsor(id: string | null, values: Record<string, unknown>): Promise<ActionResult<SponsorRow>> {
  try {
    const session = await assertPermission("sponsors.write");
    const parsed = sponsorSchema.safeParse(values);
    if (!parsed.success) return { ok: false, error: "Revise os campos.", fieldErrors: zodFieldErrors(parsed.error.issues) };
    const supabase = await createClient();
    const q = id ? supabase.from("sponsors").update(parsed.data).eq("id", id) : supabase.from("sponsors").insert(parsed.data);
    const { data, error } = await q.select("*").single();
    if (error) throw new Error(/duplicate/.test(error.message) ? "Já existe uma marca com esse nome." : error.message);
    await audit({ actorId: session.userId, action: id ? "sponsor.update" : "sponsor.create", entity: "sponsor", entityId: data.id, summary: `${id ? "Editou" : "Cadastrou"} a marca ${data.name}` });
    revalidatePath("/admin/marcas");
    return { ok: true, data, message: "Marca salva." };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteSponsor(id: string): Promise<ActionResult> {
  try {
    const session = await assertPermission("sponsors.write");
    const supabase = await createClient();
    const { count } = await supabase.from("event_sponsors").select("id", { count: "exact", head: true }).eq("sponsor_id", id);
    if (count) return { ok: false, error: `Essa marca está vinculada a ${count} evento(s). Remova os vínculos primeiro.` };
    const { error } = await supabase.from("sponsors").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: "sponsor.delete", entity: "sponsor", entityId: id, summary: "Excluiu uma marca" });
    revalidatePath("/admin/marcas");
    return { ok: true, message: "Marca excluída." };
  } catch (e) {
    return fail(e);
  }
}
