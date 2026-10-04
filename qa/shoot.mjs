import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const out = (n) => `/home/user/qa/${n}.png`

const browser = await chromium.launch()

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
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log(`${name}: overflowX=${overflow}px errors=${errors.length ? errors.slice(0, 3).join(' | ') : 'none'}`)
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

// project detail
await shoot('project-cn', { width: 1440, height: 900, path: '/projects/coding-ninjas', steps: [{ scroll: 900, wait: 1400 }] })

// mobile
await shoot('mob-hero', { width: 390, height: 844, path: '/' })
await shoot('mob-projects', { width: 390, height: 844, path: '/', steps: [{ selector: '#projects', wait: 1500 }] })
await shoot('mob-certs', { width: 390, height: 844, path: '/', steps: [{ selector: '#certifications', wait: 1400 }] })

// tiny + tablet overflow checks
for (const [w, h] of [[320, 700], [375, 800], [430, 900], [768, 1024], [1024, 800], [1920, 1000]]) {
  await shoot(`chk-${w}`, { width: w, height: h, path: '/', steps: [{ scroll: 2600, wait: 900 }] })
}

await browser.close()
console.log('QA complete')
