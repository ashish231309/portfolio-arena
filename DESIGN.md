# DESIGN SYSTEM — "Signal & Ink"
### Interactive editorial portfolio for Ashish Kumar · v2.0

Art direction: **Creative Developer Studio × Interactive Digital Portfolio × Modern Editorial Technology.**
Warm paper grounds, deep ink contrast fields, one violet→cyan brand axis, coral & lime as rare high-impact sparks.
Recurring motif: **orbital rings + signal lines + mono coordinate/index labels** (`§01`, `26.449°N 80.339°E`) used subtly everywhere so the site reads as one system.

---

## 1. Color

| Token | Hex | Role |
|---|---|---|
| `ivory` | `#F6F2E8` | Primary light page ground (hero, about, projects, experience, achievements) |
| `paper` | `#FFFCF5` | Raised light surfaces, browser mockup chrome |
| `ink` | `#10162B` | Primary text on light; marquee band; mosaic tiles |
| `deep` | `#121A2D` | Dark section ground (skills, certifications) |
| `deeper` | `#0B1120` | Contact + footer ground; darkest contrast |
| `indigo` | `#6C5CE7` | Brand primary — large headlines, glows, brand marks |
| `indigo-ink` | `#5A4BD4` | Indigo *on light* — solid CTA fill and small accent text (5.54:1 on ivory) |
| `cobalt` | `#3B82F6` | Secondary brand — accents on dark, gradient partner |
| `cobalt-ink` | `#1D4ED8` | Cobalt *on light* — small accent text (5.99:1 on ivory) |
| `cyan` | `#27D3F2` | Interactive state — hover, cursor ring, focus, projects accent |
| `coral` | `#FF6B6B` | Warm spark — experience accent, marquee asterisks, one mosaic tile |
| `lime` | `#C7F36B` | Rare high-impact — contact CTA, achievements accent, status dot |
| `muted` | `#5B6474` | Secondary text on light (5.34:1 ivory · 5.06:1 tint · 5.82:1 paper) |
| `fog` | `#9AA3B5` | Secondary text on dark |

Rules
- Black/white never dominate: ivory ≠ white, ink ≠ pure black.
- One accent per section maximum; accent = that section's ambient-glow color and index color.
- Section rhythm (home): ivory → ink band (marquee) → ivory → **deep** → ivory → ivory+tint → **deep** → ivory → **deeper** → deeper.
- Selection color: indigo bg / ivory text. Focus ring: 2px ink outline on light grounds, 2px cyan on dark zones, offset 3px, never suppressed.

## 2. Typography
- **Display:** Space Grotesk (variable) — headlines, project titles, oversized type. Weights 500–700, tracking `-0.045em` at display sizes.
- **Body:** Manrope (variable) — paragraphs, UI. 400/500/600/700.
- **Mono:** JetBrains Mono (variable) — micro labels, indexes, metadata, code fragments. Uppercase, `0.14em` tracking, 11–12px.
- Scale (fluid): display-xl `clamp(2.9rem, 8.4vw, 7.4rem)`; h2 `clamp(2.1rem, 4.6vw, 4.1rem)`; h3 `clamp(1.35rem, 2.2vw, 1.9rem)`; body `clamp(1rem, 1.05vw, 1.125rem)`; micro `0.72rem`.
- Line length ≤ 62ch for body. Editorial line breaks in headlines (manual `<br/>` per breakpoint via spans). Uppercase reserved for mono micro labels + marquee only.

## 3. Spacing & layout
- Container: `max-w-[1200px]`, side padding `clamp(1.25rem, 4vw, 3rem)`.
- Section vertical rhythm: `clamp(5.5rem, 12vh, 9.5rem)`; calm sections get more air.
- 12-col grid on desktop; intentional asymmetry (7/5, 5/7, 4/8 splits). Mobile: single column, reordered by importance, never horizontal overflow.
- Whitespace is a material: oversized type is allowed to touch container edges; metadata floats in negative space.

## 4. Radius / borders / shadow
- Radius hierarchy: media & panels `14–22px`, buttons `999px` (pill) or `8px` rectangular editorial, tiles `14px`, code fragments `8px`, mosaic tiles mixed `0/14/22`.
- Borders: 1px `ink/12%` on light, `ivory/12%` on dark; dashed 1px for "simulation/learning" semantics.
- Shadows sparingly: `shadow-panel` only for browser mockup & certificate hover; depth mostly from overlap, color fields and motion.

## 5. Components
- **Buttons:** solid (`indigo-ink` bg / ivory text — 5.54:1), outline (1px ink/25), ghost-underline (text + animated underline), lime solid on dark contact. All magnetic on desktop (`Magnetic`, ±6px). Hover: one step deeper (`#4B3FC2`) + arrow slide 4px; active: scale .98.
- **Tags/chips:** mono 11px, 1px border, pill; dashed variant = "learning / simulation". Solid chips are claimed areas (e.g. the `Full Stack Development` group) — never render that group dashed.
- **Cards:** only where semantic — certificate tiles (rail), mosaic tiles, form panel. Projects use immersive panels, experience uses timeline entries, skills use typographic lists.
- **Section head:** mono index `§0n` + accent dot + thin rule + masked display title + optional right-side mono note.
- **Browser mockup:** paper chrome bar, 3 dots, mono url; screenshots inside; `shadow-panel`.

## 6. Motion principles
- Easing: expo-out `cubic-bezier(0.16, 1, 0.3, 1)` default; springs `stiffness 120–260, damping 18–26`.
- Three layers: **micro** (hover, magnetic, cursor), **scroll** (mask reveals, parallax, sticky storytelling, timeline draw), **ambient** (orbit rotation, marquee, pulse dot, glow).
- Vocabulary per section (never repeated back-to-back): hero = clip-mask line reveal + orbit; about = staggered lines + parallax portrait block; skills = staggered typographic rows; projects = sticky visual + scroll-linked screenshot crossfade + scale; experience = line draw + offset entries; education = editorial slide; certifications = rail + tilt spotlight; achievements = mosaic pop-in; contact = word-by-word reveal.
- Parallax max ±40px; scale enters 0.94→1; durations 0.5–0.9s; stagger 60–90ms.
- Route change: 240ms opacity+12px slide, no blocking loader. First visit only: 1.0s wordmark mask intro (skipped for reduced motion / returning sessions).

## 7. Cursor system (fine pointers only)
- Dot 6px ink (ivory on dark via mix-blend-difference), ring 34px 1.5px border trailing with spring lag, 4 ghost afterimages with progressively softer springs (trail).
- States via `data-cursor`: `link` (ring 44px), `button`/magnetic (ring 44px + fill tint), `project` (72px disc, label "VIEW"), `cert` (disc "OPEN"), `contact` (disc "LET'S TALK"), `drag` (disc "SCROLL →" on rails).
- Hidden on touch/coarse pointer and when `prefers-reduced-motion`; native cursor restored for text inputs.
- Ambient glow: fixed 520px blurred radial @ 8–12% opacity following cursor with heavy lag; color = current section accent (animated CSS var).

## 8. Accessibility
- Semantic landmarks, single h1, logical heading order; skip-link; visible focus; all interactions keyboard-reachable; cursor never required.
- Contrast (measured, WCAG AA): ink on ivory 16.03:1; ivory on deep 15.51:1; muted on ivory 5.34:1; lime on deeper 14.76:1; ivory on the `indigo-ink` CTA 5.54:1; cyan on deep 9.65:1. Brand indigo `#6C5CE7` is 4.35:1 on ivory, so it stays on large display type and dark grounds; small indigo text on light uses `indigo-ink`, small cobalt text on light uses `cobalt-ink`.
- `prefers-reduced-motion`: no cursor/trail/magnetic/lenis/parallax; reveals become 200ms opacity; marquee & orbit pause; content identical.
- Form: labels, `aria-invalid`, inline error text, honeypot spam field, live status message.

## 9. Responsive
- 320–430: single column, type re-clamped, cursor off, rails swipe with snap + edge fade, nav → full-screen overlay menu with staggered links.
- 768: two-column where meaningful; 1024+: full choreography; 1440+: container capped, type scales via clamp only.

## 10. Performance
- MotionValues/springs + transform/opacity only; pointer events write to refs/motion values (no React state per move); images lazy (`loading="lazy"`, `decoding="async"`); single blur layer; Lenis rAF paused when tab hidden; no video.
