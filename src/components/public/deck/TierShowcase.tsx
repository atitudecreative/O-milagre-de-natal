"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { TierRow } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { TrackedLink } from "../TrackedLink";

/** Cotas apresentadas uma por vez, com seletor, setas e gesto de deslizar. */
export function TierShowcase({ tiers }: { tiers: TierRow[] }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();
  const t = tiers[i];
  const go = (n: number) => {
    const next = (n + tiers.length) % tiers.length;
    setDir(next > i || (i === tiers.length - 1 && next === 0) ? 1 : -1);
    setI(next);
  };
  const price = (x: TierRow) => (x.show_price && x.price != null ? formatCurrency(Number(x.price), x.currency) : "Sob consulta");
  const soldOut = t.quantity_total != null && t.quantity_sold >= t.quantity_total;

  return (
    <div className="flex flex-col gap-8">
      <div role="tablist" aria-label="Cotas" className="flex flex-wrap gap-2">
        {tiers.map((x, k) => (
          <button
            key={x.id}
            role="tab"
            type="button"
            aria-selected={k === i}
            aria-controls="tier-panel"
            onClick={() => go(k)}
            className={`flex items-baseline gap-3 border px-5 py-3 text-left transition-colors ${k === i ? "border-[var(--lt-ink)] bg-[var(--lt-ink)] text-[#13171d]" : "border-[var(--lt-rule-strong)] text-[var(--lt-muted)] hover:border-[var(--lt-ink)] hover:text-[var(--lt-ink)]"}`}
          >
            <span className="lt-display text-lg">{x.name}</span>
            <span className="text-xs tabular-nums opacity-80">{price(x)}</span>
          </button>
        ))}
      </div>

      <div
        id="tier-panel"
        role="tabpanel"
        aria-live="polite"
        className="relative overflow-hidden"
        onTouchStart={(e) => ((e.currentTarget as HTMLElement).dataset.x = String(e.touches[0].clientX))}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - Number((e.currentTarget as HTMLElement).dataset.x);
          if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
        }}
      >
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.article
            key={t.id}
            custom={dir}
            initial={reduce ? false : { opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`grid gap-10 border p-7 md:grid-cols-12 md:gap-12 md:p-12 ${t.highlight ? "border-[var(--lt-copper-cta)] bg-[rgba(201,139,87,0.08)]" : "lt-rule bg-[var(--lt-band)]"}`}
          >
            <div className="flex flex-col gap-6 md:col-span-5">
              <div className="flex items-center gap-3">
                <span className="lt-label">Cota {i + 1} de {tiers.length}</span>
                {t.highlight ? <span className="lt-label lt-copper">· Mais completa</span> : null}
              </div>
              <h3 className="lt-display text-[clamp(48px,6vw,88px)] leading-none">{t.name}</h3>
              {t.tagline ? <p className="lt-lead">{t.tagline}</p> : null}
              <div className="border-t lt-rule pt-6">
                <p className="lt-label">Investimento</p>
                <p className="lt-num mt-2 text-[clamp(40px,4.4vw,64px)]">{price(t)}</p>
              </div>
              {soldOut ? (
                <p className="lt-label">Cota comercializada</p>
              ) : (
                <TrackedLink href="#interesse" event="cta_click" label={`cota:${t.name}`} tierId={t.id} className={`lt-btn self-start ${t.highlight ? "lt-btn-copper" : ""}`}>
                  Quero a cota {t.name}
                </TrackedLink>
              )}
            </div>
            <div className="md:col-span-7">
              <p className="lt-label mb-5">O que está incluído</p>
              <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {t.deliverables.map((d, k) => (
                  <motion.li
                    key={d}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + k * 0.04, duration: 0.4 }}
                    className="lt-dot lt-body !text-[var(--lt-ink)]"
                  >
                    {d}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => go(i - 1)} className="lt-link" aria-label="Cota anterior">← {tiers[(i - 1 + tiers.length) % tiers.length].name}</button>
        <div className="flex gap-2" aria-hidden>
          {tiers.map((x, k) => <span key={x.id} className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-[var(--lt-copper-cta)]" : "w-1.5 bg-[var(--lt-rule-strong)]"}`} />)}
        </div>
        <button type="button" onClick={() => go(i + 1)} className="lt-link" aria-label="Próxima cota">{tiers[(i + 1) % tiers.length].name} →</button>
      </div>
    </div>
  );
}
