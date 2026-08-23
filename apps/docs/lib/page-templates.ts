import sources from '../page-sources.json'
import { TEMPLATES, type TemplateCategory, type TemplateMeta } from '../page-templates'

export type { TemplateCategory, TemplateMeta }

/** What `scripts/gen-page-sources.mjs` writes for each template. */
export interface TemplateSource {
  /** The template file, verbatim. This is the code that renders the demo. */
  source: string
  /** Library exports the template composes. Read from its import statement. */
  uses: string[]
  /** Chart exports, from the `/charts` subpath. */
  chartUses: string[]
  isClient: boolean
  lines: number
}

export interface Template extends TemplateMeta, TemplateSource {}

const BY_SLUG = sources as Record<string, TemplateSource>

/**
 * Metadata joined to generated source.
 *
 * `gen-page-sources.mjs` fails the build when the two lists disagree, so the lookup below
 * cannot miss in practice — the fallback exists only so a partially-generated tree renders
 * something explicable instead of crashing.
 */
export const templates: Template[] = TEMPLATES.map((meta) => ({
  ...meta,
  ...(BY_SLUG[meta.slug] ?? { source: '', uses: [], chartUses: [], isClient: false, lines: 0 }),
}))

export const templateBySlug = (slug: string): Template | undefined =>
  templates.find((template) => template.slug === slug)

/** Templates grouped for the gallery, in the order the categories are declared. */
export function templatesByCategory(): Array<{ category: TemplateCategory; items: Template[] }> {
  const groups = new Map<TemplateCategory, Template[]>()
  for (const template of templates) {
    const existing = groups.get(template.category)
    if (existing) existing.push(template)
    else groups.set(template.category, [template])
  }
  return [...groups].map(([category, items]) => ({ category, items }))
}

/** Previous and next in gallery order, for the pager at the foot of a template page. */
export function neighbouringTemplates(slug: string): {
  previous: Template | null
  next: Template | null
} {
  const index = templates.findIndex((template) => template.slug === slug)
  if (index === -1) return { previous: null, next: null }
  return {
    previous: templates[index - 1] ?? null,
    next: templates[index + 1] ?? null,
  }
}

/** Every distinct library export used across the gallery. */
export function componentsUsedAcrossTemplates(): string[] {
  return [
    ...new Set(templates.flatMap((template) => [...template.uses, ...template.chartUses])),
  ].sort()
}
