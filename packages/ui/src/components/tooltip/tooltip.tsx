'use client'

import {
  type CSSProperties,
  cloneElement,
  type FocusEventHandler,
  type HTMLAttributes,
  type PointerEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { useAnchoredPosition } from '../../hooks/use-anchored-position'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useDismiss } from '../../hooks/use-dismiss'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
import type { Align, Side } from '../../utils/position'
import { Portal, type PortalContainer } from '../portal'

/**
 * The props Tooltip injects into whatever element you pass as its child.
 *
 * Declared as a type rather than just spread blindly, because the child's own
 * handlers must survive: everything here is composed with, not substituted for, the
 * matching prop already on the child.
 */
export interface TooltipTriggerProps {
  'aria-describedby'?: string
  'data-vk-tooltip-open'?: '' | undefined
  ref?: Ref<HTMLElement>
  onPointerEnter?: PointerEventHandler<HTMLElement>
  onPointerLeave?: PointerEventHandler<HTMLElement>
  onFocus?: FocusEventHandler<HTMLElement>
  onBlur?: FocusEventHandler<HTMLElement>
}

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'content'> {
  /**
   * The trigger. Exactly one element, and it must spread the props it is given -
   * `aria-describedby` has to land on the real interactive element for a screen
   * reader to read the tip, and a wrapper `<span>` cannot stand in for it.
   *
   * A ref is attached to it (composed with any ref it already had) to measure
   * against, with the first pointer or focus event as a fallback - so a child that
   * swallows refs still positions correctly on hover.
   */
  children: ReactElement<TooltipTriggerProps>
  /** The tip. Keep it short and non-interactive: a tooltip is never focusable. */
  content: ReactNode
  /** Preferred side. Flipped to its opposite when there is no room. Default `'top'`. */
  side?: Side
  /** Cross-axis alignment. Default `'center'`. */
  align?: Align
  /** Gap between trigger and tip, px. Default `8`. */
  offset?: number
  /** Minimum distance kept from the viewport edges, px. Default `8`. */
  padding?: number
  /** Controlled open state. */
  open?: boolean
  /** Initial open state while uncontrolled. Default `false`. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Delay before a hover opens the tip, ms. Default `200`.
   *
   * Keyboard focus deliberately ignores this and opens immediately: a delay on
   * hover stops tips flickering as the pointer crosses a toolbar, but a keyboard
   * user has already committed by pressing Tab, and making them wait is just lag.
   */
  openDelay?: number
  /**
   * Delay before the tip closes after the pointer leaves, ms. Default `150`.
   *
   * Must stay above zero: it is the window in which the pointer can cross the gap
   * from the trigger onto the tip itself without the tip disappearing underneath it.
   */
  closeDelay?: number
  /** Never open. For a trigger whose tip is temporarily meaningless. */
  disabled?: boolean
  /** Where to portal the tip. Defaults to `document.body`. */
  container?: PortalContainer
}

interface TooltipPanelProps {
  anchorRef: RefObject<HTMLElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  id: string
  side: Side
  align: Align
  offset: number
  padding: number
  className: string | undefined
  style: CSSProperties | undefined
  children: ReactNode
  rest: HTMLAttributes<HTMLDivElement>
  onPointerEnter: () => void
  onPointerLeave: () => void
}

/**
 * Measure, resolve, reposition on scroll and resize.
 *
 * Intentionally duplicated in the three overlay components rather than shared,
 * because the shared-utility budget for this milestone is `utils/position.ts`. If a
 * fourth overlay wants it, promote it to `hooks/use-anchored-position/` then.
 */
/**
 * The tip itself. A separate component so that all layout measurement lives below
 * the `Portal` boundary and can never run during server rendering.
 */
function TooltipPanel({
  anchorRef,
  panelRef,
  id,
  side,
  align,
  offset,
  padding,
  className,
  style,
  children,
  rest,
  onPointerEnter,
  onPointerLeave,
}: TooltipPanelProps) {
  const resolved = useAnchoredPosition(anchorRef, panelRef, side, align, offset, padding)

  return (
    <div
      ref={panelRef}
      id={id}
      role="tooltip"
      className={cx('vk-tooltip', className)}
      data-side={resolved?.side ?? side}
      data-align={resolved?.align ?? align}
      data-positioned={resolved ? '' : undefined}
      // Not focusable, no tab stop, no focus trap: a tooltip is a description of
      // something else, and putting it in the tab order would strand the user in
      // a thing they cannot act on.
      style={{ left: `${resolved?.x ?? 0}px`, top: `${resolved?.y ?? 0}px`, ...style }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      {...rest}
    >
      {children}
    </div>
  )
}

/**
 * A description that appears on hover and on focus.
 *
 * Three details that are easy to get wrong and are the reason this is a component:
 *
 * - It is wired with `aria-describedby`, not `aria-labelledby`. A tooltip
 *   supplements the trigger's own name; it does not replace it. A button whose only
 *   name comes from a tooltip is a button with no name for anyone using touch.
 * - It is not focusable and does not trap focus. Escape closes it, matching the
 *   Authoring Practices, but Tab always moves on past the trigger.
 * - It stays open while the pointer travels from the trigger onto the tip, which is
 *   what `closeDelay` buys and what makes selectable text in a tip possible at all.
 */
export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  offset = 8,
  padding = 8,
  open,
  defaultOpen = false,
  onOpenChange,
  openDelay = 200,
  closeDelay = 150,
  disabled,
  container,
  id,
  className,
  style,
  ...rest
}: TooltipProps) {
  const tooltipId = useIsomorphicId(id)
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  // The trigger element, found two ways on purpose. The ref is the reliable one and
  // the only one that works for a tooltip opened programmatically, with no pointer
  // and no focus involved. The event fallback below covers a child that swallows the
  // ref (a function component that never forwards it), where a tooltip anchored to
  // nothing would otherwise be measured at 0,0 and stay invisible.
  const triggerRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const visible = isOpen && !disabled

  const clearTimers = useCallback(() => {
    if (openTimer.current !== null) clearTimeout(openTimer.current)
    if (closeTimer.current !== null) clearTimeout(closeTimer.current)
    openTimer.current = null
    closeTimer.current = null
  }, [])

  // A tooltip whose trigger unmounts mid-delay must not open into the void.
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

  // Escape closes the tip even though it never had focus - the pointer may be
  // resting on a trigger whose tip is covering what the user wants to read. Outside
  // presses close it too, which is the only dismissal a touch user gets.
  useDismiss({
    onDismiss: () => {
      clearTimers()
      setIsOpen(false)
    },
    refs: [triggerRef, panelRef],
    enabled: visible,
  })

  const childProps = children.props

  // React 19 passes a child's own ref through `props.ref`; React 18 keeps it as a
  // field on the element. Both are read, so wrapping `<Button ref={mine} />` in a
  // Tooltip does not silently swallow `mine` on either version of the peer range.
  const childRef =
    childProps.ref ?? (children as unknown as { ref?: Ref<HTMLElement> | null }).ref ?? null
  const setTriggerRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node
      if (typeof childRef === 'function') childRef(node)
      else if (childRef) childRef.current = node
    },
    [childRef],
  )

  const triggerProps: TooltipTriggerProps = {
    'aria-describedby': visible ? tooltipId : childProps['aria-describedby'],
    'data-vk-tooltip-open': visible ? '' : undefined,
    ref: setTriggerRef,
    onPointerEnter: (event) => {
      childProps.onPointerEnter?.(event)
      if (!triggerRef.current) triggerRef.current = event.currentTarget
      scheduleOpen(openDelay)
    },
    onPointerLeave: (event) => {
      childProps.onPointerLeave?.(event)
      scheduleClose(closeDelay)
    },
    onFocus: (event) => {
      childProps.onFocus?.(event)
      if (!triggerRef.current) triggerRef.current = event.currentTarget
      scheduleOpen(0)
    },
    onBlur: (event) => {
      childProps.onBlur?.(event)
      // No delay on blur: focus has already moved on, so there is no pointer on its
      // way to the tip and nothing to keep it alive for.
      scheduleClose(0)
    },
  }

  return (
    <>
      {cloneElement(children, triggerProps)}
      {visible ? (
        <Portal container={container}>
          <TooltipPanel
            anchorRef={triggerRef}
            panelRef={panelRef}
            id={tooltipId}
            side={side}
            align={align}
            offset={offset}
            padding={padding}
            className={className}
            style={style}
            rest={rest}
            onPointerEnter={clearTimers}
            onPointerLeave={() => scheduleClose(closeDelay)}
          >
            {content}
          </TooltipPanel>
        </Portal>
      ) : null}
    </>
  )
}
