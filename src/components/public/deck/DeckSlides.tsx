import type { CtaSettings, DeckSlide, EventBundle, HeroSettings, PanelSlide } from "@/lib/types";
import { EvImage } from "../EvImage";
import { LeadForm } from "../LeadForm";
import { TrackedLink } from "../TrackedLink";
import { TiersViewTracker } from "../sections/TiersViewTracker";
import { OpportunityShowcase } from "../light/OpportunityShowcase";
import { Ticket, days } from "../light/LightBody";
import { KitPanel } from "./KitPanel";
import { TierShowcase } from "./TierShowcase";
import { DeckController } from "./DeckController";

/**
 * A página como apresentação: cada slide ocupa a tela inteira e encaixa ao
 * rolar. Slides "image" mostram páginas prontas (ex.: do media kit) com zoom
 * lento; os demais são interativos (sessões, formatos, cotas e formulário).
 */

function Backdrop({ src, dim = 0.55 }: { src: string; dim?: number }) {
  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <EvImage src={src} alt="" fill sizes="50vw" quality={60} className="scale-110 object-cover blur-2xl" />
      <div className="absolute inset-0 bg-[#0b0d11]" style={{ opacity: dim }} />
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="lt-eyebrow deck-in" style={{ ["--d" as string]: 0 }}>{children}</p>;
}

function PosterSlide({ bundle, index }: { bundle: EventBundle; index: number }) {
  const { event } = bundle;
  const poster = bundle.look?.posterHero;
  const hero = bundle.sections.find((s) => s.type === "hero");
  const hs = (hero?.settings ?? {}) as HeroSettings;
  if (!poster) return null;
  return (
    <section id="inicio" data-slide={index} data-active="true" className="deck-slide flex min-h-svh flex-col bg-[#0b0d11]" aria-label={event.name}>
      <h1 className="sr-only">{event.name}{event.tagline ? ` — ${event.tagline}` : ""}</h1>
      <Backdrop src={poster.desktop} dim={0.5} />
      <picture className="deck-kb absolute inset-0">
        {poster.mobile ? <source media="(max-width: 767px)" srcSet={poster.mobile} /> : null}
        <EvImage src={poster.desktop} alt={poster.alt} fill priority sizes="100vw" quality={85} className="object-contain md:object-cover" />
      </picture>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0b0d11] to-transparent" />
      <div className="relative mt-auto flex flex-col items-center gap-4 px-5 pb-24 text-center md:pb-10">
        <div className="flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
          <TrackedLink href="#interesse" event="cta_click" label="hero_patrocinador" className="ev-btn">
            {hs.primary_label || "Quero ser patrocinador"} <span className="ev-btn-arrow" aria-hidden>→</span>
          </TrackedLink>
          <TrackedLink href="#o-evento" event="cta_click" label="hero_conheca" className="ev-btn ev-btn-ghost">
            {hs.secondary_label || "Conheça o projeto"}
          </TrackedLink>
        </div>
        <p className="hidden text-[11px] uppercase tracking-[0.24em] text-white/55 md:block">Role para conhecer o musical</p>
      </div>
    </section>
  );
}

function ImageSlide({ s, index }: { s: Extract<DeckSlide, { kind: "image" }>; index: number }) {
  return (
    <section id={s.id} data-slide={index} className="deck-slide bg-[#0b0d11] py-[7vh] md:py-[9vh]" aria-label={s.label}>
      <KitPanel src={s.src} alt={s.alt} index={index} label={s.label} text={s.text} />
      <div className="sr-only">
        <h2>{s.label}</h2>
        <p className="hidden md:block">{s.text}</p>
      </div>
    </section>
  );
}

function SessionsSlide({ bundle, s, index }: { bundle: EventBundle; s: PanelSlide; index: number }) {
  const { event } = bundle;
  const list = days(event.starts_on, event.ends_on);
  return (
    <section id={s.id} data-slide={index} className="deck-slide bg-[#171b22] py-[14vh]" aria-label={s.label}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(201,139,87,0.16),transparent_60%)]" />
      <div className="lt lt-dark w-full">
        <div className="lt-wrap">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="flex flex-col gap-5 md:col-span-7">
              <Eyebrow>{s.label}</Eyebrow>
              <h2 className="lt-display lt-title deck-in" style={{ ["--d" as string]: 1 }}>{s.title ?? "As sessões"}</h2>
            </div>
            {s.body ? <p className="lt-lead deck-in md:col-span-4 md:col-start-9" style={{ ["--d" as string]: 2 }}>{s.body}</p> : null}
          </div>
          <ol className={`mt-10 grid grid-cols-2 gap-3 md:mt-14 md:gap-4 ${list.length >= 4 ? "lg:grid-cols-4" : ""}`}>
            {list.map((d, i) => <Ticket key={d.toISOString()} d={d} i={i} total={list.length} event={event} />)}
          </ol>
          <div className="deck-in mt-8 flex flex-col justify-between gap-5 border-t lt-rule pt-6 md:flex-row md:items-center" style={{ ["--d" as string]: 4 }}>
            <div>
              <p className="lt-display text-xl md:text-2xl">{event.venue}</p>
              <p className="lt-body mt-1">{bundle.look?.address}</p>
            </div>
            <TrackedLink href="#interesse" event="cta_click" label="sessoes_patrocinar" className="lt-btn self-start md:self-auto">Quero patrocinar</TrackedLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function OpportunitiesSlide({ bundle, s, index }: { bundle: EventBundle; s: PanelSlide; index: number }) {
  const items = bundle.opportunities.filter((o) => o.enabled);
  if (!items.length) return null;
  return (
    <section id={s.id} data-slide={index} className="deck-slide bg-[#0f1217] py-[14vh]" aria-label={s.label}>
      <div className="lt lt-dark w-full">
        <div className="lt-wrap">
          <div className="mb-8 flex flex-col gap-4 md:mb-10">
            <Eyebrow>{s.label}</Eyebrow>
            <h2 className="lt-display lt-title-sm deck-in max-w-3xl" style={{ ["--d" as string]: 1 }}>{s.title}</h2>
          </div>
          <div className="deck-in" style={{ ["--d" as string]: 2 }}>
            <OpportunityShowcase items={items} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TiersSlide({ bundle, s, index }: { bundle: EventBundle; s: PanelSlide; index: number }) {
  const tiers = bundle.tiers.filter((t) => t.enabled);
  const settings = bundle.sections.find((x) => x.type === "tiers")?.settings as { note?: string } | undefined;
  if (!tiers.length) return null;
  return (
    <section id={s.id} data-slide={index} className="deck-slide bg-[#0b0d11] py-[14vh]" aria-label={s.label}>
      <TiersViewTracker />
      {s.bg ? <Backdrop src={s.bg} dim={0.82} /> : null}
      <div className="lt lt-dark w-full">
        <div className="lt-wrap">
          <div className="mb-8 grid gap-4 md:mb-10 md:grid-cols-12 md:items-end">
            <div className="flex flex-col gap-4 md:col-span-7">
              <Eyebrow>{s.label}</Eyebrow>
              <h2 className="lt-display lt-title-sm deck-in" style={{ ["--d" as string]: 1 }}>{s.title}</h2>
            </div>
            {s.body ? <p className="lt-body deck-in md:col-span-4 md:col-start-9" style={{ ["--d" as string]: 2 }}>{s.body}</p> : null}
          </div>
          <TierShowcase tiers={tiers} />
          {settings?.note ? <p className="lt-fine mt-4">{settings.note}</p> : null}
        </div>
      </div>
    </section>
  );
}

function FormSlide({ bundle, s, index }: { bundle: EventBundle; s: PanelSlide; index: number }) {
  const { event, tiers } = bundle;
  const cta = bundle.sections.find((x) => x.type === "cta");
  const cs = (cta?.settings ?? {}) as CtaSettings;
  return (
    <section id={s.id ?? "interesse"} data-slide={index} className="deck-slide flex flex-col bg-[#0f1217] pt-[14vh]" aria-label={s.label}>
      {s.bg ? <Backdrop src={s.bg} dim={0.8} /> : null}
      <div className="lt lt-dark w-full flex-1">
        <div className="lt-wrap grid gap-10 pb-16 md:grid-cols-12 md:gap-12">
          <div className="flex flex-col gap-6 md:col-span-5">
            <Eyebrow>{s.label}</Eyebrow>
            <h2 className="lt-display lt-title deck-in" style={{ ["--d" as string]: 1 }}>{s.title ?? cta?.title}</h2>
            {s.body ?? cta?.body ? <p className="lt-lead deck-in" style={{ ["--d" as string]: 2 }}>{s.body ?? cta?.body}</p> : null}
            <dl className="deck-in grid gap-5 border-t lt-rule pt-6" style={{ ["--d" as string]: 3 }}>
              <div>
                <dt className="lt-label">Sessões</dt>
                <dd className="lt-display mt-1 text-lg">{event.date_label}</dd>
              </div>
              {bundle.look?.address ? (
                <div>
                  <dt className="lt-label">Local</dt>
                  <dd className="lt-body mt-1 !text-[var(--lt-ink)]">{event.venue} · {bundle.look.address}</dd>
                </div>
              ) : null}
              {event.deck_enabled ? (
                <div>
                  <dt className="lt-label">Apresentação</dt>
                  <dd className="mt-2"><TrackedLink href="/apresentacao.pdf" event="deck_download" label="deck_pdf" target="_blank" className="lt-link">Baixar PDF</TrackedLink></dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div className="deck-in md:col-span-7" style={{ ["--d" as string]: 2 }}>
            <div className="border lt-rule bg-[var(--lt-band)]/80 p-6 backdrop-blur md:p-9">
              <LeadForm
                eventId={event.id}
                eventName={event.name}
                whatsapp={event.whatsapp}
                contactEmail={event.contact_email}
                tiers={tiers.filter((t) => t.enabled)}
                interests={event.form_interests}
                successMessage={event.form_success_message}
                buttonLabel={cs.button_label}
              />
            </div>
          </div>
        </div>
        <footer id="contato" className="border-t lt-rule pb-28 pt-8 md:pb-10">
          <div className="lt-wrap flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <p className="lt-fine">{(bundle.sections.find((x) => x.type === "footer")?.settings as { copyright?: string } | undefined)?.copyright ?? event.organizer_name}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 lt-fine">
              <li><a className="hover:underline" href="/privacidade">Política de privacidade</a></li>
              <li><button type="button" data-consent-open className="hover:underline">Preferências de cookies</button></li>
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
}

export function DeckSlides({ bundle }: { bundle: EventBundle }) {
  const slides = bundle.look?.slides ?? [];
  return (
    <>
      <DeckController />
      {slides.map((s, i) => {
        switch (s.kind) {
          case "poster": return <PosterSlide key={i} bundle={bundle} index={i} />;
          case "image": return <ImageSlide key={i} s={s} index={i} />;
          case "sessions": return <SessionsSlide key={i} bundle={bundle} s={s} index={i} />;
          case "opportunities": return <OpportunitiesSlide key={i} bundle={bundle} s={s} index={i} />;
          case "tiers": return <TiersSlide key={i} bundle={bundle} s={s} index={i} />;
          case "form": return <FormSlide key={i} bundle={bundle} s={s} index={i} />;
        }
      })}
    </>
  );
}
