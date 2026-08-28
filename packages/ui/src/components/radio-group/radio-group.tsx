import {
  Children,
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
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

interface Wiring {
  name: string
  required?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  controlled: boolean
}

/**
 * Give each `Radio` child the group's `name`, selection and change handler.
 *
 * Without this, the documented `children` API was decorative: a hand-written `<Radio>` got
 * no `name`, so the radios were not a native group at all and clicking one did not deselect
 * the others; no `onChange`, so the group's handler never fired; and no checked wiring, so
 * `value` and `defaultValue` on the group did nothing. The `options` prop worked and the
 * children path silently did not.
 *
 * Anything the caller set on the child wins — the group only fills in what is missing — and
 * a child's own `onChange` still runs alongside the group's.
 *
 * This reaches direct children only. A context would survive arbitrary nesting, but
 * `createContext` cannot run in a React Server Component, and turning a server-safe
 * component into a client one to support wrapping a radio in a `<div>` is the wrong trade.
 */
function wire(children: ReactNode, group: Wiring): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child) || child.type !== Radio) return child
    const element = child as ReactElement<RadioProps>
    const own = element.props
    const optionValue = typeof own.value === 'string' ? own.value : undefined

    const selection = group.controlled
      ? { checked: own.checked ?? (optionValue !== undefined && group.value === optionValue) }
      : {
          defaultChecked:
            own.defaultChecked ?? (optionValue !== undefined && group.defaultValue === optionValue),
        }

    return cloneElement(element, {
      name: own.name ?? group.name,
      required: own.required ?? group.required,
      ...selection,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        own.onChange?.(event)
        group.onValueChange?.(event.target.value)
      },
    })
  })
}

export interface RadioGroupProps extends HTMLAttributes<HTMLFieldSetElement> {
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
  /**
   * Reports the selected value. Named `onValueChange`, not `onChange`, because the DOM
   * already owns `onChange` with an event signature — redefining it breaks the mental
   * model and the types for anyone spreading input props.
   */
  onValueChange?: (value: string) => void
  orientation?: 'vertical' | 'horizontal'
  size?: 'sm' | 'md' | 'lg'
  /**
   * Marks the control invalid: sets `aria-invalid` and a `data-invalid` hook for styling.
   * Every other form control in the library takes this; these two were the exceptions, so a
   * form could not show a consistent error state across its rows.
   */
  invalid?: boolean
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
    onValueChange,
    orientation = 'vertical',
    size = 'md',
    invalid,
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
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      disabled={disabled}
      {...rest}
    >
      {label ? <legend className="vk-radio-group__legend">{label}</legend> : null}
      <div className="vk-radio-group__items">
        {children
          ? wire(children, { name, required, value, defaultValue, onValueChange, controlled })
          : options?.map((option) => (
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
                onChange={onValueChange ? (event) => onValueChange(event.target.value) : undefined}
              />
            ))}
      </div>
    </fieldset>
  )
})
