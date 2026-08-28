import { expect, test } from '@playwright/test'
import {
  elementsPastViewport,
  horizontalOverflow,
  isReallyVisible,
  KEY_ROUTES,
  overlappingPairs,
  smallTouchTargets,
} from './helpers'

/**
 * Layout, in a real browser, at three widths.
 *
 * Every assertion here is one that jsdom cannot make, and each one corresponds to a bug that
 * actually shipped.
 */

test.describe('every key page', () => {
  for (const route of KEY_ROUTES) {
    test(`${route} does not scroll sideways`, async ({ page }) => {
      // The most common responsive failure there is, and invisible on a desktop with an
      // overlay scrollbar — which is why it survives review so often.
      await page.goto(route)
      await page.waitForLoadState('networkidle')

      const overflow = await horizontalOverflow(page)
      const offenders = overflow > 0 ? await elementsPastViewport(page) : []
      expect(overflow, `page scrolls ${overflow}px sideways:\n  ${offenders.join('\n  ')}`).toBe(0)
    })
  }
})

test.describe('the header', () => {
  for (const route of ['/', '/showcase', '/docs/components/button'] as const) {
    test(`${route} — nothing in the bar overlaps anything else`, async ({ page }) => {
      /*
       * This is the check that would have caught the tablet bug. `.vk-navbar__brand` shrank
       * below its content with no `overflow`, so the wordmark painted straight over the
       * first nav link — and every test in the repo passed, because jsdom gives every one of
       * those elements the same 0×0 box.
       */
      await page.goto(route)
      await page.waitForLoadState('networkidle')

      const boxes = await page.$$eval(
        '.vk-navbar__brand, .vk-navbar__link, .vk-navbar__actions > *, .vk-navbar__toggle',
        (nodes) =>
          nodes
            .map((node) => {
              const rect = node.getBoundingClientRect()
              return {
                label: `${node.tagName.toLowerCase()}.${(node.className || '').toString().split(' ')[0]}: ${(node.textContent || '').trim().slice(0, 24)}`,
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
              }
            })
            .filter((box) => box.width > 0 && box.height > 0),
      )

      expect(boxes.length, 'found nothing in the header to check').toBeGreaterThan(1)
      expect(overlappingPairs(boxes)).toEqual([])
    })
  }

  test('navigation is reachable — links inline, or a toggle that opens them', async ({ page }) => {
    /*
     * The header shipped with no `Navbar.Toggle`. The library hides the links below its
     * breakpoint and shows the toggle instead, so on every phone Docs, Components, Charts,
     * Pages and Playground were not cramped — they were unreachable, with nothing on screen
     * to suggest they existed.
     */
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const firstLink = page.locator('.vk-navbar__link').first()
    if (await isReallyVisible(firstLink)) return // wide: links are in the bar

    const toggle = page.locator('.vk-navbar__toggle')
    await expect(toggle, 'links are hidden and there is no toggle to open them').toBeVisible()

    await toggle.click()
    await expect(firstLink, 'the toggle did not reveal the links').toBeVisible()

    // And every one of them must be reachable, not just the first.
    const count = await page.locator('.vk-navbar__link').count()
    expect(count, 'expected the full nav in the sheet').toBeGreaterThanOrEqual(5)
  })

  test('the brand always has an accessible name', async ({ page }) => {
    // Below 64rem the wordmark is clipped so only the logo shows. The logo carries alt="",
    // so if the wordmark were hidden with `display: none` the link home would have no name.
    await page.goto('/')
    const brand = page.locator('.vk-navbar__brand')
    await expect(brand).toHaveAccessibleName(/VivekUI/)
  })
})

test.describe('touch targets', () => {
  test('controls are big enough for a thumb', async ({ page }, testInfo) => {
    // WCAG 2.5.5. Only meaningful on a touch viewport — a mouse hits a 24px icon fine.
    test.skip(testInfo.project.name !== 'phone', 'touch viewports only')
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const small = await smallTouchTargets(page)
    expect(small, `below 44x44:\n  ${small.join('\n  ')}`).toEqual([])
  })
})

test.describe('the showcase preview', () => {
  test('the live frame is visible, not covered by its own poster', async ({ page }) => {
    /*
     * The poster bed is `position: absolute` and the frame was static, so the poster painted
     * over the site permanently. It looked exactly like a preview that had failed to load,
     * and nothing in the repo could tell the difference.
     */
    await page.goto('/showcase/pulse-analytics')
    await page.waitForLoadState('domcontentloaded')

    const frame = page.locator('.browser__frame')
    await expect(frame).toBeVisible()

    const frameBox = await frame.boundingBox()
    expect(frameBox?.width ?? 0, 'the frame has no width').toBeGreaterThan(200)

    // The poster must be *behind* it: whatever is painted at the centre of the frame should
    // be the frame, not the bed.
    //
    // Scrolled into view first — `elementFromPoint` takes viewport coordinates and returns
    // null for anything off screen, so on a phone the centre of a 620px frame is below the
    // fold and the hit test reports "nothing" whether or not the poster is covering it.
    await frame.scrollIntoViewIfNeeded()
    const onTop = await page.evaluate(() => {
      const node = document.querySelector('.browser__frame')
      if (!node) return 'no frame'
      const rect = node.getBoundingClientRect()
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
      return hit?.className?.toString() ?? 'nothing'
    })
    expect(onTop, 'something is painted over the live frame').toContain('browser__frame')
  })

  test('every gallery card shows a thumbnail', async ({ page }) => {
    await page.goto('/showcase')
    await page.waitForLoadState('domcontentloaded')
    const thumbs = page.locator('.site-thumb__frame')
    expect(await thumbs.count()).toBe(12)
  })
})

test.describe('the accent picker', () => {
  test('is reachable and actually changes the accent', async ({ page }) => {
    // It has been in three places in three days. This asserts the only thing that matters:
    // a person can find it and it works.
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const trigger = page.locator('.accent-trigger')
    await expect(trigger).toBeVisible()
    await trigger.click()

    const swatches = page.locator('.accent-picker__swatch')
    await expect(swatches.first()).toBeVisible()

    const before = await page.evaluate(() => document.documentElement.getAttribute('data-accent'))
    await swatches.nth(2).click()
    const after = await page.evaluate(() => document.documentElement.getAttribute('data-accent'))
    expect(after).not.toBe(before)
  })
})
