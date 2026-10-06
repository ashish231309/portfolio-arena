# PORTFOLIO MASTER BRIEF — Part A: Context & Decisions

> **What this file is.** The complete, self-contained context for the `portfolio-arena` audit and fix programme.
> If a chat session has no memory of earlier conversations, **paste this file (or attach it) plus the relevant stage prompt from `PORTFOLIO-STAGE-PROMPTS.md`**, and the work can continue exactly where it left off.
> **Companion file:** `PORTFOLIO-STAGE-PROMPTS.md` (Part B) — one ready-to-paste prompt per stage.
> **Nothing in this programme has been applied yet.** The repository was read-only throughout the audit.
> **Where these files live:** `portfolio-arena/audit/` — *untracked* in git. Nothing was committed. To remove them completely: `rm -rf audit` from the repo root. Files stored outside the repository do not survive between sessions; files inside it do.

---

## 1. Project identity

| Item | Value |
|---|---|
| Project | Personal portfolio of **Ashish Kumar**, B.Tech CSE student (Kanpur Institute of Technology, AKTU), graduating 2027 |
| Positioning | Computer Science student building with Software, Web & Generative AI |
| Repo | `ashish231309/portfolio-arena` (GitHub), working copy at `/home/user/portfolio-arena` |
| Branch for all work | `arena/01a10c65-portfolio-arena` (session-bound — never switch, never push elsewhere) |
| Base commit at audit time | `85f12aa` ("Add files via upload"), 77 tracked files, working tree clean |
| Deploy target (decided) | **Vercel** |
| Art direction | "Signal & Ink" — editorial typography on warm ivory, deep-ink contrast fields, violet→cyan brand axis, coral/lime sparks. Full system in `DESIGN.md` |
| Licence | MIT |

### Stack (exact versions from `package-lock.json`)

- React **19.3.0** + Vite **8.3.0** (JavaScript/JSX — no TypeScript)
- Tailwind CSS **3.4.19** (custom token layer in `tailwind.config.js`)
- `motion` (Motion for React) **12.43.0** — springs, scroll-linked animation, route transitions
- `lenis` **1.3.26** — inertial smooth scrolling
- `react-router-dom` **7.18.4** · `lucide-react` **0.525.0**
- `@fontsource-variable/*` 5.x — self-hosted Space Grotesk (display), Manrope (body), JetBrains Mono (micro)
- Dev: `@vitejs/plugin-react` 5.2.0, `postcss`, `autoprefixer`, `playwright` 1.63.0 (unused for tests today)

### Scripts

```bash
npm install / npm ci     # deps (NOTE: repo has no .gitignore until stage S0)
npm run dev              # vite --host 0.0.0.0 --port 5173
npm run build            # vite build -> dist/
npm run preview          # vite preview --host 0.0.0.0 --port 4173
```

`vite.config.js` already binds `0.0.0.0` with `allowedHosts: true` for both `server` and `preview`, so live previews work out of the box.

---

## 2. How work is done in this programme

1. **Batched delivery.** One stage per turn (S0…S10). Never mix two stages in one turn unless the user explicitly asks.
2. **Nothing without a command.** Analyse freely; change nothing until the user says go.
3. **Branch discipline.** All commits go to `arena/01a10c65-portfolio-arena`. Pushing only to that branch. Pull requests are opened from it.
4. **Commit messages** are labelled with the stage id, e.g. `S1: fix swapped project screenshots, rename, re-point gallery + alt text`.
5. **Every stage ends with a live preview** (start the dev server with the process tools, bound to `0.0.0.0`) so the user can look at the result in their own browser.
6. **Report format** required at the end of every stage:
   - What changed (file-by-file, with counts)
   - What I verified, and *how* (build output, static render, measured numbers, DOM checks)
   - What I could **not** verify (and why)
   - Anything I need the user to decide
7. **Honesty in reporting.** If something is unverified, say so. Do not claim a visual check that was not performed.

### Environment constraints (re-check at the start of any session)

- **Sandbox persistence:** the environment is rebuilt between sessions. Only files inside the git repository (`/home/user/portfolio-arena`) survive; `/tmp` and other paths outside the repo are wiped. Keep deliverables in `audit/` (untracked) and never rely on `/tmp` for anything that must last.
- **No browser for screenshots:** at audit time `playwright install chromium` failed, so screenshot-based visual QA was not possible. Verification was done instead via:
  - **production build** (`npx vite build`) — real bundle sizes and warnings;
  - **static render** of pages with `react-dom/server` bundled by esbuild — DOM structure, section/glow counts, heading order;
  - **measured contrast maths** (WCAG relative-luminance, including alpha compositing);
  - **binary inspection** of PDFs/images (metadata, dimensions);
  - `npm audit` (registry reachable at audit time).
- If a future environment *does* have a browser, prefer real screenshots — and if a change cannot be visually verified either way, say so explicitly and ask the user to look at the live preview.

---

## 3. Repository map

```
index.html                     SEO/meta + JSON-LD Person block + #root
vite.config.js                 server/preview host + allowedHosts
tailwind.config.js             colours, fonts, radii, shadows, keyframes  <- design tokens
postcss.config.js              tailwindcss + autoprefixer
src/main.jsx                   fonts + index.css + BrowserRouter -> App
src/App.jsx                    Lenis setup, route transitions, shell (Intro/ScrollProgress/Cursor/Nav/Footer), noise layer
src/index.css                  base layer, utilities (grid/dots/noise/underline/spotlight/mask), reduced-motion block
src/lib/site.jsx               SiteProvider (pointer MotionValues, tone, accent, cursor mode) + useSectionSignal
src/lib/motion.js              EASE, SPRING*, stagger/child variants, ACCENTS, accentText, accentBg
src/hooks/useMediaQuery.js     useMediaQuery, useFinePointer, useReducedMotionPref
src/hooks/usePageMeta.js       per-route document.title + meta description
src/components/                Section, SectionHead, Reveal (MaskLines/WordReveal/Fade/Stagger/Parallax/ScaleIn),
                               Magnetic, Cursor, AmbientGlow, Intro, Marquee, Nav, Footer, ScrollProgress, PageIntro
src/sections/                  Hero, About, Skills, ProjectsHome, Experience, Education, Certifications,
                               Achievements, Contact   <- each can render "bare" (without its own SectionHead)
src/pages/                     Home, AboutPage, ProjectsPage, ProjectDetail, SimplePages (5 wrapper pages), NotFound
src/data/                      profile, skills, projects, experience, education, certifications, achievements  <- ALL content
public/                        resume.pdf, favicon.svg, certificates/ (7 PDFs), projects/ (16 screenshots)
qa/shoot.mjs                   hand-rolled Playwright screenshot script (not wired to npm; hardcodes /home/user/qa + localhost:5173)
DESIGN.md                      design system, source of truth (v2.0)
README.md                      overview, routes, where data/assets live, honesty policy
UPDATE_GUIDE.md                how to edit content safely + pre-publish checklist
audit/                         THIS DOCUMENTATION SET (untracked; safe to delete)
```

**Routes:** `/` · `/about` · `/projects` · `/projects/:slug` (`coding-ninjas`, `bmw`) · `/experience` · `/education` · `/certifications` · `/achievements` · `/contact` · `*` (NotFound)

---

## 4. Audit method & raw evidence

| Check | Command / method | Result |
|---|---|---|
| Dependency advisories | `npm audit --package-lock-only` | 5 × high: braces, chokidar, micromatch, fast-glob, tailwindcss |
| Same, shipped tree only | `npm audit --omit=dev` | **0 vulnerabilities** (18 prod deps) |
| Secrets in code | grep for keys/tokens/passwords | none — only the public Gmail in the FormSubmit endpoint |
| XSS sinks | grep `dangerouslySetInnerHTML`, `eval`, `innerHTML`, `document.write` | none |
| External links | grep `target="_blank"` | all carry `rel="noreferrer"` |
| Storage/tracking | grep `localStorage`, `cookie` | only one `sessionStorage` flag for the intro overlay; no analytics, no cookies |
| Image metadata | EXIF/GPS/XMP extraction over all 16 files | **clean** (no GPS, no device, no editor traces) |
| PDF metadata | Stream/Info/XMP extraction over all 7 PDFs | resume: Author "Un-named", Word 2010, created 14 Sep 2026 (text also contains phone `+91 85459 34143`); YSF: **Author "Richa Garg"** (third party) + Canva; others: tool names only (Qt 5.5.1, PDFsharp 6.1.1, plpdf 2.8.0, Adobe Illustrator 28.5) |
| Production build | `npx vite build` in a throwaway copy | JS **519.81 kB (gzip 160.26)** single file + Vite ">500 kB" warning; CSS 50.39 kB (gzip 14.44); 14 woff2 = 214 kB; `dist` = **12 MB** |
| DOM structure | static render of 7 routes | 2 `<Section>`s × 2 ambient glows on 5 sub-pages; heading order h1→h3 (no h2) on 5 routes |
| SSR safety | render `Hero` outside a browser | **throws** `ReferenceError: window is not defined` |
| Contrast | WCAG luminance maths incl. alpha compositing | 5 AA failures (see §6) |
| Lenis behaviour | read `node_modules/lenis/dist/lenis.mjs` | `onNativeScroll` only re-syncs when `isScrolling === false \| 'native'` → native `scrollTo` during a smooth scroll is ignored |

---

## 5. Findings register (IDs are stable — stage prompts reference them)

### Security / privacy
| ID | Finding |
|---|---|
| A1 | 5 high dev-only advisories (Tailwind 3 tooling chain). Shipped tree clean. Only fix = Tailwind 4 (breaking) → stage S10 |
| A2 | Contact form: recipient Gmail is in the public bundle (`https://formsubmit.co/ajax/<the inbox address>` (redacted here in S7 — see T20)); no request timeout → button can hang on "Sending…" |
| A3 | PDF metadata (see §7). **User decision C2: strip metadata from EVERY file** → stage S2 |
| A4 | No error boundary: any runtime error or failed JS chunk = blank white page → stage S0 |

### Bugs (visitor-visible)
| ID | Finding |
|---|---|
| T14 | **Navbar can turn invisible.** `useSectionSignal` sets tone once when a section enters the middle band and never restores. Sub-pages nest a `<Section>` inside another `<Section>` (2 sections, 2 glows) → on `/contact` and `/certifications` a sticky dark tone over an ivory background = unreadable nav links. Proven by static render (`/contact sections=2 glows=2`, `/certifications sections=2 glows=2`, `/about glows=2`) → stage S4 |
| T15 | Two scroll engines: route change uses native `window.scrollTo`, footer uses native smooth scroll, while Lenis owns scrolling → jumps/rubber-banding when navigating during a scroll → stage S4 |
| T16 | Mobile menu only sets `body { overflow:hidden }`; Lenis keeps scrolling behind it; focus can Tab out of the overlay → stage S4 |
| T17 | Cursor promises clicks that don't exist: `data-cursor="cert"`/`"project"` on non-clickable cards and the project mockup → stage S4 |
| T18 | Hero orbit tilt reads `window.innerHeight/innerWidth` during render; freezes on resize and breaks SSR/prerender → stage S4 |
| T19 | Contact form: no timeout (see A2), error copy says "email me directly below" while the address is in the left column → stage S4. **Constraint C1: do NOT add a third-party delivery note** |
| T10 | Featured-project GitHub button renders `href={null}` if the featured project has no repo → stage S6 |

### Accessibility (measured — see §6 for exact numbers)
| ID | Finding |
|---|---|
| T25 | C1 focus ring cyan on ivory = **1.61:1** (invisible on light sections); C2 `muted` on ivory/tint = 4.45/4.22; C3 `text-cobalt` small labels on ivory = 3.29; C4 ivory on indigo CTA = 4.35; C5 form input borders `ivory/20` = 1.81 + placeholder `fog/50` = 2.67; C6 teal chip 4.07; C7 `muted/80` micro notes 3.10 → stage S5 |
| T26 | Heading order skips h2 on `/experience`, `/education`, `/certifications`, `/achievements`, `/contact` → stage S5 |
| T5 | Marquee first row is not `aria-hidden` → screen readers read it twice → stage S5 |
| T7 | `/achievements` page header uses coral while its section is lime (breaks the one-accent rule) → stage S5 |
| T12 | Unguarded lookups: `TILE[item.id]` / `CHIP[item.id]` (achievements), `accentText[...]` — a new data entry can break the mosaic → stage S5 |
| T3 | No `MotionConfig`; reveals/parallax/tilt ignore `prefers-reduced-motion` despite `DESIGN.md §8` → stage S0 |

### Images (verified by opening all 16 files)
| ID | Finding |
|---|---|
| T24 | **Both project folders are crossed.** Everything in `public/projects/bmw/` is really **Coding Ninjas**; everything in `public/projects/coding-ninjas/` is really **BMW**. Alt text describes the *intended* project, so the site shows BMW screenshots captioned "Coding Ninjas recreation". Two images (`bmw-08`, `bmw-09`) are attached nowhere. Names are opaque (`cn-01`, `bmw-04`). Full mapping + new names + new alt text in §8 → stage S1 |

### Performance / SEO / hygiene
| ID | Finding |
|---|---|
| T31 | 519.81 kB single JS bundle (160.26 kB gzip); all 10 routes downloaded before first paint → stage S6 |
| T32 | No WebP/`srcset`; `dist` 12 MB; largest objects: YSF cert 4.43 MB, cn-04 1.10 MB, cn-01 743 kB, resume 647 kB, Oracle cert 524 kB; 14 font files shipped (latin subsets ≈87 kB) → stage S6 |
| T30 | Gallery images lack `width`/`height` → layout shift; the ~2.2:1 screenshots sit in an `aspect-[16/10]` box with `object-cover object-top` → side cropping → stage S6 |
| T27 | No `og:image`/twitter image/canonical (blank share preview); Home calls `usePageMeta(null, …)` which **overwrites** the rich static title/description from `index.html` → stage S7 |
| T28 | No `robots.txt`, no `sitemap.xml` → stage S7 |
| T29 | No web manifest / Apple touch icon → stage S7 |
| T20 | Gmail address in the public bundle (same root cause as A2) → stage S7 (bundle side) with S4 handling the form behaviour |
| T21 | **No host-level 404**: no `404.html`, and the React `NotFound` only covers in-app routes → stage S3 |
| T22 | **No SPA rewrite** for Vercel → `yoursite.com/projects/bmw` on a direct load/refresh 404s → stage S3 |
| T1 | **No `.gitignore`** — `node_modules/`, `dist/`, `qa/*.png` are all unignored → stage S0 |
| T2 | No error boundary (same as A4) → stage S0 |
| T4 | Dead imports: `useSite` (Section.jsx), `Terminal`/`Stagger`/`StaggerItem` (About.jsx), `Stagger`/`StaggerItem` (Education.jsx), `EASE` (Hero.jsx), `ExternalLink`/`MaskLines` (ProjectsHome.jsx), `Parallax` (ProjectDetail.jsx); unused `labelledBy` prop on `Section` → stage S0 |
| T11 | Hardcoded copy that goes stale: "Two recreations" (ProjectsPage), "Project 02" (ProjectsHome), `FRAME_LABELS` (7 fixed captions) → stages S1/S9 |
| T13 | `DESIGN.md` states wrong numbers: muted contrast "5.0:1" (really 4.45), indigo "4.6:1" (really 4.35); claims Lenis pauses when the tab is hidden (not implemented) → stage S9 |
| T6 | Badminton achievement has no year while every other entry does → stage S9 (needs the real year from the user) |
| T8 | Cursor rail label `SWIPE →` vs `DESIGN.md §7` `SCROLL →` → stage S9 |
| T23 | `qa/shoot.mjs` not wired to npm, hardcodes `/home/user/qa/` + `localhost:5173`, and its overflow check is defeated by `body { overflow-x: clip }` → stage S9 |
| T33 | No ESLint/Prettier, no lint script → stage S9 |
| T34 | No automated tests; no check that a project shows its own screenshots → stage S9 |
| T35 | Tailwind 3 → 4 (breaking; the only way to clear A1) → stage S10 |
| T9 | CV headline says "Full Stack Development" while the site never claims it → **resolved by C3** in favour of expertise → stage S8 |
| F-corrections | Two earlier mis-statements, retracted: (a) "duplicate form IDs" was a **false alarm** (`id="cf-name"` appears once as a prop and once as the real input attribute → one DOM id); (b) the tone bug bites **only** on `/contact` and `/certifications` (the other three sub-pages nest matching colours; they still render a double glow) |

### 5.1 Change list in severity order (issue → fix → files → stage → risk)

**Tier 1 — tiny, near-zero risk**

| ID | Issue | Fix | Files | Stage | Risk |
|---|---|---|---|---|---|
| T1 | No `.gitignore` | Standard ignore file (node_modules, dist, qa screenshots, .env*) | `.gitignore` (new) | S0 | none |
| T2 | Runtime error = blank page | ErrorBoundary + branded fallback, Nav/Footer stay alive | `components/ErrorBoundary.jsx` (new), `App.jsx` | S0 | none |
| T3 | Reduced-motion ignored | `<MotionConfig reducedMotion="user">` wrapper | `App.jsx` | S0 | low |
| T4 | 8 dead imports + unused prop | Delete them | Section, About, Education, Hero, ProjectsHome, ProjectDetail | S0 | none |
| T5 | Marquee read twice by AT | Hide both visual rows, expose text once | `Marquee.jsx` | S5 | none |
| T6 | Badminton has no year | Add the year (user supplies it) | `data/achievements.js` | S9 | none |
| T7 | `/achievements` accent mismatch | Align page-intro accent with the section | `pages/SimplePages.jsx` | S5 | low |
| T8 | Cursor label vs design doc | Make code and doc agree | `Cursor.jsx` or `DESIGN.md` | S9 | none |
| T10 | `href={null}` GitHub button | Guard / hide | `ProjectsHome.jsx` | S6 | none |
| T11 | "Two recreations", "Project 02" hardcoded | Derive from data | ProjectsPage, ProjectsHome | S9 | none |
| T12 | Unguarded `TILE[id]`/accent lookups | Safe fallbacks | Achievements, Skills, Certifications, SectionHead | S5 | none |
| T13 | DESIGN.md wrong numbers + Lenis claim | Correct doc / implement the pause | `DESIGN.md` | S9 | none |

**Tier 2 — small, contained logic**

| ID | Issue | Fix | Files | Stage | Risk |
|---|---|---|---|---|---|
| T14 | Navbar turns invisible; double section + glow on 5 sub-pages | `intro` slot on Section, tone restore in `useSectionSignal`, single section per page | `lib/site.jsx`, `Section.jsx`, 6 pages, touched sections | S4 | medium |
| T15 | Two scroll engines | One Lenis instance via context; route reset + footer through it; `resize()` after route | `lib/scroll.jsx` (new), App, Footer | S4 | medium |
| T16 | Mobile menu doesn't lock scroll / focus escapes | lenis stop/start, dialog semantics, focus trap, inert background, focus restore | `Nav.jsx` | S4 | low |
| T17 | Cursor promises non-existent clicks | Real links on cards/mockup, or downgrade cursor state | ProjectsHome, Certifications, Experience | S4 | low |
| T18 | Hero freezes on resize, breaks SSR | `useViewport` hook instead of render-time window reads | `hooks/useViewport.js` (new), `Hero.jsx` | S4 | low |
| T19 | Form: no timeout + wrong error copy | AbortController 10 s; fix copy (**no third-party note — C1**) | `Contact.jsx` | S4 | low |
| T20 | Gmail in public bundle | Env-driven alias endpoint; verify by grepping the build | `Contact.jsx`, `.env.example` | S7 | low |
| T21 | No host 404 | `public/404.html`, no-JS, branded, design-consistent | `public/404.html` (new) | S3 | none |
| T22 | Deep links 404 on Vercel | `vercel.json` SPA rewrite | `vercel.json` (new) | S3 | low |
| T23 | QA script unwired + broken overflow check | npm script, repo output path, measure `body.scrollWidth`, add BMW page | `qa/shoot.mjs`, `package.json` | S9 | none |

**Tier 3 — medium (images, accessibility, discoverability, performance)**

| ID | Issue | Fix | Files | Stage | Risk |
|---|---|---|---|---|---|
| T24 | All 16 screenshots in the wrong folder, 2 orphans, opaque names | Move + rename per §8.2, new alt text §8.3, data-driven captions, attach orphans | 16 images, `data/projects.js`, `ProjectsHome.jsx`, README, UPDATE_GUIDE | S1 | low |
| T25 | 5 measured AA contrast failures | Apply §6.2 values verbatim | tailwind config, index.css, Hero, Nav, Contact, Experience, Skills, Achievements | S5 | medium |
| T26 | Heading order skips h2 on 5 routes | Render section heading or demote entry titles | `SectionHead.jsx`, sections, SimplePages | S5 | low |
| T27 | No social preview; Home clobbers meta | og:image + twitter + canonical; keep static meta on `/` | `index.html`, `public/og-cover.png`, Home/usePageMeta | S7 | low |
| T28 | No robots/sitemap | Add both with the 9 routes | `public/robots.txt`, `public/sitemap.xml` | S7 | none |
| T29 | No manifest / apple icon | Manifest + 180×180 icon + links | `index.html`, `public/site.webmanifest` | S7 | none |
| T30 | No image dimensions; wide shots cropped | width/height + optional aspect retune (ask) | `data/projects.js`, ProjectDetail, ProjectsHome | S6 | low |
| T31 | 519.81 kB single JS bundle | Route-level lazy + Suspense, build config | `App.jsx`, `vite.config.js` | S6 | medium |
| T32 | No WebP/srcset; 12 MB deploy; 14 font files | Lossless WebP for the 7 PNG-backed files only, srcset, latin-only fonts, PDF image question | images, `main.jsx`, `index.html` | S6 | medium |
| T33 | No linter/formatter | ESLint (react-hooks) + Prettier + scripts | config files, `package.json` | S9 | low |
| T34 | No tests | Playwright smoke tests incl. "each project shows its own screenshots" | `tests/smoke.spec.js` | S9 | low |
| C2/A3 | Metadata on 7 PDFs (2 with personal data) + whole sweep | Strip from every PDF/image/SVG + `check:meta` verifier | all of `public/`, `qa/check-metadata.*` | S2 | low |
| C3/T9 | Full Stack not claimed; CV contradicts the site | Expertise skill group from existing technologies + doc alignment (no invented stack) | `data/skills.js`, `data/profile.js`, About/Skills, README, UPDATE_GUIDE | S8 | low |

**Tier 4 — large / breaking**

| ID | Issue | Fix | Files | Stage | Risk |
|---|---|---|---|---|---|
| T35 | 5 high dev-only advisories (Tailwind 3 chain) | Tailwind 3 → 4, config layer only, isolated, last | `index.css`, `tailwind.config.js`, `postcss.config.js`, `package.json` | S10 | high |

---

## 6. Measured reference values

### 6.1 Contrast (WCAG AA: 4.5:1 normal text, 3:1 large text / UI)

| Pair | Ratio | Verdict |
|---|---|---|
| ink on ivory | 16.03 | pass |
| ivory on deep / ink / deeper | 15.51 / 16.03 / 16.84 | pass |
| fog on deep / deeper / ink | 6.84 / 7.42 / 7.07 | pass |
| **muted on ivory** | **4.45** | **fail** |
| **muted on tint `#EFEAF9`** | **4.22** | **fail** |
| muted on paper | 4.86 | pass |
| **indigo on ivory** | **4.35** | **fail** |
| **cobalt `#3B82F6` on ivory** | **3.29** | **fail** |
| cobalt on deep | 4.71 | pass |
| **cyan `#27D3F2` on ivory (focus ring)** | **1.61** | **fail** |
| cyan on deep / ink | 9.65 / 9.97 | pass |
| **coral on ivory** | **2.48** | **fail** (icons only) |
| **teal `#0e7d90` on cyan/10-over-ivory** | **4.07** | **fail** |
| **muted/80 on ivory** | **3.10** | **fail** |
| **form border `ivory/20` on `#111A2C`** | **1.81** | **fail** |
| **placeholder `fog/50` on `#111A2C`** | **2.67** | **fail** |
| ivory on indigo CTA | 4.35 | fail (borderline) |

### 6.2 Verified replacement values (computed, use these — do not re-guess)

| Purpose | Change | New ratio |
|---|---|---|
| Secondary text token | `muted #667085` → **`#5B6474`** | 5.34 ivory · 5.06 tint · 5.82 paper |
| Small accent text on light | add **`cobalt-ink #1D4ED8`** (keep bright cobalt on dark) | 5.99 on ivory |
| Primary button background | `#6C5CE7` → **`#5A4BD4`** (already the hover colour) | ivory on it = 5.54 |
| Focus ring, light sections | cyan → **ink `#10162B`** (cyan stays on dark zones) | 16.03 |
| Form input border | `ivory/20` → **`ivory/45`** | 4.10 |
| Form placeholder | `fog/50` → **`fog/80`** | 4.88 |
| Achievements teal chip | `#0e7d90` → **`#0b6b7c`** | 5.20 |
| Micro mono notes | `muted/80` → full **`muted`** | 5.34 |

### 6.3 Asset inventory

**Coding Ninjas screenshots (currently in `public/projects/bmw/`, all `.jpeg`)**
`bmw-01` 1259×716 · `bmw-02` 1264×711 · `bmw-03` 1266×714 · `bmw-04` 1260×712 · `bmw-05` 1264×717 · `bmw-06` 1279×713 · `bmw-07` 1265×711 · `bmw-08` 1277×707 · `bmw-09` 1279×711 — 108/94/175/111/85/100/103/93/87 kB (956 kB total)

**BMW screenshots (currently in `public/projects/coding-ninjas/`, all `.png`)**
`cn-01` 1349×613 (743 kB) · `cn-02` 1351×613 (471 kB) · `cn-03` 1351×613 (71 kB) · `cn-04` 1351×620 (1105 kB) · `cn-05` 1352×620 (50 kB) · `cn-06` 1349×610 (125 kB) · `cn-07` 1348×607 (443 kB) — 3008 kB total

**Other assets:** `resume.pdf` 647 kB · 7 certificate PDFs (YSF 4.43 MB, Oracle 524 kB, Gemini Educator 451 kB, Walmart 279 kB, Digital Productivity 216 kB, Deloitte 120 kB, Gemini Student 57 kB) · `favicon.svg` 471 B

### 6.4 WebP conversion, pre-tested (libwebp `lossless=True, quality=100, method=5`)

| Group | Files | Today | Lossless WebP | Change |
|---|---|---|---|---|
| BMW project (the `.png` files) | 7 | 3008 kB | **1545 kB** | **−49%** (pixel-identical) |
| Coding Ninjas project (the `.jpeg` files) | 9 | 956 kB | 1868 kB | **+95% — lossless is counter-productive** |

Lossy q85 for reference: total drops to 818 kB (−79%), but that is **lossy** and needs the user's explicit approval. Decision recorded: **lossless WebP only for the PNG-backed 7**; for the 9 JPEG-backed files the default is **leave as JPEG** (optional lossy WebP q88–92 later, only on request).

### 6.5 PDF metadata removal — tested on copies

| File | Removed | Integrity proof | Size |
|---|---|---|---|
| `resume.pdf` | Info dict + XMP (Author "Un-named", Word 2010, dates) | 1 page → 1 page, **content-stream sha256 identical** | 647 → 644 kB |
| `ysf-internship-certificate.pdf` | Info + XMP (Author **"Richa Garg"**) | 1 page → 1 page, **content-stream sha256 identical** | 4433 → 4434 kB |

Method: `pikepdf` — `open_metadata().clear()`, delete `docinfo`, re-save with `compress_streams=True`. Nothing visible changes. The YSF file stays 4.4 MB because its bulk is embedded imagery, not metadata (shrinking it needs image re-compression *inside* the PDF — stage S6, with a legibility comparison first).

---

## 7. USER CORRECTIONS — binding, they override anything written elsewhere

These three items are the user's explicit decisions. Where this document or a stage prompt contradicts them, **the correction wins**.

### C1 — Do NOT add a FormSubmit disclosure line
Earlier proposal A2/T19 suggested adding *"Messages are delivered via FormSubmit (third party)"* under the contact form. **The user does not want that line. Do not add it.** Still allowed in the same area: the 10-second request timeout, and fixing the error copy that says "email me directly below" (the address sits in the left column).

### C2 — Remove metadata from EVERY file in the portfolio
Not just the two PDFs found in the audit. **All 7 PDFs, all 16 screenshots, and `favicon.svg`** must end up metadata-free, and this must be *verified file-by-file* afterwards. Where a file had no metadata, record that fact ("verified clean") rather than skipping it. Method per type:
- **PDF** → `pikepdf` (as §6.5)
- **PNG** → lossless re-save (drop ancillary chunks: `tEXt`/`iTXt`/`zTXt`/`tIME`/`eXIf`; pixels byte-identical)
- **JPEG** → re-save with `quality='keep', subsampling='keep'` so the image data is **not** recompressed, only metadata markers dropped (APPn/COM)
- **SVG** → strip XML comments/metadata nodes; keep the drawing untouched
- **WebP** (where produced later) → save without EXIF/XMP chunks
Deliverable of that stage: a verifier script (e.g. `qa/check-metadata.mjs` or a Python equivalent) that prints a per-file verdict and **fails** if any metadata is found. This becomes part of `npm run check:meta`.

### C3 — Present Full Stack Development as EXPERTISE, not as learning
The site currently never claims full-stack; `README.md`'s honesty policy even says learning topics are "shown as *exploring*, never as production expertise", while the CV headline lists "Full Stack Development". The user wants the **site to claim Full Stack Development as an expertise area**. Implementation:
- Add a **Full Stack Development** skill group in `src/data/skills.js` built only from technologies already present in the data (frontend: HTML/CSS/JavaScript/React/Tailwind/Vite; server-side & data: Python/Java/SQL/DBMS). Do **not** invent frameworks, years of experience or metrics the user has not supplied.
- Renumber the skill group indexes cleanly (they are displayed as `01…07`).
- Reflect it in the About copy and keep the CV aligned (the CV already says full-stack, so **no CV edit is needed** — this also resolves T9 in favour of expertise).
- Update the honesty-policy wording in `README.md` + `UPDATE_GUIDE.md` so the docs no longer contradict the site. **Keep** the third-party protections untouched: "Website Recreation" labels, "Virtual Job Simulation — not employment", and "no affiliation/endorsement implied" must stay exactly as they are — those are about other companies, not about self-assessment.
- The `currentlyExploring` chips for infrastructure topics (Linux, Docker, hosting, APIs) stay as they are **unless** the user later says otherwise.
- Open detail the user must answer: whether a specific backend framework should be named (Node/Express/Django/Flask) — do not guess.

---

## 8. IMAGE TRUTH TABLE — verified by opening all 16 files

**Root cause:** the two screenshot batches were uploaded into each other's folder, and `src/data/projects.js` alt text was written for the *intended* project. Result: mismatched captions, two orphaned images, opaque file names.

### 8.1 What each file actually shows

| Current path | Actually shows | Belongs to |
|---|---|---|
| `bmw/bmw-01.jpeg` | CN hero — "Give your career an unfair AI advantage" + AI-tool marquee | Coding Ninjas |
| `bmw/bmw-02.jpeg` | CN — "Let's find the right course for you" finder + placement-stats row | Coding Ninjas |
| `bmw/bmw-03.jpeg` | CN — "Pick the track that matches where you are" course rails + filter chips | Coding Ninjas |
| `bmw/bmw-04.jpeg` | CN — "AI infused curriculum curated by experts" + student quote card | Coding Ninjas |
| `bmw/bmw-05.jpeg` | CN — testimonial carousel, reviewer tabs (URL `localhost:5173/#/reviews`) | Coding Ninjas |
| `bmw/bmw-06.jpeg` | CN — "What the industry is saying" press cards | Coding Ninjas |
| `bmw/bmw-07.jpeg` | CN — 10X Club community section + mentor rail | Coding Ninjas |
| `bmw/bmw-08.jpeg` | CN — "1,50,000+ alumni" ratings band + NSDC accreditation strip | Coding Ninjas — **orphaned** |
| `bmw/bmw-09.jpeg` | CN — full footer (incl. "Non-commercial learning project — React + Tailwind CSS recreation") | Coding Ninjas — **orphaned** |
| `coding-ninjas/cn-01.png` | BMW — "THE 5 LONG WHEELBASE" hero + "Discover now" | BMW |
| `coding-ninjas/cn-02.png` | BMW — dealer locator map page | BMW |
| `coding-ninjas/cn-03.png` | BMW — search page + quick-links/legal footer | BMW |
| `coding-ninjas/cn-04.png` | BMW — diagonal-split All Models showcase (1 Series, 5 Series, X1, i7) | BMW |
| `coding-ninjas/cn-05.png` | BMW — "BOOK A TEST DRIVE" request form | BMW |
| `coding-ninjas/cn-06.png` | BMW — all-models listing with price-range/instalment filters | BMW |
| `coding-ninjas/cn-07.png` | BMW — "BMW Special Offers" panel (EMI figure + Know More) | BMW |

### 8.2 New file names (pattern `<project-slug>-NN-<content>.<ext>`)

**→ `public/projects/coding-ninjas/`** (kept as `.jpeg`)

| New name | From | Gallery order |
|---|---|---|
| `coding-ninjas-01-hero.jpeg` | `bmw/bmw-01.jpeg` | 1 |
| `coding-ninjas-02-course-finder.jpeg` | `bmw/bmw-02.jpeg` | 2 |
| `coding-ninjas-03-course-rails.jpeg` | `bmw/bmw-03.jpeg` | 3 |
| `coding-ninjas-04-ai-curriculum.jpeg` | `bmw/bmw-04.jpeg` | 4 |
| `coding-ninjas-05-10x-club.jpeg` | `bmw/bmw-07.jpeg` | 5 |
| `coding-ninjas-06-testimonials.jpeg` | `bmw/bmw-05.jpeg` | 6 |
| `coding-ninjas-07-alumni-ratings.jpeg` | `bmw/bmw-08.jpeg` | 7 — **newly attached** |
| `coding-ninjas-08-in-the-news.jpeg` | `bmw/bmw-06.jpeg` | 8 |
| `coding-ninjas-09-footer.jpeg` | `bmw/bmw-09.jpeg` | 9 — **newly attached** |

**→ `public/projects/bmw/`** (converted to `.webp` in stage S6; `.png` until then)

| New name | From | Gallery order |
|---|---|---|
| `bmw-01-hero-5-series.png` | `coding-ninjas/cn-01.png` | 1 |
| `bmw-02-all-models.png` | `coding-ninjas/cn-04.png` | 2 |
| `bmw-03-dealer-locator.png` | `coding-ninjas/cn-02.png` | 3 |
| `bmw-04-model-listing.png` | `coding-ninjas/cn-06.png` | 4 |
| `bmw-05-special-offers.png` | `coding-ninjas/cn-07.png` | 5 |
| `bmw-06-test-drive-form.png` | `coding-ninjas/cn-05.png` | 6 |
| `bmw-07-search-footer.png` | `coding-ninjas/cn-03.png` | 7 |

### 8.3 New alt text (describes what the reader actually sees)

**Coding Ninjas**
1. `Coding Ninjas recreation — hero with "Give your career an unfair AI advantage" headline and AI-tool marquee`
2. `Coding Ninjas recreation — "Let's find the right course for you" form panel with placement stats row below`
3. `Coding Ninjas recreation — "Pick the track that matches where you are" course rail with category filter chips`
4. `Coding Ninjas recreation — "AI infused curriculum curated by experts" feature list with student quote card`
5. `Coding Ninjas recreation — 10X Club community section with weekly mentor rail`
6. `Coding Ninjas recreation — student testimonial carousel with reviewer tabs`
7. `Coding Ninjas recreation — 1,50,000+ alumni ratings band and NSDC accreditation strip`
8. `Coding Ninjas recreation — "What the industry is saying" press coverage cards`
9. `Coding Ninjas recreation — multi-column footer with offerings, products, community and payment row`

**BMW**
1. `BMW recreation — 5 Series Long Wheelbase hero with "Discover now" call to action`
2. `BMW recreation — diagonal-split All Models showcase (1 Series, 5 Series, X1, i7)`
3. `BMW recreation — dealer locator map page with nearby-location search fields`
4. `BMW recreation — all-models listing with price-range and instalment sliders`
5. `BMW recreation — special offers panel with monthly EMI figure and finance links`
6. `BMW recreation — book a test drive request form with model and city selectors`
7. `BMW recreation — site search page with quick links and legal footer`

### 8.4 Consequences to implement alongside the swap
- `src/data/projects.js`: rewrite both `gallery` arrays (paths + alt text), add a `label` per gallery item for the sticky-story captions, update `scrollFrames` for the 9-image CN gallery.
- `src/sections/ProjectsHome.jsx`: replace hardcoded `FRAME_LABELS` with `project.gallery.map(g => g.label)`.
- `README.md` asset section and `UPDATE_GUIDE.md` step 2: document the naming pattern + "one gallery array per project, in page order".
- `qa/shoot.mjs`: add the BMW detail page so this class of mix-up is caught (stage S9/T34).
- Aspect note: CN screenshots are ~2.2:1 but the sticky story box is `aspect-[16/10]` with `object-cover object-top` → sides get cropped. Optional retune (e.g. `aspect-[2/1]`) — ask the user.
- Visible-copyright note: some screenshots contain third-party contact details/footers. They are already labelled recreations; an optional extra line under galleries ("Unofficial study project — no affiliation with the brand shown") is proposed but **needs the user's OK** (it is not covered by C1, which is only about the form).

---

## 9. Stage plan (see Part B for the paste-ready prompts)

| Stage | Name | Items | Notes |
|---|---|---|---|
| **S0** | Safety net | T1, T2, T3, T4 | `.gitignore` must exist **before** any `npm install`. Almost zero visual risk |
| **S1** | Images truth pass | T24 | Pure moves/renames + data edits. Biggest visible correctness win |
| **S2** | Metadata sweep (all files) | C2 → A3/T36 extended | 7 PDFs + 16 images + favicon.svg, with a verifier script |
| **S3** | 404 + deep links + failure surfaces | T21, T22 (+T2 404.html) | Vercel: `vercel.json` rewrite + `public/404.html`; unify host 404 / React 404 / error fallback |
| **S4** | Bug fixes | T14, T15, T16, T17, T18, T19 (+A2 timeout) | The real broken behaviour. **C1 applies** (no delivery note) |
| **S5** | Accessibility | T25, T26, T5, T7, T12 | Use §6.2 values verbatim |
| **S6** | Performance | T31, T32, T30, T10 | Includes lossless WebP for the 7 PNG-backed files only |
| **S7** | Discoverability & privacy | T27, T28, T29, T20 | Social card, robots/sitemap, manifest, remove the address from the bundle |
| **S8** | Positioning | **C3** | Full Stack Development as expertise + doc honesty-policy alignment |
| **S9** | Hygiene, content & tests | T6, T8, T11, T13, T23, T33, T34 | Needs the badminton year from the user |
| **S10** | Tailwind 4 (isolated, last) | T35 | Only after the rest is committed to `main`; clears A1 |

**Ordering rules:** S0 first (it creates `.gitignore` and the error boundary that make everything else safer). S1 before S2 (names settle before metadata is stripped). S6 after S1/S2 (conversion depends on final names). S10 last and alone. Any stage may be skipped.

---

## 10. Open questions for the user

1. **Badminton year** (T6) — needed before S9; not invented.
2. **Backend stack for the Full Stack expertise claim** (C3) — may a specific framework be named (Node/Express, Django, Flask) or should the claim stay at the technologies already listed?
3. **JPEG-backed screenshots** — leave as JPEG (default), or lossy WebP q88–92 for ~60% smaller files?
4. **Sticky-story aspect ratio** for the wide CN screenshots — retune or leave?
5. **Extra "no affiliation" line under galleries** — yes/no (separate from C1).
6. **The user's own fix ideas** — send them before the stage they touch so they are built in rather than reworked.

---

## 11. Document maintenance

If a stage changes a decision recorded here (e.g. the user picks lossy WebP, or a finding turns out to be wrong), **update this file in the same turn**. Part B prompts reference this document by item id (T-codes, S-stages, C-corrections) so the two files must stay consistent.

**Persistence rule:** keep these files in `portfolio-arena/audit/`. Only files inside the git repository survive a session rebuild; anything in `/tmp` or other locations is discarded.

*End of Part A.*
