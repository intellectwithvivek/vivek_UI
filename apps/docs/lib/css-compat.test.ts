/**
 * The site's own CSS is held to the same Safari rule as the library's.
 *
 * `packages/ui/src/styles/compat.test.ts` guards the package; this guards `apps/docs`. The
 * playground's line-number gutter shipped `user-select: none` unprefixed, so its numbers
 * were selectable in Safari and got copied along with the code — the exact bug the library
 * gate exists to prevent, one directory over.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = join(__dirname, '..')
const NEEDS_WEBKIT = ['user-select', 'backdrop-filter', 'mask-image'] as const
const SKIP = new Set(['.next', 'node_modules', 'test-results', 'playwright-report'])

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return []
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return walk(path)
    return path.endsWith('.css') ? [path] : []
  })
}

describe("the docs site's CSS carries the prefixes Safari needs", () => {
  it('pairs every prefix-dependent declaration with its -webkit- twin', () => {
    const offenders: string[] = []
    for (const file of walk(ROOT)) {
      const lines = readFileSync(file, 'utf8').split('\n')
      lines.forEach((line, index) => {
        const match = line.match(new RegExp(`^\\s*(${NEEDS_WEBKIT.join('|')})\\s*:\\s*(.+);\\s*$`))
        if (!match) return
        const [, prop, value] = match
        if ((lines[index - 1] ?? '').trim() !== `-webkit-${prop}: ${value};`) {
          offenders.push(`${relative(ROOT, file).split(sep).join('/')}:${index + 1} ${prop}`)
        }
      })
    }
    expect(offenders, 'declaration without its -webkit- twin on the line before').toEqual([])
  })
})
