import type { CtaSettings, EventBundle, GrandeurSettings, OpportunityRow, SectionRow, TierRow, TiersSettings } from "@/lib/types";
import { compactNumber, formatCurrency } from "@/lib/format";
import type { MediaRow } from "@/lib/types";
import { EvImage } from "../EvImage";
import { ClipReveal } from "../Reveal";
import { Reveal } from "../Reveal";
import { LeadForm } from "../LeadForm";
import { TrackedLink } from "../TrackedLink";
import { TiersViewTracker } from "../sections/TiersViewTracker";

/**
 * Corpo da página em estética "galeria branca": seções brancas alternando com
 * faixas #f5f5f7, títulos compactos e cartões de 28px sem sombra.
 */

function Head({ kicker, title, body, align = "center" }: { kicker?: string | null; title?: string | null; body?: string | null; align?: "center" | "left" }) {
  const center = align === "center";
  return (
    <Reveal className={`flex flex-col gap-4 ${center ? "mx-auto max-w-3xl items-center text-center" : "max-w-2xl"}`}>
      {kicker ? <p className="ap-kicker ap-kicker-accent">{kicker}</p> : null}
      {title ? <h2 className="ap-h2">{title}</h2> : null}
      {body ? <p className="ap-lead">{body}</p> : null}
    </Reveal>
  );
}

/* ---------- O musical ---------- */
function Photo({ m, className, sizes, priority }: { m: MediaRow; className: string; sizes: string; priority?: boolean }) {
  return (
    <figure className="flex flex-col gap-3">
      <ClipReveal className={`relative overflow-hidden rounded-[28px] bg-[var(--ap-mist)] ${className}`}>
        <EvImage src={m.url} alt={m.alt ?? ""} fill sizes={sizes} quality={80} priority={priority} className="object-cover" />
      </ClipReveal>
      {m.caption ? <figcaption className="ap-small ap-muted px-1">{m.caption}</figcaption> : null}
    </figure>
  );
}

function Intro({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const s = (section.settings ?? {}) as GrandeurSettings;
  const highlights = s.highlights ?? [];
  const gallery = bundle.media.filter((m) => m.kind === "image" && m.in_gallery);
  const lead = gallery.find((m) => m.featured) ?? gallery[0];
  const rest = gallery.filter((m) => m !== lead);
  return (
    <>
      <section id="o-evento" className="ap-section">
        <div className="ap-wrap">
          <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            {section.eyebrow ? <p className="ap-kicker ap-kicker-accent">{section.eyebrow}</p> : null}
            {section.title ? <h2 className="ap-hero-title">{section.title}</h2> : null}
            {section.body ? <p className="ap-lead max-w-2xl">{section.body}</p> : null}
          </Reveal>
        </div>
        {lead ? (
          <div className="ap-wrap ap-wide mt-12 md:mt-16">
            <Photo m={lead} className="aspect-[4/3] sm:aspect-[21/9]" sizes="(min-width: 1240px) 1200px, 100vw" />
          </div>
        ) : null}
      </section>
      {highlights.length ? (
        <section className="ap-band ap-section" aria-label="Destaques do musical">
          <div className="ap-wrap ap-wide">
            {s.statement ? (
              <Reveal className="mb-10 max-w-3xl md:mb-14">
                <p className="ap-h2">{s.statement}</p>
              </Reveal>
            ) : null}
            <ul className={`grid gap-5 ${highlights.length % 3 === 0 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
              {highlights.map((h, i) => (
                <Reveal as="li" key={h.title} delay={i * 0.06} className="ap-card flex min-h-[220px] flex-col justify-between gap-10">
                  <p className="ap-fine tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                  <div className="flex flex-col gap-3">
                    <h3 className="ap-h3">{h.title}</h3>
                    {h.description ? <p className="ap-body ap-muted">{h.description}</p> : null}
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      {rest.length ? (
        <section className="ap-section" aria-label="Galeria">
          <div className="ap-wrap ap-wide">
            {s.gallery_title ? (
              <Reveal className="mb-10 flex flex-col gap-3 md:mb-14">
                <h2 className="ap-h2 max-w-3xl">{s.gallery_title}</h2>
              </Reveal>
            ) : null}
            <div className="grid gap-5 md:grid-cols-2">
              {rest.map((m, i) => {
                const wide = rest.length % 2 === 1 && i === rest.length - 1;
                return (
                  <div key={m.id} className={wide ? "md:col-span-2" : ""}>
                    <Photo m={m} className={wide ? "aspect-[4/3] sm:aspect-[21/9]" : "aspect-[16/10]"} sizes={wide ? "(min-width: 1240px) 1200px, 100vw" : "(min-width: 768px) 600px, 100vw"} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

/* ---------- Faixa de imagem ---------- */
function Strip({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full overflow-hidden bg-[#13171D]">
      <EvImage src={src} alt={alt} width={2000} height={317} sizes="100vw" quality={85} className="block h-auto min-h-[180px] w-full object-cover object-left" />
    </div>
  );
}

/* ---------- Datas ---------- */
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

function Stat({ label, value, unit, note, source, tone }: { label: string; value: number; unit?: string | null; note?: string | null; source?: string | null; tone: "ink" | "mist" }) {
  const c = compactNumber(value);
  return (
    <Reveal className={`ap-card flex flex-col justify-between gap-10 ${tone === "ink" ? "ap-card-ink" : "ap-card-mist"}`}>
      <p className={`ap-small ${tone === "ink" ? "text-[#a1a1a6]" : "ap-muted"}`}>{label}</p>
      <div>
        <p className="font-[family-name:var(--ap-display)] text-[clamp(64px,9vw,120px)] font-semibold leading-[0.9] tracking-[-0.03em] tabular-nums">
          {value >= 1000 ? "+" : ""}{c.number}
          {c.suffix ? <span className="ml-2 text-[0.4em] tracking-[-0.01em]">{c.suffix}</span> : null}
        </p>
        {unit ? <p className="ap-h3 mt-2">{unit}</p> : null}
        {note ? <p className={`ap-body mt-3 ${tone === "ink" ? "text-[#a1a1a6]" : "ap-muted"}`}>{note}</p> : null}
      </div>
      {source ? <p className="ap-fine">{source}</p> : null}
    </Reveal>
  );
}

function Dates({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const { event } = bundle;
  const list = days(event.starts_on, event.ends_on);
  const actual = bundle.metrics.filter((m) => m.kind === "actual" && Number(m.value) >= 10);
  const projection = bundle.metrics.filter((m) => m.kind === "projection");
  const stats = [...actual.map((m) => ({ m, tone: "ink" as const })), ...projection.map((m) => ({ m, tone: "mist" as const }))];
  if (!list.length && !stats.length) return null;
  return (
    <section id="numeros" className="ap-section">
      <div className="ap-wrap ap-wide">
        <Head kicker={section.eyebrow} title={section.title} body={section.body} />
        {stats.length ? (
          <div className={`mt-12 grid gap-5 md:mt-16 ${stats.length > 1 ? "md:grid-cols-2" : ""}`}>
            {stats.map(({ m, tone }) => (
              <Stat
                key={m.id}
                tone={tone}
                label={m.kind === "projection" ? `Expectativa · ${m.period ?? ""}` : `${m.label}${m.period ? ` · ${m.period}` : ""}`}
                value={Number(m.value)}
                unit={m.unit}
                note={m.description}
                source={m.source ? `${m.kind === "projection" ? "Projeção" : "Fonte"}: ${m.source}` : null}
              />
            ))}
          </div>
        ) : null}
        {list.length ? (
          <ul className={`mt-5 grid grid-cols-2 gap-5 ${list.length >= 4 ? "md:grid-cols-4" : ""}`}>
            {list.map((d, i) => (
              <Reveal as="li" key={d.toISOString()} delay={i * 0.05} className="ap-card ap-card-mist flex flex-col gap-1">
                <p className="ap-small ap-muted first-letter:uppercase">{WEEKDAY.format(d)}</p>
                <p className="font-[family-name:var(--ap-display)] text-[clamp(48px,6vw,72px)] font-semibold leading-none tracking-[-0.02em] tabular-nums">{d.getUTCDate()}</p>
                <p className="ap-small">{MONTH.format(d)}</p>
              </Reveal>
            ))}
          </ul>
        ) : null}
        {event.venue || bundle.look?.address ? (
          <Reveal className="mt-5 flex flex-col justify-between gap-6 rounded-[28px] bg-[var(--ap-mist)] p-7 md:flex-row md:items-center md:p-10">
            <div className="max-w-2xl">
              <p className="ap-h3">{event.venue}</p>
              <p className="ap-body ap-muted mt-1">{bundle.look?.address ?? [event.city, event.state].filter(Boolean).join(", ")}</p>
              {bundle.look?.venueNote ? <p className="ap-body mt-4">{bundle.look.venueNote}</p> : null}
            </div>
            <TrackedLink href="#interesse" event="cta_click" label="datas_patrocinar" className="ap-pill shrink-0 self-start md:self-auto">Quero patrocinar</TrackedLink>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

/* ---------- Oportunidades ---------- */
function OpportunityCard({ o, wide }: { o: OpportunityRow; wide?: boolean }) {
  return (
    <article className={`ap-card flex flex-col gap-6 ${wide ? "md:col-span-2 md:grid md:grid-cols-[1fr_1fr] md:gap-12" : ""}`}>
      <div className="flex flex-col gap-3">
        <h3 className={wide ? "ap-h2" : "ap-h3"}>{o.title}</h3>
        {o.description ? <p className="ap-body ap-muted">{o.description}</p> : null}
      </div>
      <div className="flex flex-col justify-between gap-6">
        {o.deliverables.length ? (
          <ul className="flex flex-col gap-2.5 ap-body">
            {o.deliverables.map((d) => <li key={d} className="ap-check">{d}</li>)}
          </ul>
        ) : null}
        <TrackedLink href="#interesse" event="cta_click" label={`oportunidade:${o.title}`} className="ap-link ap-body self-start">
          Tenho interesse ›
        </TrackedLink>
      </div>
    </article>
  );
}

function Opportunities({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const items = bundle.opportunities.filter((o) => o.enabled);
  if (!items.length) return null;
  const [first, ...rest] = items;
  // Primeiro cartão largo; os demais em pares. Com sobra ímpar, o último também ocupa a linha toda.
  const lastWide = rest.length % 2 === 1;
  return (
    <section id="oportunidades" className="ap-band ap-section">
      <div className="ap-wrap ap-wide">
        <Head kicker={section.eyebrow} title={section.title} body={section.body} />
        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2">
          <Reveal className="contents"><OpportunityCard o={first} wide /></Reveal>
          {rest.map((o, i) => (
            <Reveal key={o.id} delay={(i % 2) * 0.06} className={lastWide && i === rest.length - 1 ? "md:col-span-2" : ""}>
              <OpportunityCard o={o} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Cotas ---------- */
function Tier({ t }: { t: TierRow }) {
  const left = t.quantity_total == null ? null : Math.max(t.quantity_total - t.quantity_sold, 0);
  const soldOut = left === 0;
  return (
    <article className={`ap-card flex h-full flex-col gap-8 ${t.highlight ? "ap-card-ink" : "ap-card-mist"} ${soldOut ? "opacity-60" : ""}`}>
      <div className="flex flex-col gap-2">
        {t.highlight ? <p className="ap-fine" style={{ color: "#f0c79c" }}>Destaque</p> : <p className="ap-fine">&nbsp;</p>}
        <h3 className="font-[family-name:var(--ap-display)] text-[32px] font-semibold leading-tight tracking-[-0.01em]">{t.name}</h3>
        {t.tagline ? <p className={`ap-body ${t.highlight ? "text-[#a1a1a6]" : "ap-muted"}`}>{t.tagline}</p> : null}
      </div>
      <p className="ap-h3">{t.show_price && t.price != null ? formatCurrency(Number(t.price), t.currency) : "Sob consulta"}</p>
      {t.deliverables.length ? (
        <ul className="flex flex-col gap-2.5 ap-small">
          {t.deliverables.map((d) => <li key={d} className="ap-check">{d}</li>)}
        </ul>
      ) : null}
      {t.benefits.length ? <p className={`ap-fine ${t.highlight ? "" : ""}`}>{t.benefits.join(" · ")}</p> : null}
      <div className="mt-auto">
        {left != null ? <p className="ap-fine mb-3">{soldOut ? "Cota comercializada" : `${left} de ${t.quantity_total} disponíveis`}</p> : null}
        {soldOut ? null : (
          <TrackedLink href="#interesse" event="cta_click" label={`cota:${t.name}`} tierId={t.id} className={`ap-pill w-full ${t.highlight ? "" : ""}`}>
            Tenho interesse
          </TrackedLink>
        )}
      </div>
    </article>
  );
}

function Tiers({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const s = (section.settings ?? {}) as TiersSettings;
  const tiers = bundle.tiers.filter((t) => t.enabled);
  if (!tiers.length) return null;
  const cols = tiers.length >= 4 ? "lg:grid-cols-4" : tiers.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <section id="cotas" className="ap-section">
      <TiersViewTracker />
      <div className="ap-wrap ap-wide">
        <Head kicker={section.eyebrow} title={section.title} body={section.body} />
        <ul className={`mt-12 grid gap-5 sm:grid-cols-2 md:mt-16 ${cols}`}>
          {tiers.map((t, i) => (
            <Reveal as="li" key={t.id} delay={i * 0.05}><Tier t={t} /></Reveal>
          ))}
        </ul>
        {s.note ? <p className="ap-fine mx-auto mt-8 max-w-2xl text-center">{s.note}</p> : null}
      </div>
    </section>
  );
}

/* ---------- Chamada final + formulário ---------- */
function Cta({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const { event, tiers } = bundle;
  const s = (section.settings ?? {}) as CtaSettings;
  return (
    <section id="interesse" className="ap-band ap-section">
      <div className="ap-wrap">
        <Head kicker={section.eyebrow} title={section.title} body={section.body} />
        <Reveal className="ap-card mx-auto mt-12 max-w-3xl md:mt-16">
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
        </Reveal>
        {event.deck_enabled ? (
          <p className="ap-body mt-8 text-center">
            Prefere ler com calma?{" "}
            <TrackedLink href="/apresentacao.pdf" event="deck_download" label="deck_pdf" target="_blank" className="ap-link">
              Baixe a apresentação em PDF ›
            </TrackedLink>
          </p>
        ) : null}
      </div>
    </section>
  );
}

/* ---------- Rodapé ---------- */
function Footer({ bundle, section }: { bundle: EventBundle; section?: SectionRow }) {
  const { event } = bundle;
  const copyright = (section?.settings as { copyright?: string } | undefined)?.copyright;
  return (
    <footer id="contato" className="ap-band border-t border-[var(--ap-hairline)] pb-28 pt-10 md:pb-12">
      <div className="ap-wrap ap-wide">
        <div className="border-b border-[var(--ap-hairline)] pb-6">
          <p className="ap-fine max-w-3xl">{event.organizer_about}</p>
        </div>
        <div className="flex flex-col gap-3 pt-5 md:flex-row md:items-center md:justify-between">
          <p className="ap-fine">{copyright || `© ${new Date().getFullYear()} ${event.organizer_name ?? event.name}`}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><a className="ap-fine hover:underline" href="/privacidade">Política de privacidade</a></li>
            <li><button type="button" data-consent-open className="ap-fine hover:underline">Preferências de cookies</button></li>
            {event.deck_enabled ? <li><a className="ap-fine hover:underline" href="/apresentacao.pdf" target="_blank">Apresentação em PDF</a></li> : null}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function AppleBody({ bundle, sections }: { bundle: EventBundle; sections: SectionRow[] }) {
  const footer = bundle.sections.find((s) => s.type === "footer");
  return (
    <div className="ap">
      {sections.map((s) => {
        switch (s.type) {
          case "grandeur": return <Intro key={s.id} bundle={bundle} section={s} />;
          case "metrics": return <Dates key={s.id} bundle={bundle} section={s} />;
          case "opportunities": return <Opportunities key={s.id} bundle={bundle} section={s} />;
          case "tiers": return <Tiers key={s.id} bundle={bundle} section={s} />;
          case "cta": return (
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
