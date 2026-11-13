import type { Metadata } from 'next';
import { getSiteData } from '@/lib/content';
import { SitePage } from '@/components/site/SitePage';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getSiteData();
  return {
    title: `${s.seo_title} · versão palco`,
    description: s.seo_description,
    alternates: { canonical: '/' },
    robots: { index: false, follow: true },
  };
}

export default async function VersaoPalco() {
  return <SitePage variant="palco" />;
}
