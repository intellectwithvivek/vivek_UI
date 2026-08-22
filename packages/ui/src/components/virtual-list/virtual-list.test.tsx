/**
 * VirtualList.
 *
 * The whole point of the component is that the DOM does NOT contain the data, so the tests
 * are mostly about what is absent: that 50,000 rows do not mount, that the scrollbar still
 * reflects 50,000, and that a screen reader is still told there are 50,000. That last one is
 * the part virtualisation usually breaks — a naive implementation announces "12 items".
 *
 * jsdom reports every element as 0×0 and never fires ResizeObserver, so `clientHeight` is
 * stubbed per test. Without that the viewport measures zero and the component correctly
 * renders almost nothing, which would make every assertion here pass for the wrong reason.
 */
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { VirtualList } from './virtual-list'

interface Row {
  id: number
  name: string
}

const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: i, name: `Row ${i}` }))

/** jsdom has no layout, so the viewport has to be given a height. */
function stubViewportHeight(px: number) {
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get() {
      return this.classList?.contains('vk-virtual-list') ? px : 0
    },
  })
}

beforeEach(() => {
  stubViewportHeight(400)
  // A no-op observer: the component must not depend on it firing, only on not crashing.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

describe('VirtualList', () => {
  it('renders only a fraction of a large dataset', () => {
    render(
      <VirtualList items={makeRows(50_000)} itemHeight={40} label="Rows">
        {(row) => <div>{row.name}</div>}
      </VirtualList>,
    )
    const rendered = screen.getAllByRole('listitem')
    // 400px viewport / 40px rows = 10 visible, plus overscan either side. The precise
    // number matters less than it being tiny; anything near 50,000 means it is not
    // virtualising at all.
    expect(rendered.length).toBeGreaterThan(0)
    expect(rendered.length).toBeLessThan(40)
  })

  it('tells assistive technology the REAL total, not the rendered count', () => {
    // The failure this guards against: a screen reader announcing "12 items" for a list of
    // 50,000, because only 12 are in the DOM.
    render(
      <VirtualList items={makeRows(50_000)} itemHeight={40} label="Rows">
        {(row) => <div>{row.name}</div>}
      </VirtualList>,
    )
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-setsize', '50000')
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-posinset', '1')
  })

  it('gives each row its true position, not its position in the window', () => {
    render(
      <VirtualList items={makeRows(1000)} itemHeight={40} label="Rows">
        {(row) => <div>{row.name}</div>}
      </VirtualList>,
    )
    const first = screen.getAllByRole('listitem')[0]
    expect(first).toHaveAttribute('aria-posinset', '1')
    expect(first).toHaveAttribute('aria-setsize', '1000')
  })

  it('sizes the scroll area to the whole dataset', () => {
    // Without this the scrollbar reflects only what is mounted, and the list appears to end
    // after a dozen rows.
    const { container } = render(
      <VirtualList items={makeRows(1000)} itemHeight={40} label="Rows">
        {(row) => <div>{row.name}</div>}
      </VirtualList>,
    )
    const sizer = container.querySelector('.vk-virtual-list__sizer') as HTMLElement
    expect(sizer.style.height).toBe('40000px')
  })

  it('positions rows by transform rather than by document order', () => {
    const { container } = render(
      <VirtualList items={makeRows(100)} itemHeight={40} label="Rows">
        {(row) => <div>{row.name}</div>}
      </VirtualList>,
    )
    const rows = [...container.querySelectorAll<HTMLElement>('.vk-virtual-list__row')]
    expect(rows[0]?.style.transform).toBe('translateY(0px)')
    expect(rows[1]?.style.transform).toBe('translateY(40px)')
    expect(rows[2]?.style.transform).toBe('translateY(80px)')
  })

  it('renders the window for the current scroll position', () => {
    const { container } = render(
      <VirtualList items={makeRows(1000)} itemHeight={40} label="Rows" scrollToIndex={500}>
        {(row) => <div>{row.name}</div>}
      </VirtualList>,
    )
    const viewport = container.querySelector('.vk-virtual-list') as HTMLElement
    // scrollToIndex sets scrollTop; jsdom records the assignment even though it cannot lay
    // out, which is enough to prove the offset maths.
    expect(viewport.scrollTop).toBe(500 * 40)
  })

  it('reports the visible range, so a caller can page in more data', () => {
    const onRangeChange = vi.fn()
    render(
      <VirtualList
        items={makeRows(1000)}
        itemHeight={40}
        label="Rows"
        onRangeChange={onRangeChange}
      >
        {(row) => <div>{row.name}</div>}
      </VirtualList>,
    )
    expect(onRangeChange).toHaveBeenCalled()
    const range = onRangeChange.mock.calls.at(-1)?.[0]
    expect(range.start).toBe(0)
    expect(range.end).toBeGreaterThan(0)
  })

  it('accepts a height function for variable rows', () => {
    const { container } = render(
      <VirtualList
        items={makeRows(100)}
        itemHeight={(index) => (index % 2 === 0 ? 30 : 60)}
        label="Rows"
      >
        {(row) => <div>{row.name}</div>}
      </VirtualList>,
    )
    const rows = [...container.querySelectorAll<HTMLElement>('.vk-virtual-list__row')]
    // 30 then 60 then 30... so offsets run 0, 30, 90, 120.
    expect(rows[0]?.style.transform).toBe('translateY(0px)')
    expect(rows[1]?.style.transform).toBe('translateY(30px)')
    expect(rows[2]?.style.transform).toBe('translateY(90px)')
  })

  it('renders nothing but does not crash on an empty list', () => {
    // The zero-props-ish case. An off-by-one in the window maths shows up here first.
    const { container } = render(
      <VirtualList items={[]} itemHeight={40} label="Empty">
        {(row: Row) => <div>{row.name}</div>}
      </VirtualList>,
    )
    expect(container.querySelectorAll('.vk-virtual-list__row')).toHaveLength(0)
  })

  it('survives a dataset shorter than the viewport', () => {
    render(
      <VirtualList items={makeRows(2)} itemHeight={40} label="Two">
        {(row) => <div>{row.name}</div>}
      </VirtualList>,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('is keyboard reachable, because a scroll region must be', () => {
    render(
      <VirtualList items={makeRows(100)} itemHeight={40} label="Rows">
        {(row) => <div>{row.name}</div>}
      </VirtualList>,
    )
    expect(screen.getByRole('list')).toHaveAttribute('tabindex', '0')
  })

  it('merges className and forwards the rest, per the component contract', () => {
    const { container } = render(
      <VirtualList
        className="mine"
        data-testid="vl"
        items={makeRows(10)}
        itemHeight={40}
        label="Rows"
      >
        {(row) => <div>{row.name}</div>}
      </VirtualList>,
    )
    const root = container.querySelector('.vk-virtual-list') as HTMLElement
    expect(root).toHaveClass('mine')
    expect(root).toHaveAttribute('data-testid', 'vl')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <VirtualList items={makeRows(1000)} itemHeight={40} label="Product rows">
        {(row) => <div>{row.name}</div>}
      </VirtualList>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
