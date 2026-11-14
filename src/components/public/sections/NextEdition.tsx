import type { EventBundle, NextEditionSettings, SectionRow } from "@/lib/types";
import { Counter } from "../Counter";
import { EvImage } from "../EvImage";
import { Reveal } from "../Reveal";
import { SectionHeader, SourceNote } from "../SectionHeader";

export function NextEdition({ bundle, section, index }: { bundle: EventBundle; section: SectionRow; index: number }) {
  const s = (section.settings ?? {}) as NextEditionSettings;
  const projections = bundle.metrics.filter((m) => m.kind === "projection");
  const items = (s.items ?? []).filter((i) => i.title);
  if (!projections.length && !items.length && !section.body) return null;

  return (
    <section id="proxima-edicao" className="ev-section relative">
      <div className="ev-container">
        <div className="mb-10 flex flex-wrap items-center gap-3">
          <span className="ev-projection-tag">Futuro · projeções e planejamento</span>
          {s.date_label ? <span className="ev-micro uppercase tracking-[0.2em]">{s.date_label}</span> : null}
        </div>
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} body={section.body} align="split" />

        {projections.length ? (
          <div className="mt-16 md:mt-24">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {projections.map((m, i) => (
                <Reveal as="li" key={m.id} delay={i * 0.06} className="ev-projection rounded-[var(--ev-radius)] border border-dashed border-[var(--ev-line-strong)] p-6 md:p-7">
                  <p className="ev-micro uppercase tracking-[0.2em]">Meta</p>
                  <div className="ev-num mt-4 text-[clamp(3rem,5vw,4.6rem)] text-transparent [-webkit-text-stroke:1px_var(--ev-fg)]">
                    {m.prefix}
                    <Counter value={Number(m.value)} animated={m.animate} />
                    {m.unit ? <span className="ml-1 text-[0.36em] tracking-normal">{m.unit}</span> : null}
                  </div>
                  <p className="mt-4 font-semibold">{m.label}</p>
                  {m.description ? <p className="mt-1 text-sm text-[var(--ev-muted)]">{m.description}</p> : null}
                  <SourceNote source={m.source} period={m.period} />
                </Reveal>
              ))}
            </ul>
            <p className="ev-micro mt-4">Valores projetados com base em planejamento. Não representam resultados apurados.</p>
          </div>
        ) : null}

        {items.length ? (
          <ol className="mt-20 md:mt-28">
            {items.map((it, i) => (
              <Reveal as="li" key={`${it.title}-${i}`} className="grid gap-6 border-t border-[var(--ev-line)] py-10 md:grid-cols-12 md:gap-10">
                <span className="ev-num text-5xl text-[var(--ev-accent)] md:col-span-2">{String(i + 1).padStart(2, "0")}</span>
                <div className="md:col-span-5">
                  <h3 className="ev-display text-[clamp(1.8rem,3vw,2.8rem)]">{it.title}</h3>
                  {it.description ? <p className="mt-4 leading-relaxed text-[var(--ev-muted)]">{it.description}</p> : null}
                </div>
                {it.image_url ? (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--ev-radius)] md:col-span-5">
                    <EvImage src={it.image_url} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
                  </div>
                ) : null}
              </Reveal>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}
