import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Verificação de saúde usada pelo Render (healthCheckPath). */
export async function GET() {
  try {
    await (await db()).count('events');
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[health]', e);
    return Response.json({ ok: false }, { status: 503 });
  }
}
