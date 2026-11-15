"use client";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

/** 100 pontos = o público. Cada ponto representa `per` pessoas. */
export function CrowdDots({ total = 100, filled = 100, dashed = false, label }: { total?: number; filled?: number; dashed?: boolean; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  return (
    <div ref={ref} role="img" aria-label={label} className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[6px] md:gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          className={`aspect-square rounded-full ${i < filled ? (dashed ? "border border-dashed border-[var(--lt-copper-cta)]" : "bg-[var(--lt-ink)]") : "bg-[var(--lt-rule)]"}`}
          initial={reduce ? false : { opacity: 0, scale: 0.4 }}
          animate={inView ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.4, delay: reduce ? 0 : (i % 20) * 0.02 + Math.floor(i / 20) * 0.06 }}
        />
      ))}
    </div>
  );
}
