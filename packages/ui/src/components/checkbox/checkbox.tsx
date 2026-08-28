import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visible label. Omit it and supply `aria-label` instead. */
  label?: ReactNode
  /** Secondary line under the label. */
  description?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  invalid?: boolean
}

/**
 * A checkbox built on the native input.
 *
 * The input itself is the accessible control. It is visually hidden but never
 * `display: none`, so it keeps focus, keyboard toggling, form participation and the
 * browser's own validation. The visible box is a sibling driven by `:checked`.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, size = 'md', invalid, className, id, ...rest },
  ref,
) {
  return (
    <label className={cx('vk-checkbox', className)} data-size={size} htmlFor={id}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className="vk-checkbox__input"
        data-invalid={invalid || undefined}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      <span className="vk-checkbox__box" aria-hidden="true" />
      {label || description ? (
        <span className="vk-checkbox__text">
          {label ? <span className="vk-checkbox__label">{label}</span> : null}
          {description ? <span className="vk-checkbox__description">{description}</span> : null}
        </span>
      ) : null}
    </label>
  )
})
