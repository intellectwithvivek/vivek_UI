import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cx } from '../../utils/cx'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'solid', size = 'md', fullWidth, loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx('vk-button', className)}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      data-loading={loading || undefined}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="vk-button__spinner" aria-hidden="true" />}
      {children}
    </button>
  )
})
