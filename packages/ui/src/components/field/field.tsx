'use client'

import {
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
} from 'react'
import { cx } from '../../utils/cx'

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Visible label, wired to the control with `htmlFor`. */
  label?: ReactNode
  /** Hint text, wired via `aria-describedby`. */
  help?: ReactNode
  /**
   * Error text. When set, the control gets `aria-invalid` and the message replaces
   * the hint in `aria-describedby`, so a screen reader hears the problem, not the tip.
   */
  error?: ReactNode
  /** Marks the label and sets `required` on the control. */
  required?: boolean
  size?: 'sm' | 'md'
  /** Explicit id for the control. One is generated when omitted. */
  id?: string
  /** Exactly one form control: `Input`, `Textarea`, `Select`, and so on. */
  children: ReactNode
}

/**
 * Wires a label, hint and error message to a form control.
 *
 * This is the accessibility boilerplate almost every codebase gets wrong: `htmlFor`
 * pointing at the wrong id, error text that is visible but never announced, or an
 * `aria-describedby` listing both the hint and the error at once. Field derives all of
 * it from one id and injects the attributes onto its child, so `Input` and friends stay
 * plain server-safe components with no context to consume.
 *
 * It is a client component only because `useId` is a hook. Pass `id` explicitly and the
 * generated value is unused.
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, help, error, required, size = 'md', id, className, children, ...rest },
  ref,
) {
  const generatedId = useId()
  const controlId = id ?? `vk-field-${generatedId}`
  const helpId = `${controlId}-help`
  const errorId = `${controlId}-error`

  const invalid = Boolean(error)
  // Point at the error when there is one, otherwise the hint. Announcing both means
  // the user hears the tip before the reason their input was rejected.
  const describedBy = invalid ? (error ? errorId : undefined) : help ? helpId : undefined

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id: controlId,
        required: (children.props as Record<string, unknown>).required ?? required,
        invalid: (children.props as Record<string, unknown>).invalid ?? (invalid || undefined),
        'aria-describedby':
          [(children.props as Record<string, unknown>)['aria-describedby'], describedBy]
            .filter(Boolean)
            .join(' ') || undefined,
      })
    : children

  return (
    <div
      ref={ref}
      className={cx('vk-field', className)}
      data-size={size}
      data-invalid={invalid || undefined}
      {...rest}
    >
      {label ? (
        <label className="vk-field__label" htmlFor={controlId}>
          {label}
          {required ? (
            <span className="vk-field__required" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {control}

      {/*
        The error is a live region so a validation message that appears after submit is
        announced, not silently rendered. The hint is static: it is there from the start.
      */}
      {invalid ? (
        <p className="vk-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : help ? (
        <p className="vk-field__help" id={helpId}>
          {help}
        </p>
      ) : null}
    </div>
  )
})
