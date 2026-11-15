import { Fragment, type ReactNode } from "react";
import type { CtaSettings, EventBundle, GrandeurSettings, MediaRow, MetricRow, SectionRow, TierRow, TiersSettings } from "@/lib/types";
import { compactNumber, formatCurrency } from "@/lib/format";
import { EvImage } from "../EvImage";
import { LeadForm } from "../LeadForm";
import { ClipReveal, Reveal } from "../Reveal";
import { TrackedLink } from "../TrackedLink";
import { TiersViewTracker } from "../sections/TiersViewTracker";
import { CrowdDots } from "./CrowdDots";
import { OpportunityShowcase } from "./OpportunityShowcase";

/**
 * Corpo da página em estética clara e editorial. Cada seção tem um recurso
 * próprio do mundo do espetáculo: frase com destaques, público em pontos,
 * ingressos das sessões, vitrine de formatos e tabela comparativa de cotas.
 */

function Header({ eyebrow, title, body, align = "split" }: { eyebrow?: string | null; title?: string | null; body?: string | null; align?: "split" | "center" | "stack" }) {
  if (align === "center") {
    return (
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        {eyebrow ? <p className="lt-eyebrow lt-eyebrow-center">{eyebrow}</p> : null}
        {title ? <h2 className="lt-display lt-title">{title}</h2> : null}
        {body ? <p className="lt-lead">{body}</p> : null}
      </Reveal>
    );
  }
  if (align === "stack") {
    return (
      <Reveal className="flex max-w-xl flex-col gap-5">
        {eyebrow ? <p className="lt-eyebrow">{eyebrow}</p> : null}
        {title ? <h2 className="lt-display lt-title">{title}</h2> : null}
        {body ? <p className="lt-lead">{body}</p> : null}
      </Reveal>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-12 md:gap-10">
      <Reveal className="flex flex-col gap-5 md:col-span-7">
        {eyebrow ? <p className="lt-eyebrow">{eyebrow}</p> : null}
        {title ? <h2 className="lt-display lt-title">{title}</h2> : null}
      </Reveal>
      {body ? (
        <Reveal delay={0.1} className="md:col-span-4 md:col-start-9 md:self-end">
          <p className="lt-lead">{body}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

/** Frase com trechos destacados em cobre. */
function Highlighted({ text, marks = [] }: { text: string; marks?: string[] }) {
  if (!marks.length) return <>{text}</>;
  const pattern = new RegExp(`(${marks.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return (
    <>
      {text.split(pattern).map((part, i) => (marks.includes(part) ? <mark key={i}>{part}</mark> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

/* ---------- O musical ---------- */
function Intro({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const s = (section.settings ?? {}) as GrandeurSettings;
  const gallery = bundle.media.filter((m) => m.kind === "image" && m.in_gallery);
  const lead = gallery.find((m) => m.featured) ?? gallery[0];
  const rest = gallery.filter((m) => m !== lead);
  const highlights = s.highlights ?? [];
  const audience = bundle.metrics.find((m) => m.kind === "actual" && m.featured);

  return (
    <>
      <section id="o-evento" className="lt-section pb-0">
        <div className="lt-wrap">
          <Header eyebrow={section.eyebrow} title={section.title} body={section.body} />
        </div>
        {lead ? (
          <div className="relative mt-12 md:mt-16">
            <ClipReveal className="relative aspect-[4/3] overflow-hidden bg-[var(--lt-band)] sm:aspect-[21/9]">
              <EvImage src={lead.url} alt={lead.alt ?? ""} fill sizes="100vw" quality={80} className="object-cover" />
            </ClipReveal>
            {audience ? (
              <Reveal delay={0.3} className="lt-wrap relative -mt-16 md:-mt-24">
                <div className="inline-flex max-w-sm flex-col gap-1 bg-[var(--lt-paper)] px-6 py-5 md:px-8 md:py-6">
                  <span className="lt-num text-4xl md:text-5xl">+{compactNumber(Number(audience.value)).number} {compactNumber(Number(audience.value)).suffix}</span>
                  <span className="lt-small">{audience.unit} em {audience.period}</span>
                </div>
              </Reveal>
            ) : null}
          </div>
        ) : null}
      </section>

      {s.statement || highlights.length ? (
        <section className="lt-section" aria-label="Por que patrocinar">
          <div className="lt-wrap">
            {s.statement ? (
              <Reveal className="max-w-5xl">
                <p className="lt-display lt-quote">
                  <Highlighted text={s.statement} marks={s.statement_highlights} />
                </p>
              </Reveal>
            ) : null}
            {highlights.length ? (
              <ul className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-12">
                {highlights.map((h, i) => (
                  <Reveal as="li" key={h.title} delay={i * 0.08} className="flex flex-col gap-3 border-t-2 border-[var(--lt-copper-cta)] pt-6">
                    <h3 className="lt-display text-2xl">{h.title}</h3>
                    {h.description ? <p className="lt-body">{h.description}</p> : null}
                  </Reveal>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}

      {rest.length ? <Filmstrip title={s.gallery_title} items={rest} /> : null}
    </>
  );
}

/** Galeria em faixa horizontal, como um rolo de filme. */
function Filmstrip({ title, items }: { title?: string | null; items: MediaRow[] }) {
  return (
    <section className="lt-section pt-0" aria-label="Galeria">
      <div className="lt-wrap mb-10 flex items-end justify-between gap-6">
        {title ? <h2 className="lt-display lt-title-sm max-w-xl">{title}</h2> : <span />}
        <p className="lt-fine hidden shrink-0 sm:block">Arraste para o lado →</p>
      </div>
      <ul className="lt-scroll-x flex gap-4 overflow-x-auto pb-2 pl-[max(20px,calc((100vw_-_1280px)/2_+_20px))] pr-5 [scroll-padding-left:max(20px,calc((100vw_-_1280px)/2_+_20px))] md:gap-6">
        {items.map((m) => (
          <li key={m.id} className="w-[82vw] shrink-0 snap-start sm:w-[60vw] md:w-[42vw] lg:w-[36vw]">
            <figure className="flex flex-col gap-3">
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--lt-band)]">
                <EvImage src={m.url} alt={m.alt ?? ""} fill sizes="(min-width: 1024px) 36vw, (min-width: 768px) 42vw, 82vw" quality={80} className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] hover:scale-[1.03]" />
              </div>
              {m.caption ? (
                <figcaption className="flex items-baseline justify-between gap-4">
                  <span className="lt-small text-[var(--lt-muted)]">{m.caption}</span>
                  {m.credit ? <span className="lt-fine shrink-0">{m.credit}</span> : null}
                </figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Público e sessões ---------- */
const WEEKDAY = new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" });
const MONTH = new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "UTC" });

function days(start?: string | null, end?: string | null) {
  if (!start) return [];
  const out: Date[] = [];
  const d = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end ?? start}T00:00:00Z`);
  while (d <= last && out.length < 31) {
    out.push(new Date(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

function AudienceRow({ m }: { m: MetricRow }) {
  const value = Number(m.value);
  const c = compactNumber(value);
  const projection = m.kind === "projection";
  const perDot = value >= 1000 ? 1000 : 1;
  const filled = Math.min(100, Math.round(value / perDot));
  return (
    <Reveal className="grid gap-8 border-t lt-rule py-10 md:grid-cols-12 md:gap-12 md:py-14">
      <div className="flex flex-col gap-3 md:col-span-5">
        <p className={`lt-label ${projection ? "lt-copper" : ""}`}>{projection ? `Expectativa ${m.period ?? ""}` : `${m.label} ${m.period ?? ""}`}</p>
        <p className="lt-num text-[clamp(64px,9vw,128px)]">
          +{c.number}
          {c.suffix ? <span className="ml-2 text-[0.42em] tracking-[-0.02em]">{c.suffix}</span> : null}
        </p>
        {m.unit ? <p className="lt-display text-xl">{m.unit}</p> : null}
        {m.description ? <p className="lt-body">{m.description}</p> : null}
        {m.source ? <p className="lt-fine mt-2">{projection ? "Projeção" : "Fonte"}: {m.source}</p> : null}
      </div>
      <div className="flex flex-col justify-center gap-4 md:col-span-7">
        <CrowdDots filled={filled} dashed={projection} label={`${c.number} ${c.suffix} ${m.unit ?? ""}`} />
        <p className="lt-fine">Cada ponto representa {perDot === 1000 ? "mil pessoas" : "uma pessoa"}{projection ? " · contorno = expectativa" : ""}.</p>
      </div>
    </Reveal>
  );
}

function Ticket({ d, i, total, event }: { d: Date; i: number; total: number; event: EventBundle["event"] }) {
  return (
    <Reveal as="li" delay={i * 0.06} className="lt-ticket flex flex-col">
      <div className="flex flex-col gap-1 px-4 pb-5 pt-5 md:px-6 md:pb-6 md:pt-6">
        <div className="flex items-center justify-between">
          <span className="lt-label">Sessão {i + 1}/{total}</span>
          <span className="lt-label lt-copper hidden sm:inline">Natal</span>
        </div>
        <span className="lt-num mt-4 text-[clamp(52px,6vw,88px)] md:mt-6">{String(d.getUTCDate()).padStart(2, "0")}</span>
        <span className="lt-display text-lg">{MONTH.format(d)}</span>
        <span className="lt-small text-[var(--lt-muted)] first-letter:uppercase">{WEEKDAY.format(d)}</span>
      </div>
      <div className="lt-perf mx-4" aria-hidden />
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
        <span className="lt-fine truncate">{event.name}</span>
        <span className="lt-fine hidden shrink-0 md:inline">{event.venue}</span>
      </div>
    </Reveal>
  );
}

function Numbers({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const { event } = bundle;
  const list = days(event.starts_on, event.ends_on);
  const stats = [
    ...bundle.metrics.filter((m) => m.kind === "actual" && Number(m.value) >= 10),
    ...bundle.metrics.filter((m) => m.kind === "projection"),
  ];
  if (!list.length && !stats.length) return null;
  return (
    <>
      {stats.length ? (
        <section id="numeros" className="lt-section">
          <div className="lt-wrap">
            <Header eyebrow={section.eyebrow} title={section.title} body={section.body} />
            <div className="mt-14 md:mt-20">
              {stats.map((m) => <AudienceRow key={m.id} m={m} />)}
            </div>
          </div>
        </section>
      ) : null}

      {list.length ? (
        <section className="lt-band lt-section" aria-label="Sessões">
          <div className="lt-wrap">
            <div className="grid gap-6 md:grid-cols-12 md:items-end">
              <Reveal className="flex flex-col gap-5 md:col-span-7">
                <p className="lt-eyebrow">Sessões</p>
                <h2 className="lt-display lt-title">{list.length === 4 ? "Quatro noites de espetáculo." : "As sessões da temporada."}</h2>
              </Reveal>
              {bundle.look?.venueNote ? <Reveal delay={0.1} className="md:col-span-4 md:col-start-9"><p className="lt-lead">{bundle.look.venueNote}</p></Reveal> : null}
            </div>
            <ol className={`mt-12 grid grid-cols-2 gap-3 md:mt-16 md:gap-4 ${list.length >= 4 ? "lg:grid-cols-4" : ""}`}>
              {list.map((d, i) => <Ticket key={d.toISOString()} d={d} i={i} total={list.length} event={event} />)}
            </ol>
            {event.venue || bundle.look?.address ? (
              <Reveal className="mt-10 flex flex-col justify-between gap-6 border-t lt-rule pt-8 md:flex-row md:items-center">
                <div>
                  <p className="lt-display text-2xl">{event.venue}</p>
                  <p className="lt-body mt-1">{bundle.look?.address ?? [event.city, event.state].filter(Boolean).join(", ")}</p>
                </div>
                <TrackedLink href="#interesse" event="cta_click" label="sessoes_patrocinar" className="lt-btn self-start md:self-auto">Quero patrocinar</TrackedLink>
              </Reveal>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

/* ---------- Oportunidades ---------- */
function Opportunities({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const items = bundle.opportunities.filter((o) => o.enabled);
  if (!items.length) return null;
  return (
    <section id="oportunidades" className="lt-section">
      <div className="lt-wrap">
        <Header eyebrow={section.eyebrow} title={section.title} body={section.body} />
        <div className="mt-12 md:mt-16">
          <OpportunityShowcase items={items} />
        </div>
      </div>
    </section>
  );
}

/* ---------- Cotas ---------- */
function Cell({ value }: { value: string }) {
  if (value === "✓") return <span aria-label="Incluído" className="inline-block h-[9px] w-[16px] -translate-y-[2px] -rotate-45 border-b-2 border-l-2 border-[var(--lt-ink)]" />;
  if (value === "—" || value === "") return <span aria-label="Não incluído" className="text-[var(--lt-faint)]">—</span>;
  return <span className="lt-small font-medium">{value}</span>;
}

function TierHead({ t }: { t: TierRow }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={`lt-label ${t.highlight ? "lt-copper" : ""}`}>{t.highlight ? "Mais completa" : "Cota"}</span>
      <span className="lt-display text-2xl md:text-3xl">{t.name}</span>
      <span className="lt-num text-xl md:text-2xl">{t.show_price && t.price != null ? formatCurrency(Number(t.price), t.currency) : "Sob consulta"}</span>
    </div>
  );
}

function TierButton({ t }: { t: TierRow }) {
  const soldOut = t.quantity_total != null && t.quantity_sold >= t.quantity_total;
  if (soldOut) return <span className="lt-fine">Comercializada</span>;
  return (
    <TrackedLink href="#interesse" event="cta_click" label={`cota:${t.name}`} tierId={t.id} className={`lt-btn !min-h-11 w-full !px-3 !text-[11px] ${t.highlight ? "lt-btn-copper" : ""}`}>
      Quero esta
    </TrackedLink>
  );
}

function Tiers({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const s = (section.settings ?? {}) as TiersSettings;
  const tiers = bundle.tiers.filter((t) => t.enabled);
  if (!tiers.length) return null;
  const rows = s.comparison ?? [];
  const hl = (i: number) => (tiers[i]?.highlight ? "lt-col-hl" : "");
  let table: ReactNode = null;
  if (rows.length) {
    table = (
      <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
        <table className="lt-table min-w-[560px]">
          <caption className="sr-only">Comparativo das cotas de patrocínio</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[34%] align-bottom"><span className="lt-label">Contrapartidas</span></th>
              {tiers.map((t, i) => <th key={t.id} scope="col" className={`!text-left align-bottom ${hl(i)}`}><TierHead t={t} /></th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row" className="lt-small font-normal text-[var(--lt-ink)]">{r.label}</th>
                {tiers.map((t, i) => <td key={t.id} className={`!text-left ${hl(i)}`}><Cell value={r.values[i] ?? "—"} /></td>)}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td />
              {tiers.map((t, i) => <td key={t.id} className={`!border-b-0 !text-left ${hl(i)}`}><TierButton t={t} /></td>)}
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }
  return (
    <section id="cotas" className="lt-band lt-section">
      <TiersViewTracker />
      <div className="lt-wrap">
        <Header eyebrow={section.eyebrow} title={section.title} body={section.body} />
        <Reveal className="mt-12 md:mt-16">
          {table ?? (
            <div className="grid gap-8 md:grid-cols-3">
              {tiers.map((t) => (
                <div key={t.id} className="flex flex-col gap-5 border-t lt-rule pt-6">
                  <TierHead t={t} />
                  <ul className="flex flex-col gap-2 lt-small">{t.deliverables.map((d) => <li key={d} className="lt-dot">{d}</li>)}</ul>
                  <TierButton t={t} />
                </div>
              ))}
            </div>
          )}
        </Reveal>
        {s.note ? <p className="lt-fine mt-6">{s.note}</p> : null}
      </div>
    </section>
  );
}

/* ---------- Faixa, chamada final e rodapé ---------- */
function Strip({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full overflow-hidden bg-[#13171D]">
      <EvImage src={src} alt={alt} width={2000} height={317} sizes="100vw" quality={85} className="block h-auto min-h-[180px] w-full object-cover object-left" />
    </div>
  );
}

function Cta({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const { event, tiers } = bundle;
  const s = (section.settings ?? {}) as CtaSettings;
  const list = days(event.starts_on, event.ends_on);
  return (
    <section id="interesse" className="lt-section">
      <div className="lt-wrap grid gap-14 md:grid-cols-12 md:gap-12">
        <div className="flex flex-col gap-10 md:col-span-5">
          <Header eyebrow={section.eyebrow} title={section.title} body={section.body} align="stack" />
          <Reveal delay={0.1}>
            <dl className="grid gap-6 border-t lt-rule pt-8">
              {list.length ? (
                <div>
                  <dt className="lt-label">Sessões</dt>
                  <dd className="lt-display mt-1 text-xl">{event.date_label ?? list.map((d) => d.getUTCDate()).join(", ")}</dd>
                </div>
              ) : null}
              {bundle.look?.address ? (
                <div>
                  <dt className="lt-label">Local</dt>
                  <dd className="lt-body mt-1 !text-[var(--lt-ink)]">{event.venue} · {bundle.look.address}</dd>
                </div>
              ) : null}
              {event.deck_enabled ? (
                <div>
                  <dt className="lt-label">Apresentação</dt>
                  <dd className="mt-2">
                    <TrackedLink href="/apresentacao.pdf" event="deck_download" label="deck_pdf" target="_blank" className="lt-link">Baixar PDF</TrackedLink>
                  </dd>
                </div>
              ) : null}
            </dl>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="md:col-span-7">
          <div className="bg-[var(--lt-band)] p-6 md:p-10">
            <LeadForm
              eventId={event.id}
              eventName={event.name}
              whatsapp={event.whatsapp}
              contactEmail={event.contact_email}
              tiers={tiers.filter((t) => t.enabled)}
              interests={event.form_interests}
              successMessage={event.form_success_message}
              buttonLabel={s.button_label}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer({ bundle, section }: { bundle: EventBundle; section?: SectionRow }) {
  const { event } = bundle;
  const copyright = (section?.settings as { copyright?: string } | undefined)?.copyright;
  return (
    <footer id="contato" className="border-t lt-rule pb-28 pt-12 md:pb-14">
      <div className="lt-wrap grid gap-8 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="lt-display text-xl">{event.name}</p>
          <p className="lt-small mt-3 max-w-md text-[var(--lt-muted)]">{event.organizer_about}</p>
        </div>
        <ul className="flex flex-col gap-2 lt-small md:col-span-3">
          <li><a className="hover:underline" href="/privacidade">Política de privacidade</a></li>
          <li><button type="button" data-consent-open className="hover:underline">Preferências de cookies</button></li>
          {event.deck_enabled ? <li><a className="hover:underline" href="/apresentacao.pdf" target="_blank">Apresentação em PDF</a></li> : null}
        </ul>
        <p className="lt-fine md:col-span-3 md:text-right">{copyright || `© ${new Date().getFullYear()} ${event.organizer_name ?? event.name}`}</p>
      </div>
    </footer>
  );
}

export function LightBody({ bundle, sections }: { bundle: EventBundle; sections: SectionRow[] }) {
  const footer = bundle.sections.find((s) => s.type === "footer");
  return (
    <div className="lt">
      {sections.map((s) => {
        switch (s.type) {
          case "grandeur": return <Intro key={s.id} bundle={bundle} section={s} />;
          case "metrics": return <Numbers key={s.id} bundle={bundle} section={s} />;
          case "opportunities": return <Opportunities key={s.id} bundle={bundle} section={s} />;
          case "tiers": return <Tiers key={s.id} bundle={bundle} section={s} />;
          case "cta":
            return (
              <div key={s.id}>
                {bundle.look?.strip ? <Strip src={bundle.look.strip.src} alt={bundle.look.strip.alt} /> : null}
                <Cta bundle={bundle} section={s} />
              </div>
            );
          default: return null;
        }
      })}
      {footer?.enabled !== false ? <Footer bundle={bundle} section={footer} /> : null}
    </div>
  );
}
