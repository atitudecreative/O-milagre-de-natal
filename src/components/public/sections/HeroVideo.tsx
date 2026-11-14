"use client";
import { useEffect, useRef, useState } from "react";

/** Vídeo de fundo: só carrega em conexões razoáveis e sem reduced-motion. */
export function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = conn?.saveData || (conn?.effectiveType && /2g/.test(conn.effectiveType));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- decisão depende de APIs do navegador
    if (!reduce && !slow) setEnabled(true);
  }, []);

  if (!enabled) return null;
  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      onCanPlay={() => setReady(true)}
    />
  );
}
