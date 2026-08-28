/**
 * RTL by construction: physical direction properties are banned, with a justified allowlist.
 *
 * The library styles with logical properties (`inline-start`, `block-size`) so Arabic,
 * Hebrew, Urdu and Farsi layouts come free from `dir="rtl"` — no separate stylesheet, no
 * `[dir]` overrides. That guarantee only holds while nobody reintroduces a `margin-left`,
 * and nothing catches that visually: an LTR viewer sees a perfect page either way. So the
 * ban is enforced here, at the source level, the same way containment.test.ts guards its
 * own footgun.
 *
 * The allowlist is not laxity — each entry is a place where PHYSICAL is the correct choice:
 *
 * - Floating overlays (`popover`, `tooltip`, `dropdown-menu`) are `position: fixed` and
 *   placed by utils/position.ts in viewport coordinates from getBoundingClientRect(),
 *   which are physical in every writing mode. `left: 0; top: 0` is the transform anchor
 *   those coordinates are applied against; `inset-inline-start` would double-flip in RTL
 *   and place the panel off the wrong edge.
 * - The accordion chevron is two borders rotated 45° into a "points down" glyph. Down is
 *   down in every script; switching the borders to logical would mirror the glyph in RTL
 *   into a shape that no longer reads as a chevron.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(__dirname, '..')

interface Allowed {
  file: string
  property: string
  reason: string
}

const ALLOWLIST: Allowed[] = [
  {
    file: 'components/popover/popover.css',
    property: 'left',
    reason: 'viewport-coordinate anchor for JS positioning',
  },
  {
    file: 'components/tooltip/tooltip.css',
    property: 'left',
    reason: 'viewport-coordinate anchor for JS positioning',
  },
  {
    file: 'components/dropdown-menu/dropdown-menu.css',
    property: 'left',
    reason: 'viewport-coordinate anchor for JS positioning',
  },
  {
    file: 'components/accordion/accordion.css',
    property: 'border-right',
    reason: 'rotated-border chevron glyph; down is down in every script',
  },
]

/** Physical-direction declarations. `top`/`bottom` are fine — block flow does not flip. */
const PHYSICAL =
  /(?:^|[^-\w])(margin-left|margin-right|padding-left|padding-right|border-left|border-right|left|right)\s*:/

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return cssFiles(path)
    return entry.name.endsWith('.css') ? [path] : []
  })
}

describe('logical properties everywhere, physical only where physically correct', () => {
  const files = cssFiles(SRC)

  it('found the stylesheets', () => {
    expect(files.length).toBeGreaterThan(90)
  })

  it('has no unlisted physical-direction declaration', () => {
    const offenders: string[] = []
    for (const file of files) {
      const rel = relative(SRC, file).split(sep).join('/')
      // Comments stripped: prose about `left: -9999px` is documentation, not a declaration.
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      for (const [index, line] of css.split('\n').entries()) {
        const match = PHYSICAL.exec(line)
        if (!match) continue
        const property = match[1] ?? ''
        const allowed = ALLOWLIST.some(
          (entry) => entry.file === rel && line.includes(`${entry.property}:`),
        )
        if (!allowed) offenders.push(`${rel}:${index + 1} uses ${property}`)
      }
    }
    expect(
      offenders,
      'physical direction property outside the allowlist — use the logical equivalent, or add a justified allowlist entry',
    ).toEqual([])
  })

  it('every allowlist entry still matches a real line, so the list cannot rot', () => {
    const stale = ALLOWLIST.filter((entry) => {
      const css = readFileSync(join(SRC, entry.file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      return !css.includes(`${entry.property}:`)
    })
    expect(stale).toEqual([])
  })
})
