'use client'

import {
  type FormEvent,
  type FormHTMLAttributes,
  forwardRef,
  type ReactNode,
  useRef,
  useState,
} from 'react'
import { cx } from '../../utils/cx'

/** Field errors, keyed by the control's `name`. An empty object means "all clear". */
export type FormErrors = Record<string, string>

export type FormValues = Record<string, FormDataEntryValue>

export interface FormState {
  /** Current field errors, native and custom merged. */
  errors: FormErrors
  /** True while an async `onSubmit` is pending. Wire it to the submit button. */
  submitting: boolean
  /**
   * Whatever a rejected `onSubmit` threw, or `null`. A failed API call is a state the
   * layout must be able to render — leaving it as an unhandled rejection surfaces it in
   * the console and nowhere the user looks. Cleared on the next submit attempt.
   */
  submitError: unknown
}

export interface FormProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children' | 'noValidate'> {
  /**
   * Called only when validation passes. `values` is the whole form as
   * `new FormData(form)` sees it — which means it also works for controls this library
   * did not render. Return a promise and `submitting` tracks it.
   */
  onSubmit?: (values: FormValues, event: FormEvent<HTMLFormElement>) => void | Promise<void>
  /**
   * Cross-field rules, run after the native ones. Return `{ fieldName: message }` for
   * anything wrong, or `null` when the values pass. Native attributes (`required`,
   * `minLength`, `type="email"`, `pattern`) already validate for free — this is only for
   * what attributes cannot express: matching passwords, at-least-one-of, date ranges.
   */
  validate?: (values: FormValues) => FormErrors | null
  /**
   * Readable replacements for the browser's messages, per field, per ValidityState key:
   * `{ email: { valueMissing: 'We need an email to reach you' } }`. Unlisted failures
   * fall back to the browser's own wording, which is localised but often stiff.
   */
  messages?: Record<string, Partial<Record<string, string>>>
  /** Plain children, or a render function that receives the full FormState. */
  children: ReactNode | ((state: FormState) => ReactNode)
}

/** ValidityState flags, in the order worth reporting: the most specific first. */
const VALIDITY_KEYS = [
  'valueMissing',
  'typeMismatch',
  'patternMismatch',
  'tooShort',
  'tooLong',
  'rangeUnderflow',
  'rangeOverflow',
  'stepMismatch',
  'badInput',
] as const

function nativeErrors(
  form: HTMLFormElement,
  messages: FormProps['messages'],
): { errors: FormErrors; firstInvalid: HTMLElement | null } {
  const errors: FormErrors = {}
  let firstInvalid: HTMLElement | null = null

  for (const element of Array.from(form.elements)) {
    const control = element as HTMLInputElement
    if (!control.name || control.disabled || typeof control.checkValidity !== 'function') continue
    if (control.checkValidity()) continue

    const key = VALIDITY_KEYS.find((flag) => control.validity[flag])
    const custom = key ? messages?.[control.name]?.[key] : undefined
    errors[control.name] = custom ?? control.validationMessage
    // Document order — form.elements is already ordered, so the first hit is the one
    // focus should land on.
    if (!firstInvalid) firstInvalid = control
  }
  return { errors, firstInvalid }
}

/**
 * Validation and submission orchestration over a native `<form>`.
 *
 * The design principle: **the browser already knows how to validate — it just reports
 * badly.** `required`, `minLength`, `type="email"` and `pattern` all work here exactly as
 * they do on plain HTML; this component intercepts submit, collects every failure via the
 * constraint validation API, swaps in readable `messages`, focuses the first invalid
 * control, and hands the errors to your layout. `noValidate` is set on the element so the
 * browser's bubbles never fight the rendered messages.
 *
 * ```tsx
 * <Form
 *   validate={(v) => (v.password !== v.confirm ? { confirm: 'Passwords differ' } : null)}
 *   onSubmit={async (values) => api.signup(values)}
 * >
 *   {({ errors, submitting }) => (
 *     <>
 *       <Field label="Email" error={errors.email}>
 *         <Input name="email" type="email" required />
 *       </Field>
 *       <Button type="submit" loading={submitting}>Create account</Button>
 *     </>
 *   )}
 * </Form>
 * ```
 *
 * Errors clear as a whole on the next submit attempt — per-keystroke clearing sounds
 * friendly and in practice makes messages vanish while they are being read.
 *
 * **No dependency, no context, no controller.** State lives in the DOM (where the values
 * already are) and one `useState` for the report. Anything needing field-level
 * subscriptions at 60fps is a different tool; this covers the forms 95% of products ship.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { onSubmit, validate, messages, children, className, ...rest },
  ref,
) {
  const [state, setState] = useState<FormState>({
    errors: {},
    submitting: false,
    submitError: null,
  })
  const formRef = useRef<HTMLFormElement | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget

    const values = Object.fromEntries(new FormData(form)) as FormValues
    const native = nativeErrors(form, messages)
    const custom = validate?.(values) ?? null
    // Native failures win per field: "required" beats a cross-field rule about a value
    // that does not exist yet.
    const errors: FormErrors = { ...custom, ...native.errors }

    if (Object.keys(errors).length > 0) {
      setState({ errors, submitting: false, submitError: null })
      const focusTarget =
        native.firstInvalid ??
        (form.elements.namedItem(Object.keys(errors)[0] ?? '') as HTMLElement | null)
      focusTarget?.focus()
      return
    }

    if (!onSubmit) {
      setState({ errors: {}, submitting: false, submitError: null })
      return
    }

    setState({ errors: {}, submitting: true, submitError: null })
    try {
      await onSubmit(values, event)
      if (formRef.current) setState((s) => ({ ...s, submitting: false }))
    } catch (thrown) {
      // Caught, not swallowed: the failure lands in state for the layout to render. The
      // alternative — letting it reject unhandled — puts the error in the console and
      // nowhere the user is looking.
      //
      // Guarded: the submit may have unmounted the form (a successful login navigating
      // away), and setting state after unmount is a leak signal.
      if (formRef.current) setState((s) => ({ ...s, submitting: false, submitError: thrown }))
    }
  }

  return (
    <form
      ref={(node) => {
        formRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={cx('vk-form', className)}
      noValidate
      onSubmit={handleSubmit}
      {...rest}
    >
      {typeof children === 'function' ? children(state) : children}
    </form>
  )
})
