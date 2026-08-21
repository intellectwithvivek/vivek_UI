'use client'

import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useAnchoredPosition } from '../../hooks/use-anchored-position'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useDismiss } from '../../hooks/use-dismiss'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { ROVING_ITEM_ATTRIBUTE, useRovingTabIndex } from '../../hooks/use-roving-tab-index'
import { cx } from '../../utils/cx'
import type { Align, Side } from '../../utils/position'
import { Portal, type PortalContainer } from '../portal'

/** Which end of the menu takes focus when it opens. */
type OpenIntent = 'first' | 'last'

interface MenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  /** Open and say which end to focus. Used by the trigger's arrow keys. */
  openWith: (intent: OpenIntent) => void
  /** Read once by the panel on mount, then reset. */
  intentRef: RefObject<OpenIntent>
  triggerId: string
  contentId: string
  triggerRef: RefObject<HTMLButtonElement | null>
  contentRef: RefObject<HTMLDivElement | null>
  side: Side
  align: Align
  offset: number
  padding: number
  container: PortalContainer | undefined
  loop: boolean
  typeahead: boolean
}

const MenuContext = createContext<MenuContextValue | null>(null)

function useMenuContext(part: string): MenuContextValue {
  const context = useContext(MenuContext)
  if (!context) throw new Error(`${part} must be rendered inside <DropdownMenu>.`)
  return context
}

/**
 * The selector every item answers to. Built from the roving hook's own marker
 * attribute so the two cannot drift apart; `overlays-floating.test.tsx` asserts the
 * rendered attribute still matches it.
 */
const ITEM_SELECTOR = `[${ROVING_ITEM_ATTRIBUTE}]`

/** How long a typeahead buffer survives between keystrokes, ms. */
const TYPEAHEAD_RESET = 600

/**
 * Measure, resolve, reposition on scroll and resize. See the note in `tooltip.tsx`:
 * deliberately duplicated across the three overlays rather than promoted to a shared
 * hook while there are only three of them.
 */
/** One callback ref that feeds both the caller's ref and ours. */
function useMergedRef<T>(
  own: RefObject<T | null>,
  forwarded: Ref<T> | undefined,
): (node: T | null) => void {
  return useCallback(
    (node: T | null) => {
      own.current = node
      if (typeof forwarded === 'function') forwarded(node)
      else if (forwarded) forwarded.current = node
    },
    [own, forwarded],
  )
}

function isItemDisabled(item: HTMLElement): boolean {
  return item.hasAttribute('disabled') || item.getAttribute('aria-disabled') === 'true'
}

export interface DropdownMenuProps {
  children?: ReactNode
  /** Controlled open state. */
  open?: boolean
  /** Initial open state while uncontrolled. Default `false`. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Preferred side. Flipped to its opposite when there is no room. Default `'bottom'`. */
  side?: Side
  /** Cross-axis alignment. Default `'start'` - menus line up with their trigger's edge. */
  align?: Align
  /** Gap between trigger and menu, px. Default `4`. */
  offset?: number
  /** Minimum distance kept from the viewport edges, px. Default `8`. */
  padding?: number
  /** Wrap arrow navigation past the ends. Default `true`. */
  loop?: boolean
  /** Jump to an item by typing its first letters. Default `true`. */
  typeahead?: boolean
  /** Where to portal the menu. Defaults to `document.body`. */
  container?: PortalContainer
  /** Ids for the trigger/menu pair. Generated when omitted. */
  id?: string
}

/**
 * A button that opens a list of commands.
 *
 * Renders no DOM of its own. The keyboard contract, which is the whole reason a menu
 * is not just a `<div>` full of buttons:
 *
 * | Key | On the trigger | In the menu |
 * |---|---|---|
 * | `Enter` / `Space` | open, focus first item | activate the focused item |
 * | `ArrowDown` | open, focus first item | next item (wraps when `loop`) |
 * | `ArrowUp` | open, focus **last** item | previous item |
 * | `Home` / `End` | - | first / last item |
 * | `Escape` | - | close, focus returns to the trigger |
 * | `Tab` | - | close, focus returns to the trigger |
 * | a-z, 0-9 | - | typeahead to the next matching item |
 *
 * Disabled items are skipped by every one of those movements, which is
 * `useRovingTabIndex`'s job, not this component's.
 */
export function DropdownMenu({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  offset = 4,
  padding = 8,
  loop = true,
  typeahead = true,
  container,
  id,
}: DropdownMenuProps) {
  const baseId = useIsomorphicId(id)
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const intentRef = useRef<OpenIntent>('first')

  const openWith = useCallback(
    (intent: OpenIntent) => {
      intentRef.current = intent
      setIsOpen(true)
    },
    [setIsOpen],
  )

  const value = useMemo<MenuContextValue>(
    () => ({
      open: isOpen,
      setOpen: setIsOpen,
      openWith,
      intentRef,
      triggerId: `${baseId}-trigger`,
      contentId: `${baseId}-menu`,
      triggerRef,
      contentRef,
      side,
      align,
      offset,
      padding,
      container,
      loop,
      typeahead,
    }),
    [isOpen, setIsOpen, openWith, baseId, side, align, offset, padding, container, loop, typeahead],
  )

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export type DropdownMenuTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>

/** The button that opens the menu. `aria-haspopup="menu"` plus a live `aria-expanded`. */
export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger({ className, onClick, onKeyDown, children, ...rest }, ref) {
    const ctx = useMenuContext('DropdownMenu.Trigger')
    const setRef = useMergedRef(ctx.triggerRef, ref)

    return (
      <button
        ref={setRef}
        type="button"
        id={ctx.triggerId}
        className={cx('vk-dropdown-menu__trigger', className)}
        aria-haspopup="menu"
        aria-expanded={ctx.open}
        aria-controls={ctx.open ? ctx.contentId : undefined}
        data-state={ctx.open ? 'open' : 'closed'}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented) return
          if (ctx.open) ctx.setOpen(false)
          else ctx.openWith('first')
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || ctx.open) return
          // Down opens at the top, Up opens at the bottom - the shortcut that makes
          // "last item" reachable in one keystroke.
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            ctx.openWith('first')
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            ctx.openWith('last')
          }
        }}
        {...rest}
      >
        {children}
      </button>
    )
  },
)

export type DropdownMenuContentProps = HTMLAttributes<HTMLDivElement>

interface MenuPanelProps extends DropdownMenuContentProps {
  forwardedRef: Ref<HTMLDivElement> | undefined
}

/**
 * The menu surface. Split out from `DropdownMenuContent` so all measurement, focus
 * moves and key handling live below the Portal boundary, out of reach of SSR.
 */
function MenuPanel({
  forwardedRef,
  className,
  style,
  children,
  onKeyDown,
  ...rest
}: MenuPanelProps) {
  const ctx = useMenuContext('DropdownMenu.Content')
  const setRef = useMergedRef(ctx.contentRef, forwardedRef)
  const resolved = useAnchoredPosition(
    ctx.triggerRef,
    ctx.contentRef,
    ctx.side,
    ctx.align,
    ctx.offset,
    ctx.padding,
  )

  const roving = useRovingTabIndex({
    containerRef: ctx.contentRef,
    orientation: 'vertical',
    loop: ctx.loop,
    itemSelector: ITEM_SELECTOR,
  })

  useDismiss({
    onDismiss: () => ctx.setOpen(false),
    refs: [ctx.triggerRef, ctx.contentRef],
  })

  // Open: focus the end the user asked for. Close: hand focus back to the trigger,
  // done in the cleanup because by the time the parent re-renders as closed this
  // subtree is already unmounted.
  useEffect(() => {
    const content = ctx.contentRef.current
    if (!content) return
    const doc = content.ownerDocument
    const items = Array.from(content.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
      (item) => !isItemDisabled(item),
    )
    const intent = ctx.intentRef.current
    ctx.intentRef.current = 'first'
    const target = intent === 'last' ? items[items.length - 1] : items[0]
    // An empty menu still has to take focus, or Escape has nothing to close from.
    ;(target ?? content).focus()

    return () => {
      const trigger = ctx.triggerRef.current
      if (!trigger?.isConnected) return
      const active = doc.activeElement
      // Only reclaim focus if the menu still had it: an outside click has already
      // put focus where the user pointed, and stealing it back is worse than useless.
      if (content.contains(active) || active === null || active === doc.body) trigger.focus()
    }
  }, [ctx.contentRef, ctx.triggerRef, ctx.intentRef])

  // Typeahead buffer. A ref, not state: it must never cause a render, and a stale
  // closure over it would break multi-key matching.
  const typedRef = useRef('')
  const typedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (typedTimer.current !== null) clearTimeout(typedTimer.current)
    },
    [],
  )

  const runTypeahead = useCallback(
    (key: string) => {
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
      if (items.length === 0) return

      const query = typedRef.current
      const active = content.ownerDocument.activeElement
      const from = active instanceof HTMLElement ? items.indexOf(active) : -1
      // Repeating one letter cycles through the items starting with it; a longer
      // buffer re-matches from the current item, so typing keeps narrowing.
      const startAt = query.length === 1 ? from + 1 : from < 0 ? 0 : from

      for (let step = 0; step < items.length; step += 1) {
        const candidate = items[(startAt + step + items.length) % items.length]
        if (!candidate) continue
        const label = (candidate.textContent ?? '').trim().toLowerCase()
        if (label.startsWith(query)) {
          candidate.focus()
          return
        }
      }
    },
    [ctx.contentRef],
  )

  return (
    <div
      ref={setRef}
      id={ctx.contentId}
      role="menu"
      aria-labelledby={ctx.triggerId}
      aria-orientation="vertical"
      // Programmatically focusable only - the menu is never a tab stop, its items
      // are reached with the arrow keys.
      tabIndex={-1}
      className={cx('vk-dropdown-menu', className)}
      data-side={resolved?.side ?? ctx.side}
      data-align={resolved?.align ?? ctx.align}
      data-positioned={resolved ? '' : undefined}
      data-state="open"
      style={{ left: `${resolved?.x ?? 0}px`, top: `${resolved?.y ?? 0}px`, ...style }}
      onFocus={roving.onFocus}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return

        if (event.key === 'Tab') {
          // A menu is a modal-ish burst of interaction: Tab dismisses it rather than
          // walking into the page behind it with the menu still hanging open.
          event.preventDefault()
          ctx.setOpen(false)
          return
        }

        // Arrows, Home and End: the roving hook owns these, including skipping
        // disabled items and looping.
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
          event.preventDefault()
          runTypeahead(event.key)
        }
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

/** The menu surface. Renders nothing while closed. */
export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent(props, ref) {
    const ctx = useMenuContext('DropdownMenu.Content')
    if (!ctx.open) return null

    return (
      <Portal container={ctx.container}>
        <MenuPanel {...props} forwardedRef={ref} />
      </Portal>
    )
  },
)

/** Shared plumbing for `Item` and `CheckboxItem`. */
function useItemBehaviour(part: string, disabled: boolean | undefined, closeOnSelect: boolean) {
  const ctx = useMenuContext(part)
  return useCallback(
    (select: (() => void) | undefined) => {
      if (disabled) return
      select?.()
      if (closeOnSelect) ctx.setOpen(false)
    },
    [ctx, disabled, closeOnSelect],
  )
}

export interface DropdownMenuItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  /**
   * Unavailable. Rendered as `aria-disabled` rather than the native `disabled`
   * attribute, so the item keeps its accessible name and a screen reader user still
   * hears that the command exists. Arrow navigation skips it either way.
   */
  disabled?: boolean
  /** Called when the item is activated by click, Enter or Space. */
  onSelect?: () => void
  /** Close the menu after selecting. Default `true`. */
  closeOnSelect?: boolean
  /** Trailing hint, e.g. a keyboard shortcut. Not announced as part of the name. */
  shortcut?: ReactNode
}

/**
 * One command. A real `<button>`, which is what makes Enter and Space work with no
 * key handling of our own.
 */
export const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  function DropdownMenuItem(
    { className, disabled, onSelect, onClick, closeOnSelect = true, shortcut, children, ...rest },
    ref,
  ) {
    const activate = useItemBehaviour('DropdownMenu.Item', disabled, closeOnSelect)

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        // Every item is tabIndex -1: the menu owns focus while it is open, and Tab
        // closes it rather than moving between items.
        tabIndex={-1}
        data-vk-roving-item=""
        className={cx('vk-dropdown-menu__item', className)}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? '' : undefined}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented) return
          activate(onSelect)
        }}
        {...rest}
      >
        <span className="vk-dropdown-menu__item-label">{children}</span>
        {shortcut ? <span className="vk-dropdown-menu__shortcut">{shortcut}</span> : null}
      </button>
    )
  },
)

export interface DropdownMenuCheckboxItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'checked' | 'defaultChecked'> {
  /** Controlled checked state. */
  checked?: boolean
  /** Initial checked state while uncontrolled. Default `false`. */
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  /** Close the menu after toggling. Default `false` - ticking two boxes is one visit. */
  closeOnSelect?: boolean
  shortcut?: ReactNode
}

/** A menu item that carries a checked state. `role="menuitemcheckbox"` + `aria-checked`. */
export const DropdownMenuCheckboxItem = forwardRef<
  HTMLButtonElement,
  DropdownMenuCheckboxItemProps
>(function DropdownMenuCheckboxItem(
  {
    className,
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled,
    onClick,
    closeOnSelect = false,
    shortcut,
    children,
    ...rest
  },
  ref,
) {
  const [isChecked, setChecked] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  })
  const activate = useItemBehaviour('DropdownMenu.CheckboxItem', disabled, closeOnSelect)

  return (
    <button
      ref={ref}
      type="button"
      role="menuitemcheckbox"
      tabIndex={-1}
      data-vk-roving-item=""
      className={cx('vk-dropdown-menu__item', className)}
      aria-checked={isChecked}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? '' : undefined}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        activate(() => setChecked(!isChecked))
      }}
      {...rest}
    >
      <span className="vk-dropdown-menu__indicator" aria-hidden="true">
        {isChecked ? '✓' : null}
      </span>
      <span className="vk-dropdown-menu__item-label">{children}</span>
      {shortcut ? <span className="vk-dropdown-menu__shortcut">{shortcut}</span> : null}
    </button>
  )
})

export type DropdownMenuSeparatorProps = HTMLAttributes<HTMLHRElement>

/**
 * A divider between groups of items.
 *
 * A real `<hr>`, not a `div role="separator"`. It maps to the same role with none of
 * the ARIA: no `aria-orientation` to keep in sync, and no lint rule (rightly) asking
 * where the `tabindex` and `aria-valuenow` of a focusable separator went.
 */
export const DropdownMenuSeparator = forwardRef<HTMLHRElement, DropdownMenuSeparatorProps>(
  function DropdownMenuSeparator({ className, ...rest }, ref) {
    return <hr ref={ref} className={cx('vk-dropdown-menu__separator', className)} {...rest} />
  },
)

export type DropdownMenuLabelProps = HTMLAttributes<HTMLDivElement>

/**
 * A heading over a group of items.
 *
 * `role="presentation"`: inside `role="menu"` the only children with meaning are
 * items, groups and separators, and a stray labelled node there is both an
 * `aria-required-children` violation and an extra stop for anyone reading the menu
 * item by item. The text is still visible, and still read when the user reaches it
 * by browsing rather than by menu navigation.
 */
export const DropdownMenuLabel = forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  function DropdownMenuLabel({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="presentation"
        className={cx('vk-dropdown-menu__label', className)}
        {...rest}
      >
        {children}
      </div>
    )
  },
)

DropdownMenu.Trigger = DropdownMenuTrigger
DropdownMenu.Content = DropdownMenuContent
DropdownMenu.Item = DropdownMenuItem
DropdownMenu.CheckboxItem = DropdownMenuCheckboxItem
DropdownMenu.Separator = DropdownMenuSeparator
DropdownMenu.Label = DropdownMenuLabel
