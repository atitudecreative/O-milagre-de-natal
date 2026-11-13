import { TrackLink } from './motion';
import { ConstellationBox } from '@/components/dala/Constellation';
import { ArchPortrait, Edge, Floater, HEX } from './ui';

export function FinalCta({ s, whatsapp, fx = false }: { s: Record<string, string>; whatsapp: string | null; fx?: boolean }) {
  return (
    <section className="swirl sw-c relative isolate bg-cortina py-24 text-white sm:py-36" style={{ ['--sw' as string]: '#B82D17' }}>
      <Edge color={HEX.cortina} kind="curtain" />
      {fx && (
        <ConstellationBox
          kind="tree"
          fill={0.9}
          count={2200}
          palette={['#FFFFFF', '#FFFFFF', '#E8B23A', '#E8B23A', '#F5E3B5', '#1FA3A0']}
          className="absolute right-[2%] top-[8%] -z-[4] hidden h-[84%] w-[30%] lg:block"
        />
      )}
      <div className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden" aria-hidden>
        <ArchPortrait src="/media/v2/recortes/cartola-verde.webp" alt="" fill="bg-turquesa" className="absolute -bottom-px left-[3%] hidden h-[340px] w-[240px] md:block" />
        <Floater src="/media/v2/recortes/acrobata-aro.webp" r={8} className="right-[6%] top-[14%] h-[80px] sm:h-[120px]" />
        <Floater src="/media/v2/adesivos/copo-refri.webp" r={9} float={false} className="-bottom-4 right-[6%] hidden h-[200px] md:block" />
      </div>
      <div className="wrap text-center">
        <p className="serif text-[32px] leading-none text-ouro sm:text-[44px]">venha com a gente</p>
        <h2 className="display mx-auto mt-4 max-w-[11ch] text-balance text-[60px] leading-[0.8] sm:text-[120px] lg:text-[164px]">{s.final_cta_title}</h2>
        <span className="divisor mx-auto mt-8 text-ouro" aria-hidden />
        <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-relaxed text-white/90">{s.final_cta_text}</p>
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
