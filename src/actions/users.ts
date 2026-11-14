"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { assertPermission } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { audit, fail, type ActionResult } from "@/lib/server/audit";
import { siteUrl } from "@/lib/env";

const roleSchema = z.enum(["admin", "editor", "commercial"]);

/** Convida um membro da equipe por e-mail (ele define a própria senha pelo link). */
export async function inviteUser(values: { email: string; full_name: string; role: string }): Promise<ActionResult> {
  try {
    const session = await assertPermission("users.manage");
    const parsed = z.object({ email: z.email("E-mail inválido."), full_name: z.string().trim().min(2, "Informe o nome.").max(120), role: roleSchema }).safeParse(values);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
    const admin = createAdminClient();
    const origin = (await headers()).get("origin") ?? siteUrl();
    const { data, error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email.toLowerCase(), {
      data: { full_name: parsed.data.full_name },
      redirectTo: `${origin}/auth/confirm?next=/redefinir-senha`,
    });
    if (error) throw new Error(/already been registered/i.test(error.message) ? "Esse e-mail já tem conta." : error.message);
    await admin.from("profiles").upsert({ id: data.user.id, full_name: parsed.data.full_name, email: parsed.data.email.toLowerCase(), role: parsed.data.role, active: true });
    await audit({ actorId: session.userId, action: "user.invite", entity: "profile", entityId: data.user.id, summary: `Convidou ${parsed.data.email} como ${parsed.data.role}` });
    revalidatePath("/admin/equipe");
    return { ok: true, message: "Convite enviado por e-mail." };
  } catch (e) {
    return fail(e);
  }
}

export async function updateUserAccess(userId: string, values: { role: string | null; active: boolean }): Promise<ActionResult> {
  try {
    const session = await assertPermission("users.manage");
    if (userId === session.userId && (values.role !== "admin" || !values.active)) return { ok: false, error: "Você não pode remover o seu próprio acesso de administrador." };
    const role = values.role ? roleSchema.parse(values.role) : null;
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update({ role, active: values.active }).eq("id", userId);
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: "user.access", entity: "profile", entityId: userId, summary: `Definiu perfil ${role ?? "sem acesso"} (${values.active ? "ativo" : "inativo"})` });
    revalidatePath("/admin/equipe");
    return { ok: true, message: "Acesso atualizado." };
  } catch (e) {
    return fail(e);
  }
}

export async function updateOwnProfile(values: { full_name: string }): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return { ok: false, error: "Sessão expirada." };
    const name = z.string().trim().min(2).max(120).safeParse(values.full_name);
    if (!name.success) return { ok: false, error: "Nome inválido." };
    const { error } = await supabase.from("profiles").update({ full_name: name.data }).eq("id", data.user.id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Perfil atualizado." };
  } catch (e) {
    return fail(e);
  }
}
