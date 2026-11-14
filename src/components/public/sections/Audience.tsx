import type { AudienceDatum, AudienceSettings, EventBundle, SectionRow } from "@/lib/types";
import { BrandBars, BrandDonut, BrandMap, BrandStats } from "../BrandCharts";
import { Reveal } from "../Reveal";
import { SectionHeader, SourceNote } from "../SectionHeader";

export function Audience({ bundle, section, index }: { bundle: EventBundle; section: SectionRow; index: number }) {
  const s = (section.settings ?? {}) as AudienceSettings;
  const blocks = bundle.audience.filter((a) => Array.isArray(a.data) && (a.data as AudienceDatum[]).length > 0);
  if (!blocks.length) return null;

  return (
    <section id="publico" className="ev-section bg-[var(--ev-surface)]">
      <div className="ev-container">
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} body={section.body} align="split" />
        {s.statement ? (
          <Reveal className="mt-16 max-w-4xl">
            <p className="text-2xl leading-snug md:text-4xl md:leading-tight">{s.statement}</p>
          </Reveal>
        ) : null}

        <div className="mt-16 grid gap-x-16 gap-y-20 md:mt-24 md:grid-cols-2">
          {blocks.map((a, i) => {
            const data = a.data as AudienceDatum[];
            const wide = a.chart_type === "map" || (i === 0 && blocks.length % 2 === 1);
            return (
              <Reveal key={a.id} delay={(i % 2) * 0.1} className={wide ? "md:col-span-2 md:grid md:grid-cols-12 md:gap-16" : ""}>
                <div className={wide ? "md:col-span-4" : ""}>
                  <p className="ev-eyebrow mb-2">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mb-8 text-2xl font-semibold leading-tight md:text-3xl">{a.title}</h3>
                  {wide && a.note ? <p className="mb-8 text-[var(--ev-muted)]">{a.note}</p> : null}
                </div>
                <div className={wide ? "md:col-span-8" : ""}>
                  {a.chart_type === "donut" ? <BrandDonut data={data} unit={a.unit} /> : null}
                  {a.chart_type === "bar" ? <BrandBars data={data} unit={a.unit} /> : null}
                  {a.chart_type === "stat" ? <BrandStats data={data} unit={a.unit} /> : null}
                  {a.chart_type === "map" ? <BrandMap data={data} unit={a.unit} /> : null}
                  {!wide && a.note ? <p className="mt-6 text-sm text-[var(--ev-muted)]">{a.note}</p> : null}
                  <SourceNote source={a.source} period={a.period} />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
