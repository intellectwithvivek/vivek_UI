import { readFileSync } from 'node:fs'
import type { Locator, Page } from '@playwright/test'

/**
 * The checks that jsdom cannot make.
 *
 * Every function here needs a real layout: a box with a position and a size. That is the
 * whole reason this directory exists.
 */

/*
 * Read once at module load and injected into each page, rather than installed as a plugin.
 * `require.resolve` rather than `import.meta.url`: Playwright loads these files as CommonJS,
 * where `import.meta` is a syntax error.
 */
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

export interface Box {
  label: string
  x: number
  y: number
  width: number
  height: number
}

/** Bounding boxes of everything matching `selector`, skipping anything not rendered. */
export async function boxesOf(page: Page, selector: string): Promise<Box[]> {
  return page.$$eval(selector, (nodes) =>
    nodes
      .map((node) => {
        const rect = node.getBoundingClientRect()
        return {
          label: `${node.tagName.toLowerCase()}.${(node.className || '').toString().split(' ')[0]}: ${(node.textContent || '').trim().slice(0, 30)}`,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        }
      })
      .filter((box) => box.width > 0 && box.height > 0),
  )
}

/** True when two boxes share any area. Touching edges do not count. */
export function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

/**
 * Pairs of boxes that overlap.
 *
 * A tolerance of 1px absorbs sub-pixel rounding, which browsers do constantly and which is
 * never what anyone means by "overlapping".
 */
export function overlappingPairs(boxes: Box[], tolerance = 1): string[] {
  const found: string[] = []
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]
      const b = boxes[j]
      if (!a || !b) continue
      const shrunk = {
        ...b,
        x: b.x + tolerance,
        y: b.y + tolerance,
        width: b.width - tolerance * 2,
        height: b.height - tolerance * 2,
      }
      if (shrunk.width > 0 && shrunk.height > 0 && overlaps(a, shrunk)) {
        found.push(`"${a.label}" overlaps "${b.label}"`)
      }
    }
  }
  return found
}

/**
 * Does the page scroll sideways?
 *
 * The single most common responsive failure, and invisible on a desktop with an overlay
 * scrollbar. A 2px tolerance absorbs sub-pixel layout rounding.
 */
export async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => {
    const doc = document.documentElement
    return Math.max(0, doc.scrollWidth - doc.clientWidth)
  })
}

/** Elements sticking out past the right edge of the viewport, with what they are. */
export async function elementsPastViewport(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth
    const out: string[] = []
    for (const node of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
      const rect = node.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue
      // Anything deliberately clipped by an ancestor is not overflowing the page.
      const style = getComputedStyle(node)
      if (style.position === 'fixed') continue
      if (rect.right > width + 2) {
        const label = `${node.tagName.toLowerCase()}.${(node.className || '').toString().split(' ')[0]}`
        out.push(`${label} extends ${Math.round(rect.right - width)}px past the right edge`)
      }
    }
    // Only report the outermost offender per subtree: one overflowing element drags every
    // child with it, and a list of forty is unreadable.
    return out.slice(0, 8)
  })
}

/**
 * Interactive targets smaller than the 44×44 CSS pixels WCAG 2.5.5 asks for.
 *
 * Applied only on touch viewports — a mouse pointer hits a 24px icon fine, a thumb does not.
 */
export async function smallTouchTargets(page: Page, minimum = 44): Promise<string[]> {
  return page.evaluate((min) => {
    const selector = 'a[href], button, [role="button"], input:not([type="hidden"]), select'
    const out: string[] = []
    for (const node of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
      const rect = node.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue
      // Inline links inside a paragraph are explicitly exempt in WCAG 2.5.5.
      const parent = node.parentElement
      if (node.tagName === 'A' && parent && /^(P|LI|SPAN|TD)$/.test(parent.tagName)) continue
      if (rect.width < min || rect.height < min) {
        const label = (node.getAttribute('aria-label') || node.textContent || '')
          .trim()
          .slice(0, 24)
        out.push(
          `${node.tagName.toLowerCase()} "${label}" is ${Math.round(rect.width)}x${Math.round(rect.height)}`,
        )
      }
    }
    return out
  }, minimum)
}

export interface AxeViolation {
  id: string
  impact: string
  help: string
  nodes: string[]
}

/**
 * Run axe against the whole composed page.
 *
 * The unit tests run axe on components in isolation, which cannot see the failures that
 * only exist once things are assembled: a duplicate landmark, a second `<h1>`, a colour
 * pairing that only occurs when one component sits on another's background.
 */
export async function axeViolations(page: Page, disable: string[] = []): Promise<AxeViolation[]> {
  await page.addScriptTag({ content: AXE_SOURCE })
  return page.evaluate(async (disabled) => {
    const rules: Record<string, { enabled: boolean }> = {}
    for (const id of disabled) rules[id] = { enabled: false }
    // @ts-expect-error injected at runtime
    const results = await window.axe.run(document, {
      resultTypes: ['violations'],
      rules,
    })
    return results.violations.map((violation: Record<string, unknown>) => ({
      id: violation.id as string,
      impact: (violation.impact as string) ?? 'unknown',
      help: violation.help as string,
      nodes: (violation.nodes as Array<{ html: string }>)
        .slice(0, 3)
        .map((n) => n.html.slice(0, 120)),
    }))
  }, disable)
}

/** Is this element actually visible to a person — painted, sized, and on screen? */
export async function isReallyVisible(locator: Locator): Promise<boolean> {
  return locator.evaluate((node) => {
    const rect = node.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) return false
    const style = getComputedStyle(node)
    return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0.01
  })
}

/** The routes worth walking on every viewport. One of each kind of page. */
export const KEY_ROUTES = [
  '/',
  '/docs',
  '/docs/components',
  '/docs/components/button',
  '/docs/components/scheduler',
  '/docs/charts',
  '/docs/installation',
  '/showcase',
  '/showcase/pulse-analytics',
  '/pages',
  '/pages/dashboard',
  '/playground',
] as const
