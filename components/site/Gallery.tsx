'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Row } from '@/lib/schema';
import { cx } from '@/lib/format';
import { Accent, Edge, HEX } from './ui';


function embedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
  return null;
}

export function Gallery({ items }: { items: Row[] }) {
  const categories = useMemo(() => ['Tudo', ...Array.from(new Set(items.map((i) => String(i.category || '')).filter(Boolean)))], [items]);
  const [filter, setFilter] = useState('Tudo');
  const [open, setOpen] = useState<number | null>(null);
  const list = filter === 'Tudo' ? items : items.filter((i) => i.category === filter);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + list.length) % list.length)), [list.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, step]);

  if (!items.length) return null;
  const cur = open !== null ? list[open] : null;
  const video = cur?.video_url ? String(cur.video_url) : '';

  return (
    <section id="espetaculo" className="swirl sw-c relative bg-menta py-20 sm:py-28" style={{ ['--sw' as string]: '#B5DCD2' }}>
      <Edge color={HEX.menta} kind="wave" />
      <div className="wrap">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <Accent>luz, cenário e emoção</Accent>
            <h2 className="display mt-2 max-w-[12ch] text-balance text-[44px] sm:text-[72px] lg:text-[104px]">Um espetáculo de verdade.</h2>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:justify-end lg:px-0" role="tablist" aria-label="Filtrar galeria">
            {categories.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={filter === c}
                onClick={() => setFilter(c)}
                className={cx('pill pill-sm shrink-0', filter === c ? 'pill-solid' : 'pill-ghost')}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* impressões coladas em colunas: cada foto na proporção original, sem corte */}
        <motion.ul layout className="mt-14 columns-1 gap-6 sm:columns-2 lg:columns-3">
          <AnimatePresence mode="popLayout">
            {list.map((it, i) => (
              <motion.li
                layout
                key={it.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="mb-8 break-inside-avoid"
              >
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="print group relative block w-full text-left"
                  style={{ transform: `rotate(${[-1.6, 1.2, -0.6, 1.8, -1.2][i % 5]}deg)` }}
                  aria-label={`Ampliar: ${String(it.caption)}`}
                >
                  {i % 3 === 0 && <span className="tape" aria-hidden />}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={String(it.media)} alt={String(it.caption)} loading="lazy" decoding="async" className="block h-auto w-full" />
                  <span className="flex items-center justify-between gap-3 px-1 pt-2.5">
                    <span className="text-[14px] font-bold leading-tight">{String(it.caption)}</span>
                    {it.video_url ? <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-carbon bg-ouro text-xs">▶</span> : null}
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>

      <AnimatePresence>
        {cur && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-carbon/90 p-4 sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={String(cur.caption)}
            onClick={close}
          >
            <div className="relative h-full w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative h-[calc(100%-64px)] w-full">
                {video ? (
                  embedUrl(video) ? (
                    <iframe src={embedUrl(video)!} className="h-full w-full rounded-card" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={String(cur.caption)} />
                  ) : (
                    <video src={video} poster={String(cur.media)} className="h-full w-full object-contain" controls autoPlay playsInline />
                  )
                ) : (
                  <Image src={String(cur.media)} alt={String(cur.caption)} fill sizes="100vw" className="object-contain" />
                )}
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="rounded-full border border-carbon bg-white px-4 py-2 text-[14px] font-bold">{String(cur.caption)}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => step(-1)} className="pill pill-ghost pill-sm" aria-label="Anterior">←</button>
                  <button onClick={() => step(1)} className="pill pill-ghost pill-sm" aria-label="Próxima">→</button>
                  <button onClick={close} className="pill pill-solid pill-sm">Fechar</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
