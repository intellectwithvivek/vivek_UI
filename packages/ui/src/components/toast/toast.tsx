import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'

/** Same four tones as `Alert`, for the same reason: severity drives politeness. */
export type ToastTone = 'info' | 'success' | 'warning' | 'danger'

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: ToastTone
  /** Bold leading line. */
  title?: ReactNode
  /** Secondary line under the title. */
  description?: ReactNode
  /** A control the toast offers — typically a `<Button size="sm">Undo</Button>`. */
  action?: ReactNode
  /** Leading glyph. Pass `null` to drop the default. */
  icon?: ReactNode
  /** Called when the dismiss button is pressed. Its presence is what renders the button. */
  onDismiss?: () => void
  /** Accessible name for the dismiss button. */
  dismissLabel?: string
  /** `false` hides the dismiss button even when `onDismiss` is given. */
  dismissible?: boolean
}

const DEFAULT_ICON: Record<ToastTone, string> = {
  info: 'i',
  success: '✓',
  warning: '!',
  danger: '!',
}

/**
 * One notification. `ToastProvider` renders these for you, but it is exported so a
 * static toast can be dropped into a docs page or a form's inline slot.
 *
 * Deliberately role-less. Inside the provider it lives in a container that is already
 * an `aria-live` region (`role="status"` for info/success, `role="alert"` for
 * warning/danger — the same reasoning as `Alert`: do not talk over the user for a
 * message that is not urgent). Putting a second live role on the item would make some
 * screen readers announce it twice, so the announcement stays the container's job.
 * A standalone toast that must announce itself can pass `role`/`aria-live` through
 * `...rest`.
 *
 * The dismiss button gets its accessible name from `dismissLabel` because the glyph
 * inside it is `aria-hidden` — an icon-only control with no name is the classic bug
 * here, so the label has a default rather than being optional-and-forgotten.
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    tone = 'info',
    title,
    description,
    action,
    icon,
    onDismiss,
    dismissLabel = 'Dismiss',
    dismissible,
    className,
    children,
    ...rest
  },
  ref,
) {
  const glyph = icon === undefined ? DEFAULT_ICON[tone] : icon
  const showDismiss = onDismiss !== undefined && dismissible !== false

  return (
    <div ref={ref} className={cx('vk-toast', className)} data-tone={tone} {...rest}>
      {glyph ? (
        <span className="vk-toast__icon" aria-hidden="true">
          {glyph}
        </span>
      ) : null}
      <div className="vk-toast__content">
        {title ? <div className="vk-toast__title">{title}</div> : null}
        {description ? <div className="vk-toast__description">{description}</div> : null}
        {children}
      </div>
      {action ? <div className="vk-toast__action">{action}</div> : null}
      {showDismiss ? (
        <button
          type="button"
          className="vk-toast__dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel}
        >
          <span aria-hidden="true">×</span>
        </button>
      ) : null}
    </div>
  )
})
