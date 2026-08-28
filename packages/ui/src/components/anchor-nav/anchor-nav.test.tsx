/**
 * AnchorNav.
 *
 * jsdom has no layout and no IntersectionObserver, so the observer is stubbed with one
 * that records what it watches and lets the test deliver entries. Scrolling is asserted
 * through `window.scrollTo`, which jsdom also leaves to us.
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { AnchorNav, type AnchorNavItem } from './anchor-nav'

const ITEMS: AnchorNavItem[] = [
  { id: 'intro', label: 'Introduction' },
  {
    id: 'install',
    label: 'Installation',
    children: [
      { id: 'npm', label: 'npm' },
      { id: 'pnpm', label: 'pnpm' },
    ],
  },
  { id: 'usage', label: 'Usage' },
]

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void
let callbacks: Callback[] = []
let observed: Element[] = []
let disconnected = 0
let options: IntersectionObserverInit | undefined

class FakeObserver {
  constructor(cb: Callback, init?: IntersectionObserverInit) {
    callbacks.push(cb)
    options = init
  }
  observe(el: Element) {
    observed.push(el)
  }
  unobserve() {}
  disconnect() {
    disconnected += 1
  }
  takeRecords() {
    return []
  }
}

function Page(props: Partial<Parameters<typeof AnchorNav>[0]> = {}) {
  return (
    <>
      <AnchorNav items={ITEMS} {...props} />
      <main>
        <h2 id="intro">Introduction</h2>
        <h2 id="install">Installation</h2>
        <h3 id="npm">npm</h3>
        <h3 id="pnpm">pnpm</h3>
        <h2 id="usage">Usage</h2>
      </main>
    </>
  )
}

const link = (name: string) => screen.getByRole('link', { name })
/** Deliver observer entries the way the browser would: outside React, so wrapped in act(). */
const deliver = (entries: Partial<IntersectionObserverEntry>[]) => {
  act(() => {
    callbacks.at(-1)?.(entries)
  })
}
const enter = (id: string, top = 10) =>
  deliver([
    {
      isIntersecting: true,
      target: document.getElementById(id) as Element,
      boundingClientRect: { top } as DOMRectReadOnly,
    },
  ])

beforeEach(() => {
  callbacks = []
  observed = []
  disconnected = 0
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  vi.stubGlobal('scrollTo', vi.fn())
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AnchorNav · structure', () => {
  it('renders with zero props as an empty named nav', () => {
    render(<AnchorNav />)
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument()
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })

  it('is a nav of real hash links, nested one level, with the first item current by default', () => {
    render(<Page title="On this page" />)
    const nav = screen.getByRole('navigation', { name: 'On this page' })
    expect(nav.querySelector('.vk-anchor-nav__title')).toHaveTextContent('On this page')
    expect(link('Installation')).toHaveAttribute('href', '#install')
    expect(link('npm')).toHaveAttribute('data-depth', '1')
    expect(link('Installation')).toHaveAttribute('data-depth', '0')
    expect(link('Introduction')).toHaveAttribute('aria-current', 'location')
    expect(link('Usage')).not.toHaveAttribute('aria-current')
  })

  it('label overrides the title as the name; orientation, size, className, style and rest apply', () => {
    render(
      <AnchorNav
        items={ITEMS}
        title="Contents"
        label="Sections"
        orientation="horizontal"
        size="sm"
        className="mine"
        style={{ top: 8 }}
        data-x="y"
      />,
    )
    const nav = screen.getByRole('navigation', { name: 'Sections' })
    expect(nav).toHaveAttribute('data-orientation', 'horizontal')
    expect(nav).toHaveAttribute('data-size', 'sm')
    expect(nav).toHaveClass('vk-anchor-nav', 'mine')
    expect(nav).toHaveStyle({ top: '8px' })
    expect(nav).toHaveAttribute('data-x', 'y')
  })
})

describe('AnchorNav · scroll spy', () => {
  it('observes every target, honours offset in the root margin, and marks the nearest one current', () => {
    const onActiveChange = vi.fn()
    render(<Page offset={64} onActiveChange={onActiveChange} />)
    expect(observed.map((el) => el.id)).toEqual(['intro', 'install', 'npm', 'pnpm', 'usage'])
    expect(options?.rootMargin).toBe('-64px 0px -40% 0px')
    enter('usage', 300)
    expect(link('Usage')).toHaveAttribute('aria-current', 'location')
    expect(onActiveChange).toHaveBeenLastCalledWith('usage')
    // Two in view: the one nearest the top wins.
    deliver([
      {
        isIntersecting: true,
        target: document.getElementById('install') as Element,
        boundingClientRect: { top: 40 } as DOMRectReadOnly,
      },
    ])
    expect(link('Installation')).toHaveAttribute('aria-current', 'location')
  })

  it('with nothing in view, the last section scrolled past stays current', () => {
    render(<Page />)
    const tops: Record<string, number> = {
      intro: -500,
      install: -200,
      npm: -100,
      pnpm: 900,
      usage: 1200,
    }
    for (const [id, top] of Object.entries(tops)) {
      const el = document.getElementById(id) as HTMLElement
      el.getBoundingClientRect = () => ({ top }) as DOMRect
    }
    deliver([
      {
        isIntersecting: false,
        target: document.getElementById('intro') as Element,
        boundingClientRect: { top: -500 } as DOMRectReadOnly,
      },
    ])
    expect(link('npm')).toHaveAttribute('aria-current', 'location')
  })

  it('is controllable and disconnects its observer on unmount', () => {
    const { rerender, unmount } = render(<Page activeId="usage" />)
    expect(link('Usage')).toHaveAttribute('aria-current', 'location')
    enter('intro')
    expect(link('Usage')).toHaveAttribute('aria-current', 'location') // controlled: unchanged
    rerender(<Page activeId="pnpm" />)
    expect(link('pnpm')).toHaveAttribute('aria-current', 'location')
    unmount()
    expect(disconnected).toBeGreaterThan(0)
  })

  it('does nothing without an observer or without targets', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<AnchorNav items={ITEMS} />)
    expect(callbacks).toHaveLength(0)
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    render(<AnchorNav items={[{ id: 'nowhere', label: 'Nowhere' }]} />)
    expect(callbacks).toHaveLength(0)
  })
})

describe('AnchorNav · jumping', () => {
  it('click scrolls to the target minus offset, replaces the hash, sets current and moves focus', () => {
    const replace = vi.spyOn(window.history, 'replaceState')
    render(<Page offset={50} />)
    const usage = document.getElementById('usage') as HTMLElement
    usage.getBoundingClientRect = () => ({ top: 800 }) as DOMRect
    const event = fireEvent.click(link('Usage'))
    expect(event).toBe(false) // default prevented
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 750, behavior: 'smooth' })
    expect(replace).toHaveBeenCalledWith(null, '', '#usage')
    expect(link('Usage')).toHaveAttribute('aria-current', 'location')
    expect(usage).toHaveFocus()
    expect(usage).toHaveAttribute('tabindex', '-1')
    fireEvent.blur(usage)
    expect(usage).not.toHaveAttribute('tabindex')
    replace.mockRestore()
  })

  it('jumps instantly under prefers-reduced-motion or with smooth={false}', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    const { unmount } = render(<Page />)
    fireEvent.click(link('Usage'))
    expect(window.scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'auto' }))
    unmount()
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
    render(<Page smooth={false} />)
    fireEvent.click(link('Introduction'))
    expect(window.scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'auto' }))
  })

  it('leaves the click to the browser when the target does not exist', () => {
    render(<AnchorNav items={[{ id: 'missing', label: 'Missing' }]} />)
    const event = fireEvent.click(link('Missing'))
    expect(event).toBe(true)
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})

describe('AnchorNav · a11y', () => {
  it('has no axe violations', async () => {
    const { container } = render(<Page title="On this page" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
