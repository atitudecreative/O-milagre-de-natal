"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { inviteUser, updateUserAccess } from "@/actions/users";
import type { AppRole } from "@/lib/types";
import { ROLE_LABEL } from "@/lib/labels";
import { Badge, Button, Panel } from "./ui";
import { Field, Input, Select } from "./ui/fields";
import { useToast } from "./ui/toast";

type Member = { id: string; full_name: string; email: string | null; role: AppRole | null; active: boolean; created_at: string };

const ROLE_HINT: Record<AppRole, string> = {
  admin: "Acesso completo, inclusive equipe, exclusões e auditoria.",
  editor: "Cria e edita eventos, conteúdo, mídias e publica.",
  commercial: "Consulta leads, atualiza negociações e vendas das cotas.",
};

export function TeamManager({ members, currentUser }: { members: Member[]; currentUser: string }) {
  const [invite, setInvite] = useState({ email: "", full_name: "", role: "editor" });
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Panel title="Convidar pessoa" description="A pessoa recebe um e-mail para definir a própria senha.">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_200px_auto] md:items-end">
          <Field label="Nome"><Input value={invite.full_name} onChange={(e) => setInvite({ ...invite, full_name: e.target.value })} /></Field>
          <Field label="E-mail"><Input type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} /></Field>
          <Field label="Perfil">
            <Select value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
              {(Object.keys(ROLE_LABEL) as AppRole[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </Select>
          </Field>
          <Button type="button" disabled={pending || !invite.email} onClick={() => start(async () => {
            const r = await inviteUser(invite);
            if (r.ok) { toast(r.message ?? "Convite enviado."); setInvite({ email: "", full_name: "", role: "editor" }); router.refresh(); } else toast(r.error, "bad");
          })}>Convidar</Button>
        </div>
        <ul className="mt-5 grid gap-2 text-xs text-mute md:grid-cols-3">
          {(Object.keys(ROLE_HINT) as AppRole[]).map((r) => <li key={r}><strong className="font-medium text-ink">{ROLE_LABEL[r]}:</strong> {ROLE_HINT[r]}</li>)}
        </ul>
      </Panel>
      <Panel title="Equipe" padded={false}>
        <ul className="divide-y divide-line">
          {members.map((m) => (
            <li key={m.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.full_name || "Sem nome"} {m.id === currentUser ? <span className="text-xs text-mute">(você)</span> : null}</p>
                <p className="truncate text-xs text-mute">{m.email}</p>
              </div>
              {!m.active ? <Badge tone="bad">Inativo</Badge> : !m.role ? <Badge tone="warn">Sem acesso</Badge> : null}
              <div className="flex gap-2">
                <Select aria-label={`Perfil de ${m.full_name}`} className="w-44" defaultValue={m.role ?? ""} disabled={pending || m.id === currentUser}
                  onChange={(e) => start(async () => { const r = await updateUserAccess(m.id, { role: e.target.value || null, active: m.active }); toast(r.ok ? r.message ?? "Atualizado." : r.error, r.ok ? "ok" : "bad"); router.refresh(); })}>
                  <option value="">Sem acesso</option>
                  {(Object.keys(ROLE_LABEL) as AppRole[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </Select>
                <Button type="button" variant="secondary" size="md" disabled={pending || m.id === currentUser}
                  onClick={() => start(async () => { const r = await updateUserAccess(m.id, { role: m.role, active: !m.active }); toast(r.ok ? r.message ?? "Atualizado." : r.error, r.ok ? "ok" : "bad"); router.refresh(); })}>
                  {m.active ? "Desativar" : "Reativar"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
