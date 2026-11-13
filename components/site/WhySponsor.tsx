import type { Row } from '@/lib/schema';
import { cx } from '@/lib/format';
import { TrackLink } from './motion';
import { H2, Sticker } from './ui';

const FILL = ['bg-white', 'bg-ouro', 'bg-pessego', 'bg-white', 'bg-menta', 'bg-cortina text-white', 'bg-white', 'bg-creme', 'bg-pinheiro text-white'];
const SPAN = ['lg:col-span-5', 'lg:col-span-7', 'lg:col-span-4', 'lg:col-span-4', 'lg:col-span-4', 'lg:col-span-7', 'lg:col-span-5', 'lg:col-span-6', 'lg:col-span-6'];

export function WhySponsor({ reasons, statement }: { reasons: Row[]; statement: string }) {
  return (
    <section id="patrocinio" className="relative overflow-hidden bg-papel py-20 sm:py-28">
      <div className="wrap">
        <div className="relative">
          <H2 className="max-w-[14ch]">Sua marca no centro do palco.</H2>
          <Sticker src="/media/v2/adesivos/cantora-azul.webp" r={8} className="right-0 top-0 hidden h-[260px] lg:block" />
        </div>
        <p className="mt-8 max-w-3xl text-[22px] font-bold leading-snug sm:text-[28px]">{statement}</p>

        <ol className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
          {reasons.map((r, i) => (
            <li key={r.id} className={cx('card flex flex-col p-6 sm:p-7', FILL[i % FILL.length], SPAN[i % SPAN.length])}>
              <h3 className="display hyphens-auto break-words text-[24px] leading-[0.95] sm:text-[28px]">{String(r.title)}</h3>
              <p className="mt-3 text-[15px] font-medium leading-relaxed opacity-85">{String(r.description)}</p>
              {r.moment ? (
                <p className="mt-auto pt-5">
                  <span className="inline-flex rounded-full border border-current px-3 py-1 text-[12px] font-bold uppercase tracking-[0.03em]">{String(r.moment)}</span>
                </p>
              ) : null}
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-2">
          <TrackLink href="#cotas" event="sponsor_cta" label="argumentos" className="pill pill-solid h-14 px-8">
            Ver cotas e valores
          </TrackLink>
        </div>
      </div>
    </section>
  );
}
