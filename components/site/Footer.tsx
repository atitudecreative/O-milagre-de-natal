import { TrackLink } from './motion';

export function Footer({ s, whatsapp }: { s: Record<string, string>; whatsapp: string | null }) {
  const socials = [
    ['Instagram', s.instagram_url],
    ['YouTube', s.youtube_url],
    ['Facebook', s.facebook_url],
    ['TikTok', s.tiktok_url],
    ['Site', s.site_url],
  ].filter(([, u]) => u);
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t hairline bg-night pb-28 pt-20 sm:pb-12">
      <div className="wrap">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="logotype block w-[260px] sm:w-[320px]" role="img" aria-label={s.event_name} />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/55">{s.footer_text}</p>
          </div>
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="label">Evento</p>
              <ul className="mt-5 space-y-2 text-sm text-cream/70">
                <li>{s.event_dates_label} · {s.event_edition}</li>
                <li>{s.venue_name}</li>
                <li>{s.venue_address}</li>
                <li>{s.venue_city}</li>
                {s.venue_map_url && (
                  <li>
                    <a href={s.venue_map_url} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Ver no mapa ↗</a>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <p className="label">Contato</p>
              <ul className="mt-5 space-y-2 text-sm text-cream/70">
                {s.contact_email && (
                  <li>
                    <TrackLink href={`mailto:${s.contact_email}`} event="email_click" label="rodape" className="hover:text-gold">{s.contact_email}</TrackLink>
                  </li>
                )}
                {s.contact_phone && <li>{s.contact_phone}</li>}
                {whatsapp && (
                  <li>
                    <TrackLink href={whatsapp} target="_blank" rel="noopener noreferrer" event="whatsapp_click" label="rodape" className="hover:text-gold">WhatsApp</TrackLink>
                  </li>
                )}
                <li>
                  <a href="#contato" className="hover:text-gold">Formulário comercial</a>
                </li>
                <li>
                  <TrackLink href="/api/midia-kit?origem=rodape" event="kit_download" label="rodape" className="hover:text-gold">Mídia kit (PDF)</TrackLink>
                </li>
              </ul>
            </div>
            <div>
              <p className="label">Redes</p>
              <ul className="mt-5 space-y-2 text-sm text-cream/70">
                {socials.length ? (
                  socials.map(([n, u]) => (
                    <li key={n}>
                      <a href={u} target="_blank" rel="noopener noreferrer" className="hover:text-gold">{n} ↗</a>
                    </li>
                  ))
                ) : (
                  <li className="text-cream/40">Canais oficiais em breve</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t hairline pt-8 font-sans text-xs text-cream/40 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {s.legal_name || s.producer}
            {s.legal_document ? ` · CNPJ ${s.legal_document}` : ''}. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap gap-6">
            <a href="/privacidade" className="hover:text-gold">Política de privacidade</a>
            <span>Realização: {s.producer}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
