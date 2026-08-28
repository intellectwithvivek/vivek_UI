import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface TypingIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Announced text. Defaults to `Assistant is typing`. */
  label?: string
  /** Also show the label on screen. Off by default: the dots carry the meaning. */
  showLabel?: boolean
  /** How many dots. Defaults to 3. */
  dots?: number
  size?: 'sm' | 'md' | 'lg'
  /**
   * When `false` the live region stays mounted but empty. Use this when you want a
   * guaranteed announcement — see the accessibility note on the component.
   */
  active?: boolean
}

/**
 * Three animated dots meaning "a reply is coming".
 *
 * Server-safe: pure markup plus a CSS animation, no hooks.
 *
 * **Accessibility — why this is not inside the transcript's live region.**
 * `ChatThread` renders its transcript as `role="log"` with
 * `aria-live="polite" aria-relevant="additions"`. If this indicator were a child of
 * that log, every appearance and disappearance of it would be a mutation of the live
 * region, and a streaming reply toggles it constantly — a screen reader would say
 * "Assistant is typing" over and over and then talk over the answer it was announcing.
 * So `ChatThread` places it in a sibling slot *outside* the log element: the
 * indicator's own `role="status"` (an implicit `aria-live="polite"`) announces it once,
 * politely, and the log stays exclusively about new messages.
 *
 * `role="status"` rather than `role="alert"` for the same reason: a reply being
 * composed is not urgent and must never interrupt what the user is reading.
 *
 * A live region that is *inserted* along with its text is announced by current
 * NVDA/JAWS/VoiceOver, but that behaviour has historically been patchy. `active` is
 * the bulletproof route: keep the element mounted permanently (it collapses to nothing
 * when inactive) and flip `active`, so the region exists before its content changes.
 * `ChatThread` mounts and unmounts instead, which keeps the DOM clean and removes the
 * region entirely when nothing is pending.
 *
 * Under `prefers-reduced-motion` the dots stop moving and settle into a static,
 * stepped-opacity row — still legible as "in progress", with nothing animating.
 */
export const TypingIndicator = forwardRef<HTMLDivElement, TypingIndicatorProps>(
  function TypingIndicator(
    {
      label = 'Assistant is typing',
      showLabel,
      dots = 3,
      size = 'md',
      active = true,
      className,
      ...rest
    },
    ref,
  ) {
    const count = Number.isFinite(dots) ? Math.max(1, Math.trunc(dots)) : 3

    return (
      <div
        ref={ref}
        className={cx('vk-typing-indicator', className)}
        role="status"
        data-size={size}
        data-active={active ? 'true' : 'false'}
        data-show-label={showLabel || undefined}
        {...rest}
      >
        {active ? (
          <>
            <span className="vk-typing-indicator__dots" aria-hidden="true">
              {Array.from({ length: count }, (_, index) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: the dots are a fixed-length positional list with no state - the index IS the identity.
                  key={index}
                  className="vk-typing-indicator__dot"
                  style={{ '--vk-typing-index': index } as CSSProperties}
                />
              ))}
            </span>
            <span className="vk-typing-indicator__label">{label}</span>
          </>
        ) : null}
      </div>
    )
  },
)
