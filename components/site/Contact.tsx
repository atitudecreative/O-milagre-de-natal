import { SEGMENTS } from '@/lib/schema';
import { TrackLink } from './motion';
import { LeadForm } from './forms';
import { H2, Sticker } from './ui';

export function Contact({ s, tiers, whatsapp }: { s: Record<string, string>; tiers: string[]; whatsapp: string | null }) {
  return (
    <section id="contato" className="relative overflow-hidden border-y border-carbon bg-pessego py-20 sm:py-28">
      <div className="wrap grid gap-10 lg:grid-cols-12">
        <div className="relative lg:col-span-4">
          <H2 className="text-[44px] sm:text-[64px] lg:text-[52px] xl:text-[60px]">Vamos conversar?</H2>
          <p className="mt-6 text-lg font-medium leading-relaxed text-carbon/80">
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
              <TrackLink href={whatsapp} target="_blank" rel="noopener noreferrer" event="whatsapp_click" label="contato" className="pill pill-ghost mt-3 h-12">
                Falar pelo WhatsApp
              </TrackLink>
            )}
          </div>
          <Sticker src="/media/v2/adesivos/acrobata-seda-esq.webp" r={-10} className="bottom-0 left-[20%] hidden h-[220px] lg:block" />
        </div>
        <div className="card rounded-big p-6 sm:p-10 lg:col-span-8">
          <LeadForm tiers={tiers} segments={SEGMENTS} whatsapp={whatsapp} />
        </div>
      </div>
    </section>
  );
}
