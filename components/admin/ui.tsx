import type { Field } from '@/lib/schema';
import { cx } from '@/lib/format';
import { ConfirmButton } from './client';

export { ConfirmButton };

export const inputCls =
  'w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold/70 focus:outline-none focus:ring-2 focus:ring-gold/20';

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="display text-3xl text-cream sm:text-4xl">{title}</h1>
        {subtitle && <div className="mt-2 max-w-2xl text-sm text-cream/55">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Notice({ ok, erro }: { ok?: string; erro?: string }) {
  if (!ok && !erro) return null;
  const msg: Record<string, string> = { salvo: 'Alterações salvas e publicadas.', removido: 'Item removido.', criado: 'Usuário criado.', atualizado: 'Usuário atualizado.', '1': 'Alterações salvas.' };
  return (
    <div
      role={erro ? 'alert' : 'status'}
      className={cx('mb-6 rounded-md border px-4 py-3 text-sm', erro ? 'border-red-400/40 bg-red-500/10 text-red-200' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200')}
    >
      {erro ? erro : msg[ok!] ?? 'Feito.'}
    </div>
  );
}

export function Btn({ children, variant = 'primary', className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  return (
    <button
      {...p}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition disabled:opacity-50',
        variant === 'primary' && 'bg-gold text-night hover:bg-champagne',
        variant === 'ghost' && 'border border-white/15 text-cream hover:border-gold/60 hover:text-gold',
        variant === 'danger' && 'border border-red-400/30 text-red-300 hover:bg-red-500/10',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LinkBtn({ href, children, variant = 'primary' }: { href: string; children: React.ReactNode; variant?: 'primary' | 'ghost' }) {
  return (
    <a
      href={href}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition',
        variant === 'primary' ? 'bg-gold text-night hover:bg-champagne' : 'border border-white/15 text-cream hover:border-gold/60 hover:text-gold',
      )}
    >
      {children}
    </a>
  );
}

function isVideo(url: string) {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}

export function FieldInput({ field, value }: { field: Field; value: unknown }) {
  const id = `f-${field.name}`;
  const v = value === null || value === undefined ? '' : String(value);
  const label = (
    <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-cream/60">
      {field.label}
      {field.required && <span className="text-gold"> *</span>}
    </label>
  );
  const help = field.help && <p className="mt-1.5 text-xs text-cream/40">{field.help}</p>;

  if (field.type === 'boolean') {
    return (
      <label className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-cream/80">
        <input id={id} type="checkbox" name={field.name} defaultChecked={value === true} className="h-4 w-4 accent-[#E6BC88]" />
        {field.label}
      </label>
    );
  }
  if (field.type === 'textarea' || field.type === 'lines' || field.type === 'pairs') {
    return (
      <div className="md:col-span-2">
        {label}
        <textarea id={id} name={field.name} defaultValue={v} rows={field.type === 'textarea' ? 4 : 6} className={cx(inputCls, field.type !== 'textarea' && 'font-mono text-[13px]')} placeholder={field.placeholder} required={field.required} />
        {field.type === 'lines' && <p className="mt-1.5 text-xs text-cream/40">Um item por linha.</p>}
        {help}
      </div>
    );
  }
  if (field.type === 'select') {
    return (
      <div>
        {label}
        <select id={id} name={field.name} defaultValue={v} className={cx(inputCls, '[&>option]:bg-ink')} required={field.required}>
          {!field.required && <option value="">—</option>}
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {help}
      </div>
    );
  }
  if (field.type === 'image' || field.type === 'media') {
    return (
      <div className="md:col-span-2">
        {label}
        <div className="flex flex-col gap-4 rounded-md border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-start">
          <div className="flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded bg-black/40 text-[11px] text-cream/30">
            {v ? (
              isVideo(v) ? (
                <video src={v} className="h-full w-full object-cover" muted />
              ) : /\.pdf(\?|$)/i.test(v) ? (
                <a href={v} target="_blank" className="text-gold underline">Abrir PDF</a>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v} alt="" className="h-full w-full object-cover" />
              )
            ) : (
              'sem arquivo'
            )}
          </div>
          <div className="flex-1 space-y-3">
            <input id={id} name={field.name} defaultValue={v} className={inputCls} placeholder="URL do arquivo (ou envie abaixo)" />
            <input
              type="file"
              name={`${field.name}__file`}
              accept={field.type === 'image' ? 'image/*' : 'image/*,video/mp4,video/webm,application/pdf'}
              className="block w-full text-xs text-cream/60 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-cream hover:file:bg-white/15"
            />
            {help}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      {label}
      <input
        id={id}
        name={field.name}
        defaultValue={v}
        type={field.type === 'number' ? 'text' : field.type === 'date' ? 'date' : field.type === 'url' ? 'url' : 'text'}
        inputMode={field.type === 'number' ? 'decimal' : undefined}
        className={inputCls}
        placeholder={field.placeholder}
        required={field.required}
      />
      {help}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    novo: 'bg-gold/15 text-gold',
    em_contato: 'bg-sky-400/15 text-sky-200',
    proposta: 'bg-violet-400/15 text-violet-200',
    negociacao: 'bg-amber-400/15 text-amber-200',
    fechado: 'bg-emerald-400/15 text-emerald-200',
    perdido: 'bg-white/10 text-cream/50',
  };
  const labels: Record<string, string> = { novo: 'Novo', em_contato: 'Em contato', proposta: 'Proposta', negociacao: 'Negociação', fechado: 'Fechado', perdido: 'Sem interesse' };
  return <span className={cx('inline-block rounded-full px-2.5 py-1 text-[11px] font-medium', map[status] ?? 'bg-white/10')}>{labels[status] ?? status}</span>;
}
