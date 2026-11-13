import type { Row } from '@/lib/schema';
import { cx, pairs } from '@/lib/format';
import { Accent, Edge, H2, HEX } from './ui';
import { DemoBadge } from './Numbers';

const DONUT = ['#D2381F', '#E8B23A', '#1FA3A0', '#0E5A3A', '#F26A1B', '#0B0B0B'];

function Bars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="mt-6 space-y-4">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="flex justify-between gap-4 text-[15px] font-bold">
            <span>{d.label}</span>
            <span className="tabular">{d.value}%</span>
          </div>
          <div className="mt-2 h-4 w-full overflow-hidden rounded-full border border-carbon bg-white">
            <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: DONUT[i % DONUT.length] }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Donut({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const R = 54;
  const Cc = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-start">
      <svg viewBox="0 0 140 140" className="h-40 w-40 shrink-0 -rotate-90" role="img" aria-label={data.map((d) => `${d.label} ${d.value}%`).join(', ')}>
        <circle cx="70" cy="70" r={R + 11} fill="#fff" stroke="#0B0B0B" strokeWidth="1" />
        <circle cx="70" cy="70" r={R - 11} fill="#F1EBDD" stroke="#0B0B0B" strokeWidth="1" />
        {data.map((d, i) => {
          const len = (d.value / total) * Cc;
          const el = <circle key={d.label} cx="70" cy="70" r={R} fill="none" stroke={DONUT[i % DONUT.length]} strokeWidth="20" strokeDasharray={`${Math.max(len - 1.5, 0)} ${Cc}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </svg>
      <ul className="w-full space-y-2 text-[15px] font-bold">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-4 border-b border-dashed border-carbon/30 pb-2">
            <span className="flex items-center gap-3">
              <span className="h-3 w-3 shrink-0 rounded-full border border-carbon" style={{ background: DONUT[i % DONUT.length] }} />
              {d.label}
            </span>
            <span className="tabular">{d.value}%</span>
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
    <section id="publico" className="swirl sw-a relative bg-menta py-20 sm:py-28" style={{ ['--sw' as string]: '#B5DCD2' }}>
      <Edge color={HEX.menta} kind="wave" />
      <div className="wrap">
        <Accent>o público</Accent>
        <H2 className="mt-2 max-w-[14ch]">Quem sua marca vai encontrar.</H2>

        {/* atributos em círculos que se encostam */}
        {facts.length > 0 && (
          <ul className="mt-14 flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-0">
            {facts.map((f, i) => (
              <li
                key={f.id}
                className={cx(
                  'flex aspect-square w-[min(86vw,340px)] flex-col items-center justify-center rounded-full border border-carbon p-10 text-center md:-mx-3 md:w-[33%] md:max-w-[380px]',
                  ['bg-white', 'bg-ouro', 'bg-pessego'][i % 3],
                  i === 1 ? 'md:z-10 md:-translate-y-6' : '',
                )}
              >
                <h3 className="display text-[30px] leading-[0.9] lg:text-[36px]">{String(f.title)}</h3>
                <p className="mt-3 text-[15px] font-medium leading-snug">{String(f.text)}</p>
                {f.status === 'demo' && <DemoBadge className="mt-3" />}
              </li>
            ))}
          </ul>
        )}

        {charts.length > 0 && (
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {charts.map((c, i) => {
              const data = pairs(c.data);
              return (
                <div key={c.id} className={cx('rounded-[48px] border border-carbon bg-white p-8', i % 2 ? 'lg:mt-10' : '')}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="display text-[30px] leading-[0.9]">{String(c.title)}</h3>
                    {c.status === 'demo' && <DemoBadge />}
                  </div>
                  {c.kind === 'donut' ? <Donut data={data} /> : <Bars data={data} />}
                  {c.note ? <p className="mt-6 text-[13px] font-medium text-carbon/60">{String(c.note)}</p> : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
