"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addLeadInteraction, deleteLead, deleteLeadInteraction, updateLeadDetails, updateLeadStatus } from "@/actions/leads";
import type { InteractionRow, LeadStatus } from "@/lib/types";
import { INTERACTION_LABEL, LEAD_STATUS_LABEL, LEAD_STATUS_ORDER } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";
import { Button, Panel, cx } from "./ui";
import { Field, Input, Select, Textarea } from "./ui/fields";
import { ConfirmDialog } from "./ui/confirm";
import { useToast } from "./ui/toast";

export function StatusPicker({ leadId, status, canWrite }: { leadId: string; status: LeadStatus; canWrite: boolean }) {
  const [current, setCurrent] = useState(status);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <div role="radiogroup" aria-label="Status do lead" className="flex flex-wrap gap-1.5">
      {LEAD_STATUS_ORDER.map((s) => (
        <button key={s} type="button" role="radio" aria-checked={current === s} disabled={!canWrite || pending}
          onClick={() => { const prev = current; setCurrent(s); start(async () => { const r = await updateLeadStatus(leadId, s); if (!r.ok) { setCurrent(prev); toast(r.error, "bad"); } else { toast(r.message ?? "Status atualizado."); router.refresh(); } }); }}
          className={cx("rounded-full px-3 py-1.5 text-xs transition", current === s ? (s === "won" ? "bg-ok text-white" : s === "lost" ? "bg-mute text-white" : "bg-ink text-card") : "ring-1 ring-line hover:bg-paper-2 disabled:hover:bg-transparent")}>
          {LEAD_STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  );
}

export function LeadManage({ leadId, assignedTo, estimatedValue, team, canWrite, canDelete }: { leadId: string; assignedTo: string | null; estimatedValue: number | null; team: { id: string; full_name: string }[]; canWrite: boolean; canDelete: boolean }) {
  const [assigned, setAssigned] = useState(assignedTo ?? "");
  const [value, setValue] = useState(estimatedValue?.toString() ?? "");
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <Panel title="Gestão">
      <div className="space-y-4">
        <Field label="Responsável">
          <Select value={assigned} onChange={(e) => setAssigned(e.target.value)} disabled={!canWrite}>
            <option value="">Ninguém</option>
            {team.map((t) => <option key={t.id} value={t.id}>{t.full_name || "Sem nome"}</option>)}
          </Select>
        </Field>
        <Field label="Valor estimado do negócio (R$)">
          <Input type="number" min={0} step="1000" value={value} onChange={(e) => setValue(e.target.value)} disabled={!canWrite} />
        </Field>
        {canWrite ? <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => start(async () => { const r = await updateLeadDetails(leadId, { assigned_to: assigned, estimated_value: value }); toast(r.ok ? r.message ?? "Salvo." : r.error, r.ok ? "ok" : "bad"); })}>Salvar</Button> : null}
        {canDelete ? (
          <div className="border-t border-line pt-4">
            <button type="button" className="text-xs text-bad hover:underline" onClick={() => setConfirm(true)}>Excluir dados deste contato (LGPD)</button>
          </div>
        ) : null}
      </div>
      <ConfirmDialog open={confirm} tone="danger" title="Excluir definitivamente?" confirmLabel="Excluir dados" busy={pending} onClose={() => setConfirm(false)}
        description="Use para atender pedidos de eliminação de dados pessoais. O lead e todo o histórico serão apagados de forma irreversível."
        onConfirm={() => start(async () => { const r = await deleteLead(leadId); if (r.ok) { toast(r.message ?? "Excluído."); router.push("/admin/leads"); } else toast(r.error, "bad"); })} />
    </Panel>
  );
}

export function Timeline({ leadId, items, authors, currentUser, canWrite }: { leadId: string; items: InteractionRow[]; authors: Record<string, string>; currentUser: string; canWrite: boolean }) {
  const [kind, setKind] = useState("note");
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <Panel title="Histórico de contato" description="Registre ligações, reuniões, e-mails e propostas. Mudanças de status entram automaticamente.">
      {canWrite ? (
        <div className="mb-6 rounded-lg bg-paper p-3 ring-1 ring-line">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {(["note", "call", "email", "whatsapp", "meeting", "proposal"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k} className={cx("rounded-full px-2.5 py-1 text-xs", kind === k ? "bg-ink text-card" : "ring-1 ring-line hover:bg-card")}>{INTERACTION_LABEL[k]}</button>
            ))}
          </div>
          <Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="O que foi conversado? Próximos passos?" aria-label="Registro" />
          <div className="mt-2 flex justify-end">
            <Button type="button" size="sm" disabled={pending || body.trim().length < 2}
              onClick={() => start(async () => { const r = await addLeadInteraction(leadId, { kind, body }); if (r.ok) { setBody(""); toast(r.message ?? "Registrado."); router.refresh(); } else toast(r.error, "bad"); })}>
              {pending ? "Salvando…" : "Registrar"}
            </Button>
          </div>
        </div>
      ) : null}
      {items.length ? (
        <ol className="relative space-y-5 border-l border-line pl-5">
          {items.map((i) => (
            <li key={i.id} className="relative">
              <span className={cx("absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-card", i.kind === "status_change" ? "bg-faint" : "bg-ink")} />
              <p className="text-xs text-mute">
                <span className="font-medium text-ink">{INTERACTION_LABEL[i.kind]}</span> · {authors[i.author_id ?? ""] ?? "Sistema"} · {formatDateTime(i.created_at)}
              </p>
              {i.kind === "status_change" ? (
                <p className="mt-1 text-sm">{i.from_status ? LEAD_STATUS_LABEL[i.from_status] : "—"} → <strong className="font-medium">{i.to_status ? LEAD_STATUS_LABEL[i.to_status] : "—"}</strong></p>
              ) : (
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{i.body}</p>
              )}
              {i.author_id === currentUser && i.kind !== "status_change" ? (
                <button type="button" className="mt-1 text-[11px] text-mute hover:text-bad" onClick={() => start(async () => { await deleteLeadInteraction(leadId, i.id); router.refresh(); })}>Remover</button>
              ) : null}
            </li>
          ))}
        </ol>
      ) : <p className="text-sm text-mute">Nenhum registro ainda.</p>}
    </Panel>
  );
}
