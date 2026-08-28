import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  size?: 'sm' | 'md' | 'lg'
}

/** A keyboard key, for documenting shortcuts. */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { size = 'sm', className, ...rest },
  ref,
) {
  return <kbd ref={ref} className={cx('vk-kbd', className)} data-size={size} {...rest} />
})
