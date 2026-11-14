import type { EventBundle, MetricRow, MetricsSettings, SectionRow } from "@/lib/types";
import { Counter } from "../Counter";
import { Reveal } from "../Reveal";
import { SectionHeader, SourceNote } from "../SectionHeader";

function MetricValue({ m, className, unitClass = "text-[0.32em]" }: { m: MetricRow; className: string; unitClass?: string }) {
  return (
    <div className={`ev-num ${className}`}>
      {m.prefix ? <span className="mr-[0.05em] text-[0.5em] align-top">{m.prefix}</span> : null}
      <Counter value={Number(m.value)} animated={m.animate} />
      {m.unit ? <span className={`ml-[0.1em] ${unitClass} align-baseline tracking-normal text-[var(--ev-accent)]`}>{m.unit}</span> : null}
    </div>
  );
}

export function Metrics({ bundle, section, index }: { bundle: EventBundle; section: SectionRow; index: number }) {
  const s = (section.settings ?? {}) as MetricsSettings;
  const actual = bundle.metrics.filter((m) => m.kind === "actual");
  const projections = s.show_projections ? bundle.metrics.filter((m) => m.kind === "projection") : [];
  if (!actual.length && !projections.length) return null;
  const featured = actual.find((m) => m.featured) ?? actual[0];
  const rest = actual.filter((m) => m !== featured);

  return (
    <section id="numeros" className="ev-section">
      <div className="ev-container">
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} body={section.body} align="split" />

        {featured ? (
          <Reveal className="mt-16 grid gap-6 border-t border-[var(--ev-line)] pt-8 md:mt-24 md:grid-cols-12">
            <div className="md:col-span-8">
              <MetricValue m={featured} className="text-[clamp(5.5rem,22vw,22rem)]" unitClass="text-[0.2em]" />
            </div>
            <div className="flex flex-col justify-end md:col-span-4 md:pb-6">
              <p className="text-xl font-semibold md:text-2xl">{featured.label}</p>
              {featured.description ? <p className="mt-3 text-[var(--ev-muted)]">{featured.description}</p> : null}
              <SourceNote source={featured.source} period={featured.period} />
            </div>
          </Reveal>
        ) : null}

        {rest.length ? (
          <ul className="mt-10 grid grid-cols-1 gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((m, i) => (
              <Reveal
                as="li"
                key={m.id}
                delay={(i % 3) * 0.08}
                className="flex flex-col justify-between gap-6 border-t border-[var(--ev-line)] py-9 sm:pr-8"
              >
                <MetricValue m={m} className="text-[clamp(3.6rem,8vw,7rem)]" />
                <div>
                  <p className="text-lg font-semibold">{m.label}</p>
                  {m.description ? <p className="mt-1.5 text-sm leading-relaxed text-[var(--ev-muted)]">{m.description}</p> : null}
                  <SourceNote source={m.source} period={m.period} />
                </div>
              </Reveal>
            ))}
          </ul>
        ) : null}

        {projections.length ? (
          <div className="mt-16">
            <p className="ev-projection-tag mb-6">Projeções — não são resultados apurados</p>
            <ul className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
              {projections.map((m) => (
                <li key={m.id} className="ev-projection border border-dashed border-[var(--ev-line-strong)] p-6">
                  <MetricValue m={m} className="text-5xl text-[var(--ev-fg)]/80" />
                  <p className="mt-4 font-semibold">{m.label}</p>
                  <SourceNote source={m.source} period={m.period} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
