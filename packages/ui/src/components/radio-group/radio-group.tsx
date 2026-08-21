import { forwardRef, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'

export interface RadioOption {
  value: string
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  description?: ReactNode
}

/** A single radio. Usually rendered for you by `RadioGroup`. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, className, id, ...rest },
  ref,
) {
  return (
    <label className={cx('vk-radio', className)} htmlFor={id}>
      <input ref={ref} id={id} type="radio" className="vk-radio__input" {...rest} />
      <span className="vk-radio__circle" aria-hidden="true" />
      {label || description ? (
        <span className="vk-radio__text">
          {label ? <span className="vk-radio__label">{label}</span> : null}
          {description ? <span className="vk-radio__description">{description}</span> : null}
        </span>
      ) : null}
    </label>
  )
})

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  /** Shared `name` for the radios. Required for native grouping and form submission. */
  name: string
  /** Group label, rendered as the `<legend>`. */
  label?: ReactNode
  /** Options as data. Ignored when `children` is provided. */
  options?: RadioOption[]
  /** Controlled selection. */
  value?: string
  /** Uncontrolled initial selection. */
  defaultValue?: string
  onChange?: (value: string) => void
  orientation?: 'vertical' | 'horizontal'
  size?: 'sm' | 'md'
  disabled?: boolean
  required?: boolean
}

/**
 * A group of radios.
 *
 * A real `<fieldset>` with a `<legend>`, which is what gives the group its accessible
 * name with no ARIA at all, and a shared `name` so the browser handles single-selection
 * and arrow-key navigation itself. Options are passed as data, so nothing here needs
 * React context and the whole component stays server-safe.
 */
export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup(
  {
    name,
    label,
    options,
    value,
    defaultValue,
    onChange,
    orientation = 'vertical',
    size = 'md',
    disabled,
    required,
    className,
    children,
    ...rest
  },
  ref,
) {
  const controlled = value !== undefined

  return (
    <fieldset
      ref={ref}
      className={cx('vk-radio-group', className)}
      data-orientation={orientation}
      data-size={size}
      disabled={disabled}
      {...rest}
    >
      {label ? <legend className="vk-radio-group__legend">{label}</legend> : null}
      <div className="vk-radio-group__items">
        {children ??
          options?.map((option) => (
            <Radio
              key={option.value}
              name={name}
              value={option.value}
              label={option.label}
              description={option.description}
              disabled={option.disabled}
              required={required}
              {...(controlled
                ? { checked: value === option.value }
                : { defaultChecked: defaultValue === option.value })}
              onChange={onChange ? (event) => onChange(event.target.value) : undefined}
            />
          ))}
      </div>
    </fieldset>
  )
})
