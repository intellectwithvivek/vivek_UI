import { ImageResponse } from 'next/og'
import { SITE_NAME } from '../lib/site'

/**
 * Shared layout for the generated social cards.
 *
 * `next/og` renders through Satori, which supports a restricted subset of CSS: flexbox
 * only, no custom properties, no `gap` on some paths, and every element needs an explicit
 * `display`. So the palette is spelled out as literals here rather than read from tokens —
 * they mirror `tokens.css` and are checked against it by `og-card.test.ts`, because a
 * silent drift between the two would only ever be noticed on Twitter.
 */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

/** Mirrors tokens.css. Asserted, not assumed — see og-card.test.ts. */
export const OG_COLOURS = {
  bg: '#ffffff',
  fg: '#1d1d1f',
  muted: '#67676d',
  primary: '#0071e3',
  surfaceSubtle: '#f5f5f7',
  border: '#e3e3e8',
} as const

/**
 * Make a JSDoc description safe to draw on a card.
 *
 * Two problems, both invisible until you look at a rendered card:
 *
 * 1. Satori loads a font per glyph over the network and FAILS the request for anything the
 *    default face lacks. `⌘` in the CommandPalette description produced
 *    "Failed to download dynamic font. Status: 400" during the build and a blank glyph on
 *    the card. Anything outside Latin-1 plus common punctuation is dropped.
 * 2. The descriptions come from JSDoc, so they contain markdown backticks. Those are not
 *    rendered as code here - they just show up as backticks.
 */
const RENDERABLE = /[^\u0020-\u024f\u2013\u2014\u2018\u2019\u201c\u201d\u2026]/g

export function plainText(input: string): string {
  return (
    input
      .replace(/`/g, '')
      // Whitespace first: a newline falls outside the renderable range, so removing it
      // before collapsing would join the words on either side of it.
      .replace(/\s+/g, ' ')
      // Dashes and smart quotes are kept - the face has them, and a plain hyphen would be a
      // downgrade. Only genuinely unsupported glyphs are dropped.
      .replace(RENDERABLE, '')
      .replace(/\s+/g, ' ')
      .trim()
  )
}

export function ogCard(input: {
  eyebrow: string
  title: string
  description?: string
  chips?: string[]
}) {
  const { eyebrow, chips = [] } = input
  const title = plainText(input.title)
  const clean = input.description ? plainText(input.description) : undefined
  // Long component descriptions would overflow the card; Satori does not clamp text.
  const trimmed = clean && clean.length > 150 ? `${clean.slice(0, 147).trimEnd()}…` : clean

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: OG_COLOURS.bg,
        padding: '72px',
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: OG_COLOURS.primary,
            fontWeight: 600,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 24,
            fontSize: title.length > 22 ? 76 : 96,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: OG_COLOURS.fg,
            fontWeight: 700,
          }}
        >
          {title}
        </div>
        {trimmed ? (
          <div
            style={{
              display: 'flex',
              marginTop: 24,
              fontSize: 30,
              lineHeight: 1.4,
              color: OG_COLOURS.muted,
              maxWidth: 940,
            }}
          >
            {trimmed}
          </div>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {chips.map((chip) => (
            <div
              key={chip}
              style={{
                display: 'flex',
                padding: '10px 20px',
                borderRadius: 999,
                background: OG_COLOURS.surfaceSubtle,
                border: `1px solid ${OG_COLOURS.border}`,
                fontSize: 22,
                color: OG_COLOURS.fg,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: OG_COLOURS.fg, fontWeight: 600 }}>
          {SITE_NAME}
        </div>
      </div>
    </div>,
    OG_SIZE,
  )
}
