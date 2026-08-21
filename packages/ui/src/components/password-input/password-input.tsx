'use client'

import { type ChangeEvent, forwardRef, type InputHTMLAttributes, useCallback, useMemo } from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'

/** One requirement in the checklist. `test` is called with the current value only. */
export interface PasswordRule {
  /** Stable key. Falls back to `label`, which is normally unique anyway. */
  id?: string
  /** Shown in the checklist and announced as met or unmet. */
  label: string
  test: (value: string) => boolean
}

/** 0 = nothing typed, 1 = weak … 4 = strong. */
export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'defaultValue'> {
  size?: 'sm' | 'md' | 'lg'
  /** Sets `aria-invalid` on the input. Injected by `Field`. */
  invalid?: boolean
  /** Controlled value. */
  value?: string
  /** Uncontrolled initial value. */
  defaultValue?: string
  /** Called with the new value on every edit, in both modes. */
  onValueChange?: (value: string) => void
  /** Show the strength meter. Uses `rules` when given, otherwise a built-in set. */
  strength?: boolean
  /** The requirements to check and list. Also drives the meter. */
  rules?: PasswordRule[]
  /** Controlled reveal state. */
  visible?: boolean
  /** Initial reveal state while uncontrolled. Default `false`. */
  defaultVisible?: boolean
  onVisibleChange?: (visible: boolean) => void
  /** Accessible name for the toggle while hidden. Default `'Show password'`. */
  showLabel?: string
  /** Accessible name for the toggle while shown. Default `'Hide password'`. */
  hideLabel?: string
}

/**
 * The fallback checklist, used when `strength` is on and no `rules` were given.
 *
 * Composition rules, not a dictionary or entropy estimate. A real strength estimator
 * needs a wordlist, and shipping one would break the zero-dependency rule — so this is
 * honest about being a hint rather than pretending to a score it cannot compute.
 */
const DEFAULT_RULES: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
  {
    id: 'case',
    label: 'Upper and lower case',
    test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  { id: 'number', label: 'A number', test: (value) => /\d/.test(value) },
  { id: 'symbol', label: 'A symbol', test: (value) => /[^\w\s]/.test(value) },
]

const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'] as const

/**
 * A password field with a reveal toggle and an optional strength meter.
 *
 * **The value never leaves the input.** It is not written to a `data-*` attribute, an
 * `aria-valuetext`, a title, or the console — not even in development. The only things
 * derived from it are booleans (which rules pass) and one small integer (the level).
 * That matters more than it sounds: `data-*` attributes show up in DOM snapshots, error
 * reporters and session-replay tools, which is exactly how passwords end up in logs.
 *
 * The toggle is a real `<button>` with `aria-pressed`, not a checkbox styled as an icon
 * and not a `div` with a click handler. `aria-pressed` is what makes a screen reader
 * announce the state change on the same element the user just activated; a button whose
 * accessible name flips between "Show" and "Hide" without it leaves them guessing which
 * state they are now in.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      size = 'md',
      invalid,
      value,
      defaultValue,
      onValueChange,
      onChange,
      strength,
      rules,
      visible,
      defaultVisible = false,
      onVisibleChange,
      showLabel = 'Show password',
      hideLabel = 'Hide password',
      className,
      style,
      id,
      required,
      disabled,
      autoComplete = 'current-password',
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) {
    const baseId = useIsomorphicId(id)
    const rulesId = `${baseId}-rules`

    const [text, setText] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? '',
      onChange: onValueChange,
    })
    const [revealed, setRevealed] = useControllableState<boolean>({
      value: visible,
      defaultValue: defaultVisible,
      onChange: onVisibleChange,
    })

    const activeRules = useMemo(
      () => (rules && rules.length > 0 ? rules : strength ? DEFAULT_RULES : []),
      [rules, strength],
    )

    /** Booleans only — no slice of the value is ever kept outside the input. */
    const results = useMemo(
      () => activeRules.map((rule) => ({ rule, met: text.length > 0 && rule.test(text) })),
      [activeRules, text],
    )
    const metCount = results.filter((result) => result.met).length

    const level: PasswordStrengthLevel = useMemo(() => {
      if (text.length === 0 || results.length === 0) return 0
      const ratio = metCount / results.length
      return Math.max(1, Math.ceil(ratio * 4)) as PasswordStrengthLevel
    }, [metCount, results.length, text.length])

    const strengthLabel = level === 0 ? '' : (STRENGTH_LABELS[level - 1] ?? '')

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value)
        onChange?.(event)
      },
      [onChange, setText],
    )

    // The checklist appears only when the caller supplied rules. `strength` alone gets
    // the meter: the built-in rules are a scoring heuristic, not a contract worth
    // publishing to the user as a to-do list.
    const showRules = rules !== undefined && rules.length > 0
    const describedBy = [ariaDescribedBy, showRules ? rulesId : undefined].filter(Boolean).join(' ')

    return (
      <div
        className={cx('vk-password', className)}
        style={style}
        data-size={size}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
      >
        <div className="vk-password__control">
          <input
            ref={ref}
            id={baseId}
            type={revealed ? 'text' : 'password'}
            className="vk-input vk-password__input"
            data-size={size}
            data-invalid={invalid || undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy || undefined}
            autoComplete={autoComplete}
            required={required}
            disabled={disabled}
            value={text}
            onChange={handleChange}
            {...rest}
          />
          <button
            type="button"
            className="vk-password__toggle"
            aria-pressed={revealed}
            aria-label={revealed ? hideLabel : showLabel}
            aria-controls={baseId}
            disabled={disabled}
            onClick={() => setRevealed(!revealed)}
          >
            <span
              className="vk-password__eye"
              data-open={revealed || undefined}
              aria-hidden="true"
            />
          </button>
        </div>

        {strength ? (
          <div className="vk-password__strength">
            {/* Decorative: the live region below carries the same information as words. */}
            <div className="vk-password__meter" data-level={level} aria-hidden="true">
              <span className="vk-password__segment" />
              <span className="vk-password__segment" />
              <span className="vk-password__segment" />
              <span className="vk-password__segment" />
            </div>
            {/*
              Polite, so it coalesces instead of interrupting on every keystroke. The
              text is a word and a count — never any part of the password itself.
            */}
            <p className="vk-password__level" aria-live="polite">
              {level === 0
                ? ''
                : `Password strength: ${strengthLabel}. ${metCount} of ${results.length} requirements met.`}
            </p>
          </div>
        ) : null}

        {showRules ? (
          <ul className="vk-password__rules" id={rulesId}>
            {results.map(({ rule, met }) => (
              <li
                key={rule.id ?? rule.label}
                className="vk-password__rule"
                data-met={met || undefined}
              >
                <span className="vk-password__tick" aria-hidden="true" />
                {rule.label}
                {/* The state has to be in the text: colour and a tick are not readable. */}
                <span className="vk-password__sr">{met ? ' — met' : ' — not met'}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  },
)
