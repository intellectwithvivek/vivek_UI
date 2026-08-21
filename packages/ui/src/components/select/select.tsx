import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  invalid?: boolean
  /** Options as data. Ignored when `children` is provided. */
  options?: SelectOption[]
  /** Adds a disabled first option, for the "nothing chosen yet" state. */
  placeholder?: string
}

/**
 * A native `<select>`.
 *
 * Deliberately native: it inherits the platform's own picker, which means correct
 * keyboard and touch behaviour, correct rendering inside a scroll container, and no
 * portal or positioning code. A custom listbox lands later as a separate component
 * for the cases that genuinely need one; this covers the other 90%.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', invalid, options, placeholder, className, children, ...rest },
  ref,
) {
  return (
    <div className={cx('vk-select', className)} data-size={size}>
      <select
        ref={ref}
        className="vk-select__control"
        data-invalid={invalid || undefined}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {children ??
          options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
      </select>
      <span className="vk-select__arrow" aria-hidden="true" />
    </div>
  )
})
