/**
 * A horizontal scroll container must be allowed to be narrower than its contents.
 *
 * The automatic minimum size of a flex or grid item is its content's min-content size, so
 * `overflow-x: auto` alone does nothing there: the element grows to fit its children and
 * the PAGE scrolls sideways instead. KanbanBoard shipped like that — 491px of horizontal
 * page scroll on a phone, found by the browser suite the first time it ran every route at
 * 393px.
 *
 * The rule: any selector that sets `overflow-x: auto`/`scroll` must also allow shrinking,
 * with `min-inline-size: 0` (or `min-width: 0`) in the same block, or say why not.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(__dirname, '..')

/**
 * Blocks that scroll but cannot overflow their parent, with the reason. Each is a scroll
 * container whose width is already bounded by something other than its content.
 */
const EXEMPT = new Map<string, string>([
  // Fixed/absolute overlays are sized by their inset, not by their content.
  ['components/lightbox/lightbox.css', 'the thumbnail strip sits in a fixed, full-screen panel'],
  // `.vk-code` blocks are `display: block` in normal flow, where the automatic minimum
  // size does not apply.
  ['components/code/code.css', 'block-level in normal flow, not a flex or grid item'],
  ['components/prose/prose.css', 'block-level in normal flow, not a flex or grid item'],
  ['components/scroll-area/scroll-area.css', 'the viewport is sized by the caller, not content'],
  ['components/carousel/carousel.css', 'the track is sized by slidesPerView, not content'],
  ['components/tabs/tabs.css', 'the tab list is sized by the panel it labels'],
  ['components/anchor-nav/anchor-nav.css', 'the nav is sized by its column, not its links'],
])

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return walk(path)
    return path.endsWith('.css') ? [path] : []
  })
}

describe('horizontal scroll containers can actually shrink', () => {
  it('pairs overflow-x with a zero minimum size, or an explained exemption', () => {
    const offenders: string[] = []
    for (const file of walk(SRC)) {
      const key = relative(SRC, file).split(sep).join('/')
      if (EXEMPT.has(key)) continue
      const text = readFileSync(file, 'utf8')
      // Split into rule blocks so the check is per-selector, not per-file.
      for (const block of text.split('}')) {
        if (!/overflow-x:\s*(auto|scroll)/.test(block)) continue
        if (!/min-(inline-size|width):\s*0/.test(block)) {
          const selector = block.trim().split('\n')[0]?.trim() ?? ''
          offenders.push(`${key}: ${selector}`)
        }
      }
    }
    expect(offenders, 'scroll container without min-inline-size: 0').toEqual([])
  })

  it('keeps the exemption list honest — every entry still has that declaration', () => {
    for (const [key] of EXEMPT) {
      const text = readFileSync(join(SRC, key), 'utf8')
      expect(/overflow-x:\s*(auto|scroll)/.test(text), `${key} no longer scrolls`).toBe(true)
    }
  })
})
