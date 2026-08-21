import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  /** Butt the buttons together into one seam-free control. */
  attached?: boolean
  /** Accessible name for the group, e.g. "Text alignment". */
  label?: string
}

/** Groups related buttons. `attached` joins them into a single segmented control. */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { orientation = 'horizontal', attached, label, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('vk-button-group', className)}
      data-orientation={orientation}
      data-attached={attached || undefined}
      role="group"
      aria-label={label}
      {...rest}
    />
  )
})
