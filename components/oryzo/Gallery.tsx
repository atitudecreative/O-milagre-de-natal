'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Row } from '@/lib/schema';
import { cx } from '@/lib/format';

const SPAN: Record<string, string> = {
  hero: 'sm:col-span-4 sm:row-span-2',
  wide: 'sm:col-span-4',
  tall: 'sm:col-span-2 sm:row-span-2',
  square: 'sm:col-span-2',
};

/** Fotografia em sangria, cantos retos e gradação quente. */
export function DarkGallery({ items }: { items: Row[] }) {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % items.length));
      if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? o : (o - 1 + items.length) % items.length));
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, items.length]);
  if (!items.length) return null;
  const cur = open !== null ? items[open] : null;

  return (
    <section id="espetaculo" className="o-dash border-t">
      <div className="flex flex-col justify-between gap-6 px-[18px] py-16 sm:px-6 lg:flex-row lg:items-end">
        <h2 className="o-heading max-w-[14ch]">Um espetáculo de verdade.</h2>
        <p className="o-body max-w-[30ch]">Luz, cenário, figurino e projeção mapeada a serviço de uma história.</p>
      </div>
      <div className="grid grid-flow-row-dense auto-rows-[260px] grid-cols-1 gap-[2px] sm:auto-rows-[24vw] sm:grid-cols-8 lg:auto-rows-[18vw]">
        {items.map((it, i) => (
          <button key={it.id} type="button" onClick={() => setOpen(i)} className={cx('group relative overflow-hidden', SPAN[String(it.size)] ?? SPAN.square)} aria-label={`Ampliar: ${String(it.caption)}`}>
            <Image src={String(it.media)} alt={String(it.caption)} fill sizes="(max-width:640px) 100vw, 50vw" className="o-grade object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]" />
            <span className="o-micro absolute bottom-3 left-3 bg-walnut/70 px-2 py-1">{String(it.caption)}</span>
          </button>
        ))}
      </div>
      {cur && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-walnut p-[18px]" role="dialog" aria-modal="true" aria-label={String(cur.caption)} onClick={() => setOpen(null)}>
          <div className="relative flex-1">
            <Image src={String(cur.media)} alt={String(cur.caption)} fill sizes="100vw" className="object-contain" />
          </div>
          <div className="o-dash mt-3 flex items-center justify-between border-t pt-3">
            <p className="o-label">{String(cur.caption)}</p>
            <button className="o-ghost" onClick={() => setOpen(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
