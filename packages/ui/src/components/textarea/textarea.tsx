import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: 'sm' | 'md' | 'lg'
  invalid?: boolean
  /** How the user may resize it. Defaults to `vertical`. */
  resize?: 'none' | 'vertical' | 'both'
}

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
