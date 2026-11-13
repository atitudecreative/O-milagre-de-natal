import type { Row } from '@/lib/schema';
import { compactNumber, cx } from '@/lib/format';
import { Counter } from './motion';
import { H2, Sticker } from './ui';

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cx('inline-flex items-center gap-1.5 rounded-full border border-carbon bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.03em]', className)}
      title="Campo demonstrativo: ainda não há dado real confirmado."
    >
      Demonstrativo
    </span>
  );
}

function Value({ m, className }: { m: Row; className?: string }) {
  const value = m.value as number | null;
  if (value === null || value === undefined) return <span className={cx('display', className)}>EM BREVE</span>;
  const c = m.compact ? compactNumber(value) : { value, unit: '' };
  return (
    <span className={cx('display tabular block whitespace-nowrap', className)}>
      {String(m.prefix ?? '')}
      <Counter to={c.value} decimals={c.value % 1 ? 1 : 0} />
      {c.unit && <span className="ml-[0.06em] text-[0.62em]">{c.unit.toUpperCase()}</span>}
      {m.suffix ? <span className="ml-[0.06em] text-[0.5em]">{String(m.suffix)}</span> : null}
    </span>
  );
}

const FILLS = ['bg-cortina text-white', 'bg-white', 'bg-turquesa text-white', 'bg-pinheiro text-white', 'bg-picadeiro'];

export function Numbers({ metrics }: { metrics: Row[] }) {
  if (!metrics.length) return null;
  const [lead, second, ...rest] = metrics;
  return (
    <section id="numeros" className="relative overflow-hidden border-y border-carbon bg-creme py-20 sm:py-28">
      <div className="wrap">
        <H2 className="max-w-[14ch]">Um sucesso que só cresce.</H2>

        {/* número-escultura */}
        <div className="relative mt-10 sm:mt-14">
          <Value m={lead} className="text-[24vw] leading-[0.78] sm:text-[19vw] lg:text-[232px]" />
          <p className="mt-4 max-w-md text-xl font-bold leading-tight sm:text-2xl">{String(lead.label)}</p>
          {lead.note ? <p className="mt-2 text-sm font-medium text-carbon/60">{String(lead.note)}</p> : null}
          <Sticker src="/media/v2/adesivos/cantora-dourada.webp" r={7} className="right-[2%] top-[-18%] hidden h-[300px] lg:block" />
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
          {second && (
            <div className="card relative flex flex-col justify-between bg-ouro p-7 sm:col-span-2 lg:col-span-5 lg:row-span-2 lg:p-10">
              <Value m={second} className="text-[18vw] leading-[0.8] sm:text-[104px] lg:text-[112px]" />
              <div className="mt-8">
                <p className="text-xl font-bold leading-tight">{String(second.label)}</p>
                {second.note ? <p className="mt-1 text-sm font-medium opacity-70">{String(second.note)}</p> : null}
              </div>
            </div>
          )}
          {rest.map((m, i) => (
            <div
              key={m.id}
              className={cx('card flex flex-col justify-between p-6 lg:p-8', m.status === 'demo' ? 'bg-white' : FILLS[i % FILLS.length], i < 2 ? 'lg:col-span-7' : rest.length - 2 === 2 ? 'lg:col-span-6' : 'lg:col-span-4')}
            >
              <Value m={m} className="text-[72px] leading-[0.85] lg:text-[96px]" />
              <div className="mt-6">
                <p className="text-lg font-bold leading-tight">{String(m.label)}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {m.status === 'demo' && <DemoBadge />}
                  {m.note ? <p className="text-sm font-medium opacity-75">{String(m.note)}</p> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
