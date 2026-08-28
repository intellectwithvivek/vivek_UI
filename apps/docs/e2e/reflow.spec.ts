import { expect, test } from '@playwright/test'
import { elementsPastViewport, horizontalOverflow, KEY_ROUTES } from './helpers'

/**
 * WCAG 1.4.10 Reflow, and the print stylesheet.
 *
 * 320 CSS pixels is the criterion's magic number: a 1280px desktop at 400% zoom, or the
 * common 640px window at 200%. The e2e suite's narrowest project is a 393px phone — close,
 * but not the SC, and desktop-at-zoom differs from mobile emulation (no touch media, other
 * hover semantics). One project cannot cover it, so this spec sets the viewport itself.
 *
 * The print check exists because styles/print.css shipped for a full release without being
 * bundled at all — a shipped feature that could not work, and no gate saw it. Now the
 * stylesheet is real, this proves the pages it targets actually survive print media.
 */

test.describe('320px reflow (WCAG 1.4.10)', () => {
  for (const route of KEY_ROUTES) {
    test(`${route} does not scroll sideways at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 })
      await page.goto(route)
      await page.waitForLoadState('load')

      const overflow = await horizontalOverflow(page)
      const offenders = overflow > 0 ? await elementsPastViewport(page) : []
      expect(
        overflow,
        `scrolls ${overflow}px sideways at 320px:\n  ${offenders.join('\n  ')}`,
      ).toBe(0)
    })
  }
})

test.describe('print', () => {
  test('a docs page prints its content, not its chrome', async ({ page }) => {
    await page.goto('/docs/components/button')
    await page.waitForLoadState('load')
    await page.emulateMedia({ media: 'print' })

    // The content is what someone printed for; it must survive.
    await expect(page.locator('h1')).toBeVisible()
    // No sideways spill onto a second sheet.
    expect(await horizontalOverflow(page)).toBe(0)
  })

  test('a page template prints without horizontal spill', async ({ page }) => {
    await page.goto('/pages/dashboard')
    await page.waitForLoadState('load')
    await page.emulateMedia({ media: 'print' })
    expect(await horizontalOverflow(page)).toBe(0)
  })
})
