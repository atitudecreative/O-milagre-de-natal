'use client';

import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useLoader, type ThreeElements } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

export const C = {
  carbon: '#141210',
  papel: '#F1EBDD',
  cortina: '#D2381F',
  pinheiro: '#0E5A3A',
  turquesa: '#1FA3A0',
  ouro: '#E8B23A',
  picadeiro: '#F26A1B',
};

/** Redesenha as texturas quando as fontes da página terminam de carregar. */
function useFontsReady() {
  const [ready, setReady] = useState(() => typeof document !== 'undefined' && document.fonts?.status === 'loaded');
  useEffect(() => {
    if (!ready && typeof document !== 'undefined') document.fonts?.ready.then(() => setReady(true));
  }, [ready]);
  return ready;
}

function displayFont() {
  if (typeof document === 'undefined') return 'Impact, sans-serif';
  const v = getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim();
  return v || 'Impact, sans-serif';
}

/* ---------------- Logotipo 2026 extrudado e "inflado" ---------------- */

export function Logotype3D({ width = 6, color = C.ouro, metal = 0.75 }: { width?: number; color?: string; metal?: number }) {
  const data = useLoader(SVGLoader, '/media/logotipo.svg');
  const geometry = useMemo(() => {
    const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
    const g = new THREE.ExtrudeGeometry(shapes, {
      depth: 70,
      bevelEnabled: true,
      bevelThickness: 22,
      bevelSize: 9,
      bevelSegments: 6,
      curveSegments: 10,
    });
    g.center();
    g.computeBoundingBox();
    const w = g.boundingBox!.max.x - g.boundingBox!.min.x;
    const s = width / w;
    g.scale(s, -s, s); // SVG tem Y invertido
    g.computeVertexNormals();
    return g;
  }, [data, width]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} metalness={metal} roughness={metal < 0.3 ? 0.42 : 0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ---------------- Cartola (ID 2024/2025) ---------------- */

export function TopHat(props: ThreeElements['group']) {
  const crown = useMemo(() => {
    const pts = [
      [0, 0],
      [1.25, 0],
      [1.28, 0.06],
      [1.2, 0.1],
      [0.74, 0.12],
      [0.7, 0.2],
      [0.76, 1.45],
      [0.74, 1.5],
      [0, 1.5],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  return (
    <group {...props}>
      <mesh geometry={crown}>
        <meshStandardMaterial color={C.carbon} roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.735, 0.725, 0.24, 64, 1, true]} />
        <meshStandardMaterial color={C.cortina} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.742, 0.025, 12, 64]} />
        <meshStandardMaterial color={C.ouro} metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
}

/* ---------------- Aro de acrobacia (lira) ---------------- */

export function Hoop(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <mesh>
        <torusGeometry args={[1, 0.07, 24, 120]} />
        <meshStandardMaterial color={C.ouro} metalness={0.9} roughness={0.22} />
      </mesh>
      {/* fitas turquesa enroladas */}
      {[0.3, 1.9, 3.6, 5.1].map((a) => (
        <mesh key={a} position={[Math.cos(a), Math.sin(a), 0]} rotation={[0, 0, a]}>
          <torusGeometry args={[0.1, 0.035, 10, 24]} />
          <meshStandardMaterial color={C.turquesa} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
        <meshStandardMaterial color={C.carbon} />
      </mesh>
    </group>
  );
}

/* ---------------- Estrela de oito pontas (vitral 2026) ---------------- */

export function Star8({ color = C.ouro, ...props }: ThreeElements['group'] & { color?: string }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const n = 8;
    for (let i = 0; i <= n * 2; i++) {
      const r = i % 2 === 0 ? 1 : 0.38;
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.08, bevelSegments: 4 });
    g.center();
    return g;
  }, []);
  return (
    <group {...props}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ---------------- Balde de pipoca (ID 2024) com marca opcional ---------------- */

function bucketTexture(brand: string) {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 1024;
  const x = c.getContext('2d')!;
  // listras vermelho / creme
  const stripes = 16;
  for (let i = 0; i < stripes; i++) {
    x.fillStyle = i % 2 ? '#F1EBDD' : C.cortina;
    x.fillRect((i * c.width) / stripes, 0, c.width / stripes + 1, c.height);
  }
  // selo frontal
  const cx = c.width * 0.25;
  const cy = c.height * 0.52;
  x.fillStyle = '#0B0B0B';
  x.beginPath();
  x.ellipse(cx, cy, 330, 330, 0, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = '#FFFFFF';
  x.beginPath();
  x.ellipse(cx, cy, 316, 316, 0, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = '#0B0B0B';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  const font = displayFont();
  const label = (brand || 'SUA MARCA').toUpperCase().slice(0, 22);
  let size = 150;
  x.font = `${size}px ${font}`;
  while (x.measureText(label).width > 540 && size > 40) {
    size -= 6;
    x.font = `${size}px ${font}`;
  }
  x.fillText(label, cx, cy - 20);
  x.font = `600 44px ${getComputedStyle(document.documentElement).getPropertyValue('--font-sans') || 'sans-serif'}`;
  x.fillStyle = C.cortina;
  x.fillText('MUSICAL DE NATAL', cx, cy + 120);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function PopcornBucket({ brand = '', ...props }: ThreeElements['group'] & { brand?: string }) {
  const body = useMemo(() => new THREE.CylinderGeometry(1, 0.72, 1.7, 72, 1, true), []);
  const fonts = useFontsReady();
  const texture = useMemo(() => (typeof document === 'undefined' ? null : bucketTexture(brand)), [brand, fonts]);
  useEffect(() => () => texture?.dispose(), [texture]);

  const kernels = useMemo(() => {
    const out: { p: [number, number, number]; s: number; r: [number, number, number] }[] = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) {
      const a = rnd() * Math.PI * 2;
      const rr = Math.sqrt(rnd()) * 0.95;
      const h = 0.85 + (1 - rr) * 0.45 + rnd() * 0.12;
      out.push({ p: [Math.cos(a) * rr, h, Math.sin(a) * rr], s: 0.13 + rnd() * 0.08, r: [rnd() * 3, rnd() * 3, rnd() * 3] });
    }
    return out;
  }, []);

  return (
    <group {...props}>
      <mesh geometry={body} rotation={[0, -Math.PI / 2 + 0.2, 0]}>
        <meshStandardMaterial map={texture ?? undefined} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.035, 10, 72]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
      </mesh>
      {kernels.map((k, i) => (
        <mesh key={i} position={k.p} rotation={k.r} scale={k.s}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={i % 5 === 0 ? '#F7D98B' : '#FFF6E2'} roughness={0.85} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Copo (ID 2024) ---------------- */

export function Cup(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <mesh>
        <cylinderGeometry args={[0.55, 0.42, 1.6, 48]} />
        <meshStandardMaterial color={C.pinheiro} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.84, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.08, 48]} />
        <meshStandardMaterial color="#F1EBDD" roughness={0.4} />
      </mesh>
      <mesh position={[0.12, 1.35, 0]} rotation={[0, 0, -0.12]}>
        <cylinderGeometry args={[0.035, 0.035, 1.1, 12]} />
        <meshStandardMaterial color={C.ouro} metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  );
}

/* ---------------- Ingresso ---------------- */

function ticketTexture(brand: string) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const x = c.getContext('2d')!;
  x.fillStyle = C.ouro;
  x.fillRect(0, 0, c.width, c.height);
  x.strokeStyle = '#0B0B0B';
  x.lineWidth = 6;
  x.strokeRect(24, 24, c.width - 48, c.height - 48);
  x.setLineDash([14, 12]);
  x.beginPath();
  x.moveTo(760, 40);
  x.lineTo(760, 472);
  x.stroke();
  x.setLineDash([]);
  x.fillStyle = '#0B0B0B';
  const font = displayFont();
  x.font = `86px ${font}`;
  x.fillText('MUSICAL', 70, 170);
  x.fillText('DE NATAL', 70, 260);
  x.font = `bold 34px sans-serif`;
  x.fillText(brand ? `APRESENTA: ${brand.toUpperCase().slice(0, 22)}` : '12–15 DEZ · 2026', 72, 360);
  x.save();
  x.translate(880, 256);
  x.rotate(-Math.PI / 2);
  x.textAlign = 'center';
  x.font = `48px ${font}`;
  x.fillText('VIP', 0, 16);
  x.restore();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function Ticket({ brand = '', ...props }: ThreeElements['group'] & { brand?: string }) {
  const fonts = useFontsReady();
  const tex = useMemo(() => (typeof document === 'undefined' ? null : ticketTexture(brand)), [brand, fonts]);
  useEffect(() => () => tex?.dispose(), [tex]);
  return (
    <group {...props}>
      <RoundedBox args={[2.4, 1.2, 0.05]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={C.ouro} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.027]}>
        <planeGeometry args={[2.34, 1.14]} />
        <meshStandardMaterial map={tex ?? undefined} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ---------------- Iluminação local (sem HDR externo) ---------------- */

export { Environment, Lightformer } from '@react-three/drei';
