import { Container } from '@the_viveksingh/vivek-ui'
import type { ReactNode } from 'react'
import { DocsSearch } from '../../components/docs-search'
import { DocsSidebar, type NavGroup } from '../../components/docs-sidebar'
import { byCategory, registry, searchIndex } from '../../lib/registry'

/**
 * Both the sidebar and the search palette are client components, so everything handed to
 * them is serialised into the RSC payload of every single page. They therefore receive
 * purpose-built minimal shapes rather than registry entries — passing the registry put all
 * 83 generated prop tables into 420 kB of HTML per page.
 */
const GUIDE_GROUPS: NavGroup[] = [
  {
    heading: 'Getting started',
    items: [
      { href: '/docs', label: 'Introduction' },
      { href: '/docs/installation', label: 'Installation' },
      { href: '/docs/quick-start', label: 'Quick start' },
    ],
  },
  {
    heading: 'Core concepts',
    items: [
      { href: '/docs/theming', label: 'Theming' },
      { href: '/docs/dark-mode', label: 'Dark mode' },
      { href: '/docs/styling', label: 'Overriding styles' },
      { href: '/docs/responsive', label: 'Responsive' },
      { href: '/docs/data-mapping', label: 'Feeding it your data' },
      { href: '/docs/server-components', label: 'Server Components' },
      { href: '/docs/accessibility', label: 'Accessibility' },
      { href: '/docs/security', label: 'Security' },
      { href: '/docs/typescript', label: 'TypeScript' },
    ],
  },
  {
    heading: 'Reference',
    items: [
      { href: '/docs/components', label: 'All components' },
      { href: '/docs/charts', label: 'All charts' },
      { href: '/playground', label: 'Playground' },
    ],
  },
]

const COMPONENT_GROUPS: NavGroup[] = byCategory(registry.components).map(([category, entries]) => ({
  heading: category,
  items: entries.map((entry) => ({
    href: `/docs/components/${entry.slug}`,
    label: entry.title,
    client: entry.isClient,
  })),
}))

const CHART_GROUP: NavGroup = {
  heading: 'Charts',
  items: registry.charts.map((entry) => ({
    href: `/docs/charts/${entry.slug}`,
    label: entry.title,
  })),
}

const NAV = [...GUIDE_GROUPS, ...COMPONENT_GROUPS, CHART_GROUP]

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <Container className="docs-shell" size="xl">
      <div className="docs-shell__bar">
        <DocsSearch rows={searchIndex} />
      </div>
      <div className="docs-shell__grid">
        <nav aria-label="Documentation" className="docs-shell__nav">
          <DocsSidebar groups={NAV} />
        </nav>
        <article className="docs-shell__content">{children}</article>
      </div>
    </Container>
  )
}
