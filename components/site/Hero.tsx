import Image from 'next/image';
import { ArchLines, Star } from './ArchLines';
import { TrackLink } from './motion';

export function Hero({ s }: { s: Record<string, string> }) {
  const ticker = [
    s.event_dates_label,
    s.venue_name,
    s.venue_city,
    'Um presente de Natal para o Rio de Janeiro',
    s.producer && `${s.producer} apresenta`,
  ].filter(Boolean);

  return (
    <section id="topo" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night">
      {/* céu */}
      <div className="stars absolute inset-0 -z-20 opacity-70" />
      <div className="absolute inset-x-0 bottom-0 -z-20 h-2/3 bg-[radial-gradient(60%_70%_at_50%_100%,rgba(198,135,82,0.28),transparent_70%)]" />

      {/* janela em arco com a cena do presépio */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[64px] -z-10 flex justify-center">
        <div className="relative h-full w-[min(118vw,820px)] sm:w-[min(92vw,820px)]">
          <div className="arch absolute inset-x-[6%] bottom-0 top-[14%] overflow-hidden">
            {s.hero_video ? (
              <video
                className="h-full w-full object-cover object-bottom"
                src={s.hero_video}
                poster={s.hero_image}
                autoPlay
                muted
                loop
                playsInline
                aria-hidden
              />
            ) : (
              <Image
                src={s.hero_image || '/media/presepio-lua.webp'}
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 110vw, 820px"
                className="scale-[1.08] object-cover object-bottom motion-safe:animate-[heroZoom_22s_ease-out_forwards]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-night via-night/55 to-night/10" />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-night via-night/50 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(55%_32%_at_50%_58%,rgba(8,7,10,0.7),transparent)]" />
          </div>
          <ArchLines className="absolute inset-0 h-full w-full" />
        </div>
      </div>

      {/* trilhos laterais editoriais */}
      <div className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 -rotate-180 font-sans text-[11px] uppercase tracking-[0.4em] text-cream/40 [writing-mode:vertical-rl] lg:block">
        Edição {s.event_edition}
      </div>
      <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 font-sans text-[11px] uppercase tracking-[0.4em] text-cream/40 [writing-mode:vertical-rl] lg:block">
        {s.producer} apresenta
      </div>

      <div className="wrap relative flex flex-1 flex-col items-center justify-center pb-16 pt-28 text-center sm:pt-28">
        <p className="display flex items-center gap-3 text-[15px] italic text-champagne sm:text-lg">
          <Star className="h-3.5 w-3.5 text-gold" />
          {s.event_kicker}
          <Star className="h-3.5 w-3.5 text-gold" />
        </p>

        <h1 className="mt-5 w-full">
          <span className="sr-only">{s.event_name}</span>
          <span className="logotype mx-auto block w-[min(94vw,880px)] motion-safe:animate-[heroIn_1.6s_cubic-bezier(0.22,1,0.36,1)_both]" aria-hidden />
        </h1>

        <p className="display mt-6 max-w-[24ch] text-[26px] leading-[1.1] text-cream sm:text-[34px]">{s.hero_headline}</p>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-cream/70 sm:text-base">{s.hero_text}</p>

        <dl className="mt-8 flex flex-col items-center gap-2 font-sans text-[12px] uppercase tracking-[0.22em] text-champagne sm:flex-row sm:gap-6">
          <div>
            <dt className="sr-only">Data</dt>
            <dd>{s.event_dates_label} · {s.event_edition}</dd>
          </div>
          <span className="hidden h-px w-10 bg-gold/50 sm:block" aria-hidden />
          <div>
            <dt className="sr-only">Local</dt>
            <dd>{s.venue_name} — {s.venue_city}</dd>
          </div>
        </dl>

        <div className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row">
          <a href="#sobre" className="btn btn-ghost backdrop-blur-sm">
            Conheça o evento
          </a>
          <TrackLink href="#contato" event="sponsor_cta" label="hero" className="btn btn-gold">
            Seja um patrocinador <span className="arrow">→</span>
          </TrackLink>
        </div>
      </div>

      {/* faixa corrida */}
      <div className="relative border-y border-cream/10 bg-night/70 py-3 backdrop-blur" aria-hidden>
        <div className="marquee flex w-max gap-10 whitespace-nowrap font-sans text-[11px] uppercase tracking-[0.3em] text-cream/55">
          {[...ticker, ...ticker, ...ticker, ...ticker].map((t, i) => (
            <span key={i} className="flex items-center gap-10">
              {t}
              <Star className="h-2.5 w-2.5 text-gold/70" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
