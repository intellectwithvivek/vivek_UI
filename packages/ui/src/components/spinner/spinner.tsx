import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /**
   * Announced to screen readers. Pass `null` for a purely decorative spinner sitting
   * next to text that already says what is happening.
   */
  label?: string | null
}

/** An indeterminate loading indicator. Inherits `currentColor`. */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', label = 'Loading', className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx('vk-spinner', className)}
      data-size={size}
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : 'true'}
      {...rest}
    >
      <span className="vk-spinner__circle" aria-hidden="true" />
      {label ? <span className="vk-spinner__label">{label}</span> : null}
    </span>
  )
})
