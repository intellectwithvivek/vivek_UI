'use client'

import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDismiss } from '../../hooks/use-dismiss'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { ROVING_ITEM_ATTRIBUTE, useRovingTabIndex } from '../../hooks/use-roving-tab-index'
import { cx } from '../../utils/cx'
import { type PositionResult, position } from '../../utils/position'
import { Slot } from '../../utils/slot'
import { Portal, type PortalContainer } from '../portal'

interface Point {
  x: number
  y: number
}

interface ContextMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  point: Point
  openAt: (point: Point) => void
  contentId: string
  triggerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLDivElement | null>
  /** Whatever had focus when the menu opened, so closing can hand it back. */
  returnFocusRef: RefObject<HTMLElement | null>
  container: PortalContainer | undefined
  loop: boolean
  typeahead: boolean
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null)

function useContextMenu(part: string): ContextMenuContextValue {
  const ctx = useContext(ContextMenuContext)
  if (!ctx) throw new Error(`${part} must be rendered inside <ContextMenu>.`)
  return ctx
}

const ITEM_SELECTOR = `[${ROVING_ITEM_ATTRIBUTE}]`
const TYPEAHEAD_RESET = 600

function isItemDisabled(item: HTMLElement): boolean {
  return item.hasAttribute('disabled') || item.getAttribute('aria-disabled') === 'true'
}

export interface ContextMenuProps {
  children: ReactNode
  onOpenChange?: (open: boolean) => void
  /** Where the menu portals. Defaults to `document.body`. */
  container?: PortalContainer
  /** Arrow keys wrap at the ends. Default `true`. */
  loop?: boolean
  /** Typing a letter jumps to the next matching item. Default `true`. */
  typeahead?: boolean
}

/**
 * A right-click menu — `DropdownMenu`'s behaviour, anchored to a point instead of a button.
 *
 * The part everyone skips is the keyboard path. `contextmenu` is a pointer event, and a
 * menu that only opens on it does not exist for anyone without a mouse. So the trigger
 * also opens on **Shift+F10** and the **ContextMenu key**, at its own centre — the two
 * keys every desktop operating system already uses for exactly this — and closing returns
 * focus to wherever it was.
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | Right-click, Shift+F10, ContextMenu | Open (at the pointer, or the trigger's centre) |
 * | ArrowDown / ArrowUp | Next / previous item, wrapping |
 * | Home / End | First / last item |
 * | Enter / Space | Activate the item |
 * | Type a letter | Jump to the next item starting with it |
 * | Escape, Tab, click outside | Close and return focus |
 *
 * The panel is positioned by the same solver as every other overlay, fed a zero-size anchor
 * at the pointer, so it flips and clamps at the viewport edges the way a dropdown does
 * instead of running off the right or bottom of the screen.
 */
export function ContextMenu({
  children,
  onOpenChange,
  container,
  loop = true,
  typeahead = true,
}: ContextMenuProps) {
  const [open, setOpenState] = useState(false)
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const contentId = `${useIsomorphicId()}-menu`

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next)
      onOpenChange?.(next)
    },
    [onOpenChange],
  )

  const openAt = useCallback(
    (at: Point) => {
      const active = triggerRef.current?.ownerDocument.activeElement
      returnFocusRef.current = active instanceof HTMLElement ? active : triggerRef.current
      setPoint(at)
      setOpen(true)
    },
    [setOpen],
  )

  const value = useMemo<ContextMenuContextValue>(
    () => ({
      open,
      setOpen,
      point,
      openAt,
      contentId,
      triggerRef,
      contentRef,
      returnFocusRef,
      container,
      loop,
      typeahead,
    }),
    [open, setOpen, point, openAt, contentId, container, loop, typeahead],
  )

  return <ContextMenuContext.Provider value={value}>{children}</ContextMenuContext.Provider>
}

/* ------------------------------------------------------------------------ trigger */

export interface ContextMenuTriggerProps extends HTMLAttributes<HTMLElement> {
  /** Render the child element as the surface instead of a `<div>`. */
  asChild?: boolean
  disabled?: boolean
}

/**
 * The right-clickable surface. Focusable, because the keyboard path has to have somewhere
 * to start: Shift+F10 on a surface a keyboard cannot reach is a menu that does not exist.
 */
export const ContextMenuTrigger = forwardRef<HTMLElement, ContextMenuTriggerProps>(
  function ContextMenuTrigger(
    { asChild, disabled, className, children, onContextMenu, onKeyDown, ...rest },
    ref,
  ) {
    const ctx = useContextMenu('ContextMenu.Trigger')
    const setRef = (node: HTMLElement | null) => {
      ctx.triggerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    const openAtCentre = () => {
      const rect = ctx.triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      ctx.openAt({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    }

    const shared = {
      ref: setRef,
      className: cx('vk-context-menu__trigger', className),
      'data-state': ctx.open ? 'open' : 'closed',
      'aria-haspopup': 'menu' as const,
      'aria-controls': ctx.open ? ctx.contentId : undefined,
      onContextMenu: (event: MouseEvent<HTMLElement>) => {
        onContextMenu?.(event)
        if (event.defaultPrevented || disabled) return
        // The browser's own menu would otherwise open on top of ours.
        event.preventDefault()
        ctx.openAt({ x: event.clientX, y: event.clientY })
      },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || disabled) return
        if ((event.key === 'F10' && event.shiftKey) || event.key === 'ContextMenu') {
          event.preventDefault()
          openAtCentre()
        }
      },
    }

    if (asChild) {
      return (
        <Slot {...shared} {...rest}>
          {children}
        </Slot>
      )
    }
    return (
      <div tabIndex={disabled ? undefined : 0} {...shared} {...rest}>
        {children}
      </div>
    )
  },
)

/* ------------------------------------------------------------------------ content */

export type ContextMenuContentProps = HTMLAttributes<HTMLDivElement>

/**
 * Solve the panel's position from a zero-size anchor at the pointer.
 *
 * The overlay hook takes an element ref; a pointer has no element. The pure `position()`
 * solver underneath it does not care, so it is called directly, and re-run when the window
 * resizes. Measurement happens in a layout effect so the panel is never seen at 0,0.
 */
function usePointPosition(
  point: Point,
  floatingRef: RefObject<HTMLElement | null>,
): PositionResult | null {
  const [resolved, setResolved] = useState<PositionResult | null>(null)

  useLayoutEffect(() => {
    const solve = () => {
      const node = floatingRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const view = node.ownerDocument.defaultView
      setResolved(
        position({
          trigger: { x: point.x, y: point.y, width: 0, height: 0 },
          floating: { width: rect.width, height: rect.height },
          viewport: { width: view?.innerWidth ?? 0, height: view?.innerHeight ?? 0 },
          side: 'bottom',
          align: 'start',
          offset: 2,
          padding: 8,
        }),
      )
    }
    solve()
    const view = floatingRef.current?.ownerDocument.defaultView
    view?.addEventListener('resize', solve)
    return () => view?.removeEventListener('resize', solve)
  }, [point, floatingRef])

  return resolved
}

interface PanelProps extends ContextMenuContentProps {
  forwardedRef: Ref<HTMLDivElement> | undefined
}

/** Below the Portal boundary, so measuring and focusing never run during SSR. */
function ContextMenuPanel({
  forwardedRef,
  className,
  style,
  children,
  onKeyDown,
  ...rest
}: PanelProps) {
  const ctx = useContextMenu('ContextMenu.Content')
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      ctx.contentRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [ctx.contentRef, forwardedRef],
  )
  const resolved = usePointPosition(ctx.point, ctx.contentRef)
  const roving = useRovingTabIndex({
    containerRef: ctx.contentRef,
    orientation: 'vertical',
    loop: ctx.loop,
    itemSelector: ITEM_SELECTOR,
  })

  useDismiss({
    onDismiss: () => ctx.setOpen(false),
    refs: [ctx.contentRef, ctx.triggerRef],
  })

  // Focus the first enabled item on open; hand focus back on close.
  useEffect(() => {
    const content = ctx.contentRef.current
    if (!content) return
    const doc = content.ownerDocument
    const items = Array.from(content.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
      (item) => !isItemDisabled(item),
    )
    ;(items[0] ?? content).focus()
    return () => {
      const back = ctx.returnFocusRef.current ?? ctx.triggerRef.current
      if (!back?.isConnected) return
      const active = doc.activeElement
      if (content.contains(active) || active === null || active === doc.body) back.focus()
    }
  }, [ctx.contentRef, ctx.triggerRef, ctx.returnFocusRef])

  // Typeahead, with its timer cleared on unmount - the leak gate checks.
  const typedRef = useRef('')
  const typedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (typedTimer.current !== null) clearTimeout(typedTimer.current)
    },
    [],
  )
  const runTypeahead = (key: string) => {
    const content = ctx.contentRef.current
    if (!content) return
    if (typedTimer.current !== null) clearTimeout(typedTimer.current)
    typedRef.current += key.toLowerCase()
    typedTimer.current = setTimeout(() => {
      typedRef.current = ''
      typedTimer.current = null
    }, TYPEAHEAD_RESET)
    const items = Array.from(content.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
      (item) => !isItemDisabled(item),
    )
    const query = typedRef.current
    const active = content.ownerDocument.activeElement
    const from = active instanceof HTMLElement ? items.indexOf(active) : -1
    const startAt = query.length === 1 ? from + 1 : Math.max(from, 0)
    for (let step = 0; step < items.length; step += 1) {
      const candidate = items[(startAt + step) % items.length]
      if (candidate && (candidate.textContent ?? '').trim().toLowerCase().startsWith(query)) {
        candidate.focus()
        return
      }
    }
  }

  return (
    <div
      ref={setRef}
      id={ctx.contentId}
      role="menu"
      aria-orientation="vertical"
      tabIndex={-1}
      className={cx('vk-context-menu', className)}
      data-positioned={resolved ? '' : undefined}
      data-side={resolved?.side ?? 'bottom'}
      style={{ left: `${resolved?.x ?? 0}px`, top: `${resolved?.y ?? 0}px`, ...style }}
      onFocus={roving.onFocus}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.key === 'Tab') {
          // A menu is modal to the keyboard: Tab leaves it, it does not move within it.
          event.preventDefault()
          ctx.setOpen(false)
          return
        }
        roving.onKeyDown(event)
        if (event.defaultPrevented) return
        if (
          ctx.typeahead &&
          event.key.length === 1 &&
          event.key !== ' ' &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          runTypeahead(event.key)
        }
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

export const ContextMenuContent = forwardRef<HTMLDivElement, ContextMenuContentProps>(
  function ContextMenuContent(props, ref) {
    const ctx = useContextMenu('ContextMenu.Content')
    if (!ctx.open) return null
    return (
      <Portal container={ctx.container}>
        <ContextMenuPanel forwardedRef={ref} {...props} />
      </Portal>
    )
  },
)

/* --------------------------------------------------------------------------- items */

export interface ContextMenuItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  /** `aria-disabled`, not `disabled`: the command stays announced, just unavailable. */
  disabled?: boolean
  /** Called on click, Enter or Space. */
  onSelect?: () => void
  /** Close after selecting. Default `true`. */
  closeOnSelect?: boolean
  /** Trailing hint such as a shortcut. Not part of the accessible name. */
  shortcut?: ReactNode
  /** Render the child as the item — a router link, typically. */
  asChild?: boolean
}

export const ContextMenuItem = forwardRef<HTMLButtonElement, ContextMenuItemProps>(
  function ContextMenuItem(
    {
      asChild,
      className,
      disabled,
      onSelect,
      onClick,
      closeOnSelect = true,
      shortcut,
      children,
      ...rest
    },
    ref,
  ) {
    const ctx = useContextMenu('ContextMenu.Item')
    const Component = asChild ? Slot : 'button'
    return (
      <Component
        ref={ref}
        type={asChild ? undefined : 'button'}
        role="menuitem"
        tabIndex={-1}
        data-vk-roving-item=""
        className={cx('vk-context-menu__item', className)}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? '' : undefined}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event)
          if (event.defaultPrevented || disabled) return
          onSelect?.()
          if (closeOnSelect) ctx.setOpen(false)
        }}
        {...rest}
      >
        {asChild ? (
          children
        ) : (
          <>
            <span className="vk-context-menu__item-label">{children}</span>
            {shortcut ? (
              <span className="vk-context-menu__shortcut" aria-hidden="true">
                {shortcut}
              </span>
            ) : null}
          </>
        )}
      </Component>
    )
  },
)

export type ContextMenuSeparatorProps = HTMLAttributes<HTMLHRElement>

export const ContextMenuSeparator = forwardRef<HTMLHRElement, ContextMenuSeparatorProps>(
  function ContextMenuSeparator({ className, ...rest }, ref) {
    return <hr ref={ref} className={cx('vk-context-menu__separator', className)} {...rest} />
  },
)

export type ContextMenuLabelProps = HTMLAttributes<HTMLDivElement>

/** A non-interactive heading for a group of items. */
export const ContextMenuLabel = forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  function ContextMenuLabel({ className, ...rest }, ref) {
    return <div ref={ref} className={cx('vk-context-menu__label', className)} {...rest} />
  },
)

ContextMenu.Trigger = ContextMenuTrigger
ContextMenu.Content = ContextMenuContent
ContextMenu.Item = ContextMenuItem
ContextMenu.Separator = ContextMenuSeparator
ContextMenu.Label = ContextMenuLabel
