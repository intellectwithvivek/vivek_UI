'use client'

import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compareDay,
  type DateBounds,
  type DateLocale,
  type DateRange,
  type DisabledDates,
  endOfWeek,
  formatDate,
  formatDayNumber,
  formatMonthYear,
  getMonthGrid,
  getWeekdayNames,
  isDateDisabled,
  isInRange,
  isSameDay,
  isSameMonth,
  isValidDate,
  nextRange,
  startOfDay,
  startOfMonth,
  startOfWeek,
  today,
  toISODate,
  type WeekStart,
} from './date-utils'

/** What a `Calendar` can hold: one day, a range, or nothing. */
export type CalendarSelection = Date | DateRange | null

interface CalendarBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Earliest selectable day, inclusive. Earlier days are disabled and unreachable. */
  min?: Date | null
  /** Latest selectable day, inclusive. */
  max?: Date | null
  /** Extra days to block: a list, or a predicate for weekends and holidays. */
  disabledDates?: DisabledDates
  /** `0` = Sunday (default) … `6` = Saturday. */
  weekStartsOn?: WeekStart
  /** BCP 47 tag(s) for month, weekday and day-number text. Defaults to the runtime locale. */
  locale?: DateLocale
  /** Month shown on first render. Defaults to the selected day's month, else today's. */
  defaultMonth?: Date
  /** Controlled displayed month. Pair with `onMonthChange`. */
  month?: Date
  onMonthChange?: (month: Date) => void
  size?: 'sm' | 'md' | 'lg'
  /** Blocks selection and navigation entirely. */
  disabled?: boolean
  /** Sets `aria-invalid` on the grid. Injected by `Field`. */
  invalid?: boolean
  /** Sets `aria-required` on the grid. Injected by `Field`. */
  required?: boolean
  /**
   * Submits the selection with the form as `YYYY-MM-DD`. In `range` mode two hidden
   * inputs are emitted, `{name}-start` and `{name}-end`.
   */
  name?: string
}

export interface CalendarSingleProps extends CalendarBaseProps {
  mode?: 'single'
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (value: Date | null) => void
}

export interface CalendarRangeProps extends CalendarBaseProps {
  mode: 'range'
  value?: DateRange | null
  defaultValue?: DateRange | null
  onValueChange?: (value: DateRange) => void
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps

/** The public union collapsed for internal use. See the cast in the component body. */
interface CalendarInternalProps extends CalendarBaseProps {
  mode?: 'single' | 'range'
  value?: CalendarSelection
  defaultValue?: CalendarSelection
  onValueChange?: (value: CalendarSelection) => void
}

function isDateRange(value: CalendarSelection): value is DateRange {
  return value !== null && typeof value === 'object' && !(value instanceof Date)
}

function asDate(value: CalendarSelection): Date | null {
  return isValidDate(value) ? value : null
}

function asRange(value: CalendarSelection): DateRange {
  if (isDateRange(value)) return value
  return { start: asDate(value), end: null }
}

/**
 * A month grid, keyboard-navigable per the WAI-ARIA Authoring Practices grid pattern.
 *
 * Three things are worth knowing about the implementation.
 *
 * **All localisation is `Intl`.** Month names, weekday headers, day numbers and the
 * cells' accessible names come from `Intl.DateTimeFormat`, so `locale="ar-EG"` gets
 * Arabic month names and Arabic-Indic digits with no strings shipped in this file. The
 * date maths lives in `date-utils.ts` and is calendar-field arithmetic throughout, which
 * is what makes DST transitions and leap years non-events rather than special cases.
 *
 * **A disabled day is unreachable, not merely unclickable.** Arrow navigation keeps
 * stepping in the direction of travel until it finds a selectable day, so a keyboard user
 * never parks on a cell that does nothing. Landing on a dead cell and having to guess
 * which way out is worse than the cursor appearing to skip.
 *
 * **The tab stop is single.** Exactly one day button is tabbable — the focused one — so
 * Tab moves past the calendar in one press instead of thirty-five.
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  // One deliberate widening of the public discriminated union. The variants differ only
  // in the shape flowing through `value`/`onValueChange`, and `mode` is checked before
  // either is read, so collapsing them keeps the body free of per-branch duplication.
  // `as unknown as` because `strictFunctionTypes` makes the two callback signatures
  // non-comparable in a single step.
  const {
    mode = 'single',
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    disabledDates,
    weekStartsOn = 0,
    locale,
    defaultMonth,
    month,
    onMonthChange,
    size = 'md',
    disabled,
    invalid,
    required,
    name,
    className,
    id,
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    ...rest
  } = props as unknown as CalendarInternalProps

  const baseId = useIsomorphicId(id)
  const titleId = `${baseId}-title`
  const gridRef = useRef<HTMLTableElement | null>(null)

  const [selection, setSelection] = useControllableState<CalendarSelection>({
    value,
    defaultValue: defaultValue ?? (mode === 'range' ? { start: null, end: null } : null),
    onChange: onValueChange,
  })

  const bounds = useMemo<DateBounds>(() => ({ min, max, disabledDates }), [min, max, disabledDates])

  const selectedDate = mode === 'range' ? null : asDate(selection)
  const selectedRange = mode === 'range' ? asRange(selection) : null

  // A `useState` initialiser rather than a `useMemo`, because this is genuinely read
  // once: it seeds the view and the tab stop. Later changes to `value` move both through
  // the synchronising effect below.
  const [initialFocus] = useState(() => {
    const seed = defaultValue ?? value ?? null
    const anchor = defaultMonth ?? asDate(seed) ?? asRange(seed).start ?? today()
    return clampDate(anchor, min, max)
  })

  const [viewMonth, setViewMonth] = useControllableState<Date>({
    value: month,
    defaultValue: startOfMonth(initialFocus),
    onChange: onMonthChange,
  })
  const [focusedDate, setFocusedDate] = useState<Date>(initialFocus)

  /**
   * Focus follows `focusedDate`, but only when a keystroke or a nav button asked for it.
   * A calendar that grabs focus on mount steals it from whatever the user was doing, and
   * one that grabs it on every parent re-render is worse.
   */
  const pendingFocusRef = useRef(false)
  useEffect(() => {
    if (!pendingFocusRef.current) return
    pendingFocusRef.current = false
    // ISO dates are digits and hyphens only, so the attribute value needs no escaping.
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-vk-day="${toISODate(focusedDate)}"]`)
      ?.focus()
  }, [focusedDate])

  /** Keep the visible month in step with a selection that arrived from outside. */
  const anchor = selectedRange?.start ?? selectedDate
  const anchorKey = anchor ? toISODate(anchor) : null
  // Latest-value ref, so the effect can depend on the stable ISO key (a controlled `Date`
  // is a fresh object on every render) while still using the real date.
  const anchorRef = useRef<Date | null>(anchor)
  anchorRef.current = anchor
  const lastAnchorRef = useRef<string | null>(anchorKey)
  useEffect(() => {
    if (anchorKey === lastAnchorRef.current) return
    lastAnchorRef.current = anchorKey
    const next = anchorRef.current
    if (!next) return
    const day = startOfDay(next)
    setFocusedDate(day)
    setViewMonth((current) => (isSameMonth(day, current) ? current : startOfMonth(day)))
  }, [anchorKey, setViewMonth])

  /**
   * The nearest selectable day at or after `from`, walking `direction`. Bounded at 400
   * steps so a `disabledDates` predicate that blocks everything cannot spin forever.
   */
  const findEnabled = useCallback(
    (from: Date, direction: 1 | -1): Date | null => {
      let cursor = from
      for (let step = 0; step < 400; step += 1) {
        if (min && compareDay(cursor, min) < 0) return null
        if (max && compareDay(cursor, max) > 0) return null
        if (!isDateDisabled(cursor, bounds)) return cursor
        cursor = addDays(cursor, direction)
      }
      return null
    },
    [bounds, min, max],
  )

  /** Clamp into range, then skip disabled days — outward first, then back toward origin. */
  const resolveTarget = useCallback(
    (target: Date, direction: 1 | -1): Date | null => {
      const clamped = clampDate(target, min, max)
      return findEnabled(clamped, direction) ?? findEnabled(clamped, direction === 1 ? -1 : 1)
    },
    [findEnabled, min, max],
  )

  const moveFocus = useCallback(
    (target: Date, direction: 1 | -1) => {
      const resolved = resolveTarget(target, direction)
      if (!resolved) return
      pendingFocusRef.current = true
      setFocusedDate(resolved)
      setViewMonth((current) => (isSameMonth(resolved, current) ? current : startOfMonth(resolved)))
    },
    [resolveTarget, setViewMonth],
  )

  const select = useCallback(
    (day: Date) => {
      if (disabled || isDateDisabled(day, bounds)) return
      if (mode === 'range') {
        setSelection(nextRange(asRange(selection), day))
        return
      }
      setSelection(startOfDay(day))
    },
    [bounds, disabled, mode, selection, setSelection],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (disabled || event.defaultPrevented) return
      const from = focusedDate

      switch (event.key) {
        case 'ArrowLeft':
          moveFocus(addDays(from, -1), -1)
          break
        case 'ArrowRight':
          moveFocus(addDays(from, 1), 1)
          break
        case 'ArrowUp':
          moveFocus(addDays(from, -7), -1)
          break
        case 'ArrowDown':
          moveFocus(addDays(from, 7), 1)
          break
        case 'Home':
          moveFocus(startOfWeek(from, weekStartsOn), 1)
          break
        case 'End':
          moveFocus(endOfWeek(from, weekStartsOn), -1)
          break
        case 'PageUp':
          moveFocus(event.shiftKey ? addYears(from, -1) : addMonths(from, -1), -1)
          break
        case 'PageDown':
          moveFocus(event.shiftKey ? addYears(from, 1) : addMonths(from, 1), 1)
          break
        default:
          // Enter and Space are left alone: the day cell is a real `<button>`, so the
          // browser fires a click for them and handling them here would select twice.
          return
      }
      // The grid owns the arrows, Home/End and both Page keys even when the cursor could
      // not move, otherwise the page scrolls out from under a calendar sitting on `min`.
      event.preventDefault()
    },
    [disabled, focusedDate, moveFocus, weekStartsOn],
  )

  const stepMonth = useCallback(
    (delta: number, unit: 'month' | 'year') => {
      const next = unit === 'year' ? addYears(viewMonth, delta) : addMonths(viewMonth, delta)
      setViewMonth(startOfMonth(next))
      // Drag the tab stop along, so Tab-then-arrow starts inside the month on screen.
      const sameDayNextMonth = new Date(next.getFullYear(), next.getMonth(), focusedDate.getDate())
      const resolved = resolveTarget(sameDayNextMonth, delta < 0 ? -1 : 1)
      if (resolved) setFocusedDate(resolved)
    },
    [focusedDate, resolveTarget, setViewMonth, viewMonth],
  )

  const weeks = useMemo(
    () => getMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth(), weekStartsOn),
    [viewMonth, weekStartsOn],
  )
  const weekdays = useMemo(() => {
    const short = getWeekdayNames(weekStartsOn, locale, 'short')
    const long = getWeekdayNames(weekStartsOn, locale, 'long')
    return long.map((name, index) => ({ long: name, short: short[index] ?? name }))
  }, [weekStartsOn, locale])
  const now = useMemo(() => today(), [])

  const viewStart = startOfMonth(viewMonth)
  const prevDisabled = Boolean(disabled || (min && compareDay(viewStart, startOfMonth(min)) <= 0))
  const nextDisabled = Boolean(disabled || (max && compareDay(viewStart, startOfMonth(max)) >= 0))

  return (
    <div
      ref={ref}
      id={baseId}
      className={cx('vk-calendar', className)}
      data-size={size}
      data-mode={mode}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      {...rest}
    >
      <div className="vk-calendar__header">
        <button
          type="button"
          className="vk-calendar__nav"
          data-nav="prev-year"
          aria-label="Previous year"
          disabled={prevDisabled}
          onClick={() => stepMonth(-1, 'year')}
        >
          <span className="vk-calendar__chevron" data-double="" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="vk-calendar__nav"
          data-nav="prev-month"
          aria-label="Previous month"
          disabled={prevDisabled}
          onClick={() => stepMonth(-1, 'month')}
        >
          <span className="vk-calendar__chevron" aria-hidden="true" />
        </button>

        {/*
          Live, because PageUp/PageDown replaces the whole grid without moving focus out
          of it — without this the month change is silent.
        */}
        <div className="vk-calendar__title" id={titleId} aria-live="polite">
          {formatMonthYear(viewMonth, locale)}
        </div>

        <button
          type="button"
          className="vk-calendar__nav"
          data-nav="next-month"
          aria-label="Next month"
          disabled={nextDisabled}
          onClick={() => stepMonth(1, 'month')}
        >
          <span className="vk-calendar__chevron" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="vk-calendar__nav"
          data-nav="next-year"
          aria-label="Next year"
          disabled={nextDisabled}
          onClick={() => stepMonth(1, 'year')}
        >
          <span className="vk-calendar__chevron" data-double="" aria-hidden="true" />
        </button>
      </div>

      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: `role="grid"` does support `aria-multiselectable`; Biome resolves the role from the `table` tag instead of the attribute. */}
      <table
        ref={gridRef}
        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: the APG date-picker pattern is a grid, and a plain table does not convey it.
        role="grid"
        className="vk-calendar__grid"
        aria-labelledby={ariaLabel ? undefined : titleId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        aria-multiselectable={mode === 'range' || undefined}
        aria-disabled={disabled || undefined}
        onKeyDown={onKeyDown}
      >
        <thead>
          <tr>
            {weekdays.map((weekday) => (
              <th key={weekday.long} scope="col" className="vk-calendar__weekday">
                {/* The long name is what a screen reader should hear; the short one is
                    what fits a 2.25rem column. */}
                <span aria-hidden="true">{weekday.short}</span>
                <span className="vk-calendar__sr">{weekday.long}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a week has no identity beyond its position in the month, and the month is already in the key.
            <tr key={`${viewStart.getFullYear()}-${viewStart.getMonth()}-w${weekIndex}`}>
              {week.map((day) => {
                const iso = toISODate(day)
                if (!isSameMonth(day, viewMonth)) {
                  return (
                    // biome-ignore lint/a11y/useFocusableInteractive: the grid delegates its single tab stop to one day button, per the APG grid pattern; an out-of-month cell holds nothing to focus.
                    // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: cells of a `role="grid"` must be gridcells.
                    <td key={iso} role="gridcell" className="vk-calendar__cell" data-outside="">
                      {/* Hidden from assistive tech: an unqualified day number belonging
                          to another month is noise, and it is reachable in its own. */}
                      <span className="vk-calendar__outside" aria-hidden="true">
                        {formatDayNumber(day, locale)}
                      </span>
                    </td>
                  )
                }

                const dayDisabled = Boolean(disabled) || isDateDisabled(day, bounds)
                const isStart = isSameDay(selectedRange?.start, day)
                const isEnd = isSameDay(selectedRange?.end, day)
                const inRange = isInRange(day, selectedRange)
                const selected =
                  mode === 'range' ? isStart || isEnd || inRange : isSameDay(selectedDate, day)
                const isToday = isSameDay(now, day)

                return (
                  // biome-ignore lint/a11y/useFocusableInteractive: the focusable element is the day button inside; exactly one of them carries the grid's tab stop.
                  <td
                    key={iso}
                    // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: cells of a `role="grid"` must be gridcells.
                    role="gridcell"
                    className="vk-calendar__cell"
                    aria-selected={selected}
                    data-in-range={inRange || undefined}
                    data-range-start={isStart || undefined}
                    data-range-end={isEnd || undefined}
                  >
                    <button
                      type="button"
                      className="vk-calendar__day"
                      data-vk-day={iso}
                      data-selected={selected || undefined}
                      data-today={isToday || undefined}
                      tabIndex={isSameDay(focusedDate, day) ? 0 : -1}
                      disabled={dayDisabled}
                      aria-current={isToday ? 'date' : undefined}
                      aria-label={formatDate(day, locale)}
                      onClick={() => select(day)}
                      onFocus={() => setFocusedDate(startOfDay(day))}
                    >
                      {formatDayNumber(day, locale)}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/*
        Form participation. `required` cannot live on a hidden input — browsers skip
        constraint validation for them — so it is surfaced on the grid via `aria-required`
        above and left for the consuming form to enforce.
      */}
      {name && mode !== 'range' ? (
        <input type="hidden" name={name} value={selectedDate ? toISODate(selectedDate) : ''} />
      ) : null}
      {name && mode === 'range' ? (
        <>
          <input
            type="hidden"
            name={`${name}-start`}
            value={selectedRange?.start ? toISODate(selectedRange.start) : ''}
          />
          <input
            type="hidden"
            name={`${name}-end`}
            value={selectedRange?.end ? toISODate(selectedRange.end) : ''}
          />
        </>
      ) : null}
    </div>
  )
})
