import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { getCollection } from '@/lib/schema';
import { deleteItemAction, moveItemAction, toggleVisibleAction } from '../../../actions';
import { ConfirmButton, LinkBtn, Notice, PageTitle } from '@/components/admin/ui';

export default async function CollectionList({ params, searchParams }: { params: Promise<{ collection: string }>; searchParams: Promise<{ ok?: string }> }) {
  await requireRole('content');
  const { collection } = await params;
  const sp = await searchParams;
  const c = getCollection(collection);
  if (!c) notFound();
  const rows = await (await db()).list(c.key, { orderBy: 'sort' });
  const cols = c.fields.filter((f) => f.list);
  const thumb = c.fields.find((f) => f.type === 'image');

  return (
    <div>
      <PageTitle
        title={c.label}
        subtitle={
          <>
            <span className="mr-2 text-gold/70">{c.section}</span>
            {c.description}
          </>
        }
        actions={<LinkBtn href={`/admin/conteudo/${c.key}/novo`}>+ Adicionar {c.singular}</LinkBtn>}
      />
      <Notice ok={sp.ok} />
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.12em] text-cream/45">
            <tr>
              <th className="w-20 px-4 py-3 font-medium">Ordem</th>
              {thumb && <th className="w-24 px-4 py-3 font-medium">Imagem</th>}
              {cols.map((f) => (
                <th key={f.name} className="px-4 py-3 font-medium">{f.label}</th>
              ))}
              <th className="px-4 py-3 font-medium">No site</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r, i) => (
              <tr key={r.id} className={r.visible ? '' : 'opacity-50'}>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <form action={moveItemAction.bind(null, c.key, r.id, -1)}>
                      <button disabled={i === 0} className="h-7 w-7 rounded border border-white/10 text-xs disabled:opacity-20" aria-label="Subir">↑</button>
                    </form>
                    <form action={moveItemAction.bind(null, c.key, r.id, 1)}>
                      <button disabled={i === rows.length - 1} className="h-7 w-7 rounded border border-white/10 text-xs disabled:opacity-20" aria-label="Descer">↓</button>
                    </form>
                  </div>
                </td>
                {thumb && (
                  <td className="px-4 py-3">
                    {r[thumb.name] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={String(r[thumb.name])} alt="" className="h-12 w-16 rounded object-cover" />
                    ) : (
                      <span className="text-xs text-cream/30">—</span>
                    )}
                  </td>
                )}
                {cols.map((f, j) => {
                  let v = r[f.name];
                  if (f.type === 'select') v = f.options?.find((o) => o.value === v)?.label ?? v;
                  if (f.type === 'number' && (v === null || v === undefined)) v = '—';
                  return (
                    <td key={f.name} className="max-w-xs px-4 py-3 text-cream/80">
                      {j === 0 ? (
                        <a href={`/admin/conteudo/${c.key}/${r.id}`} className="line-clamp-2 text-cream hover:text-gold">{String(v || '(sem título)')}</a>
                      ) : (
                        <span className={String(r[f.name]) === 'demo' ? 'text-sky-200' : ''}>{String(v ?? '')}</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3">
                  <form action={toggleVisibleAction.bind(null, c.key, r.id)}>
                    <button className={`rounded-full px-3 py-1 text-xs ${r.visible ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/10 text-cream/50'}`}>
                      {r.visible ? 'Visível' : 'Oculto'}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <a href={`/admin/conteudo/${c.key}/${r.id}`} className="rounded-md border border-white/15 px-3 py-2 text-xs hover:border-gold/60">Editar</a>
                    <form action={deleteItemAction.bind(null, c.key, r.id)}>
                      <ConfirmButton message={`Remover este ${c.singular}? Esta ação não pode ser desfeita.`}>Remover</ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={cols.length + 4} className="px-4 py-12 text-center text-cream/40">
                  Nenhum item cadastrado. <a href={`/admin/conteudo/${c.key}/novo`} className="text-gold underline">Adicionar o primeiro</a>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
