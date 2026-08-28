/**
 * Comparison pages. The rule they live by — VivekUI claims must be provable here, other
 * libraries described not judged — is partly checkable: the counts quoted must match the
 * registry, and the prose must stay inside the shape search engines render.
 */
import { describe, expect, it } from 'vitest'
import { blocks } from './blocks'
import { COMPARISONS } from './comparisons'
import { templates } from './page-templates'
import { registry } from './registry'
import { allRoutes } from './routes'

describe('comparisons', () => {
  it('has a route for the index and every page', () => {
    const paths = new Set(allRoutes().map((route) => route.path))
    expect(paths.has('/compare')).toBe(true)
    for (const comparison of COMPARISONS) {
      expect(paths.has(`/compare/${comparison.slug}`), comparison.slug).toBe(true)
    }
  })

  it('writes descriptions inside the window Google renders, ending as sentences', () => {
    for (const comparison of COMPARISONS) {
      expect(comparison.description.length, comparison.slug).toBeGreaterThanOrEqual(60)
      expect(comparison.description.length, comparison.slug).toBeLessThanOrEqual(165)
      expect(comparison.description.trim(), comparison.slug).toMatch(/[.!?]$/)
      expect(comparison.summary.trim(), comparison.slug).toMatch(/[.!?]$/)
    }
  })

  it('quotes counts that match the registry and the galleries', () => {
    const serverSafe = registry.components.filter((entry) => !entry.isClient).length
    const total = registry.components.length
    for (const comparison of COMPARISONS) {
      const text = comparison.rows.map((row) => row.vivek).join('\n')
      expect(text, `${comparison.slug} component count`).toContain(
        `${serverSafe} of ${total} components`,
      )
      expect(text, `${comparison.slug} block count`).toContain(`${blocks.length} blocks`)
      expect(text, `${comparison.slug} template count`).toContain(`${templates.length} whole pages`)
    }
  })

  it('gives every comparison both sides of the choice and a full table', () => {
    for (const comparison of COMPARISONS) {
      expect(comparison.chooseOther.length, comparison.slug).toBeGreaterThanOrEqual(2)
      expect(comparison.chooseVivek.length, comparison.slug).toBeGreaterThanOrEqual(3)
      for (const row of comparison.rows) {
        expect(row.other, `${comparison.slug}: ${row.aspect}`).not.toBe('—')
      }
    }
  })
})
