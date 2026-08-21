import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: 'sm' | 'md' | 'lg'
  invalid?: boolean
  /** How the user may resize it. Defaults to `vertical`. */
  resize?: 'none' | 'vertical' | 'both'
}

/**
 * A multi-line text input.
 *
 * Native by design: no wrapper element, so `rows`, `maxLength`, `autoComplete` and the
 * browser's own validation all keep working. `resize` controls whether the user may
 * resize it, and `invalid` sets `aria-invalid` alongside the visual state.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { size = 'md', invalid, resize = 'vertical', rows = 3, className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cx('vk-textarea', className)}
      data-size={size}
      data-resize={resize}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
})
