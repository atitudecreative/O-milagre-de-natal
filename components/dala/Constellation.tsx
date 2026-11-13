'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Constelação de triângulos (DESIGN.md "Dala"): milhares de triângulos contornados,
 * em cores vivas, que formam a figura da seção visível e se reorganizam na rolagem.
 * Seções declaram: data-shape="logo|text|star|tree|ticket|brand|scatter",
 * data-text (para "text") e data-side="left|right|center".
 */

type Kind = 'logo' | 'text' | 'star' | 'tree' | 'ticket' | 'brand' | 'scatter';
type Shape = { kind: Kind; text: string; side: 'left' | 'right' | 'center' };

const PALETTE = ['#8052ff', '#8052ff', '#a98bff', '#ffb829', '#ffb829', '#15846e', '#1fd1b0', '#e24bd0', '#4d7cff', '#ffffff'];

const VERT = /* glsl */ `
attribute float size;
attribute float angle;
attribute float alpha;
attribute vec3 pcolor;
uniform float pr;
varying float vA;
varying vec3 vC;
varying float vR;
void main() {
  vA = alpha; vC = pcolor; vR = angle;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * pr;
}`;

const FRAG = /* glsl */ `
varying float vA;
varying vec3 vC;
varying float vR;
float sdTri(vec2 p) {
  const float k = 1.7320508;
  p.x = abs(p.x) - 1.0;
  p.y = p.y + 1.0 / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0, 0.0);
  return -length(p) * sign(p.y);
}
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  p.y = -p.y;
  float c = cos(vR), s = sin(vR);
  p = mat2(c, -s, s, c) * p;
  float d = sdTri(p * 1.55);
  float e = 1.0 - smoothstep(0.09, 0.2, abs(d));
  if (e < 0.02) discard;
  gl_FragColor = vec4(vC, e * vA);
}`;

/* ---------------- amostragem de formas em um canvas 2D ---------------- */

let logoImg: HTMLImageElement | null = null;
function loadLogo() {
  return new Promise<HTMLImageElement>((res) => {
    if (logoImg?.complete) return res(logoImg);
    logoImg = new Image();
    logoImg.onload = () => res(logoImg!);
    logoImg.src = '/media/logotipo.png';
  });
}

function fontFamily() {
  return getComputedStyle(document.body).fontFamily || 'sans-serif';
}

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, w: number, h: number, img: HTMLImageElement | null) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  const cx = w / 2;
  const cy = h / 2;
  if (shape.kind === 'logo' && img) {
    const s = Math.min((w * 0.98) / img.width, (h * 0.9) / img.height);
    ctx.drawImage(img, cx - (img.width * s) / 2, cy - (img.height * s) / 2, img.width * s, img.height * s);
    return;
  }
  if (shape.kind === 'text' || shape.kind === 'brand') {
    const raw = (shape.text || 'SUA MARCA').toUpperCase().slice(0, 28);
    const fam = fontFamily();
    let lines = [raw];
    let size = h * 0.42;
    ctx.font = `600 ${size}px ${fam}`;
    if (ctx.measureText(raw).width > w * 0.96 && raw.includes(' ')) {
      const mid = raw.length / 2;
      let best = raw.indexOf(' ');
      for (let i = 0; i < raw.length; i++) if (raw[i] === ' ' && Math.abs(i - mid) < Math.abs(best - mid)) best = i;
      lines = [raw.slice(0, best), raw.slice(best + 1)];
      size = h * 0.34;
    }
    ctx.font = `600 ${size}px ${fam}`;
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
    if (widest > w * 0.96) size *= (w * 0.96) / widest;
    ctx.font = `600 ${size}px ${fam}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((l, i) => ctx.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * size * 0.95));
    return;
  }
  if (shape.kind === 'star') {
    const R = Math.min(w, h) * 0.48;
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const r = i % 2 ? R * 0.4 : R;
      const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.fill();
    return;
  }
  if (shape.kind === 'tree') {
    const H = h * 0.92;
    const top = cy - H / 2;
    const W = Math.min(w * 0.8, H * 0.78);
    for (let k = 0; k < 3; k++) {
      const y0 = top + H * 0.1 + k * H * 0.2;
      const y1 = y0 + H * 0.34;
      const half = (W / 2) * (0.55 + k * 0.22);
      ctx.beginPath();
      ctx.moveTo(cx, y0);
      ctx.lineTo(cx + half, y1);
      ctx.lineTo(cx - half, y1);
      ctx.fill();
    }
    ctx.fillRect(cx - W * 0.07, top + H * 0.78, W * 0.14, H * 0.16);
    // estrela no topo
    const R = H * 0.07;
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const r = i % 2 ? R * 0.45 : R;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(cx + Math.cos(a) * r, top + H * 0.06 + Math.sin(a) * r);
    }
    ctx.fill();
    return;
  }
  if (shape.kind === 'ticket') {
    // ingresso em contorno: borda, recortes laterais, picote e "VIP"
    const W = Math.min(w * 0.94, h * 1.9);
    const H = W * 0.5;
    const x = cx - W / 2;
    const y = cy - H / 2;
    const r = H * 0.13;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(6, H * 0.065);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + W, y);
    ctx.lineTo(x + W, cy - r);
    ctx.arc(x + W, cy, r, -Math.PI / 2, Math.PI / 2, true);
    ctx.lineTo(x + W, y + H);
    ctx.lineTo(x, y + H);
    ctx.lineTo(x, cy + r);
    ctx.arc(x, cy, r, Math.PI / 2, -Math.PI / 2, true);
    ctx.closePath();
    ctx.stroke();
    for (let yy = y + H * 0.1; yy < y + H * 0.9; yy += H * 0.14) ctx.fillRect(x + W * 0.72 - ctx.lineWidth / 2, yy, ctx.lineWidth, H * 0.07);
    ctx.font = `600 ${H * 0.36}px ${fontFamily()}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VIP', x + W * 0.36, cy);
  }
}

function sampleShape(shape: Shape, n: number, w: number, h: number, img: HTMLImageElement | null) {
  const out = new Float32Array(n * 2);
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(w));
  c.height = Math.max(2, Math.round(h));
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  drawShape(ctx, shape, c.width, c.height, img);
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  const pts: number[] = [];
  const step = Math.max(1, Math.round(Math.sqrt((c.width * c.height) / (n * 6))));
  for (let y = 0; y < c.height; y += step) for (let x = 0; x < c.width; x += step) if (data[(y * c.width + x) * 4 + 3] > 128) pts.push(x, y);
  const count = pts.length / 2;
  if (!count) {
    for (let i = 0; i < n; i++) {
      out[i * 2] = (Math.random() - 0.5) * w;
      out[i * 2 + 1] = (Math.random() - 0.5) * h;
    }
    return out;
  }
  // embaralha e distribui
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [order[i], order[j]] = [order[j], order[i]];
  }
  for (let i = 0; i < n; i++) {
    const k = order[i % count];
    out[i * 2] = pts[k * 2] - w / 2 + (Math.random() - 0.5) * step;
    out[i * 2 + 1] = pts[k * 2 + 1] - h / 2 + (Math.random() - 0.5) * step;
  }
  return out;
}

/* ---------------- componente ---------------- */

export function Constellation() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return; // sem WebGL: o conteúdo continua legível sem a constelação
    }
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = innerWidth;
    let H = innerHeight;
    const mobile = () => W < 1024;
    const N = mobile() ? 2400 : 5200;
    const AMBIENT = Math.round(N * 0.16);

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, W, 0, H, -10, 10);

    const pos = new Float32Array(N * 3);
    const size = new Float32Array(N);
    const angle = new Float32Array(N);
    const alpha = new Float32Array(N);
    const color = new Float32Array(N * 3);
    const spin = new Float32Array(N);
    const speed = new Float32Array(N);
    const phase = new Float32Array(N);
    const amb = new Float32Array(AMBIENT * 2);
    const tmp = new THREE.Color();
    for (let i = 0; i < N; i++) {
      pos[i * 3] = Math.random() * W;
      pos[i * 3 + 1] = Math.random() * H;
      const ambient = i < AMBIENT;
      size[i] = ambient ? 6 + Math.random() * 8 : 5 + Math.random() * (mobile() ? 6 : 8);
      angle[i] = Math.random() * Math.PI * 2;
      alpha[i] = ambient ? 0.28 + Math.random() * 0.25 : 0.75 + Math.random() * 0.25;
      tmp.set(PALETTE[(Math.random() * PALETTE.length) | 0]);
      color.set([tmp.r, tmp.g, tmp.b], i * 3);
      spin[i] = (Math.random() - 0.5) * 0.8;
      speed[i] = 0.6 + Math.random() * 0.8;
      phase[i] = Math.random() * Math.PI * 2;
    }
    for (let i = 0; i < AMBIENT; i++) {
      amb[i * 2] = Math.random();
      amb[i * 2 + 1] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
    const angAttr = new THREE.BufferAttribute(angle, 1).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', posAttr);
    geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('angle', angAttr);
    geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
    geo.setAttribute('pcolor', new THREE.BufferAttribute(color, 3));
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { pr: { value: renderer.getPixelRatio() } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    scene.add(points);

    /* alvos */
    let shape: Shape = { kind: 'logo', text: '', side: 'right' };
    let brand = '';
    let target = new Float32Array(N * 2);
    let scattered = false;
    let img: HTMLImageElement | null = null;
    let reshapeToken = 0;

    const layout = () => {
      if (mobile()) return { cx: W * 0.5, cy: H * 0.42, bw: W * 0.92, bh: Math.min(H * 0.36, W * 0.7) };
      const bw = Math.min(W * 0.44, 720);
      const bh = Math.min(H * 0.62, 560);
      const cx = shape.side === 'left' ? W * 0.27 : shape.side === 'center' ? W * 0.5 : W * 0.73;
      return { cx, cy: H * 0.5, bw, bh };
    };

    const reshape = async () => {
      const token = ++reshapeToken;
      scattered = shape.kind === 'scatter';
      if (scattered) return;
      if (shape.kind === 'logo' && !img) img = await loadLogo();
      if (token !== reshapeToken) return;
      const { bw, bh } = layout();
      const s = shape.kind === 'brand' ? { ...shape, text: brand || 'SUA MARCA' } : shape;
      target = sampleShape(s, N, bw, bh, img);
      if (still) snap();
    };

    let mouseX = -9999;
    let mouseY = -9999;
    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onLeave = () => {
      mouseX = mouseY = -9999;
    };

    let t = 0;
    let last = performance.now();
    let raf = 0;
    let running = true;

    const targetOf = (i: number, out: { x: number; y: number }) => {
      const { cx, cy } = layout();
      if (i < AMBIENT || scattered) {
        const k = i < AMBIENT ? i : i % AMBIENT;
        const ax = i < AMBIENT ? amb[k * 2] : (Math.sin(i * 12.9898) * 43758.5453) % 1;
        const ay = i < AMBIENT ? amb[k * 2 + 1] : (Math.sin(i * 78.233) * 12543.123) % 1;
        out.x = Math.abs(ax) * W + Math.sin(t * 0.07 + phase[i]) * 40;
        out.y = Math.abs(ay) * H + Math.cos(t * 0.05 + phase[i]) * 40;
        return;
      }
      out.x = cx + target[i * 2] + (still ? 0 : Math.sin(t * 0.9 + phase[i]) * 1.6);
      out.y = cy + target[i * 2 + 1] + (still ? 0 : Math.cos(t * 0.7 + phase[i]) * 1.6);
    };

    const o = { x: 0, y: 0 };
    const snap = () => {
      for (let i = 0; i < N; i++) {
        targetOf(i, o);
        pos[i * 3] = o.x;
        pos[i * 3 + 1] = o.y;
      }
      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const ease = 1 - Math.pow(0.06, dt);
      for (let i = 0; i < N; i++) {
        targetOf(i, o);
        let x = pos[i * 3];
        let y = pos[i * 3 + 1];
        x += (o.x - x) * ease * speed[i];
        y += (o.y - y) * ease * speed[i];
        const dx = x - mouseX;
        const dy = y - mouseY;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400) {
          const f = (1 - d2 / 14400) * 9;
          const d = Math.sqrt(d2) || 1;
          x += (dx / d) * f;
          y += (dy / d) * f;
        }
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        angle[i] += spin[i] * dt;
      }
      posAttr.needsUpdate = true;
      angAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    /* seção ativa */
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-shape]'));
    const ratios = new Map<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target, e.intersectionRatio);
        let best: HTMLElement | null = null;
        let bestR = 0;
        for (const s of sections) {
          const r = ratios.get(s) ?? 0;
          if (r > bestR) {
            bestR = r;
            best = s;
          }
        }
        if (!best) return;
        const next: Shape = {
          kind: (best.dataset.shape as Kind) || 'scatter',
          text: best.dataset.text || '',
          side: (best.dataset.side as Shape['side']) || 'right',
        };
        if (next.kind !== shape.kind || next.text !== shape.text || next.side !== shape.side) {
          shape = next;
          reshape();
        }
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.7, 0.9, 1], rootMargin: '-30% 0px -30% 0px' },
    );
    sections.forEach((s) => io.observe(s));

    let brandTimer = 0;
    const onBrand = (e: Event) => {
      brand = String((e as CustomEvent<string>).detail || '').trim();
      clearTimeout(brandTimer);
      brandTimer = window.setTimeout(() => {
        if (shape.kind === 'brand') reshape();
      }, 220);
    };

    const onResize = () => {
      W = innerWidth;
      H = innerHeight;
      renderer.setSize(W, H);
      camera.right = W;
      camera.bottom = H;
      camera.updateProjectionMatrix();
      reshape();
    };
    const onVis = () => {
      running = !document.hidden;
      last = performance.now();
    };

    addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    addEventListener('resize', onResize);
    addEventListener('dala:brand', onBrand);
    document.addEventListener('visibilitychange', onVis);
    reshape();
    if (still) {
      // movimento reduzido: sem animação contínua, só redesenha quando a forma muda
      const rerender = () => snap();
      addEventListener('scroll', rerender, { passive: true });
      snap();
      return () => {
        removeEventListener('scroll', rerender);
        io.disconnect();
        removeEventListener('resize', onResize);
        removeEventListener('dala:brand', onBrand);
        renderer.dispose();
        geo.dispose();
        mat.dispose();
        renderer.domElement.remove();
      };
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(brandTimer);
      io.disconnect();
      removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      removeEventListener('resize', onResize);
      removeEventListener('dala:brand', onBrand);
      document.removeEventListener('visibilitychange', onVis);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-30 lg:opacity-100" />;
}
