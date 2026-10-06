# PORTFOLIO STAGE PROMPTS — Part B: ready to paste

> **How to use this file.** Each stage below is a self-contained prompt inside a copy-paste block.
> Copy **one block** and paste it into the chat. That block alone carries enough context for the work to run correctly even with no memory of earlier conversations.
> For extra safety, paste (or attach) **Part A — `PORTFOLIO-MASTER-BRIEF.md`** at the start of a session; every prompt refers to its item ids (T-codes, S-stages, C-corrections).
> Stages are independent and may be run in any order, except: **S0 first** and **S10 last**. One stage per turn.

**Stage index:** S0 safety net · S1 images · S2 metadata · S3 404/deep links · S4 bug fixes · S5 accessibility · S6 performance · S7 discoverability · S8 positioning (Full Stack) · S9 hygiene/content/tests · S10 Tailwind 4

**Files in this set:** `audit/PORTFOLIO-MASTER-BRIEF.md` (Part A) · `audit/PORTFOLIO-STAGE-PROMPTS.md` (this file) · `audit/PORTFOLIO-AUDIT-AND-FIX-PLAN.pdf` (both, printable).

---

## SESSION OPENER (optional — paste before the stage prompt when starting fresh)

````text
You are continuing an audit-and-fix programme on my portfolio project. Attached/pasted is
PORTFOLIO-MASTER-BRIEF.md (Part A) which contains the full context, all findings, decisions
and constraints. Read it first. Then I will paste one stage prompt (from
PORTFOLIO-STAGE-PROMPTS.md, Part B) and you will execute only that stage.

Ground rules for every stage:
- Work only in /home/user/portfolio-arena, branch arena/01a10c65-portfolio-arena. Never switch
  branches, never push anywhere else.
- Make no changes outside the named stage's scope. If you find something else, report it, don't fix it.
- After the change: run the production build, verify what the stage's acceptance criteria ask for,
  and start the dev server as a live preview so I can look at it.
- End with a report: what changed, what you verified and how, what you could NOT verify, and any
  decision you need from me. Never claim a visual check you did not perform.
- Note: this sandbox is rebuilt between sessions — only files inside the repo persist, so never
  rely on /tmp for anything that must last.
- Tell me when the stage is done and remind me which stage is next.

Confirm you have read the brief and are ready, then wait for my stage prompt.
````

---

## S0 — SAFETY NET

````text
STAGE S0 — SAFETY NET (items T1, T2, T3, T4). One stage only; do not start any other stage.

CONTEXT
- Repo: /home/user/portfolio-arena (React 19 + Vite 8 + Tailwind 3.4 portfolio). Branch:
  arena/01a10c65-portfolio-arena — commit to this branch only.
- Base commit: 85f12aa, 77 tracked files, clean tree. Full context in audit/PORTFOLIO-MASTER-BRIEF.md (Part A).
- There is currently NO .gitignore, NO error boundary, and no MotionConfig.
- The folder audit/ contains untracked documentation — leave it alone (do not commit it unless I say so).

TASKS
1. T1 — Create /home/user/portfolio-arena/.gitignore with entries for: node_modules/, dist/,
   .DS_Store, *.local, .env*, .vite/, coverage/, and qa/*.png (QA screenshots are throwaway).
   Create this file FIRST, before running any install command. Then verify with
   `git status --porcelain --untracked-files=all` that the tree shows only the intended new files.
2. T2 — Add a React error boundary:
   - New file src/components/ErrorBoundary.jsx: class component with getDerivedStateFromError +
     componentDidCatch, rendering a branded fallback in the site's own language (ink background,
     display font, mono micro-label, "Back to home" link + reload button). Keep it dependency-light;
     inline styles are acceptable so it works even if the CSS chunk failed.
   - Wire it in src/App.jsx so it wraps <AnimatedRoutes /> (keep Nav and Footer alive around it),
     and so it resets when the route path changes (e.g. key on location.pathname or a reset handler).
   - Verify by temporarily throwing inside a route component on a scratch basis, confirming the
     fallback renders, then REVERT the temporary throw. Report the evidence.
3. T3 — In src/App.jsx wrap the app in <MotionConfig reducedMotion="user"> from 'motion/react'
   (one import + one wrapper). This makes reveals, parallax and the Hero orbit respect
   prefers-reduced-motion, as DESIGN.md §8 already promises. Do not change any other motion config.
4. T4 — Delete dead imports and the unused prop:
   - src/components/Section.jsx: remove unused `useSite` import.
   - src/sections/About.jsx: remove unused `Terminal`, `Stagger`, `StaggerItem`.
   - src/sections/Education.jsx: remove unused `Stagger`, `StaggerItem`.
   - src/sections/Hero.jsx: remove unused `EASE`.
   - src/sections/ProjectsHome.jsx: remove unused `ExternalLink`, `MaskLines`.
   - src/pages/ProjectDetail.jsx: remove unused `Parallax`.
   - src/components/Section.jsx: remove the unused `labelledBy` prop (check no caller passes it).
   Change nothing else in those files.

ACCEPTANCE CRITERIA
- `git status` shows only the intended changes; node_modules (if installed) is NOT tracked.
- `npm run build` succeeds with no new warnings.
- The error boundary renders the branded fallback when a component throws (evidence captured).
- Reduced-motion: with the OS/browser set to reduce motion, reveals/parallax do not animate
  (verify by code inspection at minimum; say so if you cannot emulate it).
- No visual or behavioural change to the site in normal conditions.

REPORT + COMMIT
- Commit message: `S0: add .gitignore, error boundary, reduced-motion config; remove dead imports`.
- Report: files changed, verification method for each item, anything unverified, and confirm
  whether the dev server preview is running. Then say: "S0 done — next: S1 images truth pass."
````

---

## S1 — IMAGES TRUTH PASS

````text
STAGE S1 — IMAGES TRUTH PASS (item T24). One stage only.

CONTEXT
- Repo: /home/user/portfolio-arena. Branch: arena/01a10c65-portfolio-arena.
- ALL 16 project screenshots are in the WRONG folders. Everything currently in
  public/projects/bmw/ is really CODING NINJAS; everything currently in
  public/projects/coding-ninjas/ is really BMW. Two images (bmw-08, bmw-09) are referenced nowhere.
- The exact verified mapping, new file names, gallery order and new alt text are in
  audit/PORTFOLIO-MASTER-BRIEF.md §8. Use them verbatim — do not re-derive or invent.
- This stage is PURE file moves/renames + data edits. Do NOT re-encode, resize or convert any
  image in this stage (metadata and WebP are separate stages S2/S6).

TASKS
1. Move + rename the 16 files exactly as listed in brief §8.2, using `git mv` so history follows:
   - 9 files -> public/projects/coding-ninjas/coding-ninjas-01-hero.jpeg … coding-ninjas-09-footer.jpeg
   - 7 files -> public/projects/bmw/bmw-01-hero-5-series.png … bmw-07-search-footer.png
   - Result: public/projects/bmw/ contains ONLY BMW files; public/projects/coding-ninjas/ ONLY CN files.
   - No orphans: bmw-08 and bmw-09 (alumni-ratings, footer) become CN items 7 and 9.
2. Rewrite the `gallery` arrays in src/data/projects.js for both projects:
   - correct `src` paths and the new `alt` text from brief §8.3 (verbatim);
   - add a short `label` to each gallery item describing the section (used by the sticky story);
   - update `scrollFrames` for the Coding Ninjas project now that its gallery has 9 entries
     (keep the existing narrative intent: overview -> sections -> tech/status -> explore);
   - keep every other field (title, tech, github, status, description, sections/pages, implementation)
     unchanged.
3. src/sections/ProjectsHome.jsx: delete the hardcoded FRAME_LABELS array and read captions from
   data instead: project.gallery[frame].label (with a safe fallback if a label is missing).
4. Docs: update README.md (asset section) and UPDATE_GUIDE.md (step 2) to document the naming
   pattern `<project-slug>-NN-<content>.<ext>` and the rule "one gallery array per project, in page
   order; alt text must describe what is actually visible".
5. Keep the existing honesty labels unchanged ("Website Recreation", no affiliation).

ACCEPTANCE CRITERIA (verify all, show evidence)
- No file remains in the wrong folder; the two orphaned images are attached; count = 16 files.
- Every `gallery[].src` in projects.js exists on disk, and every image on disk is referenced
  exactly once (write a one-off check and show its output).
- Both project detail pages render their own screenshots in the intended order
  (/projects/coding-ninjas shows CN UI, /projects/bmw shows BMW UI). If you cannot run a browser,
  prove it by listing the resolved src order per project and by checking the alt text.
- `npm run build` succeeds; no other route or section changes appearance.

REPORT + COMMIT
- Commit message: `S1: swap misplaced project screenshots, rename to project-based names, re-point galleries + alt text`.
- Report: the mapping table as executed, the existence/reference check output, anything unverified.
  Then say: "S1 done — next: S2 metadata sweep."
````

---

## S2 — METADATA SWEEP (ALL FILES)

````text
STAGE S2 — METADATA SWEEP (user correction C2). One stage only.

CONTEXT
- Repo: /home/user/portfolio-arena. Branch: arena/01a10c65-portfolio-arena.
- BINDING USER INSTRUCTION (C2): remove metadata from EVERY file in the portfolio — all 7 PDFs,
  all 16 screenshots, and public/favicon.svg — not just the two PDFs that were found to carry
  personal data. Verified per file afterwards.
- Do not change any visible content: no re-compression of image data, no cropping, no re-rendering.
- Method (already tested on copies, see brief §6.5):
  * PDF: pikepdf — clear the XMP metadata packet, delete the document Info dictionary, re-save with
    compress_streams=True. (pip install pikepdf if needed.)
  * PNG: lossless re-save dropping ancillary chunks (tEXt/iTXt/zTXt/tIME/eXIf) — pixels identical.
  * JPEG: re-save with quality='keep', subsampling='keep' so the entropy-coded image data is NOT
    recompressed; only APPn/COM metadata markers are dropped.
  * SVG: strip XML comments and any <metadata>/<title>/<desc> nodes; keep the drawing byte-identical.
- S1 must already be done (file names are final).

TASKS
1. Record the BEFORE state of every file: for each of the 7 PDFs, 16 images and favicon.svg, extract
   whatever metadata exists (Info/XMP for PDFs, text/time/EXIF chunks for PNG/JPEG, metadata nodes
   for SVG) and print a table. Expect: resume.pdf (Author "Un-named", Word 2010, dates),
   ysf-internship-certificate.pdf (Author "Richa Garg", Canva), five certificates with tool-only
   metadata, images clean, favicon likely clean.
2. Strip metadata from all files with the methods above, in place, keeping the same file names.
3. Add a reusable verifier script that ENFORCES the result: qa/check-metadata.mjs (Node) or
   qa/check_metadata.py (Python) — whichever is cleaner to run without extra deps — that scans
   public/ recursively, prints a per-file verdict, exits non-zero if ANY metadata is found, and
   prints "0 files with metadata" on success. Wire it as an npm script: `"check:meta": "node qa/check-metadata.mjs"`.
4. Integrity proof for every changed file: page count unchanged for PDFs, and for PDFs the page
   content-stream SHA-256 must be IDENTICAL before/after; for images, pixel data identical
   (compare decoded pixels or file hash of image data); for the SVG, the rendered paths unchanged.
   Show the before/after table.
5. Note in the report which files actually had metadata (so the user knows what was exposed) and
   which were already clean.

ACCEPTANCE CRITERIA
- `npm run check:meta` exits 0 and reports zero files with metadata across public/.
- Every PDF: same page count, identical content-stream hash.
- Every image: identical decoded pixels, same dimensions; no visible change.
- `npm run build` succeeds; site renders identically (gallery images and all certificate links still work).
- Nothing else in the repository was touched.

REPORT + COMMIT
- Commit message: `S2: strip metadata from all public assets (7 PDFs, 16 images, favicon) + add check:meta verifier`.
- Report: before/after metadata table, integrity proofs, verifier output, anything unverified.
  Then say: "S2 done — next: S3 404 + deep links."
````

---

## S3 — 404, DEEP LINKS & FAILURE SURFACES

````text
STAGE S3 — 404, DEEP LINKS & FAILURE SURFACES (items T21, T22). One stage only.

CONTEXT
- Repo: /home/user/portfolio-arena. Branch: arena/01a10c65-portfolio-arena. Deploy target: VERCEL.
- Today: the in-app 404 route (src/pages/NotFound.jsx, path="*") works only inside React Router.
  There is NO public/404.html, NO SPA rewrite config, so on Vercel a direct load of
  /projects/bmw, /certifications, /contact etc. returns Vercel's own 404. And if JS fails to load,
  <div id="root"></div> renders nothing at all.
- The user explicitly asked for a proper custom 404 page. The three failure surfaces (host 404,
  React 404, error-boundary fallback from stage S0) must look like ONE design language.

TASKS
1. Add vercel.json at the repo root with a SPA rewrite:
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   (Do not add "cleanUrls"/"trailingSlash" experiments.)
2. Add public/404.html — a self-contained, no-JS branded page that Vercel serves for unmatched URLs
   and that also covers the "JS never loaded" case:
   - inline CSS only (no external requests), ink background, ivory type, the site's mono micro-label
     style, "error 404 — route not found" copy in the spirit of the existing NotFound page
     ("This page never shipped."), plus a prominent "Back to home" link.
   - Must be readable at 320px width and pass a contrast check (ink #10162B on ivory text etc.).
   - No build step may be required for it: it must exist as-is in dist/ after `vite build`
     (public/ is copied verbatim).
3. Make the React 404 and the new host 404 consistent: same headline, same mono micro-label, same
   CTA wording. Adjust src/pages/NotFound.jsx only if needed for consistency (keep its current
   design quality and its existing copy unless a change is needed for the match).
4. Confirm the S0 error boundary's fallback also matches this visual language (adjust wording/spacing
   if it drifted).
5. Add a short note to README.md documenting the failure surfaces and how to test them locally:
   `npm run build && npm run preview`, then visit /nope (host 404) and /projects/bmw (deep link
   must load the case study, not 404).

ACCEPTANCE CRITERIA
- `npm run build` copies 404.html into dist/ (show it).
- With `npm run preview`: a deep link like /projects/bmw loads the case study; an unknown path
  shows the design-consistent 404; with JavaScript disabled the 404.html content is still readable.
  If you cannot run a browser, verify by inspecting the built files and the rewrite rule, and say
  clearly that the browser check is pending the user's eyes.
- No other route's behaviour changes; no visual change to the rest of the site.

REPORT + COMMIT
- Commit message: `S3: add Vercel SPA rewrites + branded no-JS 404 page; unify failure surfaces`.
- Report: files added, how the rewrite works, what was verified, what needs the user's browser.
  Then say: "S3 done — next: S4 bug fixes."
````

---

## S4 — BUG FIXES (BEHAVIOUR)

````text
STAGE S4 — BUG FIXES (items T14, T15, T16, T17, T18, T19 + A2 timeout part). One stage only.

CONTEXT
- Repo: /home/user/portfolio-arena. Branch: arena/01a10c65-portfolio-arena.
- BINDING CORRECTION C1: do NOT add any "Messages are delivered via FormSubmit (third party)" line,
  or any similar third-party disclosure, under the contact form. The user rejected that suggestion.
  You MAY still add the request timeout and fix the misleading error copy.
- Six verified defects to fix (details in audit/PORTFOLIO-MASTER-BRIEF.md §5, evidence in §4).

TASKS
1. T14 — navbar tone bug + duplicate sections/glows:
   - src/lib/site.jsx: make `useSectionSignal` restore the previous tone/accent when a section
     LEAVES the middle band (track a stack or remember the last value from another intersecting
     section), so the nav can never get stuck in the wrong tone. Keep the API
     (tone, accent) -> ref unchanged for existing callers.
   - src/components/Section.jsx: add an optional `intro` slot (rendered above the children, inside
     the same <section>) so a page header can live inside the single section.
   - Rework the 5 wrapper pages in src/pages/SimplePages.jsx (Experience, Education, Certifications,
     Achievements, Contact) and src/pages/AboutPage.jsx so each page has EXACTLY ONE <Section>
     (with the PageIntro passed via `intro`) instead of a <Section> wrapping another <Section>.
     Preserve the existing background/accent per page (ivory + the same accent colour) and the
     existing visual rhythm — this must not change how the pages look.
   - Also fix the `bare` props (About/Skills/ProjectsHome/Experience/Education/Certifications/
     Achievements/Contact) so nothing renders a second section or a stray SectionHead.
   - Verify with a static render: build an esbuild script that renders each route with
     react-dom/server and count <section> elements and radial-gradient glows — expect 1 and 1
     per page. Show the before/after counts (before: /contact 2/2, /certifications 2/2, /about 2/2).
2. T15 — single scroll engine:
   - Create src/lib/scroll.jsx exposing the ONE Lenis instance via React context (provider +
     useLenis hook). src/App.jsx should create/destroy it there (still skipped under reduced motion).
   - Route change: replace `window.scrollTo({top:0})` with `lenis.scrollTo(0, { immediate: true })`.
   - Footer "Back to top": use `lenis.scrollTo(0)` (fall back to window.scrollTo when no Lenis,
     e.g. reduced motion).
   - Call `lenis.resize()` after each route renders so dimensions stay correct.
3. T16 — mobile menu:
   - src/components/Nav.jsx: while the overlay is open call lenis.stop() and on close lenis.start()
     (guard when Lenis is absent), keep the body overflow lock, add role="dialog" aria-modal="true"
     aria-label to the overlay, put the background content behind `inert`/aria-hidden while open,
     trap Tab focus inside the overlay, and return focus to the hamburger button on close
     (Escape already closes it).
4. T17 — cursor affordances:
   - src/sections/ProjectsHome.jsx: make the featured browser mockup a real <Link> to the project
     case study (it currently carries data-cursor="project" and does nothing).
   - src/sections/Certifications.jsx and src/sections/Experience.jsx (simulation cards): either wrap
     each card in a real <a href="{file}"> (preferred — bigger tap target, and the "OPEN" cursor then
     tells the truth) or downgrade the cursor attribute on genuinely non-clickable elements. Do not
     leave a "OPEN"/"VIEW" cursor on something that does nothing.
   - Keep all existing hover/spotlight styling working.
5. T18 — Hero viewport:
   - Add src/hooks/useViewport.js (width/height state, updated on resize + orientationchange).
   - src/sections/Hero.jsx OrbitVisual: use it instead of reading window.innerWidth/innerHeight
     during render. The visual behaviour must be identical, but it must not freeze after a resize
     and must not throw when rendered outside a browser (verify: rendering <Hero/> with
     react-dom/server no longer throws "window is not defined").
6. T19 + A2 — contact form robustness (src/sections/Contact.jsx):
   - Add an AbortController with a 10-second timeout to the fetch; on timeout/abort/network failure
     set the error state (button recovers, never hangs on "Sending…").
   - Fix the error copy that says "email me directly below" so it matches where the address actually
     is on the page.
   - Do NOT add the rejected third-party disclosure line (C1). Do not change the endpoint in this
     stage (bundle/privacy work is stage S7).

ACCEPTANCE CRITERIA
- Static render proof: exactly 1 section + 1 glow per route (show counts for all 7 routes).
- /contact and /certifications: scrolling to the bottom (dark content) and back to the top leaves
  the navbar in the correct tone. If you cannot run a browser, prove it by explaining the
  intersection logic and ask the user to confirm on the preview.
- One Lenis instance; no remaining direct window.scrollTo on route change or footer (grep to show it).
- Mobile menu: Lenis stopped while open, focus trapped, focus restored, inert background.
- Hero renders in SSR without throwing (show the command + output).
- Form: simulated slow/failed request recovers to the error state within ~10 s.
- `npm run build` succeeds; site otherwise visually unchanged.

REPORT + COMMIT
- Commit message: `S4: fix nav tone + duplicate sections, single Lenis scroll, mobile menu a11y, cursor affordances, hero viewport, form timeout`.
- Report per item with evidence, anything unverified, then: "S4 done — next: S5 accessibility."
````

---

## S5 — ACCESSIBILITY

````text
STAGE S5 — ACCESSIBILITY (items T25, T26, T5, T7, T12). One stage only.

CONTEXT
- Repo: /home/user/portfolio-arena. Branch: arena/01a10c65-portfolio-arena.
- Five WCAG-AA contrast failures were MEASURED. The replacement values in
  audit/PORTFOLIO-MASTER-BRIEF.md §6.2 are already computed and verified — use them verbatim, do not
  invent new colours and do not re-derive.
- Goal: meet AA without changing the art direction ("Signal & Ink"). These are small darkening
  steps, not a redesign.

TASKS
1. T25 — contrast fixes:
   a) tailwind.config.js: `muted: '#667085'` -> `'#5B6474'`.
   b) tailwind.config.js: add `'cobalt-ink': '#1D4ED8'` (for accent text on LIGHT backgrounds only;
      keep bright `cobalt` for dark backgrounds).
   c) src/index.css base layer: focus ring — light sections use an ink ring, dark sections keep cyan.
      Simplest correct approach: default `:focus-visible { outline: 2px solid #10162B; outline-offset: 3px; }`
      and for `.dark-zone :focus-visible { outline-color: #27D3F2; }` (remove/replace the current
      ring-cyan utilities so the ring is always visible). Verify contrast: ink on ivory = 16.03:1,
      cyan on deep = 9.65:1.
   d) Primary CTA buttons that are indigo with ivory text (Hero "View projects", Nav shell, anywhere
      `bg-indigo` + `text-ivory`): change the resting background to `#5A4BD4` (hover can stay
      `#5a4bd4` or go slightly deeper). Ivory on #5A4BD4 = 5.54:1.
   e) src/sections/Contact.jsx inputs: border `border-ivory/20` -> `border-ivory/45`;
      placeholder `placeholder:text-fog/50` -> `placeholder:text-fog/80`.
   f) src/sections/Achievements.jsx CHIP coordination: `text-[#0e7d90]` -> `text-[#0b6b7c]`.
   g) Any `text-muted/80` micro-note on light backgrounds -> full `text-muted` (do not use opacity).
   h) Where small accent text sits on light backgrounds, prefer the new `cobalt-ink`
      (e.g. src/sections/Experience.jsx simulation labels, src/pages/SimplePages.jsx). Coral is
      decorative only on light backgrounds: keep it for icons/marks that are not the sole carrier of
      information, and darken where it is text.
2. T26 — heading order: every route must produce h1 -> h2 -> h3 without skipping a level.
   - Static render shows /experience, /education, /certifications, /achievements, /contact currently
     jump from h1 straight to h3 (their page intro is an h1 and the section head is absent because
     those pages render "bare").
   - Fix by rendering the section heading on those pages (preferred — reuses SectionHead, which is
     an h2 with a proper id) OR by demoting the entry titles to h2 when no section head is present.
     Keep exactly one h1 per page and keep the visual design identical.
   - Verify with a static render that prints the heading outline per route.
3. T5 — src/components/Marquee.jsx: the duplicate row must be hidden from assistive tech. Currently
   only the second row carries aria-hidden. Hide BOTH rows from the a11y tree and expose the words
   once for screen readers (an sr-only list, or aria-hidden on the visual rows plus a single
   sr-only sentence). Do not change the visual animation.
4. T7 — src/pages/SimplePages.jsx AchievementsPage: the PageIntro accent is coral while the section
   is lime. Align the page intro accent with the section accent (lime) so the one-accent rule holds.
   (If you think coral was intentional, report instead of changing — but the design doc says one accent.)
5. T12 — unguarded lookups: add safe fallbacks so a data change can never break the UI:
   - src/sections/Achievements.jsx: TILE[item.id] / CHIP[item.id] -> fall back to a sensible default
     tile/chip style and log nothing in production.
   - src/sections/Skills.jsx: accentText[g.accent] / hoverBg[g.accent] -> fallback.
   - src/sections/Certifications.jsx: accentText[cert.accent] / tileBorder[cert.accent] -> fallback.
   - src/components/SectionHead.jsx: accentBg[accent] -> fallback.
   Prove it: temporarily add a fake achievement/skill with an unknown id/colour, confirm the page
   still renders, then revert the temporary data.

ACCEPTANCE CRITERIA
- Re-measure and report the contrast ratios after the change (at minimum: muted on ivory/tint/paper,
  ivory on the new button background, focus ring on light and dark, form border + placeholder, teal chip).
  All must meet 4.5:1 for text and 3:1 for UI/focus.
- Heading outline per route: exactly one h1, no skipped levels (show the outline).
- Marquee: screen reader text appears once (show the DOM).
- Unknown ids/colours render with fallbacks (evidence captured, temporary data reverted).
- DESIGN.md: update the two incorrect contrast claims if S9 is not yet done (muted and indigo numbers)
  so the doc matches reality — otherwise leave it for S9 and say so.
- `npm run build` succeeds; visual diff is limited to the small darkening of secondary text/buttons.

REPORT + COMMIT
- Commit message: `S5: meet WCAG AA (focus ring, muted, cobalt-ink, CTA, form borders, chips), heading order, marquee a11y, guarded lookups`.
- Report the measured before/after table, the heading outlines, anything unverified.
  Then say: "S5 done — next: S6 performance."
````

---

## S6 — PERFORMANCE

````text
STAGE S6 — PERFORMANCE (items T31, T32, T30, T10). One stage only.

CONTEXT
- Repo: /home/user/portfolio-arena. Branch: arena/01a10c65-portfolio-arena.
- Measured baseline (production build): JS 519.81 kB in ONE file (gzip 160.26, Vite warns >500 kB),
  CSS 50.39 kB (gzip 14.44), 14 woff2 = 214 kB, dist = 12 MB.
- Pre-tested WebP result (brief §6.4): lossless WebP is a 49% win for the 7 PNG-backed BMW files and
  a 95% LOSS (2x bigger) for the 9 JPEG-backed Coding Ninjas files. So: convert ONLY the PNG group.
  For the JPEG group the default is to keep JPEG; only use lossy WebP if the user has approved it
  (ask, do not assume).

TASKS
1. T31 — route-level code splitting:
   - Convert route components in src/App.jsx to React.lazy + <Suspense> (keep Home eager so the hero
     paints immediately), with a lightweight fallback that matches the site (no blocking loader).
   - Add a `build` section to vite.config.js: target 'es2020', explicit chunk naming,
     chunkSizeWarningLimit raised only if justified, and keep sourcemaps off for production
     (or 'hidden' if the user prefers).
   - Report the new bundle table (per-chunk kB + gzip) and state clearly how much first-load JS the
     home route now needs versus before (519.81 kB / 160.26 kB gzip baseline).
   - Verify every route still loads (static render or preview navigation) and that the route
     transition animation still works.
2. T32 — images + fonts:
   - Convert the 7 BMW screenshots (currently .png) to lossless WebP with libwebp
     (Pillow: `save(..., 'WEBP', lossless=True, quality=100, method=5)`), keep the ORIGINAL .png files
     in the repo as fallback sources, and update the data to the WebP paths.
   - Implement the images with <picture> (WebP source + original fallback) and add `srcset` at two
     widths (e.g. 700w and 1400w) generated from the originals; add explicit width/height attributes
     (dimensions are listed in brief §6.3) to remove layout shift.
   - Coding Ninjas (JPEG-backed): keep JPEG, but add width/height + `decoding="async"` +
     `loading="lazy"` (lazy already exists in places — make it consistent below the fold only).
   - Fonts: import only the latin subsets needed. Current imports in src/main.jsx pull all subsets of
     the three variable fonts (14 files, 214 kB). Import the latin-only files and preload the two
     fonts used above the fold in index.html. If a subset file for a language is genuinely needed,
     keep it — otherwise drop.
   - Optionally (ask first, show a before/after legibility comparison): recompress the images INSIDE
     ysf-internship-certificate.pdf — it is 4.43 MB of embedded imagery; metadata work is already done
     in S2 and does not shrink it.
3. T30 — aspect fix for the sticky story: the CN screenshots are ~2.2:1 in an `aspect-[16/10]` box with
   object-cover object-top. Ask the user whether to retune the story viewport for the wide shots
   (e.g. aspect-[2/1]); implement only if they agree.
4. T10 — src/sections/ProjectsHome.jsx: guard the featured-project GitHub button so it does not render
   `href={null}` when a project has no repo (render the "source not published" style instead).

ACCEPTANCE CRITERIA
- `npm run build` output table before/after; first-load JS reduced substantially (report the exact numbers).
- Every route renders after the split (no blank screens, no console errors).
- Images: same visual appearance, correct paths, width/height present, no layout shift
  (verify by inspecting rendered HTML for width/height and by the file sizes).
- WebP savings table (per file + total) and confirmation that originals are still in the repo.
- Font payload reduced (report the number of font files shipped and total kB).
- `npm run check:meta` still passes (S2 verifier) — new/derived assets must not reintroduce metadata.

REPORT + COMMIT
- Commit message: `S6: route code splitting, lossless WebP + srcset for BMW screenshots, latin-only fonts, image dimensions, guard featured repo link`.
- Report: before/after tables (JS, fonts, images, total dist), anything unverified, any decision pending.
  Then say: "S6 done — next: S7 discoverability."
````

---

## S7 — DISCOVERABILITY & PRIVACY

````text
STAGE S7 — DISCOVERABILITY & PRIVACY (items T27, T28, T29, T20). One stage only.

CONTEXT
- Repo: /home/user/portfolio-arena. Branch: arena/01a10c65-portfolio-arena. Deploy target: Vercel.
- Today: no og:image / twitter:image / og:url / canonical (a shared link shows no preview), and
  Home calls usePageMeta(null, ...) which OVERWRITES the carefully written static title+description
  from index.html. No robots.txt, no sitemap.xml, no manifest. The contact recipient Gmail is baked
  into the public JS bundle.

TASKS
1. T27 — social + canonical:
   - Add to index.html: og:url, og:image (+ og:image:width/height/alt), twitter:image,
     twitter:card (summary_large_image), and <link rel="canonical">.
   - Generate public/og-cover.png at 1200x630 in the site's own design language (ivory/ink, the
     wordmark, the headline "Computer Science student building with Software, Web & Generative AI",
     indigo/cyan accents). It must be a real asset, not a placeholder. If you cannot generate imagery
     in the environment, say so and provide the exact construction instructions instead of shipping
     a broken tag.
   - Stop Home from clobbering the static meta: src/pages/Home.jsx / src/hooks/usePageMeta.js should
     leave the index.html title+description intact on '/'.
2. T28 — public/robots.txt (allow all, point to the sitemap) and public/sitemap.xml listing the 9 real
   routes with a single canonical origin placeholder that the user must set (flag it clearly).
3. T29 — public/site.webmanifest (name, short_name, description, theme_color #F6F2E8, background_color,
   display standalone, icons) + an Apple touch icon (180x180, derived from the favicon design,
   ink background + the wordmark) + the matching <link> tags in index.html.
4. T20 — reduce the exposed email in the bundle:
   - src/sections/Contact.jsx: move the endpoint behind an env-driven config
     (import.meta.env.VITE_CONTACT_ENDPOINT) with a safe fallback, and switch to FormSubmit's
     alias/hashed endpoint form so the literal address does not appear in the built JS.
   - BINDING CORRECTION C1 still applies: do NOT add any third-party disclosure line under the form.
   - Add .env.example documenting VITE_CONTACT_ENDPOINT (and ensure .gitignore from S0 already covers .env*).
   - Verify by grepping the built bundle: `grep -r "<the inbox address>" dist/` must return nothing.

ACCEPTANCE CRITERIA
- Built dist/index.html contains the new meta tags; canonical + og:image resolve to real files.
- robots.txt + sitemap.xml are present in dist/ and syntactically valid.
- Manifest + apple icon present and linked; Lighthouse-style checks would not error on them.
- `grep -r "<the inbox address>" dist/` returns nothing while the form still posts successfully
  (test the request path or explain exactly how to activate the alias).
- Home route keeps the rich static title/description (show the rendered <title> + meta for '/').
- `npm run build` succeeds; nothing else changes visually.

REPORT + COMMIT
- Commit message: `S7: social preview + canonical, robots/sitemap, web manifest + apple icon, move contact endpoint out of the bundle`.
- Report: files added/changed, the bundle grep proof, the canonical origin the user must set,
  anything unverified. Then say: "S7 done — next: S8 positioning."
````

---

## S8 — POSITIONING: FULL STACK DEVELOPMENT AS EXPERTISE (binding user correction C3)

````text
STAGE S8 — POSITIONING: FULL STACK AS EXPERTISE (user correction C3). One stage only.

CONTEXT
- Repo: /home/user/portfolio-arena. Branch: arena/01a10c65-portfolio-arena.
- BINDING USER INSTRUCTION (C3): the site must present FULL STACK DEVELOPMENT as an EXPERTISE AREA,
  not as something being learned. Today the site never claims it, while the user's CV headline lists
  "Full Stack Development" — the two contradict each other, and the site docs even say learning topics
  are never shown as expertise. C3 resolves that in favour of expertise.
- HARD LIMIT: do not invent technologies, frameworks, years, metrics, companies or counts. The
  Full Stack group may only contain technologies already present in src/data (frontend: HTML, CSS,
  JavaScript, React, Tailwind CSS, Vite; server-side & data: Python, Java, SQL, DBMS/RDBMS;
  tooling: Git, GitHub). Do NOT name Node/Express/Django/Flask unless the user confirms it —
  ask if the claim needs a named backend framework and wait for the answer before adding it.
- Keep the third-party protections EXACTLY as they are: "Website Recreation" labels, "Virtual Job
  Simulation — not employment", and the "no affiliation/endorsement implied" wording. Those are about
  other companies, not about self-assessment, and must not be weakened.

TASKS
1. src/data/skills.js: add a new skill group "Full Stack Development" (built only from the technologies
   above), with a short honest `note` (e.g. "End-to-end: interface, logic and data — project-built"),
   an accent from the existing set, and renumber the group indexes so the displayed order stays
   sequential (01…07). Do not touch the `coursework` list.
2. src/data/profile.js: reflect the positioning where it is honest and consistent:
   - add a `facts` entry or adjust an existing one so the hero micro-facts mention Full Stack
     Development (do not exceed four facts);
   - keep `headline` unless you propose a change and the user approves it (report as a proposal,
     do not apply silently);
   - keep the `currentlyExploring` chips for infrastructure topics (Linux, Docker, hosting, APIs)
     as they are — C3 was about full stack, not about removing the learning framing everywhere.
3. src/sections/About.jsx and/or src/sections/Skills.jsx: make the positioning legible — the skills
   section must show Full Stack Development as a first-class group, and the About copy may name it.
   Keep the existing visual language (no new components).
4. Docs consistency (this is part of C3, not optional):
   - README.md: update the "Honesty policy baked into the content" section so it no longer says
     learning topics are never presented as expertise; state instead that Full Stack Development is
     claimed as an expertise area, while the recreation labels, the simulation labels and the
     no-affiliation statements remain in force.
   - UPDATE_GUIDE.md: same correction, in the checklist wording.
   - DESIGN.md: no change needed (it is about visuals) — but if it repeats the honesty claim, align it.
5. Report the exact final skill-group order and the wording you used, so the user can approve the claim.

ACCEPTANCE CRITERIA
- Skills section renders 7 groups with sequential indexes, Full Stack Development among them,
  containing only technologies already present in the data.
- No invented technology, framework, year, metric or employer anywhere.
- README.md and UPDATE_GUIDE.md contain no statement that contradicts the new positioning.
- Recreation/simulation/no-affiliation labels untouched (show a diff summary proving they are intact).
- `npm run build` succeeds; layout unchanged apart from the new group.

REPORT + COMMIT
- Commit message: `S8: present Full Stack Development as an expertise area; align README/UPDATE_GUIDE honesty wording`.
- Report: the new group content, the final index order, doc changes, the open question about naming a
  backend framework, anything unverified. Then say: "S8 done — next: S9 hygiene & content."
````

---

## S9 — HYGIENE, CONTENT & TESTS

````text
STAGE S9 — HYGIENE, CONTENT & TESTS (items T6, T8, T11, T13, T23, T33, T34). One stage only.

CONTEXT
- Repo: /home/user/portfolio-arena. Branch: arena/01a10c65-portfolio-arena.
- ASK FIRST (do not invent): the user must supply the year for the badminton achievement (T6).
  If they have not supplied it by the time you reach it, skip that single item, note it, and continue.

TASKS
1. T6 — src/data/achievements.js: add the missing year to the badminton entry (use only the year the
   user provides; if none, leave it out and report).
2. T8 — cursor/design mismatch: DESIGN.md §7 says the rail cursor label is "SCROLL →" while
   src/components/Cursor.jsx uses "SWIPE →". Ask the user which one wins, or (default) make the code
   match the design doc. State what you did.
3. T11 — remove stale hardcoded copy:
   - src/pages/ProjectsPage.jsx "Two recreations, one obsession" -> derive the count from the data
     (e.g. `${projects.length} recreations`) without breaking the editorial line break;
   - src/sections/ProjectsHome.jsx "Project 02" -> derive the index from the data;
   - any other hardcoded project/section count you find while doing this.
   Prove it: temporarily add a third project to the data, confirm the copy updates, then revert.
4. T13 — DESIGN.md corrections: the muted contrast claim ("5.0:1" -> the measured value after S5)
   and the indigo claim ("4.6:1" -> measured). Also fix or implement the claim that Lenis is paused
   when the tab is hidden (either implement a visibilitychange pause or correct the document —
   recommend implementing it, it is a few lines and matches the doc).
5. T23 — qa/shoot.mjs: wire it to npm as `"qa": "node qa/shoot.mjs"`, replace the hardcoded
   `/home/user/qa` output path with a path inside the repo (e.g. qa/screens/ — already gitignored in S0),
   and fix the overflow check: `document.documentElement.scrollWidth - window.innerWidth` is defeated by
   `body { overflow-x: clip }`. Measure overflow on `document.body.scrollWidth` (or compare against
   `document.body.getBoundingClientRect().width`) so real horizontal overflow is actually detected.
   Add the BMW project detail page to the shoot list so the S1 mix-up class of bug is caught.
6. T33 — tooling: add ESLint (flat config, with react + react-hooks plugins) and Prettier, plus scripts
   `"lint": "eslint ."`, `"format": "prettier --write ."`. Run lint once and fix only real errors —
   do not reformat the whole codebase in this stage (that would bury the diff). Report the lint output.
7. T34 — Playwright smoke tests in tests/smoke.spec.js (and `"test": "playwright test"`):
   - every route renders without console errors;
   - no horizontal overflow at 320/375/768/1440;
   - each project detail page shows ITS OWN screenshots: assert that the images on
     /projects/coding-ninjas resolve under /projects/coding-ninjas/ and the same for /projects/bmw
     (this is the regression guard for the S1 fix);
   - the 404 route and the host 404 render the branded page.
   Note: browser downloads may be unavailable in the environment — if so, still commit the tests,
   document how to run them (`npx playwright install chromium && npm test`), and say clearly that
   they were not executed.

ACCEPTANCE CRITERIA
- `npm run lint` runs and reports no errors (warnings allowed, listed).
- `npm run qa` and `npm test` exist and are documented in README (how to install browsers and run).
- The stale-copy proofs are captured and the temporary data is reverted.
- DESIGN.md no longer contradicts the implementation (contrast numbers + the Lenis claim).
- `npm run build` succeeds; no visual change.

REPORT + COMMIT
- Commit message: `S9: content nits, DESIGN.md corrections, npm-wired QA + overflow fix, ESLint/Prettier, smoke tests`.
- Report: each item, what was verified versus not executed, the open badminton-year question.
  Then say: "S9 done — next: S10 Tailwind 4 (isolated, last)."
````

---

## S10 — TAILWIND 4 MIGRATION (ISOLATED, LAST)

````text
STAGE S10 — TAILWIND 4 MIGRATION (item T35). Run only after the user has committed S0–S9 to main.
One stage only. This is the only breaking change in the programme.

CONTEXT
- Repo: /home/user/portfolio-arena. Branch: arena/01a10c65-portfolio-arena (or a fresh branch off the
  user's updated main if they ask — follow their instruction).
- Reason for this stage: `npm audit` reports 5 high advisories (braces, chokidar, micromatch, fast-glob,
  tailwindcss) — all dev/build-only, all in the Tailwind 3 tooling chain. Shipped dependencies are clean.
  Tailwind 4 removes that chain, which is the only way to clear the advisories.
- This is a config-layer migration, NOT a rewrite: class names in JSX stay. Scope:
  * src/index.css: `@tailwind base/components/utilities` -> `@import "tailwindcss";`
  * tokens: either move tailwind.config.js into CSS `@theme { ... }`, or keep the JS config and load it
    with `@config "./tailwind.config.js";` (the lower-risk compatibility path — choose this unless the
    user asks for the modern form)
  * postcss.config.js + package.json: `@tailwindcss/postcss` (or the `@tailwindcss/vite` plugin)
  * custom utilities (bg-grid-light, bg-grid-dark, bg-dots-dark, noise-layer, mask-line, spotlight,
    underline-slide, edge-fade-x) -> `@utility` or plain CSS in a layer
  * audit for v4 renames: default border colour becomes currentColor, default ring width 3px -> 1px,
    shadow/rounded renames, bg-opacity-* -> slash syntax.

PROCEDURE (follow in order, report after each step)
1. Before touching anything: `npm run build` and record the CURRENT bundle numbers + take the QA
   screenshots (qa/shoot.mjs) at 375/768/1440 for every route. These are the "before" baseline.
2. Create the migration on a branch (or on the session branch if the user says so). Commit the config
   migration separately from any follow-up fixes so a revert is surgical.
3. Migrate per the scope list. Then `npm run build` and compare bundle numbers.
4. Fix regressions one at a time; after each, re-run the build and the QA screenshots.
5. Produce a before/after table: routes checked, anything that changed visually (borders, rings,
   shadows are the likely candidates), and the bundle delta.
6. `npm audit` must now report 0 vulnerabilities in the tailwind chain (show the output).
7. If ANY unresolved visual regression remains, STOP, report it with evidence, and recommend
   `git revert` of the migration commit rather than shipping it.

ACCEPTANCE CRITERIA
- `npm audit` shows no advisories in the tailwind/dependency chain (or only ones unrelated to it, listed).
- Every route renders identically to the before-screenshots (the user confirms the visuals; state plainly
  that your verification is code + build + their screenshots).
- `npm run build` succeeds; bundle size is not worse.
- `npm run lint`, `npm run check:meta` and the smoke tests still pass.
- One isolated commit, revertible without touching any other stage.

REPORT + COMMIT
- Commit message: `S10: migrate Tailwind 3.4 -> 4 (config layer), clears 5 dev-only advisories`.
- Report: the before/after table, the audit output, anything the user must eyeball, and an explicit
  statement of what a revert would need to undo. Then summarise the whole programme's status
  (which stages are done, which remain).
````

---

*End of Part B. Keep this file together with `PORTFOLIO-MASTER-BRIEF.md` in `audit/`.*
