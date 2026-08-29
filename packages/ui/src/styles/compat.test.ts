/**
 * Safari still reads some properties only under a `-webkit-` prefix, and the CSS build
 * runs lightningcss with no browser targets — deliberately, so logical properties are not
 * rewritten into physical fallbacks — which means nothing adds the prefixes for us.
 *
 * `user-select: none` on the chart legend was the case that surfaced this: unprefixed, it
 * does nothing in Safari, so double-clicking a legend entry selected its text. This gate
 * requires the prefixed twin, with the same value, on the line immediately before every
 * declaration of a property in the list.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(__dirname, '..')

/** Properties Safari (current or one major back) reads only with the prefix. */
const NEEDS_WEBKIT = ['user-select', 'backdrop-filter', 'mask-image'] as const

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return walk(path)
    return path.endsWith('.css') ? [path] : []
  })
}

describe('Safari prefixes are written by hand, since the build adds none', () => {
  it('pairs every prefix-dependent declaration with its -webkit- twin', () => {
    const offenders: string[] = []
    for (const file of walk(SRC)) {
      const lines = readFileSync(file, 'utf8').split('\n')
      lines.forEach((line, index) => {
        const match = line.match(new RegExp(`^\\s*(${NEEDS_WEBKIT.join('|')})\\s*:\\s*(.+);\\s*$`))
        if (!match) return
        const [, prop, value] = match
        const previous = (lines[index - 1] ?? '').trim()
        if (previous !== `-webkit-${prop}: ${value};`) {
          offenders.push(`${relative(SRC, file).split(sep).join('/')}:${index + 1} ${prop}`)
        }
      })
    }
    expect(offenders, 'declaration without its -webkit- twin on the line before').toEqual([])
  })

  it('does not rely on the standard line-clamp, which no browser ships', () => {
    const offenders: string[] = []
    for (const file of walk(SRC)) {
      const lines = readFileSync(file, 'utf8').split('\n')
      lines.forEach((line, index) => {
        if (
          /^\s*line-clamp\s*:/.test(line) &&
          !/^\s*-webkit-line-clamp\s*:/.test(lines[index - 1] ?? '')
        ) {
          offenders.push(`${relative(SRC, file).split(sep).join('/')}:${index + 1}`)
        }
      })
    }
    expect(offenders).toEqual([])
  })
})
