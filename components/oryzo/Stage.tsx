'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import type { ObjectKind } from '@/components/three/oryzo';

const DarkroomScene = dynamic(() => import('@/components/three/oryzo').then((m) => m.DarkroomScene), { ssr: false });

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Palco de um objeto 3D. Só existe perto da tela (no máximo 2–3 contextos WebGL vivos),
 * mede o progresso da rolagem para girar o objeto e respeita movimento reduzido.
 */
export function Stage({
  kind,
  text,
  brand,
  fallback,
  className,
}: {
  kind: ObjectKind;
  text?: string;
  brand?: string;
  fallback?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useRef(0.5);
  const [near, setNear] = useState(false);
  const [ok, setOk] = useState(true);
  const [still, setStill] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      setOk(!!(c.getContext('webgl2') || c.getContext('webgl')));
    } catch {
      setOk(false);
    }
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const mm = matchMedia('(max-width: 767px)');
    const sync = () => {
      setStill(mq.matches);
      setCompact(mm.matches);
    };
    sync();
    mq.addEventListener('change', sync);
    mm.addEventListener('change', sync);
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '150px' });
    if (ref.current) io.observe(ref.current);
    const onScroll = () => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      // 0 quando o palco entra por baixo, 1 quando sai por cima
      progress.current = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      removeEventListener('scroll', onScroll);
      mq.removeEventListener('change', sync);
      mm.removeEventListener('change', sync);
    };
  }, []);

  return (
    <div ref={ref} className={className ?? 'relative h-full w-full'} aria-hidden>
      {(!ok || !near) && fallback}
      {ok && near && (
        <Boundary fallback={fallback ?? null}>
          <div className="absolute inset-0">
            <DarkroomScene kind={kind} text={text} brand={brand} progress={progress} still={still} compact={compact} />
          </div>
        </Boundary>
      )}
    </div>
  );
}
