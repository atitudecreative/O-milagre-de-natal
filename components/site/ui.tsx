import { cx } from '@/lib/format';

/** Figura recortada solta (só as de corpo inteiro), flutuando de leve. */
export function Floater({
  src,
  alt = '',
  r = 0,
  className,
  eager,
  float = true,
}: {
  src: string;
  alt?: string;
  r?: number;
  className?: string;
  eager?: boolean;
  float?: boolean;
}) {
  return (
    <span className={cx('pointer-events-none absolute block', float && 'floaty', className)} style={{ ['--r' as string]: `${r}deg`, transform: `rotate(${r}deg)` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} draggable={false} loading={eager ? 'eager' : 'lazy'} decoding="async" className="block h-full w-auto max-w-none select-none" />
    </span>
  );
}

/** Retrato em janela de arco: o recorte apoia a base reta na base do arco. */
export function ArchPortrait({
  src,
  alt,
  fill = 'bg-ouro',
  className,
  fit = 0.92,
  eager,
}: {
  src: string;
  alt: string;
  fill?: string;
  className?: string;
  fit?: number;
  eager?: boolean;
}) {
  return (
    <div className={cx('arch-frame overflow-hidden border border-carbon', /\babsolute\b/.test(className ?? '') ? '' : 'relative', fill, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="absolute bottom-0 left-1/2 w-auto max-w-none -translate-x-1/2 select-none"
        style={{ height: `${fit * 100}%` }}
      />
    </div>
  );
}

/** Selo de borda recortada (como selo postal / medalha), em SVG. */
export function Seal({ className, fill = '#E8B23A', children, teeth = 28 }: { className?: string; fill?: string; children?: React.ReactNode; teeth?: number }) {
  const pts: string[] = [];
  for (let i = 0; i <= teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 ? 46 : 50;
    pts.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`);
  }
  return (
    <div className={cx('relative aspect-square', className)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <polygon points={pts.join(' ')} fill={fill} stroke="#0B0B0B" strokeWidth="0.35" strokeLinejoin="round" />
        <circle cx="50" cy="50" r="41" fill="none" stroke="#0B0B0B" strokeWidth="0.3" strokeDasharray="1.2 1.2" />
      </svg>
      <div className="relative flex h-full w-full flex-col items-center justify-center p-[14%] text-center">{children}</div>
    </div>
  );
}

/**
 * Borda superior orgânica de uma seção: cortina (festões), onda ou picote.
 * Fica sobreposta à seção anterior, na cor da seção atual.
 */
export function Edge({ color, kind = 'wave', flip = false }: { color: string; kind?: 'wave' | 'curtain' | 'scallop'; flip?: boolean }) {
  const d =
    kind === 'curtain'
      ? 'M0,40 ' + Array.from({ length: 16 }, (_, i) => `Q${i * 100 + 50},-6 ${(i + 1) * 100},40`).join(' ') + ' L1600,60 L0,60 Z'
      : kind === 'scallop'
        ? 'M0,30 ' + Array.from({ length: 40 }, (_, i) => `A20,20 0 0 1 ${(i + 1) * 40},30`).join(' ') + ' L1600,60 L0,60 Z'
        : 'M0,34 C200,6 400,58 600,30 S1000,4 1200,30 S1500,52 1600,26 L1600,60 L0,60 Z';
  return (
    <svg
      viewBox="0 0 1600 60"
      preserveAspectRatio="none"
      className={cx('pointer-events-none absolute inset-x-0 z-[1] h-[28px] w-full sm:h-[44px]', flip ? 'bottom-[-1px] rotate-180' : 'top-[-27px] sm:top-[-43px]')}
      aria-hidden
    >
      <path d={d} fill={color} />
      <path d={d.replace(/ L1600,60 L0,60 Z$/, '')} fill="none" stroke="#0B0B0B" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function H2({ children, className, as: As = 'h2' }: { children: React.ReactNode; className?: string; as?: 'h2' | 'h3' | 'p' }) {
  return <As className={cx('display text-balance text-[44px] sm:text-[72px] lg:text-[104px]', className)}>{children}</As>;
}

/** Linha de acento na tipografia itálica da ID 2024. */
export function Accent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cx('serif text-[26px] leading-none text-pinheiro sm:text-[34px]', className)}>{children}</p>;
}

export function Tag({ children, color = 'bg-white', className }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2 rounded-full border border-carbon px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.03em]', color, className)}>
      {children}
    </span>
  );
}

export const STICKER_BG: Record<string, string> = {
  ouro: 'bg-ouro',
  cortina: 'bg-cortina text-white',
  turquesa: 'bg-turquesa text-white',
  pinheiro: 'bg-pinheiro text-white',
  picadeiro: 'bg-picadeiro',
};

export const HEX = {
  papel: '#F1EBDD',
  creme: '#F5E3B5',
  pessego: '#F8DCC8',
  menta: '#D3ECE6',
  cortina: '#D2381F',
  pinheiro: '#0E5A3A',
  palco: '#140C0A',
  carbon: '#0B0B0B',
};
