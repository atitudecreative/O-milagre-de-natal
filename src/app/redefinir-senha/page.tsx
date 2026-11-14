import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/AuthShell";
import { NewPasswordForm } from "@/components/admin/AuthForms";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nova senha — Palco", robots: { index: false } };

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?erro=link");
  return (
    <AuthShell title="Nova senha" subtitle={data.user.email ?? undefined}>
      <NewPasswordForm />
    </AuthShell>
  );
}
