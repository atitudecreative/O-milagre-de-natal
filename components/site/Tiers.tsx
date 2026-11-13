import type { Row } from '@/lib/schema';
import { brl, cx, lines } from '@/lib/format';
import { TierInterestButton } from './motion';
import { H2, Sticker } from './ui';

function price(t: Row) {
  const p = t.price as number | null;
  return p ? brl(p).replace('R$ ', 'R$ ') : String(t.price_label || 'Sob consulta');
}

const FILL: Record<string, string> = { Ouro: 'bg-ouro', Prata: 'bg-white', Bronze: 'bg-pessego' };

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-[13px] font-bold uppercase tracking-[0.03em]">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((b) => (
          <li key={b} className="flex gap-3 text-[15px] font-medium leading-snug">
            <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden>
              <circle cx="8" cy="8" r="7.5" fill="#fff" stroke="#0B0B0B" />
              <path d="M4.5 8.2l2.2 2.2 4.8-4.8" fill="none" stroke="#0B0B0B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Slots({ t }: { t: Row }) {
  const n = t.slots as number | null;
  if (n === null || n === undefined) return null;
  return (
    <span className="rounded-full border border-carbon bg-white px-3 py-1 text-[12px] font-bold uppercase">
      {n > 0 ? `${n} ${n === 1 ? 'vaga' : 'vagas'}` : 'Esgotada'}
    </span>
  );
}

export function Tiers({ tiers, disclaimer }: { tiers: Row[]; disclaimer: string }) {
  if (!tiers.length) return null;
  const featured = tiers.find((t) => t.highlight) ?? tiers[0];
  const others = tiers.filter((t) => t.id !== featured.id);
  const min = Math.min(...tiers.map((t) => Number(t.price) || Infinity));

  return (
    <section id="cotas" className="relative overflow-hidden bg-creme py-20 sm:py-28">
      <div className="wrap">
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <Sticker src="/media/v2/adesivos/cartola-laranja.webp" r={-6} className="-top-6 left-[44%] hidden h-[170px] lg:block" />
          <H2 className="max-w-[12ch]">Escolha sua cota.</H2>
          {Number.isFinite(min) && <p className="display whitespace-nowrap text-[28px] leading-none sm:text-[40px]">A partir de {brl(min)}</p>}
        </div>

        <article className={cx('card relative mt-12 grid gap-8 overflow-visible rounded-big p-7 sm:p-10 lg:grid-cols-12', FILL[String(featured.name)] ?? 'bg-ouro')}>
          <div className="lg:col-span-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-carbon bg-carbon px-3 py-1 text-[12px] font-bold uppercase text-white">Mais completa</span>
              <Slots t={featured} />
            </div>
            <h3 className="display mt-5 text-[96px] leading-[0.8] sm:text-[140px]">{String(featured.name)}</h3>
            <p className="display mt-4 text-[48px] leading-none sm:text-[64px]">{price(featured)}</p>
            <p className="mt-4 max-w-sm text-[16px] font-medium">{String(featured.tagline ?? '')}</p>
            <TierInterestButton tier={String(featured.name)} className="pill pill-solid mt-8 h-14 px-8">
              Tenho interesse
            </TierInterestButton>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
            <List title="Exposição de marca" items={lines(featured.benefits)} />
            <List title="Entregas e hospitalidade" items={lines(featured.deliverables)} />
          </div>
        </article>

        <div className={cx('mt-3 grid gap-3', others.length >= 3 ? 'lg:grid-cols-3' : others.length === 2 ? 'md:grid-cols-2' : '')}>
          {others.map((t) => (
            <article key={t.id} className={cx('card flex flex-col rounded-big p-7', FILL[String(t.name)] ?? 'bg-menta')}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="display hyphens-auto break-words text-[40px] leading-[0.88] xl:text-[48px]">{String(t.name)}</h3>
                <Slots t={t} />
              </div>
              <p className="display mt-3 text-[36px] leading-none">{price(t)}</p>
              <p className="mt-3 text-[15px] font-medium">{String(t.tagline ?? '')}</p>
              <div className="mt-6 flex-1 space-y-6">
                <List title="Exposição de marca" items={lines(t.benefits)} />
                <List title="Entregas e hospitalidade" items={lines(t.deliverables)} />
              </div>
              <TierInterestButton tier={String(t.name)} className="pill pill-ghost mt-8 h-12">
                Tenho interesse
              </TierInterestButton>
            </article>
          ))}
        </div>
        {disclaimer && <p className="mt-8 max-w-3xl text-[13px] font-medium text-carbon/60">{disclaimer}</p>}
      </div>
    </section>
  );
}
