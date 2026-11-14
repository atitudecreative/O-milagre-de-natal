"use client";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { compactNumber } from "@/lib/format";

/** Número que conta até o valor quando aparece na tela. */
export function Counter({ value, animated = true, compact = true, className }: { value: number; animated?: boolean; compact?: boolean; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const target = compact ? compactNumber(value) : { number: new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value), suffix: "" };
  const numeric = parseFloat(target.number.replace(/\./g, "").replace(",", "."));
  const decimals = target.number.includes(",") ? target.number.split(",")[1].length : 0;
  const [display, setDisplay] = useState(animated && !reduce ? format(0, decimals) : target.number);

  useEffect(() => {
    if (!inView || !animated || reduce || !Number.isFinite(numeric)) return;
    const controls = animate(0, numeric, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(format(v, decimals)),
    });
    return () => controls.stop();
  }, [inView, animated, reduce, numeric, decimals]);

  return (
    <span ref={ref} className={className}>
      <span>{display}</span>
      {target.suffix ? <span className="ml-[0.08em] text-[0.42em] align-baseline tracking-normal">{target.suffix}</span> : null}
    </span>
  );
}

function format(v: number, decimals: number) {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
}
