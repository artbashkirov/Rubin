#!/usr/bin/env python3
"""Optimize hero-seq frames: PNG → WebP (and optional AVIF)."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "hero-seq" / "raw"
OUT_WEBP = ROOT / "assets" / "hero-seq" / "webp"
OUT_AVIF = ROOT / "assets" / "hero-seq" / "avif"

# 01.png … 65.png
PAD = 2
COUNT = 65
WEBP_Q = 82
AVIF_Q = 60
MAX_WIDTH = 1728


def main() -> None:
    try:
        from PIL import Image
    except ImportError:
        raise SystemExit("pip3 install pillow")

    OUT_WEBP.mkdir(parents=True, exist_ok=True)

    total_in = 0
    total_out = 0

    for i in range(1, COUNT + 1):
        src = SRC / f"{i:0{PAD}d}.png"
        if not src.is_file():
            # try frame-0001 style
            alt = SRC / f"frame-{i:04d}.png"
            if alt.is_file():
                src = alt
            else:
                raise SystemExit(f"Missing: {src}")

        img = Image.open(src).convert("RGB")
        if img.width > MAX_WIDTH:
            h = round(img.height * (MAX_WIDTH / img.width))
            img = img.resize((MAX_WIDTH, h), Image.Resampling.LANCZOS)

        dest = OUT_WEBP / f"frame-{i:04d}.webp"
        img.save(dest, "WEBP", quality=WEBP_Q, method=6)

        total_in += src.stat().st_size
        total_out += dest.stat().st_size
        print(f"{src.name} → {dest.name}  {dest.stat().st_size/1024:.0f} KB")

    print(
        f"\nDone: {COUNT} frames → {OUT_WEBP}\n"
        f"In:  {total_in/1024/1024:.1f} MB\n"
        f"Out: {total_out/1024/1024:.1f} MB\n"
        f"Ratio: {100*total_out/max(total_in,1):.1f}%"
    )


if __name__ == "__main__":
    main()
