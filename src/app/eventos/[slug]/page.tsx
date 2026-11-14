import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import { getEventBundle } from "@/lib/data/events";
import { EventPage } from "@/components/public/EventPage";
import { eventDateLabel } from "@/lib/format";
import { siteUrl } from "@/lib/env";
import type { HeroSettings } from "@/lib/types";

/** Gera sob demanda e mantém em cache (ISR); publicar/editar invalida o cache. */
export async function generateStaticParams() {
  return [];
}

export const revalidate = 300;

const load = cache(async (slug: string) => getEventBundle(createPublicClient(), { slug }));

export async function generateMetadata({ params }: PageProps<"/eventos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await load(slug);
  if (!bundle) return { title: "Evento não encontrado" };
  const { event, branding } = bundle;
  const title = event.seo_title || `${event.name} — Patrocínio e oportunidades para marcas`;
  const description = event.seo_description || event.short_description || event.tagline || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/eventos/${event.slug}` },
    robots: event.noindex || event.is_demo ? { index: false, follow: true } : undefined,
    icons: branding.favicon_url ? { icon: branding.favicon_url } : undefined,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      title,
      description,
      url: `/eventos/${event.slug}`,
      siteName: event.name,
      ...(event.og_image_url ? { images: [{ url: event.og_image_url, width: 1200, height: 630 }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    other: { "theme-color": branding.color_background },
  };
}

export default async function Page({ params }: PageProps<"/eventos/[slug]">) {
  const { slug } = await params;
  const bundle = await load(slug);
  if (!bundle) notFound();
  const { event } = bundle;
  const hero = bundle.sections.find((s) => s.type === "hero");
  const image = (hero?.settings as HeroSettings | undefined)?.image_desktop;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.short_description ?? event.description ?? undefined,
    startDate: event.starts_on ?? undefined,
    endDate: event.ends_on ?? event.starts_on ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: event.og_image_url || image || undefined,
    url: `${siteUrl()}/eventos/${event.slug}`,
    location: event.venue || event.city
      ? { "@type": "Place", name: event.venue ?? event.city, address: { "@type": "PostalAddress", addressLocality: event.city ?? undefined, addressRegion: event.state ?? undefined, addressCountry: event.country ?? "BR" } }
      : undefined,
    organizer: event.organizer_name ? { "@type": "Organization", name: event.organizer_name, email: event.contact_email ?? undefined } : undefined,
    disambiguatingDescription: eventDateLabel(event.starts_on, event.ends_on, event.date_label) || undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <EventPage bundle={bundle} />
    </>
  );
}
