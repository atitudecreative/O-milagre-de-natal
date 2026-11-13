import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { SETTINGS_GROUPS } from '@/lib/schema';
import { cx } from '@/lib/format';
import { saveSettingsAction } from '../../actions';
import { FieldInput, Notice, PageTitle } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/client';

export default async function Settings({ searchParams }: { searchParams: Promise<{ grupo?: string; ok?: string; erro?: string }> }) {
  await requireRole('content');
  const sp = await searchParams;
  const group = SETTINGS_GROUPS.find((g) => g.key === sp.grupo) ?? SETTINGS_GROUPS[0];
  const settings = await (await db()).getSettings();

  return (
    <div className="max-w-5xl">
      <PageTitle title="Textos, contato e SEO" subtitle="Informações gerais do evento. Ao salvar, o site é atualizado imediatamente." />
      <nav className="no-scrollbar mb-8 flex gap-1 overflow-x-auto border-b border-white/10" aria-label="Grupos">
        {SETTINGS_GROUPS.map((g) => (
          <a
            key={g.key}
            href={`/admin/configuracoes?grupo=${g.key}`}
            className={cx('shrink-0 border-b-2 px-4 py-3 text-sm transition', g.key === group.key ? 'border-gold text-cream' : 'border-transparent text-cream/50 hover:text-cream')}
          >
            {g.label}
          </a>
        ))}
      </nav>
      <Notice ok={sp.ok} erro={sp.erro} />
      {group.key === 'midiakit' && (
        <p className="mb-6 rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-cream/60">
          O botão do site usa o link fixo <code className="text-gold">/api/midia-kit</code>, que registra o download e redireciona para o PDF atual. Ao enviar um novo PDF, todos os links passam a entregar a nova versão.
        </p>
      )}
      <form action={saveSettingsAction.bind(null, group.key)} className="space-y-8">
        <input type="hidden" name="__keys" value={group.fields.map((f) => f.name).join(',')} />
        <div className="grid gap-6 md:grid-cols-2">
          {group.fields.map((f) => (
            <FieldInput key={f.name} field={f} value={settings[f.name]} />
          ))}
        </div>
        <SubmitButton>Salvar e publicar</SubmitButton>
      </form>
    </div>
  );
}
