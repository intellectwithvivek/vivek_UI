'use client'

import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useMemo,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'

/** A tick on the track. `label` is optional — a bare tick is often enough. */
export interface SliderMark {
  value: number
  label?: ReactNode
}

interface SliderBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  min?: number
  max?: number
  step?: number
  size?: 'sm' | 'md' | 'lg'
  tone?: 'primary' | 'success' | 'warning' | 'danger'
  /** Show the current value beside the track. */
  showValue?: boolean
  /**
   * Ticks. An explicit list, or `true` to tick every step — the automatic form is capped
   * at 21 ticks, because a 0–100 slider with `step={1}` would otherwise render a solid bar.
   */
  marks?: SliderMark[] | boolean
  disabled?: boolean
  /** Sets `aria-invalid` on the input(s). Injected by `Field`. */
  invalid?: boolean
  /** Injected by `Field`. */
  required?: boolean
  /**
   * Submits with the form. In `range` mode both thumbs submit under this one name, lower
   * first, so the server reads them with `getAll(name)`.
   */
  name?: string
  /** Formats the displayed value and `aria-valuetext` — currency, percentages, durations. */
  formatValue?: (value: number) => string
  /** Accessible name for the lower thumb in `range` mode. Default `'Minimum'`. */
  minLabel?: string
  /** Accessible name for the upper thumb in `range` mode. Default `'Maximum'`. */
  maxLabel?: string
}

export interface SliderSingleProps extends SliderBaseProps {
  range?: false
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
}

export interface SliderRangeProps extends SliderBaseProps {
  range: true
  value?: [number, number]
  defaultValue?: [number, number]
  onValueChange?: (value: [number, number]) => void
}

export type SliderProps = SliderSingleProps | SliderRangeProps

/** The public union collapsed for internal use. See the cast in the component body. */
interface SliderInternalProps extends SliderBaseProps {
  range?: boolean
  value?: number | [number, number]
  defaultValue?: number | [number, number]
  onValueChange?: (value: number | [number, number]) => void
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}

/** Percentage along the track, guarding the degenerate `min === max` slider. */
function percent(value: number, min: number, max: number): number {
  if (max <= min) return 0
  return ((clamp(value, min, max) - min) / (max - min)) * 100
}

function resolveMarks(
  marks: SliderMark[] | boolean | undefined,
  min: number,
  max: number,
  step: number,
): SliderMark[] {
  if (!marks) return []
  if (Array.isArray(marks)) return marks.filter((mark) => mark.value >= min && mark.value <= max)
  const count = step > 0 ? Math.floor((max - min) / step) + 1 : 0
  if (count < 2 || count > 21) return []
  return Array.from({ length: count }, (_, index) => ({ value: min + index * step }))
}

/**
 * A slider built on `<input type="range">`.
 *
 * The native input is the control, not a decoration behind one: it brings keyboard
 * support, the correct `slider` role with live `aria-valuenow`, touch behaviour, form
 * participation and browser autofill, none of which a div with a `role` reproduces
 * faithfully. Everything here is presentation layered on top — the track fill is a
 * gradient driven by a CSS custom property, so no JavaScript runs during a drag beyond
 * React's own state update.
 *
 * `range` mode stacks two inputs. That is not a hack around a missing two-thumb native
 * input so much as the only version that stays accessible: each thumb keeps its own
 * accessible name, its own `aria-valuenow` and its own arrow keys, which is exactly what
 * a screen-reader user needs to answer "which end am I moving?". The values are clamped
 * against each other on every change, so the lower thumb can be pushed up to the upper
 * one and stops there rather than crossing it.
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(props, ref) {
  // One deliberate widening of the public discriminated union: the variants differ only
  // in whether the value is a number or a pair, and `range` is checked before it is read.
  // `as unknown as` because `strictFunctionTypes` makes the callbacks non-comparable in
  // a single step.
  const {
    range = false,
    value,
    defaultValue,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    size = 'md',
    tone = 'primary',
    showValue,
    marks,
    disabled,
    invalid,
    required,
    name,
    formatValue,
    minLabel = 'Minimum',
    maxLabel = 'Maximum',
    className,
    style,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props as unknown as SliderInternalProps

  const baseId = useIsomorphicId(id)

  const [state, setState] = useControllableState<number | [number, number]>({
    value,
    defaultValue: defaultValue ?? (range ? [min, max] : min),
    onChange: onValueChange,
  })

  const pair = useMemo<[number, number]>(() => {
    if (Array.isArray(state)) {
      const lower = clamp(state[0], min, max)
      const upper = clamp(state[1], min, max)
      // Tolerate an inverted pair arriving from outside rather than rendering a
      // negative-width fill that reads as "nothing selected".
      return lower <= upper ? [lower, upper] : [upper, lower]
    }
    return [min, clamp(state, min, max)]
  }, [state, min, max])

  const single = Array.isArray(state) ? pair[1] : clamp(state, min, max)

  const format = useCallback(
    (input: number) => (formatValue ? formatValue(input) : `${input}`),
    [formatValue],
  )

  const onLowerChange = useCallback(
    (next: number) => {
      // The clamp is what keeps the thumbs from crossing. Doing it here rather than in
      // CSS means the reported value is always the value the user can see.
      setState([Math.min(clamp(next, min, max), pair[1]), pair[1]])
    },
    [max, min, pair, setState],
  )

  const onUpperChange = useCallback(
    (next: number) => {
      setState([pair[0], Math.max(clamp(next, min, max), pair[0])])
    },
    [max, min, pair, setState],
  )

  const from = range ? percent(pair[0], min, max) : 0
  const to = range ? percent(pair[1], min, max) : percent(single, min, max)
  const ticks = resolveMarks(marks, min, max, step)

  const sharedInputProps = {
    type: 'range' as const,
    min,
    max,
    step,
    disabled,
    'aria-invalid': invalid || undefined,
    'aria-describedby': ariaDescribedBy,
    className: 'vk-slider__input',
  }

  return (
    <div
      ref={ref}
      className={cx('vk-slider', className)}
      data-size={size}
      data-tone={tone}
      data-range={range || undefined}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      // The only inline styles: two numbers the CSS cannot derive on its own. The cast
      // is unavoidable — `CSSProperties` has no index signature for custom properties.
      style={{
        ...({ '--vk-slider-from': `${from}%`, '--vk-slider-to': `${to}%` } as CSSProperties),
        ...style,
      }}
      {...rest}
    >
      <div className="vk-slider__track">
        {range ? (
          <>
            {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: a range input has the implicit slider role, which does support aria-valuetext. */}
            <input
              {...sharedInputProps}
              id={baseId}
              data-thumb="lower"
              value={pair[0]}
              required={required}
              name={name}
              // Each thumb needs its own name. When the group already has one, compose
              // rather than replace, so the user hears "Price minimum", not "Minimum".
              aria-label={ariaLabel ? `${ariaLabel} ${minLabel.toLowerCase()}` : minLabel}
              aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
              aria-valuetext={formatValue ? format(pair[0]) : undefined}
              onChange={(event) => onLowerChange(Number(event.target.value))}
            />
            {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: a range input has the implicit slider role, which does support aria-valuetext. */}
            <input
              {...sharedInputProps}
              id={`${baseId}-max`}
              data-thumb="upper"
              value={pair[1]}
              required={required}
              name={name}
              aria-label={ariaLabel ? `${ariaLabel} ${maxLabel.toLowerCase()}` : maxLabel}
              aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
              aria-valuetext={formatValue ? format(pair[1]) : undefined}
              onChange={(event) => onUpperChange(Number(event.target.value))}
            />
          </>
        ) : (
          // biome-ignore lint/a11y/useAriaPropsSupportedByRole: `input[type="range"]` has the implicit `slider` role, which does support `aria-valuetext`.
          <input
            {...sharedInputProps}
            id={baseId}
            name={name}
            required={required}
            value={single}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-valuetext={formatValue ? format(single) : undefined}
            onChange={(event) => setState(clamp(Number(event.target.value), min, max))}
          />
        )}

        {ticks.length > 0 ? (
          // Decorative: the input already announces its value, and reading every tick
          // aloud on focus would bury it.
          <div className="vk-slider__marks" aria-hidden="true">
            {ticks.map((mark) => (
              <span
                key={mark.value}
                className="vk-slider__mark"
                data-active={
                  (mark.value >= (range ? pair[0] : min) &&
                    mark.value <= (range ? pair[1] : single)) ||
                  undefined
                }
                style={{ '--vk-slider-mark': `${percent(mark.value, min, max)}%` } as CSSProperties}
              >
                {mark.label ? <span className="vk-slider__mark-label">{mark.label}</span> : null}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {showValue ? (
        // `aria-hidden`, because this is a second rendering of `aria-valuenow`. Without
        // it a screen reader announces the number twice on every arrow press.
        <output className="vk-slider__value" htmlFor={baseId} aria-hidden="true">
          {range ? `${format(pair[0])} – ${format(pair[1])}` : format(single)}
        </output>
      ) : null}
    </div>
  )
})
