"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteEvent, duplicateEvent, setEventStatus } from "@/actions/events";
import type { EventStatus } from "@/lib/types";
import { ConfirmDialog } from "./ui/confirm";
import { Field, Input, Toggle } from "./ui/fields";
import { useToast } from "./ui/toast";
import { cx } from "./ui";

type Props = {
  event: { id: string; name: string; slug: string; status: EventStatus };
  can: { write: boolean; publish: boolean; remove: boolean };
  compact?: boolean;
};

export function EventActions({ event, can, compact }: Props) {
  const [menu, setMenu] = useState(false);
  const [dialog, setDialog] = useState<null | "publish" | "unpublish" | "archive" | "delete" | "duplicate">(null);
  const [pending, start] = useTransition();
  const [dupName, setDupName] = useState(`${event.name} (cópia)`);
  const [copyTiers, setCopyTiers] = useState(true);
  const [copyMedia, setCopyMedia] = useState(true);
  const [confirmName, setConfirmName] = useState("");
  const toast = useToast();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setMenu(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [menu]);

  function run(fn: () => Promise<{ ok: boolean; error?: string; message?: string }>, after?: () => void) {
    start(async () => {
      const r = await fn();
      if (r.ok) {
        toast(r.message ?? "Feito.");
        setDialog(null);
        after?.();
        router.refresh();
      } else toast(r.error ?? "Erro.", "bad");
    });
  }

  const item = "block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-paper-2";
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} aria-label={`Ações para ${event.name}`} className={cx("flex items-center justify-center rounded-lg text-ink-2 ring-1 ring-inset ring-line hover:bg-paper-2", compact ? "h-8 w-8" : "h-10 w-10")}>
        <span aria-hidden className="text-lg leading-none tracking-tighter">···</span>
      </button>
      {menu ? (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-56 rounded-xl bg-card p-1.5 shadow-xl ring-1 ring-line animate-[rise_0.25s_var(--ease-out-expo)_both]">
          <Link role="menuitem" href={`/admin/eventos/${event.id}/geral`} className={item}>Editar</Link>
          <a role="menuitem" href={event.status === "published" ? `/eventos/${event.slug}` : `/preview/${event.id}`} target="_blank" rel="noreferrer" className={item}>Visualizar ↗</a>
          {can.write ? <button role="menuitem" type="button" className={item} onClick={() => { setMenu(false); setDialog("duplicate"); }}>Duplicar</button> : null}
          {can.publish && event.status !== "published" ? <button role="menuitem" type="button" className={item} onClick={() => { setMenu(false); setDialog("publish"); }}>Publicar</button> : null}
          {can.write && event.status === "published" ? <button role="menuitem" type="button" className={item} onClick={() => { setMenu(false); setDialog("unpublish"); }}>Despublicar</button> : null}
          {can.write && event.status !== "archived" ? <button role="menuitem" type="button" className={item} onClick={() => { setMenu(false); setDialog("archive"); }}>Arquivar</button> : null}
          {can.write && event.status === "archived" ? <button role="menuitem" type="button" className={item} onClick={() => { setMenu(false); run(() => setEventStatus(event.id, "draft")); }}>Restaurar como rascunho</button> : null}
          {can.remove ? <button role="menuitem" type="button" className={cx(item, "text-bad")} onClick={() => { setMenu(false); setDialog("delete"); }}>Excluir…</button> : null}
        </div>
      ) : null}

      <ConfirmDialog open={dialog === "publish"} title="Publicar evento?" busy={pending} confirmLabel="Publicar agora" onClose={() => setDialog(null)} onConfirm={() => run(() => setEventStatus(event.id, "published"))}
        description={<>A página ficará pública em <strong>/eventos/{event.slug}</strong> e o formulário passará a receber leads.</>} />
      <ConfirmDialog open={dialog === "unpublish"} title="Despublicar evento?" busy={pending} confirmLabel="Despublicar" onClose={() => setDialog(null)} onConfirm={() => run(() => setEventStatus(event.id, "draft"))}
        description="A página sai do ar e o formulário para de receber contatos. Nada é apagado." />
      <ConfirmDialog open={dialog === "archive"} title="Arquivar evento?" busy={pending} confirmLabel="Arquivar" onClose={() => setDialog(null)} onConfirm={() => run(() => setEventStatus(event.id, "archived"))}
        description="O evento sai do ar e das métricas ativas. Leads e histórico continuam disponíveis." />
      <ConfirmDialog open={dialog === "duplicate"} title="Duplicar evento" busy={pending} confirmLabel="Criar cópia" onClose={() => setDialog(null)}
        onConfirm={() => run(() => duplicateEvent(event.id, { name: dupName, copyTiers, copyMedia }), undefined)}
        description="Cria um novo rascunho com estrutura, conteúdo e identidade. Leads, analytics, patrocinadores vinculados e vendas de cotas nunca são copiados.">
        <div className="space-y-4">
          <Field label="Nome do novo evento" htmlFor="dup-name"><Input id="dup-name" value={dupName} onChange={(e) => setDupName(e.target.value)} /></Field>
          <Toggle label="Copiar cotas" description="Estrutura e valores, com vendas zeradas." checked={copyTiers} onChange={setCopyTiers} />
          <Toggle label="Reutilizar mídias" description="Fotos e vídeos ficam disponíveis na biblioteca do novo evento." checked={copyMedia} onChange={setCopyMedia} />
        </div>
      </ConfirmDialog>
      <ConfirmDialog open={dialog === "delete"} title="Excluir definitivamente?" tone="danger" busy={pending || confirmName !== event.name} confirmLabel="Excluir evento" onClose={() => setDialog(null)}
        onConfirm={() => run(() => deleteEvent(event.id, confirmName), () => router.push("/admin/eventos"))}
        description={<>Isso apaga o evento, seu conteúdo, <strong>todos os leads</strong> e o histórico de acessos. Não pode ser desfeito. Prefira <em>arquivar</em> se tiver dúvida.</>}>
        <Field label={<>Digite <strong>{event.name}</strong> para confirmar</>} htmlFor="del-name"><Input id="del-name" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} autoComplete="off" /></Field>
      </ConfirmDialog>
    </div>
  );
}
