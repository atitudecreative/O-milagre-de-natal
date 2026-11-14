import type { EventBundle, GrandeurSettings, MediaRow, SectionRow } from "@/lib/types";
import { EvImage } from "../EvImage";
import { LightboxProvider, LightboxTrigger } from "../Lightbox";
import { ClipReveal, Reveal } from "../Reveal";
import { SectionHeader } from "../SectionHeader";
import { VideoModal } from "../VideoModal";

function Photo({ m, i, sizes, className, aspect }: { m: MediaRow; i: number; sizes: string; className?: string; aspect: string }) {
  return (
    <figure className={className}>
      <ClipReveal className={`relative overflow-hidden rounded-[var(--ev-radius)] ${aspect}`}>
        <LightboxTrigger index={i} label={m.alt || m.caption || "Foto"} className="group absolute inset-0 block h-full w-full">
          <EvImage src={m.url} alt={m.alt ?? ""} fill sizes={sizes} quality={75} className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" />
        </LightboxTrigger>
      </ClipReveal>
      {m.caption ? (
        <figcaption className="mt-3 flex gap-3 text-sm text-[var(--ev-muted)]">
          <span className="tabular-nums text-[var(--ev-subtle)]">{String(i + 1).padStart(2, "0")}</span>
          <span>{m.caption}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}

export function Grandeur({ bundle, section, index }: { bundle: EventBundle; section: SectionRow; index: number }) {
  const s = (section.settings ?? {}) as GrandeurSettings;
  const images = bundle.media.filter((m) => m.kind === "image" && m.in_gallery);
  const ordered = [...images.filter((m) => m.featured), ...images.filter((m) => !m.featured)];
  const quotes = bundle.testimonials.filter((t) => t.context === "audience").slice(0, 3);
  if (!ordered.length && !s.aftermovie_url && !quotes.length && !section.body) return null;

  const [hero, a, b, c, d, ...strip] = ordered;
  const items = ordered.map((m) => ({ url: m.url, alt: m.alt ?? "", caption: m.caption, credit: m.credit }));

  return (
    <section id="o-evento" className="ev-section overflow-hidden">
      <LightboxProvider items={items}>
        <div className="ev-container">
          <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} body={section.body} align="split" />
        </div>

        {hero ? (
          <div className="mt-16 md:mt-24 md:px-[clamp(1.25rem,4vw,4rem)]">
            <Photo m={hero} i={0} sizes="100vw" aspect="aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9]" className="[&_figcaption]:px-5 md:[&_figcaption]:px-0" />
          </div>
        ) : null}

        <div className="ev-container">
          {s.statement ? (
            <Reveal className="my-20 md:my-32 md:pl-[25%]">
              <p className="ev-display text-[clamp(2rem,4.6vw,4.4rem)] !leading-[0.98]">{s.statement}</p>
            </Reveal>
          ) : null}

          {a || b ? (
            <div className="mt-16 grid gap-8 md:mt-24 md:grid-cols-12 md:gap-6">
              {a ? <Photo m={a} i={1} sizes="(min-width: 768px) 58vw, 100vw" aspect="aspect-[4/5]" className="md:col-span-7" /> : null}
              {b ? <Photo m={b} i={2} sizes="(min-width: 768px) 33vw, 100vw" aspect="aspect-[3/4]" className="md:col-span-4 md:col-start-9 md:mt-40" /> : null}
            </div>
          ) : null}

          {c || d ? (
            <div className="mt-8 grid gap-8 md:mt-6 md:grid-cols-12 md:gap-6">
              {c ? <Photo m={c} i={3} sizes="(min-width: 768px) 42vw, 100vw" aspect="aspect-[1/1]" className="md:col-span-5 md:col-start-2 md:mt-16" /> : null}
              {d ? <Photo m={d} i={4} sizes="(min-width: 768px) 50vw, 100vw" aspect="aspect-[16/10]" className="md:col-span-6 md:col-start-7 md:mt-48" /> : null}
            </div>
          ) : null}
        </div>

        {strip.length ? (
          <div className="mt-20 md:mt-32">
            <div className="ev-container mb-6 flex items-end justify-between">
              <p className="ev-eyebrow">Momentos</p>
              <p className="ev-micro hidden sm:block">Arraste para ver mais →</p>
            </div>
            <ul className="ev-scroll-x flex gap-4 overflow-x-auto px-[clamp(1.25rem,4vw,4rem)] pb-4">
              {strip.map((m, k) => (
                <li key={m.id} className="w-[78vw] shrink-0 snap-start sm:w-[44vw] lg:w-[30vw]">
                  <Photo m={m} i={5 + k} sizes="(min-width: 1024px) 30vw, 78vw" aspect={k % 2 ? "aspect-[4/5]" : "aspect-[3/4]"} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {s.aftermovie_url ? (
          <div className="ev-container mt-20 md:mt-32">
            <Reveal>
              <VideoModal url={s.aftermovie_url} title={s.aftermovie_title || "Aftermovie"} className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[var(--ev-radius)] bg-[var(--ev-surface-2)] text-left sm:aspect-[16/9]">
                {s.aftermovie_poster ? (
                  <EvImage src={s.aftermovie_poster} alt="" fill sizes="100vw" className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]" />
                ) : null}
                <span className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/20" />
                <span className="absolute inset-0 flex flex-col justify-between p-6 text-white md:p-10">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em]">Aftermovie</span>
                  <span className="flex items-end justify-between gap-6">
                    <span className="ev-display max-w-[12ch] text-[clamp(2.2rem,6vw,5.5rem)]">{s.aftermovie_title || "Assista ao filme oficial"}</span>
                    <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--ev-accent)] text-[var(--ev-on-accent)] transition-transform duration-500 group-hover:scale-110 md:h-28 md:w-28" aria-hidden>
                      <svg width="22" height="26" viewBox="0 0 22 26" fill="currentColor"><path d="M22 13 0 26V0z" /></svg>
                    </span>
                  </span>
                </span>
              </VideoModal>
            </Reveal>
          </div>
        ) : null}

        {quotes.length ? (
          <div className="ev-container mt-24 grid gap-14 md:mt-36 md:grid-cols-3 md:gap-10">
            {quotes.map((q, i) => (
              <Reveal key={q.id} delay={i * 0.1} as="figure" className={i === 0 ? "md:col-span-3 md:max-w-5xl" : ""}>
                <blockquote className={i === 0 ? "ev-display text-[clamp(1.9rem,4vw,3.8rem)] !leading-[1.02] normal-case" : "text-lg leading-relaxed md:text-xl"}>
                  <span className="text-[var(--ev-accent)]">“</span>
                  {q.quote}
                  <span className="text-[var(--ev-accent)]">”</span>
                </blockquote>
                <figcaption className="mt-5 text-sm text-[var(--ev-muted)]">
                  <span className="font-semibold text-[var(--ev-fg)]">{q.author}</span>
                  {q.role || q.company ? <> — {[q.role, q.company].filter(Boolean).join(", ")}</> : null}
                </figcaption>
              </Reveal>
            ))}
          </div>
        ) : null}
      </LightboxProvider>
    </section>
  );
}
