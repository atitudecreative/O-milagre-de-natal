'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Row } from '@/lib/schema';
import { cx } from '@/lib/format';
import { SectionHead } from './SectionHead';

const SPAN: Record<string, string> = {
  hero: 'sm:col-span-4 sm:row-span-2',
  wide: 'sm:col-span-4',
  tall: 'sm:col-span-2 sm:row-span-2',
  square: 'sm:col-span-2',
};

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
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, step]);

  if (!items.length) return null;
  const cur = open !== null ? list[open] : null;
  const video = cur?.video_url ? String(cur.video_url) : '';

  return (
    <section id="galeria" className="relative bg-ink py-24 sm:py-36">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <SectionHead n="04" label="Galeria" title={<>O que acontece <em className="text-gold-grad">quando as luzes se acendem.</em></>} />
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:max-w-md lg:flex-wrap lg:justify-end lg:px-0" role="tablist" aria-label="Filtrar galeria">
            {categories.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={filter === c}
                onClick={() => setFilter(c)}
                className={cx(
                  'shrink-0 border px-4 py-2 font-sans text-[11px] uppercase tracking-[0.18em] transition',
                  filter === c ? 'border-gold bg-gold text-night' : 'border-cream/20 text-cream/70 hover:border-gold/60',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="mt-14 grid grid-flow-row-dense auto-rows-[220px] grid-cols-1 gap-3 sm:auto-rows-[200px] sm:grid-cols-8 lg:auto-rows-[240px]">
          <AnimatePresence mode="popLayout">
            {list.map((it, i) => (
              <motion.button
                layout
                key={it.id}
                type="button"
                onClick={() => setOpen(i)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={cx('group relative overflow-hidden bg-umber text-left', SPAN[String(it.size)] ?? SPAN.square)}
                aria-label={`Ampliar: ${String(it.caption)}`}
              >
                <Image
                  src={String(it.media)}
                  alt={String(it.caption)}
                  fill
                  sizes="(max-width:640px) 100vw, 50vw"
                  className="object-cover transition duration-[1.4s] ease-silk group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/0 to-transparent opacity-80 transition group-hover:opacity-100" />
                <span className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5">
                  <span>
                    <span className="block font-sans text-[10px] uppercase tracking-[0.24em] text-gold/80">{String(it.category ?? '')}</span>
                    <span className="display mt-1 block text-lg text-cream">{String(it.caption)}</span>
                  </span>
                  {it.video_url ? (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream/40 text-cream">▶</span>
                  ) : (
                    <span className="translate-y-2 font-sans text-xs text-cream/70 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">Ampliar ↗</span>
                  )}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {cur && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-night/95 p-4 backdrop-blur-md sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={String(cur.caption)}
            onClick={close}
          >
            <div className="relative h-full w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative h-[calc(100%-56px)] w-full">
                {video ? (
                  embedUrl(video) ? (
                    <iframe src={embedUrl(video)!} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={String(cur.caption)} />
                  ) : (
                    <video src={video} poster={String(cur.media)} className="h-full w-full object-contain" controls autoPlay playsInline />
                  )
                ) : (
                  <Image src={String(cur.media)} alt={String(cur.caption)} fill sizes="100vw" className="object-contain" />
                )}
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 text-cream">
                <p className="display text-lg">{String(cur.caption)}</p>
                <div className="flex items-center gap-2 font-sans text-xs">
                  <button onClick={() => step(-1)} className="border border-cream/20 px-4 py-2 hover:border-gold" aria-label="Anterior">←</button>
                  <button onClick={() => step(1)} className="border border-cream/20 px-4 py-2 hover:border-gold" aria-label="Próxima">→</button>
                  <button onClick={close} className="ml-2 border border-cream/20 px-4 py-2 uppercase tracking-[0.2em] hover:border-gold">Fechar</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
