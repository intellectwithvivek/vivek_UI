'use client'

import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { useAnchoredPosition } from '../../hooks/use-anchored-position'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useDismiss } from '../../hooks/use-dismiss'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
import type { Align, Side } from '../../utils/position'
import { Calendar } from '../calendar'
import {
  type DateLocale,
  type DateRange,
  type DisabledDates,
  formatDate,
  isValidDate,
  toISODate,
  type WeekStart,
} from '../calendar/date-utils'
import { Portal, type PortalContainer } from '../portal'

export interface DateRangePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'> {
  /** Controlled range. `end` is `null` while the user has picked only a start. */
  value?: DateRange | null
  defaultValue?: DateRange | null
  /**
   * Fires on every change, including the half-selected `{ start, end: null }` step, so a
   * consumer can react to the first click. Read `end !== null` for "complete".
   */
  onValueChange?: (value: DateRange | null) => void
  min?: Date | null
  max?: Date | null
  disabledDates?: DisabledDates
  weekStartsOn?: WeekStart
  locale?: DateLocale
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  /** Sets `aria-invalid` on the trigger. Injected by `Field`. */
  invalid?: boolean
  /** Injected by `Field`. */
  required?: boolean
  /**
   * Submits two hidden fields, `{name}-start` and `{name}-end`, as ISO dates — the same
   * convention `Calendar` uses in range mode, so a form does not care which rendered it.
   */
  name?: string
  /** Shown in place of a missing start or end. Default `'Start date'` / `'End date'`. */
  placeholder?: { start?: string; end?: string }
  /**
   * Renders a date as the trigger's text. Default `YYYY-MM-DD`, which is deterministic —
   * `Intl` output differs between Node builds and browsers, so a locale-aware default would
   * hydrate differently for two of your users.
   */
  format?: (date: Date) => string
  /**
   * The control's name, spoken before the current range: "Stay: 12 Mar 2026 to 15 Mar
   * 2026". Default `'Date range'`. Prefer `aria-labelledby` (via rest) when a visible label
   * exists.
   */
  label?: string
  /** Controlled popup state. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: Side
  align?: Align
  offset?: number
  padding?: number
  /** Where the popup portals. Defaults to `document.body`. */
  container?: PortalContainer
}

/** The spoken form of a range, for the trigger's accessible name. Long dates, never ISO. */
function spokenRange(range: DateRange | null, locale: DateLocale): string {
  const start = range?.start && isValidDate(range.start) ? formatDate(range.start, locale) : null
  const end = range?.end && isValidDate(range.end) ? formatDate(range.end, locale) : null
  if (start && end) return `${start} to ${end}`
  if (start) return `from ${start}, end not chosen`
  return 'no dates selected'
}

/**
 * A date-range field: one trigger showing "start – end", a popover hosting `Calendar` in
 * range mode.
 *
 * Almost all of the hard part already existed — `Calendar` implements range selection, with
 * its click-before-start-swaps and its hover preview — and `DatePicker` had already solved
 * the popover, positioning, dismissal and focus hand-off. This component is the wiring
 * between them that nobody had written, which is why the top-three request in every date
 * library's tracker was still missing here.
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | Enter / Space / ArrowDown | Open the calendar |
 * | Arrows, Home/End, PageUp/PageDown | Move through days, months and years (Calendar's grid) |
 * | Enter / Space on a day | Pick the start, then the end; the popup closes on the end |
 * | Escape | Close, discarding a half-picked start |
 *
 * **A half-selection never leaks out of the popup.** Picking a start and then pressing
 * Escape restores the last complete range rather than leaving `{ start, end: null }` in the
 * field — a form submitting one date of two is the classic range-picker defect.
 *
 * The trigger's accessible name always carries the range in words, because the two short
 * ISO strings on screen are meaningless as speech.
 */
export const DateRangePicker = forwardRef<HTMLButtonElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      disabledDates,
      weekStartsOn,
      locale,
      size = 'md',
      disabled,
      invalid,
      required,
      name,
      placeholder,
      format = toISODate,
      label = 'Date range',
      open,
      defaultOpen = false,
      onOpenChange,
      side = 'bottom',
      align = 'start',
      offset = 6,
      padding = 8,
      container,
      className,
      style,
      id,
      ...rest
    },
    ref,
  ) {
    const baseId = useIsomorphicId(id)
    const dialogId = `${baseId}-dialog`

    const triggerRef = useRef<HTMLButtonElement | null>(null)
    const popupRef = useRef<HTMLDivElement | null>(null)

    const [range, setRange] = useControllableState<DateRange | null>({
      value,
      defaultValue: defaultValue ?? null,
      onChange: onValueChange,
    })
    const [isOpen, setIsOpen] = useControllableState<boolean>({
      value: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    })

    // The last range with both ends, so a dismissed half-selection has something to go
    // back to. A ref, not state: it must never trigger a render on its own.
    const lastComplete = useRef<DateRange | null>(range?.start && range.end ? range : null)
    useEffect(() => {
      if (range?.start && range.end) lastComplete.current = range
    }, [range])

    const close = useCallback(
      (returnFocus: boolean, discardPartial: boolean) => {
        setIsOpen(false)
        if (discardPartial && range?.start && !range.end) setRange(lastComplete.current)
        if (returnFocus) triggerRef.current?.focus()
      },
      [range, setIsOpen, setRange],
    )

    const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.defaultPrevented || disabled) return
      // ArrowDown opens - the platform convention for "show the picker" on a closed field.
      if (event.key === 'ArrowDown' && !isOpen) {
        event.preventDefault()
        setIsOpen(true)
      }
    }

    const startText = range?.start && isValidDate(range.start) ? format(range.start) : null
    const endText = range?.end && isValidDate(range.end) ? format(range.end) : null

    return (
      <div
        className={cx('vk-date-range-picker', className)}
        style={style}
        data-size={size}
        data-open={isOpen || undefined}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        {...rest}
      >
        <button
          ref={(node) => {
            triggerRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          id={baseId}
          type="button"
          className="vk-date-range-picker__trigger"
          data-size={size}
          aria-label={`${label}: ${spokenRange(range, locale)}`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? dialogId : undefined}
          aria-invalid={invalid || undefined}
          // Not aria-required: the attribute is not valid on a button. Field reads
          // `required` for its own marker; the data attribute is here for styling hooks.
          data-required={required || undefined}
          disabled={disabled}
          onClick={() => (isOpen ? close(true, true) : setIsOpen(true))}
          onKeyDown={onTriggerKeyDown}
        >
          <span
            className="vk-date-range-picker__part"
            data-placeholder={startText ? undefined : ''}
          >
            {startText ?? placeholder?.start ?? 'Start date'}
          </span>
          <span className="vk-date-range-picker__separator" aria-hidden="true">
            –
          </span>
          <span className="vk-date-range-picker__part" data-placeholder={endText ? undefined : ''}>
            {endText ?? placeholder?.end ?? 'End date'}
          </span>
          <span className="vk-date-range-picker__icon" aria-hidden="true" />
        </button>

        {name ? (
          <>
            <input
              type="hidden"
              name={`${name}-start`}
              value={range?.start ? toISODate(range.start) : ''}
            />
            <input
              type="hidden"
              name={`${name}-end`}
              value={range?.end ? toISODate(range.end) : ''}
            />
          </>
        ) : null}

        {isOpen ? (
          <Portal container={container}>
            <RangePopup
              popupRef={popupRef}
              anchorRef={triggerRef}
              dialogId={dialogId}
              side={side}
              align={align}
              offset={offset}
              padding={padding}
              label={label}
              onDismiss={() => close(true, true)}
            >
              <Calendar
                mode="range"
                value={range}
                min={min}
                max={max}
                disabledDates={disabledDates}
                weekStartsOn={weekStartsOn}
                locale={locale}
                size={size === 'lg' ? 'lg' : 'md'}
                onValueChange={(next) => {
                  setRange(next)
                  // The popup closes on a complete range and stays for a half one: the
                  // second click is the whole point of a range picker.
                  if (next.start && next.end) {
                    setIsOpen(false)
                    triggerRef.current?.focus()
                  }
                }}
              />
            </RangePopup>
          </Portal>
        ) : null}
      </div>
    )
  },
)

interface RangePopupProps {
  popupRef: RefObject<HTMLDivElement | null>
  anchorRef: RefObject<HTMLButtonElement | null>
  dialogId: string
  side: Side
  align: Align
  offset: number
  padding: number
  label: string
  onDismiss: () => void
  children: ReactNode
}

/**
 * The panel, split out below the `Portal` boundary so measurement and focus happen after
 * mount and never during server rendering. Mirrors DatePicker's popup deliberately: the two
 * must dismiss, position and hand off focus identically, or a user learns two behaviours
 * for one idea.
 */
function RangePopup({
  popupRef,
  anchorRef,
  dialogId,
  side,
  align,
  offset,
  padding,
  label,
  onDismiss,
  children,
}: RangePopupProps) {
  const resolved = useAnchoredPosition(anchorRef, popupRef, side, align, offset, padding)

  useDismiss({ onDismiss, refs: [popupRef, anchorRef] })

  // Focus the calendar's own tab stop, not the panel: one keystroke fewer before the
  // arrows do anything.
  useEffect(() => {
    const panel = popupRef.current
    if (!panel) return
    const day = panel.querySelector<HTMLButtonElement>('[data-vk-day][tabindex="0"]')
    ;(day ?? panel).focus()
  }, [popupRef])

  return (
    <div
      ref={popupRef}
      id={dialogId}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      className="vk-date-range-picker__popup"
      data-side={resolved?.side ?? side}
      data-align={resolved?.align ?? align}
      data-positioned={resolved ? '' : undefined}
      style={
        { left: `${resolved?.x ?? 0}px`, top: `${resolved?.y ?? 0}px` } satisfies CSSProperties
      }
    >
      {children}
    </div>
  )
}
