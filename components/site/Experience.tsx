'use client';

import Image from 'next/image';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Row } from '@/lib/schema';
import { cx, dateParts } from '@/lib/format';
import { Reveal } from './motion';
import { SectionHead } from './SectionHead';

export function Experience({ experiences, sessions, people, venue }: { experiences: Row[]; sessions: Row[]; people: Row[]; venue: string }) {
  const [active, setActive] = useState(0);
  const current = experiences[active];

  return (
    <section id="experiencia" className="relative bg-night py-24 sm:py-36">
      <div className="wrap">
        <SectionHead
          n="03"
          label="Experiência"
          title={
            <>
              Uma noite em <em className="text-gold-grad">Belém</em>, no coração da Barra.
            </>
          }
          intro="Cada linguagem do palco trabalha para a mesma história. Passe pelas cenas para conhecer o espetáculo."
        />

        {experiences.length > 0 && (
          <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-16">
            {/* imagem fixa (desktop) */}
            <div className="relative hidden lg:col-span-6 lg:block">
              <div className="sticky top-28 aspect-[4/5] overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {current?.image ? (
                    <motion.div
                      key={current.id}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Image src={String(current.image)} alt={String(current.title)} fill sizes="45vw" className="object-cover" />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
                <p className="absolute bottom-6 left-6 font-sans text-[11px] uppercase tracking-[0.3em] text-champagne">
                  {String(active + 1).padStart(2, '0')} / {String(experiences.length).padStart(2, '0')} — {String(current?.kicker ?? '')}
                </p>
              </div>
            </div>

            <ol className="lg:col-span-6">
              {experiences.map((e, i) => (
                <li key={e.id} className="border-t hairline last:border-b">
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className="group grid w-full grid-cols-[auto_1fr] gap-x-6 py-8 text-left sm:py-10"
                    aria-current={active === i}
                  >
                    <span className={cx('font-sans text-xs transition-colors', active === i ? 'text-gold' : 'text-cream/35')}>{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="label block text-gold/60">{String(e.kicker ?? '')}</span>
                      <span className={cx('display mt-3 block text-3xl leading-tight transition-colors duration-500 sm:text-[42px]', active === i ? 'text-cream' : 'text-cream/45 group-hover:text-cream/80')}>
                        {String(e.title)}
                      </span>
                      <span className={cx('grid transition-all duration-700 ease-silk', active === i ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 lg:grid-rows-[0fr]')}>
                        <span className="overflow-hidden text-[15px] leading-relaxed text-cream/65">{String(e.description)}</span>
                      </span>
                      {e.image ? (
                        <span className="relative mt-6 block aspect-[16/10] overflow-hidden lg:hidden">
                          <Image src={String(e.image)} alt="" fill sizes="90vw" className="object-cover" />
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Programação */}
        {sessions.length > 0 && (
          <div id="programacao" className="mt-28 sm:mt-36">
            <Reveal className="flex flex-col justify-between gap-6 border-b hairline pb-8 md:flex-row md:items-end">
              <div>
                <p className="label">Programação</p>
                <h3 className="display mt-4 text-4xl text-cream sm:text-5xl">
                  {sessions.length} {sessions.length === 1 ? 'data' : 'datas'} de espetáculo
                </h3>
              </div>
              <p className="max-w-sm text-sm text-cream/55">{venue}</p>
            </Reveal>
            <div className="grid gap-px bg-cream/10 sm:grid-cols-2 lg:grid-cols-4">
              {sessions.map((x, i) => {
                const d = dateParts(String(x.date));
                return (
                  <Reveal key={x.id} delay={i * 0.06} className="group relative bg-night p-7 transition-colors duration-500 hover:bg-umber sm:p-8">
                    <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-gold/70">{d?.weekday}</p>
                    <p className="display mt-3 flex items-baseline gap-3 text-cream">
                      <span className="text-[84px] leading-none">{d?.day}</span>
                      <span className="text-2xl italic text-champagne/80">{d?.month}</span>
                    </p>
                    <p className="mt-6 text-base text-cream">{String(x.title)}</p>
                    <p className="mt-1 text-sm text-cream/55">{String(x.time || '')}</p>
                    {x.description ? <p className="mt-4 text-sm leading-relaxed text-cream/45">{String(x.description)}</p> : null}
                    <div className="mt-6 flex items-center justify-between gap-3">
                      {x.status ? <span className="border border-gold/30 px-2 py-1 font-sans text-[10px] uppercase tracking-[0.16em] text-gold/90">{String(x.status)}</span> : <span />}
                      {x.cta_url ? (
                        <a href={String(x.cta_url)} target="_blank" rel="noopener noreferrer" className="font-sans text-xs uppercase tracking-[0.2em] text-gold underline-offset-4 hover:underline">
                          Acessar →
                        </a>
                      ) : null}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        )}

        {/* Elenco e convidados */}
        <div className="mt-24">
          {people.length > 0 ? (
            <>
              <Reveal>
                <p className="label">Elenco e convidados</p>
              </Reveal>
              <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
                {people.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 4) * 0.06} as="figure">
                    <div className="relative aspect-[3/4] overflow-hidden bg-umber">
                      {p.photo ? <Image src={String(p.photo)} alt={String(p.name)} fill sizes="(max-width:768px) 45vw, 22vw" className="object-cover grayscale transition duration-700 hover:grayscale-0" /> : null}
                    </div>
                    <figcaption className="mt-4">
                      <p className="display text-xl text-cream">
                        {p.link ? (
                          <a href={String(p.link)} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                            {String(p.name)}
                          </a>
                        ) : (
                          String(p.name)
                        )}
                      </p>
                      <p className="mt-1 text-sm text-cream/55">{String(p.role ?? '')}</p>
                    </figcaption>
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <Reveal className="flex flex-col items-start justify-between gap-4 border hairline p-8 sm:flex-row sm:items-center">
              <p className="display text-2xl text-cream/80">Elenco e convidados especiais serão anunciados em breve.</p>
              <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-cream/40">Acompanhe os canais oficiais</p>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
