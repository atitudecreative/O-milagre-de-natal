import { formatDate, formatInt } from "@/lib/format";

/** Gráfico de área/linha em SVG puro (renderizado no servidor). */
export function AreaChart({ data, height = 180, label, series = [{ key: "count", label: "Total", color: "#141413" }] }: {
  data: Record<string, number | string>[];
  height?: number;
  label: string;
  series?: { key: string; label: string; color: string; dashed?: boolean }[];
}) {
  const W = 720;
  const H = height;
  const pad = { t: 12, r: 8, b: 24, l: 8 };
  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => Number(d[s.key] ?? 0))));
  const x = (i: number) => pad.l + (i / Math.max(1, data.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const ticks = [0, Math.round(data.length / 2), data.length - 1].filter((v, i, a) => a.indexOf(v) === i && data[v]);

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad.l} x2={W - pad.r} y1={y(max * f)} y2={y(max * f)} stroke="#dfdbd2" strokeDasharray="2 4" />
        ))}
        {series.map((s, si) => {
          const pts = data.map((d, i) => `${x(i)},${y(Number(d[s.key] ?? 0))}`).join(" ");
          return (
            <g key={s.key}>
              {si === 0 ? <polygon points={`${x(0)},${y(0)} ${pts} ${x(data.length - 1)},${y(0)}`} fill={s.color} opacity={0.07} /> : null}
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth={1.75} strokeDasharray={s.dashed ? "4 4" : undefined} strokeLinejoin="round" />
            </g>
          );
        })}
        {ticks.map((i) => (
          <text key={i} x={x(i)} y={H - 6} fontSize="10" fill="#6f6c64" textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}>
            {formatDate(String(data[i].day), { day: "2-digit", month: "short" })}
          </text>
        ))}
      </svg>
      {series.length > 1 ? (
        <figcaption className="mt-2 flex gap-4 text-xs text-mute">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5"><span className="h-0.5 w-4" style={{ background: s.color }} />{s.label}</span>
          ))}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Lista com barras horizontais. */
export function BarList({ rows, format = formatInt }: { rows: { label: React.ReactNode; value: number; hint?: React.ReactNode }[]; format?: (v: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => (
        <li key={i}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{r.label}</span>
            <span className="shrink-0 tabular-nums text-ink-2">{format(r.value)}{r.hint ? <span className="ml-2 text-xs text-mute">{r.hint}</span> : null}</span>
          </div>
          <div className="h-1.5 rounded-full bg-paper-2">
            <div className="h-full rounded-full bg-ink" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Barra segmentada (ex.: leads por status). */
export function Stacked({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-paper-2">
        {parts.map((p) => (p.value ? <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} title={`${p.label}: ${p.value}`} /> : null))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-mute"><span className="h-2 w-2 rounded-full" style={{ background: p.color }} />{p.label}</span>
            <span className="tabular-nums font-medium">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
