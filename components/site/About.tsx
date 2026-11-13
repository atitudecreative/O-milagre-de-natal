import Image from 'next/image';
import { lines } from '@/lib/format';
import { Reveal } from './motion';
import { Star } from './ArchLines';

export function About({ s }: { s: Record<string, string> }) {
  const pillars = [
    { k: 'Propósito', v: s.about_purpose },
    { k: 'Por que existe', v: s.about_why },
    { k: 'O que o torna diferente', v: s.about_difference },
  ].filter((p) => p.v);
  const expect = lines(s.about_expect);

  return (
    <section id="sobre" className="relative overflow-hidden bg-night py-24 sm:py-36">
      <div className="wrap">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="label flex items-center gap-4">
                <span className="text-cream/40">N° 01</span>
                <span className="h-px w-10 bg-gold/40" aria-hidden />O musical
              </p>
              <h2 className="display mt-6 text-[44px] leading-[0.95] text-cream sm:text-7xl lg:text-[88px]">
                {s.about_title?.split(' ').slice(0, 3).join(' ')}{' '}
                <em className="text-gold-grad not-italic [font-style:italic]">{s.about_title?.split(' ').slice(3).join(' ')}</em>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="display mt-10 max-w-2xl text-2xl leading-snug text-champagne/90 sm:text-[28px]">{s.about_lead}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/65">{s.about_story}</p>
            </Reveal>
          </div>

          <div className="relative min-h-[420px] lg:col-span-5">
            {s.about_image_1 && (
              <Reveal className="relative ml-auto aspect-[4/5] w-[82%] overflow-hidden" y={60}>
                <Image src={s.about_image_1} alt="Cena do presépio com o elenco do musical" fill sizes="(max-width:1024px) 80vw, 34vw" className="object-cover" />
                <div className="absolute inset-0 ring-1 ring-inset ring-gold/20" />
              </Reveal>
            )}
            {s.about_image_2 && (
              <Reveal className="absolute -bottom-6 left-0 aspect-[4/3] w-[58%] overflow-hidden border-[10px] border-night shadow-2xl" delay={0.2} y={90}>
                <Image src={s.about_image_2} alt="Família na plateia do musical" fill sizes="(max-width:1024px) 55vw, 24vw" className="object-cover" />
              </Reveal>
            )}
            <Star className="absolute right-[86%] top-8 hidden h-10 w-10 text-gold/60 lg:block" />
          </div>
        </div>

        <div className="mt-28 grid border-t hairline sm:mt-36 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.k} delay={i * 0.08} className="border-b hairline py-10 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
              <p className="font-sans text-xs text-gold/70">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="display mt-4 text-3xl text-cream">{p.k}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-cream/65">{p.v}</p>
            </Reveal>
          ))}
        </div>

        {expect.length > 0 && (
          <Reveal className="mt-16 flex flex-col gap-6 border-y hairline py-10 lg:flex-row lg:items-center lg:gap-14">
            <p className="label shrink-0">O que o público encontra</p>
            <ul className="flex flex-wrap gap-x-10 gap-y-4">
              {expect.map((e) => (
                <li key={e} className="display flex items-center gap-3 text-xl text-cream/90">
                  <Star className="h-3 w-3 shrink-0 text-gold" />
                  {e}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  );
}
