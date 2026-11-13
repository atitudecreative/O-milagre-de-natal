import 'server-only';
import { cache } from 'react';
import { db } from '@/lib/db';
import { COLLECTIONS, type Row } from '@/lib/schema';

export type SiteData = {
  settings: Record<string, string>;
} & Record<(typeof COLLECTIONS)[number]['key'], Row[]>;

export const getSiteData = cache(async (): Promise<SiteData> => {
  const d = await db();
  const settings = await d.getSettings();
  const entries = await Promise.all(
    COLLECTIONS.map(async (c) => [c.key, (await d.list(c.key, { orderBy: 'sort' })).filter((r) => r.visible)] as const),
  );
  return { settings, ...Object.fromEntries(entries) } as SiteData;
});

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}
