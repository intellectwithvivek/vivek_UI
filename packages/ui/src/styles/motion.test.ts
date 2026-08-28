/**
 * Every animated stylesheet must carry a prefers-reduced-motion block.
 *
 * The discipline exists in 50+ files already; nothing enforced it, so the next component
 * that ships a spinner or a slide-in could skip the guard and every gate would stay green.
 * Vestibular-disorder users are the ones who pay for that miss — WCAG 2.3.3, and one of
 * the few accessibility failures that can cause physical symptoms rather than friction.
 *
 * The rule: a file that declares `@keyframes` or an `animation:` shorthand must also
 * contain a `prefers-reduced-motion` block. Transition-only files are exempt — reduced
 * motion targets movement, and opacity/color transitions are not vestibular triggers —
 * but files that TRANSFORM in their transitions are held to the same rule.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(__dirname, '..')

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return cssFiles(path)
    return entry.name.endsWith('.css') ? [path] : []
  })
}

describe('reduced motion is honoured by construction', () => {
  it('every file that animates carries the guard', () => {
    const offenders: string[] = []
    for (const file of cssFiles(SRC)) {
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      const animates = /@keyframes|animation:/.test(css)
      const movesOnTransition = /transition[^;]*transform/.test(css)
      if (!animates && !movesOnTransition) continue
      if (!/prefers-reduced-motion/.test(css)) {
        offenders.push(relative(SRC, file).split(sep).join('/'))
      }
    }
    expect(offenders, 'animates without a prefers-reduced-motion block').toEqual([])
  })
})
