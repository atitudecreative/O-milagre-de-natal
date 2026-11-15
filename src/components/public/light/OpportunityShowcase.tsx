"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { OpportunityRow } from "@/lib/types";
import { EvImage } from "../EvImage";
import { TrackedLink } from "../TrackedLink";

/** Vitrine: lista de formatos à esquerda; foto e detalhes do formato ativo à direita. */
export function OpportunityShowcase({ items }: { items: OpportunityRow[] }) {
  const [active, setActive] = useState(0);
  const o = items[active];
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-12">
      <div role="tablist" aria-label="Formatos de patrocínio" aria-orientation="vertical" className="-mx-5 flex gap-2 overflow-x-auto px-5 lt-scroll-x md:col-span-4 md:mx-0 md:flex-col md:gap-0 md:overflow-visible md:px-0">
        {items.map((it, i) => (
          <button
            key={it.id}
            role="tab"
            type="button"
            id={`op-tab-${it.id}`}
            aria-selected={i === active}
            aria-controls="op-panel"
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); setActive((active + 1) % items.length); }
              if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); setActive((active - 1 + items.length) % items.length); }
            }}
            className="lt-tab group relative shrink-0 snap-start border border-[var(--lt-rule)] px-4 py-3 text-left text-[var(--lt-muted)] transition-colors hover:text-[var(--lt-ink)] aria-selected:border-[var(--lt-ink)] md:border-0 md:border-b md:px-0 md:py-6 md:aria-selected:border-[var(--lt-rule)]"
          >
            <span className="lt-display block text-lg md:text-[28px]">{it.title}</span>
            <span aria-hidden className="lt-tab-bar absolute bottom-[-1px] left-0 hidden h-[2px] w-full bg-[var(--lt-copper-cta)] md:block" />
          </button>
        ))}
      </div>

      <div id="op-panel" role="tabpanel" aria-labelledby={`op-tab-${o.id}`} className="md:col-span-8">
        <AnimatePresence mode="wait">
          <motion.div key={o.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-8">
            {o.image_url ? (
              <div className="relative aspect-[16/9] overflow-hidden bg-[var(--lt-band)] md:aspect-[2/1]">
                <EvImage src={o.image_url} alt="" fill sizes="(min-width: 768px) 820px, 100vw" quality={80} className="object-cover" />
              </div>
            ) : null}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col gap-5">
                {o.description ? <p className="lt-lead !text-[var(--lt-ink)]">{o.description}</p> : null}
                <TrackedLink href="#interesse" event="cta_click" label={`oportunidade:${o.title}`} className="lt-link self-start">Tenho interesse <span aria-hidden>→</span></TrackedLink>
              </div>
              {o.deliverables.length ? (
                <ul className="flex flex-col gap-3 lt-small">
                  {o.deliverables.map((d) => <li key={d} className="lt-dot">{d}</li>)}
                </ul>
              ) : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
