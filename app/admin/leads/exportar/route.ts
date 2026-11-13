import { db } from '@/lib/db';
import { can, getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLS = ['created_at', 'kind', 'status', 'company', 'name', 'email', 'phone', 'segment', 'tier', 'message', 'notes', 'source', 'utm_source', 'utm_medium', 'utm_campaign', 'referrer', 'page'];

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!can(user, 'leads')) return new Response('Não autorizado', { status: 401 });
  const sp = new URL(req.url).searchParams;
  const rows = (await (await db()).list('leads', { orderBy: 'created_at', desc: true })).filter(
    (l) => (!sp.get('status') || l.status === sp.get('status')) && (!sp.get('tipo') || l.kind === sp.get('tipo')),
  );
  const esc = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[=+\-@]/.test(s)) s = `'${s}`; // evita injeção de fórmulas em planilhas
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = '﻿' + [COLS.join(';'), ...rows.map((r) => COLS.map((c) => esc(r[c])).join(';'))].join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="contatos-milagre-do-natal-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
