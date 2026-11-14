import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge, ButtonLink, Empty, PageHeader, cx } from "@/components/admin/ui";
import { EventActions } from "@/components/admin/EventActions";
import { EvImage } from "@/components/public/EvImage";
import { STATUS_LABEL } from "@/lib/labels";
import { eventDateLabel, relativeTime } from "@/lib/format";
import type { EventStatus, HeroSettings } from "@/lib/types";

export const metadata: Metadata = { title: "Eventos" };

const FILTERS: { key: string; label: string; status?: EventStatus }[] = [
  { key: "ativos", label: "Ativos" },
  { key: "published", label: "Publicados", status: "published" },
  { key: "draft", label: "Rascunhos", status: "draft" },
  { key: "archived", label: "Arquivados", status: "archived" },
];

export default async function EventsPage({ searchParams }: PageProps<"/admin/eventos">) {
  const session = await requireStaff();
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f.key === sp.filtro) ?? FILTERS[0];
  const supabase = await createClient();
  let q = supabase
    .from("events")
    .select("id, slug, name, status, starts_on, ends_on, date_label, city, updated_at, is_demo, event_branding(logo_url, color_background, color_accent), event_sections(type, settings)")
    .order("updated_at", { ascending: false });
  q = filter.status ? q.eq("status", filter.status) : q.neq("status", "archived");
  const [{ data: events }, { data: counts }] = await Promise.all([q, supabase.rpc("event_lead_counts")]);
  const leadMap = new Map((counts ?? []).map((c) => [c.event_id, c]));
  const can = { write: session.can("events.write"), publish: session.can("events.publish"), remove: session.can("events.delete") };

  return (
    <>
      <PageHeader title="Eventos" description="Cada evento tem sua própria página, identidade, cotas e leads." actions={can.write ? <ButtonLink href="/admin/eventos/novo">Novo evento</ButtonLink> : null} />
      <nav aria-label="Filtrar eventos" className="mb-6 flex gap-1 overflow-x-auto adm-scroll">
        {FILTERS.map((f) => (
          <Link key={f.key} href={f.key === "ativos" ? "/admin/eventos" : `/admin/eventos?filtro=${f.key}`} aria-current={f.key === filter.key ? "page" : undefined}
            className={cx("shrink-0 rounded-full px-3.5 py-1.5 text-sm", f.key === filter.key ? "bg-ink text-card" : "text-ink-2 hover:bg-paper-2")}>
            {f.label}
          </Link>
        ))}
      </nav>

      {!events?.length ? (
        <Empty title="Nenhum evento aqui" description={filter.key === "ativos" ? "Crie o primeiro evento para gerar sua apresentação comercial." : "Nenhum evento com este status."} action={can.write && filter.key === "ativos" ? <ButtonLink href="/admin/eventos/novo">Criar evento</ButtonLink> : null} />
      ) : (
        <ul className="grid gap-3">
          {events.map((e) => {
            const branding = (Array.isArray(e.event_branding) ? e.event_branding[0] : e.event_branding) as { logo_url: string | null; color_background: string; color_accent: string } | null;
            const hero = (e.event_sections as { type: string; settings: HeroSettings }[]).find((s) => s.type === "hero");
            const cover = hero?.settings?.image_desktop;
            const leads = leadMap.get(e.id);
            return (
              <li key={e.id} className="group grid grid-cols-[88px_1fr_auto] items-center gap-4 rounded-xl bg-card p-3 ring-1 ring-line transition hover:ring-line-strong md:grid-cols-[160px_1fr_auto_auto] md:gap-6">
                <Link href={`/admin/eventos/${e.id}/geral`} className="relative block aspect-[4/3] overflow-hidden rounded-lg" style={{ background: branding?.color_background ?? "#141413" }} tabIndex={-1} aria-hidden>
                  {cover ? <EvImage src={cover} alt="" fill sizes="160px" className="object-cover opacity-80" /> : null}
                  {branding?.logo_url ? (
                    <span className="absolute inset-0 flex items-center justify-center p-3"><EvImage src={branding.logo_url} alt="" width={120} height={40} className="max-h-8 w-auto object-contain drop-shadow" /></span>
                  ) : null}
                </Link>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/eventos/${e.id}/geral`} className="truncate text-base font-semibold hover:underline">{e.name}</Link>
                    <Badge tone={e.status === "published" ? "ok" : e.status === "archived" ? "neutral" : "warn"}>{STATUS_LABEL[e.status]}</Badge>
                    {e.is_demo ? <Badge>Demonstração</Badge> : null}
                  </div>
                  <p className="mt-1 truncate text-sm text-mute">{[eventDateLabel(e.starts_on, e.ends_on, e.date_label), e.city].filter(Boolean).join(" · ") || "Sem data definida"}</p>
                  <p className="mt-1 hidden truncate text-xs text-faint sm:block">
                    {e.status === "published" ? <a href={`/eventos/${e.slug}`} target="_blank" rel="noreferrer" className="hover:text-ink hover:underline">/eventos/{e.slug} ↗</a> : <span>/eventos/{e.slug}</span>}
                    <span className="mx-2">·</span>atualizado {relativeTime(e.updated_at)}
                  </p>
                </div>
                <div className="hidden text-right md:block">
                  <p className="font-display text-3xl leading-none tabular-nums">{leads?.total ?? 0}</p>
                  <p className="mt-1 text-xs text-mute">leads{leads?.fresh ? ` · ${leads.fresh} novos` : ""}</p>
                </div>
                <EventActions event={e} can={can} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
