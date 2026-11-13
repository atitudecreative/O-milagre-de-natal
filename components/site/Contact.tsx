import { SEGMENTS } from '@/lib/schema';
import { Reveal, TrackLink } from './motion';
import { LeadForm } from './forms';

export function Contact({ s, tiers, whatsapp }: { s: Record<string, string>; tiers: string[]; whatsapp: string | null }) {
  return (
    <section id="contato" className="relative bg-night py-24 sm:py-36">
      <div className="wrap grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Reveal>
            <p className="label flex items-center gap-4">
              <span className="text-cream/40">N° 10</span>
              <span className="h-px w-10 bg-gold/40" aria-hidden />
              Interesse comercial
            </p>
            <h2 className="display mt-6 text-[40px] leading-[0.98] text-cream sm:text-6xl">
              Vamos conversar sobre a <em className="text-gold-grad">sua marca.</em>
            </h2>
            <p className="mt-6 text-cream/65">
              Preencha o formulário e a equipe comercial retorna com os próximos passos, disponibilidade das cotas e prazos de produção.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 space-y-5 border-t hairline pt-8 text-sm">
            {s.contact_name && (
              <p>
                <span className="block font-sans text-[10px] uppercase tracking-[0.24em] text-cream/40">Responsável comercial</span>
                <span className="display text-xl text-cream">{s.contact_name}</span>
              </p>
            )}
            {s.contact_email && (
              <p>
                <span className="block font-sans text-[10px] uppercase tracking-[0.24em] text-cream/40">E-mail</span>
                <TrackLink href={`mailto:${s.contact_email}`} event="email_click" label="contato" className="text-lg text-gold hover:underline">
                  {s.contact_email}
                </TrackLink>
              </p>
            )}
            {s.contact_phone && (
              <p>
                <span className="block font-sans text-[10px] uppercase tracking-[0.24em] text-cream/40">Telefone</span>
                <a href={`tel:${s.contact_phone.replace(/[^\d+]/g, '')}`} className="text-lg text-cream hover:text-gold">{s.contact_phone}</a>
              </p>
            )}
            {whatsapp && (
              <TrackLink href={whatsapp} target="_blank" rel="noopener noreferrer" event="whatsapp_click" label="contato" className="btn btn-ghost mt-2">
                Falar pelo WhatsApp
              </TrackLink>
            )}
            <p className="text-cream/45">
              {s.venue_name} · {s.venue_address} · {s.venue_city}
            </p>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-8 lg:pl-10" delay={0.1}>
          <LeadForm tiers={tiers} segments={SEGMENTS} whatsapp={whatsapp} />
        </Reveal>
      </div>
    </section>
  );
}
