import type { EventBundle, FooterSettings, LinkItem, SectionRow, SocialLink } from "@/lib/types";
import { EvImage } from "../EvImage";
import { TrackedLink } from "../TrackedLink";

export function Footer({ bundle, section }: { bundle: EventBundle; section?: SectionRow }) {
  const { event, branding } = bundle;
  const s = (section?.settings ?? {}) as FooterSettings;
  const social = (event.social_links as SocialLink[]) ?? [];
  const links = (event.footer_links as LinkItem[]) ?? [];
  const year = new Date().getFullYear();
  return (
    <footer id="contato" className="border-t border-[var(--ev-line)] pb-28 pt-16 md:pb-12">
      <div className="ev-container grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          {branding.logo_alt_url || branding.logo_url ? (
            <EvImage src={(branding.logo_alt_url || branding.logo_url)!} alt={event.name} width={240} height={90} className="h-14 w-auto max-w-[220px] object-contain object-left" />
          ) : (
            <p className="ev-display text-4xl">{event.name}</p>
          )}
          {event.organizer_about ? <p className="mt-6 max-w-sm text-sm leading-relaxed text-[var(--ev-muted)]">{event.organizer_about}</p> : null}
        </div>
        <div className="md:col-span-3">
          <p className="ev-eyebrow mb-4">Organização</p>
          <ul className="space-y-2 text-sm">
            {event.organizer_name ? <li className="font-semibold">{event.organizer_name}</li> : null}
            {event.organizer_document ? <li className="text-[var(--ev-muted)]">{event.organizer_document}</li> : null}
            {event.contact_email ? <li><a className="ev-link-underline" href={`mailto:${event.contact_email}`}>{event.contact_email}</a></li> : null}
            {event.contact_phone ? <li><a className="ev-link-underline" href={`tel:${event.contact_phone.replace(/[^\d+]/g, "")}`}>{event.contact_phone}</a></li> : null}
            {event.whatsapp ? (
              <li>
                <TrackedLink href={`https://wa.me/${event.whatsapp}`} target="_blank" rel="noopener noreferrer" event="whatsapp_click" label="footer_whatsapp" className="ev-link-underline">WhatsApp</TrackedLink>
              </li>
            ) : null}
          </ul>
        </div>
        <div className="md:col-span-2">
          {social.length ? (
            <>
              <p className="ev-eyebrow mb-4">Redes</p>
              <ul className="space-y-2 text-sm">
                {social.map((l) => (
                  <li key={l.url}><a className="ev-link-underline" href={l.url} target="_blank" rel="noopener noreferrer">{l.network}</a></li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
        <div className="md:col-span-2">
          <p className="ev-eyebrow mb-4">Links</p>
          <ul className="space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.url}><a className="ev-link-underline" href={l.url} target={l.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{l.label}</a></li>
            ))}
            <li><a className="ev-link-underline" href={`/eventos/${event.slug}/privacidade`}>Política de privacidade</a></li>
            <li><button type="button" data-consent-open className="ev-link-underline text-left">Preferências de cookies</button></li>
          </ul>
        </div>
      </div>
      <div className="ev-container mt-16 flex flex-col justify-between gap-2 border-t border-[var(--ev-line)] pt-6 text-xs text-[var(--ev-subtle)] sm:flex-row">
        <p>{s.copyright || `© ${year} ${event.organizer_name || event.name}. Todos os direitos reservados.`}</p>
        <p>Apresentação comercial para patrocinadores</p>
      </div>
    </footer>
  );
}
