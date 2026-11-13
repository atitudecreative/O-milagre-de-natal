import type { Row } from '@/lib/schema';
import { H2 } from './ui';

export function Faq({ faqs }: { faqs: Row[] }) {
  if (!faqs.length) return null;
  return (
    <section id="faq" className="relative bg-papel py-20 sm:py-28">
      <div className="wrap grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <H2 className="text-[44px] sm:text-[64px] lg:sticky lg:top-28 lg:text-[46px] xl:text-[54px]">Perguntas frequentes.</H2>
        </div>
        <div className="space-y-2 lg:col-span-8">
          {faqs.map((f) => (
            <details key={f.id} className="group card overflow-hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-6 px-6 py-5">
                <span className="text-[18px] font-bold leading-snug sm:text-[20px]">{String(f.question)}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-carbon text-xl transition-transform duration-300 ease-out group-open:rotate-45 group-open:bg-ouro" aria-hidden>
                  +
                </span>
              </summary>
              <p className="max-w-2xl px-6 pb-6 text-[16px] font-medium leading-relaxed text-carbon/75">{String(f.answer)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
