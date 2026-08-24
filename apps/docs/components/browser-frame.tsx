'use client'

import { Button, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

/**
 * A live site, shown inside browser chrome.
 *
 * **It loads on arrival.** An earlier version made you press a button first, on the reasoning
 * that embedding a whole Next.js application is expensive. That reasoning belongs on the
 * gallery, where there are twelve of them; here there is exactly one, and it is the entire
 * reason the page exists. Asking someone to click a button to see the thing they navigated to
 * is friction with nothing on the other side of it.
 *
 * `loading="lazy"` still applies, so the fetch happens when the frame scrolls into view
 * rather than competing with the page's own first paint.
 *
 * **There is always a way out.** The "Open live site" link is present before, during and
 * after loading, because an embedded site can fail in ways this page cannot detect: a
 * cross-origin frame that is refused still fires `load`, so there is no reliable signal to
 * branch on. Rather than guess at an error state, the escape hatch is simply always there.
 *
 * The three widths are real viewports — the frame has its own, so the site's media queries
 * answer honestly rather than reading the width of this page.
 */

const WIDTHS = [
  { id: 'phone', label: 'Phone', width: 390, hint: '390px' },
  { id: 'tablet', label: 'Tablet', width: 834, hint: '834px' },
  { id: 'desktop', label: 'Desktop', width: 0, hint: 'Full width' },
] as const

type WidthId = (typeof WIDTHS)[number]['id']

export interface BrowserFrameProps {
  /** The site to load. Must be https. */
  url: string
  /** Shown in the URL pill. Usually the host. */
  label: string
  /** Site name, used in the frame's accessible name and on the poster. */
  name: string
  /** Poster background, a CSS gradient. Deterministic per site. */
  poster: string
  height?: number
}

export function BrowserFrame({ url, label, name, poster, height = 620 }: BrowserFrameProps) {
  const [width, setWidth] = useState<WidthId>('desktop')
  const chosen = WIDTHS.find((option) => option.id === width) ?? WIDTHS[2]

  return (
    <Stack gap={3}>
      <Stack align="center" direction="horizontal" gap={2} justify="between" wrap>
        <div aria-label="Preview width" role="group">
          <Stack direction="horizontal" gap={2}>
            {WIDTHS.map((option) => (
              <Button
                aria-pressed={width === option.id}
                key={option.id}
                onClick={() => setWidth(option.id)}
                size="sm"
                variant={width === option.id ? 'solid' : 'outline'}
              >
                {option.label}
              </Button>
            ))}
          </Stack>
        </div>
        <Text size="sm" tone="muted">
          {chosen.hint} · the frame has its own viewport, so the breakpoints are real
        </Text>
      </Stack>

      <div className="browser">
        <div className="browser__bar">
          {/* Decorative: the dots say "this is a browser window" and nothing else. */}
          <span aria-hidden="true" className="browser__dots">
            <span />
            <span />
            <span />
          </span>
          <span className="browser__url">{label}</span>
          <Button asChild size="sm" variant="ghost">
            <a href={url} rel="noopener noreferrer" target="_blank">
              Open live site ↗
            </a>
          </Button>
        </div>

        <div
          className="browser__stage"
          style={{ height: `${height}px`, padding: chosen.width > 0 ? '1rem' : 0 }}
        >
          <div
            className="browser__viewport"
            style={{ width: chosen.width > 0 ? `${chosen.width}px` : '100%' }}
          >
            {/* The poster sits underneath as the loading state, so the box is never blank. */}
            <div className="browser__poster-bed" style={{ background: poster }}>
              <span className="browser__poster-name">{name}</span>
            </div>
            <iframe
              className="browser__frame"
              /*
               * `allow-same-origin` is required, and leaving it out is why this frame first
               * rendered blank.
               *
               * Without it the framed document gets an *opaque* origin, and in an opaque
               * origin every `localStorage` and `sessionStorage` access throws a
               * SecurityError rather than returning null. Every one of these sites reads
               * localStorage on mount for its theme, so the exception landed during
               * hydration and the app rendered nothing at all — a white rectangle with no
               * error visible on this page.
               *
               * The usual objection is that `allow-scripts` plus `allow-same-origin` lets a
               * frame remove its own sandbox attribute, which makes the sandbox close to
               * decorative. That objection is about untrusted content. These are twelve
               * first-party sites on a domain we control, listed by hand in `showcase.ts`;
               * what the sandbox is still buying here is no top-level navigation and no
               * downloads, which is worth keeping.
               */
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              src={url}
              title={`${name}, live preview`}
            />
          </div>
        </div>
      </div>
    </Stack>
  )
}
