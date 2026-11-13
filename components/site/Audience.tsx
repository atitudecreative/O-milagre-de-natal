import type { Row } from '@/lib/schema';
import { cx, pairs } from '@/lib/format';
import { Reveal } from './motion';
import { SectionHead } from './SectionHead';
import { DemoBadge } from './Numbers';

const DONUT = ['#E6BC88', '#C68752', '#9CB6C4', '#5E7F91', '#7A4E2E', '#EFE7DA'];

function Bars({ data, demo }: { data: { label: string; value: number }[]; demo: boolean }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="mt-6 space-y-4">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex justify-between gap-4 text-sm text-cream/75">
            <span>{d.label}</span>
            <span className="font-sans tabular-nums text-cream">{d.value}%</span>
          </div>
          <div className="mt-2 h-2 w-full bg-cream/10">
            <div className={cx('h-full', demo ? 'demo-hatch bg-starlight/40' : 'bg-gradient-to-r from-copper to-gold')} style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Donut({ data, demo }: { data: { label: string; value: number }[]; demo: boolean }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-start">
      <svg viewBox="0 0 140 140" className={cx('h-40 w-40 shrink-0 -rotate-90', demo && 'opacity-70')} role="img" aria-label={data.map((d) => `${d.label} ${d.value}%`).join(', ')}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(239,231,218,0.08)" strokeWidth="16" />
        {data.map((d, i) => {
          const len = (d.value / total) * C;
          const el = (
            <circle
              key={d.label}
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={DONUT[i % DONUT.length]}
              strokeWidth="16"
              strokeDasharray={`${Math.max(len - 2, 0)} ${C}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="w-full space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-4 border-b hairline pb-2 text-cream/75">
            <span className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 shrink-0" style={{ background: DONUT[i % DONUT.length] }} />
              {d.label}
            </span>
            <span className="tabular-nums text-cream">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Audience({ items }: { items: Row[] }) {
  if (!items.length) return null;
  const facts = items.filter((i) => i.kind === 'fact');
  const charts = items.filter((i) => i.kind !== 'fact');
  return (
    <section id="publico" className="relative bg-midnight py-24 sm:py-36">
      <div className="stars absolute inset-0 opacity-30" aria-hidden />
      <div className="wrap relative">
        <SectionHead
          n="06"
          label="Perfil do público"
          title={<>Quem sua marca <em className="text-gold-grad">vai encontrar.</em></>}
          intro="Um público familiar, reunido em um dos momentos mais afetivos do ano."
        />

        {facts.length > 0 && (
          <div className="mt-16 grid gap-px bg-cream/10 md:grid-cols-3">
            {facts.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.08} className="bg-midnight p-8 sm:p-10">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="display text-3xl text-cream">{String(f.title)}</h3>
                  {f.status === 'demo' && <DemoBadge />}
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-cream/70">{String(f.text)}</p>
                {f.note ? <p className="mt-6 font-sans text-[10px] uppercase tracking-[0.2em] text-cream/35">{String(f.note)}</p> : null}
              </Reveal>
            ))}
          </div>
        )}

        {charts.length > 0 && (
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            {charts.map((c, i) => {
              const data = pairs(c.data);
              const demo = c.status === 'demo';
              return (
                <Reveal key={c.id} delay={i * 0.08} className={cx('relative border p-8 sm:p-10', demo ? 'border-starlight/25' : 'hairline')}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <h3 className="display text-2xl text-cream">{String(c.title)}</h3>
                    {demo && <DemoBadge />}
                  </div>
                  {c.kind === 'donut' ? <Donut data={data} demo={demo} /> : <Bars data={data} demo={demo} />}
                  {c.note ? <p className={cx('mt-6 text-xs leading-relaxed', demo ? 'text-starlight/80' : 'text-cream/40')}>{String(c.note)}</p> : null}
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
