import { fireEvent, render, screen, within } from '@testing-library/react'
import { type AnchorHTMLAttributes, createRef, forwardRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Breadcrumb } from './breadcrumb'
import { CommandPalette, type CommandPaletteEntry } from './command-palette'
import { Navbar } from './navbar'
import { Pagination } from './pagination'
import { ScrollArea } from './scroll-area'
import { Sidebar } from './sidebar'

/* ---------------------------------------------------------------- fixtures */

/** Stands in for `next/link` — a component that owns its own ref and className. */
const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  function RouterLink({ children, ...rest }, ref) {
    return (
      <a ref={ref} data-router="" {...rest}>
        {children}
      </a>
    )
  },
)

function Icon() {
  return <svg viewBox="0 0 10 10" aria-hidden="true" focusable="false" />
}

const paletteItems: CommandPaletteEntry[] = [
  {
    heading: 'Navigate',
    items: [
      { id: 'home', label: 'Go to dashboard', keywords: ['start'] },
      { id: 'inbox', label: 'Go to inbox', description: 'Unread messages' },
    ],
  },
  {
    heading: 'Actions',
    items: [
      { id: 'new', label: 'Create project' },
      { id: 'archive', label: 'Archive project', disabled: true },
    ],
  },
]

function FullNavbar() {
  return (
    <Navbar sticky>
      <Navbar.Brand href="/">VivekUI</Navbar.Brand>
      <Navbar.Links>
        <Navbar.Link href="/docs" active>
          Docs
        </Navbar.Link>
        <Navbar.Link href="/components" icon={<Icon />}>
          Components
        </Navbar.Link>
        <Navbar.Link asChild>
          <RouterLink href="/blog">Blog</RouterLink>
        </Navbar.Link>
      </Navbar.Links>
      <Navbar.Actions>
        <button type="button">Sign in</button>
      </Navbar.Actions>
      <Navbar.Toggle />
    </Navbar>
  )
}

/* ------------------------------------------------------------------ Navbar */

describe('Navbar', () => {
  it('renders with zero props without throwing', () => {
    const { container } = render(<Navbar />)
    expect(container.querySelector('.vk-navbar')).not.toBeNull()
  })

  it('is a nav landmark with a default accessible name', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav.tagName).toBe('NAV')
    expect(nav).toHaveAttribute('data-size', 'md')
    // `bordered` defaults on, `sticky` defaults off.
    expect(nav).toHaveAttribute('data-bordered', 'true')
    expect(nav).not.toHaveAttribute('data-sticky')
  })

  it('lets the caller name the landmark, and stands aside for aria-labelledby', () => {
    const { unmount } = render(<Navbar aria-label="Product" />)
    expect(screen.getByRole('navigation', { name: 'Product' })).toBeInTheDocument()
    unmount()

    render(
      <>
        <h2 id="nav-heading">Site</h2>
        <Navbar aria-labelledby="nav-heading" />
      </>,
    )
    const nav = screen.getByRole('navigation', { name: 'Site' })
    expect(nav).not.toHaveAttribute('aria-label')
  })

  it('honours sticky, bordered, size and container', () => {
    const { container } = render(<Navbar sticky bordered={false} size="lg" container="xl" />)
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('data-sticky', 'true')
    expect(nav).not.toHaveAttribute('data-bordered')
    expect(nav).toHaveAttribute('data-size', 'lg')
    expect(container.querySelector('.vk-container')).toHaveAttribute('data-size', 'xl')
  })

  it('merges className and forwards its ref', () => {
    const ref = createRef<HTMLElement>()
    render(<Navbar ref={ref} className="mine" />)
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('vk-navbar', 'mine')
    expect(ref.current).toBe(nav)
  })

  it('keeps every link reachable and marks the active one', () => {
    render(<FullNavbar />)

    // All three links are in the accessibility tree at once — the collapse is CSS, so
    // there is exactly one copy of them in the DOM at every width.
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Components' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(4) // three links plus the brand
  })

  it('renders Navbar.Link asChild as the caller element, class names merged', () => {
    render(<FullNavbar />)
    const blog = screen.getByRole('link', { name: 'Blog' })
    expect(blog).toHaveAttribute('data-router', '')
    expect(blog).toHaveClass('vk-navbar__link')
    expect(blog).toHaveAttribute('href', '/blog')
  })

  it('wires the toggle to the links with aria-expanded and aria-controls', () => {
    render(<FullNavbar />)

    const toggle = screen.getByRole('button', { name: 'Open menu' })
    const list = screen.getByRole('list')

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', list.id)
    expect(list.id).not.toBe('')
    expect(list).toHaveAttribute('data-state', 'closed')

    fireEvent.click(toggle)

    const open = screen.getByRole('button', { name: 'Close menu' })
    expect(open).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('list')).toHaveAttribute('data-state', 'open')

    fireEvent.click(open)
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('does not point aria-controls at anything when there are no links', () => {
    render(
      <Navbar>
        <Navbar.Toggle />
      </Navbar>,
    )
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-controls')
  })

  it('closes the sheet on Escape and on selecting a link', () => {
    render(<FullNavbar />)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Docs' }))
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
  })

  it('moves focus into the sheet on open and back to the toggle on close', () => {
    render(<FullNavbar />)

    const toggle = screen.getByRole('button', { name: 'Open menu' })
    toggle.focus()
    fireEvent.click(toggle)

    // The focus trap takes the first link in the sheet, so a thumb-and-keyboard user
    // lands inside the menu they just opened rather than behind it.
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Docs' }))

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open menu' }))
  })

  it('keeps Navbar.Actions out of the collapsing sheet', () => {
    render(<FullNavbar />)
    const list = screen.getByRole('list')
    const signIn = screen.getByRole('button', { name: 'Sign in' })
    // Actions live in the bar at every width; only the links collapse.
    expect(list.contains(signIn)).toBe(false)
  })

  it('reports open state to a controlled caller', () => {
    const onOpenChange = vi.fn()
    render(
      <Navbar open={false} onOpenChange={onOpenChange}>
        <Navbar.Links>
          <Navbar.Link href="/a">A</Navbar.Link>
        </Navbar.Links>
        <Navbar.Toggle />
      </Navbar>,
    )

    fireEvent.click(screen.getByRole('button'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    // Controlled and told to stay shut, so it does.
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('drops an unsafe href on Brand and Link, and hardens target="_blank"', () => {
    render(
      <Navbar>
        {/* biome-ignore lint/security/noScriptUrl: the hostile href is the fixture — the assertion is that it never reaches the DOM. */}
        <Navbar.Brand href="javascript:alert(1)">Brand</Navbar.Brand>
        <Navbar.Links>
          {/* biome-ignore lint/security/noScriptUrl: the hostile href is the fixture. */}
          <Navbar.Link href="javascript:alert(1)">Bad</Navbar.Link>
          <Navbar.Link href="https://example.com" target="_blank">
            Out
          </Navbar.Link>
        </Navbar.Links>
      </Navbar>,
    )

    // No href at all, so neither is a link any more.
    expect(screen.queryByRole('link', { name: 'Brand' })).toBeNull()
    expect(screen.getByText('Brand').tagName).toBe('SPAN')
    expect(screen.getByText('Bad')).not.toHaveAttribute('href')

    const out = screen.getByRole('link', { name: 'Out' })
    expect(out).toHaveAttribute('href', 'https://example.com')
    expect(out.getAttribute('rel')).toContain('noopener')
    expect(out.getAttribute('rel')).toContain('noreferrer')
  })

  it('renders on the server', () => {
    expect(() => renderToString(<FullNavbar />)).not.toThrow()
  })

  it('is axe clean, open and closed', async () => {
    const { container } = render(<FullNavbar />)
    expect(await axe(container)).toHaveNoViolations()

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* ----------------------------------------------------------------- Sidebar */

describe('Sidebar', () => {
  it('renders with zero props without throwing', () => {
    const { container } = render(<Sidebar />)
    expect(container.querySelector('.vk-sidebar')).not.toBeNull()
  })

  it('is a named nav landmark, expanded by default', () => {
    render(<Sidebar />)
    const nav = screen.getByRole('navigation', { name: 'Sidebar' })
    expect(nav).not.toHaveAttribute('data-collapsed')
    expect(nav).toHaveAttribute('data-side', 'start')
  })

  it('honours width and side', () => {
    render(<Sidebar width="20rem" side="end" />)
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('data-side', 'end')
    expect(nav.style.getPropertyValue('--vk-sidebar-width')).toBe('20rem')
  })

  it('names each section list from its title', () => {
    render(
      <Sidebar>
        <Sidebar.Section title="Workspace">
          <Sidebar.Item href="/">Dashboard</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar>,
    )
    const list = screen.getByRole('list', { name: 'Workspace' })
    expect(within(list).getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('keeps every item accessibly named while collapsed', () => {
    render(
      <Sidebar defaultCollapsed>
        <Sidebar.Section title="Workspace">
          <Sidebar.Item href="/" icon={<Icon />} active>
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item href="/inbox" icon={<Icon />} badge={12}>
            Inbox
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar>,
    )

    expect(screen.getByRole('navigation')).toHaveAttribute('data-collapsed', 'true')
    // The whole point: icons-only visually, but the labels are still in the DOM and
    // still the accessible names.
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /Inbox/ })).toBeInTheDocument()
    // And the badge's count is still readable, not swapped out for a dot in the DOM.
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Workspace' })).toBeInTheDocument()
  })

  it('toggles collapsed and reports it, and refuses when collapsible is off', () => {
    const onCollapsedChange = vi.fn()
    const { unmount } = render(
      <Sidebar onCollapsedChange={onCollapsedChange}>
        <Sidebar.Toggle />
      </Sidebar>,
    )

    const nav = screen.getByRole('navigation')
    const toggle = screen.getByRole('button', { name: 'Collapse sidebar' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAttribute('aria-controls', nav.id)

    fireEvent.click(toggle)
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByRole('navigation')).toHaveAttribute('data-collapsed', 'true')
    unmount()

    render(
      <Sidebar collapsible={false} defaultCollapsed>
        <Sidebar.Toggle />
      </Sidebar>,
    )
    expect(screen.getByRole('navigation')).not.toHaveAttribute('data-collapsed')
  })

  it('renders an item asChild, with our class names and aria-current merged on', () => {
    const ref = createRef<HTMLAnchorElement>()
    render(
      <Sidebar>
        <Sidebar.Section>
          <Sidebar.Item asChild active ref={ref}>
            <RouterLink href="/settings">Settings</RouterLink>
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar>,
    )

    const link = screen.getByRole('link', { name: 'Settings' })
    expect(link).toHaveAttribute('data-router', '')
    expect(link).toHaveClass('vk-sidebar__link')
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(ref.current).toBe(link)
  })

  it('drops an unsafe href on an item', () => {
    render(
      <Sidebar>
        <Sidebar.Section>
          {/* biome-ignore lint/security/noScriptUrl: the hostile href is the fixture. */}
          <Sidebar.Item href="javascript:alert(1)">Bad</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar>,
    )
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('Bad')).toBeInTheDocument()
  })

  it('is axe clean, expanded and collapsed', async () => {
    for (const collapsed of [false, true]) {
      const { container, unmount } = render(
        <Sidebar defaultCollapsed={collapsed}>
          <Sidebar.Toggle />
          <Sidebar.Section title="Workspace">
            <Sidebar.Item href="/" icon={<Icon />} active>
              Dashboard
            </Sidebar.Item>
            <Sidebar.Item href="/inbox" icon={<Icon />} badge={12}>
              Inbox
            </Sidebar.Item>
          </Sidebar.Section>
        </Sidebar>,
      )
      expect(await axe(container)).toHaveNoViolations()
      unmount()
    }
  })
})

/* -------------------------------------------------------------- Breadcrumb */

describe('Breadcrumb', () => {
  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Docs', href: '/docs' },
    { label: 'Breadcrumb' },
  ]

  it('renders with zero props without throwing', () => {
    const { container } = render(<Breadcrumb />)
    expect(container.querySelector('.vk-breadcrumb')).not.toBeNull()
  })

  it('is a named nav around an ordered list', () => {
    const { container } = render(<Breadcrumb items={trail} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(container.querySelector('ol')).not.toBeNull()
  })

  it('puts aria-current on the last item only, and does not link it', () => {
    render(<Breadcrumb items={trail} />)

    const current = screen.getByText('Breadcrumb')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current.tagName).toBe('SPAN')

    const links = screen.getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual(['Home', 'Docs'])
    for (const link of links) expect(link).not.toHaveAttribute('aria-current')

    // Exactly one aria-current in the whole trail.
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(1)
  })

  it('honours an explicit current on a trail that continues past the current page', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Docs', href: '/docs', current: true },
          { label: 'Breadcrumb', href: '/docs/breadcrumb' },
        ]}
      />,
    )
    expect(screen.getByText('Docs')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Breadcrumb' })).toBeInTheDocument()
  })

  it('hides the separators from assistive tech', () => {
    const { container } = render(<Breadcrumb items={trail} />)
    const separators = container.querySelectorAll('.vk-breadcrumb__separator')
    expect(separators).toHaveLength(trail.length - 1)
    for (const separator of separators) {
      expect(separator).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('accepts a custom separator', () => {
    const { container } = render(<Breadcrumb items={trail} separator="/" />)
    const first = container.querySelector('.vk-breadcrumb__separator')
    expect(first).toHaveTextContent('/')
  })

  it('supports the compound form and asChild', () => {
    render(
      <Breadcrumb>
        <Breadcrumb.Item asChild>
          <RouterLink href="/">Home</RouterLink>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item current>Here</Breadcrumb.Item>
      </Breadcrumb>,
    )

    const home = screen.getByRole('link', { name: 'Home' })
    expect(home).toHaveAttribute('data-router', '')
    expect(home).toHaveClass('vk-breadcrumb__link')
    expect(screen.getByText('Here')).toHaveAttribute('aria-current', 'page')
  })

  it('drops an unsafe href rather than rendering a dead link', () => {
    render(
      <Breadcrumb items={[{ label: 'Evil', href: 'javascript:alert(1)' }, { label: 'Here' }]} />,
    )
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('Evil').tagName).toBe('SPAN')
    expect(screen.getByText('Evil')).not.toHaveAttribute('aria-current')
  })

  it('renders on the server', () => {
    expect(() => renderToString(<Breadcrumb items={trail} />)).not.toThrow()
  })

  it('is axe clean', async () => {
    const { container } = render(
      <Breadcrumb items={[{ label: 'Home', href: '/', icon: <Icon /> }, ...trail.slice(1)]} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------------- Pagination */

describe('Pagination', () => {
  const pages = () =>
    screen
      .getAllByRole('button')
      .filter((button) => button.classList.contains('vk-pagination__page'))
      .map((button) => button.textContent)

  it('renders with zero props without throwing', () => {
    const { container } = render(<Pagination />)
    expect(container.querySelector('.vk-pagination')).not.toBeNull()
  })

  it('renders nothing for pageCount 0', () => {
    const { container } = render(<Pagination pageCount={0} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a single inert page for pageCount 1', () => {
    render(<Pagination pageCount={1} />)
    expect(pages()).toEqual(['1'])
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('is a named nav around a list', () => {
    render(<Pagination pageCount={5} />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('marks only the current page with aria-current', () => {
    render(<Pagination page={3} pageCount={5} />)
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(1)
  })

  it('disables the right step button at each end', () => {
    const { unmount } = render(<Pagination page={1} pageCount={9} showFirstLast />)
    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Last page' })).toBeEnabled()
    unmount()

    render(<Pagination page={9} pageCount={9} showFirstLast />)
    expect(screen.getByRole('button', { name: 'First page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled()
  })

  it('clamps an out-of-range page instead of throwing', () => {
    const { unmount } = render(<Pagination page={99} pageCount={4} />)
    expect(screen.getByRole('button', { name: 'Page 4' })).toHaveAttribute('aria-current', 'page')
    unmount()

    render(<Pagination page={-3} pageCount={4} />)
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
  })

  it('reports the page the user asked for, and never the current one', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={3} pageCount={9} onPageChange={onPageChange} showFirstLast />)

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(4)
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(2)
    fireEvent.click(screen.getByRole('button', { name: 'Last page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(9)
    fireEvent.click(screen.getByRole('button', { name: 'First page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(1)

    onPageChange.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('windows the page numbers around the current one, at a constant width', () => {
    const widths = new Set<number>()
    for (const page of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      const { container, unmount } = render(<Pagination page={page} pageCount={10} />)
      const shown = [
        ...container.querySelectorAll('.vk-pagination__page, .vk-pagination__ellipsis'),
      ]
      widths.add(shown.length)
      // First and last are always reachable in one click.
      expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument()
      unmount()
    }
    expect([...widths]).toEqual([7])
  })

  it('shows every page when there are few enough, with no gaps', () => {
    const { container } = render(<Pagination page={2} pageCount={6} />)
    expect(pages()).toEqual(['1', '2', '3', '4', '5', '6'])
    expect(container.querySelector('.vk-pagination__ellipsis')).toBeNull()
  })

  it('widens the window with siblingCount', () => {
    render(<Pagination page={10} pageCount={20} siblingCount={2} />)
    expect(pages()).toEqual(['1', '8', '9', '10', '11', '12', '20'])
  })

  it('hides the gap glyph from assistive tech', () => {
    const { container } = render(<Pagination page={5} pageCount={20} />)
    const gaps = container.querySelectorAll('.vk-pagination__ellipsis')
    expect(gaps).toHaveLength(2)
    for (const gap of gaps) expect(gap).toHaveAttribute('aria-hidden', 'true')
  })

  it('takes localised labels', () => {
    render(
      <Pagination
        page={2}
        pageCount={4}
        labels={{ root: 'Seiten', previous: 'Zurück', page: (n) => `Seite ${n}` }}
      />,
    )
    expect(screen.getByRole('navigation', { name: 'Seiten' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zurück' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Seite 2' })).toBeInTheDocument()
    // Unspecified strings keep their defaults.
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
  })

  it('merges className and forwards its ref', () => {
    const ref = createRef<HTMLElement>()
    render(<Pagination ref={ref} className="mine" pageCount={3} />)
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('vk-pagination', 'mine')
    expect(ref.current).toBe(nav)
  })

  it('is axe clean at both ends and in the middle', async () => {
    for (const page of [1, 5, 20]) {
      const { container, unmount } = render(
        <Pagination page={page} pageCount={20} showFirstLast size="sm" />,
      )
      expect(await axe(container)).toHaveNoViolations()
      unmount()
    }
  })
})

/* ---------------------------------------------------------- CommandPalette */

/** The palette portals to `document.body`, so queries go through `screen`. */
function openPalette(props: Partial<Parameters<typeof CommandPalette>[0]> = {}) {
  const onSelect = vi.fn()
  const result = render(
    <CommandPalette defaultOpen items={paletteItems} onSelect={onSelect} {...props} />,
  )
  const input = screen.getByRole('combobox')
  return { ...result, input, onSelect }
}

const activeOption = () => {
  const id = screen.getByRole('combobox').getAttribute('aria-activedescendant')
  return id === null ? null : document.getElementById(id)
}

describe('CommandPalette', () => {
  it('renders nothing while closed', () => {
    const { container } = render(<CommandPalette items={paletteItems} />)
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('renders with zero props without throwing', () => {
    expect(() => render(<CommandPalette defaultOpen />)).not.toThrow()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('wires the combobox to the listbox', () => {
    openPalette()

    const input = screen.getByRole('combobox')
    const listbox = screen.getByRole('listbox', { name: 'Results' })

    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(input).toHaveAttribute('aria-controls', listbox.id)
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAccessibleName('Command palette')
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Command palette')
    expect(screen.getAllByRole('option')).toHaveLength(4)
    expect(screen.getAllByRole('group')).toHaveLength(2)
  })

  it('starts with the first option active and focus in the input', () => {
    const { input } = openPalette()
    expect(document.activeElement).toBe(input)
    expect(activeOption()).toHaveTextContent('Go to dashboard')
    expect(activeOption()).toHaveAttribute('aria-selected', 'true')
  })

  it('moves the active option with the arrows WITHOUT moving focus', () => {
    const { input } = openPalette()

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(activeOption()).toHaveTextContent('Go to inbox')
    expect(document.activeElement).toBe(input)

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(activeOption()).toHaveTextContent('Create project')
    expect(document.activeElement).toBe(input)

    // Disabled options are skipped, and the list wraps back to the top.
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(activeOption()).toHaveTextContent('Go to dashboard')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(activeOption()).toHaveTextContent('Create project')
    expect(document.activeElement).toBe(input)

    // Exactly one option is ever aria-selected.
    expect(document.querySelectorAll('[role="option"][aria-selected="true"]')).toHaveLength(1)
    // No option is focusable — that is what aria-activedescendant is for.
    for (const option of screen.getAllByRole('option')) {
      expect(option).not.toHaveAttribute('tabindex')
    }
  })

  it('never makes a disabled option active', () => {
    const { input } = openPalette()
    const archive = screen.getByRole('option', { name: /Archive project/ })
    expect(archive).toHaveAttribute('aria-disabled', 'true')

    for (let step = 0; step < 6; step += 1) {
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(activeOption()).not.toBe(archive)
    }
  })

  it('runs the active command on Enter and closes', () => {
    const { input, onSelect } = openPalette()

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ id: 'inbox' })
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('runs a command on click, and ignores a disabled one', () => {
    const { onSelect } = openPalette()

    fireEvent.click(screen.getByRole('option', { name: /Archive project/ }))
    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('combobox')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('option', { name: /Create project/ }))
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ id: 'new' })
  })

  it('closes on Escape', () => {
    openPalette()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('filters on label, description and keywords, and resets the active option', () => {
    const { input } = openPalette()

    fireEvent.change(input, { target: { value: 'inbox' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(activeOption()).toHaveTextContent('Go to inbox')

    // Description text counts.
    fireEvent.change(input, { target: { value: 'unread' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)

    // Hidden keywords count.
    fireEvent.change(input, { target: { value: 'start' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(activeOption()).toHaveTextContent('Go to dashboard')

    // Terms may arrive in any order.
    fireEvent.change(input, { target: { value: 'project create' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)

    // A whole group disappears when nothing in it matches.
    fireEvent.change(input, { target: { value: 'go' } })
    expect(screen.getAllByRole('group')).toHaveLength(1)
  })

  it('shows the empty state, and keeps aria-controls valid with no results', () => {
    const { input } = openPalette({ emptyState: 'Nothing here' })

    fireEvent.change(input, { target: { value: 'zzzz' } })

    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).not.toHaveAttribute('aria-activedescendant')
    // The listbox is still in the document, so aria-controls does not dangle.
    const controls = input.getAttribute('aria-controls')
    expect(controls).not.toBeNull()
    expect(document.getElementById(controls ?? '')).not.toBeNull()
  })

  it('clears the query when it closes', () => {
    const { input, onSelect } = openPalette()
    fireEvent.change(input, { target: { value: 'inbox' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalled()
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('opens and closes on the hotkey', () => {
    render(<CommandPalette items={paletteItems} />)

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(screen.getByRole('combobox')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('ignores the hotkey without its modifier, and when turned off', () => {
    const { unmount } = render(<CommandPalette items={paletteItems} />)
    fireEvent.keyDown(document, { key: 'k' })
    expect(screen.queryByRole('combobox')).toBeNull()
    unmount()

    render(<CommandPalette items={paletteItems} hotkey={null} />)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('accepts a custom hotkey', () => {
    render(<CommandPalette items={paletteItems} hotkey="ctrl+shift+p" />)
    fireEvent.keyDown(document, { key: 'p', ctrlKey: true, shiftKey: true })
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('accepts loose items and a controlled query', () => {
    function Harness() {
      const [query, setQuery] = useState('inbox')
      return (
        <CommandPalette
          defaultOpen
          query={query}
          onQueryChange={setQuery}
          items={[
            { id: 'a', label: 'Go to inbox' },
            { id: 'b', label: 'Go to archive' },
          ]}
        />
      )
    }
    render(<Harness />)

    expect(screen.getAllByRole('option')).toHaveLength(1)
    // No heading, so no group wrapper is rendered.
    expect(screen.queryAllByRole('group')).toHaveLength(0)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'go' } })
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('is axe clean, with results and without', async () => {
    openPalette()
    expect(await axe(document.body)).toHaveNoViolations()

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzzz' } })
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------------- ScrollArea */

describe('ScrollArea', () => {
  it('renders with zero props without throwing, and defaults sensibly', () => {
    const { container } = render(<ScrollArea>content</ScrollArea>)
    const area = container.querySelector('.vk-scroll-area')
    expect(area).not.toBeNull()
    expect(area).toHaveAttribute('data-orientation', 'vertical')
    expect(area).toHaveAttribute('data-scrollbar', 'auto')
    expect(area).toHaveAttribute('data-thickness', 'thin')
  })

  it('stays focusable so it can be scrolled by keyboard', () => {
    const { container } = render(<ScrollArea aria-label="Log">content</ScrollArea>)
    const area = container.querySelector('.vk-scroll-area')
    expect(area).toHaveAttribute('tabindex', '0')
    ;(area as HTMLElement).focus()
    expect(document.activeElement).toBe(area)
  })

  it('lets the caller opt out of the tab stop', () => {
    const { container } = render(<ScrollArea tabIndex={-1}>content</ScrollArea>)
    expect(container.querySelector('.vk-scroll-area')).toHaveAttribute('tabindex', '-1')
  })

  it('never hides the overflow, only the scrollbar', () => {
    const { container } = render(<ScrollArea scrollbar="hidden">content</ScrollArea>)
    // The distinction lives in CSS; the contract this asserts is that `hidden` is carried
    // as a data attribute rather than as an inline `overflow: hidden`.
    const area = container.querySelector('.vk-scroll-area') as HTMLElement
    expect(area).toHaveAttribute('data-scrollbar', 'hidden')
    expect(area.style.overflow).toBe('')
  })

  it('honours orientation, scrollbar and thickness', () => {
    const { container } = render(
      <ScrollArea orientation="both" scrollbar="always" thickness="auto">
        content
      </ScrollArea>,
    )
    const area = container.querySelector('.vk-scroll-area')
    expect(area).toHaveAttribute('data-orientation', 'both')
    expect(area).toHaveAttribute('data-scrollbar', 'always')
    expect(area).toHaveAttribute('data-thickness', 'auto')
  })

  it('merges className and forwards its ref', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <ScrollArea ref={ref} className="mine">
        content
      </ScrollArea>,
    )
    const area = container.querySelector('.vk-scroll-area')
    expect(area).toHaveClass('vk-scroll-area', 'mine')
    expect(ref.current).toBe(area)
  })

  it('renders on the server', () => {
    expect(() => renderToString(<ScrollArea>content</ScrollArea>)).not.toThrow()
  })

  it('is axe clean', async () => {
    const { container } = render(
      <ScrollArea aria-label="Changelog">
        <p>Something long.</p>
      </ScrollArea>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------- the family, together */

describe('the navigation family', () => {
  it('composes into an app shell that is axe clean', async () => {
    const { container } = render(
      <div>
        <Navbar sticky>
          <Navbar.Brand href="/">VivekUI</Navbar.Brand>
          <Navbar.Links>
            <Navbar.Link href="/docs" active>
              Docs
            </Navbar.Link>
          </Navbar.Links>
          <Navbar.Toggle />
        </Navbar>
        <div>
          <Sidebar>
            <Sidebar.Toggle />
            <Sidebar.Section title="Workspace">
              <Sidebar.Item href="/" icon={<Icon />} active>
                Dashboard
              </Sidebar.Item>
            </Sidebar.Section>
          </Sidebar>
          <main>
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Reports' }]} />
            <ScrollArea aria-label="Rows">
              <p>Rows go here.</p>
            </ScrollArea>
            <Pagination page={4} pageCount={12} showFirstLast />
          </main>
        </div>
      </div>,
    )

    expect(await axe(container)).toHaveNoViolations()

    // Every landmark on the page has its own name, so a landmark list is navigable.
    const names = screen
      .getAllByRole('navigation')
      .map((nav) => nav.getAttribute('aria-label') ?? nav.getAttribute('aria-labelledby'))
    expect(names).toEqual(['Main', 'Sidebar', 'Breadcrumb', 'Pagination'])
    expect(new Set(names).size).toBe(names.length)
  })
})
