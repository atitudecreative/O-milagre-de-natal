import { TrackLink } from './motion';
import { Sticker } from './ui';

export function FinalCta({ s, whatsapp }: { s: Record<string, string>; whatsapp: string | null }) {
  return (
    <section className="relative isolate overflow-hidden border-t border-carbon bg-cortina py-24 text-white sm:py-36">
      <div className="bulbs absolute inset-x-0 top-0 h-[22px]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <Sticker src="/media/v2/adesivos/cartola-verde.webp" r={-7} className="-bottom-4 left-[2%] hidden h-[300px] md:block" />
        <Sticker src="/media/v2/adesivos/acrobata-aro.webp" r={8} className="right-[4%] top-[12%] h-[90px] sm:h-[140px]" />
        <Sticker src="/media/v2/adesivos/copo-refri.webp" r={9} className="-bottom-6 right-[5%] hidden h-[220px] md:block" />
      </div>
      <div className="wrap text-center">
        <h2 className="display mx-auto max-w-[11ch] text-balance text-[60px] leading-[0.8] sm:text-[120px] lg:text-[176px]">{s.final_cta_title}</h2>
        <p className="mx-auto mt-8 max-w-xl text-lg font-medium leading-relaxed text-white/90">{s.final_cta_text}</p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
          <TrackLink href="#contato" event="sponsor_cta" label="cta-final" className="pill h-14 bg-white px-8 text-carbon hover:bg-carbon hover:text-white">
            Quero ser um patrocinador
          </TrackLink>
          <TrackLink
            href={whatsapp ?? (s.contact_email ? `mailto:${s.contact_email}` : '#contato')}
            target={whatsapp ? '_blank' : undefined}
            rel={whatsapp ? 'noopener noreferrer' : undefined}
            event="contact_cta"
            label="cta-final"
            className="pill pill-solid h-14 px-8"
          >
            Fale com nossa equipe
          </TrackLink>
        </div>
      </div>
    </section>
  );
}
