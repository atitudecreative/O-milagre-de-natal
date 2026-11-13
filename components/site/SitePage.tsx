import { getSiteData, siteUrl } from '@/lib/content';
import { lines, whatsappLink } from '@/lib/format';
import { placementsFrom } from '@/lib/placements';
import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { HeroPalco } from '@/components/site/HeroPalco';
import { Numbers } from '@/components/site/Numbers';
import { Editions, Edition2026, Guests, PastSponsors } from '@/components/site/History';
import { Gallery } from '@/components/site/Gallery';
import { BrandMockups } from '@/components/site/BrandMockups';
import { WhySponsor } from '@/components/site/WhySponsor';
import { Audience } from '@/components/site/Audience';
import { Tiers } from '@/components/site/Tiers';
import { MediaKit } from '@/components/site/MediaKit';
import { Contact } from '@/components/site/Contact';
import { Faq } from '@/components/site/Faq';
import { FinalCta } from '@/components/site/FinalCta';
import { Footer } from '@/components/site/Footer';


export async function SitePage({ variant = 'claro' }: { variant?: 'claro' | 'palco' }) {
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
    <div className={variant === 'palco' ? 'tema-palco' : undefined}>
      <a href="#numeros" className="sr-only z-[80] rounded-full bg-carbon px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Pular para o conteúdo
      </a>
      <Header marquee={lines(s.marquee_items)} />
      <main>
        {variant === 'palco' ? <HeroPalco s={s} /> : <Hero s={s} />}
        <Numbers metrics={data.metrics} />
        <Editions editions={data.editions} />
        <Edition2026 s={s} sessions={data.sessions} experiences={data.experiences} />
        <Gallery items={data.gallery} />
        <Guests people={data.people} />
        <PastSponsors s={s} partners={data.partners} />
        <BrandMockups placements={placementsFrom(data.tiers)} />
        <WhySponsor reasons={data.reasons} statement={s.sponsor_statement} />
        <Audience items={data.audience} />
        <Tiers tiers={data.tiers} disclaimer={s.sponsor_disclaimer} />
        <MediaKit s={s} whatsapp={whatsapp} autoEmail={!!process.env.RESEND_API_KEY} />
        <Contact s={s} tiers={data.tiers.map((t) => String(t.name))} whatsapp={whatsapp} />
        <Faq faqs={data.faqs} />
        <FinalCta s={s} whatsapp={whatsapp} />
      </main>
      <Footer s={s} whatsapp={whatsapp} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </div>
  );
}

