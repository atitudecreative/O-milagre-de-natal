import type { EventBundle, SectionRow, TierRow, TiersSettings } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { EvImage } from "../EvImage";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../SectionHeader";
import { TrackedLink } from "../TrackedLink";
import { TiersViewTracker } from "./TiersViewTracker";

function Availability({ t }: { t: TierRow }) {
  if (t.quantity_total == null) return null;
  const left = Math.max(t.quantity_total - t.quantity_sold, 0);
  const soldOut = left === 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em]">
        <span>{soldOut ? "Esgotada" : left === 1 ? "Última cota disponível" : `${left} de ${t.quantity_total} disponíveis`}</span>
      </div>
      <div className="mt-2 flex gap-1" aria-hidden>
        {Array.from({ length: Math.min(t.quantity_total, 24) }).map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 ${i < t.quantity_sold ? "bg-current opacity-25" : "bg-current"}`} />
        ))}
      </div>
    </div>
  );
}

function Tier({ t, i }: { t: TierRow; i: number }) {
  const left = t.quantity_total == null ? null : Math.max(t.quantity_total - t.quantity_sold, 0);
  const soldOut = left === 0;
  const hl = t.highlight;
  return (
    <Reveal
      as="article"
      delay={i * 0.06}
      className={`group relative flex min-h-full flex-col rounded-[var(--ev-radius)] p-7 md:p-9 ${
        hl ? "ev-solid bg-[var(--ev-accent)] text-[var(--ev-on-accent)]" : "border border-[var(--ev-line-strong)]"
      } ${soldOut ? "opacity-60" : ""}`}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${hl ? "opacity-75" : "text-[var(--ev-muted)]"}`}>Cota {String(i + 1).padStart(2, "0")}</p>
          <h3 className="ev-display mt-3 text-[calc(clamp(2.4rem,4vw,3.6rem)*var(--ev-title-scale,1))] break-words">{t.name}</h3>
          {t.tagline ? <p className={`mt-3 text-sm ${hl ? "opacity-85" : "text-[var(--ev-muted)]"}`}>{t.tagline}</p> : null}
        </div>
        {t.image_url ? <EvImage src={t.image_url} alt="" width={64} height={64} className="h-14 w-14 object-contain" /> : null}
      </header>

      <div className={`my-8 border-y py-6 ${hl ? "border-current/25" : "border-[var(--ev-line)]"}`}>
        {t.show_price && t.price != null ? (
          <>
            <p className="text-xs uppercase tracking-[0.18em] opacity-70">Investimento</p>
            <p className="ev-num mt-2 text-[clamp(2.2rem,3.4vw,3rem)]">{formatCurrency(Number(t.price), t.currency)}</p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.18em] opacity-70">Investimento</p>
            <p className="mt-2 text-2xl font-semibold">Sob consulta</p>
          </>
        )}
      </div>

      {t.description ? <p className={`mb-6 text-sm leading-relaxed ${hl ? "opacity-90" : "text-[var(--ev-muted)]"}`}>{t.description}</p> : null}

      {t.deliverables.length ? (
        <div className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] opacity-75">Contrapartidas</p>
          <ul className="space-y-2.5 text-sm leading-snug">
            {t.deliverables.map((d) => (
              <li key={d} className="flex gap-3">
                <span aria-hidden className={`mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full ${hl ? "bg-current" : "bg-[var(--ev-accent)]"}`} />
                {d}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {t.benefits.length ? (
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] opacity-75">Benefícios</p>
          <ul className="flex flex-wrap gap-2">
            {t.benefits.map((b) => (
              <li key={b} className={`rounded-[var(--ev-radius)] px-2.5 py-1 text-xs ${hl ? "bg-black/10" : "bg-[var(--ev-surface-2)]"}`}>{b}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-auto space-y-6">
        <Availability t={t} />
        {soldOut ? (
          <p className="text-center text-sm font-semibold uppercase tracking-[0.14em]">Cota comercializada</p>
        ) : (
          <TrackedLink
            href="#interesse"
            event="cta_click"
            label={`cota:${t.name}`}
            tierId={t.id}
            className="ev-btn w-full"
            style={hl ? ({ "--btn-bg": "var(--ev-bg)", "--btn-fg": "var(--ev-fg)" } as React.CSSProperties) : undefined}
          >
            Tenho interesse <span className="ev-btn-arrow" aria-hidden>→</span>
          </TrackedLink>
        )}
      </div>
    </Reveal>
  );
}

export function Tiers({ bundle, section, index }: { bundle: EventBundle; section: SectionRow; index: number }) {
  const s = (section.settings ?? {}) as TiersSettings;
  const tiers = bundle.tiers.filter((t) => t.enabled);
  if (!tiers.length) return null;
  const cols = tiers.length >= 4 ? "lg:grid-cols-4" : tiers.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <section id="cotas" className="ev-section bg-[var(--ev-surface)]">
      <TiersViewTracker />
      <div className="ev-container">
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} body={section.body} align="split" className="mb-16 md:mb-24" />
        <div className={`-mx-[clamp(1.25rem,4vw,4rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1.25rem,4vw,4rem)] pb-4 ev-scroll-x md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 ${cols}`}>
          {tiers.map((t, i) => (
            <div key={t.id} className="w-[86vw] shrink-0 snap-center sm:w-[60vw] md:w-auto">
              <Tier t={t} i={i} />
            </div>
          ))}
        </div>
        {s.note ? <p className="ev-micro mt-8 max-w-2xl">{s.note}</p> : null}
      </div>
    </section>
  );
}
