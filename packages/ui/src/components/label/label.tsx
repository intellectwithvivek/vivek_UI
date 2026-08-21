import { forwardRef, type LabelHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  size?: 'sm' | 'md'
  /** Show a required marker. Purely visual — set `required` on the control too. */
  required?: boolean
}

/**
 * A form label.
 *
 * Associate it with `htmlFor`, or let `Field` wire it for you. The `required` marker is
 * `aria-hidden`: the control's own `required` attribute is what assistive technology
 * reads, and announcing "star" on every field is noise.
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { size = 'sm', required, className, children, ...rest },
  ref,
) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor arrives via ...rest, so no static check can see the association
    <label ref={ref} className={cx('vk-label', className)} data-size={size} {...rest}>
      {children}
      {required ? (
        // aria-hidden: the control's own `required` is what assistive tech reads.
        // Without this the asterisk is announced as "star" on every field.
        <span className="vk-label__required" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  )
})
