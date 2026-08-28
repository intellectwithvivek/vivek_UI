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
import { getFocusableElements } from '../../hooks/use-focus-trap'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
import type { Align, Side } from '../../utils/position'
import { Slot } from '../../utils/slot'
import { Portal, type PortalContainer } from '../portal'

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerId: string
  contentId: string
  triggerRef: RefObject<HTMLButtonElement | null>
  contentRef: RefObject<HTMLDivElement | null>
  side: Side
  align: Align
  offset: number
  padding: number
  container: PortalContainer | undefined
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

/** Throws with the part name, because "cannot read property of null" is not a bug report. */
function usePopoverContext(part: string): PopoverContextValue {
  const context = useContext(PopoverContext)
  if (!context) throw new Error(`${part} must be rendered inside <Popover>.`)
  return context
}

/**
 * Measure, resolve, reposition on scroll and resize. See the note in
 * `tooltip.tsx`: deliberately duplicated across the three overlays rather than
 * promoted to a shared hook while there are only three of them.
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

export interface PopoverProps {
  children?: ReactNode
  /** Controlled open state. */
  open?: boolean
  /** Initial open state while uncontrolled. Default `false`. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Preferred side. Flipped to its opposite when there is no room. Default `'bottom'`. */
  side?: Side
  /** Cross-axis alignment. Default `'center'`. */
  align?: Align
  /** Gap between trigger and panel, px. Default `8`. */
  offset?: number
  /** Minimum distance kept from the viewport edges, px. Default `8`. */
  padding?: number
  /** Where to portal the panel. Defaults to `document.body`. */
  container?: PortalContainer
  /** Ids for the trigger/panel pair. Generated when omitted. */
  id?: string
}

/**
 * A click-triggered non-modal dialog anchored to its trigger.
 *
 * Renders no DOM of its own - it is the state and the wiring, nothing else - so it
 * can sit anywhere in a tree without disturbing layout.
 *
 * Non-modal on purpose: the page behind stays interactive and Tab can leave the
 * panel, per the Authoring Practices for a non-modal dialog. What it does guarantee
 * is the pair of things a keyboard user cannot work without - focus moves into the
 * panel on open, and comes back to the trigger on close.
 */
export function Popover({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  side = 'bottom',
  align = 'center',
  offset = 8,
  padding = 8,
  container,
  id,
}: PopoverProps) {
  const baseId = useIsomorphicId(id)
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const value = useMemo<PopoverContextValue>(
    () => ({
      open: isOpen,
      setOpen: setIsOpen,
      triggerId: `${baseId}-trigger`,
      contentId: `${baseId}-content`,
      triggerRef,
      contentRef,
      side,
      align,
      offset,
      padding,
      container,
    }),
    [isOpen, setIsOpen, baseId, side, align, offset, padding, container],
  )

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
}

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Render the child element as the trigger instead of a `<button>` — the escape hatch a
   * design-system Button or a router link needs. The ARIA wiring (`aria-haspopup`,
   * `aria-expanded`, `aria-controls`) and the toggle handler land on the child, so it must
   * be a single focusable element.
   */
  asChild?: boolean
}

/** The button that toggles the panel. A real `<button>` by default, so Enter and Space are free. */
export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  function PopoverTrigger({ asChild, className, onClick, children, ...rest }, ref) {
    const ctx = usePopoverContext('Popover.Trigger')
    const setRef = useMergedRef(ctx.triggerRef, ref)

    const shared = {
      ref: setRef,
      id: ctx.triggerId,
      className: cx('vk-popover__trigger', className),
      'aria-haspopup': 'dialog' as const,
      'aria-expanded': ctx.open,
      'aria-controls': ctx.open ? ctx.contentId : undefined,
      'data-state': ctx.open ? 'open' : 'closed',
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        ctx.setOpen(!ctx.open)
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
      <button type="button" {...shared} {...rest}>
        {children}
      </button>
    )
  },
)

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Skip moving focus into the panel on open. Only for a panel that is purely
   * informational - anything with a control in it needs the default.
   */
  autoFocus?: boolean
}

interface PopoverPanelProps extends PopoverContentProps {
  forwardedRef: Ref<HTMLDivElement> | undefined
}

/**
 * The panel. Split out from `PopoverContent` so every layout measurement and focus
 * move lives below the Portal boundary, where it cannot run during SSR.
 */
function PopoverPanel({
  forwardedRef,
  autoFocus = true,
  className,
  style,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: PopoverPanelProps) {
  const ctx = usePopoverContext('Popover.Content')
  const setRef = useMergedRef(ctx.contentRef, forwardedRef)
  const resolved = useAnchoredPosition(
    ctx.triggerRef,
    ctx.contentRef,
    ctx.side,
    ctx.align,
    ctx.offset,
    ctx.padding,
  )

  useDismiss({
    onDismiss: () => ctx.setOpen(false),
    refs: [ctx.triggerRef, ctx.contentRef],
  })

  // Focus in on open, focus back to the trigger on close. The cleanup is the only
  // place that can do the second half reliably: by the time the parent has
  // re-rendered with `open: false` this subtree is already gone.
  const autoFocusRef = useRef(autoFocus)
  autoFocusRef.current = autoFocus
  useEffect(() => {
    const content = ctx.contentRef.current
    if (!content) return
    const doc = content.ownerDocument
    if (autoFocusRef.current) {
      const first = getFocusableElements(content)[0]
      // The panel itself carries tabindex="-1", so it is a valid landing spot when
      // there is nothing inside to focus.
      ;(first ?? content).focus()
    }

    return () => {
      const trigger = ctx.triggerRef.current
      if (!trigger?.isConnected) return
      // Only reclaim focus if the panel still had it. If the user clicked something
      // else on the page, that click owns focus and yanking it back is the rude,
      // and more confusing, thing to do.
      const active = doc.activeElement
      if (content.contains(active) || active === null || active === doc.body) trigger.focus()
    }
  }, [ctx.contentRef, ctx.triggerRef])

  return (
    <div
      ref={setRef}
      id={ctx.contentId}
      role="dialog"
      // Named by its trigger unless the caller says otherwise: a dialog with no
      // accessible name is an axe violation and, worse, an unannounced context switch.
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : ctx.triggerId)}
      // Focusable only programmatically, never a tab stop of its own.
      tabIndex={-1}
      className={cx('vk-popover', className)}
      data-side={resolved?.side ?? ctx.side}
      data-align={resolved?.align ?? ctx.align}
      data-positioned={resolved ? '' : undefined}
      data-state="open"
      style={{ left: `${resolved?.x ?? 0}px`, top: `${resolved?.y ?? 0}px`, ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}

/** The panel. Renders nothing at all while closed, so its content never runs early. */
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(props, ref) {
    const ctx = usePopoverContext('Popover.Content')
    if (!ctx.open) return null

    return (
      <Portal container={ctx.container}>
        <PopoverPanel {...props} forwardedRef={ref} />
      </Portal>
    )
  },
)

export type PopoverCloseProps = ButtonHTMLAttributes<HTMLButtonElement>

/**
 * A button that closes the panel. Worth having as a part rather than leaving to the
 * consumer: focus returning to the trigger is handled by the panel unmounting, so a
 * hand-rolled close button gets it for free only if it closes through the context.
 */
export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(function PopoverClose(
  { className, onClick, children, ...rest },
  ref,
) {
  const ctx = usePopoverContext('Popover.Close')

  return (
    <button
      ref={ref}
      type="button"
      className={cx('vk-popover__close', className)}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        ctx.setOpen(false)
      }}
      {...rest}
    >
      {children}
    </button>
  )
})

Popover.Trigger = PopoverTrigger
Popover.Content = PopoverContent
Popover.Close = PopoverClose
