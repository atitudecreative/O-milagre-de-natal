'use client';

import { useEffect, useState } from 'react';
import { cx } from '@/lib/format';
import { track } from '@/lib/track';

const NAV = [
  { href: '#sobre', label: 'O musical' },
  { href: '#numeros', label: 'Números' },
  { href: '#cotas', label: 'Cotas' },
  { href: '#contato', label: 'Contato' },
];

/** Navegação fixa e transparente, quatro itens, sublinhado tracejado no item ativo. */
export function Nav({ wordmark }: { wordmark: string }) {
  const [active, setActive] = useState('');
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ids = NAV.map((n) => n.href.slice(1));
    const onScroll = () => {
      setSolid(scrollY > 40);
      let cur = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = id;
      }
      setActive(cur);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={cx('fixed inset-x-0 top-0 z-50 transition-colors duration-300', solid ? 'bg-walnut/85 backdrop-blur-md' : 'bg-transparent')}>
        <div className="flex h-16 items-center justify-between px-[18px] sm:px-6">
          <a href="#topo" className="o-label text-[13px] sm:text-[14px]">
            {wordmark}
          </a>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Seções">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className={cx('o-label border-b border-dashed pb-1 transition-colors', active === n.href.slice(1) ? 'border-warm' : 'border-transparent hover:border-driftwood')}
              >
                {n.label}
              </a>
            ))}
          </nav>
          <button type="button" onClick={() => setOpen((v) => !v)} className="o-ghost md:hidden" aria-expanded={open}>
            {open ? 'Fechar' : 'Menu'}
          </button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-walnut px-[18px] pb-10 pt-24 md:hidden">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="o-display o-dash border-t py-5">
              {n.label}
            </a>
          ))}
          <a
            href="#contato"
            onClick={() => {
              setOpen(false);
              track('sponsor_cta', 'oryzo-menu');
            }}
            className="o-btn mt-6"
          >
            Quero patrocinar
          </a>
        </div>
      )}
    </>
  );
}

/** Etiqueta vertical na borda direita — o "número de série" do evento. */
export function SideLabel({ text }: { text: string }) {
  return (
    <div className="pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 lg:block" aria-hidden>
      <p className="o-micro [writing-mode:vertical-rl]">{text}</p>
    </div>
  );
}

/** Campo de marca + palco 3D do ingresso/balde. */
export function BrandInput({ onChange }: { onChange: (v: string) => void }) {
  return (
    <input
      id="o-brand"
      maxLength={24}
      placeholder="Nome da sua empresa"
      onChange={(e) => onChange(e.target.value)}
      className="field o-sub !text-[22px]"
      autoComplete="organization"
    />
  );
}
