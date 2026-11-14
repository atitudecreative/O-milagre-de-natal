import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { ROLE_LABEL } from "@/lib/labels";

export const metadata: Metadata = { title: { default: "Painel — Palco", template: "%s — Palco" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireStaff();
  let newLeads = 0;
  if (session.can("leads.read")) {
    const supabase = await createClient();
    const { count } = await supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new");
    newLeads = count ?? 0;
  }
  const items = [
    { href: "/admin", label: "Visão geral", exact: true },
    { href: "/admin/eventos", label: "Eventos" },
    ...(session.can("leads.read") ? [{ href: "/admin/leads", label: "Leads", badge: newLeads }] : []),
    { href: "/admin/marcas", label: "Marcas" },
    ...(session.can("users.manage") ? [{ href: "/admin/equipe", label: "Equipe" }] : []),
    ...(session.can("audit.read") ? [{ href: "/admin/atividade", label: "Atividade" }] : []),
  ];
  return (
    <AdminShell
      items={items}
      user={{ name: session.profile.full_name, email: session.email, role: session.role ? ROLE_LABEL[session.role] : "" }}
      canSeeLeads={session.can("leads.read")}
      newLeads={newLeads}
    >
      {children}
    </AdminShell>
  );
}
