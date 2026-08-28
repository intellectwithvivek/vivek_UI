'use client'

import {
  type FocusEvent,
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { cx } from '../../utils/cx'

export interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'size' | 'min' | 'max' | 'step'
  > {
  /** Controlled value. `null` is "empty" — never `NaN`, which poisons every comparison. */
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  /** Increment applied by the steppers and the arrow keys. Default `1`. */
  step?: number
  /** Decimal places the committed value is rounded to. Unset = no rounding. */
  precision?: number
  size?: 'sm' | 'md' | 'lg'
  invalid?: boolean
  /**
   * Clamp into `[min, max]` when focus leaves. Default `true` — the alternative is a
   * field that looks settled while holding a value the range forbids.
   */
  clampOnBlur?: boolean
  /**
   * Let the mouse wheel change the value while the field is focused. Default `false`:
   * a page scroll drifting a focused quantity is the classic silent-corruption bug in
   * `type="number"`, and opting back in should be a decision, not an accident.
   */
  allowMouseWheel?: boolean
}

/** Parse the committed text. `.`-decimal only — deterministic across locales. */
function parse(text: string): number | null {
  const trimmed = text.trim()
  if (trimmed === '' || trimmed === '-' || trimmed === '.') return null
  if (!/^-?\d*\.?\d*$/.test(trimmed)) return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

function toText(value: number | null, precision?: number): string {
  if (value === null) return ''
  return typeof precision === 'number' ? value.toFixed(precision) : String(value)
}

/**
 * A numeric field that behaves.
 *
 * Deliberately NOT `<input type="number">`, whose defects are the reason every library
 * ships this component: the wheel changes a focused value mid-scroll, `e` and `-`
 * juggling differs per browser, and an unparseable draft reads back as an empty string
 * so validation cannot tell "blank" from "garbage". This is `type="text"` with
 * `inputmode="decimal"` (the right phone keyboard) and the APG spinbutton contract:
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | ArrowUp / ArrowDown | ± step |
 * | Shift + Arrow | ± 10 × step |
 * | Home / End | min / max, when finite |
 * | Enter | Commit the draft |
 *
 * The value is a `number | null` — `null` is "empty", and `NaN` never escapes. While
 * typing, the draft is free text; it commits on Enter or blur, when it is parsed,
 * rounded to `precision`, and (by default) clamped into range. Rejected drafts revert
 * to the last good value rather than lingering as text that looks accepted.
 *
 * The stepper buttons are hidden from assistive tech: the input itself is the
 * spinbutton, already fully keyboard-operable, and announcing three controls for one
 * value is noise.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value: valueProp,
    defaultValue = null,
    onValueChange,
    min,
    max,
    step = 1,
    precision,
    size = 'md',
    invalid,
    clampOnBlur = true,
    allowMouseWheel = false,
    disabled,
    readOnly,
    className,
    onKeyDown,
    onBlur,
    onFocus,
    ...rest
  },
  ref,
) {
  const [value, setValue] = useControllableState<number | null>({
    value: valueProp,
    defaultValue,
    onChange: (next) => onValueChange?.(next),
  })

  // The draft is what the user is typing; the value is what has been committed. Keeping
  // them separate is what lets someone type "-", "1.", "0.0" on the way to a number.
  const [draft, setDraft] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const repeat = useRef<ReturnType<typeof setInterval> | null>(null)

  // The repeat interval must not survive the component: pointer-down with no pointer-up
  // (the element unmounting mid-press) left it running forever. Caught by leaks.test.tsx.
  useEffect(
    () => () => {
      if (repeat.current !== null) clearInterval(repeat.current)
    },
    [],
  )

  const clampValue = (n: number): number => {
    let out = n
    if (typeof min === 'number') out = Math.max(min, out)
    if (typeof max === 'number') out = Math.min(max, out)
    return out
  }

  const round = (n: number): number =>
    typeof precision === 'number' ? Number(n.toFixed(precision)) : n

  const commit = (text: string, clamp: boolean) => {
    const parsed = parse(text)
    if (parsed === null) {
      // Empty stays empty; garbage reverts. Text that looks accepted but is not stored
      // is the worst of both worlds.
      setValue(text.trim() === '' ? null : value)
    } else {
      setValue(round(clamp ? clampValue(parsed) : parsed))
    }
    setDraft(null)
  }

  const nudge = (direction: 1 | -1, multiplier = 1) => {
    if (disabled || readOnly) return
    const base = value ?? (typeof min === 'number' ? min : 0)
    setValue(round(clampValue(base + direction * step * multiplier)))
    setDraft(null)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        nudge(1, event.shiftKey ? 10 : 1)
        return
      case 'ArrowDown':
        event.preventDefault()
        nudge(-1, event.shiftKey ? 10 : 1)
        return
      case 'Home':
        if (typeof min === 'number') {
          event.preventDefault()
          setValue(round(min))
          setDraft(null)
        }
        return
      case 'End':
        if (typeof max === 'number') {
          event.preventDefault()
          setValue(round(max))
          setDraft(null)
        }
        return
      case 'Enter':
        commit(event.currentTarget.value, clampOnBlur)
        return
      default:
    }
  }

  /** Hold-to-repeat on the steppers, with cleanup on release and unmount via pointerup. */
  const startRepeat = (direction: 1 | -1) => {
    nudge(direction)
    stopRepeat()
    repeat.current = setInterval(() => nudge(direction), 120)
  }
  const stopRepeat = () => {
    if (repeat.current !== null) {
      clearInterval(repeat.current)
      repeat.current = null
    }
  }

  const shown = draft ?? toText(value, precision)

  return (
    <span
      className={cx('vk-number-input', className)}
      data-size={size}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
    >
      <input
        ref={(node) => {
          inputRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className="vk-number-input__field"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        role="spinbutton"
        aria-valuenow={value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        // "empty", spoken, beats silence when there is no number to report.
        aria-valuetext={value === null ? 'empty' : undefined}
        aria-invalid={invalid || undefined}
        value={shown}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={(event: FocusEvent<HTMLInputElement>) => {
          commit(event.target.value, clampOnBlur)
          onBlur?.(event)
        }}
        onWheel={
          allowMouseWheel
            ? (event) => {
                if (document.activeElement !== event.currentTarget) return
                event.preventDefault()
                nudge(event.deltaY < 0 ? 1 : -1)
              }
            : undefined
        }
        {...rest}
      />
      {/*
        aria-hidden and tabIndex -1: the input IS the spinbutton and already steps from
        the keyboard. Exposing these would announce three controls for one value.
      */}
      <span className="vk-number-input__steppers" aria-hidden="true">
        <button
          type="button"
          className="vk-number-input__step"
          data-direction="up"
          tabIndex={-1}
          disabled={disabled || readOnly || (typeof max === 'number' && (value ?? 0) >= max)}
          onPointerDown={() => startRepeat(1)}
          onPointerUp={stopRepeat}
          onPointerLeave={stopRepeat}
        >
          <span className="vk-number-input__chevron" data-direction="up" />
        </button>
        <button
          type="button"
          className="vk-number-input__step"
          data-direction="down"
          tabIndex={-1}
          disabled={disabled || readOnly || (typeof min === 'number' && (value ?? 0) <= min)}
          onPointerDown={() => startRepeat(-1)}
          onPointerUp={stopRepeat}
          onPointerLeave={stopRepeat}
        >
          <span className="vk-number-input__chevron" data-direction="down" />
        </button>
      </span>
    </span>
  )
})
