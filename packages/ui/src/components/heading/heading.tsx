import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic heading level, rendered as `h1`–`h6`. Defaults to `2`. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  /**
   * Visual size, independent of `level`. Lets you keep a correct document outline
   * without being forced into its default type scale — the usual reason people reach
   * for the wrong heading tag.
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero'
  align?: 'start' | 'center' | 'end'
  /** Clamp to a single line with an ellipsis. */
  truncate?: boolean
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level = 2, size, align, truncate, className, ...rest },
  ref,
) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  const DEFAULT_SIZE = { 1: 'hero', 2: '2xl', 3: 'xl', 4: 'lg', 5: 'md', 6: 'sm' } as const

  return (
    <Tag
      ref={ref}
      className={cx('vk-heading', className)}
      data-size={size ?? DEFAULT_SIZE[level]}
      data-align={align}
      data-truncate={truncate || undefined}
      {...rest}
    />
  )
})
