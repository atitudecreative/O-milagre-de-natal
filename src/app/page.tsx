import type { Metadata } from "next";
import { EventPage } from "@/components/public/EventPage";
import { EVENTO } from "@/content/evento";
import { eventDateLabel } from "@/lib/format";
import { siteUrl } from "@/lib/env";
import type { HeroSettings } from "@/lib/types";

const { event, branding } = EVENTO;
const hero = (EVENTO.sections.find((s) => s.type === "hero")?.settings ?? {}) as HeroSettings;
const title = event.seo_title || `${event.name} — Patrocínio e oportunidades para marcas`;
const description = event.seo_description || event.short_description || undefined;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  robots: event.noindex ? { index: false, follow: true } : undefined,
  icons: branding.favicon_url ? { icon: branding.favicon_url } : undefined,
  openGraph: { type: "website", locale: "pt_BR", title, description, url: "/", siteName: event.name, ...(event.og_image_url ? { images: [{ url: event.og_image_url, width: 1200, height: 630 }] } : {}) },
  twitter: { card: "summary_large_image", title, description },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.short_description ?? undefined,
    startDate: event.starts_on ?? undefined,
    endDate: event.ends_on ?? event.starts_on ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: event.og_image_url || hero.image_desktop || undefined,
    url: siteUrl(),
    location: event.venue || event.city
      ? { "@type": "Place", name: event.venue ?? event.city, address: { "@type": "PostalAddress", addressLocality: event.city ?? undefined, addressRegion: event.state ?? undefined, addressCountry: "BR" } }
      : undefined,
    organizer: event.organizer_name ? { "@type": "Organization", name: event.organizer_name, email: event.contact_email ?? undefined } : undefined,
    disambiguatingDescription: eventDateLabel(event.starts_on, event.ends_on, event.date_label) || undefined,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <EventPage bundle={EVENTO} />
    </>
  );
}
