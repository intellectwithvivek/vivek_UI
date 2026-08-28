import { defineConfig, devices } from '@playwright/test'

/**
 * Browser tests, because jsdom has no layout engine.
 *
 * 1,856 unit tests pass and five layout bugs still reached production in a single week: the
 * navbar brand painting over the links, the accent picker overflowing the bar, a missing
 * hamburger that made mobile navigation unreachable, a loading poster covering the preview
 * it was meant to sit behind, and a card stretched to 1500px. None of them were catchable —
 * jsdom reports every element as 0×0 and happily calls it visible. There was no way to ask
 * "does this overlap" or "is this wider than the viewport" anywhere in the repo.
 *
 * These run against the real production build, in a real browser, at the three widths that
 * matter.
 *
 * `channel: 'chrome'` drives the Chrome already on the machine instead of downloading
 * Playwright's own ~150MB bundle. CI installs the bundled browser instead; the flag is set
 * from the environment so both work without two config files.
 */

const PORT = 4321
const useInstalledChrome = !process.env.CI

export default defineConfig({
  testDir: './e2e',
  // The suite is assertion-heavy and fast; a failure is almost always real, not flaky.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // A failure in this suite is visual by nature; a screenshot is the fastest way to see it.
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  /*
   * Against `next start`, not `next dev`. Dev serves unminified CSS with different chunking
   * and no static optimisation, so a layout that passes there can still break in production.
   * `reuseExistingServer` keeps a local run from fighting a dev server on the same port.
   */
  webServer: {
    command: `npx next start --port ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  projects: [
    {
      name: 'phone',
      // Pixel 5 rather than an iPhone profile: the iPhone devices are WebKit, and WebKit
      // cannot be driven through the installed-Chrome channel. 393x851 with touch emulation
      // is the same class of viewport.
      use: { ...devices['Pixel 5'], ...(useInstalledChrome ? { channel: 'chrome' } : {}) },
    },
    {
      name: 'tablet',
      // 768px exactly — the width where the navbar switches its links inline, and where
      // every header bug this quarter appeared.
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
        ...(useInstalledChrome ? { channel: 'chrome' } : {}),
      },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
        ...(useInstalledChrome ? { channel: 'chrome' } : {}),
      },
    },
  ],
})
