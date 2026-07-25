# -*- coding: utf-8 -*-
"""
美化方案 P0-B · 程序化星云背景生成
输出: public/assets/bg-nebula.webp  (1920x1080, <=200KB, 深蓝紫低对比)
纯本地生成, 不消耗任何图像生成额度。
"""
import numpy as np
from PIL import Image, ImageFilter

W, H = 1920, 1080
rng = np.random.default_rng(2077)

# ---- 多八度 value noise ----
def fractal_noise(w, h, octaves=5, seed_rng=None):
    r = seed_rng or rng
    acc = np.zeros((h, w), dtype=np.float64)
    amp_total = 0.0
    for o in range(octaves):
        scale = 2 ** (o + 2)  # 4, 8, 16, 32, 64 cells
        gw, gh = scale + 1, max(2, int(scale * h / w) + 1)
        grid = r.random((gh, gw))
        img = Image.fromarray((grid * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        amp = 0.5 ** o
        acc += np.asarray(img, dtype=np.float64) / 255.0 * amp
        amp_total += amp
    return acc / amp_total

base = fractal_noise(W, H, octaves=6)

# ---- 星云团块: 几处高斯亮斑 ----
yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)
def blob(cx, cy, sx, sy, power):
    d2 = ((xx - cx) / sx) ** 2 + ((yy - cy) / sy) ** 2
    return np.exp(-d2) * power

nebula = (
    blob(W * 0.72, H * 0.30, 520, 300, 1.0)   # 右上主星云
    + blob(W * 0.25, H * 0.68, 420, 260, 0.75) # 左下副星云
    + blob(W * 0.50, H * 0.95, 600, 200, 0.45) # 底部弥散
)
density = np.clip(base * 0.65 + nebula * 0.6, 0, 1.4)
density = density / density.max()

# ---- 配色: 深蓝紫低对比 ----
# 深空底色 #05050f -> 紫 #3a2a6e -> 青点缀 #0e4a5c
deep = np.array([5, 5, 15], dtype=np.float64)
purple = np.array([58, 42, 110], dtype=np.float64)
teal = np.array([14, 74, 92], dtype=np.float64)

t1 = np.clip(density * 1.15, 0, 1)[..., None]
t2 = np.clip((density - 0.45) * 1.6, 0, 1)[..., None]
img = deep * (1 - t1) + purple * t1
img = img * (1 - t2 * 0.55) + teal * (t2 * 0.55)

# ---- 稀疏星点 ----
stars = np.zeros((H, W), dtype=np.float64)
n_stars = 260
sx = rng.integers(0, W, n_stars)
sy = rng.integers(0, H, n_stars)
brightness = rng.random(n_stars) ** 2.2
stars[sy, sx] = brightness
star_img = Image.fromarray((np.clip(stars, 0, 1) * 255).astype(np.uint8))
star_img = star_img.filter(ImageFilter.GaussianBlur(0.6))
stars = np.asarray(star_img, dtype=np.float64) / 255.0
img += stars[..., None] * np.array([200, 220, 235], dtype=np.float64) * 0.55

img = np.clip(img, 0, 255).astype(np.uint8)
out = Image.fromarray(img, "RGB")
out = out.filter(ImageFilter.GaussianBlur(2.5))

import os
os.makedirs("public/assets", exist_ok=True)
out.save("public/assets/bg-nebula.webp", "WEBP", quality=72, method=6)
size = os.path.getsize("public/assets/bg-nebula.webp")
print(f"OK public/assets/bg-nebula.webp {size/1024:.1f}KB")
