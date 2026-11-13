'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/track';
import { Stage } from './Stage';
import { BrandInput } from './Chrome';

export function BrandReveal({ placements }: { placements: Record<string, string[]> }) {
  const [brand, setBrand] = useState('');
  const shown = brand.trim();
  const tracked = useRef(false);
  useEffect(() => {
    if (shown.length >= 3 && !tracked.current) {
      tracked.current = true;
      track('brand_preview', 'oryzo');
    }
  }, [shown]);

  const items = [
    { k: 'led', t: 'Telão de LED' },
    { k: 'vip', t: 'Área e credencial VIP' },
    { k: 'materiais', t: 'Materiais oficiais e stand' },
    { k: 'pipoca', t: 'Balde de pipoca' },
  ];

  return (
    <section id="sua-marca" className="o-dash relative grid min-h-[100svh] items-center gap-[18px] border-t px-[18px] py-24 sm:px-6 lg:grid-cols-[1fr_1.3fr_1fr] lg:py-0">
      <div className="max-w-[420px] self-center">
        <h2 className="o-heading">Sua marca, em cena.</h2>
        <div className="mt-10">
          <label htmlFor="o-brand" className="field-label">
            Digite o nome da sua marca
          </label>
          <BrandInput onChange={setBrand} />
        </div>
        <a href="#contato" onClick={() => track('sponsor_cta', 'oryzo-marca')} className="o-btn mt-8">
          Quero ver isso de verdade
        </a>
      </div>

      <div className="relative h-[52svh] lg:h-[86svh]">
        <Stage kind="bucket" brand={shown} className="absolute inset-0" />
      </div>

      <div className="self-center">
        <p className="o-body">
          Experimente: a marca aparece no balde e no ingresso VIP. No musical, ela entra no telão, nas comunicações e na área VIP, conforme a cota.
        </p>
        <ul className="mt-8">
          {items.map((it) => (
            <li key={it.k} className="o-dash flex items-baseline justify-between gap-4 border-t py-3">
              <span className="o-label">{it.t}</span>
              <span className="o-micro text-brasa">{placements[it.k]?.length ? placements[it.k].join(' · ') : 'Sob consulta'}</span>
            </li>
          ))}
        </ul>
        <p className="o-micro mt-6 text-driftwood">* Simulação ilustrativa.</p>
      </div>
    </section>
  );
}
