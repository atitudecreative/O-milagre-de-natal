import { TrackLink } from './motion';

export function Footer({ s, whatsapp }: { s: Record<string, string>; whatsapp: string | null }) {
  const socials = [
    ['Instagram', s.instagram_url],
    ['YouTube', s.youtube_url],
    ['Facebook', s.facebook_url],
    ['TikTok', s.tiktok_url],
    ['Site', s.site_url],
  ].filter(([, u]) => u);
  return (
    <footer className="bg-carbon pb-28 pt-16 text-papel sm:pb-10">
      <div className="wrap">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="logotype block w-[260px] sm:w-[340px]" role="img" aria-label={s.event_name} />
            <p className="mt-6 max-w-sm text-[15px] font-medium text-papel/70">{s.footer_text}</p>
          </div>
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.03em] text-ouro">Evento</p>
              <ul className="mt-4 space-y-1.5 text-[15px] font-medium text-papel/80">
                <li>{s.event_dates_label} · {s.event_edition}</li>
                <li>{s.venue_name}</li>
                <li>{s.venue_address}</li>
                <li>{s.venue_city}</li>
                {s.venue_map_url && (
                  <li>
                    <a href={s.venue_map_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Ver no mapa</a>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.03em] text-ouro">Contato</p>
              <ul className="mt-4 space-y-1.5 text-[15px] font-medium text-papel/80">
                {s.contact_email && (
                  <li>
                    <TrackLink href={`mailto:${s.contact_email}`} event="email_click" label="rodape">{s.contact_email}</TrackLink>
                  </li>
                )}
                {s.contact_phone && <li>{s.contact_phone}</li>}
                {whatsapp && (
                  <li>
                    <TrackLink href={whatsapp} target="_blank" rel="noopener noreferrer" event="whatsapp_click" label="rodape">WhatsApp</TrackLink>
                  </li>
                )}
                <li><a href="#contato">Formulário comercial</a></li>
                <li>
                  <TrackLink href="/api/midia-kit?origem=rodape" event="kit_download" label="rodape">Mídia kit (PDF)</TrackLink>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.03em] text-ouro">Redes</p>
              <ul className="mt-4 space-y-1.5 text-[15px] font-medium text-papel/80">
                {socials.length ? (
                  socials.map(([n, u]) => (
                    <li key={n}><a href={u} target="_blank" rel="noopener noreferrer">{n}</a></li>
                  ))
                ) : (
                  <li className="text-papel/50">Canais oficiais em breve</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-papel/20 pt-6 text-[13px] font-medium text-papel/50 md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} {s.legal_name || s.producer}
            {s.legal_document ? ` · CNPJ ${s.legal_document}` : ''}. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="/privacidade">Política de privacidade</a>
            <span>Realização: {s.producer}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
