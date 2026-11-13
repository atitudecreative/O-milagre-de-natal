import { cx } from '@/lib/format';

/** Adesivo do elenco/ID: a imagem já traz borda branca + contorno preto. */
export function Sticker({
  src,
  alt = '',
  r = 0,
  className,
  style,
  slap,
  delay = 0,
  eager,
}: {
  src: string;
  alt?: string;
  r?: number;
  className?: string;
  style?: React.CSSProperties;
  slap?: boolean;
  delay?: number;
  eager?: boolean;
}) {
  return (
    <span
      className={cx('pointer-events-auto absolute block', slap && 'slap', className)}
      style={{ ...style, ['--r' as string]: `${r}deg`, ['--d' as string]: `${delay}ms`, transform: slap ? undefined : `rotate(${r}deg)` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="sticker block h-full w-auto max-w-none select-none"
        style={{ ['--r' as string]: `${r}deg` }}
      />
    </span>
  );
}

export function H2({ children, className, as: As = 'h2' }: { children: React.ReactNode; className?: string; as?: 'h2' | 'h3' | 'p' }) {
  return <As className={cx('display text-balance text-[44px] sm:text-[72px] lg:text-[104px]', className)}>{children}</As>;
}

/** Selo-pílula (substitui rótulos pequenos acima de títulos). */
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
