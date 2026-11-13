import { HeroStage } from './Stage3D';
import { Sticker } from './ui';
import { TrackLink } from './motion';

export function Hero({ s }: { s: Record<string, string> }) {
  return (
    <section id="topo" className="relative isolate -mt-[64px] flex min-h-[100svh] flex-col overflow-hidden bg-papel pt-[64px]">
      {/* palco 3D: logotipo inflado + cartola, aro e estrelas */}
      <div className="relative -z-10 mt-2 h-[36svh] sm:absolute sm:inset-x-0 sm:top-[56px] sm:mt-0 sm:h-[56svh]">
        <HeroStage
          fallback={
            <div className="flex h-full items-center justify-center">
              <span className="logotype block w-[min(86vw,820px)]" />
            </div>
          }
        />
      </div>

      {/* adesivos do elenco — colam em sequência na abertura */}
      <div className="pointer-events-none absolute inset-0 -z-[5]" aria-hidden>
        <Sticker src="/media/v2/adesivos/acrobata-seda-esq.webp" r={-8} slap delay={150} eager className="left-[2%] top-[13%] hidden h-[17vh] sm:left-[6%] sm:block sm:h-[26vh]" />
        <Sticker src="/media/v2/adesivos/acrobata-aro.webp" r={6} slap delay={250} eager className="right-[3%] top-[12%] hidden h-[13vh] sm:block" />
        <Sticker src="/media/v2/adesivos/arautos.webp" r={-4} slap delay={350} eager className="-bottom-[2vh] -left-[6%] h-[24vh] sm:left-[1%] sm:h-[46vh]" />
        <Sticker src="/media/v2/adesivos/cartola-laranja.webp" r={5} slap delay={450} eager className="-bottom-[1vh] -right-[10%] h-[21vh] sm:right-[1%] sm:h-[40vh]" />
      </div>

      <div className="wrap relative flex flex-col items-center pb-[25vh] text-center sm:flex-1 sm:justify-end sm:pb-12">
        <h1 className="sr-only">
          {s.event_kicker} {s.event_name} {s.event_edition}
        </h1>
        <p className="display max-w-[16ch] text-balance text-[34px] sm:max-w-[24ch] sm:text-[56px] lg:text-[64px]">{s.hero_headline}</p>
        <p className="mt-5 max-w-xl text-[16px] font-medium leading-relaxed text-carbon/80 sm:text-lg">{s.hero_text}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[12px] font-bold uppercase tracking-[0.03em]">
          <span className="rounded-full border border-carbon bg-ouro px-3.5 py-1.5">{s.event_dates_label} · {s.event_edition}</span>
          <span className="rounded-full border border-carbon bg-white px-3.5 py-1.5">{s.venue_name} · Barra da Tijuca</span>
        </div>
        <div className="mt-7 flex w-full flex-col items-stretch justify-center gap-2 sm:w-auto sm:flex-row">
          <TrackLink href="#contato" event="sponsor_cta" label="hero" className="pill pill-solid h-14 px-8 text-[14px]">
            Quero patrocinar
          </TrackLink>
          <TrackLink href="/api/midia-kit?origem=hero" event="kit_download" label="hero" className="pill pill-ghost h-14 px-8 text-[14px]">
            Baixar mídia kit
          </TrackLink>
        </div>
      </div>
    </section>
  );
}
