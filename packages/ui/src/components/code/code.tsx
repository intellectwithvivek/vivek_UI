import { forwardRef, type HTMLAttributes, type Ref } from 'react'
import { cx } from '../../utils/cx'

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  /** Render as a fenced block (`pre > code`) instead of inline. */
  block?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/** Monospaced code. Inline by default; `block` wraps it in a scrollable `pre`. */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
  { block, size = 'sm', className, 'aria-label': ariaLabel, children, ...rest },
  ref,
) {
  if (block) {
    return (
      <pre
        className={cx('vk-code', 'vk-code--block', className)}
        data-size={size}
        /*
         * A code block overflows sideways on narrow viewports, which makes it a scrollable
         * region - and a scrollable region a keyboard cannot reach strands its content
         * (WCAG 2.1.1; axe: scrollable-region-focusable). The tab stop plus a named region
         * is the standard fix; on wide screens where nothing scrolls, the stop is a
         * harmless brief visit announced by its label.
         */
        // biome-ignore lint/a11y/noNoninteractiveTabindex: WCAG 2.1.1 - a scrollable region must be focusable or a keyboard user cannot scroll it.
        tabIndex={0}
        role="group"
        aria-label={ariaLabel ?? 'Code sample'}
        {...rest}
      >
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
