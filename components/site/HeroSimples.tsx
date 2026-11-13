import Image from 'next/image';
import { ConstellationBox } from '@/components/dala/Constellation';
import { TrackLink } from './motion';

/** Cortina de teatro em cor chapada, com pregas e contorno (ID 2025). */
function Curtain({ side }: { side: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 300 1000"
      preserveAspectRatio="none"
      className={`curtain curtain-${side} pointer-events-none absolute bottom-0 top-0 z-20 h-full w-[5vw] max-w-[280px] sm:w-[15vw] ${side === 'left' ? 'left-0' : 'right-0'}`}
      aria-hidden
    >
      <g transform={side === 'right' ? 'translate(300 0) scale(-1 1)' : undefined}>
      <path d="M0 0 H300 C250 260 300 520 230 760 C210 860 250 940 290 1000 H0 Z" fill="#D2381F" stroke="#0B0B0B" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {[60, 125, 185, 240].map((x, i) => (
        <path key={x} d={`M${x} 0 C${x - 12} 300 ${x + 10} 600 ${x - 25 - i * 8} 1000`} fill="none" stroke="#9E2512" strokeWidth="10" opacity="0.55" />
      ))}
      </g>
    </svg>
  );
}

/**
 * Abertura simples: a cortina se abre e revela o arco do vitral (2026) com o presépio;
 * a estrela de Belém é formada por triângulos (efeito constelação).
 */
export function HeroSimples({ s }: { s: Record<string, string> }) {
  return (
    <section id="topo" className="relative isolate -mt-[64px] flex min-h-[100svh] flex-col items-center overflow-hidden bg-papel px-4 pb-10 pt-[96px] text-center">
      {/* bambinela (faixa superior da cortina) */}
      <svg viewBox="0 0 1600 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-[64px] z-30 h-[26px] w-full sm:h-[38px]" aria-hidden>
        <path d={'M0,0 H1600 V30 ' + Array.from({ length: 16 }, (_, i) => `Q${1600 - i * 100 - 50},62 ${1600 - (i + 1) * 100},30`).join(' ') + ' Z'} fill="#D2381F" stroke="#0B0B0B" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      </svg>
      <Curtain side="left" />
      <Curtain side="right" />

      {/* palco: arco com a cena e o logotipo */}
      <div className="relative z-10 mt-20 sm:mt-24">
        <div className="arch-frame relative aspect-[5/6] h-[min(46svh,110vw)] max-w-[84vw] overflow-hidden border border-carbon bg-palco">
          <Image src="/media/presepio-lua.webp" alt="Cena do presépio sob a lua, no musical O Milagre do Natal" fill priority sizes="(max-width:640px) 84vw, 460px" className="object-cover object-bottom" />
          <div className="absolute inset-x-0 top-[13%] flex justify-center px-[9%]">
            <span className="logotype block w-full !text-white" role="img" aria-label={s.event_name} />
          </div>
        </div>
        {/* estrela de Belém em triângulos, pousada no topo do arco */}
        <ConstellationBox
          kind="star"
          fill={0.95}
          count={900}
          sizeRange={[6, 10]}
          palette={['#E8B23A', '#E8B23A', '#E8B23A', '#D2381F', '#0E5A3A', '#1FA3A0']}
          className="absolute -top-[86px] left-1/2 h-[150px] w-[150px] -translate-x-1/2 sm:-top-[104px] sm:h-[180px] sm:w-[180px]"
        />
      </div>

      <h1 className="display relative z-10 mt-7 max-w-[24ch] text-balance text-[30px] leading-[0.92] sm:text-[44px]">
        <span className="sr-only">{s.event_name}: </span>
        {s.hero_headline}
      </h1>
      <p className="relative z-10 mt-3 text-[13px] font-bold uppercase tracking-[0.03em]">
        {s.event_dates_label} · {s.venue_name}
      </p>
      <div className="relative z-10 mt-6 flex w-full flex-col items-stretch justify-center gap-2 sm:w-auto sm:flex-row">
        <TrackLink href="#contato" event="sponsor_cta" label="hero-simples" className="pill pill-solid h-14 px-8 text-[14px]">
          Quero patrocinar
        </TrackLink>
        <TrackLink href="/api/midia-kit?origem=hero-simples" event="kit_download" label="hero-simples" className="pill pill-ghost h-14 px-8 text-[14px]">
          Baixar mídia kit
        </TrackLink>
      </div>
    </section>
  );
}
