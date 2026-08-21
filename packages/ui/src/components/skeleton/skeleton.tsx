import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle'
  width?: string | number
  height?: string | number
  /** Number of stacked lines. Only meaningful for `variant="text"`. */
  lines?: number
  /** Turn off the shimmer. */
  static?: boolean
}

/** A loading placeholder. Hidden from assistive tech — the live region announces state. */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = 'text', width, height, lines = 1, static: isStatic, className, style, ...rest },
  ref,
) {
  const dimensions = { width, height, ...style } as CSSProperties

  // Clamp before it reaches Array.from: a non-finite or absurd `lines` (a count that
  // came from an API, say) would otherwise throw a RangeError out of render or hang the
  // main thread. 100 placeholder lines is already far past useful.
  const lineCount = Number.isFinite(lines) ? Math.min(Math.max(1, Math.trunc(lines)), 100) : 1

  if (variant === 'text' && lineCount > 1) {
    return (
      <div
        ref={ref}
        className={cx('vk-skeleton-group', className)}
        aria-hidden="true"
        style={style}
        {...rest}
      >
        {Array.from({ length: lineCount }, (_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
            key={index}
            className="vk-skeleton"
            data-variant="text"
            data-static={isStatic || undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cx('vk-skeleton', className)}
      data-variant={variant}
      data-static={isStatic || undefined}
      aria-hidden="true"
      style={dimensions}
      {...rest}
    />
  )
})
