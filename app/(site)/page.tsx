import type { Metadata } from 'next';
import { getSiteData, siteUrl } from '@/lib/content';
import { whatsappLink } from '@/lib/format';
import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { About } from '@/components/site/About';
import { Numbers } from '@/components/site/Numbers';
import { Experience } from '@/components/site/Experience';
import { Gallery } from '@/components/site/Gallery';
import { WhySponsor } from '@/components/site/WhySponsor';
import { Audience } from '@/components/site/Audience';
import { Tiers } from '@/components/site/Tiers';
import { Partners } from '@/components/site/Partners';
import { MediaKit } from '@/components/site/MediaKit';
import { Contact } from '@/components/site/Contact';
import { Faq } from '@/components/site/Faq';
import { FinalCta } from '@/components/site/FinalCta';
import { Footer } from '@/components/site/Footer';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getSiteData();
  const og = s.og_image || '/media/og.jpg';
  return {
    title: s.seo_title,
    description: s.seo_description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: siteUrl(),
      siteName: s.event_name,
      title: s.seo_title,
      description: s.seo_description,
      images: [{ url: og, width: 1200, height: 630, alt: s.event_name }],
    },
    twitter: { card: 'summary_large_image', title: s.seo_title, description: s.seo_description, images: [og] },
    robots: { index: true, follow: true },
  };
}

export default async function Home() {
  const data = await getSiteData();
  const s = data.settings;
  const whatsapp = whatsappLink(s.whatsapp_number, s.whatsapp_message);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${s.event_kicker} ${s.event_name}`,
    description: s.seo_description,
    startDate: s.event_start_date,
    endDate: s.event_end_date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [`${siteUrl()}${s.og_image || '/media/og.jpg'}`],
    location: {
      '@type': 'Place',
      name: s.venue_name,
      address: { '@type': 'PostalAddress', streetAddress: s.venue_address, addressLocality: 'Rio de Janeiro', addressRegion: 'RJ', addressCountry: 'BR' },
    },
    organizer: { '@type': 'Organization', name: s.producer, url: siteUrl() },
  };

  return (
    <>
      <a href="#sobre" className="sr-only z-[80] bg-gold px-4 py-2 text-night focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Pular para o conteúdo
      </a>
      <Header dates={`${s.event_dates_label}`} />
      <main>
        <Hero s={s} />
        <About s={s} />
        <Numbers metrics={data.metrics} />
        <Experience experiences={data.experiences} sessions={data.sessions} people={data.people} venue={`${s.venue_name} · ${s.venue_address} · ${s.venue_city}`} />
        <Gallery items={data.gallery} />
        <WhySponsor reasons={data.reasons} statement={s.sponsor_statement} />
        <Audience items={data.audience} />
        <Tiers tiers={data.tiers} disclaimer={s.sponsor_disclaimer} />
        <Partners partners={data.partners} organizers={s.organizers} />
        <MediaKit s={s} whatsapp={whatsapp} autoEmail={!!process.env.RESEND_API_KEY} />
        <Contact s={s} tiers={data.tiers.map((t) => String(t.name))} whatsapp={whatsapp} />
        <Faq faqs={data.faqs} />
        <FinalCta s={s} whatsapp={whatsapp} />
      </main>
      <Footer s={s} whatsapp={whatsapp} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </>
  );
}
