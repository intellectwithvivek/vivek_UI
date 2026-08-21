'use client'

import { type CSSProperties, forwardRef, type HTMLAttributes, type ReactNode, useMemo } from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'

export interface RatingProps
  extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'defaultValue' | 'onChange'> {
  /** Controlled value. `0` means "not rated". */
  value?: number
  /** Uncontrolled initial value. Default `0`. */
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Number of icons. Default `5`. */
  max?: number
  /** Allow half steps — 0.5, 1, 1.5 … */
  allowHalf?: boolean
  /** Render as static output: no radios, no keyboard target, no form value. */
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** The glyph. Defaults to a CSS-drawn star, so no icon package is needed. */
  icon?: ReactNode
  /** Group label, rendered as the `<legend>`. Falls back to `aria-label`. */
  label?: ReactNode
  /** Shared radio `name`. Generated when omitted, so grouping always works. */
  name?: string
  disabled?: boolean
  /** Sets `aria-invalid` on the group. Injected by `Field`. */
  invalid?: boolean
  /** Injected by `Field`. Also suppresses the "no rating" option. */
  required?: boolean
  /**
   * Offer a focusable "no rating" radio, so the keyboard can clear a value that native
   * radios otherwise make permanent. Default `true` unless `required`.
   */
  allowClear?: boolean
  /** Accessible name for one option and for the read-only summary. */
  formatLabel?: (value: number, max: number) => string
}

function defaultFormatLabel(value: number, max: number): string {
  if (value === 0) return 'No rating'
  return `${value} of ${max}`
}

/**
 * A star rating that is a real radio group.
 *
 * The temptation is a row of buttons with `aria-label`s and a hand-rolled keyboard map.
 * Radios are strictly better: arrow-key navigation, single-selection, the group's
 * accessible name from the `<legend>`, `:checked` styling, form submission and browser
 * autofill all come from the platform, and the only code left is the maths that turns a
 * value into a fill percentage.
 *
 * The visuals are entirely CSS. Two layers of icons — a muted one and an accent one —
 * with the accent layer clipped to a percentage width, which is what makes `allowHalf`
 * (and any other fraction that arrives from a server-side average) render exactly rather
 * than snapping. The radios sit invisibly on top as hit zones.
 *
 * `readOnly` deliberately renders something different: an `role="img"` with a single
 * accessible name. A read-only radio group is a contradiction — `readonly` is ignored on
 * radios by every browser — and six unusable tab stops is worse than one static label.
 */
export const Rating = forwardRef<HTMLFieldSetElement, RatingProps>(function Rating(
  {
    value,
    defaultValue,
    onValueChange,
    max = 5,
    allowHalf,
    readOnly,
    size = 'md',
    icon,
    label,
    name,
    disabled,
    invalid,
    required,
    allowClear,
    formatLabel = defaultFormatLabel,
    className,
    style,
    id,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const baseId = useIsomorphicId(id)
  const groupName = name ?? `${baseId}-rating`

  const [rating, setRating] = useControllableState<number>({
    value,
    defaultValue: defaultValue ?? 0,
    onChange: onValueChange,
  })

  const steps = useMemo(() => {
    const increment = allowHalf ? 0.5 : 1
    const count = Math.max(0, Math.round(max / increment))
    return Array.from({ length: count }, (_, index) => (index + 1) * increment)
  }, [allowHalf, max])

  const clamped = Math.min(Math.max(Number.isFinite(rating) ? rating : 0, 0), max)
  const fill = max > 0 ? (clamped / max) * 100 : 0
  const canClear = allowClear ?? !required

  const icons = (
    <>
      {Array.from({ length: max }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: identical decorative glyphs; the index *is* the identity.
        <span key={index} className="vk-rating__icon">
          {icon ?? <span className="vk-rating__star" />}
        </span>
      ))}
    </>
  )

  const layers = (
    <>
      <span className="vk-rating__layer" data-layer="base" aria-hidden="true">
        {icons}
      </span>
      <span className="vk-rating__layer" data-layer="fill" aria-hidden="true">
        {icons}
      </span>
    </>
  )

  const controlStyle = { '--vk-rating-fill': `${fill}%` } as CSSProperties

  if (readOnly) {
    return (
      <fieldset
        ref={ref}
        id={baseId}
        className={cx('vk-rating', className)}
        style={style}
        data-size={size}
        data-readonly=""
        data-invalid={invalid || undefined}
        aria-describedby={ariaDescribedBy}
        {...rest}
      >
        {label ? <legend className="vk-rating__legend">{label}</legend> : null}
        {/* One name for the whole thing, because there is nothing to interact with. */}
        <span
          className="vk-rating__control"
          style={controlStyle}
          role="img"
          aria-label={formatLabel(clamped, max)}
        >
          {layers}
        </span>
      </fieldset>
    )
  }

  return (
    <fieldset
      ref={ref}
      id={baseId}
      className={cx('vk-rating', className)}
      style={style}
      data-size={size}
      data-invalid={invalid || undefined}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      aria-describedby={ariaDescribedBy}
      // The legend is the group's name when there is one; otherwise fall back to a
      // label, because a radio group with no name is an axe violation.
      aria-label={label ? undefined : (ariaLabel ?? 'Rating')}
      {...rest}
    >
      {label ? <legend className="vk-rating__legend">{label}</legend> : null}

      <span className="vk-rating__control" style={controlStyle}>
        {layers}

        {canClear ? (
          // Visually hidden but focusable: without it a keyboard user who picks a rating
          // by mistake can never get back to "unrated", since radios do not uncheck.
          <label className="vk-rating__clear">
            <input
              type="radio"
              className="vk-rating__input"
              name={groupName}
              value="0"
              checked={clamped === 0}
              required={required}
              onChange={() => setRating(0)}
            />
            <span className="vk-rating__sr">{formatLabel(0, max)}</span>
          </label>
        ) : null}

        {steps.map((step, index) => (
          <label
            key={step}
            className="vk-rating__item"
            data-half={allowHalf && index % 2 === 0 ? '' : undefined}
            style={
              {
                '--vk-rating-index': `${index}`,
                '--vk-rating-steps': `${steps.length}`,
              } as CSSProperties
            }
          >
            <input
              type="radio"
              className="vk-rating__input"
              name={groupName}
              value={step}
              checked={clamped === step}
              required={required}
              onChange={() => setRating(step)}
            />
            <span className="vk-rating__sr">{formatLabel(step, max)}</span>
          </label>
        ))}
      </span>
    </fieldset>
  )
})
