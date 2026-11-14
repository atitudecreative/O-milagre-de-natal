"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { EvImage } from "./EvImage";

type Item = { url: string; alt: string; caption?: string | null; credit?: string | null };
const Ctx = createContext<(i: number) => void>(() => {});

/** Galeria em tela cheia com navegação por teclado e gesto. */
export function LightboxProvider({ items, children }: { items: Item[]; children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const go = useCallback((d: number) => setIndex((i) => (i == null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (index == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [index, close, go]);

  const item = index != null ? items[index] : null;
  return (
    <Ctx.Provider value={setIndex}>
      {children}
      {item
        ? createPortal(
            <div role="dialog" aria-modal="true" aria-label="Galeria" className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white animate-[fade_0.25s_ease_both]">
              <div className="flex items-center justify-between p-4 text-xs uppercase tracking-[0.2em]">
                <span className="tabular-nums">{String(index! + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
                <button type="button" autoFocus onClick={close} className="h-10 rounded-full px-4 ring-1 ring-white/30 hover:bg-white hover:text-black">Fechar</button>
              </div>
              <div
                className="relative flex-1"
                onTouchStart={(e) => ((e.currentTarget as HTMLElement).dataset.x = String(e.touches[0].clientX))}
                onTouchEnd={(e) => {
                  const start = Number((e.currentTarget as HTMLElement).dataset.x);
                  const dx = e.changedTouches[0].clientX - start;
                  if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
                }}
              >
                <EvImage key={item.url} src={item.url} alt={item.alt} fill sizes="100vw" quality={85} className="object-contain animate-[fade_0.4s_ease_both]" />
                <button type="button" onClick={() => go(-1)} aria-label="Anterior" className="absolute left-0 top-0 h-full w-1/4 cursor-w-resize" />
                <button type="button" onClick={() => go(1)} aria-label="Próxima" className="absolute right-0 top-0 h-full w-1/4 cursor-e-resize" />
              </div>
              <div className="min-h-16 p-4 text-sm text-white/75">
                {item.caption}
                {item.credit ? <span className="ml-2 text-white/45">Foto: {item.credit}</span> : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </Ctx.Provider>
  );
}

export function LightboxTrigger({ index, children, className, label }: { index: number; children: ReactNode; className?: string; label: string }) {
  const open = useContext(Ctx);
  return (
    <button type="button" className={className} onClick={() => open(index)} aria-label={`Ampliar: ${label}`}>
      {children}
    </button>
  );
}
