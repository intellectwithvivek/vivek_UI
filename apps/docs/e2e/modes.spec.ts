import { expect, test } from '@playwright/test'
import { axeViolations, boxesOf, horizontalOverflow, overlappingPairs } from './helpers'

/**
 * The two rendering modes nothing else in the suite turns on.
 *
 * **Right-to-left.** The library uses logical properties only (a unit test enforces it), so
 * flipping `dir` should cost nothing. That claim is checkable only in a browser: a single
 * physical `left:` in a stylesheet — or in the docs' own CSS — shows up here as sideways
 * scroll or a header whose parts land on top of each other.
 *
 * **Forced colours.** Windows High Contrast replaces every colour the stylesheet set with a
 * system palette and drops box-shadows entirely. A focus ring drawn with `box-shadow` alone
 * vanishes; only `outline` survives. Every focusable control on the home page has to keep a
 * visible indicator with shadows gone.
 */

const RTL_ROUTES = ['/', '/docs/components/button', '/blocks/hero-split-media', '/pages/dashboard']

/**
 * Flip the document after it has loaded and hydrated. An init script is too early: the
 * HTML parser rewrites the root element's attributes from the `<html>` tag, and the page
 * arrives left-to-right again. Set after load, `dir` is an attribute React never rendered,
 * so hydration leaves it alone.
 */
async function flipToRtl(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
}

test.describe('right-to-left', () => {
  for (const route of RTL_ROUTES) {
    test(`${route} lays out without sideways scroll or an overlapping header`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState('load')
      await flipToRtl(page)
      expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl')

      const overflow = await horizontalOverflow(page)
      expect(overflow, `${route} scrolls sideways by ${overflow}px in RTL`).toBeLessThanOrEqual(1)

      const boxes = await boxesOf(page, 'header .vk-navbar__inner > *')
      const pairs = overlappingPairs(boxes)
      expect(pairs, `header parts overlap in RTL:\n  ${pairs.join('\n  ')}`).toEqual([])
    })
  }

  test('the home page has no axe violations in RTL', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await flipToRtl(page)
    const violations = await axeViolations(page, ['frame-tested'])
    expect(
      violations,
      violations.map((v) => `[${v.impact}] ${v.id}: ${v.help}`).join('\n'),
    ).toEqual([])
  })
})

test.describe('forced colours', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
  })

  test('every focused control keeps an indicator that survives the loss of box-shadow', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('load')

    const missing: string[] = []
    for (let step = 0; step < 14; step++) {
      await page.keyboard.press('Tab')
      const result = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        if (!el || el === document.body) return null
        const style = getComputedStyle(el)
        // In forced-colors mode the browser paints outlines in the system Highlight colour
        // whatever the stylesheet asked for; what matters is that an outline exists at all.
        const outline = style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0
        return {
          outline,
          label: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24)}"`,
        }
      })
      if (result && !result.outline) missing.push(result.label)
    }
    expect(missing, `no outline in forced-colors mode on:\n  ${missing.join('\n  ')}`).toEqual([])
  })

  test('a component page still passes axe with the system palette', async ({ page }) => {
    await page.goto('/docs/components/button')
    await page.waitForLoadState('load')
    // Contrast is the system's business in this mode; structure and names are still ours.
    const violations = await axeViolations(page, ['frame-tested', 'color-contrast'])
    expect(
      violations,
      violations.map((v) => `[${v.impact}] ${v.id}: ${v.help}`).join('\n'),
    ).toEqual([])
  })
})
