import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  description?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /**
   * Marks the control invalid: sets `aria-invalid` and a `data-invalid` hook for styling.
   * Every other form control in the library takes this; these two were the exceptions, so a
   * form could not show a consistent error state across its rows.
   */
  invalid?: boolean
  /** Put the control after the label instead of before it. */
  labelPosition?: 'start' | 'end'
}

/**
 * An on/off toggle.
 *
 * A native checkbox with `role="switch"`, so it participates in forms and keyboard
 * interaction for free while announcing "on"/"off" rather than "checked". A switch
 * takes effect immediately; use `Checkbox` for anything that needs a submit.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, size = 'md', invalid, labelPosition = 'end', className, id, ...rest },
  ref,
) {
  return (
    <label
      className={cx('vk-switch', className)}
      data-size={size}
      data-invalid={invalid || undefined}
      data-label-position={labelPosition}
      htmlFor={id}
    >
      <input
        aria-invalid={invalid || undefined}
        ref={ref}
        id={id}
        type="checkbox"
        // biome-ignore lint/a11y/useAriaPropsForRole: a checkbox's checked state maps to aria-checked implicitly; writing it by hand could desync
        role="switch"
        className="vk-switch__input"
        {...rest}
      />
      <span className="vk-switch__track" aria-hidden="true">
        <span className="vk-switch__thumb" />
      </span>
      {label || description ? (
        <span className="vk-switch__text">
          {label ? <span className="vk-switch__label">{label}</span> : null}
          {description ? <span className="vk-switch__description">{description}</span> : null}
        </span>
      ) : null}
    </label>
  )
})
