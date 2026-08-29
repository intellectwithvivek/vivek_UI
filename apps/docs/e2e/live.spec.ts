import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'

/**
 * Smoke test against the deployed site, not a local build.
 *
 * Everything else in `e2e/` runs against `next start` on localhost, which proves the code is
 * right. This proves the *deployment* is right: the version the site advertises, the CDN
 * actually serving the assets, and no console errors from the production bundle. It is
 * deliberately small — a dozen requests, not the full 1,145-test suite — because it points
 * at a live site.
 *
 * Opt in with `LIVE=1`, so it never runs in the normal suite or in CI.
 */
const LIVE = process.env.LIVE_URL ?? 'https://ui.vivekkumarsingh.in'

const ROUTES = [
  '/',
  '/docs/installation',
  '/docs/migration',
  '/docs/components/button',
  '/docs/components/kanban-board',
  '/docs/charts/line-chart',
  '/blocks',
  '/pages',
] as const

test.describe('the deployed site', () => {
  test.skip(!process.env.LIVE, 'set LIVE=1 to run against production')
  test.use({ baseURL: LIVE })

  test('advertises the published version', async ({ page }) => {
    await page.goto('/')
    // Whatever the package currently publishes — not a literal, which would go stale.
    const { version } = JSON.parse(
      readFileSync(join(__dirname, '..', '..', '..', 'packages', 'ui', 'package.json'), 'utf8'),
    ) as { version: string }
    await expect(page.locator('body')).toContainText(`v${version}`)
  })

  for (const route of ROUTES) {
    test(`${route} renders cleanly`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(String(error).slice(0, 160)))
      page.on('console', (message) => {
        const text = message.text()
        // Firefox and WebKit log a report-only CSP as an `error`; Chromium logs a warning.
        // It is a notice about the policy, not a fault in the page.
        const noise = /Failed to load resource|Content Security Policy/
        if (message.type() === 'error' && !noise.test(text)) errors.push(text.slice(0, 160))
      })

      const response = await page.goto(route)
      expect(response?.status(), `${route} status`).toBe(200)
      await page.waitForLoadState('load')

      // A heading proves React rendered, not just that HTML was served.
      await expect(page.locator('h1').first()).toBeVisible()
      expect(errors, `console errors on ${route}:\n  ${errors.join('\n  ')}`).toEqual([])
    })
  }

  test('the stylesheet is actually served and applied', async ({ page }) => {
    await page.goto('/docs/components/button')
    await page.waitForLoadState('load')
    // If the CSS 404s, the button renders with the UA's default background.
    const background = await page
      .locator('.vk-button[data-variant="solid"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(background).not.toBe('rgba(0, 0, 0, 0)')
    expect(background).not.toBe('buttonface')
  })

  test('a chart legend is interactive, as 1.0 made the default', async ({ page }) => {
    await page.goto('/docs/charts/line-chart')
    await page.waitForLoadState('load')
    const toggles = page.locator('.vk-chart__legend-toggle')
    expect(await toggles.count()).toBeGreaterThan(0)
    await expect(toggles.first()).toBeChecked()
  })

  test('does not scroll sideways on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 })
    for (const route of ['/', '/docs/components/kanban-board', '/blocks']) {
      await page.goto(route)
      await page.waitForLoadState('load')
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `${route} overflows by ${overflow}px`).toBeLessThanOrEqual(0)
    }
  })
})
