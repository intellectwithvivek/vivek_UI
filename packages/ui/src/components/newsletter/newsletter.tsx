'use client'

import { type FormEvent, forwardRef, type HTMLAttributes, type ReactNode, useState } from 'react'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'

export type NewsletterStatus = 'idle' | 'submitting' | 'success' | 'error'

export interface NewsletterProps
  extends Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'title'> {
  title?: ReactNode
  description?: ReactNode
  /** Placeholder for the email field. Never a substitute for the label — see `label`. */
  placeholder?: string
  /**
   * The field's accessible name. Default `"Email address"`.
   *
   * Visually hidden by default because the layout reads as a single control, but present:
   * a placeholder disappears the moment you type, so it cannot be the only label.
   */
  label?: string
  buttonLabel?: ReactNode
  /**
   * Called with the email. Return a promise and the button shows a busy state until it
   * settles, so a slow signup cannot be double-submitted.
   */
  onSubscribe?: (email: string) => void | Promise<void>
  /** Drive the state yourself instead of letting the promise drive it. */
  status?: NewsletterStatus
  successMessage?: ReactNode
  errorMessage?: ReactNode
  /** Small print under the field — the GDPR line, usually. */
  note?: ReactNode
  layout?: 'inline' | 'stacked'
}

/**
 * An email capture form.
 *
 * Every marketing page has one and everyone rebuilds it, usually losing the same three
 * things: the label, the busy state, and the result announcement.
 *
 * - **The label exists.** A placeholder vanishes when you start typing, so a placeholder-only
 *   field leaves a screen-reader user with an unlabelled input and a sighted user with no
 *   reminder of what they are typing. It is visually hidden, not absent.
 * - **Double submission is prevented by the promise**, not by hope. Returning a promise from
 *   `onSubscribe` disables the control until it settles.
 * - **The result is announced.** Success and failure land in an `aria-live` region, because
 *   swapping the form for a tick is silent to anyone not looking at it.
 *
 * Validation is left to the browser: `type="email"` with `required` gets real, localised,
 * accessible messages for free, and a hand-rolled regex is always worse.
 */
export const Newsletter = forwardRef<HTMLFormElement, NewsletterProps>(function Newsletter(
  {
    title,
    description,
    placeholder = 'you@company.com',
    label = 'Email address',
    buttonLabel = 'Subscribe',
    onSubscribe,
    status: controlledStatus,
    successMessage = 'Thanks — please check your inbox to confirm.',
    errorMessage = 'That did not work. Please try again.',
    note,
    layout = 'inline',
    className,
    id,
    ...rest
  },
  ref,
) {
  /*
   * A generated id, not a constant. Two newsletters on one page - a hero and a footer is the
   * usual pairing - would otherwise share `id="vk-newsletter-email"`, and a duplicate id
   * silently breaks BOTH labels: clicking either one focuses the first field.
   */
  const inputId = `${useIsomorphicId(id)}-email`
  const [email, setEmail] = useState('')
  const [internal, setInternal] = useState<NewsletterStatus>('idle')
  const status = controlledStatus ?? internal
  const busy = status === 'submitting'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy || !onSubscribe) return
    setInternal('submitting')
    try {
      await onSubscribe(email)
      setInternal('success')
      setEmail('')
    } catch {
      // The thrown value is deliberately not surfaced: it is usually a network error whose
      // message means nothing to the person reading it.
      setInternal('error')
    }
  }

  return (
    <form
      className={cx('vk-newsletter', className)}
      data-layout={layout}
      data-status={status}
      noValidate={false}
      onSubmit={handleSubmit}
      ref={ref}
      {...rest}
    >
      {title ? <div className="vk-newsletter__title">{title}</div> : null}
      {description ? <p className="vk-newsletter__description">{description}</p> : null}

      <div className="vk-newsletter__row">
        <label className="vk-visually-hidden" htmlFor={inputId}>
          {label}
        </label>
        <input
          autoComplete="email"
          className="vk-newsletter__input"
          disabled={busy}
          id={inputId}
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          required
          // The browser's own email validation: localised, accessible, and better than a regex.
          type="email"
          value={email}
        />
        <button className="vk-newsletter__button" disabled={busy} type="submit">
          {busy ? 'Subscribing…' : buttonLabel}
        </button>
      </div>

      {note ? <p className="vk-newsletter__note">{note}</p> : null}

      {/*
        Always rendered, never conditionally mounted. A live region added to the DOM at the
        same moment it gains content is frequently not announced at all - the screen reader
        has to be observing the node before the text arrives.
      */}
      <p aria-live="polite" className="vk-newsletter__status" role="status">
        {status === 'success' ? successMessage : null}
        {status === 'error' ? errorMessage : null}
      </p>
    </form>
  )
})
