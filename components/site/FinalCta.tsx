import Image from 'next/image';
import { ArchLines } from './ArchLines';
import { Reveal, TrackLink } from './motion';

export function FinalCta({ s, whatsapp }: { s: Record<string, string>; whatsapp: string | null }) {
  const [first, ...rest] = (s.final_cta_title || '').split(' ');
  return (
    <section className="relative isolate overflow-hidden bg-night py-28 sm:py-40">
      <Image src="/media/elenco-palco.webp" alt="" fill sizes="100vw" className="-z-20 object-cover opacity-30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink via-night/70 to-night" />
      <ArchLines animated={false} className="absolute left-1/2 top-10 -z-10 h-[120%] w-auto -translate-x-1/2 opacity-40" />
      <div className="wrap text-center">
        <Reveal>
          <h2 className="display mx-auto max-w-5xl text-[52px] leading-[0.92] text-cream sm:text-8xl lg:text-[128px]">
            {first} <em className="text-gold-grad">{rest.join(' ')}</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-cream/70">{s.final_cta_text}</p>
        </Reveal>
        <Reveal delay={0.2} className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <TrackLink href="#contato" event="sponsor_cta" label="cta-final" className="btn btn-gold">
            Quero ser um patrocinador <span className="arrow">→</span>
          </TrackLink>
          <TrackLink
            href={whatsapp ?? (s.contact_email ? `mailto:${s.contact_email}` : '#contato')}
            target={whatsapp ? '_blank' : undefined}
            rel={whatsapp ? 'noopener noreferrer' : undefined}
            event="contact_cta"
            label="cta-final"
            className="btn btn-ghost"
          >
            Fale com nossa equipe
          </TrackLink>
        </Reveal>
      </div>
    </section>
  );
}
