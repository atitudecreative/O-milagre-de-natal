"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { reorderSections, toggleSection } from "@/actions/events";
import type { SectionRow, SectionType } from "@/lib/types";
import { SECTION_LABEL } from "@/lib/labels";
import { Panel, cx } from "../ui";
import { useToast } from "../ui/toast";

const EDIT_TAB: Partial<Record<SectionType, string>> = {
  hero: "abertura", metrics: "indicadores", grandeur: "galeria", audience: "publico", results: "resultados",
  opportunities: "oportunidades", tiers: "cotas", sponsors: "patrocinadores", next_edition: "proxima-edicao", cta: "contatos", footer: "contatos",
};

export function SectionsManager({ eventId, sections, counts, canWrite }: { eventId: string; sections: SectionRow[]; counts: Partial<Record<SectionType, number>>; canWrite: boolean }) {
  const [list, setList] = useState(() => [...sections].sort((a, b) => a.position - b.position));
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (["hero", "footer"].includes(list[i].type) || ["hero", "footer"].includes(list[j]?.type ?? "hero")) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
    start(async () => {
      const r = await reorderSections(eventId, next.map((s) => s.id));
      if (!r.ok) toast(r.error, "bad");
      router.refresh();
    });
  }
  function toggle(s: SectionRow) {
    setList((l) => l.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)));
    start(async () => {
      const r = await toggleSection(eventId, s.id, !s.enabled);
      if (!r.ok) toast(r.error, "bad");
      else toast(!s.enabled ? "Seção ativada." : "Seção ocultada.");
      router.refresh();
    });
  }

  return (
    <Panel title="Seções da página" description="Ative, desative e reordene. A abertura é sempre a primeira e o rodapé o último. Seções sem conteúdo ficam ocultas automaticamente." padded={false}>
      <ol>
        {list.map((s, i) => {
          const fixed = s.type === "hero" || s.type === "footer";
          const count = counts[s.type];
          return (
            <li key={s.id} className={cx("flex items-center gap-3 border-b border-line px-4 py-3 last:border-0", !s.enabled && "opacity-60")}>
              <span className="w-6 text-right text-xs tabular-nums text-faint">{String(i + 1).padStart(2, "0")}</span>
              {canWrite ? (
                <div className="flex flex-col">
                  <button type="button" aria-label={`Mover ${SECTION_LABEL[s.type]} para cima`} disabled={fixed || i <= 1 || pending} onClick={() => move(i, -1)} className="h-5 w-6 text-xs text-mute hover:text-ink disabled:opacity-20">▲</button>
                  <button type="button" aria-label={`Mover ${SECTION_LABEL[s.type]} para baixo`} disabled={fixed || i >= list.length - 2 || pending} onClick={() => move(i, 1)} className="h-5 w-6 text-xs text-mute hover:text-ink disabled:opacity-20">▼</button>
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{SECTION_LABEL[s.type]}</p>
                <p className="truncate text-xs text-mute">{s.title || "Sem título"}{count === 0 ? " · sem conteúdo (oculta na página)" : count ? ` · ${count} itens` : ""}</p>
              </div>
              {EDIT_TAB[s.type] ? <Link href={`/admin/eventos/${eventId}/${EDIT_TAB[s.type]}`} className="text-xs text-mute hover:text-ink">Editar</Link> : null}
              {!fixed || s.type === "footer" ? (
                <button type="button" role="switch" aria-checked={s.enabled} aria-label={`Exibir ${SECTION_LABEL[s.type]}`} disabled={!canWrite || pending || s.type === "hero"} onClick={() => toggle(s)}
                  className={cx("relative h-5 w-9 shrink-0 rounded-full transition-colors", s.enabled ? "bg-ink" : "bg-line-strong")}>
                  <span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", s.enabled ? "left-4.5" : "left-0.5")} />
                </button>
              ) : <span className="w-9" />}
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
