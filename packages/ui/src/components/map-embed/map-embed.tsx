'use client'

import { forwardRef, type HTMLAttributes, type ReactNode, useState } from 'react'
import { cx } from '../../utils/cx'

export type MapProvider = 'openstreetmap' | 'google'

export interface MapEmbedProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** A place name or address, e.g. `"Bengaluru, India"`. Ignored if `lat`/`lon` are given. */
  query?: string
  lat?: number
  lon?: number
  /** 1 is the whole world, 20 is a building. Default `14`. */
  zoom?: number
  /**
   * Default `openstreetmap`, and that default is a privacy decision — see the note on
   * `requireConsent`.
   */
  provider?: MapProvider
  /**
   * Required. An `<iframe>` with no title is announced as "frame", and a page with several
   * is unnavigable.
   */
  title: string
  ratio?: number
  /**
   * Gate loading behind a click.
   *
   * Defaults to `true` for Google and `false` for OpenStreetMap, because that is where the
   * difference actually lies: a Google Maps iframe contacts Google and sets cookies the
   * moment it renders, before the visitor has agreed to anything. Under GDPR that is the
   * embedding site's problem, and it is the reason cookie banners exist on pages whose only
   * third party is a map.
   *
   * OpenStreetMap sets no cookies and runs no analytics, so it loads directly.
   */
  requireConsent?: boolean
  /** Copy for the consent gate. */
  consentLabel?: ReactNode
  consentButtonLabel?: string
  /** Google Maps Embed API key. Without one, the keyless `maps.google.com` embed is used. */
  apiKey?: string
}

function buildSrc({
  provider,
  query,
  lat,
  lon,
  zoom,
  apiKey,
}: Required<Pick<MapEmbedProps, 'provider' | 'zoom'>> &
  Pick<MapEmbedProps, 'query' | 'lat' | 'lon' | 'apiKey'>): string {
  const hasCoords = typeof lat === 'number' && typeof lon === 'number'

  if (provider === 'google') {
    if (apiKey) {
      const q = hasCoords ? `${lat},${lon}` : (query ?? '')
      return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(q)}&zoom=${zoom}`
    }
    // Keyless embed. Undocumented but long-standing, and it means a map works with no signup.
    const q = hasCoords ? `${lat},${lon}` : (query ?? '')
    return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&output=embed`
  }

  if (hasCoords) {
    // OSM wants a bounding box. This is a small span around the point, widened as the zoom
    // decreases so the marker is never the only thing on screen.
    const span = 0.01 * 2 ** (14 - zoom)
    const bbox = [lon - span, lat - span, lon + span, lat + span].join(',')
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
  }
  return `https://www.openstreetmap.org/export/embed.html?search=${encodeURIComponent(query ?? '')}&layer=mapnik`
}

/**
 * An embedded map, without the privacy footgun.
 *
 * Dropping a Google Maps iframe onto a contact page is a one-line change that quietly makes
 * the site contact Google and set cookies on first paint, before the visitor has consented
 * to anything. It is one of the most common ways a site acquires a GDPR problem, and it is
 * invisible unless you open the network tab.
 *
 * Two defences, both on by default:
 *
 * - **OpenStreetMap is the default provider.** It sets no cookies and runs no analytics, so
 *   it can load immediately with nothing to consent to.
 * - **Google is gated behind a click.** Nothing is requested until the visitor asks for it.
 *   Pass `requireConsent={false}` to override, once your consent banner has handled it.
 *
 * `loading="lazy"` on top, so a map in a footer costs nothing until it is scrolled to.
 */
export const MapEmbed = forwardRef<HTMLDivElement, MapEmbedProps>(function MapEmbed(
  {
    query,
    lat,
    lon,
    zoom = 14,
    provider = 'openstreetmap',
    title,
    ratio = 16 / 9,
    requireConsent,
    consentLabel = 'This map is loaded from a third party, which may set cookies.',
    consentButtonLabel = 'Load map',
    apiKey,
    className,
    style,
    ...rest
  },
  ref,
) {
  const gated = requireConsent ?? provider === 'google'
  const [allowed, setAllowed] = useState(!gated)

  const src = buildSrc({ provider, query, lat, lon, zoom, apiKey })

  return (
    <div
      className={cx('vk-map-embed', className)}
      data-provider={provider}
      ref={ref}
      style={{ aspectRatio: String(ratio), ...style }}
      {...rest}
    >
      {allowed ? (
        <iframe
          className="vk-map-embed__frame"
          loading="lazy"
          // No `allow-same-origin`: the map does not need access to this origin, and
          // withholding it stops the frame reading cookies or storage belonging to the page.
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          src={src}
          title={title}
        />
      ) : (
        <div className="vk-map-embed__consent">
          <p className="vk-map-embed__consent-text">{consentLabel}</p>
          <button
            className="vk-map-embed__consent-button"
            onClick={() => setAllowed(true)}
            type="button"
          >
            {consentButtonLabel}
          </button>
          {/*
            A real link out, so the location is reachable even if the visitor never consents
            and for anyone who cannot use an embedded map at all.
          */}
          <a
            className="vk-map-embed__fallback-link"
            href={
              provider === 'google'
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query ?? `${lat},${lon}`)}`
                : `https://www.openstreetmap.org/search?query=${encodeURIComponent(query ?? `${lat},${lon}`)}`
            }
            rel="noopener noreferrer"
            target="_blank"
          >
            Open in a new tab instead
          </a>
        </div>
      )}
    </div>
  )
})
