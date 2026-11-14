import type { EventBundle, HeroSettings, SectionRow } from "@/lib/types";
import { editionLabel, eventDateLabel } from "@/lib/format";
import { EvImage } from "../EvImage";
import { TrackedLink } from "../TrackedLink";
import { HeroVideo } from "./HeroVideo";

function SplitWords({ text }: { text: string }) {
  return (
    <span className="ev-split" aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden style={{ ["--i" as string]: i }}>
          {w}
          {" "}
        </span>
      ))}
    </span>
  );
}

export function Hero({ bundle, section }: { bundle: EventBundle; section: SectionRow }) {
  const { event, branding } = bundle;
  const s = (section.settings ?? {}) as HeroSettings;
  const align = s.align ?? "left";
  const vertical = s.vertical ?? "bottom";
  const height = s.height ?? "screen";
  const overlay = s.overlay ?? 0.45;
  const size = s.title_size ?? "xl";
  const desktop = s.image_desktop ?? null;
  const mobile = s.image_mobile ?? desktop;
  const place = [event.venue, [event.city, event.state].filter(Boolean).join(" · ")].filter(Boolean).join(" — ");
  const date = eventDateLabel(event.starts_on, event.ends_on, event.date_label);
  const edition = editionLabel(event.edition_number, event.edition_label);

  const heightClass = height === "screen" ? "min-h-[100svh]" : height === "tall" ? "min-h-[88svh]" : "min-h-[70svh]";
  const justify = vertical === "top" ? "justify-start pt-36" : vertical === "center" ? "justify-center" : "justify-end";
  const alignClass = align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";
  const titleSize =
    size === "xl" ? "text-[clamp(3.6rem,13.5vw,15rem)]" : size === "lg" ? "text-[clamp(3rem,10vw,10.5rem)]" : "text-[clamp(2.6rem,7vw,7rem)]";

  return (
    <section
      id="inicio"
      aria-label={event.name}
      className={`relative isolate flex ${heightClass} flex-col overflow-hidden`}
      style={s.text_color ? { color: s.text_color } : undefined}
    >
      {/* Mídia de fundo: imagem desktop/mobile + vídeo opcional */}
      <div className="absolute inset-0 -z-10 bg-[var(--ev-secondary)]">
        {desktop ? (
          <>
            <EvImage src={desktop} alt="" fill priority sizes="100vw" quality={75} className={`object-cover ${mobile && mobile !== desktop ? "hidden md:block" : ""} animate-[fade_1.6s_ease_both] scale-[1.04]`} />
            {mobile && mobile !== desktop ? (
              <EvImage src={mobile} alt="" fill priority sizes="100vw" quality={75} className="object-cover md:hidden animate-[fade_1.6s_ease_both]" />
            ) : null}
          </>
        ) : null}
        {s.video_url ? <HeroVideo src={s.video_url} poster={s.video_poster ?? desktop ?? undefined} /> : null}
        <div className="absolute inset-0" style={{ background: "var(--ev-bg)", opacity: overlay }} />
        <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "linear-gradient(to top, var(--ev-bg), transparent)" }} />
      </div>

      <div className={`ev-container relative flex flex-1 flex-col ${justify} pb-14 md:pb-20`}>
        <div className={`flex flex-col ${alignClass} gap-7`}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 animate-[rise_1s_var(--ease-out-expo)_both]" style={{ justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start" }}>
            {edition ? (
              <span className="inline-flex items-center gap-2 rounded-[var(--ev-radius)] border border-[var(--ev-line-strong)] px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ev-accent)]" />
                {edition}
              </span>
            ) : null}
            {event.tagline ? <span className="ev-eyebrow !text-[var(--ev-fg)]/80">{event.tagline}</span> : null}
          </div>

          {branding.logo_url && s.show_logo ? (
            <EvImage src={branding.logo_url} alt={event.name} width={360} height={160} className="h-auto max-h-28 w-auto max-w-[70vw] object-contain" priority />
          ) : null}

          <h1 className={`ev-display ${titleSize} max-w-[14ch]`}>
            <SplitWords text={section.title || event.name} />
          </h1>

          {event.short_description ? (
            <p className="max-w-xl text-base leading-relaxed text-[var(--ev-fg)]/85 md:text-lg animate-[rise_1.2s_var(--ease-out-expo)_0.5s_both]">
              {event.short_description}
            </p>
          ) : null}

          <div className={`flex w-full flex-col gap-3 sm:w-auto sm:flex-row ${align === "center" ? "sm:justify-center" : align === "right" ? "sm:justify-end" : ""} animate-[rise_1.2s_var(--ease-out-expo)_0.65s_both]`}>
            <TrackedLink href="#interesse" event="cta_click" label="hero_patrocinador" className="ev-btn">
              {s.primary_label || "Quero ser patrocinador"}
              <span className="ev-btn-arrow" aria-hidden>→</span>
            </TrackedLink>
            <TrackedLink href="#numeros" event="cta_click" label="hero_conheca" className="ev-btn ev-btn-ghost">
              {s.secondary_label || "Conheça o projeto"}
            </TrackedLink>
          </div>
        </div>

        {/* Linha de meta-informação: data · local */}
        {(date || place) && (
          <dl className="mt-14 grid grid-cols-1 gap-4 border-t border-[var(--ev-line)] pt-5 text-left sm:grid-cols-3 md:mt-20 animate-[fade_1.4s_ease_0.9s_both]">
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
            {s.show_scroll_hint !== false ? (
              <div className="hidden items-end justify-end sm:flex">
                <a href="#numeros" className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-[var(--ev-muted)] hover:text-[var(--ev-fg)]">
                  Role para explorar
                  <span className="relative block h-9 w-px overflow-hidden bg-[var(--ev-line)]">
                    <span className="absolute inset-x-0 top-0 h-1/2 bg-[var(--ev-fg)] animate-[scrollhint_2s_ease-in-out_infinite]" />
                  </span>
                </a>
              </div>
            ) : null}
          </dl>
        )}
      </div>
      <style>{`@keyframes scrollhint{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
