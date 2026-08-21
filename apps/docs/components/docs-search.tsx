'use client'

import { Button, CommandPalette, Kbd } from '@the_viveksingh/vivek-ui'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { SearchRow } from '../lib/registry'

const GUIDES: SearchRow[] = [
  { href: '/docs', label: 'Introduction', group: 'Guides', keywords: 'start intro' },
  {
    href: '/docs/installation',
    label: 'Installation',
    group: 'Guides',
    keywords: 'install npm yarn pnpm setup',
  },
  {
    href: '/docs/quick-start',
    label: 'Quick start',
    group: 'Guides',
    keywords: 'example first page',
  },
  {
    href: '/docs/theming',
    label: 'Theming',
    group: 'Guides',
    keywords: 'tokens css variables colour brand',
  },
  {
    href: '/docs/dark-mode',
    label: 'Dark mode',
    group: 'Guides',
    keywords: 'theme data-theme flash',
  },
  {
    href: '/docs/styling',
    label: 'Overriding styles',
    group: 'Guides',
    keywords: 'where specificity important className',
  },
  {
    href: '/docs/responsive',
    label: 'Responsive',
    group: 'Guides',
    keywords: 'container query breakpoint grid cols',
  },
  {
    href: '/docs/data-mapping',
    label: 'Feeding it your data',
    group: 'Guides',
    keywords: 'api map props items data',
  },
  {
    href: '/docs/server-components',
    label: 'Server Components',
    group: 'Guides',
    keywords: 'rsc use client directive',
  },
  {
    href: '/docs/accessibility',
    label: 'Accessibility',
    group: 'Guides',
    keywords: 'a11y aria keyboard axe screen reader',
  },
  {
    href: '/docs/security',
    label: 'Security',
    group: 'Guides',
    keywords: 'xss csv injection csp href',
  },
  {
    href: '/docs/typescript',
    label: 'TypeScript',
    group: 'Guides',
    keywords: 'types generics union resolution',
  },
  { href: '/playground', label: 'Playground', group: 'Guides', keywords: 'editor try run sandbox' },
]

/**
 * Site search, built on the library's own `CommandPalette`.
 *
 * Client-side and index-free: ~100 rows is small enough to filter in memory, so there is
 * no search service and nothing to keep in sync. It receives the slim `SearchRow[]`
 * rather than the registry, because anything handed to a client component is serialised
 * into the RSC payload of every page.
 */
export function DocsSearch({ rows }: { rows: SearchRow[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const items = useMemo(() => {
    const all = [...GUIDES, ...rows]
    const groups = new Map<string, SearchRow[]>()
    for (const row of all) {
      const bucket = groups.get(row.group)
      if (bucket) bucket.push(row)
      else groups.set(row.group, [row])
    }
    return [...groups].map(([heading, items]) => ({
      heading,
      items: items.map((row) => ({
        id: row.href,
        label: row.label,
        description: row.group,
        keywords: [row.keywords],
      })),
    }))
  }, [rows])

  return (
    <>
      <Button
        aria-label="Search documentation"
        onClick={() => setOpen(true)}
        size="sm"
        variant="outline"
      >
        Search <Kbd>⌘K</Kbd>
      </Button>
      <CommandPalette
        hotkey="mod+k"
        items={items}
        onOpenChange={setOpen}
        onSelect={(item) => {
          setOpen(false)
          router.push(item.id)
        }}
        open={open}
        placeholder="Search components, props and guides…"
      />
    </>
  )
}
