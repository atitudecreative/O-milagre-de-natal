import Link from "next/link";
import type { EventBundle, HeroSettings } from "@/lib/types";
import { Panel, cx } from "../ui";

export type Check = { ok: boolean; label: string; hint?: string; tab: string; level: "required" | "recommended" };

export function reviewChecks(b: EventBundle): Check[] {
  const hero = b.sections.find((s) => s.type === "hero");
  const hs = (hero?.settings ?? {}) as HeroSettings;
  const actual = b.metrics.filter((m) => m.kind === "actual");
  const imgs = b.media.filter((m) => m.kind === "image");
  return [
    { ok: Boolean(b.event.name && b.event.short_description), label: "Nome e descrição curta", tab: "geral", level: "required" },
    { ok: Boolean(b.event.starts_on || b.event.date_label), label: "Data do evento", tab: "geral", level: "required" },
    { ok: Boolean(b.event.city || b.event.venue), label: "Local", tab: "geral", level: "required" },
    { ok: Boolean(hs.image_desktop || hs.video_url), label: "Imagem ou vídeo da abertura", tab: "abertura", level: "required" },
    { ok: Boolean(b.event.contact_email || b.event.whatsapp), label: "Contato comercial (e-mail ou WhatsApp)", tab: "contatos", level: "required" },
    { ok: Boolean(b.event.organizer_name), label: "Organizador (para a política de privacidade)", tab: "contatos", level: "required" },
    { ok: b.tiers.some((t) => t.enabled) || b.opportunities.some((o) => o.enabled), label: "Ao menos uma cota ou oportunidade", tab: "cotas", level: "required" },
    { ok: Boolean(b.branding.logo_url), label: "Logotipo", tab: "identidade", level: "recommended" },
    { ok: actual.length >= 3, label: "Pelo menos 3 indicadores", tab: "indicadores", level: "recommended" },
    { ok: actual.every((m) => m.source), label: "Todos os indicadores com fonte", hint: actual.filter((m) => !m.source).map((m) => m.label).join(", "), tab: "indicadores", level: "recommended" },
    { ok: b.media.filter((m) => m.in_gallery).length >= 4, label: "Galeria com 4+ fotos", tab: "galeria", level: "recommended" },
    { ok: imgs.every((m) => m.alt), label: "Texto alternativo em todas as imagens", hint: `${imgs.filter((m) => !m.alt).length} sem descrição`, tab: "midia", level: "recommended" },
    { ok: Boolean(hs.image_mobile), label: "Imagem específica para celular", tab: "abertura", level: "recommended" },
    { ok: Boolean(b.event.seo_description || b.event.short_description), label: "Descrição para buscadores", tab: "seo", level: "recommended" },
    { ok: Boolean(b.event.privacy_contact_email), label: "E-mail do encarregado de dados (LGPD)", tab: "contatos", level: "recommended" },
  ];
}

export function ReviewList({ eventId, checks }: { eventId: string; checks: Check[] }) {
  const groups = [
    { key: "required", title: "Essencial" },
    { key: "recommended", title: "Recomendado" },
  ] as const;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {groups.map((g) => {
        const list = checks.filter((c) => c.level === g.key);
        const done = list.filter((c) => c.ok).length;
        return (
          <Panel key={g.key} title={g.title} description={`${done} de ${list.length} concluídos`} padded={false}>
            <ul>
              {list.map((c) => (
                <li key={c.label} className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0">
                  <span aria-hidden className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px]", c.ok ? "bg-ok text-white" : g.key === "required" ? "bg-[#f5e0dd] text-bad" : "bg-paper-2 text-mute")}>{c.ok ? "✓" : "!"}</span>
                  <span className="min-w-0 flex-1 text-sm">
                    {c.label}
                    {!c.ok && c.hint ? <span className="block truncate text-xs text-mute">{c.hint}</span> : null}
                  </span>
                  {!c.ok ? <Link href={`/admin/eventos/${eventId}/${c.tab}`} className="shrink-0 text-xs text-mute hover:text-ink">Resolver →</Link> : <span className="sr-only">concluído</span>}
                </li>
              ))}
            </ul>
          </Panel>
        );
      })}
    </div>
  );
}
