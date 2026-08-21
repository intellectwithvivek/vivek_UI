'use client'

import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
import { Portal } from '../portal'
import { Toast } from './toast'
import { type ToastApi, ToastContext, type ToastOptions, type ToastRecord } from './toast-context'

/** Logical corners, so `-start`/`-end` follow the writing direction and RTL just works. */
export type ToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'

export interface ToastProviderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /** Where the stack sits. Default `'bottom-end'`. */
  position?: ToastPosition
  /**
   * Default milliseconds on screen, overridable per toast. `Infinity` or `null` makes
   * every toast sticky by default. Default `5000`.
   */
  duration?: number | null
  /** How many toasts are visible at once. The rest queue. Default `3`. */
  max?: number
  /** Space between toasts. A number is treated as pixels. Default `--vk-space-3`. */
  gap?: number | string
  /** Accessible name for every dismiss button. Default `'Dismiss'`. */
  dismissLabel?: string
}

/** Why a toast's timer is currently held. A Set of these makes holding idempotent. */
type PauseReason = 'pointer' | 'focus'

interface ToastTimer {
  /** Milliseconds still owed. Recomputed every time the timer is paused. */
  remaining: number
  /** Wall-clock deadline while running; meaningless while paused. */
  expiresAt: number
  handle: ReturnType<typeof setTimeout> | null
  holds: Set<PauseReason>
}

/**
 * `undefined` means "inherit the provider default"; `null`, `Infinity` and `NaN` all
 * mean "never auto-dismiss". Returning `null` for those is what keeps the sticky case
 * from becoming `setTimeout(fn, Infinity)`, whose delay is coerced to a 32-bit int and
 * can fire immediately.
 */
function resolveDuration(value: number | null | undefined, fallback: number | null): number | null {
  const raw = value === undefined ? fallback : value
  if (raw === null || !Number.isFinite(raw)) return null
  return Math.max(0, raw)
}

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

/** Tones that wait for a pause in speech rather than interrupting. */
const POLITE_TONES = new Set(['info', 'success'])

/**
 * Owns the toast queue and the two live regions it renders into.
 *
 * **The live regions are mounted with the provider, empty.** A live region created in
 * the same commit as its first child is a region the screen reader has not observed
 * yet, so that first announcement is dropped — the single most commonly missed bug in
 * hand-rolled toast systems. Both regions here are unconditional JSX, present from the
 * provider's first commit, and toasts are appended into them afterwards.
 *
 * There are two because politeness cannot be decided per child: `info` and `success` go
 * into `role="status"` / `aria-live="polite"`, `warning` and `danger` into `role="alert"`
 * / `aria-live="assertive"` — exactly the split `Alert` makes, for the same reason (do
 * not talk over the user for a message that is not urgent). The cost is that urgent
 * toasts group together instead of interleaving strictly by arrival; CSS `order` keeps
 * that group nearest the anchored screen edge.
 *
 * Neither region takes focus or traps it: no `tabindex`, and nothing here ever calls
 * `focus()`. A toast that steals focus interrupts whatever the user was typing, and one
 * that traps it strands keyboard users inside a thing that is about to disappear.
 */
export const ToastProvider = forwardRef<HTMLDivElement, ToastProviderProps>(function ToastProvider(
  {
    children,
    position = 'bottom-end',
    duration = 5000,
    max = 3,
    gap,
    dismissLabel = 'Dismiss',
    className,
    style,
    ...rest
  },
  ref,
) {
  const [entries, setEntries] = useState<readonly ToastRecord[]>([])
  const timersRef = useRef<Map<string, ToastTimer>>(new Map())
  const counterRef = useRef(0)
  // Namespaces generated ids per provider instance, and does it isomorphically —
  // `Math.random()` here would break hydration.
  const scope = useIsomorphicId()

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (!timer) return
    if (timer.handle !== null) clearTimeout(timer.handle)
    timersRef.current.delete(id)
  }, [])

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id)
      // Returning `prev` untouched when nothing matches is what makes dismissing an
      // unknown or already-gone id both throw-free and render-free.
      setEntries((prev) =>
        prev.some((entry) => entry.id === id) ? prev.filter((entry) => entry.id !== id) : prev,
      )
    },
    [clearTimer],
  )

  const dismissAll = useCallback(() => {
    for (const timer of timersRef.current.values()) {
      if (timer.handle !== null) clearTimeout(timer.handle)
    }
    timersRef.current.clear()
    setEntries((prev) => (prev.length === 0 ? prev : []))
  }, [])

  const startTimer = useCallback(
    (id: string, ms: number) => {
      const timer = timersRef.current.get(id)
      if (!timer) return
      timer.remaining = ms
      timer.expiresAt = Date.now() + ms
      timer.handle = setTimeout(() => {
        // Drop the entry before dismissing: the timeout has already fired, so there is
        // nothing left to clear, and this keeps dead handles out of the map.
        timersRef.current.delete(id)
        dismiss(id)
      }, ms)
    },
    [dismiss],
  )

  /** Pause. Hovered *and* focused holds it twice, so leaving one does not resume. */
  const hold = useCallback((id: string, reason: PauseReason) => {
    const timer = timersRef.current.get(id)
    if (!timer) return
    timer.holds.add(reason)
    if (timer.handle === null) return
    clearTimeout(timer.handle)
    timer.handle = null
    timer.remaining = Math.max(0, timer.expiresAt - Date.now())
  }, [])

  /** Resume once the last hold is released — from what was left, never from full. */
  const release = useCallback(
    (id: string, reason: PauseReason) => {
      const timer = timersRef.current.get(id)
      if (!timer) return
      if (!timer.holds.delete(reason)) return
      if (timer.holds.size > 0 || timer.handle !== null) return
      startTimer(id, timer.remaining)
    },
    [startTimer],
  )

  const toast = useCallback(
    (options: ToastOptions) => {
      let id = options.id
      if (id === undefined) {
        counterRef.current += 1
        id = `${scope}toast-${counterRef.current}`
      }
      const record: ToastRecord = { ...options, id, tone: options.tone ?? 'info' }
      // Re-toasting a live id replaces it and restarts its clock; dropping the timer
      // here lets the reconciling effect below rebuild it from the new duration.
      clearTimer(id)
      setEntries((prev) => {
        const index = prev.findIndex((entry) => entry.id === id)
        if (index === -1) return [...prev, record]
        const next = prev.slice()
        next[index] = record
        return next
      })
      return id
    },
    [clearTimer, scope],
  )

  const update = useCallback(
    (id: string, patch: Omit<ToastOptions, 'id'>) => {
      // Content-only patches leave the countdown alone: a toast whose text is being
      // rewritten (upload progress, say) must not win a fresh lease on every tick.
      // Passing `duration` is the explicit way to ask for a restart.
      if (Object.hasOwn(patch, 'duration')) clearTimer(id)
      setEntries((prev) => {
        const index = prev.findIndex((entry) => entry.id === id)
        if (index === -1) return prev
        const current = prev[index]
        if (!current) return prev
        const next = prev.slice()
        next[index] = { ...current, ...patch, id, tone: patch.tone ?? current.tone }
        return next
      })
    },
    [clearTimer],
  )

  const visible = useMemo(() => entries.slice(0, Math.max(0, max)), [entries, max])

  // One effect reconciles timers against what is actually on screen. Two consequences
  // that matter: a queued toast owns no timer at all, so its `duration` starts when it
  // becomes visible instead of draining while it waits, and an existing timer is left
  // strictly alone — which is how a paused toast survives neighbours coming and going.
  useEffect(() => {
    const timers = timersRef.current
    const onScreen = new Set(visible.map((entry) => entry.id))
    for (const [id, timer] of timers) {
      if (onScreen.has(id)) continue
      if (timer.handle !== null) clearTimeout(timer.handle)
      timers.delete(id)
    }
    for (const entry of visible) {
      if (timers.has(entry.id)) continue
      const ms = resolveDuration(entry.duration, duration)
      if (ms === null) continue
      timers.set(entry.id, { remaining: ms, expiresAt: 0, handle: null, holds: new Set() })
      startTimer(entry.id, ms)
    }
  }, [visible, duration, startTimer])

  // Unmount: every pending handle goes. This is the whole defence against
  // setState-after-unmount — no timer survives to call `dismiss`, so no guard flag is
  // needed, and none is used (a `mounted` ref that is never reset breaks under the
  // StrictMode remount).
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const timer of timers.values()) {
        if (timer.handle !== null) clearTimeout(timer.handle)
      }
      timers.clear()
    }
  }, [])

  const api = useMemo<ToastApi>(
    () => ({ toast, dismiss, dismissAll, update }),
    [toast, dismiss, dismissAll, update],
  )

  const viewportStyle = useMemo<CSSProperties | undefined>(() => {
    if (gap === undefined) return style
    // Caller `style` last: an explicit inline value still wins over the gap prop.
    return { ...({ '--vk-toast-gap': toCssSize(gap) } as CSSProperties), ...style }
  }, [gap, style])

  const renderRegion = (live: 'polite' | 'assertive') => (
    <div
      className="vk-toast-region"
      data-live={live}
      role={live === 'assertive' ? 'alert' : 'status'}
      aria-live={live}
      // Read the whole toast, not just the word inside it that changed.
      aria-atomic="true"
    >
      {visible
        .filter((entry) => POLITE_TONES.has(entry.tone) === (live === 'polite'))
        .map((entry) => (
          <Toast
            key={entry.id}
            tone={entry.tone}
            title={entry.title}
            description={entry.description}
            action={entry.action}
            dismissible={entry.dismissible}
            dismissLabel={dismissLabel}
            onDismiss={() => dismiss(entry.id)}
            // Pointer and mouse map to the same hold and a Set makes the overlap
            // harmless, so environments that emit only one of the pairs still pause.
            onPointerEnter={() => hold(entry.id, 'pointer')}
            onPointerLeave={() => release(entry.id, 'pointer')}
            onMouseEnter={() => hold(entry.id, 'pointer')}
            onMouseLeave={() => release(entry.id, 'pointer')}
            // React's onFocus/onBlur are focusin/focusout, so they fire for the action
            // and dismiss buttons too: tabbing into a toast stops its clock.
            onFocus={() => hold(entry.id, 'focus')}
            onBlur={() => release(entry.id, 'focus')}
          />
        ))}
    </div>
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Portal>
        <div
          ref={ref}
          className={cx('vk-toast-viewport', className)}
          data-position={position}
          style={viewportStyle}
          {...rest}
        >
          {renderRegion('polite')}
          {renderRegion('assertive')}
        </div>
      </Portal>
    </ToastContext.Provider>
  )
})
