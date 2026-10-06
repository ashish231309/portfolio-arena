"""S7 — generate the social cover and the app icons from the site's own design.

Everything here is derived from the shipped site, nothing is a placeholder:
  · the fonts are the three WOFF2 files the site serves, converted with fontTools
  · the palette is tailwind.config.js (ivory/paper/ink/indigo/cyan/lime)
  · the motif (indigo dashed ring, cyan + lime dots, AK monogram) is favicon.svg
  · the headline and the location line are profile.js / index.html copy

Outputs (all written without embedded metadata, so `npm run check:meta` stays clean):
  public/og-cover.png            1200x630   link previews (og:image / twitter:image)
  public/apple-touch-icon.png    180x180    iOS home screen
  public/icons/icon-192.png      192x192    Android / manifest
  public/icons/icon-512.png      512x512    Android / manifest / splash
  public/icons/maskable-512.png  512x512    Android adaptive (content inside the safe zone)

Usage: python3 audit/tools/generate-social-assets.py [--variant a|b|both]
"""
import argparse
import os
import tempfile

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------- design tokens
IVORY = (246, 242, 232)
PAPER = (255, 252, 245)
INK = (16, 22, 43)
DEEP = (18, 26, 45)
INDIGO = (108, 92, 231)
INDIGO_INK = (90, 75, 212)
CYAN = (39, 211, 242)
LIME = (199, 243, 107)
MUTED = (91, 100, 116)

FONTS = {
    'display': 'public/fonts/space-grotesk-latin-wght-normal.woff2',
    'body': 'public/fonts/manrope-latin-wght-normal.woff2',
    'mono': 'public/fonts/jetbrains-mono-latin-wght-normal.woff2',
}
HEADLINE = 'Computer Science student building with Software, Web & Generative AI'
LOCATION = 'KANPUR, INDIA  ·  26.449°N, 80.339°E'
LINKS = 'github.com/ashish1492a   ·   linkedin.com/in/ashish-kumar-52507641b'
SCREENSHOT = 'public/projects/coding-ninjas/coding-ninjas-01-hero.jpeg'


# ---------------------------------------------------------------- helpers
def convert_fonts(tmpdir):
    """The site ships WOFF2; Pillow wants TTF. Same bytes, re-wrapped."""
    out = {}
    for name, path in FONTS.items():
        font = TTFont(path)
        font.flavor = None
        target = os.path.join(tmpdir, f'{name}.ttf')
        font.save(target)
        out[name] = target
    return out


def font(path, size, weight=None):
    f = ImageFont.truetype(path, size)
    if weight is not None:
        try:
            f.set_variation_by_axes([weight])
        except Exception:
            pass
    return f


def text_width(draw, text, f):
    return draw.textlength(text, font=f)


def gradient_bar(img, box, colors, radius=6, steps=480):
    """indigo → cyan → lime, the accent gradient from the scroll-progress bar.

    Built as one gradient strip, then rounded by a mask — drawing it as a series of
    rounded rectangles leaves visible beads along the join.
    """
    x0, y0, x1, y1 = [int(v) for v in box]
    w, h = x1 - x0, y1 - y0
    strip = Image.new('RGB', (w, h))
    sd = ImageDraw.Draw(strip)
    for i in range(w):
        t = i / max(1, w - 1)
        seg = t * (len(colors) - 1)
        a, b = colors[int(seg)], colors[min(int(seg) + 1, len(colors) - 1)]
        f = seg - int(seg)
        sd.line([(i, 0), (i, h)], fill=tuple(round(a[k] + (b[k] - a[k]) * f) for k in range(3)))
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w, h], radius=radius, fill=255)
    img.paste(strip, (x0, y0), mask)


def dashed_circle(draw, cx, cy, r, colour, width, dash, gap):
    import math
    n = max(8, int(2 * math.pi * r / (dash + gap)))
    for i in range(n):
        a0 = 2 * math.pi * i / n
        a1 = a0 + (dash / (dash + gap)) * (2 * math.pi / n)
        pts = []
        for k in range(7):
            a = a0 + (a1 - a0) * k / 6
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        draw.line(pts, fill=colour, width=width, joint='curve')


def fit_line(draw, text, font_path, max_width, start_size, weight, min_size=30):
    size = start_size
    while size > min_size:
        f = font(font_path, size, weight)
        if text_width(draw, text, f) <= max_width:
            return f
        size -= 2
    return font(font_path, min_size, weight)


# ---------------------------------------------------------------- OG cover
def og_cover(fonts, variant, out_path):
    W, H = 1200, 630
    img = Image.new('RGB', (W, H), IVORY)
    d = ImageDraw.Draw(img)
    margin = 80

    # favicon motif, very quietly, behind everything
    dashed_circle(d, 985, 300, 250, (232, 227, 214), 2, 5, 9)
    dashed_circle(d, 985, 300, 190, (236, 231, 219), 2, 4, 10)

    # header: AK badge + wordmark, exactly the nav's lockup
    badge = 58
    d.rounded_rectangle([margin, 66, margin + badge, 66 + badge], radius=14, fill=INK)
    f_badge = font(fonts['display'], 25, 700)
    d.text((margin + badge / 2, 66 + badge / 2), 'AK', font=f_badge, fill=IVORY, anchor='mm')
    f_mark = font(fonts['display'], 35, 700)
    d.text((margin + badge + 20, 92), 'Ashish', font=f_mark, fill=INK, anchor='lm')
    w_ashish = text_width(d, 'Ashish', f_mark)
    d.text((margin + badge + 20 + w_ashish, 92), '.', font=f_mark, fill=INDIGO_INK, anchor='lm')
    w_dot = text_width(d, '.', f_mark)
    d.text((margin + badge + 20 + w_ashish + w_dot, 92), 'Kumar', font=f_mark, fill=INK, anchor='lm')
    f_loc = font(fonts['mono'], 13, 500)
    d.text((margin + badge + 20, 118), LOCATION, font=f_loc, fill=MUTED, anchor='lm')

    # headline block
    text_left = margin
    text_right = W - margin - (360 if variant == 'b' else 0)
    max_w = text_right - text_left
    lines = [
        ('Computer Science student', INK),
        ('building with Software, Web', None),      # mixed colour inside the line
        ('& Generative AI', INDIGO_INK),
    ]
    size = 66 if variant == 'b' else 74
    f_head = fit_line(d, 'building with Software, Web', fonts['display'], max_w, size, 700)
    size = f_head.size
    line_h = int(size * 1.16)
    y = 205
    for text, colour in lines:
        if colour is not None:
            d.text((text_left, y), text, font=f_head, fill=colour)
        else:
            # "building with " in ink, "Software, Web" in indigo — same accent idea as the hero
            a, b = 'building with ', 'Software, Web'
            d.text((text_left, y), a, font=f_head, fill=INK)
            d.text((text_left + text_width(d, a, f_head), y), b, font=f_head, fill=INDIGO_INK)
        y += line_h

    # accent gradient rule
    gradient_bar(img, (text_left, y + 12, text_left + 300, y + 24), [INDIGO, CYAN, LIME], radius=6)

    # footer line
    f_link = font(fonts['mono'], 14, 500)
    d.text((text_left, H - 62), LINKS, font=f_link, fill=MUTED, anchor='lm')

    if variant == 'b':
        # framed screenshot, ink hairline + offset indigo shadow (the card language)
        shot = Image.open(SCREENSHOT).convert('RGB')
        pw, ph = 360, 226
        panel = shot.resize((pw, ph), Image.LANCZOS)
        px, py = W - margin - pw, 230
        d.rounded_rectangle([px + 10, py + 12, px + pw + 10, py + ph + 12], radius=18, fill=(226, 221, 234))
        mask = Image.new('L', (pw, ph), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, pw, ph], radius=14, fill=255)
        img.paste(panel, (px, py), mask)
        d.rounded_rectangle([px, py, px + pw, py + ph], radius=14, outline=INK, width=2)
        d.ellipse([px + pw - 30, py + ph - 30, px + pw - 30 + 14, py + ph - 30 + 14], fill=CYAN)
        d.ellipse([px + 16, py - 8, px + 16 + 16, py - 8 + 16], fill=LIME)

    img.save(out_path, optimize=True)
    return out_path


# ---------------------------------------------------------------- icons
def draw_icon(size, out_path, maskable=False):
    ss = 4
    S = size * ss
    img = Image.new('RGB', (S, S), INK)
    d = ImageDraw.Draw(img)
    pad = 0.78 if maskable else 1.0
    inner = S * pad
    off = (S - inner) / 2
    u = lambda v: off + v * (S / 64.0) * pad             # noqa: E731
    k = (S / 64.0) * pad
    dashed_circle(d, S / 2, S / 2, 22 * k, INDIGO, max(2, round(2.4 * k)), 4 * k, 5 * k)
    d.ellipse([u(32 - 3.4), u(10 - 3.4), u(32 + 3.4), u(10 + 3.4)], fill=CYAN)
    d.ellipse([u(52 - 4), u(14 - 4), u(52 + 4), u(14 + 4)], fill=LIME)
    f_ak = font(TTF_CACHE['display'], round(24 * k), 700)
    d.text((S / 2, u(33.5)), 'AK', font=f_ak, fill=IVORY, anchor='mm')
    img = img.resize((size, size), Image.LANCZOS)
    img.save(out_path, optimize=True)
    return out_path


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--variant', default='a', choices=['a', 'b', 'both'],
                    help='a = text-led cover (shipped), b = cover with a framed project screenshot')
    ap.add_argument('--out', default='public/og-cover.png',
                    help='where variant a/b is written (ignored for --variant both)')
    args = ap.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        fonts = convert_fonts(tmp)
        TTF_CACHE = fonts                                  # noqa: F841 (used by draw_icon)
        os.makedirs('public/icons', exist_ok=True)
        made = []
        if args.variant in ('a', 'both'):
            made.append(og_cover(fonts, 'a', args.out if args.variant == 'a' else '/tmp/og-cover-a.png'))
        if args.variant in ('b', 'both'):
            made.append(og_cover(fonts, 'b', args.out if args.variant == 'b' else '/tmp/og-cover-b.png'))
        made.append(draw_icon(180, 'public/apple-touch-icon.png'))
        made.append(draw_icon(192, 'public/icons/icon-192.png'))
        made.append(draw_icon(512, 'public/icons/icon-512.png'))
        made.append(draw_icon(512, 'public/icons/maskable-512.png', maskable=True))
    for path in made:
        print(f'  {path}  {os.path.getsize(path):,} B')
