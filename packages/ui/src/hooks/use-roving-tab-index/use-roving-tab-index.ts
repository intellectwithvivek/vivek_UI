'use client'

import { type FocusEvent, type KeyboardEvent, useCallback, useEffect, useRef } from 'react'
import { useControllableState } from '../use-controllable-state'

/** Anything ref-like: a `useRef` object, or a hand-rolled `{ current }` box. */
export type RovingRef = { readonly current: HTMLElement | null }

/** Which arrow keys move the tab stop. */
export type RovingOrientation = 'horizontal' | 'vertical' | 'both'

/** Marker the default `itemSelector` looks for. */
export const ROVING_ITEM_ATTRIBUTE = 'data-vk-roving-item'

export interface RovingItemProps {
  tabIndex: 0 | -1
  'data-vk-roving-item': ''
}

export interface UseRovingTabIndexOptions {
  /** The widget root. Items are looked up inside it, fresh on every keystroke. */
  containerRef: RovingRef
  /** Default `'horizontal'`, matching Tabs and Toolbar. */
  orientation?: RovingOrientation
  /** Wrap past the ends instead of stopping. Default `true`. */
  loop?: boolean
  /** Override when items already have a role to match, e.g. `'[role="tab"]'`. */
  itemSelector?: string
  /** Controlled tab stop. */
  activeIndex?: number
  /** Initial tab stop while uncontrolled. Default `0`. */
  defaultActiveIndex?: number
  onActiveIndexChange?: (index: number) => void
}

export interface UseRovingTabIndexResult {
  /** Index, within the full item list, of the item that owns the tab stop. */
  activeIndex: number
  /** Move the tab stop without moving focus. */
  setActiveIndex: (index: number) => void
  /** Move the tab stop and focus that item. */
  focusItem: (index: number) => void
  /** Spread on each item. */
  getItemProps: (index: number) => RovingItemProps
  /** Spread on the container (or on each item — it only reads `event.target`). */
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  /** Spread on the container, so clicking or focusing an item moves the tab stop. */
  onFocus: (event: FocusEvent<HTMLElement>) => void
}

/**
 * Disabled items are skipped. `aria-disabled` counts as disabled here: a menu item that
 * announces itself as unavailable should not be a stop on the way to a usable one.
 */
function isItemDisabled(item: HTMLElement): boolean {
  return item.hasAttribute('disabled') || item.getAttribute('aria-disabled') === 'true'
}

/** The closest usable item at or after `index`, searching backwards if there is none. */
function nearestEnabled(items: HTMLElement[], index: number): number {
  for (let i = index; i < items.length; i += 1) {
    const item = items[i]
    if (item && !isItemDisabled(item)) return i
  }
  for (let i = index - 1; i >= 0; i -= 1) {
    const item = items[i]
    if (item && !isItemDisabled(item)) return i
  }
  return -1
}

/**
 * Arrow-key navigation with a single tab stop — the composite-widget pattern from the
 * WAI-ARIA Authoring Practices.
 *
 * A toolbar of ten buttons must not cost ten presses of Tab to skip. So exactly one item
 * carries `tabIndex={0}` and the rest carry `-1`: Tab enters and leaves the widget, the
 * arrows move around inside it.
 *
 * Items are read from the DOM on every keystroke instead of tracked in state, which is
 * what makes the hook correct for menus whose items mount, unmount or become disabled
 * while open. All a consumer does is spread `onKeyDown` and `onFocus` on the container
 * and `getItemProps(i)` on each item.
 */
export function useRovingTabIndex({
  containerRef,
  orientation = 'horizontal',
  loop = true,
  itemSelector = `[${ROVING_ITEM_ATTRIBUTE}]`,
  activeIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
}: UseRovingTabIndexOptions): UseRovingTabIndexResult {
  const [active, setActive] = useControllableState<number>({
    value: activeIndex,
    defaultValue: defaultActiveIndex,
    onChange: onActiveIndexChange,
  })

  // Latest-value refs, so the returned handlers keep a stable identity.
  const activeRef = useRef(active)
  const orientationRef = useRef(orientation)
  const loopRef = useRef(loop)
  const selectorRef = useRef(itemSelector)
  activeRef.current = active
  orientationRef.current = orientation
  loopRef.current = loop
  selectorRef.current = itemSelector

  const getItems = useCallback((): HTMLElement[] => {
    const container = containerRef.current
    if (!container) return []
    return Array.from(container.querySelectorAll<HTMLElement>(selectorRef.current))
  }, [containerRef])

  const focusItem = useCallback(
    (index: number) => {
      const item = getItems()[index]
      if (!item) return
      item.focus()
      setActive(index)
    },
    [getItems, setActive],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.defaultPrevented) return

      const items = getItems()
      const usable = items.filter((item) => !isItemDisabled(item))
      if (usable.length === 0) return

      const axis = orientationRef.current
      const horizontal = axis === 'horizontal' || axis === 'both'
      const vertical = axis === 'vertical' || axis === 'both'

      // Prefer the item the event came from: the tab stop can legitimately lag focus by
      // a keystroke, and the user's mental model is "move from where I am".
      const origin =
        event.target instanceof HTMLElement ? event.target.closest(selectorRef.current) : null
      const originIndex = origin instanceof HTMLElement ? usable.indexOf(origin) : -1
      const activeItem = items[activeRef.current]
      const activeInUsable = activeItem ? usable.indexOf(activeItem) : -1
      const current = originIndex !== -1 ? originIndex : Math.max(activeInUsable, 0)

      const last = usable.length - 1
      const step = (delta: number): number => {
        const target = current + delta
        if (target < 0) return loopRef.current ? last : 0
        if (target > last) return loopRef.current ? 0 : last
        return target
      }

      let next: number
      switch (event.key) {
        case 'ArrowRight':
          if (!horizontal) return
          next = step(1)
          break
        case 'ArrowLeft':
          if (!horizontal) return
          next = step(-1)
          break
        case 'ArrowDown':
          if (!vertical) return
          next = step(1)
          break
        case 'ArrowUp':
          if (!vertical) return
          next = step(-1)
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = last
          break
        default:
          return
      }

      // The widget owns these keys even when the tab stop does not move, or the arrow
      // scrolls the page out from under a menu that is sitting on its last item.
      event.preventDefault()

      const nextItem = usable[next]
      if (!nextItem) return
      nextItem.focus()
      setActive(items.indexOf(nextItem))
    },
    [getItems, setActive],
  )

  const onFocus = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      const item = target.closest(selectorRef.current)
      if (!(item instanceof HTMLElement)) return
      const index = getItems().indexOf(item)
      if (index !== -1 && index !== activeRef.current) setActive(index)
    },
    [getItems, setActive],
  )

  // Items come and go: a filtered menu, a tab that unmounts. If the tab stop lands on an
  // index that no longer exists (or has since been disabled) the widget drops out of the
  // tab order entirely, so pull it back to the nearest usable item. The `healed` guard
  // keeps a controlled caller that ignores `onActiveIndexChange` from being told again on
  // every render.
  const healedRef = useRef<number | null>(null)
  useEffect(() => {
    const items = getItems()
    if (items.length === 0) return
    const current = items[activeRef.current]
    if (current && !isItemDisabled(current)) {
      healedRef.current = null
      return
    }
    const clamped = Math.min(Math.max(activeRef.current, 0), items.length - 1)
    const target = nearestEnabled(items, clamped)
    if (target === -1 || target === activeRef.current) return
    if (healedRef.current === target) return
    healedRef.current = target
    setActive(target)
  })

  const getItemProps = useCallback(
    (index: number): RovingItemProps => ({
      tabIndex: index === active ? 0 : -1,
      [ROVING_ITEM_ATTRIBUTE]: '',
    }),
    [active],
  )

  return {
    activeIndex: active,
    setActiveIndex: setActive,
    focusItem,
    getItemProps,
    onKeyDown,
    onFocus,
  }
}
