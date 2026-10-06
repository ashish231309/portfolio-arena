"""S6 — certificate PDF texture: build candidates and prove them by rendering.

The certificate's only raster is a 4608x3376 paper-texture JPEG (4.20 MB = 92.6%
of the file), drawn over a 16.21 x 11.95 in rectangle. That rectangle is ~2x wider
than the page, so 47% of the stored pixels are never on screen.

Each candidate: crop the visible area (+small bleed) at full resolution, optionally
resample that crop, re-encode as JPEG, keep the same ICCBased colorspace, and
rewrite the X7 cm matrix so the visible rectangle is unchanged. Then render and
compare against the original pixel by pixel at 150 / 200 / 300 DPI.
"""
import io
import json
import os
import re

import numpy as np
import pikepdf
import pypdfium2 as pdfium
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
SRC = 'public/certificates/ysf-internship-certificate.pdf'
OUT = '/home/user/scratch/pdf'
os.makedirs(OUT, exist_ok=True)

pdf = pikepdf.open(SRC)
img_obj = pdf.get_object(64, 0)
W, H = int(img_obj.Width), int(img_obj.Height)
raw = bytes(img_obj.read_raw_bytes())
im = Image.open(io.BytesIO(raw)).convert('RGB')

M4 = (4864.333, -1192.245, -3585.7263, 3548.2122)   # /X4 cm inside /X7
PAGE_SCALE = 0.23999999
PAGE_W, PAGE_H = 596.0, 850.08


def to_page(u, v):
    x = M4[0] * u + M4[1]
    y = M4[2] * v + M4[3]
    return PAGE_SCALE * x, -PAGE_SCALE * y + PAGE_H


def page_to_uv(px, py):
    x = px / PAGE_SCALE
    y = (PAGE_H - py) / PAGE_SCALE
    return (x - M4[1]) / M4[0], (y - M4[3]) / M4[2]


u0, v0 = page_to_uv(0, PAGE_H)
u1, v1 = page_to_uv(PAGE_W, 0)
(u_lo, u_hi), (v_lo, v_hi) = sorted((u0, u1)), sorted((v0, v1))
BLEED = 0.012
x0 = max(0, int((u_lo - BLEED) * W)); x1 = min(W, int((u_hi + BLEED) * W))
y0 = max(0, int((v_lo - BLEED) * H)); y1 = min(H, int((v_hi + BLEED) * H))
print(f"stored texture {W}x{H}, drawn over {M4[0]*PAGE_SCALE/72:.2f} x {M4[2]*-PAGE_SCALE/72:.2f} in "
      f"({(M4[0]*PAGE_SCALE/72)/(PAGE_W/72):.2f}x page width)")
print(f"visible window: u {u_lo:.3f}..{u_hi:.3f}, v {v_lo:.3f}..{v_hi:.3f}")
print(f"crop (with {BLEED:.3f} bleed): x {x0}..{x1} = {x1-x0} px, y {y0}..{y1} = {y1-y0} px "
      f"→ discards {100*(1-(x1-x0)/W):.1f}% of stored width")

CROP_BOX = (x0, y0, x1, y1)


def matrix_for_crop(box):
    bx0, by0, bx1, by1 = box
    a = M4[0] * (bx1 - bx0) / W
    e = M4[0] * bx0 / W + M4[1]
    d = M4[2] * (by1 - by0) / H
    f = M4[2] * by0 / H + M4[3]
    return a, d, e, f


def rewrite_matrix(path, box):
    """Point the X7 cm at the crop rectangle (same page rectangle, fewer pixels)."""
    a, d, e, f = matrix_for_crop(box)
    p = pikepdf.open(path, allow_overwriting_input=True)
    x7 = p.pages[0]['/Resources']['/XObject']['/X24']['/Resources']['/XObject']['/X7']
    cs = x7.read_bytes().decode('latin-1')
    cs2 = re.sub(r'[-\d.]+ 0 0 [-\d.]+ [-\d.]+ [-\d.]+ cm',
                 f"{a:.6f} 0 0 {d:.6f} {e:.6f} {f:.6f} cm", cs, count=1)
    assert cs2 != cs, 'cm rewrite failed'
    x7.write(cs2.encode('latin-1'), filter=pikepdf.Name('/FlateDecode'))
    p.save(path, compress_streams=True)
    p.close()


def write_image(pdf_path, tile, quality):
    buf = io.BytesIO()
    tile.save(buf, 'JPEG', quality=quality, optimize=True, progressive=True, subsampling=2)
    data = buf.getvalue()
    p = pikepdf.open(SRC)
    o = p.get_object(64, 0)
    o.write(data, filter=pikepdf.Name('/DCTDecode'))
    o.Width, o.Height = tile.size
    p.save(pdf_path, compress_streams=True)
    p.close()
    return len(data)


def build(name, scale, quality, crop=True):
    box = CROP_BOX if crop else None
    tile = im.crop(box) if crop else im
    if scale != 1.0:
        tile = tile.resize((max(1, round(tile.size[0] * scale)), max(1, round(tile.size[1] * scale))), Image.LANCZOS)
    path = f"{OUT}/{name}.pdf"
    jbytes = write_image(path, tile, quality)
    if crop:
        rewrite_matrix(path, box)
    return path, tile.size, jbytes, os.path.getsize(path)


def render(path, dpi):
    return pdfium.PdfDocument(path)[0].render(scale=dpi / 72).to_pil().convert('RGB')


def compare(path):
    out = {}
    for dpi in (150, 200, 300):
        na = np.asarray(render(SRC, dpi), dtype=np.int16)
        nb = np.asarray(render(path, dpi), dtype=np.int16)
        if na.shape != nb.shape:
            out[dpi] = None
            continue
        diff = np.abs(na - nb)
        out[dpi] = (int(diff.max()), float(diff.mean()),
                    float((diff.max(axis=2) > 8).mean() * 100),
                    float(10 * np.log10(255 ** 2 / max(1e-9, (diff.astype(float) ** 2).mean()))))
    return out


CANDS = [
    ('C1 crop q95', 1.00, 95, True),
    ('C2 crop 0.70x q88', 0.70, 88, True),
    ('C3 crop 0.55x q88', 0.55, 88, True),
    ('C4 crop 0.40x q85', 0.40, 85, True),
    ('C5 nocrop q70', 1.00, 70, False),
]

orig = os.path.getsize(SRC)
print(f"\n{'candidate':<18} {'stored px':>12} {'jpeg B':>10} {'pdf B':>11} {'vs orig':>8}   "
      f"{'@150 max|mean|%>8|PSNR':>34} {'@300':>16}")
print('-' * 118)
print(f"{'ORIGINAL':<18} {f'{W}x{H}':>12} {len(raw):>10,} {orig:>11,} {'—':>8}")
built = {}
for label, scale, q, crop in CANDS:
    path, size, jbytes, pdfbytes = build(label.split()[0], scale, q, crop)
    built[label] = path
    r = compare(path)
    f15 = f"{r[150][0]:>3} | {r[150][1]:.3f} | {r[150][2]:.2f}% | {r[150][3]:.1f} dB"
    f30 = f"{r[300][0]:>3} | {r[300][2]:.2f}% | {r[300][3]:.1f} dB"
    print(f"{label:<18} {f'{size[0]}x{size[1]}':>12} {jbytes:>10,} {pdfbytes:>11,} {100*pdfbytes/orig:>7.1f}%   {f15:>34} {f30:>16}")

json.dump(built, open(f'{OUT}/candidates.json', 'w'), indent=1)
print('\nsaved:', built)
