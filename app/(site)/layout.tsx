import { getSiteData } from '@/lib/content';
import { Analytics } from '@/components/site/Analytics';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings: s } = await getSiteData();
  return (
    <div className="grain">
      {children}
      <Analytics ga4={s.ga4_id || process.env.NEXT_PUBLIC_GA4_ID} pixel={s.meta_pixel_id || process.env.NEXT_PUBLIC_META_PIXEL_ID} />
    </div>
  );
}
