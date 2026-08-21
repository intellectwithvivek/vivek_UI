'use client'

import { Badge, Button, Navbar, ThemeToggle } from '@the_viveksingh/vivek-ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * The site header, built from the library's own `Navbar`.
 *
 * Note `asChild` on the links: it hands the anchor over to `next/link` so client-side
 * navigation and prefetching work, without the library ever depending on a router. That
 * is the whole point of the pattern, and this is the first place it gets exercised for
 * real rather than in a test.
 */
export function SiteHeader() {
  const pathname = usePathname()
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <Navbar sticky bordered>
      <Navbar.Brand asChild>
        <Link href="/">
          VivekUI <Badge tone="neutral">v0.2.2</Badge>
        </Link>
      </Navbar.Brand>

      <Navbar.Links>
        <Navbar.Link asChild active={isActive('/docs')}>
          <Link href="/docs">Docs</Link>
        </Navbar.Link>
        <Navbar.Link asChild active={isActive('/docs/components')}>
          <Link href="/docs/components">Components</Link>
        </Navbar.Link>
        <Navbar.Link asChild active={isActive('/docs/charts')}>
          <Link href="/docs/charts">Charts</Link>
        </Navbar.Link>
        <Navbar.Link asChild active={isActive('/playground')}>
          <Link href="/playground">Playground</Link>
        </Navbar.Link>
      </Navbar.Links>

      <Navbar.Actions>
        <ThemeToggle mode="cycle" />
        <Button asChild size="sm" variant="ghost">
          <a
            aria-label="Buy me a coffee"
            href="https://www.buymeacoffee.com/theviveksingh"
            rel="noopener noreferrer"
            target="_blank"
            title="Buy me a coffee"
          >
            ☕
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a
            href="https://github.com/intellectwithvivek/vivek_UI"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </Button>
      </Navbar.Actions>
    </Navbar>
  )
}
