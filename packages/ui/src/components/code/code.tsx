import { forwardRef, type HTMLAttributes, type Ref } from 'react'
import { cx } from '../../utils/cx'

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  /** Render as a fenced block (`pre > code`) instead of inline. */
  block?: boolean
  size?: 'sm' | 'md'
}

/** Monospaced code. Inline by default; `block` wraps it in a scrollable `pre`. */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
  { block, size = 'sm', className, children, ...rest },
  ref,
) {
  if (block) {
    return (
      <pre className={cx('vk-code', 'vk-code--block', className)} data-size={size} {...rest}>
        <code ref={ref as Ref<HTMLElement>} className="vk-code__inner">
          {children}
        </code>
      </pre>
    )
  }

  return (
    <code ref={ref} className={cx('vk-code', className)} data-size={size} {...rest}>
      {children}
    </code>
  )
})
