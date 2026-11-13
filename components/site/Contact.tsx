import { SEGMENTS } from '@/lib/schema';
import { TrackLink } from './motion';
import { LeadForm } from './forms';
import { Accent, Edge, Floater, H2, HEX } from './ui';

export function Contact({ s, tiers, whatsapp }: { s: Record<string, string>; tiers: string[]; whatsapp: string | null }) {
  return (
    <section id="contato" className="swirl sw-b relative bg-pinheiro py-20 text-papel sm:py-28" style={{ ['--sw' as string]: '#17704A' }}>
      <Edge color={HEX.pinheiro} kind="wave" />
      <div className="wrap grid gap-10 lg:grid-cols-12">
        <div className="relative lg:col-span-4">
          <p className="serif text-[30px] leading-none text-ouro sm:text-[36px]">fale com a gente</p>
          <H2 className="mt-2 text-[44px] sm:text-[64px] lg:text-[44px] xl:text-[52px]">Vamos conversar?</H2>
          <p className="mt-6 text-lg font-medium leading-relaxed text-papel/85">
            Conte sobre a sua marca. A equipe comercial retorna com disponibilidade das cotas, prazos e próximos passos.
          </p>
          <div className="mt-8 space-y-2 text-[15px] font-bold">
            {s.contact_name && <p>{s.contact_name}</p>}
            {s.contact_email && (
              <TrackLink href={`mailto:${s.contact_email}`} event="email_click" label="contato" className="block underline underline-offset-4">
                {s.contact_email}
              </TrackLink>
            )}
            {s.contact_phone && (
              <a href={`tel:${s.contact_phone.replace(/[^\d+]/g, '')}`} className="block">
                {s.contact_phone}
              </a>
            )}
            {whatsapp && (
              <TrackLink href={whatsapp} target="_blank" rel="noopener noreferrer" event="whatsapp_click" label="contato" className="pill mt-3 h-12 border-papel bg-transparent text-papel hover:bg-papel hover:text-carbon">
                Falar pelo WhatsApp
              </TrackLink>
            )}
          </div>
          <Floater src="/media/v2/recortes/acrobata-seda-esq.webp" r={-10} className="bottom-0 left-[20%] hidden h-[220px] lg:block" />
        </div>
        <div className="rounded-[48px] border border-carbon bg-papel p-6 text-carbon sm:rounded-[200px_200px_48px_48px] sm:px-12 sm:pb-12 sm:pt-24 lg:col-span-8">
          <LeadForm tiers={tiers} segments={SEGMENTS} whatsapp={whatsapp} />
        </div>
      </div>
    </section>
  );
}
