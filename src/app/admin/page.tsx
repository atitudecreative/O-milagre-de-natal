import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge, ButtonLink, Empty, PageHeader, Panel, Stat } from "@/components/admin/ui";
import { AreaChart, BarList, Stacked } from "@/components/charts/AdminCharts";
import { LEAD_STATUS_LABEL, LEAD_STATUS_ORDER, STATUS_LABEL } from "@/lib/labels";
import { formatCurrency, formatInt, relativeTime } from "@/lib/format";
import type { EventStatus, LeadStatus } from "@/lib/types";

type Overview = {
  events_total: number; events_published: number; events_draft: number; events_archived: number;
  leads_total: number; leads_new: number; leads_won: number; leads_30d: number;
  tiers_sold: number; tiers_available: number; tiers_revenue: number; views_30d: number;
  leads_by_day: { day: string; count: number }[];
  leads_by_status: Partial<Record<LeadStatus, number>>;
  by_event: { id: string; name: string; slug: string; status: EventStatus; leads: number; won: number; views: number; visitors: number; sold: number; total: number }[];
};

const STATUS_COLOR: Record<LeadStatus, string> = { new: "#2f5bc0", contacted: "#6f6c64", negotiating: "#a86a12", proposal_sent: "#141413", won: "#2e7a4f", lost: "#c9c4b8" };

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const session = await requireStaff();
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.rpc("dashboard_overview");
  const o = data as unknown as Overview;
  const canLeads = session.can("leads.read");
  const { data: latest } = canLeads
    ? await supabase.from("leads").select("id, company, full_name, interest, tier_name, status, created_at, event:events(name)").order("created_at", { ascending: false }).limit(6)
    : { data: [] };

  const conversion = o.by_event
    .filter((e) => e.visitors > 0)
    .map((e) => ({ ...e, rate: (e.leads / e.visitors) * 100 }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);
  const firstName = session.profile.full_name.split(" ")[0];

  return (
    <>
      {sp.negado ? <p role="alert" className="mb-6 rounded-lg bg-[#f6ecd9] px-4 py-3 text-sm text-warn">Seu perfil não tem acesso àquela área.</p> : null}
      <PageHeader
        eyebrow={new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
        title={firstName ? `Olá, ${firstName}.` : "Visão geral"}
        description="Eventos, leads e cotas de todas as apresentações em um só lugar."
        actions={session.can("events.write") ? <ButtonLink href="/admin/eventos/novo">Novo evento</ButtonLink> : null}
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Stat label="Eventos ativos" value={o.events_total} hint={`${o.events_published} publicados · ${o.events_draft} em desenvolvimento`} />
        <Stat label="Leads recebidos" value={formatInt(o.leads_total)} hint={`${o.leads_30d} nos últimos 30 dias`} accent />
        <Stat label="Cotas comercializadas" value={o.tiers_sold} hint={`${o.tiers_available} ainda disponíveis`} />
        <Stat label="Receita em cotas" value={o.tiers_revenue ? formatCurrency(o.tiers_revenue).replace(/\s/g, " ") : "—"} hint="Soma das cotas vendidas com valor" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Leads por dia" description="Últimos 30 dias, todos os eventos" className="lg:col-span-2">
          <AreaChart data={o.leads_by_day} label="Leads por dia nos últimos 30 dias" />
        </Panel>
        <Panel title="Funil comercial" description={`${o.leads_won} negócios fechados`}>
          <Stacked parts={LEAD_STATUS_ORDER.map((s) => ({ label: LEAD_STATUS_LABEL[s], value: o.leads_by_status[s] ?? 0, color: STATUS_COLOR[s] }))} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Leads por evento" className="lg:col-span-1">
          {o.by_event.length ? (
            <BarList rows={o.by_event.slice(0, 6).map((e) => ({ label: <Link className="hover:underline" href={`/admin/eventos/${e.id}`}>{e.name}</Link>, value: e.leads }))} />
          ) : <p className="text-sm text-mute">Sem eventos.</p>}
        </Panel>
        <Panel title="Maior conversão" description="Leads ÷ visitantes únicos">
          {conversion.length ? (
            <BarList rows={conversion.map((e) => ({ label: e.name, value: e.rate, hint: `${e.leads}/${e.visitors}` }))} format={(v) => `${v.toFixed(1)}%`} />
          ) : <p className="text-sm text-mute">As taxas aparecem quando as páginas publicadas recebem visitas.</p>}
        </Panel>
        <Panel title="Cotas" description="Vendidas / total por evento">
          {o.by_event.filter((e) => e.total > 0).length ? (
            <BarList rows={o.by_event.filter((e) => e.total > 0).map((e) => ({ label: e.name, value: e.sold, hint: `de ${e.total}` }))} />
          ) : <p className="text-sm text-mute">Nenhuma cota cadastrada.</p>}
        </Panel>
      </div>

      {canLeads ? (
        <Panel title="Últimos contatos" className="mt-4" padded={false} actions={<Link href="/admin/leads" className="text-xs text-mute hover:text-ink">Ver todos →</Link>}>
          {latest?.length ? (
            <ul className="divide-y divide-line">
              {latest.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 hover:bg-paper md:grid-cols-[2fr_2fr_1fr_auto]">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{l.company}</span>
                      <span className="block truncate text-xs text-mute">{l.full_name}</span>
                    </span>
                    <span className="hidden min-w-0 truncate text-sm text-ink-2 md:block">{(l.event as unknown as { name: string } | null)?.name}</span>
                    <span className="hidden truncate text-xs text-mute md:block">{l.tier_name ? `Cota ${l.tier_name}` : l.interest}</span>
                    <span className="flex flex-col items-end gap-1">
                      <Badge tone={l.status === "new" ? "info" : l.status === "won" ? "ok" : l.status === "lost" ? "neutral" : "warn"}>{LEAD_STATUS_LABEL[l.status]}</Badge>
                      <span className="text-[11px] text-mute">{relativeTime(l.created_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5"><Empty title="Nenhum lead ainda" description="Assim que alguém preencher o formulário de um evento publicado, o contato aparece aqui." /></div>
          )}
        </Panel>
      ) : null}

      <Panel title="Eventos" className="mt-4" padded={false} actions={<Link href="/admin/eventos" className="text-xs text-mute hover:text-ink">Gerenciar →</Link>}>
        <div className="overflow-x-auto adm-scroll">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs text-mute">
              <tr className="border-b border-line">
                <th className="px-5 py-2.5 font-medium">Evento</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 text-right font-medium">Visitas</th>
                <th className="px-3 py-2.5 text-right font-medium">Leads</th>
                <th className="px-3 py-2.5 text-right font-medium">Fechados</th>
                <th className="px-5 py-2.5 text-right font-medium">Cotas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {o.by_event.map((e) => (
                <tr key={e.id} className="hover:bg-paper">
                  <td className="px-5 py-3"><Link href={`/admin/eventos/${e.id}`} className="font-medium hover:underline">{e.name}</Link></td>
                  <td className="px-3 py-3"><Badge tone={e.status === "published" ? "ok" : "neutral"}>{STATUS_LABEL[e.status]}</Badge></td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatInt(e.views)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{e.leads}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{e.won}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{e.total ? `${e.sold}/${e.total}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
