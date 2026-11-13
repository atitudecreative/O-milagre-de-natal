import type { Row } from '@/lib/schema';
import { cx } from '@/lib/format';
import { TrackLink } from './motion';
import { Accent, Edge, Floater, H2, HEX } from './ui';

const SEAL = ['bg-ouro', 'bg-cortina text-white', 'bg-turquesa text-white', 'bg-pinheiro text-white', 'bg-picadeiro', 'bg-white'];

/** Argumentos em fluxo editorial (duas colunas desencontradas), sem grade de cards. */
export function WhySponsor({ reasons, statement }: { reasons: Row[]; statement: string }) {
  return (
    <section id="patrocinio" className="swirl sw-b relative bg-papel py-20 sm:py-28">
      <Edge color={HEX.papel} kind="scallop" />
      <div className="wrap">
        <div className="relative grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Accent>por que patrocinar</Accent>
            <H2 className="mt-2 max-w-[13ch]">Sua marca no centro do palco.</H2>
          </div>
          <p className="text-[20px] font-bold leading-snug sm:text-[24px] lg:col-span-5">{statement}</p>
          <Floater src="/media/v2/recortes/acrobata-seda-esq.webp" r={-10} className="-top-10 right-[40%] hidden h-[200px] xl:block" />
        </div>

        <ol className="mt-16 grid gap-x-14 sm:grid-cols-2">
          {reasons.map((r, i) => (
            <li key={r.id} className={cx('flex gap-5 py-6', i % 2 ? 'sm:translate-y-16' : '')}>
              <span
                className={cx('flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-carbon sm:h-20 sm:w-20', SEAL[i % SEAL.length])}
                style={{ transform: `rotate(${[-8, 6, -4, 9, -6][i % 5]}deg)` }}
              >
                <span className="serif text-[30px] leading-none sm:text-[38px]">{i + 1}</span>
              </span>
              <span>
                <h3 className="display text-[26px] leading-[0.95] sm:text-[30px]">{String(r.title)}</h3>
                <p className="mt-2 max-w-md text-[16px] font-medium leading-relaxed text-carbon/80">{String(r.description)}</p>
                {r.moment ? <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.03em] text-pinheiro">{String(r.moment)}</p> : null}
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-20 flex justify-center">
          <TrackLink href="#cotas" event="sponsor_cta" label="argumentos" className="pill pill-solid h-14 px-8">
            Ver cotas e valores
          </TrackLink>
        </div>
      </div>
    </section>
  );
}
