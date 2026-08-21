'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { IconButton } from '../icon-button'

/**
 * The interactive half of `Carousel`: arrows, dots, autoplay.
 *
 * Internal — exported from this module for `Carousel` to render, but deliberately NOT
 * from `./index`, so it never becomes public API.
 *
 * It finds the track through the DOM rather than through a shared ref, and that is the
 * point: a ref would have to be created by the carousel root, which would drag the root
 * (and therefore every slide) across the `'use client'` boundary. Two `classList` lookups
 * buy the whole track staying a Server Component.
 */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * Live `prefers-reduced-motion`, `false` until the first effect runs so that the server
 * render and the first client render agree.
 *
 * Duplicated (in eight lines) in `AnimatedCounter` on purpose: this brief may not add
 * files to `src/hooks/`, and cross-importing a hook out of a sibling component's folder
 * would be worse coupling than the duplication. It belongs in
 * `hooks/use-prefers-reduced-motion` the moment that directory is open for edits.
 */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(REDUCED_MOTION)
    setReduced(query.matches)
    if (typeof query.addEventListener !== 'function') return
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

function findTrack(from: HTMLElement | null): HTMLElement | null {
  const carousel = from?.closest('.vk-carousel')
  if (!carousel) return null
  for (const child of Array.from(carousel.children)) {
    if (child instanceof HTMLElement && child.classList.contains('vk-carousel__track')) return child
  }
  return null
}

function slidesOf(track: HTMLElement): HTMLElement[] {
  return Array.from(track.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.classList.contains('vk-carousel__slide'),
  )
}

export interface CarouselControlsProps {
  slideCount: number
  interval: number
  prevLabel: string
  nextLabel: string
  playLabel: string
  pauseLabel: string
  dotLabel: (index: number, total: number) => string
  showArrows?: boolean
  showDots?: boolean
  autoPlay?: boolean
  loop?: boolean
  showPauseButton?: boolean
}

export function CarouselControls({
  slideCount,
  interval,
  prevLabel,
  nextLabel,
  playLabel,
  pauseLabel,
  dotLabel,
  showArrows,
  showDots,
  autoPlay,
  loop,
  showPauseButton,
}: CarouselControlsProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [playing, setPlaying] = useState(Boolean(autoPlay))
  const reduced = useReducedMotion()

  // Latest-value mirror, so the timer and the handlers stay identity-stable.
  const indexRef = useRef(index)
  indexRef.current = index

  const goTo = useCallback((next: number) => {
    const track = findTrack(rootRef.current)
    if (!track) return
    const slides = slidesOf(track)
    const target = slides[next]
    if (!target) return

    // Measured, not multiplied: slide widths come from container queries and the gap from
    // a token, so the only reliable offset is the one the layout actually produced.
    const left =
      target.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft

    if (typeof track.scrollTo === 'function') track.scrollTo({ left, behavior: 'smooth' })
    else track.scrollLeft = left

    // Optimistic: `scroll` events confirm (or correct) this a frame later, and in an
    // environment with no layout there are no scroll events at all.
    setIndex(next)
  }, [])

  const step = useCallback(
    (delta: number) => {
      if (slideCount === 0) return
      const last = slideCount - 1
      const raw = indexRef.current + delta
      const next = raw < 0 ? (loop ? last : 0) : raw > last ? (loop ? 0 : last) : raw
      goTo(next)
    },
    [goTo, loop, slideCount],
  )

  /** Which slide is actually in view, whenever the user scrolls the track themselves. */
  useEffect(() => {
    const track = findTrack(rootRef.current)
    if (!track) return

    const onScroll = () => {
      const slides = slidesOf(track)
      const origin = track.getBoundingClientRect().left
      let best = 0
      let bestDistance = Number.POSITIVE_INFINITY
      slides.forEach((slide, position) => {
        const distance = Math.abs(slide.getBoundingClientRect().left - origin)
        if (distance < bestDistance) {
          bestDistance = distance
          best = position
        }
      })
      setIndex(best)
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [])

  /**
   * Autoplay pauses while the pointer is over the carousel and while focus is anywhere
   * inside it — both listened for on the carousel root, not on these controls, because
   * the thing a user hovers or tabs into is a slide.
   */
  useEffect(() => {
    const carousel = rootRef.current?.closest('.vk-carousel')
    if (!carousel) return

    const onEnter = () => setHovered(true)
    const onLeave = () => setHovered(false)
    const onFocusIn = () => setFocused(true)
    const onFocusOut = (event: Event) => {
      const next = event instanceof FocusEvent ? event.relatedTarget : null
      // Moving between two slides is not leaving the carousel.
      if (next instanceof Node && carousel.contains(next)) return
      setFocused(false)
    }

    carousel.addEventListener('mouseenter', onEnter)
    carousel.addEventListener('mouseleave', onLeave)
    carousel.addEventListener('focusin', onFocusIn)
    carousel.addEventListener('focusout', onFocusOut)
    return () => {
      carousel.removeEventListener('mouseenter', onEnter)
      carousel.removeEventListener('mouseleave', onLeave)
      carousel.removeEventListener('focusin', onFocusIn)
      carousel.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  // Turning `autoPlay` on or off from outside overrides an earlier press of the pause
  // button; nothing else disturbs the user's choice.
  useEffect(() => {
    setPlaying(Boolean(autoPlay))
  }, [autoPlay])

  const rotating =
    Boolean(autoPlay) && playing && !reduced && !hovered && !focused && slideCount > 1

  useEffect(() => {
    if (!rotating) return
    const id = window.setInterval(() => step(1), Math.max(500, interval))
    return () => window.clearInterval(id)
  }, [rotating, interval, step])

  const atStart = index <= 0
  const atEnd = index >= slideCount - 1

  return (
    <div
      ref={rootRef}
      className="vk-carousel__controls"
      data-rotating={rotating ? 'true' : 'false'}
      data-paused={hovered || focused ? 'true' : undefined}
    >
      {showArrows ? (
        <>
          <IconButton
            className="vk-carousel__arrow"
            data-direction="prev"
            variant="outline"
            round
            aria-label={prevLabel}
            disabled={!loop && atStart}
            onClick={() => step(-1)}
          >
            <Chevron direction="prev" />
          </IconButton>
          <IconButton
            className="vk-carousel__arrow"
            data-direction="next"
            variant="outline"
            round
            aria-label={nextLabel}
            disabled={!loop && atEnd}
            onClick={() => step(1)}
          >
            <Chevron direction="next" />
          </IconButton>
        </>
      ) : null}

      {showDots || (autoPlay && showPauseButton !== false && !reduced) ? (
        <div className="vk-carousel__bar">
          {showDots ? (
            <div className="vk-carousel__dots">
              {Array.from({ length: slideCount }, (_, dot) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: a dot IS its position; there is no other identity, and the list only changes length.
                  key={`vk-dot-${dot}`}
                  type="button"
                  className="vk-carousel__dot"
                  aria-label={dotLabel(dot, slideCount)}
                  aria-current={dot === index ? 'true' : undefined}
                  data-active={dot === index ? 'true' : undefined}
                  onClick={() => goTo(dot)}
                />
              ))}
            </div>
          ) : null}
          {/*
            WCAG 2.2.2: motion that runs longer than five seconds needs a control that
            stops it. Hovering is not one — a keyboard or touch user cannot hover. It is
            not rendered under reduced motion because nothing ever rotates there.
          */}
          {autoPlay && showPauseButton !== false && !reduced ? (
            <IconButton
              className="vk-carousel__play"
              variant="ghost"
              size="sm"
              aria-label={playing ? pauseLabel : playLabel}
              onClick={() => setPlaying((previous) => !previous)}
            >
              <span aria-hidden="true">{playing ? '❙❙' : '▶'}</span>
            </IconButton>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/** Decorative chevron. The arrow's accessible name comes from its `aria-label`. */
function Chevron({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false">
      <path
        d={direction === 'prev' ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
