'use client';

import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Lightformer } from '@react-three/drei';
import { C, Cup, Hoop, Logotype3D, PopcornBucket, Star8, Ticket, TopHat } from './objects';

function Lights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 6]} intensity={2.2} color="#FFF4DE" />
      <directionalLight position={[-6, -2, 3]} intensity={0.8} color="#BDE8E2" />
      {/* reflexos locais — nenhum HDR baixado da internet */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 6]} scale={[10, 3, 1]} color="#FFF3DA" />
        <Lightformer form="rect" intensity={1.6} position={[-6, 0, 2]} scale={[3, 8, 1]} color="#1FA3A0" />
        <Lightformer form="rect" intensity={2} position={[6, -1, 2]} scale={[3, 8, 1]} color="#D2381F" />
        <Lightformer form="circle" intensity={2} position={[0, -5, 4]} scale={4} color="#E8B23A" />
      </Environment>
    </>
  );
}

/** Inclina o grupo na direção do ponteiro, com amortecimento. */
function Parallax({ children, strength = 0.18, still }: { children: React.ReactNode; strength?: number; still: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ pointer }, dt) => {
    if (!ref.current || still) return;
    const k = 1 - Math.pow(0.0015, dt);
    ref.current.rotation.y += (pointer.x * strength - ref.current.rotation.y) * k;
    ref.current.rotation.x += (-pointer.y * strength * 0.6 - ref.current.rotation.x) * k;
  });
  return <group ref={ref}>{children}</group>;
}

export function HeroScene({ still, compact, paused = false, logoOnly = false }: { still: boolean; compact: boolean; paused?: boolean; logoOnly?: boolean }) {
  const f = still ? 0 : 1;
  return (
    <Canvas frameloop={paused ? 'never' : 'always'} dpr={[1, 1.75]} camera={{ position: [0, 0, 10], fov: 34 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
      <Suspense fallback={null}>
        <Lights />
        <Parallax still={still}>
          <Float speed={1.2 * f} rotationIntensity={0.15 * f} floatIntensity={0.4 * f}>
            <group position={[0, compact ? 0.3 : 0, 0]}>
              <Logotype3D width={logoOnly ? (compact ? 5.2 : 9.4) : compact ? 4.4 : 6.8} {...(logoOnly ? { color: '#FFFFFF', metal: 0.12 } : {})} />
            </group>
          </Float>
          {!compact && !logoOnly && (
            <>
              <Float speed={1.6 * f} rotationIntensity={0.8 * f} floatIntensity={1 * f}>
                <TopHat position={[-4.6, 1.9, -1]} rotation={[0.35, 0.4, -0.35]} scale={0.75} />
              </Float>
              <Float speed={1.3 * f} rotationIntensity={0.6 * f} floatIntensity={1.2 * f}>
                <Hoop position={[4.7, 1.7, -1.5]} rotation={[0.1, -0.5, 0.2]} scale={0.8} />
              </Float>
              <Float speed={2 * f} rotationIntensity={1 * f} floatIntensity={0.8 * f}>
                <Star8 position={[4.3, -1.6, 0]} rotation={[0.3, -0.4, 0.2]} scale={0.5} />
              </Float>
              <Float speed={2.2 * f} rotationIntensity={1.2 * f} floatIntensity={0.6 * f}>
                <Star8 position={[-2.2, 2.7, -2]} rotation={[0.2, 0.6, 0]} scale={0.3} color={C.turquesa} />
              </Float>
            </>
          )}
          {compact && !logoOnly && (
            <>
              <Float speed={1.6 * f} rotationIntensity={0.8 * f} floatIntensity={1 * f}>
                <TopHat position={[-1.7, 2.3, -1]} rotation={[0.35, 0.4, -0.35]} scale={0.5} />
              </Float>
              <Float speed={1.3 * f} rotationIntensity={0.6 * f} floatIntensity={1 * f}>
                <Star8 position={[1.8, 2.3, -1]} scale={0.38} />
              </Float>
              <Float speed={1.4 * f} rotationIntensity={0.5 * f} floatIntensity={0.9 * f}>
                <PopcornBucket position={[1.5, -1.5, 0]} rotation={[0.25, 0.5, 0.12]} scale={0.45} />
              </Float>
            </>
          )}
        </Parallax>
      </Suspense>
    </Canvas>
  );
}

function Spin({ children, still }: { children: React.ReactNode; still: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ pointer }, dt) => {
    if (!ref.current) return;
    if (!still) ref.current.rotation.y += dt * 0.35;
    ref.current.rotation.x += (-pointer.y * 0.2 - ref.current.rotation.x) * (1 - Math.pow(0.002, dt));
  });
  return <group ref={ref}>{children}</group>;
}

/** Mockup 3D: balde, copo e ingresso com a marca digitada pelo visitante. */
export function BrandScene({ brand, still, paused = false }: { brand: string; still: boolean; paused?: boolean }) {
  return (
    <Canvas frameloop={paused ? 'never' : 'always'} dpr={[1, 1.75]} camera={{ position: [0, 1.4, 8.2], fov: 32 }} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <Lights />
        <group position={[0, -0.6, 0]}>
          <Spin still={still}>
            <PopcornBucket brand={brand} position={[-0.4, 0, 0]} scale={1.15} />
          </Spin>
          <Cup position={[1.9, -0.15, 0.4]} scale={0.95} />
          <Float speed={still ? 0 : 1.5} rotationIntensity={still ? 0 : 0.4} floatIntensity={still ? 0 : 0.6}>
            <Ticket brand={brand} position={[-1.9, 1.7, -0.6]} rotation={[-0.15, 0.35, 0.12]} scale={0.7} />
          </Float>
        </group>
      </Suspense>
    </Canvas>
  );
}
