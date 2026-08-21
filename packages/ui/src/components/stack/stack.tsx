import { type ElementType, forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export type StackGap = 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around'

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  /** Main axis. `vertical` (default) stacks children top-to-bottom. */
  direction?: 'vertical' | 'horizontal'
  /** Gap on the `--vk-space-*` scale. */
  gap?: StackGap
  align?: StackAlign
  justify?: StackJustify
  /** Allow children to wrap onto multiple lines. */
  wrap?: boolean
}

/** Flex container with a token-based gap. `Flex` is the horizontal alias. */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  {
    as: Component = 'div',
    direction = 'vertical',
    gap = 4,
    align,
    justify,
    wrap,
    className,
    ...rest
  },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cx('vk-stack', className)}
      data-direction={direction}
      data-gap={gap}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap || undefined}
      {...rest}
    />
  )
})
