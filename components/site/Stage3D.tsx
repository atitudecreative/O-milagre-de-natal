'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';

const HeroScene = dynamic(() => import('@/components/three/scenes').then((m) => m.HeroScene), { ssr: false });
const BrandScene = dynamic(() => import('@/components/three/scenes').then((m) => m.BrandScene), { ssr: false });

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Monta o 3D só quando está perto da tela, pausa fora dela e respeita movimento reduzido. */
function useStage() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [ok, setOk] = useState(true);
  const [still, setStill] = useState(false);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    setOk(webglOk());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mm = window.matchMedia('(max-width: 767px)');
    const sync = () => {
      setStill(mq.matches);
      setCompact(mm.matches);
    };
    sync();
    mq.addEventListener('change', sync);
    mm.addEventListener('change', sync);
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '200px' });
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      mq.removeEventListener('change', sync);
      mm.removeEventListener('change', sync);
    };
  }, []);
  return { ref, near, ok, still, compact };
}

export function HeroStage({ fallback, logoOnly = false }: { fallback: ReactNode; logoOnly?: boolean }) {
  const { ref, near, ok, still, compact } = useStage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (near) setMounted(true);
  }, [near]);
  return (
    <div ref={ref} className="absolute inset-0" aria-hidden>
      {(!ok || !mounted) && fallback}
      {ok && mounted && (
        <Boundary fallback={fallback}>
          <div className="absolute inset-0" style={{ visibility: near ? 'visible' : 'hidden' }}>
            <HeroScene still={still} compact={compact} paused={!near} logoOnly={logoOnly} />
          </div>
        </Boundary>
      )}
    </div>
  );
}

export function BrandStage({ brand, fallback }: { brand: string; fallback: ReactNode }) {
  const { ref, near, ok, still } = useStage();
  return (
    <div ref={ref} className="absolute inset-0" aria-hidden>
      {(!ok || !near) && fallback}
      {ok && near && (
        <Boundary fallback={fallback}>
          <BrandScene brand={brand} still={still} />
        </Boundary>
      )}
    </div>
  );
}
