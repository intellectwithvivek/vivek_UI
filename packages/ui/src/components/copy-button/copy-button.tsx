'use client'

import {
  type ButtonHTMLAttributes,
  forwardRef,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { cx } from '../../utils/cx'
import { Button, type ButtonProps } from '../button'

export type CopyState = 'idle' | 'copied' | 'error'

/**
 * The legacy path: a throwaway textarea plus `document.execCommand('copy')`.
 *
 * Deprecated, and still necessary — `navigator.clipboard` does not exist outside a secure
 * context, which includes every plain-HTTP staging box and older in-app webviews. The
 * previous selection is captured and restored, because silently eating the user's
 * selection is a real bug people hit with this trick.
 */
function legacyCopy(value: string): boolean {
  if (typeof document === 'undefined') return false
  if (typeof document.execCommand !== 'function') return false

  const area = document.createElement('textarea')
  area.value = value
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.top = '0'
  area.style.opacity = '0'
  area.style.pointerEvents = 'none'
  document.body.appendChild(area)

  const selection = document.getSelection()
  const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null

  let copied = false
  try {
    area.select()
    copied = document.execCommand('copy')
  } catch {
    copied = false
  } finally {
    area.remove()
    if (previous && selection) {
      selection.removeAllRanges()
      selection.addRange(previous)
    }
  }
  return copied
}

async function writeClipboard(value: string): Promise<boolean> {
  try {
    const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard
    if (clipboard && typeof clipboard.writeText === 'function') {
      await clipboard.writeText(value)
      return true
    }
  } catch {
    // Permission denied, no secure context, a browser that rejects a write outside a
    // user gesture: all recoverable, all worth the legacy attempt below.
  }
  return legacyCopy(value)
}

/**
 * `onCopy` is omitted from the DOM attributes deliberately: React's native `onCopy` is the
 * clipboard *event* (fired when the user copies text out of the element), which is not what
 * anyone reaching for `onCopy` on a copy button means. The useful callback wins the name;
 * the native event is still reachable through a ref if anyone ever needs it.
 */
export interface CopyButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'children' | 'onCopy'> {
  /** The text put on the clipboard. */
  value: string
  /** Resting label. Defaults to `'Copy'`. */
  label?: ReactNode
  /** Label while the transient state lasts. Defaults to `'Copied'`. */
  copiedLabel?: ReactNode
  /** Label when the copy could not happen. Defaults to `'Copy failed'`. */
  errorLabel?: ReactNode
  /** Milliseconds before returning to the resting label. Defaults to `2000`. */
  timeout?: number
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  onCopy?: (value: string) => void
  onCopyError?: () => void
  /** Announced on success. Defaults to `copiedLabel` when it is a string, else `'Copied'`. */
  copiedAnnouncement?: string
  /** Announced on failure. Defaults to `errorLabel` when it is a string, else `'Copy failed'`. */
  errorAnnouncement?: string
}

function announcement(label: ReactNode, override: string | undefined, fallback: string): string {
  if (override !== undefined) return override
  return typeof label === 'string' ? label : fallback
}

/**
 * Copy to clipboard, with a transient confirmation.
 *
 * Three things make this more than an `onClick`:
 *
 * 1. **It degrades.** `navigator.clipboard` is missing outside a secure context, so there
 *    is a legacy `execCommand` fallback, and a genuine failure surfaces as a visible
 *    error state instead of a button that silently does nothing.
 * 2. **It announces.** "Copied" appearing on screen is invisible to a screen reader user,
 *    so a polite live region says it. It sits OUTSIDE the button on purpose: text inside
 *    the button would join its accessible name and be read as part of it.
 * 3. **It resets.** The confirmation clears after `timeout`, and the timer is cancelled on
 *    unmount rather than firing into a dead component.
 *
 * Contract note: the root is a `span` wrapping the button and the live region, so
 * `className`/`style` land on that wrapper while `...rest` and the forwarded ref go to the
 * `button` itself — which is what a caller reaching for a ref here actually wants.
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  {
    value,
    label = 'Copy',
    copiedLabel = 'Copied',
    errorLabel = 'Copy failed',
    timeout = 2000,
    variant,
    size,
    onCopy,
    onCopyError,
    copiedAnnouncement,
    errorAnnouncement,
    className,
    style,
    onClick,
    ...rest
  },
  ref,
) {
  const [state, setState] = useState<CopyState>('idle')
  const timerRef = useRef(0)
  const aliveRef = useRef(true)

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
      window.clearTimeout(timerRef.current)
    }
  }, [])

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (event.defaultPrevented) return

      // Fire and forget: the click handler must not be async, or React's event pooling
      // and the caller's `onClick` contract both get awkward.
      void writeClipboard(value).then((copied) => {
        // The user may have navigated away during the clipboard round-trip.
        if (!aliveRef.current) return
        setState(copied ? 'copied' : 'error')
        if (copied) onCopy?.(value)
        else onCopyError?.()
        window.clearTimeout(timerRef.current)
        timerRef.current = window.setTimeout(
          () => {
            if (aliveRef.current) setState('idle')
          },
          Math.max(0, timeout),
        )
      })
    },
    [onClick, onCopy, onCopyError, timeout, value],
  )

  const visible = state === 'copied' ? copiedLabel : state === 'error' ? errorLabel : label
  const live =
    state === 'copied'
      ? announcement(copiedLabel, copiedAnnouncement, 'Copied')
      : state === 'error'
        ? announcement(errorLabel, errorAnnouncement, 'Copy failed')
        : ''

  return (
    <span className={cx('vk-copy-button', className)} style={style} data-state={state}>
      <Button
        ref={ref}
        className="vk-copy-button__button"
        variant={variant}
        size={size}
        onClick={handleClick}
        {...rest}
      >
        {visible}
      </Button>
      {/* Polite, so it waits its turn rather than cutting across what is being read. */}
      <span className="vk-copy-button__status" role="status" aria-live="polite">
        {live}
      </span>
    </span>
  )
})
