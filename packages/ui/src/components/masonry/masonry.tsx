'use client'

import {
  Children,
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { cx } from '../../utils/cx'

export type MasonryGap = 1 | 2 | 3 | 4 | 6 | 8

export interface MasonryProps extends HTMLAttributes<HTMLDivElement> {
  /** Most columns to lay out. Default `3`. */
  columns?: number
  /** Narrowest a column may get, in px; fewer columns are used below it. Default `240`. */
  columnWidth?: number
  /** Space between items, in spacing steps. Default `4`. */
  gap?: MasonryGap
  /**
   * Place each item in the currently shortest column, using measured heights. Default
   * `true`. `false` deals items round-robin, which keeps reading order strictly
   * left-to-right at the cost of ragged column ends.
   */
  balance?: boolean
  children?: ReactNode
}

/**
 * A masonry layout — Pinterest's grid: items of different heights packed into columns
 * with no gaps under the short ones.
 *
 * CSS `columns` fills top-to-bottom, so the second item lands under the first instead of
 * beside it, and `grid-template-rows: masonry` is still behind a flag. This measures
 * instead: a ResizeObserver on the container decides how many columns fit
 * (`columnWidth`, capped at `columns`), and one on each item reports its height so the
 * next item goes into the shortest column. Before measurement — and on the server — items
 * are dealt round-robin into `columns`, so the first paint is already a grid.
 *
 * DOM order follows columns, not visual reading order; keep this for content where order
 * is not the point (photos, cards, quotes), and reach for `Grid` when it is.
 */
export const Masonry = forwardRef<HTMLDivElement, MasonryProps>(function Masonry(
  { columns = 3, columnWidth = 240, gap = 4, balance = true, className, style, children, ...rest },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  const max = Math.max(1, Math.floor(columns))
  const [measured, setMeasured] = useState<number | null>(null)
  const count = Math.min(max, measured ?? max)

  // How many columns fit: from the container's width, live.
  useEffect(() => {
    const node = rootRef.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const gapPx = Number.parseFloat(getComputedStyle(node).columnGap) || 0
    const columnsThatFit = (width: number) =>
      Math.max(1, Math.floor((width + gapPx) / (Math.max(1, columnWidth) + gapPx)))
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? node.clientWidth
      setMeasured(columnsThatFit(width))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [columnWidth])

  // Item heights, from one shared observer.
  const [heights, setHeights] = useState<ReadonlyMap<string, number>>(new Map())
  const itemObserver = useRef<ResizeObserver | null>(null)
  const keyOf = useRef(new WeakMap<Element, string>())
  const getObserver = () => {
    if (itemObserver.current || typeof ResizeObserver === 'undefined') return itemObserver.current
    itemObserver.current = new ResizeObserver((entries) => {
      setHeights((prev) => {
        let next: Map<string, number> | null = null
        for (const entry of entries) {
          const key = keyOf.current.get(entry.target)
          if (key === undefined) continue
          const h = entry.contentRect.height
          if (prev.get(key) !== h) {
            next ??= new Map(prev)
            next.set(key, h)
          }
        }
        return next ?? prev
      })
    })
    return itemObserver.current
  }
  useEffect(
    () => () => {
      itemObserver.current?.disconnect()
      itemObserver.current = null
    },
    [],
  )
  const observeItem = (key: string) => (node: HTMLDivElement | null) => {
    if (!balance) return
    const observer = getObserver()
    if (!observer || !node) return
    keyOf.current.set(node, key)
    observer.observe(node)
  }

  const items = useMemo(
    () =>
      Children.toArray(children).map((child, index) => ({
        key: isValidElement(child) && child.key !== null ? String(child.key) : `i${index}`,
        node: child,
        index,
      })),
    [children],
  )

  // Placement: shortest column when every height is known, else round-robin.
  const placed = useMemo(() => {
    const cols: (typeof items)[] = Array.from({ length: count }, () => [])
    const known = balance && items.every((item) => heights.has(item.key))
    if (!known) {
      for (const [i, item] of items.entries()) cols[i % count]?.push(item)
      return cols
    }
    const tally = new Array<number>(count).fill(0)
    for (const item of items) {
      let shortest = 0
      for (let c = 1; c < count; c += 1) if ((tally[c] ?? 0) < (tally[shortest] ?? 0)) shortest = c
      cols[shortest]?.push(item)
      tally[shortest] = (tally[shortest] ?? 0) + (heights.get(item.key) ?? 0)
    }
    return cols
  }, [items, count, heights, balance])

  return (
    <div
      ref={setRootRef}
      className={cx('vk-masonry', className)}
      data-columns={count}
      data-balance={balance ? '' : undefined}
      style={
        {
          '--vk-masonry-columns': count,
          '--vk-masonry-gap': `var(--vk-space-${gap})`,
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      {placed.map((column, c) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional slots, not data — the items inside keep their own keys.
        <div key={c} className="vk-masonry__column">
          {column.map((item) => (
            <div
              key={item.key}
              ref={observeItem(item.key)}
              className="vk-masonry__item"
              data-index={item.index}
            >
              {item.node}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
})
