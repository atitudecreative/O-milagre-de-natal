"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { OpportunityRow } from "@/lib/types";
import { OPPORTUNITY_LABEL } from "@/lib/labels";
import { EvImage } from "../EvImage";
import { TrackedLink } from "../TrackedLink";

/** Lista indexada (não grade de cards). Imagem fixa à direita no desktop troca com o item ativo. */
export function OpportunitiesList({ items }: { items: OpportunityRow[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  const active = items.find((i) => i.id === open) ?? items[0];

  return (
    <div className="grid gap-10 md:grid-cols-12">
      <ol className="border-t border-[var(--ev-line)] md:col-span-7">
        {items.map((o, i) => {
          const isOpen = o.id === open;
          return (
            <li key={o.id} className="border-b border-[var(--ev-line)]">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`op-${o.id}`}
                  onClick={() => setOpen(isOpen ? null : o.id)}
                  onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setOpen(o.id)}
                  className="group flex w-full items-baseline gap-5 py-6 text-left md:py-7"
                >
                  <span className="w-8 shrink-0 text-sm tabular-nums text-[var(--ev-subtle)]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1">
                    <span className="ev-micro block uppercase tracking-[0.18em]">{OPPORTUNITY_LABEL[o.category] ?? ""}</span>
                    <span className={`ev-display mt-2.5 block text-[clamp(1.8rem,3.6vw,3.2rem)] transition-colors duration-300 ${isOpen ? "text-[var(--ev-fg)]" : "text-[var(--ev-fg)]/55 group-hover:text-[var(--ev-fg)]"}`}>
                      {o.title}
                    </span>
                  </span>
                  <span aria-hidden className={`text-2xl transition-transform duration-500 ${isOpen ? "rotate-45 text-[var(--ev-accent)]" : ""}`}>+</span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    id={`op-${o.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-8 pl-[3.25rem] pr-2">
                      {o.image_url ? (
                        <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-[var(--ev-radius)] md:hidden">
                          <EvImage src={o.image_url} alt="" fill sizes="100vw" className="object-cover" />
                        </div>
                      ) : null}
                      {o.description ? <p className="max-w-xl leading-relaxed text-[var(--ev-muted)]">{o.description}</p> : null}
                      {o.deliverables.length ? (
                        <div className="mt-6">
                          <p className="ev-eyebrow mb-3">Contrapartidas</p>
                          <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                            {o.deliverables.map((d) => (
                              <li key={d} className="flex gap-3 text-sm leading-relaxed">
                                <span className="mt-[0.55em] h-1 w-3 shrink-0 bg-[var(--ev-accent)]" />
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      <TrackedLink href="#interesse" event="cta_click" label={`oportunidade:${o.title}`} className="ev-link-underline mt-7 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em]">
                        Tenho interesse <span aria-hidden>→</span>
                      </TrackedLink>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <div className="hidden md:col-span-5 md:block">
        <div className="sticky top-28 aspect-[4/5] overflow-hidden rounded-[var(--ev-radius)] bg-[var(--ev-surface-2)]">
          <AnimatePresence mode="popLayout">
            {active?.image_url ? (
              <motion.div key={active.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                <EvImage src={active.image_url} alt="" fill sizes="40vw" className="object-cover" />
              </motion.div>
            ) : (
              <motion.div key={`empty-${active?.id}`} className="absolute inset-0 flex items-end p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="ev-display text-6xl text-[var(--ev-fg)]/20">{active?.title}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
