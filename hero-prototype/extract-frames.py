#!/usr/bin/env python3
"""Extract frames from hero-v1.mp4 into assets/hero-seq/raw/"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "hero-seq" / "raw"
CANDIDATES = [
    ROOT / "assets" / "landing" / "hero-v1.mp4",
    ROOT / "assets" / "generation-b3bb8d86-79cc-4743-8e88-bf36276c060c.mp4",
]


def find_video() -> Path:
    for p in CANDIDATES:
        if p.is_file():
            return p
    # any generation-*.mp4 in assets/
    matches = sorted((ROOT / "assets").glob("generation-*.mp4"))
    if matches:
        return matches[0]
    raise SystemExit("Video not found. Put it at assets/landing/hero-v1.mp4")


def extract_ffmpeg(video: Path) -> int:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        return -1
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("frame-*.png"):
        old.unlink()
    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(video),
        "-vf",
        "fps=18",
        str(OUT / "frame-%04d.png"),
    ]
    print(" ".join(cmd))
    subprocess.check_call(cmd)
    return len(list(OUT.glob("frame-*.png")))


def extract_cv2(video: Path) -> int:
    try:
        import cv2
    except ImportError:
        return -1
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("frame-*.png"):
        old.unlink()
    cap = cv2.VideoCapture(str(video))
    if not cap.isOpened():
        raise SystemExit(f"Cannot open {video}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 24
    step = max(fps / 18.0, 1.0)
    idx = 0
    saved = 0
    next_t = 0.0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if idx >= next_t:
            saved += 1
            path = OUT / f"frame-{saved:04d}.png"
            cv2.imwrite(str(path), frame)
            next_t += step
        idx += 1
    cap.release()
    return saved


def main() -> None:
    video = find_video()
    print(f"source: {video}")
    n = extract_ffmpeg(video)
    if n < 0:
        print("ffmpeg not found, trying OpenCV…")
        n = extract_cv2(video)
    if n < 0:
        raise SystemExit(
            "Need ffmpeg or opencv-python.\n"
            "Install: pip3 install opencv-python-headless\n"
            "Or download ffmpeg: https://evermeet.cx/ffmpeg/"
        )
    print(f"done: {n} frames → {OUT}")


if __name__ == "__main__":
    main()
