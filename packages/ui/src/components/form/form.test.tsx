/**
 * Form.
 *
 * The contract under test: the browser's constraint validation does the field-level work,
 * Form makes the report usable — readable messages, focus on the first failure, errors
 * handed to the layout — and nothing invalid ever reaches onSubmit.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Field } from '../field'
import { Input } from '../input'
import { Form, type FormState } from './form'

function SignupForm({
  onSubmit,
  validate,
  messages,
}: {
  onSubmit?: (values: Record<string, FormDataEntryValue>) => void | Promise<void>
  validate?: (values: Record<string, FormDataEntryValue>) => Record<string, string> | null
  messages?: Record<string, Partial<Record<string, string>>>
}) {
  return (
    <Form messages={messages} onSubmit={onSubmit} validate={validate}>
      {({ errors, submitting }: FormState) => (
        <>
          <Field error={errors.email} label="Email">
            <Input name="email" required type="email" />
          </Field>
          <Field error={errors.password} label="Password">
            <Input minLength={8} name="password" required type="password" />
          </Field>
          <Field error={errors.confirm} label="Confirm">
            <Input name="confirm" type="password" />
          </Field>
          <button disabled={submitting} type="submit">
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </>
      )}
    </Form>
  )
}

const submit = () => fireEvent.click(screen.getByRole('button', { name: /create/i }))
const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })

describe('Form · native validation, made usable', () => {
  it('blocks submit on native failures and renders them through Field', () => {
    const onSubmit = vi.fn()
    render(<SignupForm onSubmit={onSubmit} />)
    submit()
    expect(onSubmit).not.toHaveBeenCalled()
    // The messages surface in the layout, wired by Field with aria-describedby.
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(/./)
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('focuses the first invalid control, in document order', () => {
    render(<SignupForm />)
    type('Email', 'valid@example.com')
    submit()
    // Email passes; password (required, empty) is now first.
    expect(screen.getByLabelText('Password')).toHaveFocus()
  })

  it('replaces browser wording with the messages map, per field per failure', () => {
    // valueMissing and typeMismatch, not tooShort: per spec, tooShort only fires for
    // values the USER typed (the dirty flag), which fireEvent cannot set in jsdom. In a
    // real browser tooShort flows through the same map - the keyboard e2e covers typing.
    render(
      <SignupForm
        messages={{
          email: {
            valueMissing: 'We need an email to reach you',
            typeMismatch: 'That does not look like an email',
          },
        }}
      />,
    )
    submit()
    expect(screen.getByText('We need an email to reach you')).toBeInTheDocument()
    type('Email', 'not-an-email')
    submit()
    expect(screen.getByText('That does not look like an email')).toBeInTheDocument()
  })

  it('suppresses the browser bubbles with noValidate — ours is the only report', () => {
    const { container } = render(<SignupForm />)
    expect(container.querySelector('form')).toHaveAttribute('novalidate')
  })
})

describe('Form · custom validation', () => {
  it('runs cross-field rules, with native failures winning per field', () => {
    const onSubmit = vi.fn()
    render(
      <SignupForm
        onSubmit={onSubmit}
        validate={(v) => (v.password !== v.confirm ? { confirm: 'Passwords differ' } : null)}
      />,
    )
    type('Email', 'a@b.co')
    type('Password', 'longenough')
    type('Confirm', 'different')
    submit()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Passwords differ')).toBeInTheDocument()
  })

  it('errors clear on the next passing submit', () => {
    const onSubmit = vi.fn()
    render(<SignupForm onSubmit={onSubmit} />)
    submit()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    type('Email', 'a@b.co')
    type('Password', 'longenough')
    submit()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid')
  })
})

describe('Form · submission', () => {
  it('hands onSubmit the whole form as FormData sees it', () => {
    const onSubmit = vi.fn()
    render(<SignupForm onSubmit={onSubmit} />)
    type('Email', 'a@b.co')
    type('Password', 'longenough')
    type('Confirm', 'longenough')
    submit()
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@b.co', password: 'longenough' }),
      expect.anything(),
    )
  })

  it('tracks an async submit as submitting, then settles', async () => {
    let release: () => void = () => {}
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (release = resolve)))
    render(<SignupForm onSubmit={onSubmit} />)
    type('Email', 'a@b.co')
    type('Password', 'longenough')
    submit()
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled()
    release()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled(),
    )
  })

  it('settles submitting even when onSubmit rejects', async () => {
    const onSubmit = vi.fn(() => Promise.reject(new Error('boom')))
    render(<SignupForm onSubmit={onSubmit} />)
    type('Email', 'a@b.co')
    type('Password', 'longenough')
    submit()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled(),
    )
  })

  it('accepts plain children too — the render function is optional', () => {
    const onSubmit = vi.fn()
    render(
      <Form onSubmit={onSubmit}>
        <label>
          Name <input name="name" />
        </label>
        <button type="submit">Go</button>
      </Form>,
    )
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'V' } })
    fireEvent.click(screen.getByRole('button'))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'V' }), expect.anything())
  })

  it('has no axe violations, pristine and failed', async () => {
    const { container } = render(<SignupForm />)
    expect(await axe(container)).toHaveNoViolations()
    submit()
    expect(await axe(container)).toHaveNoViolations()
  })
})
