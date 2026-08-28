import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { Slot } from '../../utils/slot'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  /** Round instead of rounded-rectangle. */
  round?: boolean
  /**
   * Required. An icon-only control has no text for a screen reader to announce, so
   * the accessible name has to come from here — this is the single most common a11y
   * bug in icon buttons, so the type system enforces it.
   */
  'aria-label': string
  /**
   * Render the child element instead of a `<button>` — an icon link:
   * `<IconButton asChild aria-label="Settings"><Link href="/settings">{gear}</Link></IconButton>`.
   * `loading` and `disabled` are ignored with `asChild`, same as Button: `disabled` is not
   * valid on an anchor, and a spinner would fight the child's content.
   */
  asChild?: boolean
}

/**
 * A square button holding a single icon.
 *
 * `aria-label` is required at the type level. An icon-only control has no text for a
 * screen reader to announce, and shipping one without a name is the most common
 * accessibility defect in a component library — so the type system refuses it rather than
 * leaving it to code review.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    variant = 'ghost',
    size = 'md',
    loading,
    round,
    asChild,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  const shared = {
    ref,
    className: cx('vk-icon-button', className),
    'data-variant': variant,
    'data-size': size,
    'data-round': round || undefined,
  }

  if (asChild) {
    return (
      <Slot {...shared} {...rest}>
        {children}
      </Slot>
    )
  }
  return (
    <button
      data-loading={loading || undefined}
      disabled={disabled || loading}
      {...shared}
      {...rest}
    >
      {loading ? <span className="vk-icon-button__spinner" aria-hidden="true" /> : children}
    </button>
  )
})
