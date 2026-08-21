import { forwardRef, type InputHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  /** Marks the field invalid and sets `aria-invalid`. */
  invalid?: boolean
}

/**
 * A text input. Native by design: no wrapper element, so `type`, `pattern`,
 * `autoComplete`, form validation and the browser's own UI all keep working.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', invalid, className, type = 'text', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cx('vk-input', className)}
      data-size={size}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
})
