"use client";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import type { AudienceDatum } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const SERIES = [
  "var(--ev-accent)",
  "var(--ev-fg)",
  "color-mix(in srgb, var(--ev-accent) 55%, var(--ev-bg))",
  "color-mix(in srgb, var(--ev-fg) 55%, var(--ev-bg))",
  "color-mix(in srgb, var(--ev-accent) 30%, var(--ev-bg))",
  "color-mix(in srgb, var(--ev-fg) 28%, var(--ev-bg))",
];

function fmt(v: number, unit?: string | null) {
  return `${formatNumber(v, 1)}${unit ?? ""}`;
}

/** Barras horizontais finas — legíveis no celular, editoriais no desktop. */
export function BrandBars({ data, unit }: { data: AudienceDatum[]; unit?: string | null }) {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul ref={ref} className="space-y-4">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
            <span>{d.label}</span>
            <span className="ev-num text-2xl">{fmt(d.value, unit)}</span>
          </div>
          <div className="h-[6px] w-full overflow-hidden rounded-full bg-[var(--ev-line)]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: i === 0 ? "var(--ev-accent)" : "var(--ev-fg)", originX: 0 }}
              initial={reduce ? false : { scaleX: 0 }}
              animate={inView ? { scaleX: d.value / max } : undefined}
              transition={{ duration: 1.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Rosca com legenda. */
export function BrandDonut({ data, unit }: { data: AudienceDatum[]; unit?: string | null }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = 70;
  const c = 2 * Math.PI * r;
  const offsets = data.reduce<number[]>((acc, d, i) => [...acc, i === 0 ? 0 : acc[i - 1] + (data[i - 1].value / total) * c], []);
  const top = [...data].sort((a, b) => b.value - a.value)[0];
  return (
    <div className="grid items-center gap-8 sm:grid-cols-[minmax(0,220px)_1fr]">
      <div className="relative mx-auto aspect-square w-full max-w-[220px]">
        <svg ref={ref} viewBox="0 0 180 180" className="h-full w-full -rotate-90" role="img" aria-label={data.map((d) => `${d.label}: ${fmt(d.value, unit)}`).join(", ")}>
          <circle cx="90" cy="90" r={r} fill="none" stroke="var(--ev-line)" strokeWidth="18" />
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const seg = (
              <motion.circle
                key={d.label}
                cx="90"
                cy="90"
                r={r}
                fill="none"
                stroke={SERIES[i % SERIES.length]}
                strokeWidth="18"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offsets[i]}
                initial={reduce ? false : { opacity: 0 }}
                animate={inView ? { opacity: 1 } : undefined}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.12 }}
              />
            );
            return seg;
          })}
        </svg>
        {top ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="ev-num text-4xl">{fmt(top.value, unit)}</span>
            <span className="ev-micro mt-1 max-w-[9rem]">{top.label}</span>
          </div>
        ) : null}
      </div>
      <ul className="space-y-2.5">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-4 border-b border-[var(--ev-line)] pb-2.5 text-sm">
            <span className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: SERIES[i % SERIES.length], boxShadow: "inset 0 0 0 1px var(--ev-line)" }} />
              {d.label}
            </span>
            <span className="tabular-nums font-semibold">{fmt(d.value, unit)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Indicadores em destaque (sem gráfico). */
export function BrandStats({ data, unit }: { data: AudienceDatum[]; unit?: string | null }) {
  return (
    <ul className="grid grid-cols-2 gap-x-8 gap-y-8">
      {data.map((d) => (
        <li key={d.label} className="border-t border-[var(--ev-line)] pt-4">
          <span className="ev-num block text-[clamp(2.6rem,5vw,4rem)]">{fmt(d.value, unit)}</span>
          <span className="mt-2 block text-sm text-[var(--ev-muted)]">{d.label}</span>
        </li>
      ))}
    </ul>
  );
}

/* Mapa do Brasil em grade de UFs (cartograma) — leve e legível em qualquer tela. */
const UF_GRID: Record<string, [number, number]> = {
  RR: [2, 0], AP: [4, 0],
  AM: [1, 1], PA: [3, 1], MA: [4, 1], CE: [5, 1], RN: [6, 1],
  AC: [0, 2], RO: [1, 2], MT: [2, 2], TO: [3, 2], PI: [4, 2], PE: [5, 2], PB: [6, 2],
  MS: [2, 3], GO: [3, 3], DF: [4, 3], BA: [5, 3], AL: [6, 3],
  SP: [3, 4], MG: [4, 4], ES: [5, 4], SE: [6, 4],
  PR: [3, 5], RJ: [4, 5],
  SC: [3, 6],
  RS: [3, 7],
};

export function BrandMap({ data, unit }: { data: AudienceDatum[]; unit?: string | null }) {
  const byUf = new Map(data.map((d) => [(d.code ?? d.label).toUpperCase().slice(0, 2), d]));
  const max = Math.max(...data.map((d) => d.value), 1);
  const ranked = [...data].sort((a, b) => b.value - a.value).slice(0, 5);
  return (
    <div className="grid items-start gap-8 sm:grid-cols-[minmax(0,280px)_1fr]">
      <svg viewBox="0 0 280 320" className="w-full max-w-[280px]" role="img" aria-label={`Distribuição por estado: ${ranked.map((d) => `${d.label} ${fmt(d.value, unit)}`).join(", ")}`}>
        {Object.entries(UF_GRID).map(([uf, [x, y]]) => {
          const d = byUf.get(uf);
          const t = d ? 0.18 + 0.82 * (d.value / max) : 0;
          return (
            <g key={uf} transform={`translate(${x * 40}, ${y * 40})`}>
              <rect width="36" height="36" rx="3" fill={d ? `color-mix(in srgb, var(--ev-accent) ${Math.round(t * 100)}%, var(--ev-bg))` : "var(--ev-surface)"} stroke="var(--ev-line)" />
              <text x="18" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill={t > 0.6 ? "var(--ev-on-accent)" : "var(--ev-muted)"}>{uf}</text>
            </g>
          );
        })}
      </svg>
      <ol className="space-y-2.5">
        {ranked.map((d, i) => (
          <li key={d.label} className="flex items-baseline justify-between gap-4 border-b border-[var(--ev-line)] pb-2.5">
            <span className="text-sm"><span className="mr-3 tabular-nums text-[var(--ev-subtle)]">{i + 1}</span>{d.label}</span>
            <span className="ev-num text-2xl">{fmt(d.value, unit)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
