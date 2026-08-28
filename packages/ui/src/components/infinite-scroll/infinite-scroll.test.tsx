/**
 * InfiniteScroll.
 *
 * jsdom has no IntersectionObserver, which is convenient: the default environment IS
 * the degraded one, so the fallback-button contract is tested for real, not simulated.
 * The observer paths run against a recorded stub. What the tests pin: the re-entry
 * guard across overlapping intersections, the re-arm after a load settles (short pages
 * keep loading), disconnect on `hasMore: false` and on unmount, the always-mounted
 * status region, and that a rejected page never wedges the list.
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { InfiniteScroll } from './infinite-scroll'

const sentinel = (container: HTMLElement) =>
  container.querySelector('.vk-infinite-scroll__sentinel') as HTMLElement

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  readonly callback: IntersectionObserverCallback
  readonly options: IntersectionObserverInit | undefined
  targets: Element[] = []
  disconnected = false
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
    MockIntersectionObserver.instances.push(this)
  }
  observe(target: Element) {
    this.targets.push(target)
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true
  }
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  /** Deliver one entry, the way the browser would. */
  fire(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting, target: this.targets[0] } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
}

const lastObserver = (): MockIntersectionObserver => {
  const io = MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]
  if (!io) throw new Error('no IntersectionObserver was constructed')
  return io
}

describe('InfiniteScroll · structure & contract', () => {
  it('renders children and keeps the status live region mounted even while idle', () => {
    render(
      <InfiniteScroll hasMore onLoadMore={() => {}}>
        <p>Row one</p>
      </InfiniteScroll>,
    )
    expect(screen.getByText('Row one')).toBeInTheDocument()
    // Mounted and empty: a live region inserted at announcement time is the one
    // screen readers miss.
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('merges className and style, spreads rest, and forwards the ref to the root', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <InfiniteScroll
        className="mine"
        data-testid="feed"
        hasMore
        onLoadMore={() => {}}
        ref={ref}
        style={{ maxHeight: '10rem' }}
      />,
    )
    const root = container.firstElementChild as HTMLElement
    expect(ref.current).toBe(root)
    expect(root).toHaveClass('vk-infinite-scroll', 'mine')
    expect(root).toHaveAttribute('data-testid', 'feed')
    expect(root.style.maxHeight).toBe('10rem')
  })

  it('hides the sentinel from assistive tech', () => {
    const { container } = render(<InfiniteScroll hasMore onLoadMore={() => {}} />)
    expect(sentinel(container)).toHaveAttribute('aria-hidden', 'true')
  })

  it('inverse puts the sentinel before the content; default puts it after', () => {
    const { container, rerender } = render(
      <InfiniteScroll hasMore inverse onLoadMore={() => {}}>
        <p data-testid="content">Older messages above</p>
      </InfiniteScroll>,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.firstElementChild).toBe(sentinel(container))

    rerender(
      <InfiniteScroll hasMore onLoadMore={() => {}}>
        <p data-testid="content">Feed rows above the sentinel</p>
      </InfiniteScroll>,
    )
    const content = screen.getByTestId('content')
    expect(content.compareDocumentPosition(sentinel(container))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })
})

describe('InfiniteScroll · fallback button (no IntersectionObserver, jsdom native)', () => {
  it('renders a real "Load more" button by default when the observer is missing', () => {
    render(<InfiniteScroll hasMore onLoadMore={() => {}} />)
    expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument()
  })

  it('loadMoreButton={false} suppresses it, even with no observer to fall back from', () => {
    render(<InfiniteScroll hasMore loadMoreButton={false} onLoadMore={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
  })

  it('clicking loads once, disables while pending, and re-arms after the promise settles', async () => {
    let resolveLoad!: () => void
    const onLoadMore = vi.fn(() => new Promise<void>((r) => (resolveLoad = r)))
    render(<InfiniteScroll hasMore onLoadMore={onLoadMore} />)
    const button = screen.getByRole('button', { name: 'Load more' })

    fireEvent.click(button)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    expect(button).toBeDisabled()
    // A disabled button swallows the click, and the ref guard backs it up.
    fireEvent.click(button)
    expect(onLoadMore).toHaveBeenCalledTimes(1)

    await act(async () => resolveLoad())
    expect(button).toBeEnabled()
    fireEvent.click(button)
    expect(onLoadMore).toHaveBeenCalledTimes(2)
  })

  it('shows the default loader with a hidden "Loading more" only while pending', async () => {
    let resolveLoad!: () => void
    const { container } = render(
      <InfiniteScroll hasMore onLoadMore={() => new Promise<void>((r) => (resolveLoad = r))} />,
    )
    expect(screen.queryByText('Loading more')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))
    expect(screen.getByRole('status')).toHaveTextContent('Loading more')
    expect(container.querySelector('.vk-infinite-scroll__spinner')).toBeInTheDocument()

    await act(async () => resolveLoad())
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('a custom loader slot replaces the default indicator', () => {
    const { container } = render(
      <InfiniteScroll
        hasMore
        loader={<em data-testid="custom-loader">fetching…</em>}
        onLoadMore={() => new Promise<void>(() => {})}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))
    expect(screen.getByTestId('custom-loader')).toBeInTheDocument()
    expect(container.querySelector('.vk-infinite-scroll__spinner')).not.toBeInTheDocument()
    // The announcement is the component's job regardless of what the loader looks like.
    expect(screen.getByRole('status')).toHaveTextContent('Loading more')
  })

  it('a rejected load releases the guard so the user can retry', async () => {
    let rejectLoad!: (reason: Error) => void
    const onLoadMore = vi.fn(() => new Promise<void>((_, r) => (rejectLoad = r)))
    render(<InfiniteScroll hasMore onLoadMore={onLoadMore} />)
    const button = screen.getByRole('button', { name: 'Load more' })

    fireEvent.click(button)
    await act(async () => rejectLoad(new Error('network down')))
    expect(button).toBeEnabled()
    fireEvent.click(button)
    expect(onLoadMore).toHaveBeenCalledTimes(2)
  })

  it('hasMore={false} renders endContent, drops the button, and never loads', () => {
    const onLoadMore = vi.fn()
    render(
      <InfiniteScroll endContent="You're all caught up" hasMore={false} onLoadMore={onLoadMore} />,
    )
    expect(screen.getByText("You're all caught up")).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('without endContent the end state renders nothing extra', () => {
    const { container } = render(<InfiniteScroll hasMore={false} onLoadMore={() => {}} />)
    expect(container.querySelector('.vk-infinite-scroll__end')).not.toBeInTheDocument()
  })
})

describe('InfiniteScroll · observer', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('observes the sentinel with the default rootMargin, and passes a custom one through', () => {
    const { container, rerender } = render(<InfiniteScroll hasMore onLoadMore={() => {}} />)
    expect(lastObserver().targets).toContain(sentinel(container))
    expect(lastObserver().options?.rootMargin).toBe('256px')

    rerender(<InfiniteScroll hasMore onLoadMore={() => {}} rootMargin="64px" />)
    expect(lastObserver().options?.rootMargin).toBe('64px')
  })

  it('an intersecting entry loads; a non-intersecting one does not', () => {
    const onLoadMore = vi.fn()
    render(<InfiniteScroll hasMore onLoadMore={onLoadMore} />)
    act(() => lastObserver().fire(false))
    expect(onLoadMore).not.toHaveBeenCalled()
    act(() => lastObserver().fire(true))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('guards re-entry while pending, then re-observes so a still-visible sentinel keeps loading', async () => {
    const resolvers: Array<() => void> = []
    const onLoadMore = vi.fn(() => new Promise<void>((r) => resolvers.push(r)))
    render(<InfiniteScroll hasMore onLoadMore={onLoadMore} />)
    const first = lastObserver()

    act(() => first.fire(true))
    act(() => first.fire(true))
    act(() => first.fire(true))
    // Three deliveries, one fetch: the guard advances synchronously, not via state.
    expect(onLoadMore).toHaveBeenCalledTimes(1)

    await act(async () => resolvers[0]?.())
    // Settling re-created the observer; the browser would now deliver an initial
    // entry, which is what lets a too-short page fetch again without any scrolling.
    const second = lastObserver()
    expect(second).not.toBe(first)
    expect(first.disconnected).toBe(true)
    act(() => second.fire(true))
    expect(onLoadMore).toHaveBeenCalledTimes(2)
  })

  it('creates no observer when hasMore is already false, and disconnects when it turns false', () => {
    const { rerender } = render(<InfiniteScroll hasMore={false} onLoadMore={() => {}} />)
    expect(MockIntersectionObserver.instances).toHaveLength(0)

    rerender(<InfiniteScroll hasMore onLoadMore={() => {}} />)
    const io = lastObserver()
    expect(io.disconnected).toBe(false)

    rerender(<InfiniteScroll hasMore={false} onLoadMore={() => {}} />)
    expect(io.disconnected).toBe(true)
    expect(MockIntersectionObserver.instances).toHaveLength(1)
  })

  it('disconnects on unmount', () => {
    const { unmount } = render(<InfiniteScroll hasMore onLoadMore={() => {}} />)
    const io = lastObserver()
    unmount()
    expect(io.disconnected).toBe(true)
  })

  it('hides the button when the observer exists, unless loadMoreButton forces it', () => {
    const onLoadMore = vi.fn()
    const { rerender } = render(<InfiniteScroll hasMore onLoadMore={onLoadMore} />)
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()

    rerender(<InfiniteScroll hasMore loadMoreButton onLoadMore={onLoadMore} />)
    // Both paths share one guard: the button loads exactly like an intersection does.
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })
})

describe('InfiniteScroll · a11y', () => {
  it('has no axe violations idle, pending, and ended', async () => {
    const { container } = render(
      <div>
        <InfiniteScroll hasMore onLoadMore={() => new Promise<void>(() => {})}>
          <p>Idle feed</p>
        </InfiniteScroll>
        <InfiniteScroll endContent="End of results" hasMore={false} onLoadMore={() => {}}>
          <p>Finished feed</p>
        </InfiniteScroll>
      </div>,
    )
    // Put the first feed into its pending state through the fallback button.
    const buttons = screen.getAllByRole('button', { name: 'Load more' })
    expect(buttons).toHaveLength(1)
    fireEvent.click(buttons[0] as HTMLElement)
    expect(await axe(container)).toHaveNoViolations()
  })
})
