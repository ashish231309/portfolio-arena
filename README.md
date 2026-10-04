# Ashish Kumar — Interactive Portfolio

Personal portfolio of **Ashish Kumar**, a Computer Science & Engineering student (Kanpur Institute of Technology, AKTU) building with **Software, Web & Generative AI**.

Design identity: **“Signal & Ink”** — editorial typography on warm ivory, deep-ink contrast fields, a violet→cyan brand axis with coral/lime sparks, orbital/signal-line motifs, a spring-physics custom cursor with trail, magnetic CTAs, Lenis smooth scrolling and scroll-linked storytelling. The full design system lives in [`DESIGN.md`](./DESIGN.md).

> Not a template. Every section, motion and cursor state is hand-built with Motion for React + CSS.

---

## Stack

- **React 19** + **Vite 8** (JavaScript/JSX, no TypeScript)
- **Tailwind CSS 3.4** (custom token layer in `tailwind.config.js`)
- **Motion for React** (`motion`) — springs, scroll-linked & triggered animation, route transitions
- **Lenis** — inertial smooth scrolling (disabled under `prefers-reduced-motion`)
- **Lucide React** — icons
- Self-hosted variable fonts: Space Grotesk (display), Manrope (body), JetBrains Mono (micro labels)

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Routes

| Route | Content |
|---|---|
| `/` | Full narrative homepage (hero → about → skills → projects → experience → education → certifications → achievements → contact) |
| `/about` | About + currently exploring |
| `/projects` | Project index |
| `/projects/coding-ninjas` | Featured case study (React 19 + Vite 8 + Tailwind 3.4 recreation) |
| `/projects/bmw` | Case study (HTML/CSS/JS multi-page recreation) |
| `/experience` | Internships + Forage virtual job simulations (clearly labelled) |
| `/education` | B.Tech (KIT/AKTU) + CBSE schooling |
| `/certifications` | Public digital credential rail |
| `/achievements` | NCC, sport, coordination activities |
| `/contact` | Contact form (FormSubmit), email, socials |

## Where personal data lives

All content is data-driven — edit these files, never the components:

```
src/data/profile.js         name, socials, email, headline, exploring list
src/data/skills.js          skill groups + coursework
src/data/projects.js        projects, galleries, implementation notes
src/data/experience.js      internships + virtual job simulations
src/data/education.js       degree + school records
src/data/certifications.js  digital credentials (provider, dates, files)
src/data/achievements.js    NCC / sport / coordination + traits
```

## Where assets live

```
public/resume.pdf                       résumé (Download Resume CTA)
public/projects/coding-ninjas/cn-*.png  featured project screenshots
public/projects/bmw/bmw-*.jpeg          BMW recreation screenshots
public/certificates/*.pdf               PUBLIC digital certificates only
public/favicon.svg                      brand mark
```

⚠️ **Physical certificates (NCC B/C, school & college sport) are intentionally NOT in `public/`.** They are represented as text under Activities only. Do not add their images/files to `public/`.

## Contact form

Uses [FormSubmit](https://formsubmit.co) AJAX endpoint (`src/sections/Contact.jsx`) — no secrets in frontend code, honeypot spam protection, inline validation, loading/success/error states. The first submission sends an activation email to the inbox owner once.

## Updating content — quick guide

See [`UPDATE_GUIDE.md`](./UPDATE_GUIDE.md).

## Honesty policy baked into the content

- Recreations are labelled **“Website Recreation”** (no affiliation/endorsement implied).
- Forage entries are labelled **Virtual Job Simulation — not employment**.
- Learning topics (Docker, Linux, deployment, APIs) are shown as *exploring*, never as production expertise.
- No invented metrics, users, testimonials, deployments or repository links.

## License

MIT — see [LICENSE](./LICENSE).
