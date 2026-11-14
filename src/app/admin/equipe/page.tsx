import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { TeamManager } from "@/components/admin/TeamManager";

export const metadata: Metadata = { title: "Equipe" };

export default async function Page() {
  const session = await requirePermission("users.manage");
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, full_name, email, role, active, created_at").order("created_at");
  return (
    <>
      <PageHeader title="Equipe" description="Perfis de acesso: Administrador, Editor e Comercial. As permissões ficam no banco (tabela role_permissions), prontas para perfis personalizados." />
      <TeamManager members={(data ?? []).map((m) => ({ ...m, email: m.email as string | null }))} currentUser={session.userId} />
    </>
  );
}
