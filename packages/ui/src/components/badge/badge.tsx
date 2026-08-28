import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'soft' | 'outline'
  tone?: 'primary' | 'neutral' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  /** Pill-shaped instead of rounded-rectangle. */
  pill?: boolean
}

/** A small status or category label. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'soft', tone = 'primary', size = 'sm', pill, className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx('vk-badge', className)}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      data-pill={pill || undefined}
      {...rest}
    />
  )
})
