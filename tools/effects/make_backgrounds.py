"""Draws the virtual backgrounds offered in the camera effects menu (effects/bg-*.jpg) and their thumbnails.

Everything is painted here from simple shapes, then softened like an out-of-focus photo, so the site ships no
stock photos and no third-party artwork. Run: python3 tools/effects/make_backgrounds.py
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

W, H = 1280, 720
OUT = Path(__file__).resolve().parents[2] / 'effects'


def vgrad(top, bottom, w=W, h=H):
    img = Image.new('RGB', (w, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / (h - 1)
        d.line([(0, y), (w, y)], fill=tuple(round(a + (b - a) * t) for a, b in zip(top, bottom)))
    return img


def vignette(img, strength=0.35):
    mask = Image.new('L', img.size, 0)
    d = ImageDraw.Draw(mask)
    w, h = img.size
    d.ellipse([-w * 0.25, -h * 0.35, w * 1.25, h * 1.35], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(160))
    dark = Image.new('RGB', img.size, (0, 0, 0))
    return Image.composite(img, Image.blend(img, dark, strength), mask)


def bookshelf(rng):
    img = vgrad((92, 72, 56), (70, 54, 42))
    d = ImageDraw.Draw(img)
    palette = [(150, 52, 44), (38, 70, 110), (210, 180, 120), (60, 100, 76), (230, 222, 205), (120, 84, 60),
               (44, 44, 52), (176, 120, 70), (96, 120, 150), (190, 90, 60), (140, 150, 120)]
    shelf_y = [130, 330, 530, 730]
    for i, y in enumerate(shelf_y[:-1]):
        x = 40
        top = y + 18
        while x < W - 40:
            if rng.random() < 0.06:   # a gap with a small plant pot or a lying stack
                if rng.random() < 0.5:
                    d.rounded_rectangle([x + 10, y + 120, x + 70, y + 190], 8, fill=(200, 196, 186))
                    for k in range(7):
                        a = -math.pi / 2 + (k - 3) * 0.35
                        d.ellipse([x + 40 + math.cos(a) * 50 - 18, y + 120 + math.sin(a) * 60 - 10,
                                   x + 40 + math.cos(a) * 50 + 18, y + 120 + math.sin(a) * 60 + 10], fill=(70, 120, 70))
                    x += 90
                else:
                    for k in range(4):
                        c = rng.choice(palette)
                        d.rectangle([x, y + 190 - (k + 1) * 22, x + 150 - k * 8, y + 190 - k * 22 - 2], fill=c)
                    x += 170
                continue
            bw = rng.randint(18, 42)
            bh = rng.randint(120, 175)
            c = rng.choice(palette)
            lean = rng.random() < 0.05
            d.rectangle([x, top + (175 - bh), x + bw, top + 175], fill=c)
            # a band on the spine, like a title
            band = tuple(min(255, v + 45) for v in c)
            d.rectangle([x + 3, top + (175 - bh) + 22, x + bw - 3, top + (175 - bh) + 30], fill=band)
            x += bw + (6 if lean else 2)
        d.rectangle([0, y + 193, W, y + 205], fill=(58, 42, 30))   # the shelf board
        d.rectangle([0, y + 205, W, y + 212], fill=(40, 30, 22))
    img = img.filter(ImageFilter.GaussianBlur(5))
    # warm light from the left
    light = Image.new('RGB', img.size, (255, 214, 160))
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).ellipse([-500, -300, 700, 900], fill=70)
    img = Image.composite(light, img, mask.filter(ImageFilter.GaussianBlur(200)))
    return vignette(img, 0.3)


def office(rng):
    img = vgrad((236, 238, 240), (214, 216, 218))
    d = ImageDraw.Draw(img)
    # a big window with a city outside
    wx0, wy0, wx1, wy1 = 520, 70, 1220, 560
    sky = vgrad((170, 205, 235), (225, 236, 244), wx1 - wx0, wy1 - wy0)
    sd = ImageDraw.Draw(sky)
    x = 0
    while x < wx1 - wx0:
        bw = rng.randint(50, 130)
        bh = rng.randint(120, 380)
        g = rng.randint(150, 190)
        sd.rectangle([x, (wy1 - wy0) - bh, x + bw, wy1 - wy0], fill=(g - 10, g, g + 12))
        for yy in range((wy1 - wy0) - bh + 14, wy1 - wy0 - 10, 22):
            for xx in range(x + 8, x + bw - 8, 18):
                sd.rectangle([xx, yy, xx + 8, yy + 10], fill=(g + 25, g + 32, g + 40))
        x += bw + rng.randint(4, 20)
    img.paste(sky, (wx0, wy0))
    for mx in range(wx0, wx1 + 1, 175):   # window frame
        d.rectangle([mx - 6, wy0, mx + 6, wy1], fill=(70, 74, 80))
    d.rectangle([wx0 - 6, wy0 - 6, wx1 + 6, wy0 + 6], fill=(70, 74, 80))
    d.rectangle([wx0 - 6, wy1 - 6, wx1 + 6, wy1 + 6], fill=(70, 74, 80))
    # desk, chair back and a plant
    d.rectangle([0, 560, W, H], fill=(196, 186, 172))
    d.rectangle([0, 548, W, 566], fill=(150, 120, 92))
    d.rounded_rectangle([140, 300, 380, 560], 30, fill=(58, 62, 70))
    d.rounded_rectangle([110, 120, 330, 330], 14, fill=(250, 250, 250))   # a whiteboard
    for k in range(5):
        d.line([(135, 160 + k * 30), (135 + rng.randint(90, 170), 160 + k * 30)], fill=(90, 130, 200), width=5)
    d.rounded_rectangle([1150, 420, 1240, 556], 12, fill=(235, 232, 226))
    for k in range(12):
        a = -math.pi / 2 + (k - 5.5) * 0.28
        r = rng.randint(120, 190)
        d.ellipse([1195 + math.cos(a) * r * .6 - 24, 420 + math.sin(a) * r - 14,
                   1195 + math.cos(a) * r * .6 + 24, 420 + math.sin(a) * r + 14], fill=(66, 128, 72))
    d.rectangle([0, 0, W, 18], fill=(244, 245, 246))
    img = img.filter(ImageFilter.GaussianBlur(7))
    return vignette(img, 0.18)


def bokeh(rng):
    img = vgrad((26, 22, 40), (12, 10, 18))
    layer = Image.new('RGB', img.size, (0, 0, 0))
    d = ImageDraw.Draw(layer)
    cols = [(255, 190, 110), (255, 150, 90), (250, 220, 160), (140, 170, 255), (255, 120, 150)]
    for _ in range(38):
        r = rng.randint(20, 85)
        x, y = rng.randint(-40, W + 40), rng.randint(-40, H + 40)
        c = rng.choice(cols)
        k = rng.uniform(0.35, 0.8)
        d.ellipse([x - r, y - r, x + r, y + r], fill=tuple(round(v * k) for v in c))
    layer = layer.filter(ImageFilter.GaussianBlur(6))
    return ImageChops.screen(img, layer)


def living(rng):
    img = vgrad((228, 220, 206), (210, 200, 186))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 500, W, H], fill=(176, 150, 120))   # floor
    d.rectangle([0, 490, W, 504], fill=(240, 236, 228))   # skirting
    d.rounded_rectangle([700, 330, 1240, 520], 40, fill=(108, 128, 140))   # sofa
    d.rounded_rectangle([720, 260, 1220, 380], 40, fill=(120, 142, 154))
    d.rounded_rectangle([780, 290, 900, 370], 20, fill=(220, 176, 110))   # cushions
    d.rounded_rectangle([1060, 290, 1180, 370], 20, fill=(236, 226, 210))
    d.rectangle([780, 80, 1140, 230], fill=(250, 248, 244))   # a framed print
    d.rectangle([800, 100, 1120, 210], fill=(214, 190, 160))
    d.ellipse([860, 120, 960, 220], fill=(196, 120, 80))
    d.line([(300, 120), (300, 470)], fill=(60, 56, 52), width=8)   # floor lamp
    d.polygon([(230, 120), (370, 120), (340, 40), (260, 40)], fill=(250, 238, 210))
    d.ellipse([250, 460, 350, 490], fill=(60, 56, 52))
    d.rounded_rectangle([60, 360, 160, 500], 14, fill=(232, 228, 220))   # plant
    for k in range(14):
        a = -math.pi / 2 + (k - 6.5) * 0.24
        r = rng.randint(130, 220)
        d.ellipse([110 + math.cos(a) * r * .5 - 26, 360 + math.sin(a) * r - 14,
                   110 + math.cos(a) * r * .5 + 26, 360 + math.sin(a) * r + 14], fill=(74, 120, 76))
    img = img.filter(ImageFilter.GaussianBlur(6))
    light = Image.new('RGB', img.size, (255, 236, 200))
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).ellipse([0, -200, 600, 400], fill=80)
    img = Image.composite(light, img, mask.filter(ImageFilter.GaussianBlur(150)))
    return vignette(img, 0.2)


def abstract(rng):
    img = vgrad((60, 64, 160), (120, 70, 170))
    layer = Image.new('RGB', img.size)
    d = ImageDraw.Draw(layer)
    for c, box in [((80, 170, 230), (-200, 300, 700, 1100)), ((240, 130, 170), (700, -300, 1600, 500)),
                   ((90, 90, 200), (400, 200, 1100, 900))]:
        d.ellipse(box, fill=c)
    layer = layer.filter(ImageFilter.GaussianBlur(140))
    return Image.blend(img, layer, 0.7)


BACKGROUNDS = [('office', office), ('bookshelf', bookshelf), ('living', living), ('bokeh', bokeh), ('abstract', abstract)]

if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    for i, (name, fn) in enumerate(BACKGROUNDS):
        img = fn(random.Random(17 + i)).convert('RGB')
        img.save(OUT / f'bg-{name}.jpg', quality=82, optimize=True, progressive=True)
        img.resize((192, 108), Image.LANCZOS).save(OUT / f'bg-{name}-thumb.jpg', quality=82, optimize=True)
        print(name, (OUT / f'bg-{name}.jpg').stat().st_size)
