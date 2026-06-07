#!/usr/bin/env python3
"""生成微信小程序 TabBar 可爱图标 (81x81)"""

from pathlib import Path
from PIL import Image, ImageDraw

SIZE = 81
OUT = Path(__file__).resolve().parent.parent / "src" / "static" / "tab"

INACTIVE = "#C9A8A8"
ACTIVE = "#FF6B9D"
ACTIVE_ACCENT = "#FF8B6A"
BLUSH = "#FFB8D0"


def new_canvas():
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def circle(draw, cx, cy, r, fill, outline=None, width=1):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=outline, width=width)


def draw_home(draw, color, accent):
    # 小房子
    draw.polygon([(40, 22), (18, 38), (62, 38)], fill=color)
    draw.rectangle([24, 38, 56, 58], fill=color)
    circle(draw, 40, 48, 5, "#FFFFFF")
    # 屋顶小爱心
    draw.polygon([(40, 28), (37, 32), (43, 32)], fill=accent)
    draw.polygon([(40, 30), (35, 34), (45, 34)], fill=accent)


def draw_comment(draw, color, accent):
    # 放大镜 + 气泡
    circle(draw, 36, 36, 16, None, outline=color, width=3)
    draw.line([(48, 48), (58, 58)], fill=color, width=4)
    # 小星星装饰
    for x, y in [(22, 24), (54, 26)]:
        draw.polygon([(x, y - 4), (x + 2, y), (x, y + 4), (x - 2, y)], fill=accent)


def draw_template(draw, color, accent):
    # 便签纸
    draw.rounded_rectangle([22, 20, 58, 58], radius=6, fill=color)
    draw.rectangle([28, 30, 52, 33], fill="#FFFFFF")
    draw.rectangle([28, 38, 48, 41], fill="#FFFFFF")
    draw.rectangle([28, 46, 44, 49], fill="#FFFFFF")
    # 角标星星
    cx, cy = 54, 24
    draw.polygon([(cx, cy - 5), (cx + 2, cy - 1), (cx + 5, cy - 1), (cx + 3, cy + 1), (cx + 4, cy + 4), (cx, cy + 2), (cx - 4, cy + 4), (cx - 3, cy + 1), (cx - 5, cy - 1), (cx - 2, cy - 1)], fill=accent)


def draw_mine(draw, color, accent):
    # 可爱圆脸
    circle(draw, 40, 38, 20, color)
    circle(draw, 32, 36, 3, "#FFFFFF")
    circle(draw, 48, 36, 3, "#FFFFFF")
    circle(draw, 32, 36, 1, "#6B4F4F")
    circle(draw, 48, 36, 1, "#6B4F4F")
    # 腮红
    circle(draw, 28, 44, 4, BLUSH if color == ACTIVE else "#E8D0D0")
    circle(draw, 52, 44, 4, BLUSH if color == ACTIVE else "#E8D0D0")
    # 微笑
    draw.arc([32, 40, 48, 50], start=200, end=340, fill="#FFFFFF", width=2)
    # 小蝴蝶结
    draw.polygon([(40, 16), (34, 22), (40, 20), (46, 22)], fill=accent)


ICON_DRAWERS = {
    "home": draw_home,
    "comment": draw_comment,
    "template": draw_template,
    "mine": draw_mine,
}


def render(name, active=False):
    img, draw = new_canvas()
    color = ACTIVE if active else INACTIVE
    accent = ACTIVE_ACCENT if active else INACTIVE
    ICON_DRAWERS[name](draw, color, accent)
    suffix = "-active" if active else ""
    img.save(OUT / f"{name}{suffix}.png")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name in ICON_DRAWERS:
        render(name, active=False)
        render(name, active=True)
    print(f"Generated {len(ICON_DRAWERS) * 2} icons -> {OUT}")


if __name__ == "__main__":
    main()
