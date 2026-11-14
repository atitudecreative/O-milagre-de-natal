import { AuthShell } from "@/components/admin/AuthShell";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/admin/ui";

export default function Page() {
  return (
    <AuthShell title="Acesso pendente" subtitle="Sua conta existe, mas ainda não tem um perfil de acesso.">
      <p className="text-sm leading-relaxed text-mute">Peça a um administrador para definir seu perfil (Administrador, Editor ou Comercial) em <strong>Equipe</strong>.</p>
      <form action={signOut} className="mt-8"><Button variant="secondary" type="submit">Sair</Button></form>
    </AuthShell>
  );
}
