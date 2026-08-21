import { type ElementType, forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Defaults to `p`. Use `span` for inline text. */
  as?: ElementType
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** `muted` for secondary copy, `danger` for errors. */
  tone?: 'default' | 'muted' | 'danger' | 'primary'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'start' | 'center' | 'end'
  truncate?: boolean
  /** Clamp to N lines with an ellipsis. */
  lineClamp?: number
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as: Component = 'p',
    size = 'md',
    tone = 'default',
    weight,
    align,
    truncate,
    lineClamp,
    className,
    style,
    ...rest
  },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cx('vk-text', className)}
      data-size={size}
      data-tone={tone}
      data-weight={weight}
      data-align={align}
      data-truncate={truncate || undefined}
      data-line-clamp={lineClamp ? 'true' : undefined}
      style={lineClamp ? { '--vk-line-clamp': lineClamp, ...style } : style}
      {...rest}
    />
  )
})
