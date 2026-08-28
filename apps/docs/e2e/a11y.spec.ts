import { expect, test } from '@playwright/test'
import { axeViolations, KEY_ROUTES } from './helpers'

/**
 * axe against whole pages, in a real browser.
 *
 * The unit suite already runs axe on every component — but in isolation, in jsdom. That
 * misses everything that only exists once a page is assembled, and everything that needs
 * layout to detect:
 *
 *   - two landmarks of the same kind with no distinguishing label
 *   - a second `<h1>`, or an outline that jumps a level, once sections are composed
 *   - **colour contrast**, which axe skips entirely in jsdom because it has to sample the
 *     rendered pixels of an element against whatever is actually painted behind it
 *
 * That last one is the reason this file earns its keep. Every contrast claim the library
 * makes has been checked against token pairs in the abstract; this is the first thing that
 * checks the colours as a browser really paints them, on a real background, at a real
 * font size.
 */

/*
 * Rules disabled, with the reason each one is not ours to fix.
 *
 * Nothing to do with severity — an unexplained disabled rule is how an accessibility suite
 * quietly stops testing anything.
 */
const NOT_OURS = [
  // The showcase embeds twelve third-party sites. axe walks into same-origin frames and
  // reports their problems as ours; we cannot fix another site's markup from here.
  'frame-tested',
]

test.describe('accessibility of the composed pages', () => {
  for (const route of KEY_ROUTES) {
    test(`${route} has no axe violations`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState('networkidle')

      const violations = await axeViolations(page, NOT_OURS)
      const report = violations
        .map((v) => `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes.join('\n    ')}`)
        .join('\n')
      expect(violations, `\n${report}`).toEqual([])
    })
  }
})

test.describe('accessibility in dark mode', () => {
  // Contrast is the failure mode that flips between themes: a pairing that clears 4.5:1 on
  // white can fall under it on the dark surface, and nothing about the markup changes.
  for (const route of ['/', '/docs/components/button', '/showcase'] as const) {
    test(`${route} has no axe violations in dark mode`, async ({ page }) => {
      await page.goto(route)
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
      await page.waitForLoadState('networkidle')

      const violations = await axeViolations(page, NOT_OURS)
      const report = violations
        .map((v) => `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes.join('\n    ')}`)
        .join('\n')
      expect(violations, `\n${report}`).toEqual([])
    })
  }
})

test.describe('keyboard reachability', () => {
  test('tabbing from the top reaches the main content quickly', async ({ page }) => {
    // A skip link exists so a keyboard user does not walk the whole nav on every page. If it
    // is not the first stop, it is not doing its job.
    await page.goto('/')
    await page.keyboard.press('Tab')

    const focused = await page.evaluate(() => {
      const el = document.activeElement
      return { text: (el?.textContent ?? '').trim(), href: el?.getAttribute('href') ?? '' }
    })
    expect(focused.text).toMatch(/skip/i)
    expect(focused.href).toBe('#content')
  })

  test('every focused control shows a visible focus ring', async ({ page }) => {
    /*
     * WCAG 2.4.7. A control that can be focused but shows nothing leaves a keyboard user
     * with no idea where they are — and it is invisible to every other kind of test, because
     * the element is present, enabled and correctly labelled.
     */
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const invisible: string[] = []
    for (let step = 0; step < 12; step++) {
      await page.keyboard.press('Tab')
      const result = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        if (!el || el === document.body) return null
        const style = getComputedStyle(el)
        const ring =
          (style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0) ||
          style.boxShadow !== 'none'
        return {
          ring,
          label: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24)}"`,
        }
      })
      if (result && !result.ring) invisible.push(result.label)
    }
    expect(invisible, `no focus indicator on:\n  ${invisible.join('\n  ')}`).toEqual([])
  })
})
