import type { Row } from '@/lib/schema';
import { Reveal } from './motion';
import { SectionHead } from './SectionHead';

export function Faq({ faqs }: { faqs: Row[] }) {
  if (!faqs.length) return null;
  return (
    <section id="faq" className="relative bg-ink py-24 sm:py-36">
      <div className="wrap grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHead n="11" label="Perguntas frequentes" title={<>Tudo o que você <em className="text-gold-grad">precisa saber.</em></>} />
          </div>
        </div>
        <div className="lg:col-span-8">
          {faqs.map((f, i) => (
            <Reveal key={f.id} delay={Math.min(i, 5) * 0.03}>
              <details className="group border-b hairline">
                <summary className="flex cursor-pointer items-start justify-between gap-6 py-7">
                  <span>
                    {f.category ? <span className="block font-sans text-[10px] uppercase tracking-[0.24em] text-gold/60">{String(f.category)}</span> : null}
                    <span className="display mt-2 block text-xl leading-snug text-cream transition group-hover:text-gold sm:text-2xl">{String(f.question)}</span>
                  </span>
                  <span className="relative mt-3 h-4 w-4 shrink-0" aria-hidden>
                    <span className="absolute left-0 top-1/2 h-px w-4 bg-gold" />
                    <span className="absolute left-1/2 top-0 h-4 w-px bg-gold transition-transform duration-500 group-open:rotate-90 group-open:scale-0" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-8 text-[15px] leading-relaxed text-cream/65">{String(f.answer)}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
