import {
  Children,
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
} from 'react'
import { cx } from '../../utils/cx'
import type { ResponsiveCols } from '../grid'
import type { StackGap } from '../stack/stack'
import { CarouselControls } from './carousel-controls'

/** Order matters: each breakpoint falls back to the one below it. */
const BREAKPOINTS = ['base', 'sm', 'md', 'lg', 'xl'] as const

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * How many slides are visible at once. A number holds at every width; an object is
   * responsive on the same breakpoints as `Grid`. Omit it for the built-in progression
   * (1 → 2 → 3), which responds to the carousel's OWN width via container queries.
   */
  slidesPerView?: number | ResponsiveCols
  gap?: StackGap
  /** Where a snapped slide comes to rest. Defaults to `start`. */
  align?: 'start' | 'center' | 'end'
  /**
   * Wrap past the ends. Best effort: CSS scroll-snap has no notion of a loop, so this
   * makes the arrows and autoplay jump from the last slide back to the first rather than
   * cloning slides. A user dragging the track still stops at the ends.
   */
  loop?: boolean
  showArrows?: boolean
  showDots?: boolean
  /** Advance on a timer. Pauses on hover, on focus within, and under reduced motion. */
  autoPlay?: boolean
  /** Milliseconds between automatic advances. Defaults to `5000`, floor of `500`. */
  interval?: number
  /** Accessible name of the carousel itself. Defaults to `'Carousel'`. */
  label?: string
  /** Accessible name of each slide. Defaults to `"3 of 7"`. */
  slideLabel?: (index: number, total: number) => string
  prevLabel?: string
  nextLabel?: string
  /** Accessible name of a dot. Defaults to `"Go to slide 3 of 7"`. */
  dotLabel?: (index: number, total: number) => string
  playLabel?: string
  pauseLabel?: string
  /**
   * The autoplay pause control. On by default whenever `autoPlay` is set, because
   * WCAG 2.2.2 requires a way to stop motion that runs for more than five seconds and
   * hover is not a mechanism a keyboard or touch user has.
   */
  showPauseButton?: boolean
}

function defaultSlideLabel(index: number, total: number): string {
  return `${index + 1} of ${total}`
}

/** Frozen so the shared empty case cannot be mutated by a caller. */
const EMPTY: readonly string[] = Object.freeze([])

function defaultDotLabel(index: number, total: number): string {
  return `Go to slide ${index + 1} of ${total}`
}

/** Slide counts are positive integers or nothing. Never trust the caller. */
function positiveInt(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined
  const truncated = Math.trunc(value)
  return truncated >= 1 ? truncated : 1
}

/**
 * Expand `slidesPerView` into the inline custom properties the static stylesheet reads
 * inside its container queries — the `Grid` technique, resolved on the slide rather than
 * the root, because an element cannot query its own container.
 */
function slidesVars(input: number | ResponsiveCols | undefined): Record<string, number> {
  const vars: Record<string, number> = {}
  if (input === undefined) return vars

  if (typeof input === 'number') {
    const fixed = positiveInt(input)
    if (fixed !== undefined) vars['--vk-carousel-slides'] = fixed
    return vars
  }

  for (const breakpoint of BREAKPOINTS) {
    const value = positiveInt(input[breakpoint])
    if (value === undefined) continue
    vars[breakpoint === 'base' ? '--vk-carousel-slides' : `--vk-carousel-slides-${breakpoint}`] =
      value
  }
  return vars
}

/**
 * A carousel built on CSS scroll-snap.
 *
 * The track is the component: a scroll container with `scroll-snap-type`, one snap point
 * per slide, and a tab stop — so it drags on touch, scrolls with the arrow keys, snaps in
 * every browser, and works with JavaScript disabled or still loading. This file has no
 * hooks and no event handlers, which keeps it a Server Component; the arrows, dots and
 * autoplay live behind a `'use client'` boundary in `./carousel-controls` and reach the
 * track through the DOM, so nothing forces the slides themselves onto the client.
 *
 * Each slide is a `role="group"` with `aria-roledescription="slide"` and a "3 of 7" name,
 * per the ARIA Authoring Practices carousel pattern, so a screen reader user always knows
 * where they are in the set.
 */
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(function Carousel(
  {
    slidesPerView,
    gap = 4,
    align = 'start',
    loop,
    showArrows,
    showDots,
    autoPlay,
    interval = 5000,
    label = 'Carousel',
    slideLabel = defaultSlideLabel,
    prevLabel = 'Previous slide',
    nextLabel = 'Next slide',
    dotLabel = defaultDotLabel,
    playLabel = 'Start automatic slide rotation',
    pauseLabel = 'Stop automatic slide rotation',
    showPauseButton,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const slides = Children.toArray(children)
  const total = slides.length
  // `data-arrows` drives the track's arrow gutter in CSS. The arrows overlay the track, so
  // it has to reserve room for them or they sit on top of the slide content - but only when
  // arrows are actually shown, or a dots-only carousel carries dead margins on both edges.
  const needsControls = Boolean(showArrows || showDots || autoPlay)

  // Resolved here rather than passed as a callback: the controls are a Client Component,
  // and React refuses to serialise a function across that boundary. Doing it on the
  // server is also strictly less work, since the count cannot change after render.
  const dotLabels = showDots ? Array.from({ length: total }, (_, i) => dotLabel(i, total)) : EMPTY

  return (
    <div
      ref={ref}
      className={cx('vk-carousel', className)}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      data-mode={slidesPerView === undefined ? 'auto' : 'fixed'}
      data-align={align}
      data-gap={gap}
      data-loop={loop || undefined}
      data-arrows={showArrows ? '' : undefined}
      style={{ ...slidesVars(slidesPerView), ...style } as CSSProperties}
      {...rest}
    >
      {/*
        biome-ignore lint/a11y/noNoninteractiveTabindex: the track is a scroll container.
        Giving it a tab stop is what makes it keyboard scrollable, and is required by the
        axe `scrollable-region-focusable` rule.
      */}
      <div className="vk-carousel__track" tabIndex={0}>
        {slides.map((child, index) => (
          <div
            // `Children.toArray` has already minted a stable key for every element; the
            // index fallback only ever applies to bare strings and numbers.
            key={isValidElement(child) && child.key !== null ? child.key : `vk-slide-${index}`}
            className="vk-carousel__slide"
            role="group"
            aria-roledescription="slide"
            aria-label={slideLabel(index, total)}
          >
            {child}
          </div>
        ))}
      </div>
      {needsControls ? (
        <CarouselControls
          slideCount={total}
          showArrows={showArrows}
          showDots={showDots}
          autoPlay={autoPlay}
          interval={interval}
          loop={loop}
          prevLabel={prevLabel}
          nextLabel={nextLabel}
          dotLabels={dotLabels}
          playLabel={playLabel}
          pauseLabel={pauseLabel}
          showPauseButton={showPauseButton}
        />
      ) : null}
    </div>
  )
})
