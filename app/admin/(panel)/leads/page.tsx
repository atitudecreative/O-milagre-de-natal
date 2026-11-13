import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { LEAD_STATUSES } from '@/lib/schema';
import { formatDateTime } from '@/lib/format';
import { inputCls, LinkBtn, Notice, PageTitle, StatusPill } from '@/components/admin/ui';

export default async function Leads({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireRole('leads');
  const sp = await searchParams;
  const all = await (await db()).list('leads', { orderBy: 'created_at', desc: true });
  const q = (sp.q ?? '').toLowerCase();
  const rows = all.filter(
    (l) =>
      (!sp.status || l.status === sp.status) &&
      (sp.tipo ? l.kind === sp.tipo : true) &&
      (!q || [l.name, l.company, l.email, l.segment, l.tier].some((v) => String(v ?? '').toLowerCase().includes(q))),
  );
  const qs = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <div>
      <PageTitle
        title={sp.tipo === 'midia_kit' ? 'Pedidos de mídia kit' : 'Empresas interessadas'}
        subtitle="Todos os envios do site, com data, origem (UTM/referência) e status do atendimento."
        actions={<LinkBtn href={`/admin/leads/exportar?${qs}`} variant="ghost">Exportar CSV</LinkBtn>}
      />
      <Notice ok={sp.ok} />
      <form className="mb-6 grid gap-3 sm:grid-cols-[1fr_200px_200px_auto]">
        <input name="q" defaultValue={sp.q} placeholder="Buscar por empresa, nome, e-mail, segmento…" className={inputCls} />
        <select name="status" defaultValue={sp.status ?? ''} className={`${inputCls} [&>option]:bg-ink`}>
          <option value="">Todos os status</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select name="tipo" defaultValue={sp.tipo ?? ''} className={`${inputCls} [&>option]:bg-ink`}>
          <option value="">Todos os tipos</option>
          <option value="patrocinio">Interesse em patrocínio</option>
          <option value="midia_kit">Pedido de mídia kit</option>
        </select>
        <button className="rounded-md border border-white/15 px-4 text-sm hover:border-gold/60">Filtrar</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.12em] text-cream/45">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Empresa / contato</th>
              <th className="px-4 py-3 font-medium">Segmento</th>
              <th className="px-4 py-3 font-medium">Cota</th>
              <th className="px-4 py-3 font-medium">Origem</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((l) => (
              <tr key={l.id} className="hover:bg-white/[0.03]">
                <td className="whitespace-nowrap px-4 py-3 text-cream/60">{formatDateTime(l.created_at)}</td>
                <td className="px-4 py-3">
                  <a href={`/admin/leads/${l.id}`} className="block text-cream hover:text-gold">{String(l.company || '—')}</a>
                  <span className="text-xs text-cream/45">{String(l.name || '')} · {String(l.email)}</span>
                </td>
                <td className="px-4 py-3 text-cream/65">{String(l.segment || '—')}</td>
                <td className="px-4 py-3 text-cream/65">{l.kind === 'midia_kit' ? 'Mídia kit' : String(l.tier || '—')}</td>
                <td className="px-4 py-3 text-xs text-cream/50">{String(l.utm_source || '') || (l.referrer ? new URL(String(l.referrer), 'http://x').hostname : 'Direto')}</td>
                <td className="px-4 py-3"><StatusPill status={String(l.status)} /></td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-cream/40">Nenhum contato encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-cream/35">{rows.length} de {all.length} registros</p>
    </div>
  );
}
