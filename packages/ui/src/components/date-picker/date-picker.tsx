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
  useState,
} from 'react'
import { useAnchoredPosition } from '../../hooks/use-anchored-position'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useDismiss } from '../../hooks/use-dismiss'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
import type { Align, Side } from '../../utils/position'
import { Calendar } from '../calendar'
import {
  clampDate,
  type DateLocale,
  type DisabledDates,
  isDateDisabled,
  isValidDate,
  parseISODate,
  toISODate,
  type WeekStart,
} from '../calendar/date-utils'
import { Portal, type PortalContainer } from '../portal'

export interface DatePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'> {
  /** Controlled value. */
  value?: Date | null
  /** Uncontrolled initial value. */
  defaultValue?: Date | null
  onValueChange?: (value: Date | null) => void
  min?: Date | null
  max?: Date | null
  disabledDates?: DisabledDates
  weekStartsOn?: WeekStart
  locale?: DateLocale
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  readOnly?: boolean
  /** Sets `aria-invalid` on the input. Injected by `Field`. */
  invalid?: boolean
  /** Injected by `Field`. */
  required?: boolean
  /** Submits the input's text with the form. With the default format, that is the ISO date. */
  name?: string
  /** Shown when empty. Defaults to the expected text format. */
  placeholder?: string
  /** Renders a value as the input's text. Default `YYYY-MM-DD`. */
  format?: (date: Date) => string
  /** Reads the input's text. Default: strict `YYYY-MM-DD` (or `YYYY/M/D`). */
  parse?: (text: string) => Date | null
  /** Controlled popup state. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Preferred side for the popup. Flipped when there is no room. Default `'bottom'`. */
  side?: Side
  align?: Align
  offset?: number
  padding?: number
  container?: PortalContainer
  /** Accessible name for the trigger button. Default `'Choose date'`. */
  openLabel?: string
}

/**
 * A text input with a `Calendar` in a popup.
 *
 * Typing is a first-class path, not a fallback. Someone entering a birth date will type
 * it far faster than they can page a calendar back forty years, so the input is a real
 * text field with its own parse step, and the calendar is an alternative rather than the
 * only way in. The default format is `YYYY-MM-DD` in both directions, chosen because it
 * is the one form that is unambiguous everywhere — `03/04/2024` is two different days
 * depending on the reader — with `format`/`parse` there for a locale-specific mask.
 *
 * Unparseable text is kept, not silently discarded. The field reports the problem through
 * `aria-invalid` and a live message and leaves the characters alone, because deleting what
 * someone just typed is the fastest way to lose their trust in a form.
 *
 * The popup is a non-modal `dialog`: focus moves to the focused day on open and back to
 * the input on close, Escape closes it, and a press outside closes it, all via `useDismiss`
 * so it cooperates with any dialog it happens to be inside.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    disabledDates,
    weekStartsOn = 0,
    locale,
    size = 'md',
    disabled,
    readOnly,
    invalid,
    required,
    name,
    placeholder = 'YYYY-MM-DD',
    format = toISODate,
    parse = parseISODate,
    open,
    defaultOpen = false,
    onOpenChange,
    side = 'bottom',
    align = 'start',
    offset = 6,
    padding = 8,
    container,
    openLabel = 'Choose date',
    className,
    style,
    id,
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const baseId = useIsomorphicId(id)
  const dialogId = `${baseId}-dialog`
  const errorId = `${baseId}-parse-error`

  const inputRef = useRef<HTMLInputElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)

  const [selected, setSelected] = useControllableState<Date | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  })
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  const [text, setText] = useState(() => (isValidDate(selected) ? format(selected) : ''))
  const [parseError, setParseError] = useState(false)

  /**
   * Mirror an externally-changed value into the text, but never while the user is typing
   * in it — reformatting under a live cursor is how date fields end up unusable.
   */
  const valueKey = isValidDate(selected) ? toISODate(selected) : ''
  // Latest-value ref, so the effect depends on the stable ISO key rather than a `Date`
  // that is a fresh object on every controlled render.
  const selectedRef = useRef<Date | null>(selected)
  selectedRef.current = selected
  const lastValueKeyRef = useRef(valueKey)
  useEffect(() => {
    if (valueKey === lastValueKeyRef.current) return
    lastValueKeyRef.current = valueKey
    if (inputRef.current && document.activeElement === inputRef.current) return
    const next = selectedRef.current
    setText(next && isValidDate(next) ? format(next) : '')
    setParseError(false)
  }, [format, valueKey])

  const commitText = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (trimmed === '') {
        setParseError(false)
        setSelected(null)
        return
      }
      const parsed = parse(trimmed)
      if (!parsed || !isValidDate(parsed)) {
        setParseError(true)
        return
      }
      // Typed entry gets the same bounds as clicking. Clamping rather than rejecting,
      // because "1 Jan 1900" against a `min` of today is a plausible typo, not nonsense.
      const clamped = clampDate(parsed, min, max)
      if (isDateDisabled(clamped, { min, max, disabledDates })) {
        setParseError(true)
        return
      }
      setParseError(false)
      setSelected(clamped)
      setText(format(clamped))
    },
    [disabledDates, format, max, min, parse, setSelected],
  )

  const close = useCallback(
    (returnFocus: boolean) => {
      setIsOpen(false)
      if (returnFocus) inputRef.current?.focus()
    },
    [setIsOpen],
  )

  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.defaultPrevented || disabled || readOnly) return
      if (event.key === 'Enter') {
        // Committing on Enter must not also submit the form: the user is finishing the
        // field, not the whole page.
        event.preventDefault()
        commitText(event.currentTarget.value)
        return
      }
      // ArrowDown opens, with or without Alt: Alt+Down is the platform convention for
      // "open the picker", and bare Down is what people actually press.
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setIsOpen(true)
        return
      }
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        close(false)
      }
    },
    [close, commitText, disabled, isOpen, readOnly, setIsOpen],
  )

  return (
    <div
      className={cx('vk-date-picker', className)}
      style={style}
      data-size={size}
      data-open={isOpen || undefined}
      data-invalid={invalid || parseError || undefined}
      data-disabled={disabled || undefined}
      {...rest}
    >
      <div className="vk-date-picker__control">
        <input
          ref={(node) => {
            inputRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          id={baseId}
          type="text"
          className="vk-input vk-date-picker__input"
          data-size={size}
          name={name}
          value={text}
          placeholder={placeholder}
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-label={ariaLabel}
          aria-invalid={invalid || parseError || undefined}
          data-invalid={invalid || parseError || undefined}
          aria-describedby={
            [ariaDescribedBy, parseError ? errorId : undefined].filter(Boolean).join(' ') ||
            undefined
          }
          onChange={(event) => {
            setText(event.target.value)
            if (parseError) setParseError(false)
          }}
          onBlur={(event) => commitText(event.target.value)}
          onKeyDown={onInputKeyDown}
        />
        <button
          ref={triggerRef}
          type="button"
          className="vk-date-picker__trigger"
          aria-label={openLabel}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? dialogId : undefined}
          disabled={disabled || readOnly}
          onClick={() => (isOpen ? close(true) : setIsOpen(true))}
        >
          <span className="vk-date-picker__icon" aria-hidden="true" />
        </button>
      </div>

      {/*
        `role="alert"`, because the message appears in response to something the user just
        finished doing and they need to know before they move on.
      */}
      {parseError ? (
        <p className="vk-date-picker__error" id={errorId} role="alert">
          {`Enter a date as ${placeholder}.`}
        </p>
      ) : null}

      {isOpen ? (
        <Portal container={container}>
          <DatePickerPopup
            popupRef={popupRef}
            anchorRef={inputRef}
            triggerRef={triggerRef}
            dialogId={dialogId}
            side={side}
            align={align}
            offset={offset}
            padding={padding}
            label={openLabel}
            onDismiss={() => close(true)}
          >
            <Calendar
              value={selected}
              min={min}
              max={max}
              disabledDates={disabledDates}
              weekStartsOn={weekStartsOn}
              locale={locale}
              size={size === 'lg' ? 'lg' : 'md'}
              onValueChange={(next) => {
                setParseError(false)
                setSelected(next)
                if (next) setText(format(next))
                close(true)
              }}
            />
          </DatePickerPopup>
        </Portal>
      ) : null}
    </div>
  )
})

interface DatePickerPopupProps {
  popupRef: RefObject<HTMLDivElement | null>
  anchorRef: RefObject<HTMLInputElement | null>
  triggerRef: RefObject<HTMLButtonElement | null>
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
 * The panel. Split out below the `Portal` boundary so every measurement and focus move
 * happens after mount and never during server rendering.
 */
function DatePickerPopup({
  popupRef,
  anchorRef,
  triggerRef,
  dialogId,
  side,
  align,
  offset,
  padding,
  label,
  onDismiss,
  children,
}: DatePickerPopupProps) {
  const resolved = useAnchoredPosition(anchorRef, popupRef, side, align, offset, padding)

  useDismiss({
    onDismiss,
    refs: [popupRef, anchorRef, triggerRef],
  })

  /**
   * Focus the calendar's own tab stop — the day button carrying `tabIndex={0}`. Focusing
   * the panel instead would mean an extra keystroke before the arrows do anything, which
   * is the difference between a usable date picker and one people avoid.
   */
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
      className="vk-date-picker__popup"
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
