import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Empty, PageHeader, Panel, buttonClass } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Atividade" };
const PAGE = 50;

export default async function Page({ searchParams }: PageProps<"/admin/atividade">) {
  await requirePermission("audit.read");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.p) || 1);
  const supabase = await createClient();
  const [{ data, count }, { data: people }] = await Promise.all([
    supabase.from("audit_logs").select("*, event:events(id, name)", { count: "exact" }).order("created_at", { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1),
    supabase.from("profiles").select("id, full_name, email"),
  ]);
  const who = new Map((people ?? []).map((p) => [p.id, p.full_name || String(p.email ?? "")]));
  const pages = Math.ceil((count ?? 0) / PAGE);
  return (
    <>
      <PageHeader title="Atividade" description="Registro das ações administrativas: quem fez o quê, e quando." />
      {!data?.length ? <Empty title="Sem registros" /> : (
        <Panel padded={false}>
          <ul className="divide-y divide-line">
            {data.map((l) => {
              const ev = l.event as unknown as { id: string; name: string } | null;
              return (
                <li key={l.id} className="grid gap-1 px-5 py-3 text-sm md:grid-cols-[160px_180px_1fr]">
                  <span className="text-xs text-mute">{formatDateTime(l.created_at)}</span>
                  <span className="truncate font-medium">{who.get(l.actor_id ?? "") ?? "—"}</span>
                  <span className="min-w-0">
                    {l.summary ?? l.action}
                    {ev ? <> · <Link href={`/admin/eventos/${ev.id}`} className="text-mute hover:underline">{ev.name}</Link></> : null}
                    <code className="ml-2 text-[11px] text-faint">{l.action}</code>
                  </span>
                </li>
              );
            })}
          </ul>
          {pages > 1 ? (
            <div className="flex justify-between border-t border-line px-5 py-3 text-xs text-mute">
              <span>Página {page} de {pages}</span>
              <span className="flex gap-2">
                {page > 1 ? <Link href={`?p=${page - 1}`} className={buttonClass("secondary", "sm")}>Anterior</Link> : null}
                {page < pages ? <Link href={`?p=${page + 1}`} className={buttonClass("secondary", "sm")}>Próxima</Link> : null}
              </span>
            </div>
          ) : null}
        </Panel>
      )}
    </>
  );
}
