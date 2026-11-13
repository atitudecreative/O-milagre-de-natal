/** Vitral em arco — linha gráfica herdada das peças da campanha. */
export function ArchLines({ className, animated = true }: { className?: string; animated?: boolean }) {
  const p = animated ? 'draw-path' : '';
  return (
    <svg viewBox="0 0 600 820" fill="none" className={className} aria-hidden preserveAspectRatio="xMidYMax meet">
      <g stroke="url(#archGold)" strokeWidth="1.4" vectorEffect="non-scaling-stroke">
        <path className={p} pathLength={1} d="M10 820 V300 A290 290 0 0 1 590 300 V820" />
        <path className={p} pathLength={1} d="M48 820 V306 A252 252 0 0 1 552 306 V820" />
        <path className={p} pathLength={1} d="M150 820 V120" />
        <path className={p} pathLength={1} d="M250 820 V58" />
        <path className={p} pathLength={1} d="M350 820 V58" />
        <path className={p} pathLength={1} d="M450 820 V120" />
        <path className={p} pathLength={1} d="M48 420 H150 M450 420 H552" />
        <path className={p} pathLength={1} d="M150 250 H250 M350 250 H450" />
        <path className={p} pathLength={1} d="M250 150 H350 M250 320 H350" />
        <path className={p} pathLength={1} d="M48 600 H150 M450 600 H552" />
      </g>
      <g stroke="#E6BC88" strokeWidth="1.2" opacity="0.85">
        <path d="M500 210 v56 M472 238 h56 M480 218 l40 40 M520 218 l-40 40" />
      </g>
      <defs>
        <linearGradient id="archGold" x1="0" y1="0" x2="600" y2="820" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E6BC88" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#C68752" stopOpacity="0.6" />
          <stop offset="1" stopColor="#C68752" stopOpacity="0.05" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M20 2v36M2 20h36M7 7l26 26M33 7L7 33" />
    </svg>
  );
}
