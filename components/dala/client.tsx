'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/track';
import { cx } from '@/lib/format';

const NAV = [
  { href: '#numeros', label: 'Números' },
  { href: '#musical', label: 'O musical' },
  { href: '#sua-marca', label: 'Sua marca' },
  { href: '#cotas', label: 'Cotas' },
  { href: '#faq', label: 'FAQ' },
];

/** Logo: fragmento triangular violeta→verde + logotipo branco. */
export function Mark() {
  return (
    <a href="#topo" className="flex items-center gap-3" aria-label="O Milagre do Natal — início">
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <defs>
          <linearGradient id="dalaMark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8052ff" />
            <stop offset="1" stopColor="#15846e" />
          </linearGradient>
        </defs>
        <path d="M12 2 L22 20 L2 20 Z M12 9 L16.5 17 L7.5 17 Z" fill="url(#dalaMark)" fillRule="evenodd" />
      </svg>
      <span className="logotype block w-[104px] !text-white" />
    </a>
  );
}

export function DalaNav() {
  const [open, setOpen] = useState(false);
  const [bar, setBar] = useState(false);
  useEffect(() => {
    const on = () => {
      const c = document.getElementById('contato')?.getBoundingClientRect();
      setBar(scrollY > innerHeight * 0.8 && !(c && c.top < innerHeight && c.bottom > 0));
    };
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  return (
    <>
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-6">
          <Mark />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Seções">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="d-nav">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex">
              <a href="#contato" onClick={() => track('sponsor_cta', 'dala-nav')} className="d-btn">
                Quero patrocinar
              </a>
            </span>
            <button type="button" className="d-nav lg:hidden" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
              {open ? 'Fechar' : 'Menu'}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col justify-center gap-6 bg-black px-6">
          <button type="button" className="d-nav absolute right-6 top-7" onClick={() => setOpen(false)}>
            Fechar
          </button>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="d-h1">
              {n.label}
            </a>
          ))}
        </div>
      )}
      <div className={cx('fixed inset-x-4 z-30 transition-transform duration-300 ease-out sm:hidden', bar && !open ? 'translate-y-0' : 'translate-y-[160%]')} style={{ bottom: 'max(14px, env(safe-area-inset-bottom))' }}>
        <a href="#contato" onClick={() => track('sponsor_cta', 'dala-barra')} className="d-btn w-full">
          Quero patrocinar
        </a>
      </div>
    </>
  );
}

/** Campo que faz a constelação formar o nome da marca digitada. */
export function BrandField() {
  const tracked = useRef(false);
  return (
    <div>
      <label htmlFor="d-brand" className="d-label block">
        Nome da sua marca
      </label>
      <input
        id="d-brand"
        maxLength={24}
        autoComplete="organization"
        placeholder="Digite aqui"
        onChange={(e) => {
          const v = e.target.value;
          dispatchEvent(new CustomEvent('dala:brand', { detail: v }));
          if (v.trim().length >= 3 && !tracked.current) {
            tracked.current = true;
            track('brand_preview', 'constelacao');
          }
        }}
        className="mt-3 w-full border-0 border-b border-white/25 bg-transparent pb-3 text-[clamp(28px,3.4vw,42px)] font-normal tracking-[-0.04em] text-white placeholder:text-white/25 focus:border-[#8052ff] focus:outline-none"
      />
    </div>
  );
}

/** Carrossel de retratos com pontos violeta. */
export function Portraits({ people }: { people: { id: string; name: string; role: string; photo: string; link?: string }[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => {
      const w = el.firstElementChild?.getBoundingClientRect().width ?? 1;
      setActive(Math.round(el.scrollLeft / (w + 24)));
    };
    el.addEventListener('scroll', on, { passive: true });
    return () => el.removeEventListener('scroll', on);
  }, []);
  const go = (i: number) => {
    const el = ref.current;
    const child = el?.children[i] as HTMLElement | undefined;
    if (el && child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };
  return (
    <div>
      <ul ref={ref} className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6">
        {people.map((p) => (
          <li key={p.id} className="w-[72vw] shrink-0 snap-start sm:w-[300px]">
            <p className="text-[12px] uppercase tracking-[0.025em] text-[#8052ff]">{p.role}</p>
            <div className="relative mt-3 aspect-[4/5] overflow-hidden rounded-[24px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo} alt={p.name} loading="lazy" className="absolute bottom-0 left-1/2 h-[96%] w-auto max-w-none -translate-x-1/2" />
            </div>
            <p className="mt-4 text-[27px] leading-none tracking-[-0.02em]">
              {p.link ? (
                <a href={p.link} target="_blank" rel="noopener noreferrer">
                  {p.name}
                </a>
              ) : (
                p.name
              )}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Convidados">
        {people.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-label={p.name}
            onClick={() => go(i)}
            className={cx('h-2 w-2 rounded-full transition-colors', active === i ? 'bg-[#8052ff]' : 'bg-white/20')}
          />
        ))}
      </div>
    </div>
  );
}
