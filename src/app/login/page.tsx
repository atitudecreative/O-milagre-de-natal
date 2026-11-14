import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/AuthShell";
import { LoginForm } from "@/components/admin/AuthForms";

export const metadata: Metadata = { title: "Entrar — Palco", robots: { index: false } };

export default async function Page({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const error = sp.erro === "link" ? "O link expirou ou já foi usado. Solicite um novo." : null;
  return (
    <AuthShell title="Entrar" subtitle="Acesso exclusivo da equipe.">
      {error ? <p role="alert" className="mb-6 rounded-lg bg-[#f5e0dd] px-3 py-2.5 text-sm text-bad">{error}</p> : null}
      <LoginForm next={next} />
    </AuthShell>
  );
}
