import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { markLeadSeen } from "@/actions/leads";
import { Panel } from "@/components/admin/ui";
import { LeadManage, StatusPicker, Timeline } from "@/components/admin/LeadDetail";
import { formatDateTime } from "@/lib/format";
import type { InteractionRow, LeadRow } from "@/lib/types";

export const metadata: Metadata = { title: "Lead" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-line py-2.5 text-sm last:border-0">
      <dt className="text-mute">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

export default async function LeadPage({ params }: PageProps<"/admin/leads/[id]">) {
  const { id } = await params;
  const session = await requirePermission("leads.read");
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("leads").select("*, event:events(id, name, slug)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const lead = data as LeadRow & { event: { id: string; name: string; slug: string } | null };
  if (!lead.seen_at) await markLeadSeen(id);

  const [{ data: interactions }, { data: team }] = await Promise.all([
    supabase.from("lead_interactions").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, role").not("role", "is", null).eq("active", true).order("full_name"),
  ]);
  const authors = Object.fromEntries((team ?? []).map((t) => [t.id, t.full_name || "Equipe"]));
  const wa = lead.phone ? lead.phone.replace(/\D/g, "") : "";

  return (
    <div>
      <Link href="/admin/leads" className="text-xs text-mute hover:text-ink">← Leads</Link>
      <div className="mt-2 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-5xl leading-none">{lead.company}</h1>
          <p className="mt-2 text-sm text-mute">{lead.full_name}{lead.job_title ? ` · ${lead.job_title}` : ""} · recebido em {formatDateTime(lead.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <a href={`mailto:${lead.email}`} className="rounded-lg bg-card px-3 py-2 ring-1 ring-line hover:ring-ink">E-mail</a>
          {wa ? <a href={`https://wa.me/${wa.length <= 11 ? `55${wa}` : wa}`} target="_blank" rel="noreferrer" className="rounded-lg bg-card px-3 py-2 ring-1 ring-line hover:ring-ink">WhatsApp</a> : null}
          {lead.phone ? <a href={`tel:${wa}`} className="rounded-lg bg-card px-3 py-2 ring-1 ring-line hover:ring-ink">Ligar</a> : null}
        </div>
      </div>

      <Panel title="Status da negociação" className="mb-4">
        <StatusPicker leadId={lead.id} status={lead.status} canWrite={session.can("leads.write")} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Panel title="Interesse">
            <dl>
              <Row label="Evento">{lead.event ? <Link className="underline-offset-4 hover:underline" href={`/admin/eventos/${lead.event.id}`}>{lead.event.name}</Link> : null}</Row>
              <Row label="Interesse">{lead.interest}</Row>
              <Row label="Cota desejada">{lead.tier_name}</Row>
              <Row label="Segmento">{lead.segment}</Row>
              <Row label="Mensagem">{lead.message ? <span className="whitespace-pre-wrap">{lead.message}</span> : null}</Row>
            </dl>
          </Panel>
          <Timeline leadId={lead.id} items={(interactions ?? []) as InteractionRow[]} authors={authors} currentUser={session.userId} canWrite={session.can("leads.write")} />
        </div>
        <div className="space-y-4">
          <Panel title="Contato">
            <dl>
              <Row label="Nome">{lead.full_name}</Row>
              <Row label="Cargo">{lead.job_title}</Row>
              <Row label="E-mail"><a className="underline-offset-4 hover:underline" href={`mailto:${lead.email}`}>{lead.email}</a></Row>
              <Row label="Telefone">{lead.phone}</Row>
            </dl>
          </Panel>
          <LeadManage leadId={lead.id} assignedTo={lead.assigned_to} estimatedValue={lead.estimated_value} team={team ?? []} canWrite={session.can("leads.write")} canDelete={session.can("users.manage")} />
          <Panel title="Origem da conversão">
            <dl>
              <Row label="Botão (CTA)">{lead.cta_origin ?? "—"}</Row>
              <Row label="utm_source">{lead.utm_source}</Row>
              <Row label="utm_medium">{lead.utm_medium}</Row>
              <Row label="utm_campaign">{lead.utm_campaign}</Row>
              <Row label="Referência">{lead.referrer}</Row>
              <Row label="Página">{lead.landing_path}</Row>
            </dl>
          </Panel>
          <Panel title="Consentimento (LGPD)">
            <dl>
              <Row label="Aceite">{formatDateTime(lead.consent_at)}</Row>
              <Row label="Versão">{lead.consent_version}</Row>
              <Row label="Marketing">{lead.marketing_opt_in ? "Autorizou novidades" : "Não autorizou"}</Row>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
