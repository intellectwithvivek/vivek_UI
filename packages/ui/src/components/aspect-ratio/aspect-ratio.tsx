import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** Width-to-height ratio. `16 / 9` and `1.777` are equivalent. Defaults to `16 / 9`. */
  ratio?: number
}

/** Reserves space at a fixed ratio so media cannot cause layout shift. */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = 16 / 9, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('vk-aspect-ratio', className)}
      style={{ '--vk-aspect-ratio': ratio, ...style } as CSSProperties}
      {...rest}
    />
  )
})
