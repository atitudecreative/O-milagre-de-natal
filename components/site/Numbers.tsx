import Image from 'next/image';
import type { Row } from '@/lib/schema';
import { compactNumber, cx } from '@/lib/format';
import { Counter, Reveal } from './motion';

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 border border-starlight/40 px-2 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-starlight',
        className,
      )}
      title="Campo demonstrativo: ainda não há dado real confirmado."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-starlight" aria-hidden />
      Demonstrativo
    </span>
  );
}

function MetricValue({ m }: { m: Row }) {
  const value = m.value as number | null;
  if (value === null || value === undefined) {
    return <span className="display whitespace-nowrap text-5xl text-cream/35 sm:text-6xl">Em breve</span>;
  }
  const c = m.compact ? compactNumber(value) : { value, unit: '' };
  return (
    <span className="display text-gold-grad text-[64px] leading-none sm:text-[88px] lg:text-[104px]">
      {String(m.prefix ?? '')}
      <Counter to={c.value} decimals={c.value % 1 ? 1 : 0} />
      {c.unit && <span className="ml-2 text-[0.5em]">{c.unit}</span>}
      {m.suffix ? <span className="ml-2 text-[0.5em]">{String(m.suffix)}</span> : null}
    </span>
  );
}

export function Numbers({ metrics }: { metrics: Row[] }) {
  if (!metrics.length) return null;
  const [lead, ...rest] = metrics;
  return (
    <section id="numeros" className="relative isolate overflow-hidden bg-abyss py-24 sm:py-32">
      <Image src="/media/luzes.webp" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-25" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-night via-abyss/80 to-night" />
      <div className="wrap">
        <Reveal>
          <p className="label flex items-center gap-4">
            <span className="text-cream/40">N° 02</span>
            <span className="h-px w-10 bg-gold/40" aria-hidden />
            Números e dimensão
          </p>
        </Reveal>

        <div className="mt-12 grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
          <Reveal className="lg:col-span-6">
            <MetricValue m={lead} />
            <p className="display mt-5 max-w-md text-2xl leading-snug text-cream sm:text-3xl">{String(lead.label)}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {lead.status === 'demo' && <DemoBadge />}
              {lead.note ? <p className="font-sans text-xs uppercase tracking-[0.16em] text-cream/40">{String(lead.note)}</p> : null}
            </div>
          </Reveal>

          <div className="grid gap-px bg-cream/10 sm:grid-cols-2 lg:col-span-6">
            {rest.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.07} className={cx('bg-abyss/95 p-7 sm:p-8', m.status === 'demo' && 'demo-hatch')}>
                <div className="scale-[0.62] origin-left sm:scale-[0.7]">
                  <MetricValue m={m} />
                </div>
                <p className="mt-1 text-[15px] leading-snug text-cream/80">{String(m.label)}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {m.status === 'demo' && <DemoBadge />}
                  {m.note ? <p className="font-sans text-[11px] uppercase tracking-[0.14em] text-cream/40">{String(m.note)}</p> : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
