'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import type { Font } from 'opentype.js';
import { Cup, Hoop, Logotype3D, PopcornBucket, Star8, Ticket, TopHat } from './objects';

export type ObjectKind = 'logo' | 'hat' | 'hoop' | 'star' | 'text' | 'ticket' | 'bucket';

/* Luz de estúdio quente: chave superior direita + contorno âmbar, nada de HDR externo. */
function DarkroomLights() {
  return (
    <>
      <ambientLight intensity={0.18} color="#ffedd7" />
      <directionalLight position={[5, 6, 4]} intensity={2.6} color="#ffd9a8" />
      <directionalLight position={[4, 2, -6]} intensity={2.2} color="#ff8a3d" />
      <directionalLight position={[-6, -3, 2]} intensity={0.25} color="#6c5f51" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.2} position={[4, 5, 3]} scale={[6, 2, 1]} color="#ffe2bd" />
        <Lightformer form="rect" intensity={1.4} position={[5, 0, -4]} scale={[2, 8, 1]} color="#dc5000" />
        <Lightformer form="rect" intensity={0.3} position={[-6, 0, 2]} scale={[3, 6, 1]} color="#6c5f51" />
      </Environment>
    </>
  );
}

/* ---------------- Texto 3D a partir da fonte (números editáveis no painel) ---------------- */

let fontPromise: Promise<Font> | null = null;
function loadFont() {
  if (!fontPromise) {
    fontPromise = Promise.all([import('opentype.js'), fetch('/fonts/InterTight-Medium.ttf').then((r) => r.arrayBuffer())]).then(([ot, buf]) =>
      (ot.default ?? ot).parse(buf),
    );
  }
  return fontPromise;
}

// começa a baixar a fonte assim que o módulo 3D carrega
if (typeof window !== 'undefined') loadFont().catch(() => {});

export function ExtrudedText({ text, width = 5, color = '#E2A65A' }: { text: string; width?: number; color?: string }) {
  const [geometry, setGeometry] = useState<THREE.ExtrudeGeometry | null>(null);
  useEffect(() => {
    let alive = true;
    let made: THREE.ExtrudeGeometry | null = null;
    loadFont().then((font) => {
      if (!alive) return;
      const d = font.getPath(text.toUpperCase(), 0, 0, 200).toPathData(2);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`;
      const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p));
      const g = new THREE.ExtrudeGeometry(shapes, { depth: 46, bevelEnabled: true, bevelThickness: 9, bevelSize: 4, bevelSegments: 5, curveSegments: 8 });
      g.center();
      g.computeBoundingBox();
      const w = g.boundingBox!.max.x - g.boundingBox!.min.x;
      const s = width / w;
      g.scale(s, -s, s);
      g.computeVertexNormals();
      made = g;
      setGeometry(g);
    });
    return () => {
      alive = false;
      made?.dispose();
    };
  }, [text, width]);
  if (!geometry) return null;
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.32} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ---------------- Cena: um objeto, rotação ligada à rolagem ---------------- */

function Turntable({
  children,
  progress,
  still,
  spin = false,
  tilt = [0.95, 0.12],
}: {
  children: React.ReactNode;
  progress: MutableRefObject<number>;
  still: boolean;
  spin?: boolean;
  tilt?: [number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame(({ pointer }, dt) => {
    const g = ref.current;
    if (!g) return;
    const p = still ? 0.6 : progress.current;
    t.current += dt;
    // de cima (top-down) para três quartos conforme a seção atravessa a tela
    const targetX = THREE.MathUtils.lerp(tilt[0], tilt[1], p) - (still ? 0 : pointer.y * 0.12);
    const targetY = THREE.MathUtils.lerp(-0.5, 0.5, p) + (still ? 0 : pointer.x * 0.25) + (spin && !still ? t.current * 0.3 : 0);
    const k = 1 - Math.pow(0.002, dt);
    g.rotation.x += (targetX - g.rotation.x) * k;
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.position.y = still ? 0 : Math.sin(t.current * 0.8) * 0.06;
  });
  return <group ref={ref}>{children}</group>;
}

/** Afasta a câmera até o objeto caber na largura do palco (colunas estreitas no desktop). */
function FitCamera({ width }: { width: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const half = THREE.MathUtils.degToRad(cam.fov / 2);
    const needed = (width * 0.56) / (Math.tan(half) * aspect);
    cam.position.z = Math.max(7.5, needed);
    cam.updateProjectionMatrix();
  }, [camera, size, width]);
  return null;
}

const WIDTH: Record<ObjectKind, number> = { logo: 8.4, text: 5.4, hat: 3.8, hoop: 3.6, star: 3.2, ticket: 4.4, bucket: 3.8 };

export function DarkroomScene({
  kind,
  text = '',
  brand = '',
  progress,
  still,
  compact,
}: {
  kind: ObjectKind;
  text?: string;
  brand?: string;
  progress: MutableRefObject<number>;
  still: boolean;
  compact: boolean;
}) {
  const object = useMemo(() => {
    switch (kind) {
      case 'logo':
        return <Logotype3D width={6.2} color="#E2A65A" />;
      case 'text':
        return <ExtrudedText text={text} width={6} />;
      case 'hat':
        return <TopHat scale={compact ? 1.25 : 1.5} position={[0, -0.9, 0]} />;
      case 'hoop':
        return <Hoop scale={compact ? 1.3 : 1.6} position={[0, -0.4, 0]} />;
      case 'star':
        return <Star8 scale={compact ? 1.2 : 1.5} color="#E2A65A" />;
      case 'ticket':
        return <Ticket brand={brand} scale={1.8} />;
      case 'bucket':
        return (
          <group position={[0, -0.7, 0]}>
            <PopcornBucket brand={brand} position={[-0.55, 0, 0]} rotation={[0, 0.35, 0]} />
            <Cup position={[1.25, -0.1, 0.6]} scale={0.8} />
          </group>
        );
    }
  }, [kind, text, brand, compact]);

  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.4, 8], fov: 32 }} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <DarkroomLights />
        <FitCamera width={WIDTH[kind] * (compact && kind !== 'logo' && kind !== 'text' ? 0.9 : 1)} />
        <Turntable progress={progress} still={still} tilt={kind === 'text' || kind === 'logo' ? [0.5, -0.05] : kind === 'bucket' ? [0.35, 0.05] : [0.95, 0.12]}>
          {object}
        </Turntable>
      </Suspense>
    </Canvas>
  );
}
