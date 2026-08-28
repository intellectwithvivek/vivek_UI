'use client'

import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { cx } from '../../utils/cx'
import { DialogBase } from '../internal/dialog-core'
import type { PortalContainer } from '../portal'

export interface LightboxItem {
  src: string
  /** Required: the image is the content, so it must be described. */
  alt: string
  caption?: ReactNode
  srcSet?: string
  sizes?: string
  /** Smaller image for the strip. Falls back to `src`. */
  thumbnail?: string
}

export interface LightboxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  items?: LightboxItem[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Controlled index of the shown image. */
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  /** Next after the last wraps to the first. Default `true`. */
  loop?: boolean
  /** Show the thumbnail strip. Default: when there is more than one image. */
  thumbnails?: boolean
  /** Accessible name of the viewer; the position is appended ("…, 2 of 5"). Default `'Image viewer'`. */
  label?: string
  /** Clicking the dark backdrop closes. Default `true`. */
  closeOnOverlayClick?: boolean
  /** Horizontal drag, in px, that counts as a swipe. Default `48`. */
  swipeThreshold?: number
  container?: PortalContainer
}

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}

/**
 * A full-screen image viewer — click a thumbnail, see the picture, move through the set.
 *
 * Built on the same dialog core as `Modal`: `role="dialog"` with `aria-modal`, focus
 * trapped inside and returned to the trigger on close, the page behind made inert,
 * scroll locked, Escape and a backdrop click to dismiss. The dialog's name carries the
 * position ("Image viewer, 2 of 5") and the counter is a live region, so moving through
 * the set is announced.
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | ArrowRight / ArrowLeft | Next / previous image |
 * | Home / End | First / last image |
 * | Escape | Close |
 *
 * Swiping horizontally moves too. Neighbouring images are preloaded so the next one is
 * already there. `alt` is required on every item: the image is the content.
 */
export const Lightbox = forwardRef<HTMLDivElement, LightboxProps>(function Lightbox(
  {
    items = [],
    open,
    defaultOpen,
    onOpenChange,
    index,
    defaultIndex = 0,
    onIndexChange,
    loop = true,
    thumbnails,
    label = 'Image viewer',
    closeOnOverlayClick = true,
    swipeThreshold = 48,
    container,
    className,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const count = items.length
  const [rawIndex, setIndex] = useControllableState<number>({
    value: index,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  })
  const current = count === 0 ? 0 : Math.min(Math.max(rawIndex, 0), count - 1)
  const item = items[current]
  const showThumbs = thumbnails ?? count > 1

  const go = (next: number) => {
    if (count === 0) return
    let target = next
    if (loop) target = ((next % count) + count) % count
    else target = Math.min(Math.max(next, 0), count - 1)
    if (target !== current) setIndex(target)
  }
  const atStart = !loop && current === 0
  const atEnd = !loop && current === count - 1

  // Preload the neighbours so moving feels instant.
  useEffect(() => {
    if (count < 2 || typeof Image === 'undefined') return
    for (const offset of [1, -1]) {
      const neighbour = items[(((current + offset) % count) + count) % count]
      if (neighbour) new Image().src = neighbour.src
    }
  }, [items, current, count])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    switch (event.key) {
      case 'ArrowRight':
        go(current + 1)
        break
      case 'ArrowLeft':
        go(current - 1)
        break
      case 'Home':
        go(0)
        break
      case 'End':
        go(count - 1)
        break
      default:
        return
    }
    event.preventDefault()
  }

  const swipeStart = useRef<number | null>(null)
  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    swipeStart.current = event.clientX
  }
  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = swipeStart.current
    swipeStart.current = null
    if (start === null) return
    const delta = event.clientX - start
    if (Math.abs(delta) < swipeThreshold) return
    go(delta < 0 ? current + 1 : current - 1)
  }

  const name = count > 0 ? `${label}, ${current + 1} of ${count}` : label

  return (
    <DialogBase
      ref={ref}
      block="vk-lightbox"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      closeOnOverlayClick={closeOnOverlayClick}
      container={container}
      aria-label={name}
      className={className}
      onKeyDown={handleKeyDown}
      panelData={{ 'data-count': String(count) }}
      {...rest}
    >
      <div className="vk-lightbox__toolbar">
        <span className="vk-lightbox__counter" aria-live="polite" aria-atomic="true">
          {count > 0 ? `${current + 1} / ${count}` : ''}
        </span>
        <button
          type="button"
          className="vk-lightbox__button"
          aria-label="Close"
          onClick={() => onOpenChange?.(false)}
          data-close=""
        >
          <Icon d="M6 6l12 12M18 6L6 18" />
        </button>
      </div>

      <div className="vk-lightbox__stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        {count > 1 ? (
          <button
            type="button"
            className="vk-lightbox__button vk-lightbox__arrow"
            aria-label="Previous image"
            aria-disabled={atStart || undefined}
            data-disabled={atStart ? '' : undefined}
            onClick={() => {
              if (!atStart) go(current - 1)
            }}
          >
            <Icon d="M15 5l-7 7 7 7" />
          </button>
        ) : (
          <span />
        )}
        {item ? (
          <figure className="vk-lightbox__figure">
            <img
              key={item.src}
              className="vk-lightbox__image"
              src={item.src}
              srcSet={item.srcSet}
              sizes={item.sizes}
              alt={item.alt}
              draggable={false}
            />
            {item.caption ? (
              <figcaption className="vk-lightbox__caption">{item.caption}</figcaption>
            ) : null}
          </figure>
        ) : (
          <p className="vk-lightbox__empty">No images</p>
        )}
        {count > 1 ? (
          <button
            type="button"
            className="vk-lightbox__button vk-lightbox__arrow"
            aria-label="Next image"
            aria-disabled={atEnd || undefined}
            data-disabled={atEnd ? '' : undefined}
            onClick={() => {
              if (!atEnd) go(current + 1)
            }}
          >
            <Icon d="M9 5l7 7-7 7" />
          </button>
        ) : (
          <span />
        )}
      </div>

      {showThumbs && count > 0 ? (
        <div className="vk-lightbox__thumbs" role="group" aria-label="Thumbnails">
          {items.map((thumb, i) => (
            <button
              key={thumb.src}
              type="button"
              className={cx('vk-lightbox__thumb')}
              aria-label={`Show image ${i + 1}: ${thumb.alt}`}
              aria-current={i === current ? 'true' : undefined}
              onClick={() => go(i)}
            >
              <img src={thumb.thumbnail ?? thumb.src} alt="" draggable={false} />
            </button>
          ))}
        </div>
      ) : null}
    </DialogBase>
  )
})
