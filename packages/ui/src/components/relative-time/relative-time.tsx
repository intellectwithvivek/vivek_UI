'use client'

import { forwardRef, type TimeHTMLAttributes, useEffect, useMemo, useState } from 'react'
import { cx } from '../../utils/cx'

/**
 * Epoch milliseconds from anything date-ish, or `NaN`.
 *
 * Deliberately local to this file (and duplicated, at five lines, in `Countdown` and
 * `Clock`): this brief may not add to `src/utils/`, and a shared helper reaching across
 * sibling component folders would be worse coupling than the repetition.
 */
function toEpoch(input: Date | string | number): number {
  if (input instanceof Date) return input.getTime()
  if (typeof input === 'number') return input
  return new Date(input).getTime()
}

/**
 * Largest unit first. Months and years are the average Gregorian lengths — `Intl` is
 * doing the wording, not the calendar arithmetic, and "about 2 months ago" does not need
 * to know how long February was.
 */
const UNITS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ['year', 31_557_600_000],
  ['month', 2_629_800_000],
  ['week', 604_800_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
  ['second', 1_000],
]

/** Coarser as the gap widens: a five-year-old date does not need a tick every second. */
function adaptiveInterval(distance: number): number {
  if (distance < 60_000) return 1_000
  if (distance < 3_600_000) return 60_000
  return 3_600_000
}

export interface RelativeTimeProps
  extends Omit<TimeHTMLAttributes<HTMLTimeElement>, 'dateTime' | 'children'> {
  /** The moment being described. */
  date: Date | string | number
  locale?: string | string[]
  /** `'auto'` (default) allows "yesterday"; `'always'` forces "1 day ago". */
  numeric?: 'always' | 'auto'
  /**
   * Milliseconds between recomputes. Omit for an adaptive rate (1s under a minute, 1min
   * under an hour, 1h beyond). `0` computes once and never updates.
   */
  updateInterval?: number
  /**
   * The clock for the FIRST render, on both sides of hydration.
   *
   * Omit it and the first render shows the ABSOLUTE time instead — which depends only on
   * `date`, so the server and the browser agree — and the relative phrasing takes over on
   * mount. That is the graceful degradation too: with JavaScript disabled the reader still
   * gets a real timestamp rather than an empty element.
   */
  now?: Date | string | number
  /** Zone for the absolute rendering. Defaults to the runtime's zone. */
  timeZone?: string
  /** `Intl.DateTimeFormat` options for the absolute value. Defaults to medium date, short time. */
  titleFormat?: Intl.DateTimeFormatOptions
}

/**
 * "3 minutes ago", via `Intl.RelativeTimeFormat` — no date library.
 *
 * Always a `<time datetime>` element carrying the exact instant, and always with the
 * absolute time in `title`, so the precise value is never lost to the approximation.
 * (`title` is a mouse-only affordance; the machine-readable `datetime` attribute is the
 * one assistive technology and crawlers rely on, which is why both are present.)
 */
export const RelativeTime = forwardRef<HTMLTimeElement, RelativeTimeProps>(function RelativeTime(
  {
    date,
    locale,
    numeric = 'auto',
    updateInterval,
    now,
    timeZone,
    titleFormat,
    className,
    title,
    ...rest
  },
  ref,
) {
  const dateMs = toEpoch(date)
  // `null` means "no clock yet": the first render on the server and in the browser.
  const [nowMs, setNowMs] = useState<number | null>(now === undefined ? null : toEpoch(now))

  const relativeFormatter = useMemo(
    () => new Intl.RelativeTimeFormat(locale, { numeric }),
    [locale, numeric],
  )

  const absoluteFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...(timeZone === undefined ? null : { timeZone }),
        ...titleFormat,
      }),
    [locale, timeZone, titleFormat],
  )

  useEffect(() => {
    if (!Number.isFinite(dateMs)) return
    if (updateInterval === 0) {
      setNowMs(Date.now())
      return
    }

    let timer = 0
    const tick = () => {
      const current = Date.now()
      setNowMs(current)
      const period = updateInterval ?? adaptiveInterval(Math.abs(dateMs - current))
      timer = window.setTimeout(tick, Math.max(250, period))
    }
    tick()
    return () => window.clearTimeout(timer)
  }, [dateMs, updateInterval])

  if (!Number.isFinite(dateMs)) {
    return <time ref={ref} className={cx('vk-relative-time', className)} {...rest} />
  }

  const absolute = absoluteFormatter.format(dateMs)
  let text = absolute

  if (nowMs !== null) {
    const difference = dateMs - nowMs
    const distance = Math.abs(difference)
    // The coarsest unit that the gap actually fills; anything smaller reads as seconds.
    const chosen = UNITS.find(([, size]) => distance >= size) ?? UNITS[UNITS.length - 1]
    if (chosen) text = relativeFormatter.format(Math.round(difference / chosen[1]), chosen[0])
  }

  return (
    <time
      ref={ref}
      className={cx('vk-relative-time', className)}
      dateTime={new Date(dateMs).toISOString()}
      title={title ?? absolute}
      data-pending={nowMs === null ? 'true' : undefined}
      {...rest}
    >
      {text}
    </time>
  )
})
