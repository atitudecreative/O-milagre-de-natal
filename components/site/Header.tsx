'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cx } from '@/lib/format';
import { track } from '@/lib/track';

const NAV = [
  { href: '#sobre', label: 'O musical' },
  { href: '#experiencia', label: 'Experiência' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#patrocinio', label: 'Patrocínio' },
  { href: '#cotas', label: 'Cotas' },
  { href: '#midia-kit', label: 'Mídia kit' },
  { href: '#faq', label: 'FAQ' },
];

export function Header({ dates }: { dates: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const contact = document.getElementById('contato');
      const nearForm = contact ? contact.getBoundingClientRect().top < window.innerHeight && contact.getBoundingClientRect().bottom > 0 : false;
      setShowBar(window.scrollY > window.innerHeight * 0.9 && !nearForm);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-silk',
          scrolled ? 'border-b border-cream/10 bg-night/80 backdrop-blur-xl' : 'bg-transparent',
        )}
      >
        <div className="wrap flex h-[72px] items-center justify-between gap-6">
          <a href="#topo" className="group flex items-center gap-3" aria-label="O Milagre do Natal — início">
            <span className="logotype block w-[96px] sm:w-[112px]" aria-hidden />
          </a>
          <nav className="hidden items-center gap-7 xl:flex" aria-label="Seções">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-cream/70 transition hover:text-gold">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden font-sans text-[11px] uppercase tracking-[0.2em] text-cream/50 lg:block xl:hidden 2xl:block">{dates}</span>
            <a href="#contato" onClick={() => track('sponsor_cta', 'header')} className="btn btn-gold hidden !px-5 !py-3 sm:inline-flex">
              Seja patrocinador
            </a>
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center xl:hidden"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className={cx('absolute h-px w-6 bg-cream transition duration-500', open ? 'rotate-45' : '-translate-y-1.5')} />
              <span className={cx('absolute h-px w-6 bg-cream transition duration-500', open ? '-rotate-45' : 'translate-y-1.5')} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-night/95 pt-24 backdrop-blur-xl xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <nav className="wrap flex flex-1 flex-col gap-1" aria-label="Menu">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="display border-b border-cream/10 py-4 text-3xl text-cream"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="mr-4 font-sans text-xs text-gold/70">{String(i + 1).padStart(2, '0')}</span>
                  {n.label}
                </motion.a>
              ))}
              <a
                href="#contato"
                onClick={() => {
                  setOpen(false);
                  track('sponsor_cta', 'menu');
                }}
                className="btn btn-gold mt-8"
              >
                Quero ser patrocinador
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra fixa de conversão no mobile */}
      <div
        className={cx(
          'fixed inset-x-0 bottom-0 z-40 border-t border-cream/10 bg-night/90 p-3 backdrop-blur-xl transition-transform duration-500 ease-silk sm:hidden',
          showBar && !open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <a href="#contato" onClick={() => track('sponsor_cta', 'barra-mobile')} className="btn btn-gold w-full">
          Seja um patrocinador <span className="arrow">→</span>
        </a>
      </div>
    </>
  );
}
