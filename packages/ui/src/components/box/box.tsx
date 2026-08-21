import { type ElementType, forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface BoxProps extends HTMLAttributes<HTMLElement> {
  /** Render as a different element. Defaults to `div`. */
  as?: ElementType
}

/** The lowest-level layout primitive: a styled `div` you can retag. */
export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  { as: Component = 'div', className, ...rest },
  ref,
) {
  return <Component ref={ref} className={cx('vk-box', className)} {...rest} />
})
