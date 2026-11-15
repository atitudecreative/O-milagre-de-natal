"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { EvImage } from "../EvImage";

/** Página do media kit que cresce e ganha nitidez conforme o visitante rola. */
export function KitPanel({ src, alt, index, label, text }: { src: string; alt: string; index: number; label: string; text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.84, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], reduce ? [1, 1] : [0.25, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [28, 6]);
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, 0]);

  return (
    <div ref={ref} className="lt-wrap flex flex-col gap-6 md:gap-8">
      <motion.div style={{ scale, opacity, borderRadius: radius, y }} className="relative aspect-video w-full overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] will-change-transform">
        <EvImage src={src} alt={alt} fill sizes="(min-width: 1280px) 1240px, 100vw" quality={85} className="object-cover" />
      </motion.div>
      <div className="flex flex-col gap-2 md:hidden">
        <p className="deck-in text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e3a873]" style={{ ["--d" as string]: 1 }}>{String(index).padStart(2, "0")} · {label}</p>
        <p className="deck-in font-[Instrument_Sans,Inter,sans-serif] text-[21px] font-medium leading-snug tracking-[-0.01em] text-white" style={{ ["--d" as string]: 2 }}>{text}</p>
      </div>
    </div>
  );
}
