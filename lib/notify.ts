import 'server-only';
import type { Row } from '@/lib/schema';

/**
 * Notificações de novos contatos comerciais.
 *  - E-mail via Resend (RESEND_API_KEY + LEAD_NOTIFY_EMAIL)
 *  - Webhook genérico para CRM/automação (CRM_WEBHOOK_URL): RD Station, HubSpot,
 *    Pipedrive, n8n, Make ou Zapier recebem o JSON do lead.
 * Falhas não impedem o registro do lead — o status fica salvo em `webhook_status`.
 */

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || 'O Milagre do Natal <onboarding@resend.dev>';
  if (!key || !to) return { ok: false, skipped: true };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: to.split(',').map((s) => s.trim()), subject, html, reply_to: replyTo }),
  });
  if (!res.ok) console.error('[email] falha', res.status, await res.text());
  return { ok: res.ok, skipped: false };
}

export async function notifyLead(lead: Row) {
  const results: string[] = [];
  const kind = lead.kind === 'midia_kit' ? 'Pedido de mídia kit' : 'Interesse em patrocínio';

  const rows = [
    ['Tipo', kind],
    ['Nome', lead.name],
    ['Empresa', lead.company],
    ['E-mail', lead.email],
    ['Telefone', lead.phone],
    ['Segmento', lead.segment],
    ['Cota de interesse', lead.tier],
    ['Mensagem', lead.message],
    ['Origem', [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' / ') || lead.referrer || 'Direto'],
    ['Data', lead.created_at],
  ];
  const html = `<h2 style="font-family:Georgia,serif">${esc(kind)} — O Milagre do Natal</h2><table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#777">${esc(k)}</td><td><strong>${esc(v)}</strong></td></tr>`)
    .join('')}</table>`;

  try {
    const r = await sendEmail(process.env.LEAD_NOTIFY_EMAIL || '', `${kind}: ${lead.company || lead.name}`, html, String(lead.email || ''));
    results.push(r.skipped ? 'email:desativado' : r.ok ? 'email:ok' : 'email:erro');
  } catch (e) {
    console.error('[email]', e);
    results.push('email:erro');
  }

  const hook = process.env.CRM_WEBHOOK_URL;
  if (hook) {
    try {
      const { ip_hash: _ip, ...payload } = lead;
      const res = await fetch(hook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.CRM_WEBHOOK_SECRET ? { 'X-Webhook-Secret': process.env.CRM_WEBHOOK_SECRET } : {}),
        },
        body: JSON.stringify({ event: 'lead.created', lead: payload }),
        signal: AbortSignal.timeout(8000),
      });
      results.push(res.ok ? 'crm:ok' : `crm:erro_${res.status}`);
    } catch (e) {
      console.error('[crm webhook]', e);
      results.push('crm:erro');
    }
  } else results.push('crm:desativado');

  return results.join(' ');
}
