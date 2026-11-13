import { HeroStage } from './Stage3D';
import { ConstellationBox } from '@/components/dala/Constellation';
import { ArchPortrait, Floater } from './ui';
import { TrackLink } from './motion';

export function Hero({ s, fx = false }: { s: Record<string, string>; fx?: boolean }) {
  const year = String(s.event_edition || '').padStart(4, ' ');
  return (
    <section id="topo" className="swirl sw-a relative isolate -mt-[64px] flex min-h-[100svh] flex-col overflow-hidden bg-papel pt-[64px]">
      {/* moldura editorial da ID 2024: ano nos cantos e título espaçado */}
      <div className="pointer-events-none absolute inset-x-4 top-[80px] hidden justify-between text-pinheiro sm:flex lg:inset-x-10" aria-hidden>
        <span className="serif text-3xl tracking-[0.3em]">{year.slice(0, 2)}</span>
        <span className="pt-2 text-[12px] font-bold uppercase tracking-[0.5em]">{s.event_kicker}</span>
        <span className="serif text-3xl tracking-[0.3em]">{year.slice(2)}</span>
      </div>

      <div className="relative -z-10 mt-6 h-[34svh] sm:absolute sm:inset-x-0 sm:top-[90px] sm:mt-0 sm:h-[50svh]">
        {fx ? (
          <ConstellationBox kind="logo" fill={0.9} count={4200} sizeRange={[7, 12]} className="absolute inset-0" />
        ) : (
          <HeroStage
            fallback={
              <div className="flex h-full items-center justify-center">
                <span className="logotype block w-[min(86vw,820px)]" />
              </div>
            }
          />
        )}
      </div>

      {/* elenco em janelas de arco + acrobatas soltas */}
      <div className="pointer-events-none absolute inset-0 -z-[5]" aria-hidden>
        <Floater src="/media/v2/recortes/acrobata-seda-esq.webp" r={-6} eager className="left-[4%] top-[18%] hidden h-[24vh] sm:block lg:left-[8%]" />
        <Floater src="/media/v2/recortes/acrobata-aro.webp" r={8} eager className="right-[5%] top-[19%] hidden h-[11vh] sm:block lg:right-[9%]" />
        <ArchPortrait src="/media/v2/recortes/cartola-verde.webp" alt="" fill="bg-turquesa" eager className="absolute -bottom-px -left-6 h-[22vh] w-[36vw] max-w-[300px] sm:left-[2%] sm:h-[38vh] sm:w-[17vw]" />
        <ArchPortrait src="/media/v2/recortes/cartola-laranja.webp" alt="" fill="bg-ouro" fit={0.86} eager className="absolute -bottom-px -right-6 h-[22vh] w-[40vw] max-w-[340px] sm:right-[2%] sm:h-[40vh] sm:w-[19vw]" />
      </div>

      <div className="wrap relative flex flex-col items-center pb-[25vh] text-center sm:flex-1 sm:justify-end sm:pb-12">
        <h1 className="sr-only">
          {s.event_kicker} {s.event_name} {s.event_edition}
        </h1>
        <p className="display max-w-[16ch] text-balance text-[34px] sm:max-w-[24ch] sm:text-[56px] lg:text-[64px]">{s.hero_headline}</p>
        <p className="mt-5 max-w-xl text-[16px] font-medium leading-relaxed text-carbon/80 sm:text-lg">{s.hero_text}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[12px] font-bold uppercase tracking-[0.03em]">
          <span className="rounded-full border border-carbon bg-ouro px-3.5 py-1.5">
            {s.event_dates_label} · {s.event_edition}
          </span>
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
