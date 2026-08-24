'use client'

import { Badge, Button, Navbar, ThemeToggle } from '@the_viveksingh/vivek-ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AccentPicker } from '../components/accent-picker'
import { BRAND_LOGO } from '../lib/brand-logo'
import { LINKS } from '../lib/links'
import { LIBRARY_VERSION_LABEL } from '../lib/version'

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
          {/*
            The logo file is opaque with a white background, so it sits on a white tile
            rather than directly on the header - on the dark theme a bare white square
            would read as a rendering fault. Width and height are set to reserve the box
            before it decodes, which is a layout shift on every page otherwise.
          */}
          <img alt="" className="brand-mark" height={28} src={BRAND_LOGO} width={28} />
          VivekUI <Badge tone="neutral">{LIBRARY_VERSION_LABEL}</Badge>
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
        <Navbar.Link asChild active={isActive('/showcase')}>
          <Link href="/showcase">Showcase</Link>
        </Navbar.Link>
        <Navbar.Link asChild active={isActive('/pages')}>
          <Link href="/pages">Pages</Link>
        </Navbar.Link>
        <Navbar.Link asChild active={isActive('/playground')}>
          <Link href="/playground">Playground</Link>
        </Navbar.Link>
      </Navbar.Links>

      <Navbar.Actions>
        <AccentPicker />
        <ThemeToggle mode="cycle" />
        <Button asChild size="sm" variant="ghost">
          <a
            aria-label="Buy me a coffee"
            href={LINKS.buyMeACoffee}
            rel="noopener noreferrer"
            target="_blank"
            title="Buy me a coffee"
          >
            ☕
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={LINKS.repo} rel="noopener noreferrer" target="_blank">
            GitHub
          </a>
        </Button>
      </Navbar.Actions>
    </Navbar>
  )
}
