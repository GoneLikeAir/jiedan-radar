#!/usr/bin/env python3
"""Render the 1200x630 OG card from named tokens. No invented prices."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
OUT = Path(__file__).resolve().parents[1] / "public" / "og.png"

BOARD = (26, 58, 72)       # #1A3A48
NIGHT = (18, 40, 48)       # #122830
SLIP = (232, 241, 246)     # #E8F1F6
ROSE = (196, 58, 110)      # #C43A6E
GOLD = (201, 162, 39)      # #C9A227
TEAL = (44, 122, 118)      # #2C7A76
INK = (22, 50, 63)         # #16323F

CJK = "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"


def font(path, size, index=0):
    try:
        return ImageFont.truetype(path, size=size, index=index)
    except OSError:
        return ImageFont.load_default()


def main():
    img = Image.new("RGB", (W, H), NIGHT)
    d = ImageDraw.Draw(img)

    d.rectangle((0, 0, W, H), fill=BOARD)
    d.rectangle((0, 0, 28, H), fill=NIGHT)
    for y in range(36, H, 42):
        d.ellipse((10, y, 26, y + 16), fill=SLIP)

    # radar rings
    cx, cy = 1040, 150
    for r, col in ((118, GOLD), (78, TEAL), (40, ROSE)):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=col, width=4)
    d.line((cx, cy, cx + 70, cy - 86), fill=ROSE, width=6)
    d.ellipse((cx - 8, cy - 8, cx + 8, cy + 8), fill=GOLD)

    # slip panel
    d.rounded_rectangle((70, 150, 860, 560), radius=10, fill=SLIP)
    for y in range(168, 540, 22):
        d.ellipse((62, y, 78, y + 16), fill=BOARD)

    title = font(CJK, 72)
    body = font(CJK, 32)
    data = font(MONO, 26)
    small = font(CJK, 22)

    d.text((96, 48), "DISPATCH / 工单雷达板", font=data, fill=GOLD)
    d.text((96, 176), "接单雷达 · 2026-09-02", font=title, fill=INK)
    d.text((96, 270), "给 Alex 的内部 briefing，不是营销站。", font=body, fill=INK)
    d.text((96, 330), "国内先挂闲鱼标品，再冲客栈月结。", font=body, fill=TEAL)
    d.text((96, 380), "海外按 Upwork 2026-08 中位 $32.50/hr，", font=body, fill=TEAL)
    d.text((96, 430), "不要把编辑综述当成发票。", font=body, fill=ROSE)
    d.text((96, 500), "数字只收录能回溯 URL 的来源  ·  Asia/Shanghai", font=small, fill=INK)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG")
    print(f"wrote {OUT} {img.size}")


if __name__ == "__main__":
    main()
