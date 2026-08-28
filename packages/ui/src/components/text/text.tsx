import { type ElementType, forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Defaults to `p`. Use `span` for inline text. */
  as?: ElementType
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** `muted` for secondary copy, `danger` for errors. */
  tone?: 'neutral' | 'muted' | 'danger' | 'primary'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'start' | 'center' | 'end'
  truncate?: boolean
  /** Clamp to N lines with an ellipsis. */
  lineClamp?: number
}

/**
 * Body text.
 *
 * `as` retags it — `p` by default, `span` for inline. `tone`, `size`, `weight` and `align`
 * cover the choices that would otherwise become one-off CSS, and `truncate` or
 * `lineClamp` handle overflow without needing a wrapper element.
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as: Component = 'p',
    size = 'md',
    tone = 'neutral',
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
