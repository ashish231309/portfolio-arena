import { test, expect } from 'playwright/test'

/**
 * Smoke tests — the safety net the S1 screenshot mix-up (a project page showing
 * the *other* project's images) would have caught.
 *
 *   npx playwright install chromium   # once per machine
 *   npm test                          # builds + serves dist/ itself via playwright.config.js
 *
 * `QA_BASE=http://localhost:5173 npm test` runs them against your own dev server.
 */

const ROUTES = [
  '/',
  '/about',
  '/projects',
  '/projects/coding-ninjas',
  '/projects/bmw',
  '/experience',
  '/education',
  '/certifications',
  '/achievements',
  '/contact',
]

/** Same probe as qa/shoot.mjs: `body { overflow-x: clip }` defeats scrollWidth,
 *  so anything that crosses the viewport edge without a scrollable/clipping
 *  ancestor of its own counts as real overflow. */
const measureOverflow = (page) =>
  page.evaluate(() => {
    const vw = window.innerWidth
    const doc = document.documentElement
    const body = document.body
    const contained = (el) => {
      for (let p = el.parentElement; p && p !== doc; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX
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
      if (cs.pointerEvents === 'none' && el.closest('[aria-hidden="true"]')) continue
      const r = el.getBoundingClientRect()
      if (r.width < 2 || r.height < 2) continue
      if (r.right <= vw + 1 && r.left >= -1) continue
      if (contained(el)) continue
      const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''
      offenders.push(`${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''}`)
      if (offenders.length >= 5) break
    }
    return {
      overflow: Math.max(body.scrollWidth, doc.scrollWidth) - vw,
      offenders,
    }
  })

function collectErrors(page) {
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })
  return errors
}

test.describe('routes render cleanly', () => {
  for (const route of ROUTES) {
    test(`${route} renders one h1 with no console errors`, async ({ page }) => {
      const errors = collectErrors(page)
      await page.goto(route)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('h1')).toBeVisible()
      expect(errors, `console/page errors on ${route}`).toEqual([])
    })
  }
})

test.describe('no horizontal overflow', () => {
  const widths = [320, 375, 768, 1440]
  // Full sweep on the home page, plus the two detail pages and the rail-heavy
  // credentials page where a rail regression would show up first.
  const routes = ['/', '/projects/coding-ninjas', '/projects/bmw', '/certifications']

  for (const width of widths) {
    for (const route of routes) {
      test(`${route} @ ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(route)
        await page.waitForTimeout(1200) // let reveals settle before measuring
        const { overflow, offenders } = await measureOverflow(page)
        expect(offenders, `elements crossing the viewport edge on ${route} @ ${width}px`).toEqual([])
        expect(overflow, `scrollWidth overflow on ${route} @ ${width}px`).toBeLessThanOrEqual(1)
      })
    }
  }
})

test.describe('project detail pages show their own screenshots', () => {
  // The S1 regression guard: /projects/<slug> may only load /projects/<slug>/* images.
  for (const slug of ['coding-ninjas', 'bmw']) {
    const other = slug === 'bmw' ? 'coding-ninjas' : 'bmw'

    test(`/projects/${slug} only loads its own gallery`, async ({ page }) => {
      await page.goto(`/projects/${slug}`)
      const srcs = await page.locator('img').evaluateAll((els) => els.map((e) => e.getAttribute('src') || ''))
      const gallery = srcs.filter((s) => s.startsWith('/projects/'))
      expect(gallery.length, 'expected the gallery to render images').toBeGreaterThanOrEqual(5)
      const foreign = gallery.filter((s) => !s.startsWith(`/projects/${slug}/`))
      expect(foreign, `images on /projects/${slug} that belong to another project`).toEqual([])
      expect(srcs.some((s) => s.includes(`/projects/${other}/`))).toBe(false)
    })
  }
})

test.describe('not-found pages', () => {
  test('unknown route renders the branded in-app 404', async ({ page }) => {
    const errors = collectErrors(page)
    const response = await page.goto('/definitely-not-a-page')
    expect(response?.status()).toBeLessThan(400) // the SPA fallback serves index.html
    await expect(page.locator('h1')).toContainText('never shipped')
    await expect(page).toHaveTitle(/404/)
    expect(errors).toEqual([])
  })

  test('the static host 404 (public/404.html) is branded and self-contained', async ({ page }) => {
    const response = await page.goto('/404.html')
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/404 — page not found/)
    await expect(page.locator('h1')).toHaveText('This page never shipped.')
    // Self-contained: no stylesheets, scripts, fonts or images fetched.
    const external = await page.evaluate(() =>
      [...document.querySelectorAll('link[rel="stylesheet"], script[src], img[src], link[rel="preload"]')].map(
        (el) => el.getAttribute('href') || el.getAttribute('src') || '',
      ),
    )
    expect(external.filter((h) => !h.startsWith('data:'))).toEqual([])
  })
})
