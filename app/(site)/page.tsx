import type { Metadata } from 'next';
import { getSiteData, siteUrl } from '@/lib/content';
import { DalaPage } from '@/components/dala/DalaPage';

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
  return <DalaPage />;
}
