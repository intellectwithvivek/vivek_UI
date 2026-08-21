import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

/**
 * The live preview slot on a component page.
 *
 * Each slug's previews live in their own module and are loaded through `next/dynamic`, so
 * a route only ever ships the previews it actually renders. Importing them from one
 * barrel would make every component page pay for all 83 — the classic way a docs site
 * becomes slow, and the specific thing `optimizePackageImports` cannot fix because the
 * previews are local files.
 *
 * The map is explicit rather than a template-literal import because a variable path
 * cannot be statically analysed, and an unanalysable dynamic import defeats the splitting
 * this exists to achieve.
 */
const PREVIEWS: Record<string, ComponentType<{ name: string }>> = {
  alert: dynamic(() => import('../previews/alert')),
  badge: dynamic(() => import('../previews/badge')),
  button: dynamic(() => import('../previews/button')),
  card: dynamic(() => import('../previews/card')),
  'data-table': dynamic(() => import('../previews/data-table')),
  field: dynamic(() => import('../previews/field')),
  'line-chart': dynamic(() => import('../previews/line-chart')),
  modal: dynamic(() => import('../previews/modal')),
  tabs: dynamic(() => import('../previews/tabs')),
}

export function ComponentPreview({ slug, name }: { slug: string; name: string }) {
  const Preview = PREVIEWS[slug]
  if (!Preview) return null
  return (
    <div className="preview">
      <Preview name={name} />
    </div>
  )
}

/** Slugs with a preview module, for the coverage report. */
export const previewSlugs = Object.keys(PREVIEWS)
