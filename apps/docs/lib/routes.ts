/**
 * Every indexable route, in one list.
 *
 * Derived from the registry rather than hand-maintained, because a sitemap that lists
 * routes the site no longer serves — or omits ones it does — is worse than no sitemap: it
 * teaches a crawler that the file is unreliable and it stops being trusted.
 *
 * The guide list IS hand-written, because those pages are hand-written. `routes.test.ts`
 * checks it against the filesystem so a new guide cannot be added without appearing here.
 */
import { registry } from './registry'

export interface Route {
  path: string
  /** Sitemap priority. Relative, so only the ordering carries meaning. */
  priority: number
  /**
   * Sitemap change frequency. A hint, widely ignored by Google, still read by others —
   * and cheap enough to be honest about.
   */
  changeFrequency: 'daily' | 'weekly' | 'monthly'
  /** Human label, reused for breadcrumbs and for llms.txt. */
  label: string
  section: 'top' | 'guide' | 'component' | 'chart'
}

/** Conceptual guides, ordered as a reading path rather than alphabetically. */
export const GUIDES: Array<{ slug: string; label: string }> = [
  { slug: 'installation', label: 'Installation' },
  { slug: 'quick-start', label: 'Quick start' },
  { slug: 'styling', label: 'Styling and overrides' },
  { slug: 'theming', label: 'Theming with tokens' },
  { slug: 'dark-mode', label: 'Dark mode' },
  { slug: 'responsive', label: 'Responsive layout' },
  { slug: 'server-components', label: 'React Server Components' },
  { slug: 'typescript', label: 'TypeScript' },
  { slug: 'data-mapping', label: 'Data mapping and integration' },
  { slug: 'accessibility', label: 'Accessibility' },
  { slug: 'security', label: 'Security' },
  { slug: 'faq', label: 'FAQ' },
]

export const TOP_ROUTES: Route[] = [
  { path: '/', label: 'VivekUI', priority: 1, changeFrequency: 'weekly', section: 'top' },
  {
    path: '/docs',
    label: 'Documentation',
    priority: 0.9,
    changeFrequency: 'weekly',
    section: 'top',
  },
  {
    path: '/docs/components',
    label: 'All components',
    priority: 0.9,
    changeFrequency: 'weekly',
    section: 'top',
  },
  {
    path: '/docs/charts',
    label: 'All charts',
    priority: 0.9,
    changeFrequency: 'weekly',
    section: 'top',
  },
  {
    path: '/playground',
    label: 'Playground',
    priority: 0.8,
    changeFrequency: 'monthly',
    section: 'top',
  },
]

export function allRoutes(): Route[] {
  return [
    ...TOP_ROUTES,
    ...GUIDES.map((guide) => ({
      path: `/docs/${guide.slug}`,
      label: guide.label,
      // Guides above individual components: they answer the broader questions people
      // actually search for, and they are the pages worth ranking.
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      section: 'guide' as const,
    })),
    ...registry.components.map((entry) => ({
      path: `/docs/components/${entry.slug}`,
      label: entry.title,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
      section: 'component' as const,
    })),
    ...registry.charts.map((entry) => ({
      path: `/docs/charts/${entry.slug}`,
      label: entry.title,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
      section: 'chart' as const,
    })),
  ]
}
