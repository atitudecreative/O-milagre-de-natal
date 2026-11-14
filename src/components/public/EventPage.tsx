import type { EventBundle, SectionRow, SectionType } from "@/lib/types";
import { brandVars } from "@/lib/theme";
import { googleFontsHref } from "@/lib/fonts";
import { luminance } from "@/lib/color";
import { SECTION_ANCHOR, SECTION_LABEL } from "@/lib/labels";
import { EventNav } from "./EventNav";
import { Tracking } from "./Tracking";
import { Hero } from "./sections/Hero";
import { PosterHero } from "./sections/PosterHero";
import { AppleBody } from "./apple/AppleBody";
import { Metrics } from "./sections/Metrics";
import { Grandeur } from "./sections/Grandeur";
import { Audience } from "./sections/Audience";
import { Results } from "./sections/Results";
import { Opportunities } from "./sections/Opportunities";
import { Tiers } from "./sections/Tiers";
import { Sponsors } from "./sections/Sponsors";
import { NextEdition } from "./sections/NextEdition";
import { Cta } from "./sections/Cta";
import { Footer } from "./sections/Footer";

const NAV_LABEL: Partial<Record<SectionType, string>> = {
  metrics: "Números",
  grandeur: "O evento",
  audience: "Público",
  results: "Resultados",
  opportunities: "Oportunidades",
  tiers: "Cotas",
  sponsors: "Parceiros",
  next_edition: "Próxima edição",
};

/** Seções que têm conteúdo suficiente para aparecer. */
function hasContent(b: EventBundle, s: SectionRow): boolean {
  switch (s.type) {
    case "metrics": return b.metrics.some((m) => m.kind === "actual");
    case "grandeur": return b.media.some((m) => m.in_gallery) || Boolean((s.settings as { aftermovie_url?: string; statement?: string }).aftermovie_url || (s.settings as { statement?: string }).statement || s.body);
    case "audience": return b.audience.length > 0;
    case "results": return b.results.length > 0;
    case "opportunities": return b.opportunities.some((o) => o.enabled);
    case "tiers": return b.tiers.some((t) => t.enabled);
    case "sponsors": return b.sponsors.length > 0;
    case "next_edition": return b.metrics.some((m) => m.kind === "projection") || ((s.settings as { items?: unknown[] }).items?.length ?? 0) > 0;
    default: return true;
  }
}

export function EventPage({ bundle, preview = false }: { bundle: EventBundle; preview?: boolean }) {
  const { event, branding } = bundle;
  const sections = bundle.sections.filter((s) => s.enabled).sort((a, b) => a.position - b.position);
  const visible = sections.filter((s) => s.type !== "footer" && hasContent(bundle, s));
  const fonts = googleFontsHref([branding.font_heading, branding.font_body, ...(bundle.look?.skin === "apple" ? ["Inter"] : [])]);
  const dark = luminance(branding.color_background) < 0.35;
  const look = bundle.look ?? {};

  let n = 0;
  const numbered = new Map<string, number>();
  for (const s of visible) if (!["hero", "cta"].includes(s.type)) numbered.set(s.id, ++n);

  const navItems = visible
    .filter((s) => NAV_LABEL[s.type])
    .slice(0, 6)
    .map((s) => ({ href: `#${SECTION_ANCHOR[s.type]}`, label: NAV_LABEL[s.type] ?? SECTION_LABEL[s.type] }));

  const footer = bundle.sections.find((s) => s.type === "footer");

  return (
    <div
      className={`ev-root ${branding.grain ? "ev-grain" : ""} ${dark ? "ev-dark" : "ev-light"} ${look.metallic ? "ev-metal" : ""} ${look.starfield ? "ev-stars" : ""}`}
      style={{ ...brandVars(branding), ...(look.displayLeading ? { ["--ev-leading" as string]: look.displayLeading } : {}), ...(look.titleScale ? { ["--ev-title-scale" as string]: look.titleScale } : {}) }}
    >
      {fonts ? <link rel="stylesheet" href={fonts} precedence="default" /> : null}
      {branding.texture_url ? (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-repeat" style={{ backgroundImage: `url(${branding.texture_url})`, opacity: Number(branding.texture_opacity), backgroundSize: "600px" }} />
      ) : null}

      {preview ? (
        <div className="fixed left-1/2 top-3 z-[80] -translate-x-1/2 rounded-full bg-black px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
          Pré-visualização · {event.status === "published" ? "publicado" : "não publicado"}
        </div>
      ) : null}
      {event.is_demo ? (
        <div className="relative z-[55] bg-[var(--ev-fg)] px-4 py-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--ev-bg)]">
          Evento demonstrativo · identidade, imagens e números fictícios
        </div>
      ) : null}

      <EventNav name={event.name} logo={branding.logo_url} items={navItems} lightAfterHero={look.skin === "apple"} />

      {look.skin === "apple" ? (
        <main id="conteudo" className="relative z-[1]">
          {visible.filter((s) => s.type === "hero").map((s) =>
            look.posterHero ? <PosterHero key={s.id} bundle={bundle} section={s} poster={look.posterHero} /> : <Hero key={s.id} bundle={bundle} section={s} />,
          )}
          <AppleBody bundle={bundle} sections={visible.filter((s) => s.type !== "hero")} />
        </main>
      ) : (
        <>
      <main id="conteudo" className="relative z-[1]">
          {visible.map((s) => {
            const i = numbered.get(s.id) ?? 0;
            switch (s.type) {
              case "hero": return look.posterHero ? <PosterHero key={s.id} bundle={bundle} section={s} poster={look.posterHero} /> : <Hero key={s.id} bundle={bundle} section={s} />;
              case "metrics": return <Metrics key={s.id} bundle={bundle} section={s} index={i} />;
              case "grandeur": return <Grandeur key={s.id} bundle={bundle} section={s} index={i} />;
              case "audience": return <Audience key={s.id} bundle={bundle} section={s} index={i} />;
              case "results": return <Results key={s.id} bundle={bundle} section={s} index={i} />;
              case "opportunities": return <Opportunities key={s.id} bundle={bundle} section={s} index={i} />;
              case "tiers": return <Tiers key={s.id} bundle={bundle} section={s} index={i} />;
              case "sponsors": return <Sponsors key={s.id} bundle={bundle} section={s} index={i} />;
              case "next_edition": return <NextEdition key={s.id} bundle={bundle} section={s} index={i} />;
              case "cta": return <Cta key={s.id} bundle={bundle} section={s} ornament={look.archOrnament} />;
              default: return null;
            }
          })}
        </main>
        {footer?.enabled !== false ? <div className="relative z-[1]"><Footer bundle={bundle} section={footer} /></div> : null}
        </>
      )}

      {!preview ? (
        <Tracking
          eventId={event.id}
          slug={event.slug}
          enabled={Boolean(bundle.tracking)}
          metaPixelId={bundle.tracking?.meta_pixel_id}
          gaId={bundle.tracking?.ga_measurement_id}
          gtmId={bundle.tracking?.gtm_id}
        />
      ) : null}
    </div>
  );
}
