'use client'

import {
  type ClipboardEvent,
  type FocusEvent,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'

export interface OTPInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'> {
  /** Number of boxes. Default `6`. */
  length?: number
  /** Controlled value. Longer strings are truncated, invalid characters dropped. */
  value?: string
  /** Uncontrolled initial value. */
  defaultValue?: string
  /** Called with the whole code on every edit, in both modes. */
  onChange?: (value: string) => void
  /** Called once the last box is filled. Handy for auto-submit. */
  onComplete?: (value: string) => void
  /** `'numeric'` (default) accepts digits; `'alphanumeric'` also accepts letters. */
  type?: 'numeric' | 'alphanumeric'
  /** Render the characters as dots. */
  mask?: boolean
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  readOnly?: boolean
  /** Sets `aria-invalid` on every box. Injected by `Field`. */
  invalid?: boolean
  /** Injected by `Field`. */
  required?: boolean
  /** Submits the whole code with the form, via one hidden input. */
  name?: string
  /** Focus the first box on mount. */
  autoFocus?: boolean
}

const NUMERIC = /[^0-9]/g
const ALPHANUMERIC = /[^0-9a-zA-Z]/g

/** Strip everything the field does not accept. Applied to typing, pasting and `value`. */
function sanitize(input: string, type: 'numeric' | 'alphanumeric'): string {
  return input.replace(type === 'numeric' ? NUMERIC : ALPHANUMERIC, '')
}

/**
 * A one-time-code field: one box per character, one string of state.
 *
 * The model is deliberately "a text field drawn as boxes" rather than N independent
 * inputs. The value is a single compact string with no gaps, and box `i` is a window onto
 * character `i`. That is what makes the awkward cases fall out instead of needing special
 * handling: pasting a whole code distributes across the boxes because it is just a string
 * assignment; a password manager or SMS autofill dumping six characters into one box hits
 * the same path; Backspace removes and shifts exactly as it would in a normal input; and
 * focus can never land beyond the first empty box, so the string can never grow a hole in
 * the middle.
 *
 * Each box is labelled with its position ("Digit 3 of 6"), because a screen-reader user
 * moving between six identically-named boxes otherwise has no idea where they are. The
 * first box carries `autoComplete="one-time-code"`, which is what lets iOS and Android
 * offer the code straight from the SMS.
 */
export const OTPInput = forwardRef<HTMLInputElement, OTPInputProps>(function OTPInput(
  {
    length = 6,
    value,
    defaultValue,
    onChange,
    onComplete,
    type = 'numeric',
    mask,
    size = 'md',
    disabled,
    readOnly,
    invalid,
    required,
    name,
    autoFocus,
    className,
    style,
    id,
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  },
  ref,
) {
  const baseId = useIsomorphicId(id)
  const boxes = useRef<Array<HTMLInputElement | null>>([])

  const [raw, setRaw] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange,
  })

  // Normalised once, here, so nothing downstream has to wonder whether the string it
  // holds is clean. A controlled caller that passes junk sees the clean version rendered
  // and gets the clean version back on the next edit.
  const code = sanitize(raw, type).slice(0, length)
  const unit = type === 'numeric' ? 'Digit' : 'Character'

  /*
   * A latest-value mirror of `code` that `commit` advances *before* it moves focus.
   * Without it the focus-clamp below reads the pre-edit value and bounces focus straight
   * back: typing "1" into box one would move to box two, whose focus handler still
   * believes the code is empty and so redirects to box one again.
   */
  const codeRef = useRef(code)
  codeRef.current = code

  const focusBox = useCallback((index: number) => {
    const clamped = Math.min(Math.max(index, 0), boxes.current.length - 1)
    const box = boxes.current[clamped]
    if (!box) return
    box.focus()
    // Selecting means the next keystroke overwrites rather than being rejected by
    // `maxLength`, which is what makes "click a box and retype it" work.
    box.select()
  }, [])

  const commit = useCallback(
    (next: string, focusIndex?: number) => {
      const clean = sanitize(next, type).slice(0, length)
      codeRef.current = clean
      setRaw(clean)
      if (focusIndex !== undefined) focusBox(focusIndex)
    },
    [focusBox, length, setRaw, type],
  )

  /** Fire `onComplete` once per transition into "full", not on every render. */
  const wasCompleteRef = useRef(code.length === length)
  useEffect(() => {
    const complete = code.length === length
    if (complete && !wasCompleteRef.current) onComplete?.(code)
    wasCompleteRef.current = complete
  }, [code, length, onComplete])

  const onBoxChange = useCallback(
    (index: number, incoming: string) => {
      if (readOnly) return
      const clean = sanitize(incoming, type)
      if (clean.length === 0) return
      // One path covers typing a single character, and autofill or a paste that the
      // browser delivered as a plain value change on one box.
      const start = Math.min(index, code.length)
      const next = code.slice(0, start) + clean + code.slice(start + clean.length)
      commit(next, Math.min(start + clean.length, length - 1))
    },
    [code, commit, length, readOnly, type],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>, index: number) => {
      if (event.defaultPrevented) return

      switch (event.key) {
        case 'Backspace': {
          if (readOnly) return
          event.preventDefault()
          if (code[index] !== undefined) {
            // Remove and shift, exactly as one input would. Focus stays put, because the
            // character that shifted in is the one the user is now looking at.
            commit(code.slice(0, index) + code.slice(index + 1), index)
          } else if (index > 0) {
            // Nothing here to delete, so step back and take that one with us.
            commit(code.slice(0, index - 1) + code.slice(index), index - 1)
          }
          return
        }
        case 'Delete': {
          if (readOnly) return
          event.preventDefault()
          commit(code.slice(0, index) + code.slice(index + 1), index)
          return
        }
        case 'ArrowLeft':
          event.preventDefault()
          focusBox(index - 1)
          return
        case 'ArrowRight':
          event.preventDefault()
          focusBox(Math.min(index + 1, code.length))
          return
        case 'Home':
          event.preventDefault()
          focusBox(0)
          return
        case 'End':
          event.preventDefault()
          focusBox(Math.min(code.length, length - 1))
          return
        default:
          return
      }
    },
    [code, commit, focusBox, length, readOnly],
  )

  const onPaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>, index: number) => {
      if (readOnly) return
      const pasted = sanitize(event.clipboardData.getData('text'), type)
      if (pasted.length === 0) return
      event.preventDefault()
      // A paste as long as the whole field replaces it outright — the user pasted "the
      // code", not "the rest of the code from here".
      const start = pasted.length >= length ? 0 : Math.min(index, code.length)
      const next = (code.slice(0, start) + pasted).slice(0, length)
      commit(next, Math.min(next.length, length - 1))
    },
    [code, commit, length, readOnly, type],
  )

  /**
   * Focus can never land past the first empty box. Without this, clicking box 5 of an
   * empty field would let the user type a character at index 4, and the value would
   * either grow a hole or silently move — both worse than the cursor snapping left.
   */
  const onBoxFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>, index: number) => {
      const allowed = Math.min(codeRef.current.length, length - 1)
      if (index > allowed) {
        focusBox(allowed)
        return
      }
      event.currentTarget.select()
    },
    [focusBox, length],
  )

  return (
    <div
      className={cx('vk-otp', className)}
      style={style}
      // A group rather than a fieldset: a fieldset brings a border box and wants a
      // legend, and the field's name comes from whatever `Field` (or the caller) supplies.
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      data-size={size}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      {...rest}
    >
      {Array.from({ length }, (_, index) => {
        const char = code[index] ?? ''
        return (
          <input
            // biome-ignore lint/suspicious/noArrayIndexKey: the boxes *are* their positions; there is no id to key on.
            key={index}
            ref={(node) => {
              boxes.current[index] = node
              // Only the first box is the component's ref target: it is the one the
              // label points at and the one a caller means by "focus the field".
              if (index !== 0) return
              if (typeof ref === 'function') ref(node)
              else if (ref) ref.current = node
            }}
            id={index === 0 ? baseId : `${baseId}-${index}`}
            className="vk-otp__box"
            type={mask ? 'password' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            // Only the first box advertises the code, so the platform fills the field
            // once rather than offering the same code six times.
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={1}
            pattern={type === 'numeric' ? '[0-9]*' : '[0-9A-Za-z]*'}
            aria-label={`${unit} ${index + 1} of ${length}`}
            aria-invalid={invalid || undefined}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            // biome-ignore lint/a11y/noAutofocus: opt-in only, and a code field is normally the sole purpose of the screen it appears on.
            autoFocus={autoFocus && index === 0}
            data-filled={char ? '' : undefined}
            value={char}
            onChange={(event) => onBoxChange(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            onPaste={(event) => onPaste(event, index)}
            onFocus={(event) => onBoxFocus(event, index)}
          />
        )
      })}

      {/* One value, one form field. The boxes themselves carry no `name`. */}
      {name ? <input type="hidden" name={name} value={code} /> : null}
    </div>
  )
})
