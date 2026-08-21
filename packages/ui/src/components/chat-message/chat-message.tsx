import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'

/** Who produced the turn. Drives layout, colour and the accessible name. */
export type ChatMessageRole = 'user' | 'assistant' | 'system'

/** Delivery state of an outgoing turn. `sent` is the quiet default. */
export type ChatMessageStatus = 'sending' | 'sent' | 'error'

export type ChatMessageVariant = 'bubble' | 'flat'

/**
 * `role` and `content` shadow two RDFa attributes React puts on every element
 * (`role`, `content`), so both are omitted from the base props. The DOM role is fixed
 * to `article` on purpose — see the component comment.
 */
export interface ChatMessageProps extends Omit<HTMLAttributes<HTMLElement>, 'role' | 'content'> {
  /** Who is speaking. Defaults to `assistant`. */
  role?: ChatMessageRole
  /**
   * The turn's body. A `ReactNode`, never a string that gets parsed — React escapes
   * whatever goes in here, which is the whole reason this family needs no sanitiser.
   * Falls back to `children` when omitted.
   */
  content?: ReactNode
  /** Leading slot, typically an `<Avatar />`. Purely decorative for a11y purposes. */
  avatar?: ReactNode
  /** Display name of the speaker. Defaults to a label derived from `role`. */
  name?: string
  /**
   * When the turn happened. A `Date` or epoch number is formatted for the current
   * locale; a **string is rendered verbatim**, so `timestamp="2 min ago"` works and
   * SSR output stays byte-identical when you pre-format.
   */
  timestamp?: Date | string | number
  /** Delivery state. Defaults to `sent`, which renders no status text. */
  status?: ChatMessageStatus
  /** Trailing controls (copy, retry, thumbs up…). Rendered after the content. */
  actions?: ReactNode
  /** `bubble` for a chat balloon, `flat` for a document-style transcript. */
  variant?: ChatMessageVariant
  /** Override the default `Date` formatting. Also the escape hatch for strict SSR. */
  formatTimestamp?: (date: Date) => string
  /** Localise the status text (also used in the accessible name). */
  statusLabels?: Partial<Record<ChatMessageStatus, string>>
}

const ROLE_LABEL: Record<ChatMessageRole, string> = {
  user: 'You',
  assistant: 'Assistant',
  system: 'System',
}

const STATUS_LABEL: Record<ChatMessageStatus, string | null> = {
  sending: 'Sending',
  sent: null,
  error: 'Not sent',
}

/**
 * Lazily built so module evaluation stays free of work, and reused so a long
 * transcript does not construct one formatter per message.
 */
let clockFormatter: Intl.DateTimeFormat | undefined

function formatClock(date: Date): string {
  if (!clockFormatter) {
    clockFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
  }
  return clockFormatter.format(date)
}

interface RenderedTimestamp {
  text: string
  /** Machine-readable value for `<time datetime>`. Absent for verbatim strings. */
  dateTime?: string
}

function renderTimestamp(
  value: Date | string | number,
  format?: (date: Date) => string,
): RenderedTimestamp | null {
  // A string is the caller's own formatting. Parsing it would be guesswork, and
  // re-formatting it is exactly the SSR/client drift we are trying to avoid.
  if (typeof value === 'string') return value ? { text: value } : null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return { text: format ? format(date) : formatClock(date), dateTime: date.toISOString() }
}

/**
 * One turn in a conversation.
 *
 * Server-safe: no state, no effects, no event handlers, so it renders in an RSC tree
 * without a `'use client'` boundary.
 *
 * **Accessibility.** The root is an `<article>`, which is what makes a transcript
 * navigable: screen readers expose article-by-article movement, so a user can step
 * through turns instead of arrowing through one undifferentiated blob of text. Its
 * accessible name carries the speaker (and the delivery state when it is not `sent`),
 * because "who said this" is the single piece of context a non-sighted user loses
 * first. `tabIndex={-1}` makes each turn programmatically focusable without putting
 * every message in the tab order — a hundred-message thread with a hundred tab stops
 * is worse for keyboard users than none. Pass `tabIndex={0}` through `...rest` if you
 * want them tabbable.
 *
 * Anything folded into the accessible name (the speaker, the status text) is
 * `aria-hidden` in the DOM, so it is announced once rather than stuttered.
 *
 * **Security.** `content` is a `ReactNode`. There is no HTML parsing and no
 * `dangerouslySetInnerHTML` anywhere in this family; a model that emits
 * `<img onerror=…>` produces visible text, not an element.
 */
export const ChatMessage = forwardRef<HTMLElement, ChatMessageProps>(function ChatMessage(
  {
    role = 'assistant',
    content,
    avatar,
    name,
    timestamp,
    status = 'sent',
    actions,
    variant = 'bubble',
    formatTimestamp,
    statusLabels,
    className,
    children,
    ...rest
  },
  ref,
) {
  const speaker = name ?? ROLE_LABEL[role]
  const statusText = statusLabels?.[status] ?? STATUS_LABEL[status]
  const accessibleName = statusText ? `${speaker}, ${statusText}` : speaker
  const time = timestamp === undefined ? null : renderTimestamp(timestamp, formatTimestamp)
  const body = content ?? children

  return (
    <article
      ref={ref}
      className={cx('vk-chat-message', className)}
      data-role={role}
      data-variant={variant}
      data-status={status}
      tabIndex={-1}
      aria-label={accessibleName}
      {...rest}
    >
      {avatar ? <div className="vk-chat-message__avatar">{avatar}</div> : null}
      <div className="vk-chat-message__main">
        <div className="vk-chat-message__meta">
          <span className="vk-chat-message__name" aria-hidden="true">
            {speaker}
          </span>
          {time ? (
            time.dateTime ? (
              <time className="vk-chat-message__time" dateTime={time.dateTime}>
                {time.text}
              </time>
            ) : (
              <span className="vk-chat-message__time">{time.text}</span>
            )
          ) : null}
        </div>
        {body === undefined || body === null ? null : (
          <div className="vk-chat-message__content">{body}</div>
        )}
        {statusText ? (
          <span className="vk-chat-message__status" aria-hidden="true">
            {statusText}
          </span>
        ) : null}
        {actions ? <div className="vk-chat-message__actions">{actions}</div> : null}
      </div>
    </article>
  )
})
