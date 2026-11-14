import type { EventBundle, EventSponsorWithBrand, SectionRow, SponsorsSettings } from "@/lib/types";
import { RELATION_LABEL } from "@/lib/labels";
import { EvImage } from "../EvImage";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../SectionHeader";

function Logo({ s }: { s: EventSponsorWithBrand }) {
  const brand = s.sponsor;
  const inner = brand.logo_url ? (
    <EvImage src={brand.logo_url} alt={brand.name} width={200} height={90} className="h-10 w-auto max-w-[150px] object-contain opacity-80 brightness-0 transition duration-500 group-hover:opacity-100 group-hover:brightness-100 md:h-12 [.ev-dark_&]:invert [.ev-dark_&]:group-hover:invert-0" />
  ) : (
    <span className="text-lg font-semibold tracking-tight text-[var(--ev-muted)] group-hover:text-[var(--ev-fg)]">{brand.name}</span>
  );
  return brand.website ? (
    <a href={brand.website} target="_blank" rel="noopener noreferrer" className="group flex h-24 items-center justify-center px-8" title={brand.name}>{inner}</a>
  ) : (
    <span className="group flex h-24 items-center justify-center px-8" title={brand.name}>{inner}</span>
  );
}

export function Sponsors({ bundle, section, index }: { bundle: EventBundle; section: SectionRow; index: number }) {
  const s = (section.settings ?? {}) as SponsorsSettings;
  const list = bundle.sponsors;
  const quotes = bundle.testimonials.filter((t) => t.context === "sponsor");
  if (!list.length && !quotes.length) return null;

  const groups = (["current", "past", "institutional", "supporter", "media"] as const)
    .map((rel) => ({ rel, items: list.filter((x) => x.relation === rel) }))
    .filter((g) => g.items.length);
  const cases = list.filter((x) => x.case_title && x.case_body);
  const marquee = s.show_marquee !== false && list.length >= 6;

  return (
    <section id="parceiros" className="ev-section">
      <div className="ev-container">
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} body={section.body} align="split" />
      </div>

      {marquee ? (
        <div className="ev-marquee mt-16 overflow-hidden border-y border-[var(--ev-line)] md:mt-24" style={{ ["--marquee-duration" as string]: `${Math.max(list.length * 4, 30)}s` }}>
          <div className="ev-marquee-track flex w-max">
            {[...list, ...list].map((x, i) => (
              <div key={`${x.id}-${i}`} aria-hidden={i >= list.length} className="border-r border-[var(--ev-line)]">
                <Logo s={x} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="ev-container">
        <div className="mt-16 space-y-14">
          {groups.map((g) => (
            <Reveal key={g.rel}>
              <p className="ev-eyebrow mb-5">{RELATION_LABEL[g.rel]}</p>
              <ul className="grid grid-cols-2 border-l border-t border-[var(--ev-line)] sm:grid-cols-3 lg:grid-cols-5">
                {g.items.map((x) => (
                  <li key={x.id} className="border-b border-r border-[var(--ev-line)]">
                    <Logo s={x} />
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {cases.length ? (
          <div className="mt-24">
            <p className="ev-eyebrow mb-8">Cases</p>
            <div className="grid gap-12 md:grid-cols-2">
              {cases.map((c, i) => (
                <Reveal key={c.id} delay={i * 0.08} as="article" className="border-t border-[var(--ev-line-strong)] pt-6">
                  <p className="text-sm text-[var(--ev-muted)]">{c.sponsor.name}{c.tier_label ? ` · ${c.tier_label}` : ""}</p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight md:text-3xl">{c.case_title}</h3>
                  <p className="mt-4 leading-relaxed text-[var(--ev-muted)]">{c.case_body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}

        {quotes.length ? (
          <div className="mt-24 grid gap-12 md:grid-cols-2">
            {quotes.map((q) => (
              <Reveal as="figure" key={q.id}>
                <blockquote className="text-2xl leading-snug md:text-3xl">“{q.quote}”</blockquote>
                <figcaption className="mt-5 text-sm text-[var(--ev-muted)]">
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
