import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import type { StackGap } from '../stack/stack'

/**
 * Travel direction. `up`/`down` imply a vertical marquee, so `vertical` is only needed
 * when you want to keep saying `left`/`right` — those then mean `up`/`down`.
 */
export type MarqueeDirection = 'left' | 'right' | 'up' | 'down'

export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Relative pace. `1` is the default cadence — one full pass of the content every
   * `--vk-marquee-cycle` (20s) — `2` is twice as fast, `0.5` half.
   *
   * Deliberately NOT pixels per second: that needs the rendered width of the track
   * divided by a speed, and CSS cannot divide a length by a number to produce a time.
   * A px/s prop would therefore mean measuring the DOM, which would cost this component
   * its zero-JS, server-safe implementation. Override `--vk-marquee-cycle` for absolute
   * control.
   */
  speed?: number
  /** Defaults to `left` (or `up` once `vertical` is set). */
  direction?: MarqueeDirection
  pauseOnHover?: boolean
  /** Fade the leading and trailing edges out, so content does not pop in and out. */
  gradient?: boolean
  /** Width of each fade. Defaults to `--vk-space-8`. */
  gradientWidth?: string
  /** Scroll along the block axis. Height comes from `--vk-marquee-height` (18rem). */
  vertical?: boolean
  /** Space between items, and across the seam. Defaults to `4`. */
  gap?: StackGap
}

/**
 * An infinite ticker: the content, then an `aria-hidden` copy of it, translated by
 * exactly half the track so the seam is invisible.
 *
 * Zero JavaScript and server-safe — no state, no effects, no measurement. The copy is
 * hidden from assistive technology because it is the same content twice; a screen reader
 * reading a logo wall or a testimonial strip twice is a bug, not a feature.
 *
 * Motion stops on hover (opt-in), on focus within (always — content you cannot hold
 * still is content a keyboard user cannot read), and under `prefers-reduced-motion`,
 * where the animation is removed entirely, the copy is dropped, and the single remaining
 * row wraps instead of being clipped. Static, not slower.
 */
export const Marquee = forwardRef<HTMLDivElement, MarqueeProps>(function Marquee(
  {
    speed,
    direction,
    pauseOnHover,
    gradient,
    gradientWidth,
    vertical,
    gap = 4,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const axis = vertical || direction === 'up' || direction === 'down' ? 'vertical' : 'horizontal'
  const reverse = direction === 'right' || direction === 'down'

  const vars: Record<string, string | number> = {}
  // A zero or negative speed would divide the cycle into an infinite or negative
  // duration. Clamp instead of emitting a broken animation.
  if (speed !== undefined && Number.isFinite(speed) && speed > 0) vars['--vk-marquee-speed'] = speed
  if (gradientWidth) vars['--vk-marquee-fade'] = gradientWidth

  return (
    <div
      ref={ref}
      className={cx('vk-marquee', className)}
      data-axis={axis}
      data-reverse={reverse || undefined}
      data-pause-on-hover={pauseOnHover || undefined}
      data-gradient={gradient || undefined}
      data-gap={gap}
      style={{ ...vars, ...style } as CSSProperties}
      {...rest}
    >
      <div className="vk-marquee__track">
        <div className="vk-marquee__group">{children}</div>
        <div className="vk-marquee__group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
})
