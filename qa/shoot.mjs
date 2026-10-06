import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

/**
 * QA screenshot pass. Run the dev server first, then `npm run qa`.
 *
 *   npm run dev            # terminal 1
 *   npm run qa             # terminal 2
 *
 * Screenshots land in `qa/screens/` (gitignored). Point it at another origin
 * with `QA_BASE=http://localhost:4173 npm run qa` for a `npm run preview` build.
 */
const BASE = process.env.QA_BASE || 'http://localhost:5173'
// Output lives inside the repo, next to this script — never an absolute home path.
const OUT_DIR = fileURLToPath(new URL('./screens/', import.meta.url))
mkdirSync(OUT_DIR, { recursive: true })
const out = (n) => join(OUT_DIR, `${n}.png`)

/**
 * Horizontal-overflow probe.
 *
 * `body { overflow-x: clip }` (src/index.css) stops `scrollWidth` from ever
 * growing — on the document element AND on body — so a scrollWidth delta alone
 * reports 0 even when something really sticks out past the viewport. We still
 * record those numbers, but the gate is the element scan below: any box whose
 * rect crosses the viewport edge with no scrollable/clipping ancestor of its
 * own is real overflow (the credential rail is contained by its own scroller,
 * so it never trips this).
 */
const measureOverflow = (page) =>
  page.evaluate(() => {
    const vw = window.innerWidth
    const doc = document.documentElement
    const body = document.body
    const contained = (el) => {
      for (let p = el.parentElement; p && p !== doc; p = p.parentElement) {
        const cs = getComputedStyle(p)
        const ox = cs.overflowX
        if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') {
          const pr = p.getBoundingClientRect()
          if (pr.right <= vw + 1 && pr.left >= -1) return true
        }
      }
      return false
    }
    const offenders = []
    for (const el of body.querySelectorAll('*')) {
      const cs = getComputedStyle(el)
      // Decorative layers (glows, marquee ghosts) are pointer-events:none + aria-hidden.
      if (cs.pointerEvents === 'none' && el.closest('[aria-hidden="true"]')) continue
      const r = el.getBoundingClientRect()
      if (r.width < 2 || r.height < 2) continue
      if (r.right <= vw + 1 && r.left >= -1) continue
      if (contained(el)) continue
      const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''
      offenders.push(`${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''} [${Math.round(r.left)}→${Math.round(r.right)}]`)
      if (offenders.length >= 5) break
    }
    return {
      viewport: vw,
      docOverflow: Math.round(doc.scrollWidth - vw),
      bodyOverflow: Math.round(body.scrollWidth - vw),
      bodyRectWidth: Math.round(body.getBoundingClientRect().width),
      offenders,
    }
  })

const browser = await chromium.launch()
const failures = []

async function shoot(name, { width, height, path = '/', steps = [], full = false }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2400) // intro + fonts
  for (const step of steps) {
    if (step.scroll) await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), step.scroll)
    if (step.selector) await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'start' }), step.selector)
    await page.waitForTimeout(step.wait || 1200)
  }
  await page.screenshot({ path: out(name), fullPage: full })
  const o = await measureOverflow(page)
  const bad = o.offenders.length > 0 || o.bodyOverflow > 1 || o.docOverflow > 1
  if (bad) failures.push(`${name} (${path} @${width}px): ${o.offenders.join(', ') || `scrollWidth +${Math.max(o.bodyOverflow, o.docOverflow)}px`}`)
  if (errors.length) failures.push(`${name}: ${errors.slice(0, 3).join(' | ')}`)
  console.log(
    `${name} [${width}px ${path}] overflowX: doc=${o.docOverflow}px body=${o.bodyOverflow}px` +
      `${o.offenders.length ? ` OFFENDERS: ${o.offenders.join(', ')}` : ' clean'}` +
      ` errors=${errors.length ? errors.slice(0, 3).join(' | ') : 'none'}`,
  )
  await ctx.close()
}

// desktop home — key moments
await shoot('home-hero', { width: 1440, height: 900, path: '/' })
await shoot('home-about', { width: 1440, height: 900, path: '/', steps: [{ selector: '#about', wait: 1400 }] })
await shoot('home-skills', { width: 1440, height: 900, path: '/', steps: [{ selector: '#skills', wait: 1400 }] })
await shoot('home-projects', { width: 1440, height: 900, path: '/', steps: [{ selector: '#projects', wait: 1600 }] })
await shoot('home-experience', { width: 1440, height: 900, path: '/', steps: [{ selector: '#experience', wait: 1400 }] })
await shoot('home-certs', { width: 1440, height: 900, path: '/', steps: [{ selector: '#certifications', wait: 1400 }] })
await shoot('home-achievements', { width: 1440, height: 900, path: '/', steps: [{ selector: '#achievements', wait: 1400 }] })
await shoot('home-contact', { width: 1440, height: 900, path: '/', steps: [{ selector: '#contact', wait: 1400 }] })

// project detail — BOTH projects (the S1 mix-up class of bug: a page showing
// the other project's screenshots; see tests/smoke.spec.js for the hard assert)
await shoot('project-cn', { width: 1440, height: 900, path: '/projects/coding-ninjas', steps: [{ scroll: 900, wait: 1400 }] })
await shoot('project-bmw', { width: 1440, height: 900, path: '/projects/bmw', steps: [{ scroll: 900, wait: 1400 }] })

// mobile
await shoot('mob-hero', { width: 390, height: 844, path: '/' })
await shoot('mob-projects', { width: 390, height: 844, path: '/', steps: [{ selector: '#projects', wait: 1500 }] })
await shoot('mob-certs', { width: 390, height: 844, path: '/', steps: [{ selector: '#certifications', wait: 1400 }] })

// tiny + tablet overflow checks
for (const [w, h] of [[320, 700], [375, 800], [430, 900], [768, 1024], [1024, 800], [1920, 1000]]) {
  await shoot(`chk-${w}`, { width: w, height: h, path: '/', steps: [{ scroll: 2600, wait: 900 }] })
}

await browser.close()

if (failures.length) {
  console.error(`\nQA FAILED — ${failures.length} problem(s):`)
  for (const f of failures) console.error(`  · ${f}`)
  process.exitCode = 1
} else {
  console.log(`\nQA complete — screenshots in qa/screens/, no overflow or console errors detected`)
}
