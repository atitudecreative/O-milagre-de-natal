'use client';

import { motion, useInView, useReducedMotion, animate } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode, type AnchorHTMLAttributes } from 'react';
import { track, selectTier } from '@/lib/track';

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'figure';
}) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}

/** Contador animado; respeita prefers-reduced-motion. */
export function Counter({ to, decimals = 0, className }: { to: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const [val, setVal] = useState(fmt(reduce ? to : 0));
  useEffect(() => {
    if (!inView) return;
    if (reduce) return setVal(fmt(to));
    const c = animate(0, to, { duration: 2.2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setVal(fmt(v)) });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, to, reduce]);
  return (
    <span ref={ref} className={className} aria-label={fmt(to)}>
      {val}
    </span>
  );
}

/** Link com rastreamento de conversão. */
export function TrackLink({
  event,
  label,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { event: string; label?: string }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track(event, label);
        props.onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}

export function TierInterestButton({ tier, className, children }: { tier: string; className?: string; children: ReactNode }) {
  return (
    <a
      href="#contato"
      className={className}
      onClick={() => {
        track('tier_interest', tier);
        selectTier(tier);
      }}
    >
      {children}
    </a>
  );
}
