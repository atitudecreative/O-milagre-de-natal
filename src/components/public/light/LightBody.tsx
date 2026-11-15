import type { CtaSettings, EventBundle, GrandeurSettings, MediaRow, MetricRow, OpportunityRow, SectionRow, TierRow, TiersSettings } from "@/lib/types";
import { compactNumber, formatCurrency } from "@/lib/format";
import { ArchOrnament } from "../ArchOrnament";
import { EvImage } from "../EvImage";
import { LeadForm } from "../LeadForm";
import { ClipReveal, Reveal } from "../Reveal";
import { TrackedLink } from "../TrackedLink";
import { TiersViewTracker } from "../sections/TiersViewTracker";

/**
 * Corpo da página em estética clara e editorial: fotos em tela cheia, réguas
 * finas no lugar de cartões e títulos na tipografia da arte.
 */

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function Header({ eyebrow, title, body, align = "split" }: { eyebrow?: string | null; title?: string | null; body?: string | null; align?: "split" | "center" }) {
  if (align === "center") {
    return (
      <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        {eyebrow ? <p className="lt-eyebrow lt-eyebrow-center">{eyebrow}</p> : null}
        {title ? <h2 className="lt-display lt-title">{title}</h2> : null}
        {body ? <p className="lt-lead max-w-2xl">{body}</p> : null}
      </Reveal>
    );
  }
  return (
    <div className="grid gap-8 md:grid-cols-12 md:gap-10">
      <Reveal className="flex flex-col gap-6 md:col-span-8">
        {eyebrow ? <p className="lt-eyebrow">{eyebrow}</p> : null}
        {title ? <h2 className="lt-display lt-title">{title}</h2> : null}
      </Reveal>
      {body ? (
        <Reveal delay={0.1} className="md:col-span-4 md:self-end">
          <p className="lt-lead">{body}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

function Figure({ m, className, sizes, bleed }: { m: MediaRow; className: string; sizes: string; bleed?: boolean }) {
  return (
    <figure className="flex flex-col gap-3">
      <ClipReveal className={`relative overflow-hidden bg-[var(--lt-band)] ${className}`}>
        <EvImage src={m.url} alt={m.alt ?? ""} fill sizes={sizes} quality={80} className="object-cover" />
      </ClipReveal>
      {m.caption || m.credit ? (
        <figcaption className={`flex items-baseline justify-between gap-6 ${bleed ? "lt-wrap" : ""}`}>
          <span className="lt-small text-[var(--lt-muted)]">{m.caption}</span>
          {m.credit ? <span className="lt-fine shrink-0">Foto: {m.credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* ---------- O musical ---------- */
function Intro({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const s = (section.settings ?? {}) as GrandeurSettings;
  const gallery = bundle.media.filter((m) => m.kind === "image" && m.in_gallery);
  const lead = gallery.find((m) => m.featured) ?? gallery[0];
  const rest = gallery.filter((m) => m !== lead);
  const highlights = s.highlights ?? [];
  const [g1, g2, g3, ...more] = rest;

  return (
    <>
      <section id="o-evento" className="lt-section pb-0">
        <div className="lt-wrap">
          <Header eyebrow={section.eyebrow} title={section.title} body={section.body} align="center" />
        </div>
        {lead ? (
          <div className="mt-14 md:mt-20">
            <Figure m={lead} bleed className="aspect-[4/3] sm:aspect-[21/9]" sizes="100vw" />
          </div>
        ) : null}
      </section>

      {s.statement || highlights.length ? (
        <section className="lt-section relative overflow-hidden" aria-label="Por que patrocinar">
          <ArchOrnament className="pointer-events-none absolute left-1/2 top-8 h-[min(80vh,760px)] w-auto -translate-x-1/2 text-[var(--lt-copper-cta)] opacity-[0.14]" />
          <div className="lt-wrap relative">
            {s.statement ? (
              <Reveal className="mx-auto max-w-4xl text-center">
                <p className="lt-display lt-quote">{s.statement}</p>
              </Reveal>
            ) : null}
            {highlights.length ? (
              <ol className="mt-16 grid border-t lt-rule md:mt-24 md:grid-cols-3">
                {highlights.map((h, i) => (
                  <Reveal as="li" key={h.title} delay={i * 0.08} className={`flex flex-col gap-4 border-b lt-rule py-9 md:border-b-0 md:px-10 md:py-12 ${i > 0 ? "md:border-l" : "md:pl-0"} ${i === highlights.length - 1 ? "md:pr-0" : ""}`}>
                    <span className="lt-num text-4xl lt-copper">{ROMAN[i]}</span>
                    <h3 className="lt-display text-2xl">{h.title}</h3>
                    {h.description ? <p className="lt-body">{h.description}</p> : null}
                  </Reveal>
                ))}
              </ol>
            ) : null}
          </div>
        </section>
      ) : null}

      {g1 ? (
        <section className="lt-section pt-0" aria-label="Galeria">
          {s.gallery_title ? (
            <div className="lt-wrap mb-12 md:mb-16">
              <Header eyebrow="Galeria" title={s.gallery_title} />
            </div>
          ) : null}
          <Figure m={g1} bleed className="aspect-[4/3] sm:aspect-[21/9]" sizes="100vw" />
          {g2 || g3 ? (
            <div className="lt-wrap mt-10 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-8">
              {g2 ? <div className="md:col-span-5"><Figure m={g2} className="aspect-[4/3]" sizes="(min-width: 768px) 520px, 100vw" /></div> : null}
              {g3 ? <div className="md:col-span-7 md:mt-32"><Figure m={g3} className="aspect-[16/10]" sizes="(min-width: 768px) 740px, 100vw" /></div> : null}
            </div>
          ) : null}
          {more.length ? (
            <div className="lt-wrap mt-10 grid gap-10 md:mt-16">
              {more.map((m) => <Figure key={m.id} m={m} className="aspect-[16/9]" sizes="(min-width: 1280px) 1240px, 100vw" />)}
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}

/* ---------- Números e sessões ---------- */
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

function Figure2({ m, i }: { m: MetricRow; i: number }) {
  const c = compactNumber(Number(m.value));
  const projection = m.kind === "projection";
  return (
    <Reveal delay={i * 0.08} className={`flex flex-col gap-6 border-t lt-rule py-10 md:py-14 ${i > 0 ? "md:border-l md:pl-12" : "md:pr-12"}`}>
      <p className={`lt-label ${projection ? "lt-copper" : ""}`}>{projection ? `Expectativa ${m.period ?? ""}` : `${m.label} ${m.period ?? ""}`}</p>
      <p className="lt-num text-[clamp(72px,11vw,156px)]">
        {Number(m.value) >= 1000 ? "+" : ""}{c.number}
        {c.suffix ? <span className="ml-3 text-[0.36em]">{c.suffix}</span> : null}
      </p>
      <div className="flex flex-col gap-2">
        {m.unit ? <p className="lt-display text-xl md:text-2xl">{m.unit}</p> : null}
        {m.description ? <p className="lt-body">{m.description}</p> : null}
      </div>
      {m.source ? <p className="lt-fine">{projection ? "Projeção" : "Fonte"}: {m.source}</p> : null}
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
    <section id="numeros" className="lt-band lt-section">
      <div className="lt-wrap">
        <Header eyebrow={section.eyebrow} title={section.title} body={section.body} />
        {stats.length ? (
          <div className={`mt-14 grid md:mt-20 ${stats.length > 1 ? "md:grid-cols-2" : ""}`}>
            {stats.map((m, i) => <Figure2 key={m.id} m={m} i={i} />)}
          </div>
        ) : null}
        {list.length ? (
          <div className="mt-6 border-t lt-rule pt-10 md:mt-10">
            <p className="lt-label mb-6">Sessões</p>
            <ol className="grid grid-cols-2 md:grid-cols-4">
              {list.map((d, i) => (
                <Reveal as="li" key={d.toISOString()} delay={i * 0.05} className={`flex flex-col gap-2 border-b lt-rule py-6 md:border-b-0 md:py-2 ${i > 0 ? "md:border-l md:pl-8" : ""} ${i % 2 ? "border-l pl-6 md:pl-8" : ""}`}>
                  <span className="lt-small text-[var(--lt-muted)] first-letter:uppercase">{WEEKDAY.format(d)}</span>
                  <span className="lt-num text-[clamp(56px,7vw,96px)]">{d.getUTCDate()}</span>
                  <span className="lt-small">{MONTH.format(d)}</span>
                </Reveal>
              ))}
            </ol>
          </div>
        ) : null}
        {event.venue || bundle.look?.address ? (
          <Reveal className="mt-10 grid gap-6 border-t lt-rule pt-10 md:mt-16 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="lt-display text-2xl md:text-3xl">{event.venue}</p>
              <p className="lt-body mt-2">{bundle.look?.address ?? [event.city, event.state].filter(Boolean).join(", ")}</p>
              {bundle.look?.venueNote ? <p className="lt-body mt-4 max-w-2xl text-[var(--lt-ink)]">{bundle.look.venueNote}</p> : null}
            </div>
            <div className="md:col-span-4 md:text-right">
              <TrackedLink href="#interesse" event="cta_click" label="sessoes_patrocinar" className="lt-btn">Quero patrocinar</TrackedLink>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

/* ---------- Oportunidades ---------- */
function Opportunity({ o, i }: { o: OpportunityRow; i: number }) {
  return (
    <Reveal as="li" className="grid gap-5 border-b lt-rule py-10 md:grid-cols-12 md:gap-8 md:py-12">
      <span className="lt-num text-3xl lt-copper md:col-span-1">{ROMAN[i]}</span>
      <h3 className="lt-display text-[clamp(26px,2.6vw,36px)] md:col-span-4">{o.title}</h3>
      <div className="flex flex-col gap-5 md:col-span-4">
        {o.description ? <p className="lt-body">{o.description}</p> : null}
        <TrackedLink href="#interesse" event="cta_click" label={`oportunidade:${o.title}`} className="lt-link self-start">Tenho interesse <span aria-hidden>→</span></TrackedLink>
      </div>
      {o.deliverables.length ? (
        <ul className="flex flex-col gap-2.5 lt-small md:col-span-3">
          {o.deliverables.map((d) => <li key={d} className="lt-dot">{d}</li>)}
        </ul>
      ) : null}
    </Reveal>
  );
}

function Opportunities({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const items = bundle.opportunities.filter((o) => o.enabled);
  if (!items.length) return null;
  return (
    <section id="oportunidades" className="lt-section">
      <div className="lt-wrap">
        <Header eyebrow={section.eyebrow} title={section.title} body={section.body} />
        <ol className="mt-14 border-t lt-rule md:mt-20">
          {items.map((o, i) => <Opportunity key={o.id} o={o} i={i} />)}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Cotas ---------- */
function Tier({ t, i, count }: { t: TierRow; i: number; count: number }) {
  const left = t.quantity_total == null ? null : Math.max(t.quantity_total - t.quantity_sold, 0);
  const soldOut = left === 0;
  const hl = t.highlight;
  return (
    <Reveal
      as="article"
      delay={i * 0.06}
      className={`flex h-full flex-col gap-8 p-8 md:p-10 ${hl ? "bg-[var(--lt-ink)] text-white" : `border-t lt-rule ${i > 0 ? "md:border-l" : ""} ${i < count - 1 ? "" : ""}`} ${soldOut ? "opacity-60" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className={`lt-label ${hl ? "!text-[#e2b88c]" : ""}`}>Cota {String(i + 1).padStart(2, "0")}</p>
        {hl ? <p className="lt-label !text-[#e2b88c]">Mais completa</p> : null}
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="lt-display text-[clamp(36px,3.6vw,52px)]">{t.name}</h3>
        {t.tagline ? <p className={`lt-body ${hl ? "!text-[#b9bcc2]" : ""}`}>{t.tagline}</p> : null}
      </div>
      <div className={`border-y py-6 ${hl ? "border-white/15" : "lt-rule"}`}>
        <p className={`lt-label ${hl ? "!text-[#b9bcc2]" : ""}`}>Investimento</p>
        <p className="lt-num mt-3 text-[clamp(36px,3.4vw,48px)]">{t.show_price && t.price != null ? formatCurrency(Number(t.price), t.currency) : "Sob consulta"}</p>
      </div>
      {t.deliverables.length ? (
        <ul className={`flex flex-col gap-3 lt-small ${hl ? "text-[#e6e7ea]" : ""}`}>
          {t.deliverables.map((d) => <li key={d} className="lt-dot">{d}</li>)}
        </ul>
      ) : null}
      <div className="mt-auto pt-2">
        {left != null ? <p className="lt-fine mb-3">{soldOut ? "Cota comercializada" : `${left} de ${t.quantity_total} disponíveis`}</p> : null}
        {soldOut ? null : (
          <TrackedLink href="#interesse" event="cta_click" label={`cota:${t.name}`} tierId={t.id} className={`lt-btn w-full ${hl ? "lt-btn-copper" : ""}`}>
            Tenho interesse
          </TrackedLink>
        )}
      </div>
    </Reveal>
  );
}

function Tiers({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const s = (section.settings ?? {}) as TiersSettings;
  const tiers = bundle.tiers.filter((t) => t.enabled);
  if (!tiers.length) return null;
  const cols = tiers.length >= 4 ? "lg:grid-cols-4" : tiers.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <section id="cotas" className="lt-band lt-section">
      <TiersViewTracker />
      <div className="lt-wrap">
        <Header eyebrow={section.eyebrow} title={section.title} body={section.body} />
        <div className={`mt-14 grid border-b lt-rule md:mt-20 md:grid-cols-2 ${cols}`}>
          {tiers.map((t, i) => <Tier key={t.id} t={t} i={i} count={tiers.length} />)}
        </div>
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
  return (
    <section id="interesse" className="lt-section">
      <div className="lt-wrap lt-narrow">
        <Header eyebrow={section.eyebrow} title={section.title} body={section.body} align="center" />
        <Reveal className="mt-14 md:mt-20">
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
          <p className="lt-body mt-12 text-center">
            Prefere ler com calma?{" "}
            <TrackedLink href="/apresentacao.pdf" event="deck_download" label="deck_pdf" target="_blank" className="lt-link">
              Baixe a apresentação em PDF
            </TrackedLink>
          </p>
        ) : null}
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
          <p className="lt-display text-2xl">{event.name}</p>
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
