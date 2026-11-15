"use client";
import { useEffect, useState } from "react";

/**
 * Rolagem livre: marca cada bloco como visto quando entra na tela (dispara as
 * animações de entrada) e mostra uma barra de progresso de leitura no topo.
 */
export function DeckController() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const list = Array.from(document.querySelectorAll<HTMLElement>("[data-slide]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          el.dataset.active = e.isIntersecting ? "true" : "false";
          if (e.isIntersecting) el.dataset.seen = "true";
        }
      },
      { threshold: 0.18 },
    );
    list.forEach((el) => io.observe(el));

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-white/10">
      <div className="h-full bg-[var(--ev-accent)]" style={{ width: `${pct}%` }} />
    </div>
  );
}
