'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Pt = [number, number];

/** matrix3d que leva o retângulo (0,0)-(w,h) para os 4 cantos dados (homografia). */
function homography(w: number, h: number, [p0, p1, p2, p3]: [Pt, Pt, Pt, Pt]) {
  // resolve a projeção do quadrado unitário para o quadrilátero
  const [x0, y0] = p0, [x1, y1] = p1, [x2, y2] = p3, [x3, y3] = p2; // TL, TR, BR, BL
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1 || 1e-9;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0;
  const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  // escala do retângulo w×h para o unitário
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => +v.toFixed(8)).join(',')})`;
}

/**
 * Aplica o conteúdo sobre uma superfície em perspectiva dentro de uma foto
 * (ex.: o painel de um outdoor). Cantos em % da caixa: [TL, TR, BL, BR].
 */
export function Quad({ corners, children, width = 800, height = 400 }: { corners: [Pt, Pt, Pt, Pt]; children: ReactNode; width?: number; height?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [t, setT] = useState<string>('');
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const px = corners.map(([x, y]) => [(x / 100) * r.width, (y / 100) * r.height]) as [Pt, Pt, Pt, Pt];
      setT(homography(width, height, px));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [corners, width, height]);
  return (
    <div ref={box} className="pointer-events-none absolute inset-0">
      <div className="absolute left-0 top-0 origin-top-left" style={{ width, height, transform: t, visibility: t ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
