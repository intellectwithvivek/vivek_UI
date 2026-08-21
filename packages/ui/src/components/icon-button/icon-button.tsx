import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cx } from '../../utils/cx'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  /** Round instead of rounded-rectangle. */
  round?: boolean
  /**
   * Required. An icon-only control has no text for a screen reader to announce, so
   * the accessible name has to come from here — this is the single most common a11y
   * bug in icon buttons, so the type system enforces it.
   */
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'ghost', size = 'md', loading, round, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx('vk-icon-button', className)}
      data-variant={variant}
      data-size={size}
      data-round={round || undefined}
      data-loading={loading || undefined}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className="vk-icon-button__spinner" aria-hidden="true" /> : children}
    </button>
  )
})
