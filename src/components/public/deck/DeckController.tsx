"use client";
import { useCallback, useEffect, useState } from "react";

/**
 * Controla a apresentação: encaixe ao rolar, slide ativo, barra de progresso,
 * contador, pontos de navegação e atalhos de teclado (setas, Page Up/Down).
 */
export function DeckController({ labels }: { labels: string[] }) {
  const [active, setActive] = useState(0);
  const total = labels.length;

  const slides = useCallback(() => Array.from(document.querySelectorAll<HTMLElement>("[data-slide]")), []);
  const go = useCallback(
    (i: number) => {
      const list = slides();
      const target = list[Math.max(0, Math.min(list.length - 1, i))];
      target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    },
    [slides],
  );

  useEffect(() => {
    document.documentElement.classList.add("deck-snap");
    const list = slides();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            el.dataset.active = "true";
            el.dataset.seen = "true";
            setActive(Number(el.dataset.slide));
          } else {
            el.dataset.active = "false";
          }
        }
      },
      { threshold: 0.55 },
    );
    list.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      document.documentElement.classList.remove("deck-snap");
    };
  }, [slides]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.closest("input, textarea, select, [role=tablist], [contenteditable=true]") || e.altKey || e.metaKey || e.ctrlKey)) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
        e.preventDefault();
        go(active + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
        e.preventDefault();
        go(active - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go, total]);

  const pct = total > 1 ? (active / (total - 1)) * 100 : 100;

  return (
    <>
      {/* Barra de progresso */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-white/10">
        <div className="h-full bg-[var(--ev-accent)] transition-[width] duration-700 ease-[var(--ease-out-expo)]" style={{ width: `${pct}%` }} />
      </div>

      {/* Pontos de navegação (desktop) */}
      <nav aria-label="Slides" className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 md:block">
        <ol className="flex flex-col gap-3">
          {labels.map((l, i) => (
            <li key={l + i}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}: ${l}`}
                aria-current={i === active ? "step" : undefined}
                className="group relative flex h-4 w-4 items-center justify-center"
              >
                <span className={`block rounded-full transition-all duration-500 ${i === active ? "h-3 w-3 bg-[var(--ev-accent)]" : "h-1.5 w-1.5 bg-white/45 group-hover:bg-white"}`} />
                <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded-full bg-black/70 px-3 py-1 text-xs text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {l}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Contador e setas (desktop) */}
      <div className="fixed bottom-6 left-6 z-50 hidden items-center gap-4 rounded-full bg-black/45 py-2 pl-4 pr-2 text-white backdrop-blur-md md:flex">
        <span className="text-xs tabular-nums tracking-[0.18em]">
          {String(active + 1).padStart(2, "0")} <span className="text-white/45">/ {String(total).padStart(2, "0")}</span>
        </span>
        <span className="max-w-[16rem] truncate text-xs text-white/75">{labels[active]}</span>
        <div className="flex gap-1">
          <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Slide anterior" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-30">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M2 8l4-4 4 4" /></svg>
          </button>
          <button type="button" onClick={() => go(active + 1)} disabled={active === total - 1} aria-label="Próximo slide" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-30">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M2 4l4 4 4-4" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}
