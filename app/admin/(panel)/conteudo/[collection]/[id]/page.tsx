import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { getCollection } from '@/lib/schema';
import { saveItemAction } from '../../../../actions';
import { FieldInput, inputCls, Notice, PageTitle } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/client';

export default async function EditItem({ params, searchParams }: { params: Promise<{ collection: string; id: string }>; searchParams: Promise<{ erro?: string }> }) {
  await requireRole('content');
  const { collection, id } = await params;
  const sp = await searchParams;
  const c = getCollection(collection);
  if (!c) notFound();
  const isNew = id === 'novo';
  const row = isNew ? { visible: true } : await (await db()).get(c.key, id);
  if (!row) notFound();

  return (
    <div className="max-w-4xl">
      <a href={`/admin/conteudo/${c.key}`} className="text-xs text-cream/50 hover:text-gold">← {c.label}</a>
      <PageTitle title={isNew ? `Novo ${c.singular}` : `Editar ${c.singular}`} subtitle={c.description} />
      <Notice erro={sp.erro} />
      <form action={saveItemAction.bind(null, c.key, id)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {c.fields.map((f) => (
            <FieldInput key={f.name} field={f} value={(row as Record<string, unknown>)[f.name]} />
          ))}
        </div>
        <div className="grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-cream/80">
            <input type="checkbox" name="visible" defaultChecked={(row as Record<string, unknown>).visible === true} className="h-4 w-4 accent-[#E6BC88]" />
            Visível no site
          </label>
          <div>
            <label htmlFor="sort" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-cream/60">Ordem (menor aparece primeiro)</label>
            <input id="sort" name="sort" inputMode="numeric" defaultValue={String((row as Record<string, unknown>).sort ?? '')} className={inputCls} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SubmitButton>{isNew ? 'Adicionar e publicar' : 'Salvar e publicar'}</SubmitButton>
          <a href={`/admin/conteudo/${c.key}`} className="text-sm text-cream/50 hover:text-cream">Cancelar</a>
        </div>
      </form>
    </div>
  );
}
