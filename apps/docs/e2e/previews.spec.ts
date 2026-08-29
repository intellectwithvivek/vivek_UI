import { expect, test } from '@playwright/test'
import { registry } from '../lib/registry'

/**
 * The demos themselves, not the page around them.
 *
 * Three bugs reached the live site that every other gate was blind to: a sparkline whose
 * card collapsed to a column of single letters, a scatter chart drawn at a third of its
 * frame, and a gauge whose arc opened on the wrong side. None is a violation, an overlap or
 * an overflow. They are shape problems, and shape can only be measured in a browser.
 *
 * So, for every component and chart page: no text is squeezed into a column narrower than
 * a word, every chart fills the width it was given, and the page logs no error of its own.
 */

const COMPONENT_ROUTES = registry.components.map((entry) => `/docs/components/${entry.slug}`)
const CHART_ROUTES = registry.charts.map((entry) => `/docs/charts/${entry.slug}`)

/** Charts that are intrinsically sized and are not expected to fill the frame. */
const INTRINSIC = new Set(['sparkline', 'progress-ring'])

test.describe('every demo keeps its shape', () => {
  for (const route of [...COMPONENT_ROUTES, ...CHART_ROUTES]) {
    test(`${route}`, async ({ page }, testInfo) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(String(error).slice(0, 160)))
      page.on('console', (message) => {
        // A failed resource is a network log, not a script error; it is checked below.
        if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) {
          errors.push(message.text().slice(0, 160))
        }
      })
      // Two demos load a URL that does not exist on purpose (Image and Avatar fallbacks).
      const notFound: string[] = []
      page.on('response', (response) => {
        if (response.status() >= 400 && !/does-not-exist/.test(response.url())) {
          notFound.push(`${response.status()} ${response.url()}`)
        }
      })

      await page.goto(route)
      await page.waitForLoadState('load')

      // 1. No column of single letters: an element with a few words of text but no room
      //    for one. Vertical labels opt out with `writing-mode`.
      const squeezed = await page.$$eval('.preview *', (nodes) =>
        nodes
          .filter((node) => {
            const el = node as HTMLElement
            if (el.children.length > 0 || !el.textContent) return false
            const text = el.textContent.trim()
            if (text.length < 6) return false
            const style = getComputedStyle(el)
            if (style.writingMode !== 'horizontal-tb') return false
            const rect = el.getBoundingClientRect()
            const line =
              Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.4
            return rect.width > 0 && rect.width < 48 && rect.height > line * 2.5
          })
          .map(
            (el) => `${el.tagName.toLowerCase()} "${(el.textContent || '').trim().slice(0, 30)}"`,
          ),
      )
      expect(
        squeezed,
        `text squeezed into a column on ${route}:\n  ${squeezed.join('\n  ')}`,
      ).toEqual([])

      // 2. Charts fill their frame. A chart drawn at a fraction of its container is a
      //    sizing bug, not a design choice.
      const slug = route.split('/').pop() ?? ''
      if (route.startsWith('/docs/charts/') && !INTRINSIC.has(slug)) {
        const small = await page.$$eval('.preview svg.vk-chart__svg', (svgs) =>
          svgs
            .map((svg) => {
              const frame = svg.closest('.preview') as HTMLElement | null
              const w = svg.getBoundingClientRect().width
              const fw = frame ? frame.clientWidth : 0
              return {
                w: Math.round(w),
                fw: Math.round(fw),
                square:
                  svg.getAttribute('viewBox')?.split(' ')[2] ===
                  svg.getAttribute('viewBox')?.split(' ')[3],
              }
            })
            .filter((s) => s.fw > 0 && !s.square && s.w < s.fw * 0.6)
            .map((s) => `svg ${s.w}px wide in a ${s.fw}px frame`),
        )
        expect(small, `charts drawn too small on ${route}:\n  ${small.join('\n  ')}`).toEqual([])
      }

      // 3. The page's own console is clean, and nothing it asked for was missing.
      expect(errors, `console errors on ${route}:\n  ${errors.join('\n  ')}`).toEqual([])
      expect(notFound, `missing resources on ${route}:\n  ${notFound.join('\n  ')}`).toEqual([])

      // Phone and tablet run the same checks; nothing viewport-specific to add.
      void testInfo
    })
  }
})
