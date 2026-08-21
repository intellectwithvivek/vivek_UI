'use client'

import { forwardRef, type TimeHTMLAttributes, useEffect, useMemo, useState } from 'react'
import { cx } from '../../utils/cx'

/**
 * Epoch milliseconds from anything date-ish, or `NaN`.
 *
 * Deliberately local to this file (and duplicated, at five lines, in `Countdown` and
 * `RelativeTime`): this brief may not add to `src/utils/`, and a shared helper reaching
 * across sibling component folders would be worse coupling than the repetition.
 */
function toEpoch(input: Date | string | number): number {
  if (input instanceof Date) return input.getTime()
  if (typeof input === 'number') return input
  return new Date(input).getTime()
}

export interface ClockProps extends Omit<TimeHTMLAttributes<HTMLTimeElement>, 'dateTime'> {
  /** IANA zone, e.g. `'Asia/Kolkata'`. Defaults to the runtime's zone. */
  timeZone?: string
  /** `Intl.DateTimeFormat` options. Anything set here wins over the shortcuts below. */
  format?: Intl.DateTimeFormatOptions
  /** Defaults to `true`. Also decides whether the clock ticks every second or every minute. */
  showSeconds?: boolean
  /** Force a 12- or 24-hour clock. Omit to follow the locale. */
  hour12?: boolean
  locale?: string | string[]
  /**
   * The clock for the FIRST render, on both sides of hydration.
   *
   * Pass a server timestamp and the server HTML contains a real time that the client
   * reproduces exactly. Omit it and the first render is `placeholder` instead: the
   * component refuses to read the clock during render, because the server renders at one
   * instant and the browser hydrates at another, and React would discard the mismatch.
   *
   * Note that `timeZone` and `locale` are part of that determinism — Node and the browser
   * do not necessarily default to the same ones.
   */
  now?: Date | string | number
  /** Shown until the first tick. Defaults to `--:--:--` (or `--:--` without seconds). */
  placeholder?: string
}

/**
 * The current time, ticking, via `Intl.DateTimeFormat` — no date library.
 *
 * A `<time>` element, so the machine-readable instant travels with the text. The tick
 * re-aims at the next whole second (or minute) each time rather than firing on a fixed
 * interval, so it does not drift and does not fire twice in the same second.
 *
 * Not a live region: a clock that announced itself every second would make a page
 * unusable with a screen reader.
 */
export const Clock = forwardRef<HTMLTimeElement, ClockProps>(function Clock(
  { timeZone, format, showSeconds = true, hour12, locale, now, placeholder, className, ...rest },
  ref,
) {
  // `null` means "no clock yet": the first render on the server and in the browser.
  const [nowMs, setNowMs] = useState<number | null>(now === undefined ? null : toEpoch(now))

  // An explicit `second` in `format` overrides the shortcut, including for the tick rate.
  const withSeconds = format?.second !== undefined ? true : showSeconds

  const options = useMemo<Intl.DateTimeFormatOptions>(
    () => ({
      hour: 'numeric',
      minute: '2-digit',
      ...(showSeconds ? { second: '2-digit' } : null),
      ...(hour12 === undefined ? null : { hour12 }),
      ...(timeZone === undefined ? null : { timeZone }),
      ...format,
    }),
    [format, hour12, showSeconds, timeZone],
  )

  const formatter = useMemo(() => new Intl.DateTimeFormat(locale, options), [locale, options])

  useEffect(() => {
    const period = withSeconds ? 1000 : 60_000
    let timer = 0
    const tick = () => {
      const current = Date.now()
      setNowMs(current)
      // Re-aim at the next boundary instead of drifting a few milliseconds per tick.
      timer = window.setTimeout(tick, period - (current % period))
    }
    tick()
    return () => window.clearTimeout(timer)
  }, [withSeconds])

  const fallback = placeholder ?? (withSeconds ? '--:--:--' : '--:--')
  // A single nullable value, so the three reads below narrow off one check.
  const instant = nowMs !== null && Number.isFinite(nowMs) ? nowMs : null

  return (
    <time
      ref={ref}
      className={cx('vk-clock', className)}
      dateTime={instant === null ? undefined : new Date(instant).toISOString()}
      data-pending={instant === null ? 'true' : undefined}
      {...rest}
    >
      {instant === null ? fallback : formatter.format(instant)}
    </time>
  )
})
