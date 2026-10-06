import { defineConfig } from 'playwright/test'

const PORT = 4173
const BASE = process.env.QA_BASE || `http://localhost:${PORT}`

/**
 * Smoke-test config.
 *
 *   npx playwright install chromium   # once per machine (downloads the browser)
 *   npm test                          # builds dist/ and serves it, then runs tests
 *
 * Set `QA_BASE` to test an already-running server instead of letting Playwright
 * start `npm run preview` itself (useful against a deploy preview).
 */
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: BASE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: process.env.QA_BASE
    ? undefined
    : {
        command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
        url: BASE,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
})
