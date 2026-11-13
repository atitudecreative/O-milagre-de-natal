import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clientIp, rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Link estável do mídia kit: registra o download e redireciona para o PDF vigente. */
export async function GET(req: Request) {
  const d = await db();
  const settings = await d.getSettings();
  const target = settings.media_kit_url || '/media/midia-kit-o-milagre-do-natal.pdf';
  if (rateLimit(`kit:${clientIp(req.headers)}`, 20, 60 * 60 * 1000)) {
    const page = new URL(req.url).searchParams.get('origem') ?? '';
    await d.insert('events', { type: 'kit_download_server', label: page.slice(0, 60), page: '/api/midia-kit' });
  }
  return NextResponse.redirect(new URL(target, req.url), 302);
}
