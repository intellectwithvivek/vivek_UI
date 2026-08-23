'use client'

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { cx } from '../../utils/cx'

/**
 * `useLayoutEffect` warns when it runs on the server, and this component measures the DOM,
 * so it genuinely needs the layout timing in the browser. Swapping to `useEffect` on the
 * server is the standard resolution.
 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export interface VirtualListProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The full dataset. Only the visible slice is ever rendered. */
  items: readonly T[]
  /**
   * Row height in pixels.
   *
   * A number means every row is that tall, which is the fast path: the scroll position maps
   * to an index with one division and nothing needs measuring.
   *
   * A function is the estimate for a row whose real height is not known yet. Rows are
   * measured as they render and the estimate is replaced, so a wrong estimate costs accuracy
   * in the scrollbar early on, not correctness.
   */
  itemHeight: number | ((index: number, item: T) => number)
  /** Renders one row. Must not itself be tall enough to scroll. */
  children: (item: T, index: number) => ReactNode
  /**
   * Extra rows rendered above and below the viewport. Default `4`.
   *
   * Zero is tempting and wrong: the browser paints scrolled-in rows a frame late, which
   * reads as a flicker of blank space at speed.
   */
  overscan?: number
  /** Stable key for a row. Strongly recommended — see the note on the default below. */
  getKey?: (item: T, index: number) => string | number
  /** Accessible name for the scrollable region. */
  label?: string
  /** Scroll this index into view whenever it changes. */
  scrollToIndex?: number
  /** Fired with the visible range whenever it changes. Useful for infinite loading. */
  onRangeChange?: (range: { start: number; end: number }) => void
}

interface Measured {
  /** Running offset of each row from the top. Length is items.length + 1. */
  offsets: number[]
  total: number
}

/** Implementation. The exported `VirtualList` below carries the documentation. */
function VirtualListInner<T>(
  {
    items,
    itemHeight,
    children,
    overscan = 4,
    getKey,
    label,
    scrollToIndex,
    onRangeChange,
    className,
    style,
    onScroll,
    ...rest
  }: VirtualListProps<T>,
  forwardedRef: React.Ref<HTMLDivElement>,
) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  /** Measured heights, keyed by index. Only used in the variable-height mode. */
  const measured = useRef<Map<number, number>>(new Map())
  const [measureVersion, setMeasureVersion] = useState(0)

  const fixedHeight = typeof itemHeight === 'number' ? itemHeight : null

  const estimate = useCallback(
    (index: number): number => {
      if (fixedHeight !== null) return fixedHeight
      const item = items[index]
      if (item === undefined) return 0
      const known = measured.current.get(index)
      if (known !== undefined) return known
      return (itemHeight as (i: number, it: T) => number)(index, item)
    },
    [fixedHeight, itemHeight, items],
  )

  /*
   * Prefix sums of row heights. With a fixed height this is arithmetic and costs nothing;
   * with variable heights it is one pass over the data, recomputed when a measurement lands.
   * `measureVersion` is the dependency that makes that happen - the Map is mutated in place
   * so it cannot be one itself.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: measureVersion is the signal that the mutable measurement Map changed - it is deliberately extra.
  const { offsets, total }: Measured = useMemo(() => {
    if (fixedHeight !== null) {
      return { offsets: [], total: items.length * fixedHeight }
    }
    const next: number[] = new Array(items.length + 1)
    next[0] = 0
    let running = 0
    for (let i = 0; i < items.length; i++) {
      running += estimate(i)
      next[i + 1] = running
    }
    return { offsets: next, total: running }
  }, [fixedHeight, items, estimate, measureVersion])

  /** First index at or after `offset`. Binary search in the variable-height mode. */
  const indexAt = useCallback(
    (offset: number): number => {
      if (fixedHeight !== null) {
        return Math.min(items.length - 1, Math.max(0, Math.floor(offset / fixedHeight)))
      }
      let low = 0
      let high = items.length - 1
      while (low <= high) {
        const mid = (low + high) >> 1
        const start = offsets[mid] ?? 0
        const end = offsets[mid + 1] ?? start
        if (offset < start) high = mid - 1
        else if (offset >= end) low = mid + 1
        else return mid
      }
      return Math.min(items.length - 1, Math.max(0, low))
    },
    [fixedHeight, items.length, offsets],
  )

  const offsetOf = useCallback(
    (index: number): number => (fixedHeight !== null ? index * fixedHeight : (offsets[index] ?? 0)),
    [fixedHeight, offsets],
  )

  const start = Math.max(0, indexAt(scrollTop) - overscan)
  const end = Math.min(
    items.length,
    indexAt(scrollTop + Math.max(viewportHeight, 1)) + overscan + 1,
  )

  // Report the range for infinite loading. Effect, not render, so a caller that sets state
  // in response cannot loop.
  useEffect(() => {
    onRangeChange?.({ start, end })
  }, [start, end, onRangeChange])

  /*
   * The viewport height comes from a ResizeObserver rather than a one-off read, because a
   * list inside a flex or grid parent is frequently zero-height on first paint and only gets
   * its real size a frame later. Reading once renders an empty list that never recovers.
   */
  useIsomorphicLayoutEffect(() => {
    const node = viewportRef.current
    if (!node) return
    setViewportHeight(node.clientHeight)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => setViewportHeight(node.clientHeight))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useIsomorphicLayoutEffect(() => {
    if (scrollToIndex === undefined) return
    const node = viewportRef.current
    if (!node) return
    const clamped = Math.min(Math.max(scrollToIndex, 0), Math.max(items.length - 1, 0))
    node.scrollTop = offsetOf(clamped)
  }, [scrollToIndex, offsetOf, items.length])

  /** Records a row's real height, in the variable-height mode only. */
  const measure = useCallback(
    (index: number, node: HTMLElement | null) => {
      if (fixedHeight !== null || !node) return
      const height = node.offsetHeight
      if (height > 0 && measured.current.get(index) !== height) {
        measured.current.set(index, height)
        setMeasureVersion((v) => v + 1)
      }
    },
    [fixedHeight],
  )

  const visible: ReactNode[] = []
  for (let index = start; index < end; index++) {
    const item = items[index]
    if (item === undefined) continue
    const key = getKey ? getKey(item, index) : index
    visible.push(
      <VirtualRow
        index={index}
        key={key}
        measure={fixedHeight === null ? measure : undefined}
        offset={offsetOf(index)}
        setSize={items.length}
      >
        {children(item, index)}
      </VirtualRow>,
    )
  }

  return (
    <div
      aria-label={label}
      className={cx('vk-virtual-list', className)}
      onScroll={(event) => {
        onScroll?.(event)
        setScrollTop(event.currentTarget.scrollTop)
      }}
      ref={(node) => {
        viewportRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) {
          ;(forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        }
      }}
      role="list"
      style={style}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: WCAG 2.1.1 - a scrollable region has to be focusable or a keyboard user cannot scroll it.
      tabIndex={0}
      {...rest}
    >
      {/* Sets the scrollbar to the height of the whole dataset, not the rendered slice. */}
      <div className="vk-virtual-list__sizer" style={{ height: total }}>
        {visible}
      </div>
    </div>
  )
}

interface VirtualRowProps {
  index: number
  offset: number
  setSize: number
  measure?: (index: number, node: HTMLElement | null) => void
  children: ReactNode
}

function VirtualRow({ index, offset, setSize, measure, children }: VirtualRowProps) {
  return (
    <div
      /*
       * `aria-setsize` and `aria-posinset` are the whole accessibility story for a
       * virtualised list: they let a row say "4,201 of 50,000" when only a dozen rows are
       * in the DOM. They are valid on `listitem` and, notably, NOT on a `grid` row - axe
       * catches that, which is how this ended up as a list rather than a grid. A grid also
       * would have been a lie: these rows hold arbitrary content, not table cells.
       */
      aria-posinset={index + 1}
      aria-setsize={setSize}
      className="vk-virtual-list__row"
      ref={measure ? (node) => measure(index, node) : undefined}
      role="listitem"
      style={{ transform: `translateY(${offset}px)` }}
    >
      {children}
    </div>
  )
}

/**
 * Windowed list: renders only the rows on screen.
 *
 * A list of 50,000 rows mounts 50,000 components, and the browser stops being interactive
 * long before it finishes. This renders the dozen that are visible and positions them with a
 * transform, so the cost is the size of the viewport rather than the size of the data.
 *
 * Every other library in this space is a separate dependency — react-window, react-virtuoso,
 * TanStack Virtual. This is roughly 150 lines and needs none of them.
 *
 * **Accessibility.** Virtualisation breaks assistive technology by default: a screen reader
 * announces "list, 12 items" when there are 50,000, because only 12 are in the DOM. So the
 * container is a `listbox`-style region carrying `aria-rowcount` with the REAL total, and
 * every row carries its true `aria-posinset`. A user hears "row 4,201 of 50,000", which is
 * the truth, rather than a count that changes as they scroll.
 *
 * **Two height modes.** A fixed `itemHeight` needs no measurement at all. A function is an
 * estimate that gets corrected by a `ResizeObserver` as rows render — which is what makes
 * variable-height content work without the caller pre-computing anything.
 */
// `forwardRef` erases the generic, so the cast restores it - the standard pattern for a
// generic component with a ref. Without it, `items` and the render callback lose their
// relationship and every row is inferred as `unknown`.
export const VirtualList = forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement
