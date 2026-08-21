'use client'

import {
  createContext,
  type ForwardedRef,
  forwardRef,
  type HTMLAttributes,
  type MutableRefObject,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useDismiss } from '../../hooks/use-dismiss'
import { useFocusTrap } from '../../hooks/use-focus-trap'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { useScrollLock } from '../../hooks/use-scroll-lock'
import { cx } from '../../utils/cx'
import { Portal, type PortalContainer } from '../portal'

/**
 * The machinery behind `Modal` and `Drawer` — one modal dialog implementation, two
 * presentations. Internal: not exported from the package entry point.
 *
 * It lives under `components/modal/` only because this agent's brief limited new files
 * to the `modal/` and `drawer/` directories; it belongs in `components/internal/`
 * alongside the chart internals, and moving it is a pure file move plus two imports.
 */

/** Anything ref-like: a `useRef` object, or a hand-rolled `{ current }` box. */
export type DialogFocusRef = { readonly current: HTMLElement | null }

export interface DialogOwnProps {
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean
  /** Initial open state while uncontrolled. */
  defaultOpen?: boolean
  /** Called whenever the dialog asks to open or close, in both modes. */
  onOpenChange?: (open: boolean) => void
  /** Close on a press on the backdrop. Default `true`. */
  closeOnOverlayClick?: boolean
  /** Close on Escape. Default `true`. */
  closeOnEscape?: boolean
  /**
   * Where focus lands on open. Falls back to the first focusable descendant, then to
   * the dialog itself. Prefer this over `autoFocus`, which fires before the dialog can
   * record which element to return focus to.
   */
  initialFocus?: DialogFocusRef
  /**
   * Accessible name shortcut: renders a header with a title. Use this *or* a `Title`
   * part, not both — a `Title` part wins the `aria-labelledby` wiring if you do.
   */
  title?: string
  /** Extra class for the backdrop element. `className` styles the panel. */
  overlayClassName?: string
  /** Portal mount point. Defaults to `document.body`. */
  container?: PortalContainer
  children?: ReactNode
}

interface DialogContextValue {
  /** Id for a `Title` part. */
  titleId: string
  /** Id for a `Body` part. */
  bodyId: string
  close: () => void
  /** Parts report their presence so `aria-labelledby`/`-describedby` never dangle. */
  registerTitle: (present: boolean) => void
  registerBody: (present: boolean) => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

/**
 * Registration happens in a layout effect so the wiring is in place before the browser
 * paints and before the focus trap hands the dialog to a screen reader.
 *
 * `useLayoutEffect` is safe here despite SSR: every part renders inside `Portal`, which
 * returns `null` until it has mounted, so no part is ever rendered on the server.
 */
function useRegistration(register: ((present: boolean) => void) | undefined): void {
  useLayoutEffect(() => {
    if (!register) return
    register(true)
    return () => register(false)
  }, [register])
}

/* ------------------------------------------------------------------ *
 * Making the rest of the page inert
 * ------------------------------------------------------------------ */

/** Elements that render nothing: hiding them is noise, not accessibility. */
const NON_RENDERED_TAGS = new Set([
  'BASE',
  'LINK',
  'META',
  'NOSCRIPT',
  'SCRIPT',
  'STYLE',
  'TEMPLATE',
  'TITLE',
])

/** Live regions keep announcing while a dialog is open — a toast must still be heard. */
function isLiveRegion(element: Element): boolean {
  if (element.hasAttribute('aria-live')) return true
  const role = element.getAttribute('role')
  return role === 'alert' || role === 'status' || role === 'log'
}

interface HiddenRecord {
  /** How many open dialogs are currently hiding this element. */
  count: number
  /** `null` means the attribute was absent and must be removed again. */
  ariaHidden: string | null
  inert: boolean
}

/**
 * Reference count per element, module-scope, mirroring `useScrollLock`.
 *
 * Without this, two dialogs that hide the same element both record its state — and the
 * second records what the first already wrote. Closing them in either order then leaves
 * the page wrong: close-inner-first un-inerts the page while the outer dialog is still
 * open (modality silently broken), and close-outer-first re-applies a stale `inert` that
 * nothing will ever remove (the app is left unclickable and invisible to screen readers,
 * recoverable only by reload).
 *
 * Counting makes hide/restore order-independent and idempotent: original values are
 * captured only on the 0 -> 1 transition and restored only on the 1 -> 0 transition.
 * A WeakMap so a removed element cannot leak.
 */
const hiddenElements = new WeakMap<Element, HiddenRecord>()

function hideElement(element: Element): void {
  const existing = hiddenElements.get(element)
  if (existing) {
    existing.count += 1
    return
  }
  hiddenElements.set(element, {
    count: 1,
    ariaHidden: element.getAttribute('aria-hidden'),
    inert: element.hasAttribute('inert'),
  })
  element.setAttribute('aria-hidden', 'true')
  element.setAttribute('inert', '')
}

function restoreElement(element: Element): void {
  const record = hiddenElements.get(element)
  if (!record) return
  record.count -= 1
  if (record.count > 0) return
  hiddenElements.delete(element)
  if (record.ariaHidden === null) element.removeAttribute('aria-hidden')
  else element.setAttribute('aria-hidden', record.ariaHidden)
  if (record.inert) element.setAttribute('inert', '')
  else element.removeAttribute('inert')
}

/**
 * Takes everything except `dialog` out of the accessibility tree and out of reach of
 * pointer and keyboard, and returns the exact undo.
 *
 * Walks the ancestor chain from the dialog up to `<body>`, hiding each ancestor's other
 * children. That is what makes it work regardless of where the dialog was portalled —
 * body, a container ref, a nested layout root — and it is why the portal wrapper the
 * dialog lives in is never hidden: it is on the path.
 *
 * Both `inert` and `aria-hidden` are set. `inert` is the modern answer and also removes
 * pointer/tab reach, but AT support for it is still uneven, so `aria-hidden` carries the
 * "not exposed" half for older screen readers. Hiding is reference counted per element
 * (see `hiddenElements`), so overlapping dialogs cannot clobber each other's recorded
 * state and closing them in any order leaves the page exactly as it was found.
 *
 * Known limitation: elements added to the page *after* a dialog opens are not hidden.
 */
function hideOutside(dialog: HTMLElement): () => void {
  const body = dialog.ownerDocument.body
  const hidden: Element[] = []

  for (let node: Element = dialog; ; ) {
    const parent = node.parentElement
    if (!parent) break

    for (const sibling of parent.children) {
      if (sibling === node) continue
      if (NON_RENDERED_TAGS.has(sibling.tagName)) continue
      if (isLiveRegion(sibling)) continue

      hideElement(sibling)
      hidden.push(sibling)
    }

    if (parent === body) break
    node = parent
  }

  return () => {
    for (let index = hidden.length - 1; index >= 0; index -= 1) {
      const element = hidden[index]
      if (element) restoreElement(element)
    }
  }
}

/**
 * Isolates the dialog from the rest of the page and returns focus to the trigger when it
 * closes.
 *
 * The two halves live in one effect because their order matters in both directions.
 * On open, the trigger is recorded *before* anything is made inert: a real browser blurs
 * whatever is focused inside a subtree that becomes inert, and the trigger would be lost.
 * On close, `inert` comes off *before* focus is restored, because `.focus()` on a node
 * inside an inert subtree does nothing at all.
 *
 * This must therefore be declared *before* `useFocusTrap`: React runs effects, and their
 * cleanups, in declaration order, and the trap's own restore is a no-op once focus is
 * already back outside the dialog.
 */
function useDialogIsolation(dialogRef: DialogFocusRef, active: boolean): void {
  useEffect(() => {
    if (!active) return
    const dialog = dialogRef.current
    if (!dialog) return

    const doc = dialog.ownerDocument
    const previous = doc.activeElement
    // `body` means "nothing was focused". An element inside the dialog means something
    // (an `autoFocus` child) got there first, and whatever the real trigger was is
    // already unrecoverable — better no restore than focusing a detached node.
    const trigger =
      previous instanceof HTMLElement && previous !== doc.body && !dialog.contains(previous)
        ? previous
        : null

    const showOutside = hideOutside(dialog)

    return () => {
      showOutside()
      if (trigger?.isConnected) trigger.focus()
    }
  }, [active, dialogRef])
}

/* ------------------------------------------------------------------ *
 * DialogBase
 * ------------------------------------------------------------------ */

export interface DialogBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
    DialogOwnProps {
  /** Block class name, e.g. `vk-modal`. Every part class derives from it. */
  block: string
  /** Extra attributes for the panel, e.g. `{ 'data-size': 'md' }`. */
  panelData?: Record<string, string>
}

export const DialogBase = forwardRef<HTMLDivElement, DialogBaseProps>(function DialogBase(
  {
    block,
    panelData,
    open: openProp,
    defaultOpen,
    onOpenChange,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    initialFocus,
    title,
    overlayClassName,
    container,
    className,
    children,
    id,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  forwardedRef,
) {
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  })

  const panelRef = useRef<HTMLDivElement | null>(null)
  // `Portal` renders nothing until it has resolved its mount point in an effect, so the
  // panel lands in a *later* commit than the one that flipped `open`. A plain ref would
  // still be null when the effects below first ran, and they would never run again. This
  // state re-renders once the node exists, which is the signal they wait for.
  const [panelNode, setPanelNode] = useState<HTMLDivElement | null>(null)
  const mounted = panelNode !== null
  const active = open && mounted

  const baseId = useIsomorphicId(id)
  const partTitleId = `${baseId}-title`
  const shortcutTitleId = `${baseId}-heading`
  const bodyId = `${baseId}-body`

  // Counts, not booleans: a consumer may render more than one Body, and unmounting one
  // must not claim there is no description left.
  const [titleCount, setTitleCount] = useState(0)
  const [bodyCount, setBodyCount] = useState(0)
  const registerTitle = useCallback((present: boolean) => {
    setTitleCount((count) => Math.max(0, count + (present ? 1 : -1)))
  }, [])
  const registerBody = useCallback((present: boolean) => {
    setBodyCount((count) => Math.max(0, count + (present ? 1 : -1)))
  }, [])

  const close = useCallback(() => setOpen(false), [setOpen])

  // Order is load-bearing — see useDialogIsolation.
  useDialogIsolation(panelRef, active)
  useFocusTrap(panelRef, active)

  // Declared after the trap on purpose: the trap has just put focus on the first
  // focusable descendant, and this overrides that choice when the caller made one.
  useEffect(() => {
    if (!active) return
    const target = initialFocus?.current
    if (target?.isConnected) target.focus()
  }, [active, initialFocus])

  useScrollLock(open)

  useDismiss({
    onDismiss: close,
    refs: [panelRef],
    enabled: open,
    escapeKey: closeOnEscape,
    // The backdrop covers the viewport, so it is the authoritative "outside" for a modal
    // dialog, and it is a far better signal than a document-level listener: a press in a
    // layer stacked *above* this one (a nested dialog, a select portalled to the body
    // from inside this dialog) is outside the panel but must not close it.
    outsidePress: false,
  })

  const context = useMemo<DialogContextValue>(
    () => ({ titleId: partTitleId, bodyId, close, registerTitle, registerBody }),
    [partTitleId, bodyId, close, registerTitle, registerBody],
  )

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node
      setPanelNode(node)
      assignRef(forwardedRef, node)
    },
    [forwardedRef],
  )

  const onOverlayPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!closeOnOverlayClick) return
      // Only a press on the backdrop itself. A press that started on the panel and a
      // secondary button are both somebody doing something else.
      if (event.target !== event.currentTarget) return
      if (event.button !== 0) return
      close()
    },
    [closeOnOverlayClick, close],
  )

  if (!open) return null

  const labelledBy =
    ariaLabelledBy ??
    (titleCount > 0 ? partTitleId : title !== undefined ? shortcutTitleId : undefined)
  const describedBy = ariaDescribedBy ?? (bodyCount > 0 ? bodyId : undefined)

  return (
    <Portal container={container}>
      {/* The backdrop is not a control: it has no role and is never a tab stop. Escape is
          its keyboard equivalent, and useDismiss owns that. */}
      <div
        className={cx(block, overlayClassName)}
        data-part="overlay"
        onPointerDown={onOverlayPointerDown}
      >
        <div
          ref={setPanelRef}
          id={baseId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          tabIndex={-1}
          className={cx(`${block}__panel`, className)}
          {...panelData}
          {...rest}
        >
          <DialogContext.Provider value={context}>
            {title === undefined ? null : (
              <div className={`${block}__header`}>
                <h2 className={`${block}__title`} id={shortcutTitleId}>
                  {title}
                </h2>
              </div>
            )}
            {children}
          </DialogContext.Provider>
        </div>
      </div>
    </Portal>
  )
})

function assignRef(ref: ForwardedRef<HTMLDivElement>, node: HTMLDivElement | null): void {
  // The library has no mergeRefs util yet (utils/ ships only `cx`), and adding one is
  // another agent's file. Five lines, one call site.
  if (typeof ref === 'function') ref(node)
  else if (ref) (ref as MutableRefObject<HTMLDivElement | null>).current = node
}

/* ------------------------------------------------------------------ *
 * Parts
 * ------------------------------------------------------------------ */

export interface DialogSlotProps extends HTMLAttributes<HTMLDivElement> {}

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level. `h2` by default, which is right for a dialog inside a page. */
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}

export interface DialogCloseButtonProps extends HTMLAttributes<HTMLButtonElement> {}

export interface DialogParts {
  Header: ReturnType<typeof forwardRef<HTMLDivElement, DialogSlotProps>>
  Body: ReturnType<typeof forwardRef<HTMLDivElement, DialogSlotProps>>
  Footer: ReturnType<typeof forwardRef<HTMLDivElement, DialogSlotProps>>
  Title: ReturnType<typeof forwardRef<HTMLHeadingElement, DialogTitleProps>>
  CloseButton: ReturnType<typeof forwardRef<HTMLButtonElement, DialogCloseButtonProps>>
}

/**
 * Builds the slot components for one block, so `Modal.Header` and `Drawer.Header` carry
 * their own class names instead of reading a block name out of context — which keeps them
 * correct even when rendered outside a dialog.
 */
export function createDialogParts(block: string): DialogParts {
  const Header = forwardRef<HTMLDivElement, DialogSlotProps>(function DialogHeader(
    { className, ...rest },
    ref,
  ) {
    return <div ref={ref} className={cx(`${block}__header`, className)} {...rest} />
  })

  const Body = forwardRef<HTMLDivElement, DialogSlotProps>(function DialogBody(
    { className, id, ...rest },
    ref,
  ) {
    const context = useContext(DialogContext)
    useRegistration(context?.registerBody)
    return (
      <div
        ref={ref}
        id={id ?? context?.bodyId}
        className={cx(`${block}__body`, className)}
        {...rest}
      />
    )
  })

  const Title = forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
    { as: Tag = 'h2', className, id, ...rest },
    ref,
  ) {
    const context = useContext(DialogContext)
    useRegistration(context?.registerTitle)
    return (
      <Tag
        ref={ref}
        id={id ?? context?.titleId}
        className={cx(`${block}__title`, className)}
        {...rest}
      />
    )
  })

  const Footer = forwardRef<HTMLDivElement, DialogSlotProps>(function DialogFooter(
    { className, ...rest },
    ref,
  ) {
    return <div ref={ref} className={cx(`${block}__footer`, className)} {...rest} />
  })

  const CloseButton = forwardRef<HTMLButtonElement, DialogCloseButtonProps>(
    function DialogCloseButton({ className, children, onClick, ...rest }, ref) {
      const context = useContext(DialogContext)
      return (
        <button
          ref={ref}
          type="button"
          className={cx(`${block}__close`, className)}
          aria-label="Close"
          onClick={(event) => {
            onClick?.(event)
            if (!event.defaultPrevented) context?.close()
          }}
          {...rest}
        >
          {children ?? (
            <svg
              className={`${block}__close-icon`}
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          )}
        </button>
      )
    },
  )

  return { Header, Body, Footer, Title, CloseButton }
}
