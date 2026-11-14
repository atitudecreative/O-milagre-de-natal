import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/env";

function esc(s: string | null | undefined) {
  return (s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/**
 * Notifica a equipe sobre um novo lead por e-mail (Resend) e/ou webhook.
 * Ambos são opcionais: sem configuração, o lead aparece apenas no painel.
 */
export async function notifyNewLead(leadId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!apiKey && !webhook) return;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SECRET_KEY) return;

  const admin = createAdminClient();
  const { data: lead } = await admin
    .from("leads")
    .select("id, full_name, company, job_title, email, phone, interest, tier_name, message, cta_origin, utm_source, event:events(id, name, slug)")
    .eq("id", leadId)
    .maybeSingle();
  if (!lead) return;
  const event = lead.event as unknown as { id: string; name: string; slug: string } | null;
  const link = `${siteUrl()}/admin/leads/${lead.id}`;

  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "lead.created", lead: { ...lead, admin_url: link } }),
    }).catch(() => {});
  }

  if (apiKey && event) {
    const { data: integ } = await admin.from("event_integrations").select("notify_emails").eq("event_id", event.id).maybeSingle();
    const fallback = (process.env.LEAD_NOTIFY_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const to = integ?.notify_emails?.length ? integ.notify_emails : fallback;
    if (!to.length) return;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;color:#141413">
        <p style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#6f6c64">Novo lead · ${esc(event.name)}</p>
        <h1 style="font-size:24px;margin:8px 0 16px">${esc(lead.company)}</h1>
        <table style="font-size:14px;line-height:1.6">
          <tr><td style="color:#6f6c64;padding-right:16px">Contato</td><td>${esc(lead.full_name)} — ${esc(lead.job_title)}</td></tr>
          <tr><td style="color:#6f6c64;padding-right:16px">E-mail</td><td>${esc(lead.email)}</td></tr>
          <tr><td style="color:#6f6c64;padding-right:16px">Telefone</td><td>${esc(lead.phone)}</td></tr>
          <tr><td style="color:#6f6c64;padding-right:16px">Interesse</td><td>${esc(lead.interest)}${lead.tier_name ? ` · Cota ${esc(lead.tier_name)}` : ""}</td></tr>
          <tr><td style="color:#6f6c64;padding-right:16px">Origem</td><td>${esc(lead.cta_origin ?? lead.utm_source ?? "direto")}</td></tr>
        </table>
        ${lead.message ? `<p style="margin-top:16px;padding:12px 16px;background:#f4f2ee;border-radius:8px;font-size:14px">${esc(lead.message)}</p>` : ""}
        <p style="margin-top:24px"><a href="${link}" style="background:#141413;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-size:14px">Abrir no painel</a></p>
      </div>`;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEAD_NOTIFY_FROM ?? "Palco <onboarding@resend.dev>",
        to,
        subject: `Novo lead: ${lead.company} — ${event.name}`,
        html,
      }),
    }).catch(() => {});
  }
}
