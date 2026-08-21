'use client'

import { forwardRef, type HTMLAttributes, useEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'

export type CountdownUnit = 'days' | 'hours' | 'minutes' | 'seconds'

/** Largest to smallest. `format` is filtered through this, so order is never the caller's problem. */
const ORDER: readonly CountdownUnit[] = ['days', 'hours', 'minutes', 'seconds']

const UNIT_MS: Record<CountdownUnit, number> = {
  days: 86_400_000,
  hours: 3_600_000,
  minutes: 60_000,
  seconds: 1_000,
}

/** `[singular, plural]`, because "1 days remaining" is the kind of detail people notice. */
const UNIT_WORDS: Record<CountdownUnit, readonly [string, string]> = {
  days: ['day', 'days'],
  hours: ['hour', 'hours'],
  minutes: ['minute', 'minutes'],
  seconds: ['second', 'seconds'],
}

/**
 * Epoch milliseconds from anything date-ish, or `NaN`.
 *
 * Deliberately local to this file (and duplicated, at five lines, in `Clock` and
 * `RelativeTime`): this brief may not add to `src/utils/`, and a shared helper reaching
 * across sibling component folders would be worse coupling than the repetition.
 */
function toEpoch(input: Date | string | number): number {
  if (input instanceof Date) return input.getTime()
  if (typeof input === 'number') return input
  return new Date(input).getTime()
}

interface Part {
  unit: CountdownUnit
  value: number
}

/**
 * Split a duration across the requested units. The largest unit absorbs everything above
 * it, so `format={['hours', 'minutes']}` on a three-day countdown says "72 hours", not
 * "0 hours".
 */
function split(remaining: number, units: readonly CountdownUnit[]): Part[] {
  let left = Math.max(0, remaining)
  return units.map((unit) => {
    const value = Math.floor(left / UNIT_MS[unit])
    left -= value * UNIT_MS[unit]
    return { unit, value }
  })
}

/** Drop leading zero units, never the last one — "0d 0h 0m 12s" becomes "12s". */
function trimLeadingZeros(parts: Part[]): Part[] {
  let first = 0
  while (first < parts.length - 1 && parts[first]?.value === 0) first += 1
  return parts.slice(first)
}

export interface CountdownProps extends HTMLAttributes<HTMLDivElement> {
  /** The moment being counted down to. */
  to: Date | string | number
  /** Which units to show. Order is normalised largest-first. Defaults to all four. */
  format?: readonly CountdownUnit[]
  /** Fired once, when the countdown reaches zero. */
  onComplete?: () => void
  /** Show the word under each number. Defaults to `true`. */
  showLabels?: boolean
  /** Drop leading units that are still zero. */
  hideZeroUnits?: boolean
  /**
   * The clock for the FIRST render, on both sides of hydration.
   *
   * Pass a server timestamp and the server HTML contains real numbers that the client
   * reproduces exactly. Omit it and the first render is a `--` placeholder instead: the
   * component refuses to read the clock during render, because a server that renders at
   * 12:00:03 and a browser that hydrates at 12:00:05 would produce different HTML and
   * React would discard it with a hydration error.
   */
  now?: Date | string | number
  /** Override the visible unit words, e.g. for another language. */
  labels?: Partial<Record<CountdownUnit, string>>
  /** Accessible name of the timer. Defaults to `'Time remaining'`. */
  label?: string
  /** Announced instead of the digits once the countdown finishes. */
  completeLabel?: string
}

/**
 * A countdown to a fixed moment.
 *
 * `role="timer"` carries an implicit `aria-live="off"`, which is exactly right: the digits
 * are there to be read on demand, not narrated once a second. The numbers themselves are
 * `aria-hidden` and a single visually hidden sentence ("3 days, 4 hours, 12 minutes
 * remaining") carries the meaning, because "3 04 12 08" is not a sentence.
 *
 * Hydration-safe by construction — see the `now` prop.
 */
export const Countdown = forwardRef<HTMLDivElement, CountdownProps>(function Countdown(
  {
    to,
    format,
    onComplete,
    showLabels = true,
    hideZeroUnits,
    now,
    labels,
    label = 'Time remaining',
    completeLabel = 'Countdown complete',
    className,
    ...rest
  },
  ref,
) {
  const target = toEpoch(to)
  // `null` means "no clock yet": the first render on the server and in the browser.
  const [nowMs, setNowMs] = useState<number | null>(now === undefined ? null : toEpoch(now))

  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!Number.isFinite(target)) return
    // A new target re-arms the completion callback.
    completedRef.current = false

    let timer = 0
    const tick = () => {
      const current = Date.now()
      setNowMs(current)
      if (current >= target) {
        if (!completedRef.current) {
          completedRef.current = true
          onCompleteRef.current?.()
        }
        return
      }
      // Re-aim at the next whole second instead of drifting by a few milliseconds a tick.
      timer = window.setTimeout(tick, 1000 - (current % 1000))
    }

    tick()
    return () => window.clearTimeout(timer)
  }, [target])

  const units = ORDER.filter((unit) => format === undefined || format.includes(unit))
  const active = units.length > 0 ? units : ORDER
  const pending = nowMs === null || !Number.isFinite(target)
  const remaining = pending ? 0 : Math.max(0, target - (nowMs ?? 0))
  const complete = !pending && remaining === 0

  const parts = split(remaining, active)
  const shown = hideZeroUnits && !pending ? trimLeadingZeros(parts) : parts

  const sentence = complete
    ? completeLabel
    : shown
        .map(({ unit, value }) => {
          const words = UNIT_WORDS[unit]
          return `${value} ${value === 1 ? words[0] : words[1]}`
        })
        .join(', ')

  return (
    <div
      ref={ref}
      className={cx('vk-countdown', className)}
      role="timer"
      aria-label={label}
      data-labels={showLabels ? 'true' : 'false'}
      data-pending={pending || undefined}
      data-complete={complete || undefined}
      {...rest}
    >
      {shown.map(({ unit, value }, position) => (
        <div className="vk-countdown__unit" data-unit={unit} key={unit}>
          <span className="vk-countdown__value" aria-hidden="true">
            {pending ? '--' : position === 0 ? String(value) : String(value).padStart(2, '0')}
          </span>
          {showLabels ? (
            <span className="vk-countdown__label" aria-hidden="true">
              {labels?.[unit] ?? UNIT_WORDS[unit][1]}
            </span>
          ) : null}
        </div>
      ))}
      {pending ? null : <span className="vk-countdown__sr">{sentence}</span>}
    </div>
  )
})
