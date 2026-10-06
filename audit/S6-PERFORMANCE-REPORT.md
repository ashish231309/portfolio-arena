# S6 — Performance report

Stage scope: **T31** (route code splitting + build config), **T32** (images + fonts),
**T30** (aspect retune), **T10** (repo-link guard).
Baseline: commit `6c423a1` (end of S5). Everything below was measured on the real
production build (`npm run build`), not estimated.

---

## 1. T31 — Code splitting: the first-load JS

**Problem.** Every route and every home-page section was in one 528 kB bundle, so a
visitor landing on `/` downloaded the Projects, Certifications and Contact code
before seeing the hero.

**Fix.**
- `src/App.jsx`: the eight non-home routes are now `React.lazy` imports inside one
  `<Suspense>`; Home and NotFound stay eager (no second request before the hero paints).
- `src/pages/Home.jsx` + new `src/pages/HomeSections.jsx`: the eight below-the-fold
  home sections (About → Contact) moved into one deferred chunk. This is the change
  that actually moved the number — splitting routes alone leaves the bundle unchanged,
  because Home is eager and Home imported every section.

**Measured (raw bytes / gzip bytes).**

| | before `6c423a1` | after S6 | change |
|---|---|---|---|
| **first load (home, hero painted)** | **528,179 B (528.18 kB)** gzip 160,975 B | **458,877 B (458.88 kB)** gzip 143,215 B | **−69,302 B (−13.1%)** gzip −17,760 B (−11.0%) |
| home, fully loaded (+ sections chunk) | 528,179 B (528.18 kB) | 521,240 B (521.24 kB) | −6,939 B (−1.3%) |
| CSS (one file) | 50,406 B (50.41 kB) | 42,246 B (42.25 kB) | −8,160 B (−16.2%) |
| JS across all chunks (total) | 528,179 B | 535,562 B | +7,383 B (+1.4%, split overhead) |

Per-route total JS (what that URL needs before it is complete):

| route | before | after |
|---|---|---|
| `/` first paint | 528.18 kB | **458.88 kB** |
| `/about` | 528.18 kB | 466.59 kB |
| `/projects` | 528.18 kB | 471.25 kB |
| `/projects/:slug` | 528.18 kB | 473.82 kB |
| `/experience`, `/education`, `/certifications`, `/achievements`, `/contact` | 528.18 kB | 501.01 kB |
| `/` fully loaded | 528.18 kB | 521.24 kB |

Route chunks (each loaded only when that route is opened):
`AboutPage` 0.77 kB · `PageIntro` 1.30 · `SimplePages` (5 routes, 1 file) 2.64 ·
`ProjectsPage` 2.80 · `ProjectDetail` 6.68 · shared `projects` data 8.14 ·
`HomeSections` 11.57 · `Contact` 36.26 · `About` 4.56 · `SectionHead` 0.95.

The extra chunk a non-home route pulls in adds 7.7 kB (`/about`) to 42.1 kB
(`/contact`) on top of the entry — and none of it is fetched by a visitor who only
reads the home page.

`vite.config.js` `build` block: `target: es2020`, `sourcemap: false`,
`chunkSizeWarningLimit: 500` (just above the measured 458.87 kB eager entry, so the
warning stays a real tripwire), explicit `entryFileNames` / `chunkFileNames` /
`assetFileNames` under `assets/`. Build time ~1.4–1.8 s; no size warning.

---

## 2. T32 — Images (BMW PNG group → lossless WebP + srcset)

**Problem.** Seven PNG screenshots, 3.0 MB total, no `width`/`height` (layout shift
while loading), no `srcset`/`sizes`, no `loading`/`decoding` hints.

**Fix.** Each PNG got a **lossless** WebP sibling (Pillow `save(..., 'WEBP',
lossless=True, quality=100, method=6)`) and a 700 px-wide lossless variant
(`Image.BOX` + `method=6`; `LANCZOS` made two files *larger* than native, so it was
rejected). The `.png` originals stay in place as the fallback `<source>` is bypassed —
they are the safety net for non-WebP browsers. New `src/components/ProjectImage.jsx`
renders `<picture><source type="image/webp" srcSet="…700.webp 700w, ….webp {native}w"><img …></picture>`
with intrinsic `width`/`height`, `loading="lazy"`, `decoding="async"` and per-placement
`sizes`; a `display:contents` wrapper means the picture element changes nothing about layout.
All 14 files were verified **pixel-identical** to their PNG (numpy `array_equal`, 7/7 true).

| screenshot | PNG | lossless WebP | % of PNG | 700w variant |
|---|---:|---:|---:|---:|
| bmw-01-hero-5-series | 760,541 B | 395,584 B | 52.0% | 137,308 B |
| bmw-02-all-models | 1,131,058 | 635,944 | 56.2% | 211,742 |
| bmw-03-dealer-locator | 482,730 | 169,562 | 35.1% | 127,300 |
| bmw-04-model-listing | 128,076 | 77,836 | 60.8% | 35,108 |
| bmw-05-special-offers | 453,893 | 254,732 | 56.1% | 79,716 |
| bmw-06-test-drive-form | 50,736 | 20,630 | 40.7% | 15,722 |
| bmw-07-search-footer | 73,056 | 28,118 | 38.5% | 19,778 |
| **total** | **3,080,090 B** | **1,582,406 B** | **51.4%** | **626,674 B** |

Every 700w file is smaller than its native sibling (checked file by file).
Coding Ninjas JPEGs: **9 files, 975,154 B, unchanged** — no WebP, no re-encode; they
only gained `width`/`height` (e.g. 1259×716) plus `loading="lazy"` / `decoding="async"`
below the fold, so their layout slots are now reserved before the bytes arrive.

The native width of the BMW set is 1348–1352 px, so the `srcset` advertises
`700w` and the **true** native width (~1350w) rather than a rounded 1400w.

---

## 3. T32 — Fonts (latin-only, self-hosted, preloaded)

**Problem.** `index.css` imported all subsets of three variable fonts — 13 WOFF2 files,
204,576 B — for a site whose copy is entirely Latin script.

**Fix.** The three Latin cuts are copied byte-for-byte into `public/fonts/`
(so they have stable URLs and can be preloaded) and declared in new `src/fonts.css`
with the exact `unicode-range` fontsource used; `src/main.jsx` imports that file
instead of the three fontsource packages. Two above-the-fold faces are preloaded in
`index.html` (Space Grotesk for display, Manrope for body); JetBrains Mono loads with
the rest. `qa/check-metadata.mjs` gained a WOFF2 check (table-directory + `metaOffset`
/ `privOffset` blocks); all three files carry no metadata.

| | before | after |
|---|---|---|
| font files shipped | 13 | **3** |
| font bytes | 204,576 B (204.6 kB) | **87,528 B (87.5 kB)** — **−57.2%** |

---

## 4. T30 — Featured mockup aspect ratio

The CN screenshots are 1264×711 (1.775:1). The mockup was `aspect-[16/10]` (1.6:1), so
`object-cover` cropped both sides of every frame — most visible in the `01 / hero &
narrative` shot. The mockup is now `aspect-video` (16/9, 1.778) which matches the source
almost exactly, so the frames show complete. The BMW images (1349×613) are untouched and
keep `object-cover object-top` in the card and secondary-panel slots, where the crop is
deliberate.

---

## 5. T10 — Featured card "view source" link

The featured project on the home page rendered `<a href={null}>` when `github` is null.
It now renders the same non-interactive `Source not published yet` badge used by the
project detail page — same copy, same styling, nothing clickable that goes nowhere.

---

## 6. What was verified, and what still needs your browser

Verified here (not eyeballed):
- `npm run build` exits 0, ~1.5 s, no chunk-size warning; `npm run check:meta` → 0 files
  with metadata (now covering PDF/PNG/JPEG/SVG/WebP/WOFF2; `public/404.html` is the one
  file the checker skips, as before).
- All **10 routes plus the 404 and the intentional `/projects/typo` redirect** were
  loaded through the real built bundle in a DOM harness: every route renders its own
  `<h1>`, the right number of sections, non-empty content, the previous route's content
  is removed on navigation, and **0 console errors / unhandled rejections**.
  Command: `node /home/user/scratch/route-smoke.mjs dist` (the split's lazy chunks are
  genuinely fetched by that run, so the split itself is exercised).
- Rendered image markup (`<source srcset>`, `sizes`, `width`/`height`, `loading`,
  `decoding`) was read back from the built app on `/`, `/projects`, `/projects/coding-ninjas`
  and `/projects/bmw` — 16 screenshots, all with dimensions, 7 with WebP sources.
- `animate-pulse-dot` used by the new route fallback exists in `tailwind.config.js`
  (with a reduced-motion override in `index.css`).

Left for your local test (browser-only):
1. Does navigating between routes still feel smooth, and does the deferred home-sections
   chunk ever show a gap while scrolling fast right after load?
2. Do the Latin-only fonts cover every glyph on screen (any character that now falls back)?
3. Do the BMW frames look identical to before, and is the featured mockup uncropped at 16/9?
4. Do the lazy route chunks load correctly against the production preview
   (`npm run build && npm run preview` — opening `dist/index.html` directly will not work).
5. Does `ysf-internship-certificate.pdf` still open and look right (it is now 1.00 MB
   instead of 4.54 MB) — check the on-site link and, ideally, a downloaded copy in your
   usual PDF viewer.

---

## 7. Certificate PDF — texture recompression (applied)

`public/certificates/ysf-internship-certificate.pdf` measured 4,539,745 B, of which
**92.6% was one paper-texture JPEG**. All readable content is vector text drawn on top
of that texture, so re-encoding the texture cannot blur any text. Two facts made the
reduction cheap: the texture is stored at 4608x3376 but drawn 1.96x wider than the page
(46.6% of its pixels were never on screen), and it lands at 284 DPI on the page.

Applied preset (the "C2" option from the before/after comparison, re-encoded baseline
rather than progressive for maximum viewer compatibility):

| | before | after |
|---|---:|---:|
| file size | 4,539,745 B (4.54 MB) | **998,983 B (1.00 MB)** |
| stored texture | 4608 x 3376 (4,204,633 B JPEG) | 1723 x 2363 (663,863 B JPEG, q88, 4:2:0) |
| texture area kept | — | the visible 2461 px of 4608 (46.6% dropped) |
| texture detail | 284 DPI | 199 DPI over the same 8.66 in |
| certificates folder | 7,677,684 B | 2,631,577 B |

**−78.0%, 3.54 MB saved.** Verification (all printed by the tool at run time):

- **Render comparison, PDFium:** 150 DPI max diff 22/255, PSNR 46.0 dB · 200 DPI 22/255,
  45.8 dB · 300 DPI 15/255, 47.1 dB. 0.037% / 0.020% / 0.002% of pixels differ by more than 8/255.
- **Extracted text identical** (495 chars) in PDFium, and identical via pypdf as well
  (180 words, same first words) — no readable content moved.
- **Only 2 objects changed** (the texture and the one form that places it); no objects
  added or removed; all other 27 streams byte-identical.
- **Page count, MediaBox (596 x 850 pt), tagged-PDF structure (20 /StructElem) and the
  ICC profile are unchanged**; `check_pdf_syntax` passes.
- **`npm run check:meta`** still reports 0 files with metadata across 42 files.

The comparison evidence (`audit/s6-certificate-pdf-before-after.pdf`) was produced
*before* approval and still shows the original 4.54 MB file as "before". The tool is
`audit/tools/pdf-texture-apply.py` — it derives the geometry from the file itself
(interpreting the content streams' `q`/`Q`/`cm` state rather than assuming a layout),
asserts the visible rectangle is unchanged (measured offset 0.000 pt; it aborts past 0.5 pt),
and refuses to
finish if anything but the texture and its placement form changed.
