import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/AuthShell";
import { ResetRequestForm } from "@/components/admin/AuthForms";

export const metadata: Metadata = { title: "Recuperar senha — Palco", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Recuperar senha" subtitle="Enviaremos um link seguro para o seu e-mail.">
      <ResetRequestForm />
    </AuthShell>
  );
}
