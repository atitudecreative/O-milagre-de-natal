'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cx } from '@/lib/format';
import { track } from '@/lib/track';

const NAV = [
  { href: '#numeros', label: 'Números' },
  { href: '#historia', label: 'Edições' },
  { href: '#espetaculo', label: 'Espetáculo' },
  { href: '#sua-marca', label: 'Sua marca' },
  { href: '#cotas', label: 'Cotas' },
  { href: '#faq', label: 'FAQ' },
];

export function Header({ marquee }: { marquee: string[] }) {
  const [open, setOpen] = useState(false);
  const [bar, setBar] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const contact = document.getElementById('contato');
      const r = contact?.getBoundingClientRect();
      const nearForm = r ? r.top < innerHeight && r.bottom > 0 : false;
      setBar(scrollY > innerHeight * 0.8 && !nearForm);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const items = marquee.length ? marquee : ['Musical de Natal'];

  return (
    <>
      {/* Faixa corrida preta (topo) */}
      <div className="relative z-50 overflow-hidden bg-carbon py-2 text-white" aria-label="Destaques">
        <div className="marquee-track flex w-max whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.03em]">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
              {[...items, ...items].map((t, i) => (
                <span key={i} className="flex items-center gap-6 px-6">
                  {t}
                  <svg viewBox="0 0 20 20" className="h-3 w-3 text-ouro" aria-hidden><path fill="currentColor" d="M10 0l2.2 6.6L19 5l-4.6 5 4.6 5-6.8-1.6L10 20l-2.2-6.6L1 15l4.6-5L1 5l6.8 1.6z" /></svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
        <div className="mx-auto flex max-w-site items-center justify-between gap-3">
          <a href="#topo" className="flex h-12 items-center rounded-full border border-carbon bg-white px-5" aria-label="Musical de Natal — início">
            <span className="logotype block w-[92px] !text-carbon" aria-hidden />
          </a>
          <nav className="hidden items-center gap-1 rounded-full border border-carbon bg-white p-1 lg:flex" aria-label="Seções">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="rounded-full px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.03em] transition-colors duration-200 hover:bg-carbon hover:text-white">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="#contato" onClick={() => track('sponsor_cta', 'header')} className="pill pill-solid hidden h-12 sm:inline-flex">
              Seja patrocinador
            </a>
            <button
              type="button"
              className="pill pill-ghost h-12 w-12 !p-0 lg:hidden"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className={cx('text-2xl leading-none transition-transform duration-300', open && 'rotate-45')}>+</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 flex flex-col bg-papel px-4 pb-8 pt-28 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="flex flex-1 flex-col gap-2" aria-label="Menu">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="display rounded-card border border-carbon bg-white px-6 py-5 text-4xl"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                  {n.label}
                </motion.a>
              ))}
            </nav>
            <a
              href="#contato"
              onClick={() => {
                setOpen(false);
                track('sponsor_cta', 'menu');
              }}
              className="pill pill-solid mt-6 h-14"
            >
              Quero ser patrocinador
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* barra fixa de conversão no celular */}
      <div
        className={cx(
          'fixed inset-x-3 z-40 transition-transform duration-300 ease-out sm:hidden',
          bar && !open ? 'translate-y-0' : 'translate-y-[160%]',
        )}
        style={{ bottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <a href="#contato" onClick={() => track('sponsor_cta', 'barra-mobile')} className="pill pill-solid h-14 w-full">
          Seja um patrocinador →
        </a>
      </div>
    </>
  );
}
