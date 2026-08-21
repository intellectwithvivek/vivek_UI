'use client'

import {
  type ForwardedRef,
  forwardRef,
  type HTMLAttributes,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { cx } from '../../utils/cx'

/**
 * `Intl.NumberFormat` options, or your own formatter.
 *
 * A function receives the in-flight number on every frame, so keep it cheap — no
 * `new Intl.NumberFormat` inside it.
 */
export type CounterFormat = Intl.NumberFormatOptions | ((value: number) => string)

/**
 * `useLayoutEffect` on the client, `useEffect` on the server.
 *
 * The count has to be parked at its starting number BEFORE the browser paints, or the
 * final value flashes on screen first. `typeof window` is a guard, not an access: it
 * cannot throw in Node, which is what keeps this module server-safe.
 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** Decelerating, so the number lands rather than stops dead. */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

function roundTo(value: number, decimals: number): number {
  if (decimals <= 0) return Math.round(value)
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export interface AnimatedCounterProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The number to land on. Defaults to `0`. */
  value?: number
  /** The number to count from. Defaults to `0`. */
  from?: number
  /** Milliseconds. Defaults to `1600`. `0` disables the animation entirely. */
  duration?: number
  /** `Intl.NumberFormat` options, or a function. */
  format?: CounterFormat
  /**
   * Locale for `Intl.NumberFormat`. Pass it if the page is server-rendered: the runtime
   * default differs between Node and the browser, and that difference IS a hydration
   * mismatch, because the final value is what both sides render.
   */
  locale?: string | string[]
  prefix?: string
  suffix?: string
  /** Wait until the counter is scrolled into view. Defaults to `true`. */
  startOnView?: boolean
}

/**
 * A number that counts up to its value the first time it is scrolled into view.
 *
 * Two rules shape the whole implementation:
 *
 * 1. **The final value is what renders.** Server HTML, the first client render, a browser
 *    with no `IntersectionObserver`, no `requestAnimationFrame`, or JavaScript that never
 *    arrives — all of them show the real number. It is never `0`-then-hopefully-more, so
 *    the component degrades to a plain, correct figure, and hydration cannot mismatch.
 * 2. **The animation is never announced.** The moving number is `aria-hidden`; a second,
 *    visually hidden copy carries the final value for assistive technology. Without that
 *    split, a live-region-adjacent screen reader can read sixty intermediate numbers, and
 *    even without one the accessible name would change on every frame.
 *
 * Under `prefers-reduced-motion` the count does not run at all — the number is simply
 * there. Static, not slower.
 */
export const AnimatedCounter = forwardRef<HTMLSpanElement, AnimatedCounterProps>(
  function AnimatedCounter(
    {
      value = 0,
      from = 0,
      duration = 1600,
      format,
      locale,
      prefix,
      suffix,
      startOnView = true,
      className,
      ...rest
    },
    ref: ForwardedRef<HTMLSpanElement>,
  ) {
    // Starts AT the target: see rule 1 above.
    const [display, setDisplay] = useState(value)
    const nodeRef = useRef<HTMLSpanElement | null>(null)

    const setNode = useCallback(
      (node: HTMLSpanElement | null) => {
        nodeRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const formatter = useMemo(() => {
      if (typeof format === 'function') return format
      const options = format
      // One `Intl.NumberFormat` for the whole animation, not one per frame.
      const intl = new Intl.NumberFormat(locale, options)
      return (input: number) => intl.format(input)
    }, [format, locale])

    /**
     * How precisely to round the in-flight number. Without this, `Intl` happily renders
     * `1,203.4718` on the way to `2,000`.
     */
    const decimals =
      typeof format === 'object' && format !== null ? (format.maximumFractionDigits ?? 0) : 0

    useIsomorphicLayoutEffect(() => {
      if (!Number.isFinite(duration) || duration <= 0) return
      if (!Number.isFinite(value) || !Number.isFinite(from)) return
      if (value === from) return
      if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function')
        return
      // Read at effect time rather than as state: state would mean animating first and
      // stopping a frame later, which is exactly the motion the user opted out of.
      if (typeof window.matchMedia === 'function') {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      }

      let frame = 0
      let startedAt: number | undefined

      const run = () => {
        setDisplay(from)
        const tick = (now: number) => {
          if (startedAt === undefined) startedAt = now
          const progress = Math.min(1, (now - startedAt) / duration)
          if (progress >= 1) {
            setDisplay(value)
            return
          }
          setDisplay(from + (value - from) * easeOutCubic(progress))
          frame = window.requestAnimationFrame(tick)
        }
        frame = window.requestAnimationFrame(tick)
      }

      const node = nodeRef.current
      if (!startOnView || !node || typeof IntersectionObserver !== 'function') {
        run()
        return () => window.cancelAnimationFrame(frame)
      }

      // Park at the start, then wait for the scroll.
      setDisplay(from)
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            observer.disconnect()
            run()
            return
          }
        },
        { threshold: 0.25 },
      )
      observer.observe(node)

      return () => {
        observer.disconnect()
        window.cancelAnimationFrame(frame)
      }
    }, [value, from, duration, startOnView])

    const moving = `${prefix ?? ''}${formatter(roundTo(display, decimals))}${suffix ?? ''}`
    const settled = `${prefix ?? ''}${formatter(value)}${suffix ?? ''}`

    return (
      <span ref={setNode} className={cx('vk-animated-counter', className)} {...rest}>
        <span className="vk-animated-counter__value" aria-hidden="true">
          {moving}
        </span>
        <span className="vk-animated-counter__sr">{settled}</span>
      </span>
    )
  },
)
