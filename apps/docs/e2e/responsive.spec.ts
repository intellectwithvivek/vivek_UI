import { expect, test } from '@playwright/test'
import { allRoutes } from '../lib/routes'
import { elementsPastViewport, horizontalOverflow } from './helpers'

/**
 * Every route the site serves, at phone width, must not scroll sideways.
 *
 * The layout spec checks a dozen key routes at three viewports and the previews spec checks
 * the demos; this is the blanket: all ~330 built routes — components, charts, guides,
 * blocks, templates, comparisons, showcase — on the smallest viewport we support. It runs
 * on the phone project only; a page that fits 393px fits everything wider, and the wider
 * viewports have their own checks.
 */
const ROUTES = allRoutes().map((route) => route.path)

test.describe('every route fits a phone', () => {
  for (const route of ROUTES) {
    test(`${route}`, async ({ page }, testInfo) => {
      // Phone only: a page that fits 393px fits everything wider, and the wider viewports
      // have their own checks. Skipping here rather than at describe level keeps the
      // condition typed against the test's own arguments.
      test.skip(testInfo.project.name !== 'phone', 'phone project only')
      await page.goto(route)
      await page.waitForLoadState('load')
      const overflow = await horizontalOverflow(page)
      const offenders = overflow > 0 ? await elementsPastViewport(page) : []
      expect(
        overflow,
        `${route} scrolls ${overflow}px sideways:\n  ${offenders.join('\n  ')}`,
      ).toBe(0)
    })
  }
})
