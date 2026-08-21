import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Current value. Omit for an indeterminate bar. */
  value?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  tone?: 'primary' | 'success' | 'warning' | 'danger'
  /** Accessible name, e.g. "Upload progress". */
  label?: string
}

/** A determinate or indeterminate progress bar. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, size = 'md', tone = 'primary', label, className, style, ...rest },
  ref,
) {
  const indeterminate = value === undefined || value === null
  // Guard against NaN and out-of-range input rather than trusting the caller.
  const safeMax = max > 0 ? max : 100
  const clamped = indeterminate
    ? 0
    : Math.min(Math.max(Number.isFinite(value) ? (value as number) : 0, 0), safeMax)
  const percent = indeterminate ? 0 : (clamped / safeMax) * 100

  return (
    <div
      ref={ref}
      className={cx('vk-progress', className)}
      data-size={size}
      data-tone={tone}
      data-indeterminate={indeterminate || undefined}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={indeterminate ? undefined : safeMax}
      aria-valuenow={indeterminate ? undefined : clamped}
      style={{ '--vk-progress': `${percent}%`, ...style } as CSSProperties}
      {...rest}
    >
      <div className="vk-progress__bar" />
    </div>
  )
})
