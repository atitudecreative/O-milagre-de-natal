import type { EventBundle, ResultsSettings, SectionRow } from "@/lib/types";
import { compactNumber, growth } from "@/lib/format";
import { RESULT_CATEGORY_LABEL } from "@/lib/labels";
import { Counter } from "../Counter";
import { EvImage } from "../EvImage";
import { ClipReveal, Reveal } from "../Reveal";
import { SectionHeader, SourceNote } from "../SectionHeader";

function fmtCompact(v: number) {
  const c = compactNumber(v);
  return `${c.number}${c.suffix ? ` ${c.suffix}` : ""}`;
}

export function Results({ bundle, section, index }: { bundle: EventBundle; section: SectionRow; index: number }) {
  const s = (section.settings ?? {}) as ResultsSettings;
  const rows = bundle.results;
  const photos = bundle.media.filter((m) => m.kind === "image" && m.folder === "ativacoes").slice(0, 3);
  const quotes = bundle.testimonials.filter((t) => t.context === "results").slice(0, 2);
  if (!rows.length && !photos.length) return null;
  const compare = s.show_comparison !== false && rows.some((r) => r.previous_value != null);

  return (
    <section id="resultados" className="ev-section">
      <div className="ev-container">
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} body={section.body} align="split" />

        {compare && (s.edition_label || s.previous_edition_label) ? (
          <Reveal className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2"><span className="h-2 w-6 bg-[var(--ev-accent)]" />{s.edition_label ?? "Última edição"}</span>
            <span className="flex items-center gap-2 text-[var(--ev-muted)]"><span className="h-2 w-6 bg-[var(--ev-line-strong)]" />{s.previous_edition_label ?? "Edição anterior"}</span>
          </Reveal>
        ) : null}

        <ol className="mt-8 border-t border-[var(--ev-line)]">
          {rows.map((r, i) => {
            const g = compare ? growth(Number(r.value), r.previous_value != null ? Number(r.previous_value) : null) : null;
            const max = Math.max(Number(r.value), Number(r.previous_value ?? 0), 1);
            return (
              <Reveal as="li" key={r.id} delay={0.04 * (i % 4)} className="grid grid-cols-12 items-end gap-x-4 gap-y-3 border-b border-[var(--ev-line)] py-8 md:py-10">
                <div className="col-span-12 md:col-span-4">
                  <p className="ev-micro mb-2 uppercase tracking-[0.18em]">{RESULT_CATEGORY_LABEL[r.category] ?? r.category}</p>
                  <p className="text-xl font-semibold leading-tight md:text-2xl">{r.label}</p>
                  {r.description ? <p className="mt-2 text-sm text-[var(--ev-muted)]">{r.description}</p> : null}
                  <SourceNote source={r.source} period={r.period} />
                </div>
                <div className="col-span-7 md:col-span-4">
                  <div className="ev-num text-[clamp(3.2rem,7vw,6.5rem)]">
                    {r.prefix ? <span className="text-[0.5em] align-top">{r.prefix}</span> : null}
                    <Counter value={Number(r.value)} />
                    {r.unit ? <span className="ml-1 text-[0.32em] tracking-normal text-[var(--ev-accent)]">{r.unit}</span> : null}
                  </div>
                </div>
                <div className="col-span-5 text-right md:col-span-4">
                  {g != null ? (
                    <div>
                      <span className={`ev-num text-[clamp(1.8rem,3.4vw,3rem)] ${g >= 0 ? "text-[var(--ev-accent)]" : "text-[var(--ev-muted)]"}`}>
                        {g >= 0 ? "+" : "−"}{Math.abs(g).toFixed(0)}%
                      </span>
                      <p className="ev-micro mt-1">vs. {fmtCompact(Number(r.previous_value))}{r.unit ? ` ${r.unit}` : ""}</p>
                    </div>
                  ) : null}
                </div>
                {compare && r.previous_value != null ? (
                  <div className="col-span-12 space-y-1.5 md:col-span-8 md:col-start-5" aria-hidden>
                    <div className="h-[5px] bg-[var(--ev-accent)]" style={{ width: `${(Number(r.value) / max) * 100}%` }} />
                    <div className="h-[5px] bg-[var(--ev-line-strong)]" style={{ width: `${(Number(r.previous_value) / max) * 100}%` }} />
                  </div>
                ) : null}
              </Reveal>
            );
          })}
        </ol>

        {photos.length ? (
          <div className="mt-20 grid gap-6 md:grid-cols-12">
            {photos.map((p, i) => (
              <figure key={p.id} className={i === 0 ? "md:col-span-7" : i === 1 ? "md:col-span-5 md:mt-24" : "md:col-span-6 md:col-start-4"}>
                <ClipReveal className={`relative overflow-hidden rounded-[var(--ev-radius)] ${i === 0 ? "aspect-[4/3]" : i === 1 ? "aspect-[4/5]" : "aspect-[16/9]"}`}>
                  <EvImage src={p.url} alt={p.alt ?? ""} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </ClipReveal>
                {p.caption ? <figcaption className="mt-3 text-sm text-[var(--ev-muted)]">{p.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : null}

        {quotes.length ? (
          <div className="mt-20 grid gap-12 md:grid-cols-2">
            {quotes.map((q) => (
              <Reveal as="figure" key={q.id} className="border-l-2 border-[var(--ev-accent)] pl-6">
                <blockquote className="text-xl leading-relaxed md:text-2xl">“{q.quote}”</blockquote>
                <figcaption className="mt-4 text-sm text-[var(--ev-muted)]">
                  <span className="font-semibold text-[var(--ev-fg)]">{q.author}</span>
                  {q.role || q.company ? <> — {[q.role, q.company].filter(Boolean).join(", ")}</> : null}
                </figcaption>
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
