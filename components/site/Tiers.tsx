import type { Row } from '@/lib/schema';
import { brl, cx, lines } from '@/lib/format';
import { Reveal, TierInterestButton } from './motion';
import { SectionHead } from './SectionHead';
import { Star } from './ArchLines';

function priceText(t: Row) {
  const p = t.price as number | null;
  return p ? brl(p) : String(t.price_label || 'Sob consulta');
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-gold/70">{title}</p>
      <ul className="mt-4 space-y-3">
        {items.map((b) => (
          <li key={b} className="flex gap-3 text-[15px] leading-snug text-cream/80">
            <Star className="mt-1 h-3 w-3 shrink-0 text-gold/80" />
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
    <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-champagne">
      {n > 0 ? `${n} ${n === 1 ? 'vaga disponível' : 'vagas disponíveis'}` : 'Vagas esgotadas'}
    </p>
  );
}

export function Tiers({ tiers, disclaimer }: { tiers: Row[]; disclaimer: string }) {
  if (!tiers.length) return null;
  const featured = tiers.find((t) => t.highlight) ?? tiers[0];
  const others = tiers.filter((t) => t.id !== featured.id);

  return (
    <section id="cotas" className="relative bg-night py-24 sm:py-36">
      <div className="wrap">
        <SectionHead
          n="07"
          label="Cotas de patrocínio"
          title={<>Escolha como sua marca <em className="text-gold-grad">entra em cena.</em></>}
          intro="Cada cota combina exposição de marca com entregas de relacionamento para receber clientes e parceiros."
        />

        {/* Cota em destaque */}
        <Reveal className="relative mt-16 overflow-hidden border border-gold/40 bg-gradient-to-br from-umber via-night to-night">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" aria-hidden />
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-12 lg:gap-12 lg:p-16">
            <div className="lg:col-span-5">
              <p className="label">Cota em destaque</p>
              <h3 className="display mt-5 text-[72px] leading-[0.9] text-gold-grad sm:text-[110px]">{String(featured.name)}</h3>
              <p className="mt-6 max-w-sm text-base text-cream/70">{String(featured.tagline ?? '')}</p>
              <div className="mt-10 border-t hairline pt-6">
                <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-cream/45">Investimento</p>
                <p className="display mt-2 text-5xl text-cream">{priceText(featured)}</p>
                <div className="mt-3">
                  <Slots t={featured} />
                </div>
              </div>
              <TierInterestButton tier={String(featured.name)} className="btn btn-gold mt-10">
                Tenho interesse <span className="arrow">→</span>
              </TierInterestButton>
            </div>
            <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:border-l lg:pl-12 hairline">
              <List title="Exposição de marca" items={lines(featured.benefits)} />
              <List title="Entregas e hospitalidade" items={lines(featured.deliverables)} />
            </div>
          </div>
        </Reveal>

        {/* Demais cotas */}
        {others.length > 0 && (
          <div className={cx('mt-px grid gap-px bg-cream/10', others.length >= 3 ? 'lg:grid-cols-3' : others.length === 2 ? 'md:grid-cols-2' : '')}>
            {others.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.08} className="group flex flex-col bg-night p-8 transition-colors duration-700 hover:bg-umber/70 sm:p-10">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b hairline pb-6">
                  <h3 className="display text-4xl text-cream sm:text-5xl">{String(t.name)}</h3>
                  <p className="display whitespace-nowrap text-2xl text-gold">{priceText(t)}</p>
                </div>
                <p className="mt-6 text-[15px] text-cream/60">{String(t.tagline ?? '')}</p>
                <div className="mt-8 flex-1 space-y-8">
                  <List title="Exposição de marca" items={lines(t.benefits)} />
                  <List title="Entregas e hospitalidade" items={lines(t.deliverables)} />
                </div>
                <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                  <Slots t={t} />
                  <TierInterestButton tier={String(t.name)} className="btn btn-ghost">
                    Tenho interesse <span className="arrow">→</span>
                  </TierInterestButton>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {disclaimer && (
          <Reveal className="mt-10 max-w-3xl">
            <p className="text-sm leading-relaxed text-cream/45">{disclaimer}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
