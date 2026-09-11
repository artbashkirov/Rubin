#!/usr/bin/env python3
"""Re-optimize only last frame (65) at higher quality."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "hero-seq" / "raw" / "65.png"
OUT_WEBP = ROOT / "assets" / "hero-seq" / "webp" / "frame-0065.webp"
OUT_LAST = ROOT / "assets" / "hero-seq" / "last.webp"
MAX_WIDTH = 1920  # чуть шире для финала
WEBP_Q = 92

img = Image.open(SRC).convert("RGB")
if img.width > MAX_WIDTH:
    h = round(img.height * (MAX_WIDTH / img.width))
    img = img.resize((MAX_WIDTH, h), Image.Resampling.LANCZOS)

OUT_WEBP.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT_WEBP, "WEBP", quality=WEBP_Q, method=6)
img.save(OUT_LAST, "WEBP", quality=WEBP_Q, method=6)
print(f"{SRC} → {OUT_WEBP} ({OUT_WEBP.stat().st_size/1024:.0f} KB)")
print(f"{SRC} → {OUT_LAST} ({OUT_LAST.stat().st_size/1024:.0f} KB)")
