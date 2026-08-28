'use client'

import {
  type AnchorHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type FocusEvent as ReactFocusEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
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
import { cx } from '../../utils/cx'
import type { Align, Side } from '../../utils/position'
import { Slot } from '../../utils/slot'
import { Portal, type PortalContainer } from '../portal'

interface HoverCardContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  scheduleOpen: (delay: number) => void
  scheduleClose: (delay: number) => void
  clearTimers: () => void
  openDelay: number
  closeDelay: number
  triggerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLDivElement | null>
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null)

/** Throws with the part name, because "cannot read property of null" is not a bug report. */
function useHoverCardContext(part: string): HoverCardContextValue {
  const context = useContext(HoverCardContext)
  if (!context) throw new Error(`${part} must be rendered inside <HoverCard>.`)
  return context
}

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

export interface HoverCardProps {
  children?: ReactNode
  /** Controlled open state. */
  open?: boolean
  /** Initial open state while uncontrolled. Default `false`. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Delay before a hover opens the card, ms. Default `300` — longer than a tooltip's,
   * because a card is heavier than a tip and a pointer merely passing over a list of
   * mentions must not open one preview per name.
   *
   * Keyboard focus ignores this and opens immediately: the delay exists to filter out
   * accidental hovers, and pressing Tab is never accidental.
   */
  openDelay?: number
  /**
   * Delay before the card closes after the pointer leaves, ms. Default `150`.
   *
   * Must stay above zero: it is the window in which the pointer can cross the gap from
   * the trigger onto the card itself without the card vanishing underneath it.
   */
  closeDelay?: number
}

/**
 * A rich preview that appears on hover and on focus — a user card on an @mention, a
 * link preview, a definition.
 *
 * **Usage requirement: everything in the card must also be available somewhere else** —
 * on the page the trigger links to, at the very least. The Authoring Practices have no
 * hover-card pattern, and the honest reading of that gap is that a hover card cannot be
 * anyone's only path to anything: touch users never hover, and the card is deliberately
 * not announced as a popup. So the trigger keeps its own semantics untouched (no
 * `aria-haspopup`, no `aria-expanded`, no `aria-describedby` — prose read as a
 * description would be a wall of unpunctuated text), and the card itself carries no
 * role. It is presentation for pointer and keyboard users who can see it; the content
 * it previews is the real interface.
 *
 * What it does guarantee:
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | Tab (focus the trigger) | Open the card immediately, no delay |
 * | Tab away / blur | Close immediately |
 * | Escape | Close, without moving focus |
 *
 * Not focus-trapping and not modal — the page behind stays fully interactive. Moving
 * the pointer from the trigger into the card keeps it open (the `closeDelay` window is
 * the bridge across the gap), which is what makes text in the card selectable at all.
 *
 * Renders no DOM of its own — it is the state and the timers, nothing else.
 */
export function HoverCard({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  openDelay = 300,
  closeDelay = 150,
}: HoverCardProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const triggerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (openTimer.current !== null) clearTimeout(openTimer.current)
    if (closeTimer.current !== null) clearTimeout(closeTimer.current)
    openTimer.current = null
    closeTimer.current = null
  }, [])

  // A card whose trigger unmounts mid-delay must not open into the void.
  useEffect(() => clearTimers, [clearTimers])

  const scheduleOpen = useCallback(
    (delay: number) => {
      clearTimers()
      if (delay <= 0) {
        setIsOpen(true)
        return
      }
      openTimer.current = setTimeout(() => {
        openTimer.current = null
        setIsOpen(true)
      }, delay)
    },
    [clearTimers, setIsOpen],
  )

  const scheduleClose = useCallback(
    (delay: number) => {
      clearTimers()
      if (delay <= 0) {
        setIsOpen(false)
        return
      }
      closeTimer.current = setTimeout(() => {
        closeTimer.current = null
        setIsOpen(false)
      }, delay)
    },
    [clearTimers, setIsOpen],
  )

  const value = useMemo<HoverCardContextValue>(
    () => ({
      open: isOpen,
      setOpen: setIsOpen,
      scheduleOpen,
      scheduleClose,
      clearTimers,
      openDelay,
      closeDelay,
      triggerRef,
      contentRef,
    }),
    [isOpen, setIsOpen, scheduleOpen, scheduleClose, clearTimers, openDelay, closeDelay],
  )

  return <HoverCardContext.Provider value={value}>{children}</HoverCardContext.Provider>
}

export interface HoverCardTriggerProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Render the child element as the trigger instead of an `<a>` — for a router `<Link>`,
   * or an existing Avatar-plus-name lockup. The hover and focus handlers land on the
   * child, so it must be a single element, and it should be focusable: a trigger that
   * cannot take focus makes the card pointer-only.
   */
  asChild?: boolean
}

/**
 * The element being previewed. An `<a>` by default, because a hover card nearly always
 * previews a destination — a profile, a document — and the trigger must remain that
 * link. Give it an `href`; an anchor without one is not focusable, and the card would
 * then never open for a keyboard user.
 */
export const HoverCardTrigger = forwardRef<HTMLAnchorElement, HoverCardTriggerProps>(
  function HoverCardTrigger(
    { asChild, className, onPointerEnter, onPointerLeave, onFocus, onBlur, children, ...rest },
    ref,
  ) {
    const ctx = useHoverCardContext('HoverCard.Trigger')
    const setRef = useMergedRef(ctx.triggerRef, ref)

    // No aria-haspopup, aria-expanded or aria-controls on purpose — see the note on
    // `HoverCard`. `data-state` is for styling only.
    const shared = {
      ref: setRef,
      className: cx('vk-hover-card__trigger', className),
      'data-state': ctx.open ? ('open' as const) : ('closed' as const),
      onPointerEnter: (event: ReactPointerEvent<HTMLAnchorElement>) => {
        onPointerEnter?.(event)
        // Touch never hovers: a finger's pointerenter fires as part of a tap, and
        // opening the card there would race the navigation the tap is about to cause.
        if (event.pointerType === 'touch') return
        ctx.scheduleOpen(ctx.openDelay)
      },
      onPointerLeave: (event: ReactPointerEvent<HTMLAnchorElement>) => {
        onPointerLeave?.(event)
        if (event.pointerType === 'touch') return
        ctx.scheduleClose(ctx.closeDelay)
      },
      onFocus: (event: ReactFocusEvent<HTMLAnchorElement>) => {
        onFocus?.(event)
        ctx.scheduleOpen(0)
      },
      onBlur: (event: ReactFocusEvent<HTMLAnchorElement>) => {
        onBlur?.(event)
        // Focus moving into the card — clicking text in it to select some — is not
        // leaving; anywhere else is, and then there is no pointer to wait for.
        if (ctx.contentRef.current?.contains(event.relatedTarget as Node | null)) return
        ctx.scheduleClose(0)
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
      <a {...shared} {...rest}>
        {children}
      </a>
    )
  },
)

export interface HoverCardContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Preferred side. Flipped to its opposite when there is no room. Default `'bottom'`. */
  side?: Side
  /** Cross-axis alignment. Default `'center'`. */
  align?: Align
  /** Gap between trigger and card, px. Default `8`. */
  offset?: number
  /** Minimum distance kept from the viewport edges, px. Default `8`. */
  padding?: number
  /** Where to portal the card. Defaults to `document.body`. */
  container?: PortalContainer
}

interface HoverCardPanelProps extends Omit<HoverCardContentProps, 'container'> {
  forwardedRef: Ref<HTMLDivElement> | undefined
}

/**
 * The card. Split out from `HoverCardContent` so every layout measurement lives below
 * the Portal boundary, where it cannot run during SSR.
 */
function HoverCardPanel({
  forwardedRef,
  side = 'bottom',
  align = 'center',
  offset = 8,
  padding = 8,
  className,
  style,
  children,
  onPointerEnter,
  onPointerLeave,
  ...rest
}: HoverCardPanelProps) {
  const ctx = useHoverCardContext('HoverCard.Content')
  const setRef = useMergedRef(ctx.contentRef, forwardedRef)
  const resolved = useAnchoredPosition(ctx.triggerRef, ctx.contentRef, side, align, offset, padding)

  // Escape closes even though the card never has focus — it may be covering what the
  // user wants to read. An outside press closes it too, which matters for the one way
  // it can otherwise stick: opened by focus, with no pointer nearby to leave.
  useDismiss({
    onDismiss: () => {
      ctx.clearTimers()
      ctx.setOpen(false)
    },
    refs: [ctx.triggerRef, ctx.contentRef],
  })

  return (
    <div
      ref={setRef}
      // No role. The card is supplementary presentation (see `HoverCard`); giving it
      // `dialog` or `tooltip` would promise semantics — focus management, description
      // wiring — that a hover card deliberately does not have.
      className={cx('vk-hover-card', className)}
      data-side={resolved?.side ?? side}
      data-align={resolved?.align ?? align}
      data-positioned={resolved ? '' : undefined}
      data-state="open"
      style={{ left: `${resolved?.x ?? 0}px`, top: `${resolved?.y ?? 0}px`, ...style }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        // The safe-hover bridge: arriving on the card cancels the close that leaving
        // the trigger scheduled.
        ctx.clearTimers()
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        ctx.scheduleClose(ctx.closeDelay)
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

/** The card. Renders nothing at all while closed, so its content never runs early. */
export const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(
  function HoverCardContent({ container, ...props }, ref) {
    const ctx = useHoverCardContext('HoverCard.Content')
    if (!ctx.open) return null

    return (
      <Portal container={container}>
        <HoverCardPanel {...props} forwardedRef={ref} />
      </Portal>
    )
  },
)

HoverCard.Trigger = HoverCardTrigger
HoverCard.Content = HoverCardContent
