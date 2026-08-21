import data from '../registry.json'

/** One row of a generated props table. */
export interface PropRow {
  name: string
  type: string
  required: boolean
  description: string
  default: string
}

export interface PropsApi {
  props: PropRow[]
  /** Set for components whose props are a discriminated union, one entry per branch. */
  variants?: { label: string; props: PropRow[] }[]
  spreadsHostProps: boolean
  extends: string[]
}

export interface RegistryEntry {
  slug: string
  title: string
  kind: 'component' | 'chart'
  category: string
  exports: string[]
  typeExports: string[]
  primary: string
  description: string
  isClient: boolean
  api: PropsApi | null
  compound: boolean
}

export interface Registry {
  version: string
  categories: string[]
  components: RegistryEntry[]
  charts: RegistryEntry[]
}

export const registry = data as unknown as Registry

export const allEntries: RegistryEntry[] = [...registry.components, ...registry.charts]

export function entryBySlug(slug: string): RegistryEntry | undefined {
  return allEntries.find((entry) => entry.slug === slug)
}

/** Components grouped for the sidebar, in the registry's declared category order. */
export function byCategory(entries: RegistryEntry[]) {
  const groups = new Map<string, RegistryEntry[]>()
  for (const category of registry.categories) groups.set(category, [])
  for (const entry of entries) {
    const bucket = groups.get(entry.category)
    if (bucket) bucket.push(entry)
    else groups.set(entry.category, [entry])
  }
  return [...groups].filter(([, items]) => items.length > 0)
}

/** Adjacent entries within the flattened sidebar order, for prev/next links. */
export function neighbours(slug: string) {
  const ordered = byCategory(registry.components).flatMap(([, items]) => items)
  const index = ordered.findIndex((entry) => entry.slug === slug)
  return {
    previous: index > 0 ? ordered[index - 1] : undefined,
    next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined,
  }
}

/**
 * A minimal row for the search palette.
 *
 * Search runs in a client component, so whatever it receives is serialised into the RSC
 * payload of *every* page. Handing it the full registry put all 83 prop tables, with every
 * type string and description, into 420 kB of HTML per page. This carries only what the
 * filter actually reads.
 */
export interface SearchRow {
  href: string
  label: string
  group: string
  keywords: string
}

export const searchIndex: SearchRow[] = [
  ...registry.components.map((entry) => ({
    href: `/docs/components/${entry.slug}`,
    label: entry.title,
    group: entry.category,
    // Prop names stay searchable so "aria-label" finds IconButton, but as one joined
    // string rather than an array of objects.
    keywords: [entry.slug, ...entry.exports, ...(entry.api?.props ?? []).map((p) => p.name)]
      .join(' ')
      .toLowerCase(),
  })),
  ...registry.charts.map((entry) => ({
    href: `/docs/charts/${entry.slug}`,
    label: entry.title,
    group: 'Charts',
    keywords: [entry.slug, ...entry.exports].join(' ').toLowerCase(),
  })),
]

export const PACKAGE_NAME = '@the_viveksingh/vivek-ui'
export const REPO_URL = 'https://github.com/intellectwithvivek/vivek_UI'
