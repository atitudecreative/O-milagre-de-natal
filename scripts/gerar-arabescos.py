"""
Gera os fundos de arabescos no estilo da ID 2024 (O Melhor Natal):
traços caligráficos afinando nas pontas, enrolando em espiral e terminando
numa gota, com pontinhos soltos. Saída: SVGs monocromáticos usados como
máscara CSS (a cor vem do CSS). Uso: python3 scripts/gerar-arabescos.py
"""
import math, random, os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'media', 'v2', 'bg')
os.makedirs(OUT, exist_ok=True)

def swirl(x, y, heading, length, w, curl, rnd, step=4.0, wav=None):
    """Curva por integração de curvatura: quase reta no começo, espiral no fim."""
    pts = []
    n = int(length / step)
    th = heading
    k0 = rnd.uniform(-0.002, 0.002)
    if wav is None:
        wav = rnd.uniform(0.004, 0.009) * rnd.choice([-1, 1])
    else:
        k0 = 0.0
    for i in range(n + 1):
        t = i / n
        pts.append((x, y, t))
        # curvatura: ondula no meio e fecha em espiral no fim
        k = k0 + wav * math.sin(t * math.pi * rnd.uniform(1.2, 1.8)) + curl * (t ** 3.2)
        th += k * step
        x += math.cos(th) * step
        y += math.sin(th) * step
    left, right = [], []
    for i, (px, py, t) in enumerate(pts):
        a = pts[max(0, i - 1)]; b = pts[min(len(pts) - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        # largura: fina no início, cheia no meio, afinando antes da gota
        ww = w * (0.18 + 0.82 * math.sin(math.pi * min(1, t * 1.05)) ** 0.7) * (1 - 0.55 * t)
        ww = max(ww, w * 0.12)
        left.append((px + nx * ww / 2, py + ny * ww / 2))
        right.append((px - nx * ww / 2, py - ny * ww / 2))
    poly = left + right[::-1]
    d = 'M' + ' L'.join(f'{p[0]:.1f},{p[1]:.1f}' for p in poly) + 'Z'
    ex, ey, _ = pts[-1]
    r = w * rnd.uniform(0.55, 0.75)
    blob = f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{r:.1f}"/>'
    return f'<path d="{d}"/>' + blob

def composition(seed, W=1600, H=1000, count=8, w=(30, 44), dots=22):
    rnd = random.Random(seed)
    parts = []
    for i in range(count):
        # nasce perto das bordas, apontando para dentro, como na arte 2024
        side = rnd.choice(['l', 'r', 't', 'b', 'c'])
        if side == 'l': x, y, h = rnd.uniform(-120, 80), rnd.uniform(0, H), rnd.uniform(-0.6, 0.6)
        elif side == 'r': x, y, h = rnd.uniform(W - 80, W + 120), rnd.uniform(0, H), math.pi + rnd.uniform(-0.6, 0.6)
        elif side == 't': x, y, h = rnd.uniform(0, W), rnd.uniform(-120, 60), math.pi / 2 + rnd.uniform(-0.7, 0.7)
        elif side == 'b': x, y, h = rnd.uniform(0, W), rnd.uniform(H - 60, H + 120), -math.pi / 2 + rnd.uniform(-0.7, 0.7)
        else: x, y, h = rnd.uniform(W * .2, W * .8), rnd.uniform(H * .2, H * .8), rnd.uniform(0, 2 * math.pi)
        curl = rnd.uniform(0.028, 0.05) * rnd.choice([-1, 1])
        parts.append(swirl(x, y, h, rnd.uniform(700, 1300), rnd.uniform(*w), curl, rnd))
    for i in range(dots):
        parts.append(f'<circle cx="{rnd.uniform(0, W):.0f}" cy="{rnd.uniform(0, H):.0f}" r="{rnd.uniform(4, 9):.1f}"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">'
            f'<g fill="#000">{"".join(parts)}</g></svg>')

VARIANTS = {
    'arabesco-a': dict(seed=24),
    'arabesco-b': dict(seed=2024, count=7),
    'arabesco-c': dict(seed=1224, count=9),
    'arabesco-denso': dict(seed=7, count=13, dots=32),
    'arabesco-leve': dict(seed=99, count=5, dots=12),
    'arabesco-vertical': dict(seed=15, W=900, H=1600, count=9),
}
for name, kw in VARIANTS.items():
    with open(os.path.join(OUT, name + '.svg'), 'w') as f:
        f.write(composition(**kw))
    print(name)

# divisor horizontal: dois traços espelhados terminando em espiral
import re
rnd = random.Random(3)
half = swirl(0, 0, 0, 430, 13, -0.075, rnd, wav=0.0025)
def mirror(svg):
    return re.sub(r'(-?\d+\.?\d*),(-?\d+\.?\d*)', lambda m: f"{-float(m.group(1)):.1f},{m.group(2)}", svg).replace('cx="', 'cx="-')
b = half
a_ = mirror(half).replace('cx="--', 'cx="')
nums = [float(v) for v in re.findall(r'(-?\d+\.\d)', half)]
xs = nums[0::2]; ys = nums[1::2]
maxx = max(abs(v) for v in xs) + 20; miny = min(ys) - 20; maxy = max(ys) + 20
with open(os.path.join(OUT, 'divisor.svg'), 'w') as f:
    f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-maxx:.0f} {miny:.0f} {2*maxx:.0f} {maxy-miny:.0f}"><g fill="#000">{a_}{b}<circle cx="0" cy="0" r="11"/></g></svg>')
print('divisor')
