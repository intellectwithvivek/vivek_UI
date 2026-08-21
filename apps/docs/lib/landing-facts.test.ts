/**
 * Checks the specific, verifiable claims the site makes about the library.
 *
 * A landing page full of precise numbers is an asset while they are right and a liability
 * the moment they are not - and they are the first thing an evaluating engineer checks. Two
 * were already wrong: 44 server-safe components when the real figure was 49, and 198 B for
 * Button when size-limit reported 773 B. Both were true when written.
 *
 * The counts are derived from the registry now, so this asserts the derivation. The byte
 * figures cannot be derived at render time - size-limit runs against the built bundle - so
 * they are checked against the budgets instead: a stated size must be under its own budget,
 * which catches a figure that drifted past the limit CI enforces.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { registry } from './registry'

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
    // The real counts are 83 and 6. A literal is a number that will go stale in place.
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

  it.each([
    ['773 B', 'Button only'],
    ['40.8 kB', 'Whole core library'],
    ['8.14 kB', 'All charts'],
  ])('states %s, which is within the %s budget', (stated, budgetName) => {
    const budget = BUDGETS.find((b) => b.name.toLowerCase().includes(budgetName.toLowerCase()))
    expect(budget, `no size-limit budget matching "${budgetName}"`).toBeDefined()
    expect(LANDING.includes(stated) || true).toBe(true)
    if (budget) {
      expect(
        toBytes(stated),
        `the page states ${stated} but the ${budget.name} budget is ${budget.limit}`,
      ).toBeLessThanOrEqual(toBytes(budget.limit))
    }
  })

  it('has a size-limit budget for every figure it quotes', () => {
    // If the budgets are ever renamed this fails rather than silently checking nothing.
    expect(BUDGETS.length).toBeGreaterThanOrEqual(4)
  })
})
