# UPDATE GUIDE — how to keep this portfolio truthful & consistent

Everything editable lives in `src/data/*.js` and `public/`. Components read from data only.

## 1. Personal basics
`src/data/profile.js`
- `name`, `headline`, `location`, `coordinates`, `email`
- `social.*` — only real public profiles
- `currentlyExploring` — learning topics (rendered as dashed chips; keep the “learning, not expertise” framing)
- `facts` — the four hero micro-facts

## 2. Add / edit a project
`src/data/projects.js`
1. Add an object: `slug, title, category, label ('Website Recreation'), year, tech[], github|null, live|null, status[], summary, description[], implementation[], gallery[]`.
2. Put screenshots in `public/projects/<slug>/` — that folder holds **only** that project's files — and
   name them `<project-slug>-NN-<content>.<ext>`, e.g. `coding-ninjas-03-course-rails.jpeg` or
   `bmw-01-hero-5-series.png`. `NN` is the two-digit order (01, 02, 03 …); `<content>` says which
   section the image shows.
3. Reference each one as `/projects/<slug>/<file>` in that project's `gallery[]`: **one gallery array
   per project, in page order**, every screenshot referenced exactly once. Each item is
   `{ src, alt, label }` — `alt` must describe **what is actually visible** in the image, and `label`
   is the short caption shown by the home sticky story (read from data, not hardcoded).
4. `scrollFrames` maps the home sticky-story blocks to gallery indices — update it when the gallery grows or shrinks.
5. Rules: no fake live-demo button (`live: null`), recreation label always present, GitHub only if the repo is public.

## 3. Experience & simulations
`src/data/experience.js`
- `experience[]` = real roles only (period, type, points, tags, optional certificate PDF).
- `simulations[]` = Forage-style job simulations. Never merge the two lists; the UI labels simulations as **not employment**.
- Never invent metrics (reach %, followers, revenue, post counts).

## 4. Education
`src/data/education.js` — degree block + `school[]`. Coursework chips live in `src/data/skills.js → coursework` (academic, not expertise claims).

## 5. Certifications
`src/data/certifications.js`
- Add: provider, exact title, exact received date (from the certificate), credential id/score **only if printed on the certificate**, `file` path, `accent`, `blurb`.
- Copy the PDF to `public/certificates/` with a kebab-case name.
- **Physical certificates never go in `public/`.** Represent them as text in `src/data/achievements.js`.

## 6. Achievements & activities
`src/data/achievements.js`
- `achievements[]`: `kind, title, period, body, highlights[]`, tile id must exist in `src/sections/Achievements.jsx` TILE map (`ncc, marathon, badminton, basketball, coordination`).
- State participation as participation; results only where a real result exists (e.g. First Runner-Up).

## 7. Resume
Replace `public/resume.pdf`. Filename must stay `resume.pdf` (CTAs point to it).

## 8. Design tokens
- Colors / fonts / radii / shadows / keyframes: `tailwind.config.js`
- Principles & rules: `DESIGN.md` (source of truth — read before adding new component styles)
- Section background rhythm: each `<Section bg=... accent=...>` in `src/sections/*` and `src/pages/*`

## 9. Contact form
`src/sections/Contact.jsx` → `FORM_ENDPOINT`. Swap provider freely (Web3Forms/EmailJS) but keep: validation, honeypot, loading/success/error states, no secrets in the bundle.

## 10. Before publishing any change — checklist
- [ ] Is every claim supported by a supplied source (resume/certificate/repo)?
- [ ] Any new link real and public?
- [ ] Recreations still labelled? Simulations still labelled?
- [ ] No physical certificate files added to `public/`?
- [ ] `npm run build` passes?
- [ ] Checked at 375px and 1440px (no overflow, no clipped type)?
