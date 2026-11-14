"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { videoEmbed } from "@/lib/video";

/** Botão que abre um vídeo (YouTube, Vimeo ou arquivo) em tela cheia. */
export function VideoModal({ url, title, children, className }: { url: string; title: string; children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const embed = videoEmbed(url);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      prev?.focus();
    };
  }, [open]);

  if (!embed) return null;
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} aria-label={`Assistir: ${title}`}>
        {children}
      </button>
      {open
        ? createPortal(
            <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 animate-[fade_0.3s_ease_both]" onClick={() => setOpen(false)}>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 h-11 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white ring-1 ring-white/30 hover:bg-white hover:text-black">
                Fechar
              </button>
              <div className="aspect-video w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
                {embed.type === "file" ? (
                  <video src={embed.src} controls autoPlay playsInline className="h-full w-full bg-black" />
                ) : (
                  <iframe src={embed.src} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="h-full w-full" />
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
