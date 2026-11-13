import { HeroStage } from './Stage3D';
import { Linhas } from './ui';
import { TrackLink } from './motion';

/** Louros com o ano no centro (selo do KV 2024). */
function Laurel({ year }: { year: string }) {
  const leaves = (side: 1 | -1) =>
    Array.from({ length: 7 }, (_, i) => {
      const a = (-70 + i * 22) * (Math.PI / 180);
      const r = 26;
      const x = 32 + side * Math.cos(a) * r;
      const y = 34 + Math.sin(a) * r;
      const rot = (side === 1 ? 90 : -90) + (a * 180) / Math.PI * side;
      return <ellipse key={`${side}-${i}`} cx={x} cy={y} rx="2.6" ry="5.5" transform={`rotate(${rot} ${x} ${y})`} />;
    });
  return (
    <span className="relative inline-flex h-16 w-16 items-center justify-center text-papel" aria-label={`Edição ${year}`}>
      <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full" fill="currentColor" aria-hidden>
        {leaves(1)}
        {leaves(-1)}
      </svg>
      <span className="text-center text-[13px] font-bold leading-[1.05]">
        {year.slice(0, 2)}
        <br />
        {year.slice(2)}
      </span>
    </span>
  );
}

/**
 * Abertura no estilo do KV 2024: palco turquesa com chuva de papel, elenco em camadas,
 * título dourado na frente, linhas passando por trás e pela frente, plateia em silhueta.
 */
export function HeroPalco({ s }: { s: Record<string, string> }) {
  const cast = (name: string) => `/media/v2/kv24/${name}.webp`;
  return (
    <section id="topo" className="relative isolate -mt-[64px] min-h-[100svh] overflow-hidden bg-[#04181B] pt-[64px] text-papel">
      {/* fundo de palco gerado */}
      <picture>
        <source media="(max-width: 767px)" srcSet="/media/v2/palco/palco-hero-vertical.webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/v2/palco/palco-hero.webp" alt="" className="absolute inset-0 -z-30 h-full w-full object-cover" />
      </picture>

      {/* linhas ATRÁS do elenco */}
      <Linhas v="a" className="-z-20 left-[-5%] top-[2%] h-[90%] w-[110%] opacity-35" color="#E8B23A" />

      {/* elenco em camadas */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[16vh] top-[64px] -z-10 sm:bottom-[14vh]" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cast('acrobata-esq')} alt="" className="floaty absolute left-[6%] top-0 h-[26%] sm:left-[18%] sm:h-[32%]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cast('acrobata-dir')} alt="" className="floaty absolute right-[6%] top-0 h-[28%] sm:right-[17%] sm:h-[36%]" style={{ animationDelay: '-3s' }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cast('cantora-azul')} alt="" className="absolute -bottom-[6%] left-[2%] hidden h-[60%] sm:block lg:left-[12%]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cast('cantor-cartola-preta')} alt="" className="absolute bottom-[34%] left-[20%] hidden h-[36%] md:block lg:left-[26%]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cast('cantora-direita')} alt="" className="absolute bottom-[4%] right-[2%] hidden h-[58%] sm:block lg:right-[12%]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cast('cantora-vestido')} alt="" className="absolute bottom-[34%] right-[18%] hidden h-[38%] md:block lg:right-[25%]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cast('mestre')} alt="" className="absolute bottom-[30%] left-1/2 h-[52%] -translate-x-1/2 sm:h-[60%]" />
      </div>

      {/* título 3D dourado NA FRENTE do elenco */}
      <div className="absolute inset-x-0 bottom-[22vh] z-10 h-[30svh] sm:bottom-[17vh] sm:h-[42svh]">
        <HeroStage
          logoOnly
          fallback={
            <div className="flex h-full items-center justify-center">
              <span className="logotype block w-[min(86vw,820px)]" />
            </div>
          }
        />
      </div>

      {/* linhas NA FRENTE do elenco (só nas laterais, para não cobrir rostos) */}
      <Linhas v="leve" className="bottom-[12%] left-[-16%] z-20 h-[44%] w-[40%] opacity-80" color="#E8B23A" />
      <Linhas v="divisor" className="bottom-[17%] right-[-4%] z-20 h-[90px] w-[34%] -rotate-[8deg]" color="#E8B23A" />

      {/* plateia em silhueta na frente de tudo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/media/v2/palco/plateia.webp" alt="" className="pointer-events-none absolute bottom-0 left-1/2 z-20 w-[max(140%,1500px)] max-w-none -translate-x-1/2" aria-hidden />

      {/* faixa inferior, como no KV: selo + endereço · chamada · datas */}
      <div className="absolute inset-x-0 bottom-0 z-30">
        <div className="wrap flex flex-col items-center gap-5 pb-6 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
          <div className="hidden items-center gap-3 sm:flex">
            <Laurel year={String(s.event_edition || '2026')} />
            <div className="text-[14px] leading-tight">
              <p className="font-bold">{s.venue_name}</p>
              <p className="text-papel/80">
                {s.venue_address} · Barra da Tijuca
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <h1 className="sr-only">
              {s.event_kicker} {s.event_name} {s.event_edition}
            </h1>
            <p className="display max-w-[22ch] text-[22px] leading-[0.95] sm:text-[30px]">{s.hero_headline}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <TrackLink href="#contato" event="sponsor_cta" label="hero-palco" className="pill h-12 border-ouro bg-ouro px-7 text-carbon hover:bg-papel">
                Quero patrocinar
              </TrackLink>
              <TrackLink href="/api/midia-kit?origem=hero-palco" event="kit_download" label="hero-palco" className="pill h-12 border-papel bg-transparent px-7 text-papel hover:bg-papel hover:text-carbon">
                Mídia kit
              </TrackLink>
            </div>
          </div>
          <p className="display hidden text-right text-[34px] leading-[0.9] sm:block">
            {s.event_dates_label
              .replace(/ de dezembro/i, '')
              .replace(/, /g, ' · ')}
            <br />
            DEZ
          </p>
        </div>
      </div>
    </section>
  );
}
