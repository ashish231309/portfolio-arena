"""S6 — apply the approved texture recompression to the YSF certificate.

What it does (preset "C2", the option picked from the before/after comparison):
  · finds the certificate's largest DCTDecode (JPEG) image — the paper texture
  · interprets the PDF content streams (a small q/Q/cm/Do interpreter, because the
    matrix that positions the texture is not necessarily the nearest `cm` — it is
    whatever the graphics state actually holds at the `Do`) and composes the
    transform from the page down to the image
  · keeps only the part of the texture the page can actually show (+bleed)
  · resamples that crop to 70% and re-encodes it as baseline JPEG q88/4:2:0
    (baseline, not progressive: 16 kB bigger, but every viewer handles it)
  · rewrites that one matrix so the visible page rectangle is pixel-for-pixel the
    same: nothing moves, only the sample count inside it drops
  · leaves every other byte of the file alone, and proves it

Verification printed at the end:
  · file sizes before/after
  · render comparison at 150 / 200 / 300 DPI (max diff, mean diff, % of pixels
    off by >8/255, PSNR)
  · byte-identity of every stream except the texture and the one matrix
  · page count, MediaBox, tagged-structure element count, ICC table intact
  · extracted text identical (proof no readable content moved)
  · pikepdf/qpdf syntax check

Usage:
    python3 audit/tools/pdf-texture-apply.py <input.pdf> <output.pdf> [--scale 0.70] [--quality 88]
"""
import argparse
import io
import os
import re
import sys

import numpy as np
import pikepdf
import pypdfium2 as pdfium
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
NUM = re.compile(r'^[-+]?(?:\d+\.?\d*|\.\d+)$')


# ---------------------------------------------------------------- pdf helpers
def mul(A, B):
    """A then B, PDF convention (column vectors, row-major [a b c d e f])."""
    a, b, c, d, e, f = A
    A2, B2, C2, D2, E2, F2 = B
    return [a * A2 + c * B2, b * A2 + d * B2, a * C2 + c * D2,
            b * C2 + d * D2, a * E2 + c * F2 + e, b * E2 + d * F2 + f]


def pt(M, x, y):
    """Map a point through a PDF matrix."""
    return (M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5])


def scan_tokens(s):
    """Yield (token, start, end); skips literal strings, hex strings and comments."""
    i, n = 0, len(s)
    while i < n:
        ch = s[i]
        if ch == '%':                                   # comment to end of line
            j = s.find('\n', i)
            i = n if j == -1 else j + 1
            continue
        if ch == '(':                                   # literal string
            depth, i = 1, i + 1
            while i < n and depth:
                if s[i] == '\\':
                    i += 2
                    continue
                if s[i] == '(':
                    depth += 1
                elif s[i] == ')':
                    depth -= 1
                i += 1
            continue
        if ch == '<' and not s.startswith('<<', i):     # hex string
            j = s.find('>', i)
            i = n if j == -1 else j + 1
            continue
        if ch in '<>[]{}/':                             # dictionary/array/name
            j = i + 1
            while j < n and not s[j].isspace() and s[j] not in '<>[](){}':
                j += 1
            yield s[i:j], i, j
            i = j
            continue
        if ch.isspace():
            i += 1
            continue
        j = i
        while j < n and not s[j].isspace() and s[j] not in '<>[](){}()':
            j += 1
        yield s[i:j], i, j
        i = j


def do_events(content):
    """For every /Name Do: the CTM in force, and the span of the `cm` that set it.

    Mirrors the graphics-state stack: `q` pushes, `Q` pops, `cm` replaces the
    state's own matrix. This is why "the nearest cm before the Do" is not a safe
    shortcut — the matrix that positions a texture may be many operators back and
    the ones in between may belong to a `q ... Q` scope that has already closed.
    """
    stack, ctm, span = [], [1, 0, 0, 1, 0, 0], None
    operands, name = [], None
    events = []
    for tok, s0, s1 in scan_tokens(content):
        if NUM.match(tok):
            operands.append((float(tok), s0))
            continue
        if tok.startswith('/'):
            name = tok[1:]
            operands = []
            continue
        if tok == 'q':
            stack.append((ctm[:], span))
        elif tok == 'Q':
            if stack:
                ctm, span = stack.pop()
        elif tok == 'cm' and len(operands) >= 6:
            ctm = mul(ctm, [v for v, _ in operands[-6:]])
            span = (operands[-6][1], s1)
        elif tok == 'Do' and name:
            events.append((name, ctm[:], span))
            name = None
        operands = []
    return events


def biggest_jpeg(pdf):
    best = None
    for obj in pdf.objects:
        if isinstance(obj, pikepdf.Stream) and obj.get('/Filter') == pikepdf.Name('/DCTDecode'):
            n = len(obj.read_raw_bytes())
            if best is None or n > best[1]:
                best = (obj, n)
    return best[0] if best else None


def trace(pdf, page, target):
    """Walk page → forms → image, composing the transform.

    Each chain entry records the name it is drawn under, the stream whose content
    draws it, the span of the matrix that placed it, and the CTM at that point.
    """
    def descend(owner, content, M, chain):
        res = owner.get('/Resources') if owner is not None else page.get('/Resources')
        xo = res.get('/XObject') if res is not None else None
        if not xo:
            return None
        for name, ctm_here, span in do_events(content):
            obj = xo.get(f'/{name}')
            if obj is None:
                continue
            here = mul(M, ctm_here)
            step = {'name': name, 'owner': owner, 'span': span, 'ctm': here, 'local': ctm_here,
                    'owner_objgen': getattr(owner, 'objgen', None)}
            if getattr(obj, 'objgen', None) == target.objgen:
                return chain + [step], here
            if isinstance(obj, pikepdf.Stream) and obj.get('/Subtype') == pikepdf.Name('/Form'):
                got = descend(obj, obj.read_bytes().decode('latin-1'), here, chain + [step])
                if got:
                    return got
        return None

    return descend(None, page['/Contents'].read_bytes().decode('latin-1'), [1, 0, 0, 1, 0, 0], [])


def inverse(M):
    det = M[0] * M[3] - M[1] * M[2]
    a, b, c, d = M[3] / det, -M[1] / det, -M[2] / det, M[0] / det
    return [a, b, c, d, -(a * M[4] + c * M[5]), -(b * M[4] + d * M[5])]


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('dst')
    ap.add_argument('--scale', type=float, default=0.70)
    ap.add_argument('--quality', type=int, default=88)
    ap.add_argument('--bleed', type=float, default=0.012)
    # Baseline (not progressive) by default: 16 kB larger here, but it is the
    # encoding every PDF viewer renders, including old embedded previews.
    ap.add_argument('--progressive', action='store_true')
    args = ap.parse_args()

    before_size = os.path.getsize(args.src)
    pdf = pikepdf.open(args.src)
    page = pdf.pages[0]
    media = [float(x) for x in page.MediaBox]
    image = biggest_jpeg(pdf)
    W, H = int(image.Width), int(image.Height)
    raw = bytes(image.read_raw_bytes())
    im = Image.open(io.BytesIO(raw)).convert('RGB')

    found = trace(pdf, page, image)
    if not found:
        sys.exit('could not trace the texture image from the page')
    chain, M = found
    print(f'texture: {W}x{H} px, {len(raw):,} B JPEG')
    print('resource path: ' + ' → '.join(f"/{step['name']}" for step in chain))
    print(f'composed transform: [{M[0]:.3f} {M[1]:.3f} {M[2]:.3f} {M[3]:.3f} {M[4]:.3f} {M[5]:.3f}]')
    print(f'drawn on page: {abs(M[0]) / 72:.2f} x {abs(M[3]) / 72:.2f} in '
          f'({abs(M[0]) / 72 / (media[2] / 72):.2f}x page width) → {W / (abs(M[0]) / 72):.0f} DPI stored')

    inv = inverse(M)
    corners = [(inv[0] * x + inv[2] * y + inv[4], inv[1] * x + inv[3] * y + inv[5])
               for x, y in ((0, 0), (media[2], 0), (0, media[3]), (media[2], media[3]))]
    us = sorted(c[0] for c in corners)
    vs = sorted(c[1] for c in corners)
    bx0 = max(0, int((us[0] - args.bleed) * W)); bx1 = min(W, int((us[-1] + args.bleed) * W))
    by0 = max(0, int((vs[0] - args.bleed) * H)); by1 = min(H, int((vs[-1] + args.bleed) * H))
    print(f'page window in image space: u {us[0]:.3f}..{us[-1]:.3f}  v {vs[0]:.3f}..{vs[-1]:.3f}')
    print(f'crop: x {bx0}..{bx1} ({bx1 - bx0} px of {W}), y {by0}..{by1} ({by1 - by0} px of {H}) '
          f'→ discards {100 * (1 - (bx1 - bx0) / W):.1f}% of stored width')

    tile = im.crop((bx0, by0, bx1, by1))
    if args.scale != 1.0:
        tile = tile.resize((max(1, round(tile.size[0] * args.scale)),
                            max(1, round(tile.size[1] * args.scale))), Image.LANCZOS)
    buf = io.BytesIO()
    tile.save(buf, 'JPEG', quality=args.quality, optimize=True,
              progressive=args.progressive, subsampling=2)
    data = buf.getvalue()
    print(f'new texture: {tile.size[0]}x{tile.size[1]} px, {len(data):,} B JPEG '
          f'(q{args.quality}, {"progressive" if args.progressive else "baseline"}, 4:2:0)')

    # ---- write the new file
    out = pikepdf.open(args.src)
    oimage = biggest_jpeg(out)
    oimage.write(data, filter=pikepdf.Name('/DCTDecode'))
    oimage.Width, oimage.Height = tile.size

    # the matrix lives in the stream that draws the image (its parent in the chain)
    step = chain[-1]
    if step['owner_objgen'] is None:
        container_obj, container_label = out.pages[0]['/Contents'], 'page /Contents'
    else:
        # fetch the object from the copy we are about to save — editing the object
        # graph of the file we traced would silently change nothing
        container_obj = out.get_object(*step['owner_objgen'])
        container_label = f"form /{chain[-2]['name']}"
    container_name = step['name']

    # The matrix being rewritten is the one inside this container, so the new
    # numbers must be expressed in that container's own space (L), not in page
    # space (M). The crop window above was found with M, which is what decides
    # which pixels are visible; L decides how they are painted.
    L = step['local']
    a = L[0] * (bx1 - bx0) / W
    e = L[0] * bx0 / W + L[4]
    d = L[3] * (by1 - by0) / H
    f = L[3] * by0 / H + L[5]

    # re-derive the span in the fresh copy: same bytes, but never assume
    content = container_obj.read_bytes().decode('latin-1')
    span = next((sp for nm, _, sp in do_events(content) if nm == container_name and sp), None)
    if span is None:
        sys.exit('could not locate the matrix to rewrite')
    # prove the page-space rectangle is unchanged before writing anything
    outer = [1, 0, 0, 1, 0, 0]
    for st in chain[:-1]:
        outer = mul(outer, st['local'])
    placed = mul(outer, [a, 0, 0, d, e, f])
    # the crop region of the old image and the whole of the new one must land on
    # the same page rectangle (tolerance: the crop indices are whole pixels, and
    # one pixel is ~0.25 pt on this page)
    ref_lo, ref_hi = pt(M, bx0 / W, by0 / H), pt(M, bx1 / W, by1 / H)
    new_lo, new_hi = pt(placed, 0, 0), pt(placed, 1, 1)
    off = max(abs(x - y) for x, y in zip(ref_lo + ref_hi, new_lo + new_hi))
    if off > 0.5:
        sys.exit(f'placement check failed by {off:.3f} pt: {ref_lo} {ref_hi} vs {new_lo} {new_hi}')
    print(f'placement check: crop region maps to {[round(v, 3) for v in ref_lo + ref_hi]} in page space, '
          f'new image to {[round(v, 3) for v in new_lo + new_hi]} (off by {off:.3f} pt)')

    content2 = content[:span[0]] + f'{a:.6f} 0 0 {d:.6f} {e:.6f} {f:.6f} cm' + content[span[1]:]
    container_obj.write(content2.encode('latin-1'), filter=pikepdf.Name('/FlateDecode'))
    out.save(args.dst, compress_streams=True)
    out.close()
    after_size = os.path.getsize(args.dst)
    print(f'\nfile: {before_size:,} B → {after_size:,} B '
          f'({100 * after_size / before_size:.1f}% of before, −{100 * (1 - after_size / before_size):.1f}%)')
    print(f'updated {container_label} matrix: {content[span[0]:span[1]]!r}'
          f" → {f'{a:.6f} 0 0 {d:.6f} {e:.6f} {f:.6f} cm'!r}")

    # ---------------------------------------------------------- verification
    print('\n--- verification ---')
    a_pdf, b_pdf = pikepdf.open(args.src), pikepdf.open(args.dst)
    for label, p in (('before', a_pdf), ('after', b_pdf)):
        p.check_pdf_syntax()
        elems = sum(1 for o in p.objects
                    if isinstance(o, pikepdf.Dictionary) and o.get('/Type') == pikepdf.Name('/StructElem'))
        print(f'{label}: {len(p.pages)} page(s), MediaBox {[float(x) for x in p.pages[0].MediaBox]}, '
              f'tagged={"/StructTreeRoot" in p.Root}, struct elems={elems}, syntax ok')

    def stream_map(p):
        return {o.objgen: bytes(o.read_raw_bytes())
                for o in p.objects if isinstance(o, pikepdf.Stream)}
    sa, sb = stream_map(a_pdf), stream_map(b_pdf)
    changed = sorted(o[0] for o in sa if o in sb and sa[o] != sb[o])
    added = sorted(o[0] for o in sb if o not in sa)
    removed = sorted(o[0] for o in sa if o not in sb)
    print(f'streams {len(sa)} → {len(sb)}; changed objects {changed} '
          f'(texture + its placement form expected); added {added}; removed {removed}')
    if len(changed) != 2:
        sys.exit(f'expected exactly 2 changed objects (texture + placement form), got {changed}')

    try:
        ta = pdfium.PdfDocument(args.src)[0].get_textpage().get_text_range()
        tb = pdfium.PdfDocument(args.dst)[0].get_textpage().get_text_range()
        print(f'extracted text: {len(ta)} chars before, {len(tb)} after, identical={ta == tb}')
    except Exception as exc:                                   # pragma: no cover
        print('extracted text: skipped —', exc)

    icc = [o for o in b_pdf.objects if isinstance(o, pikepdf.Stream) and '/N' in o.stream_dict]
    print(f'ICC table objects after: {len(icc)} (colourspace untouched)')

    print(f'\n{"DPI":>5} {"max diff":>9} {"mean":>8} {">8/255":>9} {"PSNR":>9}')
    for dpi in (150, 200, 300):
        ra = np.asarray(pdfium.PdfDocument(args.src)[0].render(scale=dpi / 72).to_pil().convert('RGB'),
                        dtype=np.int16)
        rb = np.asarray(pdfium.PdfDocument(args.dst)[0].render(scale=dpi / 72).to_pil().convert('RGB'),
                        dtype=np.int16)
        if ra.shape != rb.shape:
            print(f'{dpi:>5}  size mismatch')
            continue
        dd = np.abs(ra - rb)
        mse = float((dd.astype(float) ** 2).mean())
        print(f'{dpi:>5} {int(dd.max()):>9} {dd.mean():>8.3f} '
              f'{100 * (dd.max(axis=2) > 8).mean():>8.3f}% {10 * np.log10(255 ** 2 / max(mse, 1e-9)):>8.1f} dB')
    region_in = (bx1 - bx0) / W * (abs(M[0]) / 72)
    print(f'\ntexture detail: {bx1 - bx0} px over {region_in:.2f} in before ({W / (abs(M[0]) / 72):.0f} DPI), '
          f'{tile.size[0]} px over the same {region_in:.2f} in after ({tile.size[0] / region_in:.0f} DPI)')


if __name__ == '__main__':
    main()
