#!/usr/bin/env python3
"""Мастер-кадр терминала (16:9, без чёрных полей) и 5 кусков для разлёта в секцию 2.

Источник — assets/landing/terminal-flat-live-raw.png (3456×2000). В frame-0116 тот же
скриншот вписан в 1339×752 @ (194, 110), т.е. сжат по вертикали до 16:9 — мастер повторяет это.

Запуск: python3 scripts/build-explode-pieces.py
"""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/landing/terminal-flat-live-raw.png"
OUT = ROOT / "assets/landing/explode"
FONT = ROOT / "assets/landing/rropaguetrial-medium.otf"

STAGE_W, STAGE_H = 1728, 972
MASTER_W, MASTER_H = STAGE_W * 2, STAGE_H * 2

# Положение UI в frame-0116 (px стейджа 1728×972)
FRAME_UI = {"x": 194, "y": 110, "w": 1339, "h": 752}

# Куски в координатах исходника 3456×2000. Линии реза — по разделителям панелей
# и по середине зазоров между элементами. cutout — область, принадлежащая другому куску.
PIECES = [
    {
        "id": "leverage",
        "n": 1,
        "label": "Плечо",
        "rect": (2176, 102, 2816, 225),
        "color": (255, 92, 64),
    },
    {
        "id": "markets",
        "n": 2,
        "label": "Спот и перпы",
        "rect": (0, 102, 1588, 290),
        "color": (255, 214, 64),
    },
    {
        "id": "orders",
        "n": 3,
        "label": "Заявки",
        "rect": (1594, 102, 2816, 1496),
        "cutout": (2176, 102, 2816, 225),
        "color": (64, 224, 128),
    },
    {
        "id": "news",
        "n": 4,
        "label": "Новости",
        "rect": (2816, 445, 3456, 2000),
        "color": (168, 120, 255),
    },
    {
        "id": "tv",
        "n": 5,
        "label": "Rubin TV",
        "rect": (2816, 0, 3456, 445),
        "color": (255, 80, 200),
    },
]


def scale_rect(rect, sx, sy):
    x0, y0, x1, y1 = rect
    return (round(x0 * sx), round(y0 * sy), round(x1 * sx), round(y1 * sy))


def stage_box(master_rect):
    x0, y0, x1, y1 = master_rect
    return {"x": x0 / 2, "y": y0 / 2, "w": (x1 - x0) / 2, "h": (y1 - y0) / 2}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC).convert("RGB")
    sw, sh = src.size

    master = src.resize((MASTER_W, MASTER_H), Image.LANCZOS)
    master.save(OUT / "terminal-master@2x.png", optimize=True)
    master_1x = src.resize((STAGE_W, STAGE_H), Image.LANCZOS)
    master_1x.save(OUT / "terminal-master.png", optimize=True)

    sx, sy = MASTER_W / sw, MASTER_H / sh
    meta = {
        "stage": {"w": STAGE_W, "h": STAGE_H},
        "source": {"file": SRC.name, "w": sw, "h": sh},
        "master": {"file": "terminal-master@2x.png", "w": MASTER_W, "h": MASTER_H},
        "frameUi": FRAME_UI,
        "pieces": [],
    }

    for p in PIECES:
        x0, y0, x1, y1 = scale_rect(p["rect"], sx, sy)
        piece = master.crop((x0, y0, x1, y1)).convert("RGBA")
        if "cutout" in p:
            cx0, cy0, cx1, cy1 = scale_rect(p["cutout"], sx, sy)
            ImageDraw.Draw(piece).rectangle(
                (cx0 - x0, cy0 - y0, cx1 - x0 - 1, cy1 - y0 - 1), fill=(0, 0, 0, 0)
            )
        name = f"piece-{p['n']}-{p['id']}@2x.png"
        piece.save(OUT / name, optimize=True)

        stage = stage_box((x0, y0, x1, y1))
        in_frame = {
            "x": FRAME_UI["x"] + stage["x"] * FRAME_UI["w"] / STAGE_W,
            "y": FRAME_UI["y"] + stage["y"] * FRAME_UI["h"] / STAGE_H,
            "w": stage["w"] * FRAME_UI["w"] / STAGE_W,
            "h": stage["h"] * FRAME_UI["h"] / STAGE_H,
        }
        entry = {
            "id": p["id"],
            "n": p["n"],
            "label": p["label"],
            "file": name,
            "stage": {k: round(v, 2) for k, v in stage.items()},
            "frame116": {k: round(v, 2) for k, v in in_frame.items()},
        }
        if "cutout" in p:
            entry["cutout"] = stage_box(scale_rect(p["cutout"], sx, sy))
        meta["pieces"].append(entry)

    (OUT / "pieces.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n")

    # Остальной интерфейс: мастер с прозрачными дырками на месте кусков
    rest = master.convert("RGBA")
    holes = ImageDraw.Draw(rest)
    for p in PIECES:
        x0, y0, x1, y1 = scale_rect(p["rect"], sx, sy)
        holes.rectangle((x0, y0, x1 - 1, y1 - 1), fill=(0, 0, 0, 0))
    rest.save(OUT / "terminal-rest@2x.png", optimize=True)

    font = ImageFont.truetype(str(FONT), 22)

    # Превью 1: мастер, всё кроме кусков притушено, куски обведены
    dim = Image.eval(master_1x, lambda v: int(v * 0.22))
    cut = dim.copy()
    for p in PIECES:
        r = scale_rect(p["rect"], STAGE_W / sw, STAGE_H / sh)
        cut.paste(master_1x.crop(r), r[:2])
        if "cutout" in p:
            c = scale_rect(p["cutout"], STAGE_W / sw, STAGE_H / sh)
            cut.paste(master_1x.crop(c), c[:2])
    draw = ImageDraw.Draw(cut)
    for p in PIECES:
        x0, y0, x1, y1 = scale_rect(p["rect"], STAGE_W / sw, STAGE_H / sh)
        if "cutout" in p:
            cx0, cy0, cx1, cy1 = scale_rect(p["cutout"], STAGE_W / sw, STAGE_H / sh)
            outline = [(x0, y0), (cx0, y0), (cx0, cy1), (x1, cy1), (x1, y1), (x0, y1), (x0, y0)]
            draw.line(outline, fill=p["color"], width=3)
        else:
            draw.rectangle((x0 + 1, y0 + 1, x1 - 2, y1 - 2), outline=p["color"], width=3)
        tag = f"{p['n']} {p['label']}"
        tw = draw.textlength(tag, font=font)
        # низкий кусок — ярлык под рамкой, чтобы не закрывать содержимое
        ty = y1 + 6 if y1 - y0 < 80 else y0 + 6
        draw.rectangle((x0 + 6, ty, x0 + 18 + tw, ty + 32), fill=p["color"])
        draw.text((x0 + 12, ty + 3), tag, font=font, fill=(0, 0, 0))
    cut.save(OUT / "preview-cut.png", optimize=True)

    # Превью 2: только куски на чёрном, на своих местах
    only = Image.new("RGB", (STAGE_W, STAGE_H), (0, 0, 0))
    for m in meta["pieces"]:
        img = Image.open(OUT / m["file"])
        img = img.resize((round(m["stage"]["w"]), round(m["stage"]["h"])), Image.LANCZOS)
        only.paste(img, (round(m["stage"]["x"]), round(m["stage"]["y"])), img)
    only.save(OUT / "preview-pieces-only.png", optimize=True)

    for m in meta["pieces"]:
        print(f"{m['file']:28s} stage {m['stage']}")


if __name__ == "__main__":
    main()
