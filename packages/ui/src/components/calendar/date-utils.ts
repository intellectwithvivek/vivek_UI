/*
 * Date maths for `Calendar` and `DatePicker` — no date library, by house rule.
 *
 * Two decisions make the whole file correct instead of subtly wrong:
 *
 * 1. **Everything is calendar-field arithmetic, never milliseconds.** `addDays` builds
 *    `new Date(y, m, d + n)` and lets the constructor normalise the overflow. Adding
 *    `n * 86_400_000` instead is the classic DST bug: on the 23-hour spring-forward day
 *    it lands on the same calendar date, and on the 25-hour autumn day it lands on the
 *    previous one. The constructor is immune because it works in calendar fields and
 *    resolves the offset afterwards.
 * 2. **A "date" here is local midnight.** Every value that crosses the boundary is
 *    normalised with `startOfDay`, and comparisons only ever look at year/month/day. So a
 *    `Date` carrying a time from elsewhere in the app cannot make "today" fail to equal
 *    today, and no UTC conversion is ever performed — `toISOString()` would shift the day
 *    for every user west of Greenwich.
 *
 * Pure, no hooks, no DOM: deliberately free of `'use client'` so it stays server-safe.
 */

/** Day of the week the grid starts on. `0` = Sunday … `6` = Saturday. */
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** What `Intl` accepts, narrowed to the two forms a component prop realistically takes. */
export type DateLocale = string | string[] | undefined

/** A selected range. `end` is `null` while the user is mid-selection. */
export interface DateRange {
  start: Date | null
  end: Date | null
}

/** Dates to block: an explicit list, or a predicate for "weekends", "holidays", and so on. */
export type DisabledDates = ReadonlyArray<Date> | ((date: Date) => boolean)

/** Local midnight of the given date. The canonical form for every date in this module. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Local midnight today. */
export function today(): Date {
  return startOfDay(new Date())
}

/** `true` when the value is a `Date` that is not `Invalid Date`. */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

/** Days in a month. `month` is 0-based; leap years fall out of the day-0 trick. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** `-1`, `0` or `1`, comparing calendar days only — times are ignored. */
export function compareDay(a: Date, b: Date): number {
  const ay = a.getFullYear()
  const by = b.getFullYear()
  if (ay !== by) return ay < by ? -1 : 1
  const am = a.getMonth()
  const bm = b.getMonth()
  if (am !== bm) return am < bm ? -1 : 1
  const ad = a.getDate()
  const bd = b.getDate()
  if (ad !== bd) return ad < bd ? -1 : 1
  return 0
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false
  return compareDay(a, b) === 0
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/** Add days. Negative counts subtract. DST-safe: see the header note. */
export function addDays(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count)
}

/**
 * Add months, clamping the day to the target month's length.
 *
 * 31 Jan + 1 month is 28 Feb (29 Feb in a leap year), not 2 or 3 March. Overflowing is
 * what `setMonth` does, and it is never what a "next month" button should do.
 */
export function addMonths(date: Date, count: number): Date {
  const absolute = date.getMonth() + count
  const year = date.getFullYear() + Math.floor(absolute / 12)
  const month = ((absolute % 12) + 12) % 12
  return new Date(year, month, Math.min(date.getDate(), daysInMonth(year, month)))
}

/** Add years, with the same clamp: 29 Feb 2024 + 1 year is 28 Feb 2025. */
export function addYears(date: Date, count: number): Date {
  return addMonths(date, count * 12)
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

/** First day of the week containing `date`, for the given week start. */
export function startOfWeek(date: Date, weekStartsOn: WeekStart): Date {
  const offset = (date.getDay() - weekStartsOn + 7) % 7
  return addDays(startOfDay(date), -offset)
}

/** Last day of the week containing `date`, for the given week start. */
export function endOfWeek(date: Date, weekStartsOn: WeekStart): Date {
  return addDays(startOfWeek(date, weekStartsOn), 6)
}

/** Clamp to an inclusive `[min, max]` window, comparing days only. */
export function clampDate(date: Date, min?: Date | null, max?: Date | null): Date {
  if (min && compareDay(date, min) < 0) return startOfDay(min)
  if (max && compareDay(date, max) > 0) return startOfDay(max)
  return startOfDay(date)
}

export interface DateBounds {
  min?: Date | null
  max?: Date | null
  disabledDates?: DisabledDates
}

/** Outside `[min, max]`, or matched by `disabledDates`. */
export function isDateDisabled(date: Date, { min, max, disabledDates }: DateBounds): boolean {
  if (min && compareDay(date, min) < 0) return true
  if (max && compareDay(date, max) > 0) return true
  if (!disabledDates) return false
  if (typeof disabledDates === 'function') return disabledDates(startOfDay(date))
  return disabledDates.some((blocked) => isSameDay(blocked, date))
}

/**
 * The weeks to render for one month, as whole weeks of real dates.
 *
 * Leading and trailing cells are the neighbouring months' actual dates rather than
 * `null` padding, so the caller can dim them and the grid stays a true 7-column table
 * for screen readers. The number of weeks is the minimum that covers the month — 4 for a
 * 28-day February that starts on the week's first day, 6 for a 31-day month that starts
 * on its last.
 */
export function getMonthGrid(year: number, month: number, weekStartsOn: WeekStart): Date[][] {
  const first = new Date(year, month, 1)
  const leading = (first.getDay() - weekStartsOn + 7) % 7
  const total = leading + daysInMonth(year, month)
  const weeks = Math.ceil(total / 7)

  const grid: Date[][] = []
  for (let week = 0; week < weeks; week += 1) {
    const row: Date[] = []
    for (let day = 0; day < 7; day += 1) {
      row.push(new Date(year, month, 1 - leading + week * 7 + day))
    }
    grid.push(row)
  }
  return grid
}

/*
 * Constructing an `Intl.DateTimeFormat` is the expensive part of formatting, so instances
 * are memoised on locale + options. Safe as module state: a formatter is immutable and
 * stateless, and the key set is bounded by the options this file actually passes.
 */
const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(locale: DateLocale, options: Intl.DateTimeFormatOptions) {
  const localeKey = Array.isArray(locale) ? locale.join(',') : (locale ?? '')
  const key = `${localeKey}|${JSON.stringify(options)}`
  const cached = formatterCache.get(key)
  if (cached) return cached
  const created = new Intl.DateTimeFormat(locale, options)
  formatterCache.set(key, created)
  return created
}

const LONG_DATE: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}

/** Localised date text. Defaults to the long form used for grid-cell labels. */
export function formatDate(
  date: Date,
  locale?: DateLocale,
  options: Intl.DateTimeFormatOptions = LONG_DATE,
): string {
  return getFormatter(locale, options).format(date)
}

/** For example `"August 2026"`. */
export function formatMonthYear(date: Date, locale?: DateLocale): string {
  return getFormatter(locale, { month: 'long', year: 'numeric' }).format(date)
}

/** The day number, localised — Arabic-Indic digits in `ar`, and so on. */
export function formatDayNumber(date: Date, locale?: DateLocale): string {
  return getFormatter(locale, { day: 'numeric' }).format(date)
}

/**
 * Column headers, rotated to the requested week start.
 *
 * 1 August 2021 was a Sunday, so indexing forward from it turns a `WeekStart` into the
 * right seven names with no lookup table and no locale-specific first-day guessing.
 */
export function getWeekdayNames(
  weekStartsOn: WeekStart,
  locale?: DateLocale,
  format: 'narrow' | 'short' | 'long' = 'short',
): string[] {
  const knownSunday = new Date(2021, 7, 1)
  const formatter = getFormatter(locale, { weekday: format })
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(addDays(knownSunday, weekStartsOn + index)),
  )
}

/**
 * `YYYY-MM-DD` from the *local* calendar fields.
 *
 * Not `toISOString().slice(0, 10)`: that converts to UTC first, so for anyone west of
 * Greenwich the date it prints is yesterday's for most of the day.
 */
export function toISODate(date: Date): string {
  const year = `${date.getFullYear()}`.padStart(4, '0')
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const ISO_DATE = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/

/**
 * Parse `YYYY-MM-DD` (or `YYYY/M/D`) as a *local* date. `null` for anything else.
 *
 * Strict on purpose. `new Date(string)` accepts `"2024-02-31"` and silently rolls it to
 * 2 March, treats bare `"2024-02-01"` as UTC while `"2024/02/01"` is local, and in some
 * engines will parse outright nonsense. A typed-entry field that guesses is worse than
 * one that rejects, so a day number that does not exist in its month fails here.
 */
export function parseISODate(input: string): Date | null {
  const match = ISO_DATE.exec(input.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  if (month < 0 || month > 11) return null
  if (day < 1 || day > daysInMonth(year, month)) return null
  return new Date(year, month, day)
}

/** `true` when `date` falls strictly between a committed range's endpoints. */
export function isInRange(date: Date, range: DateRange | null | undefined): boolean {
  if (!range?.start || !range.end) return false
  return compareDay(date, range.start) > 0 && compareDay(date, range.end) < 0
}

/**
 * Fold a click into a range.
 *
 * The case everyone gets wrong is the third one: the user has a start and clicks
 * *before* it. Recording that as `end` produces an inverted range that every downstream
 * `>=`/`<=` reads as empty. Swapping is what the user meant.
 */
export function nextRange(current: DateRange | null | undefined, clicked: Date): DateRange {
  const day = startOfDay(clicked)
  if (!current?.start || current.end) return { start: day, end: null }
  if (compareDay(day, current.start) < 0) return { start: day, end: current.start }
  return { start: current.start, end: day }
}
