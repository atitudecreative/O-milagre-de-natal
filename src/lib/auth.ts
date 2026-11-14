import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, ProfileRow } from "@/lib/types";

export type Permission =
  | "events.read" | "events.write" | "events.publish" | "events.delete"
  | "media.write" | "sponsors.write" | "tiers.sales"
  | "leads.read" | "leads.write" | "leads.export"
  | "analytics.read" | "users.manage" | "audit.read" | "integrations.write";

export type Session = {
  userId: string;
  email: string;
  profile: ProfileRow;
  role: AppRole | null;
  permissions: Set<Permission>;
  can: (p: Permission) => boolean;
};

/** Sessão do usuário atual (deduplicada por requisição). */
export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();
  if (!profile) return null;

  let permissions = new Set<Permission>();
  if (profile.role && profile.active) {
    const { data: perms } = await supabase.from("role_permissions").select("permission").eq("role", profile.role);
    permissions = new Set((perms ?? []).map((p) => p.permission as Permission));
  }

  return {
    userId: auth.user.id,
    email: auth.user.email ?? "",
    profile,
    role: profile.active ? profile.role : null,
    permissions,
    can: (p) => permissions.has(p),
  };
});

/** Para páginas do painel: exige login e um papel ativo. */
export async function requireStaff(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.role) redirect("/sem-acesso");
  return session;
}

/** Para páginas: exige uma permissão específica. */
export async function requirePermission(p: Permission): Promise<Session> {
  const session = await requireStaff();
  if (!session.can(p)) redirect("/admin?negado=1");
  return session;
}

export class AuthError extends Error {}

/** Para server actions / route handlers. */
export async function assertPermission(p: Permission): Promise<Session> {
  const session = await getSession();
  if (!session?.role) throw new AuthError("Sessão expirada. Entre novamente.");
  if (!session.can(p)) throw new AuthError("Seu perfil não tem permissão para esta ação.");
  return session;
}
