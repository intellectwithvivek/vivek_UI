import { type ElementType, forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  /** Max content width. Defaults to `lg` (64rem). */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Remove the horizontal gutter. */
  flush?: boolean
}

/** Centres content and caps its width, with a responsive gutter. */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  { as: Component = 'div', size = 'lg', flush, className, ...rest },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cx('vk-container', className)}
      data-size={size}
      data-flush={flush || undefined}
      {...rest}
    />
  )
})
