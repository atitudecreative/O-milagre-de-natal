import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { notifyLead, sendEmail } from '@/lib/notify';
import { clientIp, hashIp, rateLimit } from '@/lib/ratelimit';
import { siteUrl } from '@/lib/content';

export const runtime = 'nodejs';

const CONSENT_TEXT =
  'Autorizo o uso dos meus dados para contato comercial sobre o patrocínio do musical O Milagre do Natal, conforme a Política de Privacidade (LGPD — Lei 13.709/2018).';

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[^\d+]/g, ''))
  .refine((v) => v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 13, 'Informe um telefone com DDD.');

const base = {
  email: z.string().trim().toLowerCase().email('Informe um e-mail válido.').max(160),
  consent: z.literal(true, { errorMap: () => ({ message: 'É necessário autorizar o contato para continuar.' }) }),
  website: z.string().optional(), // honeypot
  startedAt: z.number().optional(),
  turnstileToken: z.string().optional(),
  utm_source: z.string().max(120).optional(),
  utm_medium: z.string().max(120).optional(),
  utm_campaign: z.string().max(160).optional(),
  referrer: z.string().max(500).optional(),
  page: z.string().max(300).optional(),
};

const sponsorSchema = z.object({
  kind: z.literal('patrocinio'),
  name: z.string().trim().min(2, 'Informe seu nome.').max(120),
  company: z.string().trim().min(2, 'Informe o nome da empresa.').max(160),
  phone,
  segment: z.string().trim().min(2, 'Selecione o segmento.').max(80),
  tier: z.string().trim().min(2, 'Selecione a cota de interesse.').max(80),
  message: z.string().trim().max(2000).optional().default(''),
  ...base,
});

const kitSchema = z.object({
  kind: z.literal('midia_kit'),
  name: z.string().trim().max(120).optional().default(''),
  company: z.string().trim().max(160).optional().default(''),
  ...base,
});

const schema = z.discriminatedUnion('kind', [sponsorSchema, kitSchema]);

const FREE_MAIL = /@(gmail|hotmail|outlook|yahoo|icloud|live|bol|uol|terra|ig)\./i;

async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  return !!data.success;
}

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`lead:${ip}`, 6, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return NextResponse.json({ ok: false, error: 'Revise os campos destacados.', fieldErrors }, { status: 422 });
  }
  const data = parsed.data;

  // Anti-spam: honeypot preenchido ou envio rápido demais → aceita silenciosamente, sem gravar.
  if (data.website || (data.startedAt && Date.now() - data.startedAt < 2500)) {
    return NextResponse.json({ ok: true });
  }
  if (!(await verifyTurnstile(data.turnstileToken, ip))) {
    return NextResponse.json({ ok: false, error: 'Não foi possível validar a verificação anti-spam.' }, { status: 400 });
  }

  const d = await db();
  const lead = await d.insert('leads', {
    kind: data.kind,
    name: data.name,
    company: data.company,
    email: data.email,
    phone: 'phone' in data ? data.phone : '',
    segment: 'segment' in data ? data.segment : '',
    tier: 'tier' in data ? data.tier : '',
    message: 'message' in data ? data.message : '',
    consent: true,
    consent_text: `${CONSENT_TEXT} [aceito em ${new Date().toISOString()}]`,
    status: 'novo',
    notes: data.kind === 'patrocinio' && FREE_MAIL.test(data.email) ? 'E-mail não corporativo.' : '',
    source: data.kind === 'midia_kit' ? 'Formulário · Mídia kit' : 'Formulário · Patrocínio',
    utm_source: data.utm_source,
    utm_medium: data.utm_medium,
    utm_campaign: data.utm_campaign,
    referrer: data.referrer,
    page: data.page,
    user_agent: (req.headers.get('user-agent') || '').slice(0, 300),
    ip_hash: hashIp(ip),
  });

  const status = await notifyLead(lead);
  await d.update('leads', lead.id, { webhook_status: status });
  await d.insert('events', { type: data.kind === 'midia_kit' ? 'kit_request' : 'lead_submit', label: data.kind === 'patrocinio' ? data.tier : 'email', page: data.page });

  if (data.kind === 'midia_kit') {
    const settings = await d.getSettings();
    const kit = settings.media_kit_url?.startsWith('http') ? settings.media_kit_url : `${siteUrl()}/api/midia-kit`;
    await sendEmail(
      data.email,
      'Mídia kit — O Milagre do Natal',
      `<p style="font-family:Georgia,serif;font-size:18px">Olá${data.name ? `, ${data.name}` : ''}!</p><p style="font-family:Arial,sans-serif">Obrigado pelo interesse no musical <strong>O Milagre do Natal</strong>. Acesse o mídia kit oficial:</p><p><a href="${kit}" style="font-family:Arial,sans-serif;color:#9a5f2e">Baixar mídia kit (PDF)</a></p>`,
    ).catch((e) => console.error('[email kit]', e));
  }

  return NextResponse.json({ ok: true });
}
