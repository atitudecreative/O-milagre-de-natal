import { cx } from '@/lib/format';
import { Reveal } from './motion';

export function SectionHead({
  n,
  label,
  title,
  intro,
  align = 'left',
  className,
}: {
  n: string;
  label: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <Reveal className={cx(align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-4xl', className)}>
      <p className={cx('label flex items-center gap-4', align === 'center' && 'justify-center')}>
        <span className="text-cream/40">N° {n}</span>
        <span className="h-px w-10 bg-gold/40" aria-hidden />
        {label}
      </p>
      <h2 className="display mt-6 text-[40px] leading-[0.98] text-cream sm:text-6xl lg:text-[76px]">{title}</h2>
      {intro && <p className={cx('mt-6 max-w-2xl text-base leading-relaxed text-cream/65 sm:text-lg', align === 'center' && 'mx-auto')}>{intro}</p>}
    </Reveal>
  );
}
