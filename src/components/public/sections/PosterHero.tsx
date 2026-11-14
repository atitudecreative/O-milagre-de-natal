import type { EventBundle, EventLook, HeroSettings, SectionRow } from "@/lib/types";
import { eventDateLabel } from "@/lib/format";
import { EvImage } from "../EvImage";
import { TrackedLink } from "../TrackedLink";

/**
 * Abertura com a arte oficial do evento. O título já está na imagem, então o
 * h1 fica acessível (leitores de tela/SEO) sem duplicar o texto na tela.
 */
export function PosterHero({ bundle, section, poster }: { bundle: EventBundle; section: SectionRow; poster: NonNullable<EventLook["posterHero"]> }) {
  const { event } = bundle;
  const s = (section.settings ?? {}) as HeroSettings;
  const date = eventDateLabel(event.starts_on, event.ends_on, event.date_label);
  const place = [event.venue, [event.city, event.state].filter(Boolean).join(" · ")].filter(Boolean).join(" — ");

  return (
    <section id="inicio" aria-label={event.name} className="relative isolate">
      <h1 className="sr-only">{section.title || event.name}{event.tagline ? ` — ${event.tagline}` : ""}</h1>

      <div className="relative pt-16 md:pt-0">
        <picture>
          {poster.mobile ? <source media="(max-width: 767px)" srcSet={poster.mobile} /> : null}
          <EvImage
            src={poster.desktop}
            alt={poster.alt}
            width={poster.width}
            height={poster.height}
            priority
            sizes="100vw"
            quality={85}
            className="block h-auto w-full animate-[fade_1.4s_ease_both]"
          />
        </picture>
        {/* funde a arte ao fundo da página */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4" style={{ background: "linear-gradient(to top, var(--ev-bg), transparent)" }} />
      </div>

      <div className="ev-container relative -mt-6 pb-16 md:-mt-10 md:pb-24">
        <div className="flex flex-col items-center gap-8 text-center animate-[rise_1.1s_var(--ease-out-expo)_0.3s_both]">
          {event.short_description ? (
            <p className="max-w-2xl text-base leading-relaxed text-[var(--ev-fg)]/85 md:text-lg">{event.short_description}</p>
          ) : null}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <TrackedLink href="#interesse" event="cta_click" label="hero_patrocinador" className="ev-btn">
              {s.primary_label || "Quero ser patrocinador"}
              <span className="ev-btn-arrow" aria-hidden>→</span>
            </TrackedLink>
            <TrackedLink href="#o-evento" event="cta_click" label="hero_conheca" className="ev-btn ev-btn-ghost">
              {s.secondary_label || "Conheça o projeto"}
            </TrackedLink>
          </div>
          {date || place ? (
            <dl className="grid w-full max-w-3xl grid-cols-1 gap-4 border-t border-[var(--ev-line)] pt-6 text-center sm:grid-cols-2">
              {date ? (
                <div>
                  <dt className="ev-micro uppercase tracking-[0.2em]">Quando</dt>
                  <dd className="mt-1 text-sm font-medium md:text-base">{date}</dd>
                </div>
              ) : null}
              {place ? (
                <div>
                  <dt className="ev-micro uppercase tracking-[0.2em]">Onde</dt>
                  <dd className="mt-1 text-sm font-medium md:text-base">{place}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
