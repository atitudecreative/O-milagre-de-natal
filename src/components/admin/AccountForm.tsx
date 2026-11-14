"use client";
import { useActionState, useState, useTransition } from "react";
import { updatePassword } from "@/actions/auth";
import { updateOwnProfile } from "@/actions/users";
import { Button, Panel } from "./ui";
import { Field, Input } from "./ui/fields";
import { useToast } from "./ui/toast";

export function AccountForm({ name, email, role }: { name: string; email: string; role: string }) {
  const [fullName, setFullName] = useState(name);
  const [pending, start] = useTransition();
  const [pw, pwAction, pwPending] = useActionState(updatePassword, undefined);
  const toast = useToast();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Perfil" description={`${email} · ${role}`}>
        <Field label="Nome"><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
        <Button type="button" className="mt-4" size="sm" disabled={pending} onClick={() => start(async () => { const r = await updateOwnProfile({ full_name: fullName }); toast(r.ok ? r.message ?? "Salvo." : r.error, r.ok ? "ok" : "bad"); })}>Salvar</Button>
      </Panel>
      <Panel title="Alterar senha">
        <form action={pwAction} className="space-y-4">
          <Field label="Nova senha" hint="Mínimo 8 caracteres, com letras e números."><Input name="password" type="password" autoComplete="new-password" /></Field>
          <Field label="Confirmar"><Input name="confirm" type="password" autoComplete="new-password" /></Field>
          {pw?.error ? <p className="text-sm text-bad">{pw.error}</p> : pw?.ok ? <p className="text-sm text-ok">Senha atualizada.</p> : null}
          <Button type="submit" size="sm" disabled={pwPending}>Atualizar senha</Button>
        </form>
      </Panel>
    </div>
  );
}
