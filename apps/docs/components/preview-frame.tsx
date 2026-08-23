'use client'

import { Button, Stack, Text } from '@the_viveksingh/vivek-ui'
import { type ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Render a whole page demo inside an iframe, in the same React tree.
 *
 * The obvious approach — drop the template into a bordered box on the page — gets one thing
 * badly wrong: `@media (min-width: …)` reads the *viewport*, not the box. So a "mobile"
 * preview 390 pixels wide would still be laid out with every desktop breakpoint active,
 * which makes the responsive preview a lie. An iframe has its own viewport, so the media
 * queries answer honestly.
 *
 * There is no second route behind this and no second render: the children are portalled into
 * the frame's document, so they are the same components, with the same props, that the code
 * beneath them describes. What has to be carried across the boundary by hand is the styling,
 * because a fresh document inherits none of it:
 *
 *   - every stylesheet in the host `<head>` is cloned into the frame's head, and
 *   - `data-theme` and `data-accent` are mirrored from the host `<html>` and kept in sync,
 *     so switching the site's theme switches the preview with it.
 */

const WIDTHS = [
  { id: 'phone', label: 'Phone', width: 390, hint: '390px' },
  { id: 'tablet', label: 'Tablet', width: 834, hint: '834px' },
  { id: 'desktop', label: 'Desktop', width: 0, hint: 'Full width' },
] as const

type WidthId = (typeof WIDTHS)[number]['id']

const MIRRORED = ['data-theme', 'data-accent', 'class', 'style'] as const

export interface PreviewFrameProps {
  children: ReactNode
  /** Accessible name of the frame. Say which page it is showing. */
  title: string
  /** Frame height in pixels. The page inside scrolls. */
  height?: number
}

/** Set on a document once its stylesheets have been cloned in, so `attach` is idempotent. */
const WIRED = 'data-vk-preview-wired'

export function PreviewFrame({ children, title, height = 680 }: PreviewFrameProps) {
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null)
  const [doc, setDoc] = useState<Document | null>(null)
  const [width, setWidth] = useState<WidthId>('desktop')

  // Wire up the frame's document once it exists: clone the stylesheets in, mirror the theme,
  // and keep mirroring it.
  useEffect(() => {
    if (!frame) return

    const attach = () => {
      const target = frame.contentDocument
      if (!target?.body) return
      // Already wired. `load` can fire after the synchronous attach below, and cloning the
      // stylesheets twice would double every rule.
      if (target.documentElement.hasAttribute(WIRED)) return
      target.documentElement.setAttribute(WIRED, '')

      for (const node of Array.from(
        document.head.querySelectorAll('style, link[rel=stylesheet]'),
      )) {
        target.head.appendChild(node.cloneNode(true))
      }

      // The frame's own document element, not the host's: without these the preview renders
      // on the browser default background rather than the theme's.
      target.body.style.margin = '0'
      target.body.style.background = 'var(--vk-color-bg)'
      target.body.style.color = 'var(--vk-color-fg)'
      target.body.style.minHeight = '100vh'

      setDoc(target)
    }

    /*
     * Attach now if the document is usable, and on `load` either way.
     *
     * The first version of this used `srcDoc`, and it never rendered anything. At the moment
     * the ref fires, `contentDocument` is the iframe's *initial* `about:blank` — whose
     * `readyState` is already `complete` — so it attached to that, and the browser then
     * threw that document away and replaced it with the parsed `srcdoc` one. The portal was
     * left rendering into the body of a discarded document: no error, no warning, an empty
     * frame in every viewport.
     *
     * With no `src` and no `srcDoc` the `about:blank` document is the real one and is never
     * replaced. The `load` listener stays because a few browsers do not have the body ready
     * synchronously; `attach` is idempotent so running twice is harmless.
     */
    attach()
    frame.addEventListener('load', attach)
    return () => frame.removeEventListener('load', attach)
  }, [frame])

  useEffect(() => {
    if (!doc) return
    const host = document.documentElement
    const target = doc.documentElement

    const sync = () => {
      for (const name of MIRRORED) {
        const value = host.getAttribute(name)
        if (value === null) target.removeAttribute(name)
        else target.setAttribute(name, value)
      }
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(host, { attributes: true, attributeFilter: [...MIRRORED] })
    return () => observer.disconnect()
  }, [doc])

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

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: chosen.width > 0 ? 'var(--vk-space-4)' : 0,
          background: 'var(--vk-color-surface-sunken)',
          border: '1px solid var(--vk-color-border)',
          borderRadius: 'var(--vk-radius-lg)',
          overflow: 'hidden',
        }}
      >
        <iframe
          // Deliberately no `src` and no `srcDoc` — see the effect above. The iframe gets
          // `about:blank`, which is same-origin and never replaced out from under the portal.
          ref={setFrame}
          style={{
            width: chosen.width > 0 ? `${chosen.width}px` : '100%',
            maxWidth: '100%',
            height: `${height}px`,
            border: chosen.width > 0 ? '1px solid var(--vk-color-border)' : 'none',
            borderRadius: chosen.width > 0 ? 'var(--vk-radius-md)' : 0,
            background: 'var(--vk-color-bg)',
            colorScheme: 'normal',
            display: 'block',
          }}
          title={title}
        />
        {doc ? createPortal(children, doc.body) : null}
      </div>
    </Stack>
  )
}
