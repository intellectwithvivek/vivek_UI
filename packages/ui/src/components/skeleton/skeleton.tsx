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

  if (variant === 'text' && lines > 1) {
    return (
      <div
        ref={ref}
        className={cx('vk-skeleton-group', className)}
        aria-hidden="true"
        style={style}
        {...rest}
      >
        {Array.from({ length: lines }, (_, index) => (
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
