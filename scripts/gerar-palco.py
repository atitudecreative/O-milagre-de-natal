"""
Fundos de palco no estilo do KV 2024 (O Melhor Natal): degradê turquesa,
chuva de papel brilhante, refletores, feixes de luz e plateia em silhueta.
Uso: python3 scripts/gerar-palco.py   (requer Pillow + numpy)
"""
import os, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'media', 'v2', 'palco')
os.makedirs(OUT, exist_ok=True)

def hexrgb(h): return np.array([int(h[i:i+2], 16) for i in (1, 3, 5)], dtype=np.float32)

def base(W, H, top='#1A8A8C', mid='#0C5257', bot='#03171A', glow=1.0):
    y = np.linspace(0, 1, H)[:, None]
    t, m, b = hexrgb(top), hexrgb(mid), hexrgb(bot)
    col = np.where(y[..., None] < 0.45, t + (m - t) * (y[..., None] / 0.45), m + (b - m) * ((y[..., None] - 0.45) / 0.55))
    img = np.repeat(col, W, axis=1).astype(np.float32)
    # brilho central no alto (palco iluminado)
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - W / 2) / (W * 0.55)) ** 2 + ((yy - H * 0.28) / (H * 0.55)) ** 2)
    g = np.clip(1 - d, 0, 1) ** 2 * 70 * glow
    img += g[..., None] * np.array([0.55, 1.0, 0.95])
    return img

def add_layer(img, layer, alpha=1.0):
    a = np.asarray(layer.split()[3], dtype=np.float32)[..., None] / 255 * alpha
    c = np.asarray(layer.convert('RGB'), dtype=np.float32)
    return img * (1 - a) + c * a

def screen(img, layer_rgb):
    return 255 - (255 - img) * (255 - layer_rgb) / 255

def glitter(W, H, n, rnd, density_top=True, size=(1, 3.5)):
    lay = Image.new('RGB', (W, H), 'black'); d = ImageDraw.Draw(lay)
    for _ in range(n):
        y = (rnd.random() ** (1.8 if density_top else 1)) * H
        x = rnd.random() * W
        r = rnd.uniform(*size)
        v = rnd.uniform(0.25, 1)
        col = tuple(int(c * v) for c in rnd.choice([(170, 255, 245), (230, 255, 252), (120, 220, 215), (255, 245, 225)]))
        if rnd.random() < 0.5:
            d.ellipse((x - r, y - r, x + r, y + r), fill=col)
        else:  # papel picado: retângulos girados
            a = rnd.uniform(0, math.pi); w2, h2 = r * 1.6, r * 0.7
            pts = [(x + math.cos(a) * dx - math.sin(a) * dy, y + math.sin(a) * dx + math.cos(a) * dy) for dx, dy in ((-w2, -h2), (w2, -h2), (w2, h2), (-w2, h2))]
            d.polygon(pts, fill=col)
    return lay

def bokeh(W, H, n, rnd):
    lay = Image.new('RGB', (W, H), 'black'); d = ImageDraw.Draw(lay)
    for _ in range(n):
        x, y = rnd.random() * W, (rnd.random() ** 1.5) * H * 0.8
        r = rnd.uniform(8, 34); v = rnd.uniform(0.15, 0.45)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(int(120 * v), int(255 * v), int(240 * v)))
    return lay.filter(ImageFilter.GaussianBlur(6))

def spotlights(W, H, rnd, count=12):
    """Refletores no topo + feixes horizontais de lente, como no KV."""
    lay = Image.new('RGB', (W, H), 'black'); d = ImageDraw.Draw(lay)
    for i in range(count):
        x = W * (0.05 + 0.9 * i / (count - 1)) + rnd.uniform(-30, 30)
        y = H * rnd.uniform(0.02, 0.2)
        k = rnd.uniform(0.7, 1.3)
        for r, v in ((70 * k, 30), (34 * k, 110), (16 * k, 255)):
            d.ellipse((x - r, y - r, x + r, y + r), fill=(int(v * .75), v, int(v * .95)))
    for side in (-1, 1):
        for j in range(3):
            cx = W / 2 + side * W * rnd.uniform(0.3, 0.42); cy = H * rnd.uniform(0.08, 0.32)
            ang = math.radians(side * rnd.uniform(18, 32)); L = W * 0.07; t = 7
            pts = [(cx + math.cos(ang) * dx - math.sin(ang) * dy, cy + math.sin(ang) * dx + math.cos(ang) * dy) for dx, dy in ((-L, -t), (L, -t), (L, t), (-L, t))]
            d.polygon(pts, fill=(200, 255, 250))
    return lay.filter(ImageFilter.GaussianBlur(6))

def beams(W, H, rnd):
    lay = Image.new('RGB', (W, H), 'black'); d = ImageDraw.Draw(lay)
    for side in (-1, 1):
        ox = W / 2 + side * W * 0.55
        for k in range(4):
            tx = W / 2 + side * W * (0.05 + 0.12 * k) + rnd.uniform(-40, 40)
            ty = H * 1.1
            half = W * 0.018 + k * 6
            d.polygon([(ox, -60), (tx - half, ty), (tx + half, ty)], fill=(38, 95, 92))
    return lay.filter(ImageFilter.GaussianBlur(30))

def crowd(W, H, rnd, rows=4, color=(3, 16, 18), rim=(40, 150, 150), phones=True):
    """Plateia em silhueta (RGBA), com contorno de luz e telas de celular."""
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    rimlay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(rimlay)
    for row in range(rows):
        base_y = H * (0.42 + row * 0.16)
        scale = 0.55 + row * 0.32
        x = -40
        while x < W + 60:
            hw = rnd.uniform(26, 38) * scale; hh = hw * 1.18
            hy = base_y + rnd.uniform(-18, 18) * scale
            sw = hw * rnd.uniform(2.3, 2.9)
            for D, c in ((dr, rim + (150,)), (d, color + (255,))):
                off = -2 if D is dr else 0
                D.ellipse((x - hw, hy - hh + off, x + hw, hy + hh + off), fill=c)
                D.rounded_rectangle((x - sw / 2, hy + hh * 0.7 + off, x + sw / 2, H + 50), radius=int(sw / 2.4), fill=c)
            if rnd.random() < 0.06 and row < 3:  # braço levantado
                ax = x + rnd.choice([-1, 1]) * hw * 1.1
                for D, c in ((dr, rim + (150,)), (d, color + (255,))):
                    D.line((ax, hy + hh, ax + rnd.uniform(-20, 20) * scale, hy - hh * 2.6), fill=c, width=int(12 * scale))
            if phones and rnd.random() < 0.07 and row < 2:
                px, py = x + rnd.uniform(-hw, hw), hy - hh * rnd.uniform(1.2, 2.2)
                d.rounded_rectangle((px - 7 * scale, py - 12 * scale, px + 7 * scale, py + 12 * scale), radius=3, fill=(200, 255, 250, 255))
            x += sw * rnd.uniform(0.62, 0.8)
    rimlay = rimlay.filter(ImageFilter.GaussianBlur(2))
    rimlay.alpha_composite(lay)
    return rimlay

def render(name, W, H, seed, glitter_n, crowd_h=0.0, bokeh_n=70, beams_on=True, spots=True, dark=1.0, q=82):
    rnd = random.Random(seed)
    img = base(W, H, glow=dark)
    if beams_on: img = screen(img, np.asarray(beams(W, H, rnd), dtype=np.float32))
    img = screen(img, np.asarray(bokeh(W, H, bokeh_n, rnd), dtype=np.float32))
    if spots: img = screen(img, np.asarray(spotlights(W, H, rnd), dtype=np.float32))
    g = glitter(W, H, glitter_n, rnd)
    img = screen(img, np.asarray(g.filter(ImageFilter.GaussianBlur(0.6)), dtype=np.float32))
    if crowd_h:
        ch = int(H * crowd_h)
        c = crowd(W, ch, rnd)
        full = Image.new('RGBA', (W, H), (0, 0, 0, 0)); full.alpha_composite(c, (0, H - ch))
        img = add_layer(img, full)
    # vinheta
    yy, xx = np.mgrid[0:H, 0:W]
    v = np.clip(1 - 0.55 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 1.4)) ** 2), 0.35, 1)
    img *= v[..., None]
    out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    out.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=q, method=6)
    print(name, out.size)

render('palco-hero', 2400, 1350, 24, 26000, crowd_h=0.0)
render('palco-hero-vertical', 1080, 1920, 25, 15000, crowd_h=0.0)
render('palco-secao', 1920, 1200, 26, 9000, bokeh_n=30, beams_on=False, spots=False, dark=0.55)
render('palco-secao-b', 1920, 1200, 27, 7000, bokeh_n=24, beams_on=True, spots=False, dark=0.45)

# plateia separada (para ficar NA FRENTE das fotos)
rnd = random.Random(2024)
c = crowd(2400, 420, rnd)
c.save(os.path.join(OUT, 'plateia.webp'), 'WEBP', quality=85)
print('plateia')
