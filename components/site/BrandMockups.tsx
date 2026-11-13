'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/track';
import { cx } from '@/lib/format';
import { BrandStage } from './Stage3D';

export type Placement = { key: string; tiers: string[] };

function Included({ tiers }: { tiers: string[] }) {
  return (
    <p className="mt-3 text-[13px] font-bold">
      {tiers.length ? <>Incluso em: {tiers.join(' · ')}</> : <>Ativação sob consulta</>}
    </p>
  );
}

function BrandWord({ brand, className }: { brand: string; className?: string }) {
  const text = brand || 'SUA MARCA';
  // nomes longos quebram em até duas linhas e encolhem um pouco
  const scale = Math.min(1, 16 / Math.max(16, text.length));
  return (
    <span className={cx('display line-clamp-2 block max-w-full text-balance break-words text-center leading-[0.88]', className)} style={{ zoom: scale }}>
      {text}
    </span>
  );
}

export function BrandMockups({ placements }: { placements: Record<string, string[]> }) {
  const [brand, setBrand] = useState('');
  const tracked = useRef(false);
  const shown = brand.trim().slice(0, 28);

  useEffect(() => {
    if (shown.length >= 3 && !tracked.current) {
      tracked.current = true;
      track('brand_preview', 'mockups');
    }
  }, [shown]);

  return (
    <section id="sua-marca" className="relative overflow-hidden border-y border-carbon bg-menta py-20 sm:py-28">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <h2 className="display text-balance text-[44px] sm:text-[72px] lg:text-[88px]">Imagine sua marca aqui.</h2>
            <p className="mt-5 max-w-md text-lg font-medium leading-relaxed text-carbon/80">
              Digite o nome da sua empresa e veja como ela aparece no musical: no balde de pipoca, no ingresso VIP, no telão de LED e no backdrop.
            </p>
            <label htmlFor="brand-input" className="field-label mt-8">
              Nome da sua marca
            </label>
            <input
              id="brand-input"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              maxLength={28}
              placeholder="Ex.: Padaria Estrela"
              autoComplete="organization"
              className="field h-16 !rounded-full !px-6 text-xl font-bold"
            />
            <div className="mt-6 flex flex-wrap gap-2">
              <a href="#contato" onClick={() => track('sponsor_cta', 'mockups')} className="pill pill-solid h-14 px-8">
                Quero ver isso de verdade
              </a>
              <a href="#cotas" className="pill pill-ghost h-14 px-8">
                Comparar cotas
              </a>
            </div>
            <p className="mt-4 text-[13px] font-medium text-carbon/60">Simulação ilustrativa. As aplicações reais seguem as contrapartidas de cada cota.</p>
          </div>

          {/* mockup 3D */}
          <div className="relative lg:col-span-7">
            <div className="card relative aspect-[4/3] overflow-hidden bg-papel">
              <BrandStage
                brand={shown}
                fallback={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/media/v2/adesivos/balde-pipoca.webp" alt="" className="absolute left-1/2 top-1/2 h-3/4 -translate-x-1/2 -translate-y-1/2 object-contain" />
                }
              />
              <span className="absolute left-4 top-4 rounded-full border border-carbon bg-white px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.03em]">
                Arraste o mouse · 3D
              </span>
            </div>
            <Included tiers={placements.pipoca ?? []} />
          </div>
        </div>

        <div className="mt-12 grid gap-3 lg:grid-cols-12">
          {/* Telão de LED */}
          <div className="lg:col-span-7">
            <div className="card relative aspect-[16/9] overflow-hidden bg-palco">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/v2/palco-confete.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" loading="lazy" />
              <div className="absolute left-1/2 top-[14%] flex h-[46%] w-[58%] -translate-x-1/2 flex-col items-center justify-center rounded-md border-4 border-carbon bg-carbon px-4 text-white">
                <div
                  className="pointer-events-none absolute inset-0 opacity-25"
                  style={{ backgroundImage: 'radial-gradient(circle, #fff 0 0.6px, transparent 1px)', backgroundSize: '4px 4px' }}
                  aria-hidden
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ouro sm:text-[12px]">Musical de Natal apresenta</span>
                <BrandWord brand={shown} className="mt-1 text-[clamp(22px,4.5vw,60px)]" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <p className="display mt-3 text-2xl">Telão de LED</p>
              <Included tiers={placements.led ?? []} />
            </div>
          </div>

          {/* Credencial VIP */}
          <div className="lg:col-span-5">
            <div className="card relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-ouro lg:aspect-auto lg:h-[calc(100%-52px)]">
              <div className="absolute left-1/2 top-0 h-[22%] w-10 -translate-x-1/2 border-x border-carbon bg-cortina" aria-hidden />
              <div className="relative mt-[12%] w-[46%] min-w-[180px] rotate-[-4deg] rounded-[18px] border border-carbon bg-white p-4 text-center">
                <span className="mx-auto -mt-1 mb-3 block h-3 w-10 rounded-full border border-carbon bg-papel" aria-hidden />
                <span className="logotype mx-auto block w-[80%] !text-carbon" />
                <span className="mt-3 block rounded-full bg-carbon py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white">Área VIP</span>
                <BrandWord brand={shown} className="mt-3 text-[18px] sm:text-[26px]" />
                <span className="mt-1 block text-[11px] font-bold uppercase text-carbon/60">Convidado</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <p className="display mt-3 text-2xl">Credencial VIP</p>
              <Included tiers={placements.vip ?? []} />
            </div>
          </div>

          {/* Backdrop */}
          <div className="lg:col-span-12">
            <div className="card relative h-[260px] overflow-hidden bg-white sm:h-[320px]">
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 sm:grid-cols-6" aria-hidden>
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className={cx('flex items-center justify-center border-b border-r border-carbon/10 px-3', (i + Math.floor(i / 6)) % 2 ? 'bg-white' : 'bg-papel')}>
                    {(i + Math.floor(i / 6)) % 2 ? <BrandWord brand={shown} className="text-[clamp(14px,1.8vw,26px)] text-cortina" /> : <span className="logotype block w-[80%] !text-pinheiro" />}
                  </div>
                ))}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/v2/adesivos/cartola-verde.webp" alt="" className="absolute bottom-0 right-[6%] h-[92%] rotate-[3deg]" loading="lazy" />
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <p className="display mt-3 text-2xl">Backdrop e materiais oficiais</p>
              <Included tiers={placements.materiais ?? []} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
