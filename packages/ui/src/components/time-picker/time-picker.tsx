'use client'

import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'

export interface TimePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'> {
  /**
   * Controlled value, always in 24-hour form: `'HH:mm'`, or `'HH:mm:ss'` with `withSeconds`.
   * `null` while any required segment is empty. The 12-hour display never leaks into the
   * value — `hourCycle` is presentation, the canonical string is the data.
   */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  /** Add a seconds segment. Default `false`. */
  withSeconds?: boolean
  /**
   * `24` (default) or `12` with an AM/PM segment. Deterministic on purpose: `Intl` would
   * pick per machine, and a field that shows 24-hour to the server and 12-hour to the
   * browser is a hydration mismatch waiting to happen. Choose it for your audience.
   */
  hourCycle?: 12 | 24
  /** Inclusive bounds in the same canonical form. A committed value is clamped into them. */
  min?: string
  max?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  required?: boolean
  /** One hidden field carrying the canonical value, so a form never sees the segments. */
  name?: string
}

type Segment = 'hours' | 'minutes' | 'seconds' | 'period'

interface Parts {
  hours: number | null
  minutes: number | null
  seconds: number | null
}

const pad = (n: number) => String(n).padStart(2, '0')

/** `'HH:mm[:ss]'` -> parts, or all-null for anything unparseable. Never throws. */
function parse(value: string | null | undefined): Parts {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value ?? '')
  if (!match) return { hours: null, minutes: null, seconds: null }
  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = match[3] === undefined ? null : Number(match[3])
  if (hours > 23 || minutes > 59 || (seconds !== null && seconds > 59)) {
    return { hours: null, minutes: null, seconds: null }
  }
  return { hours, minutes, seconds }
}

/** Parts -> canonical string, or null while a required segment is missing. */
function serialise(parts: Parts, withSeconds: boolean): string | null {
  if (parts.hours === null || parts.minutes === null) return null
  if (withSeconds) {
    if (parts.seconds === null) return null
    return `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
  }
  return `${pad(parts.hours)}:${pad(parts.minutes)}`
}

/** Seconds since midnight, for clamping against min/max. */
function toSeconds(value: string): number {
  const p = parse(value)
  return (p.hours ?? 0) * 3600 + (p.minutes ?? 0) * 60 + (p.seconds ?? 0)
}

function fromSeconds(total: number, withSeconds: boolean): Parts {
  const clamped = Math.max(0, Math.min(86_399, total))
  return {
    hours: Math.floor(clamped / 3600),
    minutes: Math.floor((clamped % 3600) / 60),
    seconds: withSeconds ? clamped % 60 : null,
  }
}

const SEGMENT_LABEL: Record<Segment, string> = {
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
  period: 'AM or PM',
}

/**
 * A time field made of spinbutton segments — hours, minutes, optional seconds, optional
 * AM/PM — rather than a free-text box or a scrolling list of every quarter hour.
 *
 * `OTPInput` is the sibling: one focused box at a time, typed digits accumulate, focus
 * advances when a segment is complete. The difference is that each box here is a real
 * `role="spinbutton"` with `aria-valuenow`/`min`/`max` and a spoken `aria-valuetext`
 * ("9 hours"), so a screen reader announces the value, not a bare "1".
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | 0–9 | Type into the segment; two digits (or a first digit too large for two) complete it and move on |
 * | ArrowUp / ArrowDown | Step the segment, wrapping at its bounds |
 * | ArrowLeft / ArrowRight | Previous / next segment |
 * | Home / End | First / last segment |
 * | Backspace | Clear the segment, then move back |
 * | A / P | Set AM / PM (12-hour mode) |
 *
 * **The value is always 24-hour.** `hourCycle={12}` changes what is shown and how AM/PM is
 * entered; `onValueChange` still receives `'14:30'`. Bounds are enforced by clamping a
 * committed value, never by refusing keystrokes — refusing makes typing `9` impossible
 * when the minimum is `09:30`.
 */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  {
    value,
    defaultValue,
    onValueChange,
    withSeconds = false,
    hourCycle = 24,
    min,
    max,
    size = 'md',
    disabled,
    readOnly,
    invalid,
    required,
    name,
    className,
    style,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const baseId = useIsomorphicId(id)
  const boxes = useRef<Partial<Record<Segment, HTMLInputElement | null>>>({})

  const [canonical, setCanonical] = useControllableState<string | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  })

  // Segments the user has filled but that do not yet make a complete value live here, so
  // typing "09" into hours shows "09" even though the value is still null.
  const [draft, setDraft] = useState<Parts>(() => parse(canonical))
  // The digit buffer for the focused segment: the first of two keystrokes.
  const pending = useRef<{ segment: Segment; digit: number } | null>(null)

  const parts: Parts = canonical !== null ? parse(canonical) : draft

  const segments: Segment[] = [
    'hours',
    'minutes',
    ...(withSeconds ? (['seconds'] as const) : []),
    ...(hourCycle === 12 ? (['period'] as const) : []),
  ]

  const focusSegment = useCallback((segment: Segment | undefined) => {
    if (segment) boxes.current[segment]?.focus()
  }, [])

  /** Commit new parts: clamp into bounds when complete, then publish. */
  const commit = useCallback(
    (next: Parts) => {
      const serialised = serialise(next, withSeconds)
      if (serialised === null) {
        setDraft(next)
        setCanonical(null)
        return
      }
      let total = toSeconds(serialised)
      if (min) total = Math.max(total, toSeconds(min))
      if (max) total = Math.min(total, toSeconds(max))
      const clamped = fromSeconds(total, withSeconds)
      setDraft(clamped)
      setCanonical(serialise(clamped, withSeconds))
    },
    [max, min, setCanonical, withSeconds],
  )

  const bounds = (segment: Segment): [number, number] =>
    segment === 'hours' ? [0, 23] : segment === 'period' ? [0, 1] : [0, 59]

  /** The number a segment holds, in its own units — hours are shown 12-hour when asked. */
  const shown = (segment: Segment): number | null => {
    if (segment === 'period') return parts.hours === null ? null : parts.hours >= 12 ? 1 : 0
    const raw = parts[segment]
    if (raw === null) return null
    if (segment === 'hours' && hourCycle === 12) return raw % 12 === 0 ? 12 : raw % 12
    return raw
  }

  const setSegment = (segment: Segment, next: number | null) => {
    pending.current = null
    if (segment === 'period') {
      if (parts.hours === null || next === null) return
      const isPm = parts.hours >= 12
      const wantPm = next === 1
      if (isPm === wantPm) return
      commit({ ...parts, hours: wantPm ? parts.hours + 12 : parts.hours - 12 })
      return
    }
    if (segment === 'hours' && hourCycle === 12 && next !== null) {
      // 12-hour entry: keep the current AM/PM, default to AM when nothing is set yet.
      const pm = parts.hours !== null && parts.hours >= 12
      const base = next % 12
      commit({ ...parts, hours: pm ? base + 12 : base })
      return
    }
    commit({ ...parts, [segment]: next })
  }

  const step = (segment: Segment, delta: 1 | -1) => {
    if (segment === 'period') {
      setSegment('period', shown('period') === 1 ? 0 : 1)
      return
    }
    const [lo, hi] = segment === 'hours' && hourCycle === 12 ? [1, 12] : bounds(segment)
    const current = shown(segment) ?? (delta === 1 ? hi : lo)
    let next = current + delta
    if (next > hi) next = lo
    if (next < lo) next = hi
    setSegment(segment, next)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, segment: Segment) => {
    if (disabled || readOnly || event.defaultPrevented) return
    const index = segments.indexOf(segment)
    const key = event.key

    if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault()
      step(segment, key === 'ArrowUp' ? 1 : -1)
      return
    }
    if (key === 'ArrowRight') {
      event.preventDefault()
      focusSegment(segments[index + 1])
      return
    }
    if (key === 'ArrowLeft') {
      event.preventDefault()
      focusSegment(segments[index - 1])
      return
    }
    if (key === 'Home') {
      event.preventDefault()
      focusSegment(segments[0])
      return
    }
    if (key === 'End') {
      event.preventDefault()
      focusSegment(segments[segments.length - 1])
      return
    }
    if (key === 'Backspace' || key === 'Delete') {
      event.preventDefault()
      if (segment === 'period') return
      const wasEmpty = parts[segment] === null && pending.current?.segment !== segment
      pending.current = null
      if (wasEmpty) {
        focusSegment(segments[index - 1])
        return
      }
      commit({ ...parts, [segment]: null })
      return
    }
    if (segment === 'period') {
      if (key === 'a' || key === 'A') {
        event.preventDefault()
        setSegment('period', 0)
      } else if (key === 'p' || key === 'P') {
        event.preventDefault()
        setSegment('period', 1)
      }
      return
    }
    if (/^[0-9]$/.test(key)) {
      event.preventDefault()
      const digit = Number(key)
      const [lo, hi] = segment === 'hours' && hourCycle === 12 ? [1, 12] : bounds(segment)
      const buffered = pending.current?.segment === segment ? pending.current.digit : null

      if (buffered !== null) {
        // Second keystroke: combine, clamp into the segment's range, advance.
        const combined = Math.min(Math.max(buffered * 10 + digit, lo), hi)
        setSegment(segment, combined)
        focusSegment(segments[index + 1])
        return
      }
      if (digit * 10 > hi) {
        // A first digit too large to take a second one is already the whole number.
        setSegment(segment, Math.max(digit, lo))
        focusSegment(segments[index + 1])
        return
      }
      // First keystroke: show it, wait for the second.
      pending.current = { segment, digit }
      commit({ ...parts, [segment]: segment === 'hours' && hourCycle === 12 ? digit : digit })
      pending.current = { segment, digit }
      return
    }
    // Anything else - letters in a numeric segment, punctuation - is swallowed: the
    // segments are not free text.
    if (key.length === 1 && !event.ctrlKey && !event.metaKey) event.preventDefault()
  }

  const valueText = (segment: Segment): string => {
    const n = shown(segment)
    if (segment === 'period') return n === null ? 'not set' : n === 1 ? 'PM' : 'AM'
    if (n === null) return 'empty'
    return `${n} ${segment}`
  }

  const display = (segment: Segment): string => {
    const n = shown(segment)
    if (segment === 'period') return n === null ? '--' : n === 1 ? 'PM' : 'AM'
    return n === null ? '--' : pad(n)
  }

  return (
    <div
      className={cx('vk-time-picker', className)}
      style={style}
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      data-size={size}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      {...rest}
    >
      {segments.map((segment, index) => {
        const [lo, hi] = segment === 'hours' && hourCycle === 12 ? [1, 12] : bounds(segment)
        const n = shown(segment)
        return (
          <span className="vk-time-picker__segment-wrap" key={segment}>
            {index > 0 && segment !== 'period' ? (
              <span aria-hidden="true" className="vk-time-picker__colon">
                :
              </span>
            ) : null}
            <input
              ref={(node) => {
                boxes.current[segment] = node
                // The first segment is the component's ref target - what a label points at.
                if (index !== 0) return
                if (typeof ref === 'function') ref(node)
                else if (ref) ref.current = node
              }}
              id={index === 0 ? baseId : `${baseId}-${segment}`}
              className="vk-time-picker__segment"
              data-segment={segment}
              data-filled={n === null ? undefined : ''}
              type="text"
              inputMode={segment === 'period' ? 'text' : 'numeric'}
              autoComplete="off"
              spellCheck={false}
              role="spinbutton"
              aria-label={SEGMENT_LABEL[segment]}
              aria-valuemin={lo}
              aria-valuemax={hi}
              aria-valuenow={n ?? undefined}
              aria-valuetext={valueText(segment)}
              aria-invalid={invalid || undefined}
              required={required && index === 0}
              disabled={disabled}
              readOnly
              value={display(segment)}
              onKeyDown={(event) => onKeyDown(event, segment)}
              onFocus={() => {
                pending.current = null
              }}
            />
          </span>
        )
      })}
      {name ? <input type="hidden" name={name} value={canonical ?? ''} /> : null}
    </div>
  )
})
