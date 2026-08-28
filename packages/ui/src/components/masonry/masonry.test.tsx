/**
 * Masonry.
 *
 * jsdom has no layout, so ResizeObserver is stubbed with one the test drives: the
 * container's width decides the column count, item heights decide placement.
 */
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Masonry } from './masonry'

type Callback = (entries: Partial<ResizeObserverEntry>[]) => void
const observers: { cb: Callback; targets: Element[] }[] = []
let disconnected = 0

class FakeResizeObserver {
  private record: { cb: Callback; targets: Element[] }
  constructor(cb: Callback) {
    this.record = { cb, targets: [] }
    observers.push(this.record)
  }
  observe(el: Element) {
    this.record.targets.push(el)
  }
  unobserve() {}
  disconnect() {
    disconnected += 1
  }
}

/** Observers are told apart by what they watch: the root, or the item wrappers. */
const rootObserver = () => observers.find((o) => o.targets.some((t) => t === root()))
const itemObserver = () =>
  observers.find((o) => o.targets.some((t) => t.classList.contains('vk-masonry__item')))
const resizeRoot = (width: number) =>
  act(() => {
    rootObserver()?.cb([{ contentRect: { width } as DOMRectReadOnly }])
  })
const reportHeights = (heights: Record<string, number>) =>
  act(() => {
    const record = itemObserver()
    if (!record) throw new Error('no item observer')
    record.cb(
      record.targets.map((target) => ({
        target,
        contentRect: {
          height: heights[(target as HTMLElement).dataset.index ?? ''] ?? 0,
        } as DOMRectReadOnly,
      })),
    )
  })

const root = () => screen.getByTestId('m')
const columns = () => Array.from(root().querySelectorAll<HTMLElement>('.vk-masonry__column'))
const layout = () =>
  columns().map((col) =>
    Array.from(col.querySelectorAll<HTMLElement>('.vk-masonry__item')).map((i) =>
      Number(i.dataset.index),
    ),
  )

/** Real children, not a component that renders them: Masonry lays out what it is given. */
const items = (n: number) =>
  Array.from({ length: n }, (_, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: a fixed fixture; the index is the identity here.
    <p key={`k${i}`}>Item {i}</p>
  ))

beforeEach(() => {
  observers.length = 0
  disconnected = 0
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
})
afterEach(() => vi.unstubAllGlobals())

describe('Masonry', () => {
  it('renders with zero props as an empty three-column grid', () => {
    render(<Masonry data-testid="m" />)
    expect(root()).toHaveAttribute('data-columns', '3')
    expect(columns()).toHaveLength(3)
    expect(root().style.getPropertyValue('--vk-masonry-columns')).toBe('3')
    expect(root().style.getPropertyValue('--vk-masonry-gap')).toBe('var(--vk-space-4)')
  })

  it('deals items round-robin before anything is measured, preserving order across columns', () => {
    render(<Masonry data-testid="m">{items(7)}</Masonry>)
    expect(layout()).toEqual([
      [0, 3, 6],
      [1, 4],
      [2, 5],
    ])
    expect(screen.getByText('Item 4')).toBeInTheDocument()
  })

  it('fits as many columns as columnWidth allows, capped at columns', () => {
    render(
      <Masonry data-testid="m" columns={4} columnWidth={200}>
        {items(4)}
      </Masonry>,
    )
    expect(columns()).toHaveLength(4) // server / pre-measure: the cap
    resizeRoot(500)
    expect(root()).toHaveAttribute('data-columns', '2')
    expect(layout()).toEqual([
      [0, 2],
      [1, 3],
    ])
    resizeRoot(150)
    expect(columns()).toHaveLength(1)
    resizeRoot(2000)
    expect(columns()).toHaveLength(4)
  })

  it('once every height is known, each item goes to the shortest column', () => {
    render(
      <Masonry data-testid="m" columns={2}>
        {items(5)}
      </Masonry>,
    )
    expect(layout()).toEqual([
      [0, 2, 4],
      [1, 3],
    ])
    // Item 0 is tall: everything else stacks in the second column until it catches up.
    reportHeights({ '0': 300, '1': 50, '2': 50, '3': 50, '4': 50 })
    expect(layout()).toEqual([[0], [1, 2, 3, 4]])
    reportHeights({ '0': 100, '1': 50, '2': 50, '3': 50, '4': 50 })
    expect(layout()).toEqual([
      [0, 3],
      [1, 2, 4],
    ])
  })

  it('balance={false} keeps round-robin and observes nothing per item', () => {
    render(
      <Masonry data-testid="m" columns={2} balance={false}>
        {items(4)}
      </Masonry>,
    )
    expect(root()).not.toHaveAttribute('data-balance')
    expect(observers).toHaveLength(1) // only the root
    expect(layout()).toEqual([
      [0, 2],
      [1, 3],
    ])
  })

  it('gap maps to a spacing step; className, style, ref and rest land on the root', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <Masonry data-testid="m" gap={2} ref={ref} className="mine" style={{ margin: 4 }} data-x="y">
        {items(1)}
      </Masonry>,
    )
    expect(root().style.getPropertyValue('--vk-masonry-gap')).toBe('var(--vk-space-2)')
    expect(root()).toHaveClass('vk-masonry', 'mine')
    expect(root()).toHaveStyle({ margin: '4px' })
    expect(root()).toHaveAttribute('data-x', 'y')
    expect(ref.current).toBe(root())
  })

  it('disconnects both observers on unmount and copes without ResizeObserver', () => {
    const { unmount } = render(<Masonry data-testid="m">{items(2)}</Masonry>)
    expect(observers).toHaveLength(2)
    unmount()
    expect(disconnected).toBe(2)
    vi.stubGlobal('ResizeObserver', undefined)
    render(
      <Masonry data-testid="m" columns={2}>
        {items(3)}
      </Masonry>,
    )
    expect(layout()).toEqual([[0, 2], [1]])
  })

  it('has no axe violations', async () => {
    const { container } = render(<Masonry>{items(4)}</Masonry>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
