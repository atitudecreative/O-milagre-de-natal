"use client";
import { motion, useReducedMotion } from "motion/react";
import type { TierRow } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { TrackedLink } from "../TrackedLink";

/** Cotas empilhadas, uma abaixo da outra; cada uma aparece animada ao rolar. */
export function TierShowcase({ tiers }: { tiers: TierRow[] }) {
  const reduce = useReducedMotion();
  const price = (x: TierRow) => (x.show_price && x.price != null ? formatCurrency(Number(x.price), x.currency) : "Sob consulta");

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {tiers.map((t, i) => {
        const bronze = t.name.trim().toLowerCase() === "bronze";
        const soldOut = t.quantity_total != null && t.quantity_sold >= t.quantity_total;
        return (
          <motion.article
            key={t.id}
            initial={reduce ? false : { opacity: 0, y: 70 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`grid gap-10 border p-7 md:grid-cols-12 md:gap-12 md:p-12 ${t.highlight ? "border-[var(--lt-copper-cta)] bg-[rgba(201,139,87,0.08)]" : bronze ? "tier-bronze" : "lt-rule bg-[var(--lt-band)]"}`}
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
                <TrackedLink href="#interesse" event="cta_click" label={`cota:${t.name}`} tierId={t.id} className={`lt-btn self-start ${t.highlight ? "lt-btn-copper" : bronze ? "lt-btn-bronze" : ""}`}>
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
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ delay: 0.2 + k * 0.05, duration: 0.45 }}
                    className="lt-dot lt-body !text-[var(--lt-ink)]"
                  >
                    {d}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
