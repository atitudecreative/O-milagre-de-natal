import type { Row } from '@/lib/schema';
import { compactNumber, cx } from '@/lib/format';
import { Counter } from './motion';
import { ConstellationBox } from '@/components/dala/Constellation';
import { Accent, Edge, Floater, H2, HEX, Seal } from './ui';

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

// selos espalhados: cor, giro e deslocamento vertical de cada um
const SEALS = [
  { fill: '#E8B23A', r: -6, y: 'lg:translate-y-6', text: '' },
  { fill: '#D2381F', r: 5, y: 'lg:-translate-y-4', text: 'text-white' },
  { fill: '#FFFFFF', r: -3, y: 'lg:translate-y-10', text: '' },
  { fill: '#1FA3A0', r: 7, y: 'lg:translate-y-0', text: 'text-white' },
  { fill: '#0E5A3A', r: -5, y: 'lg:translate-y-8', text: 'text-white' },
];

export function Numbers({ metrics, fx = false }: { metrics: Row[]; fx?: boolean }) {
  if (!metrics.length) return null;
  const [lead, ...rest] = metrics;
  return (
    <section id="numeros" className="swirl sw-denso relative bg-creme py-20 sm:py-28" style={{ ['--sw' as string]: '#EBCF8E' }}>
      <Edge color={HEX.creme} kind="wave" />
      <div className="wrap">
        <Accent>um sucesso que só cresce</Accent>
        <div className="relative mt-4">
          <Value m={lead} className="text-[24vw] leading-[0.78] sm:text-[19vw] lg:text-[232px]" />
          <H2 as="p" className="mt-4 max-w-[18ch] !text-[30px] sm:!text-[44px]">
            {String(lead.label)}
          </H2>
          {lead.note ? <p className="mt-2 text-sm font-medium text-carbon/60">Fonte: {String(lead.note)}</p> : null}
          {fx ? (
            <ConstellationBox kind="star" fill={0.95} count={1800} className="absolute -top-[10%] right-0 hidden h-[380px] w-[380px] lg:block" />
          ) : (
            <Floater src="/media/v2/recortes/acrobata-seda-dir.webp" r={8} className="right-[4%] top-[-6%] hidden h-[260px] lg:block" />
          )}
        </div>

        <ul className="mt-14 flex flex-wrap items-start justify-center gap-x-2 gap-y-4 sm:gap-x-4 lg:justify-between">
          {rest.map((m, i) => {
            const s = SEALS[i % SEALS.length];
            return (
              <li key={m.id} className={cx('w-[47%] sm:w-[31%] lg:w-[19%]', s.y)}>
                <div style={{ transform: `rotate(${s.r}deg)` }}>
                <Seal fill={m.status === 'demo' ? '#FFFFFF' : s.fill} className={cx('w-full', m.status === 'demo' ? '' : s.text)} style={{ color: !s.text || m.status === 'demo' ? '#0B0B0B' : undefined }}>
                  <Value m={m} className={cx('leading-[0.85]', m.compact || String(m.value ?? '').length > 3 ? 'text-[clamp(28px,6vw,44px)]' : 'text-[clamp(40px,9vw,72px)]')} />
                  <p className="mt-2 text-[12px] font-bold leading-tight sm:text-[13px]">{String(m.label)}</p>
                  {m.status === 'demo' && <DemoBadge className="mt-2" />}
                </Seal>
                </div>
                {m.note ? <p className="mx-auto mt-2 max-w-[90%] text-center text-[12px] font-medium text-carbon/60">{String(m.note)}</p> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
