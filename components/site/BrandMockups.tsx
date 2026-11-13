'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/track';
import { cx } from '@/lib/format';
import { BrandStage } from './Stage3D';
import { ConstellationBox } from '@/components/dala/Constellation';
import { Accent, Edge, HEX, Linhas } from './ui';
import { Quad } from './Quad';

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

export function BrandMockups({ placements, fx = false }: { placements: Record<string, string[]>; fx?: boolean }) {
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
    <section id="sua-marca" className="swirl sw-leve relative bg-pessego py-20 sm:py-28" style={{ ['--sw' as string]: '#EDC3A6' }}>
      <Edge color={HEX.pessego} kind="wave" />
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <Accent>experimente</Accent>
            <h2 className="display mt-2 text-balance text-[44px] sm:text-[72px] lg:text-[88px]">Imagine sua marca aqui.</h2>
            <p className="mt-5 max-w-md text-lg font-medium leading-relaxed text-carbon/80">
              Digite o nome da sua empresa e veja como ela aparece no musical: no telão de LED, no outdoor, na credencial VIP, no backdrop e no balde de pipoca.
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
            <Linhas v="b" className="-left-[12%] -top-[14%] z-0 h-[128%] w-[124%] opacity-60" color="#D9A56A" />
            <div className="relative z-10 aspect-[4/3] overflow-hidden rounded-[999px_999px_48px_48px] border border-carbon bg-papel">
              {fx ? (
                <ConstellationBox kind="brand" text={shown || 'SUA MARCA'} fill={0.8} count={2200} sizeRange={[5, 9]} className="absolute inset-x-0 bottom-0 top-[12%]" />
              ) : (
              <BrandStage
                brand={shown}
                fallback={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/media/v2/adesivos/balde-pipoca.webp" alt="" className="absolute left-1/2 top-1/2 h-3/4 -translate-x-1/2 -translate-y-1/2 object-contain" />
                }
              />
              )}
              <span className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full border border-carbon bg-white px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.03em]">{fx ? 'Digite e veja' : 'Arraste · 3D'}</span>
            </div>
            <Linhas v="divisor" className="-bottom-5 left-[6%] z-20 h-[60px] w-[60%] -rotate-3" color="#0E5A3A" />
            <Included tiers={placements.pipoca ?? []} />
          </div>
        </div>

        <div className="relative mt-16 grid gap-x-6 gap-y-14 lg:grid-cols-12">
          {/* linhas que atravessam por trás de todos os mockups */}
          <Linhas v="a" className="-left-[8%] top-[4%] z-0 h-[92%] w-[116%] opacity-50" color="#D9A56A" />

          {/* Telão de LED: palco em perspectiva, plateia na frente */}
          <figure className="relative z-10 lg:col-span-7">
            <div className="persp relative aspect-[16/10] overflow-hidden rounded-[48px] border border-carbon bg-palco">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/v2/palco/palco-secao-b.webp" alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <div className="absolute left-1/2 top-[10%] w-[66%] -translate-x-1/2 [transform:translateX(-50%)_rotateX(8deg)]">
                <div className="relative aspect-[16/7] overflow-hidden rounded-[6px] border-[6px] border-[#15110f] bg-carbon shadow-[0_0_80px_10px_rgba(31,163,160,0.35)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/media/v2/palco-confete.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" loading="lazy" />
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #fff 0 0.6px, transparent 1px)', backgroundSize: '4px 4px' }} aria-hidden />
                  <div className="relative flex h-full flex-col items-center justify-center px-4 text-white">
                    <span className="serif text-[clamp(12px,1.6vw,20px)] text-ouro">o Musical de Natal apresenta</span>
                    <BrandWord brand={shown} className="mt-1 text-[clamp(24px,4.6vw,62px)]" />
                  </div>
                </div>
                <div className="mx-auto h-[14px] w-[86%] bg-[#0e0b09]" aria-hidden />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/v2/palco/plateia.webp" alt="" className="absolute -bottom-[2%] left-0 w-[130%] max-w-none -translate-x-[10%]" loading="lazy" />
            </div>
            <Linhas v="divisor" className="-right-4 top-[38%] z-20 h-[70px] w-[46%] rotate-[24deg]" color="#E8B23A" />
            <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
              <span className="display text-2xl">Telão de LED</span>
              <Included tiers={placements.led ?? []} />
            </figcaption>
          </figure>

          {/* Credencial VIP com cordão */}
          <figure className="relative z-10 lg:col-span-5">
            <div className="persp relative flex aspect-[16/10] items-start justify-center overflow-hidden rounded-[999px] border border-carbon bg-ouro lg:aspect-auto lg:h-[calc(100%-52px)]">
              <div className="absolute left-1/2 top-0 h-[38%] w-[34%] -translate-x-1/2 [clip-path:polygon(0_0,100%_0,62%_100%,38%_100%)]" aria-hidden>
                <div className="h-full w-full bg-cortina" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 18px, rgba(255,255,255,.25) 18px 20px)' }} />
              </div>
              <div className="group relative mt-[24%] w-[46%] min-w-[180px] [transform:rotateY(-14deg)_rotateZ(-4deg)] [transform-style:preserve-3d] transition-transform duration-500 ease-out hover:[transform:rotateY(0deg)_rotateZ(0deg)]">
                <span className="absolute -top-5 left-1/2 h-7 w-4 -translate-x-1/2 rounded-full border border-carbon bg-[#c9c9c9]" aria-hidden />
                <div className="relative overflow-hidden rounded-[18px] border border-carbon bg-white p-4 text-center">
                  <span className="mx-auto mb-3 block h-3 w-10 rounded-full border border-carbon bg-papel" aria-hidden />
                  <span className="logotype mx-auto block w-[80%] !text-pinheiro" />
                  <span className="mt-3 block rounded-full bg-carbon py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white">Área VIP</span>
                  <BrandWord brand={shown} className="mt-3 text-[18px] sm:text-[24px]" />
                  <span className="mt-1 block text-[11px] font-bold uppercase text-carbon/60">Convidado</span>
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/40 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                </div>
              </div>
            </div>
            <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
              <span className="display text-2xl">Credencial VIP</span>
              <Included tiers={placements.vip ?? []} />
            </figcaption>
          </figure>

          {/* Outdoor: a marca aplicada em perspectiva sobre o painel */}
          <figure className="relative z-10 lg:col-span-6">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[48px] border border-carbon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/outdoor.webp" alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <Quad
                corners={[
                  [27.3, 6.5],
                  [80.7, 31.9],
                  [25.7, 55.6],
                  [81.6, 68.9],
                ]}
              >
                <div className="absolute right-[3%] top-[5%] flex w-[30%] flex-col items-center rounded-[14px] border-2 border-carbon bg-ouro px-3 py-3 text-carbon">
                  <span className="text-[13px] font-bold uppercase tracking-[0.08em]">Patrocínio</span>
                  <BrandWord brand={shown} className="mt-1 text-[34px]" />
                </div>
              </Quad>
            </div>
            <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
              <span className="display text-2xl">Outdoor e mídia externa</span>
              <Included tiers={placements.materiais ?? []} />
            </figcaption>
          </figure>

          {/* Backdrop em perspectiva com o elenco na frente */}
          <figure className="relative z-10 lg:col-span-6">
            <div className="persp relative aspect-[16/9] overflow-hidden rounded-[48px] border border-carbon bg-papel">
              <div className="absolute inset-y-[6%] left-[-6%] right-[14%] grid grid-cols-4 grid-rows-3 border border-carbon/30 [transform:rotateY(18deg)] [transform-origin:left_center]" aria-hidden>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={cx('flex items-center justify-center border-b border-r border-carbon/10 px-2', (i + Math.floor(i / 4)) % 2 ? 'bg-white' : 'bg-[#efe7d2]')}>
                    {(i + Math.floor(i / 4)) % 2 ? <BrandWord brand={shown} className="text-[clamp(11px,1.4vw,20px)] text-cortina" /> : <span className="logotype block w-[82%] !text-pinheiro" />}
                  </div>
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-[16%] bg-[#d9cfb4]" aria-hidden />
              <Linhas v="leve" className="right-[-6%] top-[-10%] h-[120%] w-[60%] opacity-90" color="#0E5A3A" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/v2/recortes/cartola-verde.webp" alt="" className="absolute bottom-0 right-[8%] h-[86%]" loading="lazy" />
              <Linhas v="divisor" className="bottom-[10%] right-[2%] h-[50px] w-[44%] -rotate-6" color="#E8B23A" />
            </div>
            <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
              <span className="display text-2xl">Backdrop e materiais oficiais</span>
              <Included tiers={placements.materiais ?? []} />
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
