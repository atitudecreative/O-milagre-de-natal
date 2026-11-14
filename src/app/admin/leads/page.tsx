import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { leadsQuery, parseLeadFilters } from "@/lib/data/leads";
import { Badge, Empty, PageHeader, Panel, Stat, buttonClass } from "@/components/admin/ui";
import { Input, Select } from "@/components/admin/ui/fields";
import { LEAD_STATUS_LABEL, LEAD_STATUS_ORDER } from "@/lib/labels";
import { formatDateTime, relativeTime } from "@/lib/format";
import type { LeadRow } from "@/lib/types";

export const metadata: Metadata = { title: "Leads" };
const PAGE = 25;

const TONE = { new: "info", contacted: "neutral", negotiating: "warn", proposal_sent: "ink", won: "ok", lost: "neutral" } as const;

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const session = await requirePermission("leads.read");
  const sp = await searchParams;
  const f = parseLeadFilters(sp);
  const page = Math.max(1, Number(sp.p) || 1);
  const supabase = await createClient();
  const [{ data, count }, { data: events }, { data: interestRows }, { data: stats }] = await Promise.all([
    leadsQuery(supabase, f).range((page - 1) * PAGE, page * PAGE - 1),
    supabase.from("events").select("id, name").order("name"),
    supabase.from("leads").select("interest, utm_source").limit(2000),
    supabase.from("leads").select("status").limit(10000),
  ]);
  const leads = (data ?? []) as unknown as (LeadRow & { event: { id: string; name: string } | null })[];
  const interests = Array.from(new Set((interestRows ?? []).map((r) => r.interest).filter(Boolean))) as string[];
  const sources = Array.from(new Set((interestRows ?? []).map((r) => r.utm_source).filter(Boolean))) as string[];
  const total = stats?.length ?? 0;
  const won = stats?.filter((s) => s.status === "won").length ?? 0;
  const open = stats?.filter((s) => !["won", "lost"].includes(s.status)).length ?? 0;
  const fresh = stats?.filter((s) => s.status === "new").length ?? 0;
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString();
  const pages = Math.ceil((count ?? 0) / PAGE);
  const hasFilters = Object.values(f).some(Boolean);

  return (
    <>
      <PageHeader title="Leads" description="Empresas interessadas em patrocinar. Cada contato está vinculado ao evento de origem."
        actions={session.can("leads.export") ? <a href={`/api/admin/leads/export${qs ? `?${qs}` : ""}`} className={buttonClass("secondary")}>Exportar CSV</a> : null} />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total" value={total} />
        <Stat label="Novos (sem contato)" value={fresh} accent={fresh > 0} />
        <Stat label="Em andamento" value={open} />
        <Stat label="Taxa de fechamento" value={total ? `${((won / total) * 100).toFixed(1)}%` : "—"} hint={`${won} fechados`} />
      </div>

      <form method="get" className="mb-6 grid gap-2 rounded-xl bg-card p-3 ring-1 ring-line sm:grid-cols-2 lg:grid-cols-[2fr_1.3fr_1fr_1fr_1fr_1fr_auto]">
        <Input name="q" placeholder="Buscar nome, empresa, e-mail…" defaultValue={f.q} aria-label="Buscar" />
        <Select name="evento" defaultValue={f.evento ?? ""} aria-label="Evento">
          <option value="">Todos os eventos</option>
          {events?.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </Select>
        <Select name="status" defaultValue={f.status ?? ""} aria-label="Status">
          <option value="">Todos os status</option>
          {LEAD_STATUS_ORDER.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABEL[s]}</option>)}
        </Select>
        <Select name="interesse" defaultValue={f.interesse ?? ""} aria-label="Interesse">
          <option value="">Interesse</option>
          {interests.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Input name="de" type="date" defaultValue={f.de} aria-label="De" />
        <Input name="ate" type="date" defaultValue={f.ate} aria-label="Até" />
        <div className="flex gap-2">
          <button type="submit" className={buttonClass("primary")}>Filtrar</button>
          {hasFilters ? <Link href="/admin/leads" className={buttonClass("ghost")}>Limpar</Link> : null}
        </div>
        {sources.length ? (
          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:col-span-2 lg:col-span-7">
            <span className="text-mute">Origem:</span>
            {["direto", ...sources].map((s) => {
              const p = new URLSearchParams(qs);
              if (f.origem === s) p.delete("origem"); else p.set("origem", s);
              return <Link key={s} href={`/admin/leads?${p}`} className={`rounded-full px-2.5 py-1 ${f.origem === s ? "bg-ink text-card" : "ring-1 ring-line hover:bg-paper-2"}`}>{s}</Link>;
            })}
          </div>
        ) : null}
      </form>

      {!leads.length ? (
        <Empty title={hasFilters ? "Nada encontrado" : "Nenhum lead ainda"} description={hasFilters ? "Ajuste os filtros." : "Quando alguém preencher o formulário de um evento publicado, o contato aparecerá aqui."} />
      ) : (
        <Panel padded={false}>
          <div className="overflow-x-auto adm-scroll">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="text-left text-xs text-mute">
                <tr className="border-b border-line">
                  <th className="px-5 py-2.5 font-medium">Empresa / contato</th>
                  <th className="px-3 py-2.5 font-medium">Evento</th>
                  <th className="px-3 py-2.5 font-medium">Interesse</th>
                  <th className="px-3 py-2.5 font-medium">Origem</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Recebido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {leads.map((l) => (
                  <tr key={l.id} className="group relative hover:bg-paper">
                    <td className="px-5 py-3">
                      <Link href={`/admin/leads/${l.id}`} className="font-medium after:absolute after:inset-0 group-hover:underline">
                        {!l.seen_at && l.status === "new" ? <span className="mr-2 inline-block h-2 w-2 rounded-full bg-info align-middle" aria-label="Não visto" /> : null}
                        {l.company}
                      </Link>
                      <span className="block text-xs text-mute">{l.full_name}{l.job_title ? ` · ${l.job_title}` : ""}</span>
                    </td>
                    <td className="px-3 py-3 text-ink-2">{l.event?.name}</td>
                    <td className="px-3 py-3 text-ink-2">{l.tier_name ? <>Cota <strong className="font-medium">{l.tier_name}</strong></> : l.interest}</td>
                    <td className="px-3 py-3 text-xs text-mute">{l.utm_source ?? l.cta_origin ?? "direto"}</td>
                    <td className="px-3 py-3"><Badge tone={TONE[l.status]}>{LEAD_STATUS_LABEL[l.status]}</Badge></td>
                    <td className="px-5 py-3 text-right text-xs text-mute" title={formatDateTime(l.created_at)}>{relativeTime(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 ? (
            <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-mute">
              <span>{count} leads · página {page} de {pages}</span>
              <div className="flex gap-2">
                {page > 1 ? <Link className={buttonClass("secondary", "sm")} href={`/admin/leads?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(qs)), p: String(page - 1) })}`}>Anterior</Link> : null}
                {page < pages ? <Link className={buttonClass("secondary", "sm")} href={`/admin/leads?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(qs)), p: String(page + 1) })}`}>Próxima</Link> : null}
              </div>
            </div>
          ) : null}
        </Panel>
      )}
    </>
  );
}
