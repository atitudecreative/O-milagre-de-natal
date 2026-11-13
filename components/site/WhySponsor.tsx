import Image from 'next/image';
import type { Row } from '@/lib/schema';
import { Reveal, TrackLink } from './motion';
import { SectionHead } from './SectionHead';

const MOMENTS = ['Antes', 'Durante', 'Depois'] as const;

export function WhySponsor({ reasons, statement }: { reasons: Row[]; statement: string }) {
  const byMoment = MOMENTS.map((m) => ({ m, items: reasons.filter((r) => String(r.moment ?? '').includes(m)) }));
  return (
    <section id="patrocinio" className="relative isolate overflow-hidden bg-night">
      {/* Manifesto */}
      <div className="relative isolate flex min-h-[80svh] items-center overflow-hidden py-28">
        <Image src="/media/palco-telas.webp" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-night via-night/60 to-night" />
        <div className="wrap">
          <Reveal>
            <p className="label flex items-center gap-4">
              <span className="text-cream/40">N° 05</span>
              <span className="h-px w-10 bg-gold/40" aria-hidden />
              Por que patrocinar
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <blockquote className="display mt-10 max-w-5xl text-[34px] leading-[1.08] text-cream sm:text-6xl lg:text-[72px]">
              {statement.split(/(inspiração e valores|celebração e renovação)/).map((part, i) =>
                /inspiração e valores|celebração e renovação/.test(part) ? (
                  <em key={i} className="text-gold-grad">
                    {part}
                  </em>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
            </blockquote>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 font-sans text-xs uppercase tracking-[0.24em] text-cream/45">— Mídia kit oficial 2026</p>
          </Reveal>
        </div>
      </div>

      <div className="wrap pb-24 sm:pb-36">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHead n="05.1" label="Argumentos" title={<>Sua marca <em className="text-gold-grad">no centro</em> do Natal da cidade.</>} />
              <Reveal delay={0.1} className="mt-10">
                <TrackLink href="#cotas" event="sponsor_cta" label="argumentos" className="btn btn-gold">
                  Ver cotas <span className="arrow">→</span>
                </TrackLink>
              </Reveal>
            </div>
          </div>

          <ol className="grid gap-px bg-cream/10 sm:grid-cols-2 lg:col-span-8">
            {reasons.map((r, i) => (
              <Reveal as="li" key={r.id} delay={(i % 2) * 0.08} className="group relative bg-night p-8 sm:[&:last-child:nth-child(odd)]:col-span-2 transition-colors duration-700 hover:bg-umber sm:p-10">
                <span className="display text-gold-grad text-5xl leading-none">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="display mt-6 text-2xl leading-snug text-cream">{String(r.title)}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-cream/60">{String(r.description)}</p>
                {r.moment ? <p className="mt-6 font-sans text-[10px] uppercase tracking-[0.24em] text-gold/60">{String(r.moment)}</p> : null}
                <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-700 ease-silk group-hover:scale-x-100" />
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Linha do tempo de visibilidade */}
        <div className="mt-24 border-t hairline pt-12">
          <Reveal>
            <p className="label">Visibilidade antes, durante e depois</p>
          </Reveal>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {byMoment.map(({ m, items }, i) => (
              <Reveal key={m} delay={i * 0.1} className="relative">
                <div className="flex items-center gap-4">
                  <span className="h-3 w-3 rotate-45 border border-gold bg-night" />
                  <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
                </div>
                <h3 className="display mt-6 text-4xl text-cream">{m}</h3>
                <ul className="mt-4 space-y-2 text-[15px] text-cream/60">
                  {items.map((r) => (
                    <li key={r.id}>{String(r.title)}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
