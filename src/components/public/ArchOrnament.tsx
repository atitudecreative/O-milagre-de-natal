/** Arco de vitral com estrela de oito pontas — ornamento em linha fina. */
export function ArchOrnament({ className = "", star = true }: { className?: string; star?: boolean }) {
  return (
    <svg viewBox="0 0 400 560" fill="none" aria-hidden className={className} stroke="currentColor" strokeWidth="1.2">
      <path d="M20 560V200a180 180 0 0 1 360 0v360" />
      <path d="M44 560V204a156 156 0 0 1 312 0v356" opacity=".7" />
      {/* montantes e travessas do vitral */}
      <path d="M120 560V70M200 560V44M280 560V70" opacity=".55" />
      <path d="M44 250h76M280 250h76M120 140h80M200 110h80M44 400h76M280 420h76M120 330h80M200 470h80" opacity=".45" />
      {star ? (
        <g transform="translate(200 300)">
          <path d="M0-120 14-14 120 0 14 14 0 120-14 14-120 0-14-14Z" opacity=".55" />
          <path d="M0-62 8-8 62 0 8 8 0 62-8 8-62 0-8-8Z" transform="rotate(45)" opacity=".4" />
        </g>
      ) : null}
      <g transform="translate(318 180)" opacity=".8">
        <path d="M0-14V14M-14 0H14M-9-9 9 9M-9 9 9-9" />
        <path d="M0 14v40" />
      </g>
    </svg>
  );
}

export function StarGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 0 13.6 10.4 24 12 13.6 13.6 12 24 10.4 13.6 0 12 10.4 10.4Z" />
    </svg>
  );
}
