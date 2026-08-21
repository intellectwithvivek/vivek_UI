'use client'

import {
  Children,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
  type UIEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { cx } from '../../utils/cx'
import { ChatMessage, type ChatMessageProps } from '../chat-message'
import { TypingIndicator } from '../typing-indicator'

/**
 * A message in the data-driven form. `id` is the React key.
 *
 * Deliberately a `Pick` of `ChatMessageProps` rather than an extension of it. Extending
 * pulled in all of `HTMLAttributes`, which made a transcript record type-legal carrying
 * `dangerouslySetInnerHTML` — and since records commonly come straight from a chat
 * backend or a model's tool output, one extra JSON key was enough to crash the render.
 * Listing the fields keeps the record a data shape, not a props bag: anything not here
 * belongs on `ChatThread.Message` in the `children` form, where it is explicit.
 */
export interface ChatThreadMessage
  extends Pick<
    ChatMessageProps,
    | 'actions'
    | 'avatar'
    | 'className'
    | 'content'
    | 'formatTimestamp'
    | 'name'
    | 'role'
    | 'status'
    | 'statusLabels'
    | 'timestamp'
    | 'variant'
  > {
  id: string
}

export interface ChatThreadProps extends HTMLAttributes<HTMLDivElement> {
  /** Data-driven transcript. When omitted, `children` is rendered instead. */
  messages?: ChatThreadMessage[]
  /**
   * Keep the newest content in view. Defaults to `true`.
   *
   * It sticks to the bottom only while the user is already at the bottom — scrolling
   * up to re-read something is never interrupted. See the note on the component.
   */
  autoScroll?: boolean
  /** Show the typing indicator under the transcript. */
  loading?: boolean
  /** Label for that indicator. Defaults to `TypingIndicator`'s own. */
  loadingLabel?: string
  /** Rendered instead of an empty transcript. */
  emptyState?: ReactNode
  /** Accessible name of the log region. Defaults to `Conversation`. */
  label?: string
  /**
   * How close to the bottom, in px, still counts as "at the bottom". Defaults to 48 -
   * enough to survive sub-pixel rounding and a half-visible line.
   */
  stickThreshold?: number
}

interface ChatThreadEmptyProps extends HTMLAttributes<HTMLDivElement> {}

/** One callback ref feeding both our own ref and the caller's. */
function useMergedRef<T>(
  own: RefObject<T | null>,
  forwarded: Ref<T> | undefined,
): (node: T | null) => void {
  return useCallback(
    (node: T | null) => {
      own.current = node
      if (typeof forwarded === 'function') forwarded(node)
      else if (forwarded) forwarded.current = node
    },
    [own, forwarded],
  )
}

/**
 * The scrolling transcript.
 *
 * **Auto-scroll, and the bug everybody ships.** The naive version scrolls to the
 * bottom whenever content changes, which yanks a user who scrolled up to read an
 * earlier answer straight back down the instant a token streams in. Here a single ref
 * (`stickRef`) records whether the user was at the bottom, updated on every scroll
 * event; the pin effect is a no-op while it is `false`. Scrolling back down re-arms it.
 * The pin runs after every commit rather than on a dependency list, so streaming text
 * inside an existing message keeps the view pinned too - not just new messages.
 *
 * **Accessibility.** The transcript is a `role="log"` with `aria-live="polite"` and
 * `aria-relevant="additions"`, so a new turn is announced on its own instead of the
 * whole thread being re-read. `aria-atomic="false"` is stated explicitly because a
 * couple of screen readers have historically defaulted the wrong way and re-read the
 * entire region. The typing indicator deliberately lives in a sibling slot *outside*
 * the log - see the long note in `typing-indicator.tsx` - and so does the empty state,
 * which otherwise announces "No messages yet" on first paint.
 *
 * Each turn is an `<article>` with the speaker in its accessible name, which is what
 * makes the log navigable turn by turn.
 */
const ChatThreadRoot = forwardRef<HTMLDivElement, ChatThreadProps>(function ChatThread(
  {
    messages,
    autoScroll = true,
    loading,
    loadingLabel,
    emptyState,
    label = 'Conversation',
    stickThreshold = 48,
    className,
    children,
    onScroll,
    ...rest
  },
  forwardedRef,
) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const setRef = useMergedRef(scrollerRef, forwardedRef)
  /** Is the user parked at the bottom? Starts true so a fresh thread opens at the end. */
  const stickRef = useRef(true)

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const el = scrollerRef.current
      if (el) {
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight
        stickRef.current = distance <= stickThreshold
      }
      onScroll?.(event)
    },
    [onScroll, stickThreshold],
  )

  // Intentionally no dependency array: this must run after *every* commit, because
  // "new content" includes a token appended to the last message, not just a new turn.
  // It is a cheap read of two layout properties plus, at most, one assignment.
  useEffect(() => {
    const el = scrollerRef.current
    if (!el || !autoScroll || !stickRef.current) return
    // Assignment rather than scrollTo(): no smooth-scroll fight with the user, and it
    // does not need a reduced-motion carve-out because it never animates.
    el.scrollTop = el.scrollHeight
  })

  const hasContent = messages !== undefined ? messages.length > 0 : Children.count(children) > 0

  return (
    <div
      ref={setRef}
      className={cx('vk-chat-thread', className)}
      data-auto-scroll={autoScroll ? 'true' : 'false'}
      data-loading={loading || undefined}
      onScroll={handleScroll}
      {...rest}
    >
      <div
        className="vk-chat-thread__log"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-atomic="false"
        aria-label={label}
      >
        {messages !== undefined
          ? messages.map((message) => (
              <ChatMessage
                key={message.id}
                actions={message.actions}
                avatar={message.avatar}
                className={message.className}
                content={message.content}
                formatTimestamp={message.formatTimestamp}
                name={message.name}
                role={message.role}
                status={message.status}
                statusLabels={message.statusLabels}
                timestamp={message.timestamp}
                variant={message.variant}
              />
            ))
          : children}
      </div>
      {!hasContent && emptyState !== undefined && emptyState !== null ? (
        <div className="vk-chat-thread__empty">{emptyState}</div>
      ) : null}
      {loading ? (
        <div className="vk-chat-thread__status">
          <TypingIndicator label={loadingLabel} />
        </div>
      ) : null}
    </div>
  )
})

const ChatThreadEmpty = forwardRef<HTMLDivElement, ChatThreadEmptyProps>(function ChatThreadEmpty(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx('vk-chat-thread__empty', className)} {...rest} />
})

/**
 * Compound component: `ChatThread`, `ChatThread.Message`, `ChatThread.Empty`.
 *
 * There is deliberately no `ChatThread.Typing`: the typing indicator must sit outside
 * the log's live region, which is what the `loading` prop arranges. Exposing it as a
 * child part would invite people to nest it in the log and spam screen readers.
 */
export const ChatThread = Object.assign(ChatThreadRoot, {
  Message: ChatMessage,
  Empty: ChatThreadEmpty,
})

export type { ChatThreadEmptyProps }
