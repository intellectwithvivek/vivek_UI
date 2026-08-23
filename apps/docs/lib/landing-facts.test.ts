/**
 * Checks the specific, verifiable claims the site makes about the library.
 *
 * A landing page full of precise numbers is an asset while they are right and a liability
 * the moment they are not - and they are the first thing an evaluating engineer checks. Two
 * were already wrong: 44 server-safe components when the real figure was 49, and 198 B for
 * Button when size-limit reported 773 B. Both were true when written.
 *
 * The counts are derived from the registry, and the byte figures from the size-limit
 * snapshot, so this asserts the derivations rather than the values.
 *
 * The previous version of this file compared each stated size against its *budget* instead:
 * "40.8 kB is under the 48 kB limit, therefore fine". It was not fine — the real figure was
 * 47.35 kB, and the page understated the library by sixteen per cent for months with the
 * test green the whole time. Every understatement passes a check like that. One of its
 * assertions was literally `expect(x || true).toBe(true)`.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { registry } from './registry'
import { bundleSize, cssSize, sizes } from './sizes'

const ROOT = join(__dirname, '..')
const LANDING = readFileSync(join(ROOT, 'app', 'page.tsx'), 'utf8')
const PKG = JSON.parse(
  readFileSync(join(ROOT, '..', '..', 'packages', 'ui', 'package.json'), 'utf8'),
)

interface Budget {
  name: string
  limit: string
}
const BUDGETS: Budget[] = PKG['size-limit'] ?? []

/** "3 kB" -> 3000 */
function toBytes(text: string): number {
  const match = text.match(/([\d.]+)\s*(B|kB|KB|MB)/)
  if (!match?.[1]) throw new Error(`unparseable size: ${text}`)
  const value = Number.parseFloat(match[1])
  const unit = match[2]
  if (unit === 'B') return value
  if (unit === 'MB') return value * 1000 * 1000
  return value * 1000
}

describe('landing page claims', () => {
  it('states no component or chart count as a literal', () => {
    const body = LANDING.slice(LANDING.indexOf('export default'))
    for (const literal of [String(registry.components.length), String(registry.charts.length)]) {
      expect(
        body.includes(`'${literal} `) || body.includes(`"${literal} `),
        `"${literal}" appears as a literal; derive it from the registry`,
      ).toBe(false)
    }
  })

  it('derives the counts it displays', () => {
    expect(LANDING).toContain('registry.components.length')
    expect(LANDING).toContain('registry.charts.length')
    expect(LANDING).toContain('!entry.isClient')
  })

  it('states no byte figure as a literal either', () => {
    const body = LANDING.slice(LANDING.indexOf('export default'))
    const literals = Array.from(body.matchAll(/['"`][^'"`]*?\b[\d.]+\s?kB\b/g), (m) => m[0])
    expect(literals, 'quote sizes through bundleSize/cssSize so they cannot go stale').toEqual([])
  })

  it('derives every size it displays from the measurement', () => {
    expect(LANDING).toContain('bundleSize(')
    expect(LANDING).toContain('cssSize(')
  })
})

describe('the size snapshot the site quotes', () => {
  it('has an entry for every size-limit budget', () => {
    // A renamed budget would leave `bundleSize` throwing at build time, which is the
    // intended failure — but catching it here names the problem instead.
    for (const budget of BUDGETS) {
      expect(sizes.bundles, `no recorded size for "${budget.name}"`).toHaveProperty(budget.name)
    }
  })

  it('records sizes that are inside their budgets', () => {
    for (const budget of BUDGETS) {
      const recorded = sizes.bundles[budget.name]
      expect(recorded, budget.name).toBeDefined()
      if (recorded !== undefined) {
        expect(
          recorded,
          `${budget.name} is ${recorded} B against ${budget.limit}`,
        ).toBeLessThanOrEqual(toBytes(budget.limit))
      }
    }
  })

  it('formats what the page will actually print', () => {
    // Guards the formatter, not the number: "47.4 kB" rather than "47354" or "47.354 kB".
    expect(bundleSize('Button only')).toMatch(/^\d+ B$/)
    expect(bundleSize('Whole core library')).toMatch(/^\d+\.\d kB$/)
    expect(cssSize('styles.css', 'gzip')).toMatch(/^\d+\.\d kB$/)
  })

  it('throws on an unknown bundle rather than printing undefined', () => {
    expect(() => bundleSize('Something that was renamed')).toThrow(/size-limit entry/)
  })

  it('has a size-limit budget for every figure it quotes', () => {
    expect(BUDGETS.length).toBeGreaterThanOrEqual(4)
  })
})

/**
 * Every source file under `app/`, `components/` and `lib/` — the places a claim about the
 * library can end up in front of a reader.
 */
function siteSources(): Array<{ path: string; text: string }> {
  const out: Array<{ path: string; text: string }> = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
        walk(full)
      } else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.test.ts')) {
        out.push({ path: full.slice(ROOT.length + 1), text: readFileSync(full, 'utf8') })
      }
    }
  }
  for (const dir of ['app', 'components', 'lib']) walk(join(ROOT, dir))
  return out
}

const LINE_BREAK = String.fromCharCode(10)

/** Every stated count of `noun` that disagrees with `real`, ignoring comments. */
function staleCounts(pattern: RegExp, real: number): string[] {
  const wrong: string[] = []
  for (const file of siteSources()) {
    for (const match of file.text.matchAll(pattern)) {
      const stated = Number(match[1])
      if (stated === real) continue
      // A count inside a comment is usually history — "this put all 83 prop tables into
      // the HTML" describes something that happened, not something being claimed now.
      const line = file.text.slice(0, match.index).split(LINE_BREAK).length
      const text = file.text.split(LINE_BREAK)[line - 1] ?? ''
      if (/^\s*(\*|\/\/)/.test(text)) continue
      wrong.push(`${file.path}:${line} says ${stated}, real is ${real}`)
    }
  }
  return wrong
}

describe('counts stated anywhere on the site', () => {
  it('never states a number of components that is not the real one', () => {
    // Four pages still said "83 components" at 91 — two of them meta descriptions — and
    // every build was green throughout. A count that is written down rather than derived
    // goes stale in place, silently, because nothing renders differently when it is wrong.
    expect(
      staleCounts(/\b(\d{2,3})\s+(?:accessible\s+)?components\b/g, registry.components.length),
    ).toEqual([])
  })

  it('never states a number of charts that is not the real one', () => {
    expect(staleCounts(/\b(\d+)\s+(?:SVG\s+)?charts\b/g, registry.charts.length)).toEqual([])
  })
})
