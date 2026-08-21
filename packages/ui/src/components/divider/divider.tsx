import { forwardRef, type HTMLAttributes, type ReactNode, type Ref } from 'react'
import { cx } from '../../utils/cx'

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  orientation?: 'horizontal' | 'vertical'
  /** Optional inline label, centred on the rule. */
  label?: ReactNode
}

/**
 * A separator.
 *
 * Without a label this is a real `<hr>` — "thematic break" is exactly what it means,
 * and it carries an implicit `separator` role, so no hand-written ARIA is needed.
 * With a label the visible text already conveys the break in document order, so the
 * wrapper stays role-free: `role="separator"` would advertise the focusable splitter
 * contract (`aria-valuenow` and friends) that a decorative rule does not implement.
 */
export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  { orientation = 'horizontal', label, className, children, ...rest },
  ref,
) {
  const content = label ?? children

  if (content) {
    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        className={cx('vk-divider', className)}
        data-orientation={orientation}
        data-labelled="true"
        {...rest}
      >
        <span className="vk-divider__label">{content}</span>
      </div>
    )
  }

  return (
    <hr
      ref={ref as Ref<HTMLHRElement>}
      className={cx('vk-divider', className)}
      data-orientation={orientation}
      {...rest}
    />
  )
})
