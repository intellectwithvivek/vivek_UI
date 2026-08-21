import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: 'info' | 'success' | 'warning' | 'danger'
  variant?: 'soft' | 'outline' | 'solid'
  /** Bold leading line. */
  title?: ReactNode
  /** Leading glyph. Pass `null` to drop the default. */
  icon?: ReactNode
}

const DEFAULT_ICON: Record<string, string> = {
  info: 'i',
  success: '✓',
  warning: '!',
  danger: '!',
}

/**
 * A static, inline message. `danger` and `warning` get `role="alert"` so screen
 * readers interrupt for them; `info` and `success` use `role="status"`, which waits
 * for a pause instead of talking over the user.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = 'info', variant = 'soft', title, icon, className, children, ...rest },
  ref,
) {
  const glyph = icon === undefined ? DEFAULT_ICON[tone] : icon

  return (
    <div
      ref={ref}
      className={cx('vk-alert', className)}
      data-tone={tone}
      data-variant={variant}
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      {...rest}
    >
      {glyph ? (
        <span className="vk-alert__icon" aria-hidden="true">
          {glyph}
        </span>
      ) : null}
      <div className="vk-alert__content">
        {title ? <div className="vk-alert__title">{title}</div> : null}
        {children ? <div className="vk-alert__description">{children}</div> : null}
      </div>
    </div>
  )
})
