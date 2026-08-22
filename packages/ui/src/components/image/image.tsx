'use client'

import { forwardRef, type ImgHTMLAttributes, type ReactNode, useState } from 'react'
import { cx } from '../../utils/cx'

export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'width' | 'height' | 'children'> {
  src: string
  /**
   * Required, and deliberately not optional.
   *
   * An image with no `alt` is announced by reading out its filename, which is worse than
   * silence. Pass `alt=""` for a decorative image — that is an explicit statement that it
   * carries no information, and it is the right answer surprisingly often. Making the
   * decision impossible to skip is the point; it is the same reason `IconButton` requires
   * `aria-label`.
   */
  alt: string
  /**
   * Aspect ratio as width / height, e.g. `16 / 9`.
   *
   * Reserving the box before the image loads is what prevents the page jumping as images
   * arrive — the single largest contributor to a poor Cumulative Layout Shift score.
   */
  ratio?: number
  /** How the image fills its box once a `ratio` is set. Default `cover`. */
  fit?: 'cover' | 'contain' | 'fill' | 'none'
  /** Focal point for `cover`, e.g. `'top'` so faces are not cropped out. */
  position?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  /**
   * Shown while loading, and instead of the image if it fails.
   *
   * A broken image icon is the worst possible outcome on a marketing page, and images fail
   * for reasons the author cannot control — a dead CDN, an ad blocker, a corporate proxy.
   */
  fallback?: ReactNode
  /** Renders `<figure>` with a `<figcaption>` rather than a bare `<img>`. */
  caption?: ReactNode
  /**
   * Default `lazy`. Set `eager` for anything above the fold — a lazily-loaded hero image is
   * slower, because the browser will not start fetching it until layout says it is visible.
   */
  loading?: 'lazy' | 'eager'
}

/**
 * An image with the box reserved, a loading state, and a failure state.
 *
 * A bare `<img>` in a design system is a gap, not a simplification. Three things go wrong
 * with one, every time, and all three are handled here:
 *
 * 1. **Layout shift.** Without a reserved box the page reflows as each image arrives. `ratio`
 *    reserves it up front.
 * 2. **Broken images.** A dead URL renders the browser's broken-image icon. `onError` swaps
 *    in `fallback` instead.
 * 3. **Missing alt text.** `alt` is required at the type level, so the decision cannot be
 *    skipped — `alt=""` is available and is the correct answer for decoration.
 *
 * Server-safe until it needs to be: it carries `'use client'` only because the load and
 * error states are real state. There is no way to know an image failed without a listener.
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    alt,
    ratio,
    fit = 'cover',
    position,
    rounded = 'md',
    fallback,
    caption,
    loading = 'lazy',
    className,
    style,
    onLoad,
    onError,
    ...rest
  },
  ref,
) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  const frame = (
    <div
      className={cx('vk-image', className)}
      data-rounded={rounded}
      data-status={status}
      style={{
        ...(ratio ? { aspectRatio: String(ratio) } : {}),
        ...style,
      }}
    >
      {status !== 'error' ? (
        <img
          alt={alt}
          className="vk-image__img"
          data-fit={fit}
          loading={loading}
          onError={(event) => {
            setStatus('error')
            onError?.(event)
          }}
          onLoad={(event) => {
            setStatus('loaded')
            onLoad?.(event)
          }}
          ref={ref}
          src={src}
          style={position ? { objectPosition: position } : undefined}
          {...rest}
        />
      ) : null}

      {status !== 'loaded' ? (
        <div
          /*
           * `aria-hidden`, because the `<img>` already carries the accessible name. Without
           * this a failed image is announced twice - once as the alt text and once as
           * whatever the fallback contains.
           */
          aria-hidden="true"
          className="vk-image__placeholder"
          data-error={status === 'error' || undefined}
        >
          {status === 'error' ? fallback : null}
        </div>
      ) : null}

      {/*
        A failed image still has to be announced, and the <img> is gone by then. This is the
        only thing in the tree carrying the description at that point.
      */}
      {status === 'error' && alt ? <span className="vk-visually-hidden">{alt}</span> : null}
    </div>
  )

  if (!caption) return frame

  return (
    <figure className="vk-image__figure">
      {frame}
      <figcaption className="vk-image__caption">{caption}</figcaption>
    </figure>
  )
})
