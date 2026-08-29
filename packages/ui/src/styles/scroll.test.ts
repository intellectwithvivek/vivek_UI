/**
 * A horizontal scroll container must be allowed to be narrower than its contents.
 *
 * The automatic minimum size of a flex or grid item is its content's min-content size, so
 * `overflow-x: auto` alone does nothing there: the element grows to fit its children and
 * the PAGE scrolls sideways instead. KanbanBoard shipped like that — 491px of horizontal
 * page scroll on a phone, found by the browser suite the first time it ran every route at
 * 393px.
 *
 * The rule: any selector that sets `overflow` or `overflow-x` to `auto`/`scroll` must also
 * allow shrinking, with `min-inline-size: 0` (or `min-width: 0`) in the same block. There are
 * no exemptions: a first list of them was reasoned out in Chromium — "block-level in normal
 * flow, the automatic minimum does not apply" — and WebKit disproved every entry at 320px,
 * with the code blocks, the table wrapper and the carousel track each pushing the page.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(__dirname, '..')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return walk(path)
    return path.endsWith('.css') ? [path] : []
  })
}

describe('horizontal scroll containers can actually shrink', () => {
  it('pairs every scroll container with a zero minimum inline size', () => {
    const offenders: string[] = []
    for (const file of walk(SRC)) {
      const key = relative(SRC, file).split(sep).join('/')
      const text = readFileSync(file, 'utf8')
      // Split into rule blocks so the check is per-selector, not per-file.
      for (const block of text.split('}')) {
        if (!/overflow(-x)?:\s*(auto|scroll)/.test(block)) continue
        if (!/min-(inline-size|width):\s*0/.test(block)) {
          const selector = block.trim().split('\n')[0]?.trim() ?? ''
          offenders.push(`${key}: ${selector}`)
        }
      }
    }
    expect(offenders, 'scroll container without min-inline-size: 0').toEqual([])
  })
})
