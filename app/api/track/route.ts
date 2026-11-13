import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clientIp, rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';

const ALLOWED = new Set(['sponsor_cta', 'tier_interest', 'kit_download', 'whatsapp_click', 'contact_cta', 'email_click', 'brand_preview']);

/** Registro interno de conversões (complementa GA4 e Meta Pixel; aparece no painel). */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`track:${ip}`, 60, 60 * 1000)) return new NextResponse(null, { status: 204 });
  const body = (await req.json().catch(() => null)) as { type?: string; label?: string; page?: string } | null;
  if (!body?.type || !ALLOWED.has(body.type)) return new NextResponse(null, { status: 204 });
  await (await db()).insert('events', {
    type: body.type,
    label: String(body.label ?? '').slice(0, 120),
    page: String(body.page ?? '').slice(0, 200),
  });
  return new NextResponse(null, { status: 204 });
}
