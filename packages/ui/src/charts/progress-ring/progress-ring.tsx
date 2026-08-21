import { type CSSProperties, forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { clamp, f, isNum, num } from '../internal/scale'

export interface ProgressRingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Current value. Out-of-range and non-finite input is clamped, never NaN. */
  value?: number
  max?: number
  /** Diameter in px. The ring scales down responsively but never past this. */
  size?: number
  /** Stroke width in px. Clamped so it can never exceed the radius. */
  thickness?: number
  /** Accessible name, e.g. "Storage used". */
  label?: string
  /** Percentage in the middle of the ring. */
  showValue?: boolean
  /** Arbitrary centre content, e.g. a big number over a caption. Wins over `showValue`. */
  children?: ReactNode
  /** Any CSS colour for the filled arc. Defaults to the `--vk-chart-1` token. */
  color?: string
  /** Any CSS colour for the unfilled track. */
  trackColor?: string
  /** Formats the centre percentage. Must be locale-stable to stay hydration-safe. */
  formatValue?: (percent: number) => string
  /** Degrees clockwise from 12 o clock where the arc begins. */
  startAngle?: number
  /** Square off the arc ends. */
  square?: boolean
  /** SVG `<title>` for the graphic. */
  title?: string
  description?: string
}

/**
 * A circular determinate progress indicator: one SVG circle with a dash offset, which
 * is why it needs no path maths, no measurement and no client JS.
 *
 * It reports itself as a `progressbar` with `aria-valuenow`, so the number is available
 * to assistive tech whether or not the centre label is shown.
 */
export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(function ProgressRing(
  {
    value = 0,
    max = 100,
    size = 96,
    thickness = 8,
    label,
    showValue = false,
    children,
    color,
    trackColor,
    formatValue,
    startAngle = 0,
    square = false,
    title,
    description,
    className,
    style,
    ...rest
  },
  ref,
) {
  const box = isNum(size) && size > 16 ? Math.round(size) : 96
  const safeMax = isNum(max) && max > 0 ? max : 100
  const current = clamp(isNum(value) ? value : 0, 0, safeMax)
  const percent = num((current / safeMax) * 100, 2)

  const stroke = clamp(isNum(thickness) ? thickness : 8, 1, box / 2 - 1)
  const radius = Math.max(0.5, box / 2 - stroke / 2)
  const circumference = 2 * Math.PI * radius
  // The dash gap is what draws the arc: no trigonometry, and it transitions for free.
  const offset = num(circumference * (1 - percent / 100), 3)
  const rotate = num(-90 + (isNum(startAngle) ? startAngle : 0), 3)
  const center = num(box / 2)
  const text = formatValue ? formatValue(percent) : `${num(percent, 0)}%`

  // Colours travel as custom properties, not as `stroke` attributes: a presentation
  // attribute loses to any stylesheet rule, so `color` would silently do nothing.
  const vars = { ...style } as Record<string, string | number | undefined>
  if (color) vars['--vk-progress-ring-color'] = color
  if (trackColor) vars['--vk-progress-ring-track'] = trackColor

  return (
    <div
      ref={ref}
      className={cx('vk-chart', 'vk-progress-ring', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={current}
      style={vars as CSSProperties}
      {...rest}
    >
      <svg
        className="vk-progress-ring__svg"
        viewBox={`0 0 ${f(box)} ${f(box)}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
        style={{ maxWidth: `${box}px` }}
      >
        {title ? <title>{title}</title> : null}
        {description ? <desc>{description}</desc> : null}
        <circle
          className="vk-progress-ring__track"
          cx={f(center)}
          cy={f(center)}
          r={f(radius)}
          fill="none"
          strokeWidth={f(stroke)}
        />
        <circle
          className="vk-progress-ring__arc"
          cx={f(center)}
          cy={f(center)}
          r={f(radius)}
          fill="none"
          strokeWidth={f(stroke)}
          strokeLinecap={square ? 'butt' : 'round'}
          strokeDasharray={f(circumference)}
          strokeDashoffset={f(offset)}
          transform={`rotate(${f(rotate)} ${f(center)} ${f(center)})`}
        />
      </svg>
      {children ? (
        <span className="vk-progress-ring__center">{children}</span>
      ) : showValue ? (
        <span className="vk-progress-ring__center" aria-hidden="true">
          {text}
        </span>
      ) : null}
    </div>
  )
})
