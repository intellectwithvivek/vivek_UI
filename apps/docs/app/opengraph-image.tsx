import { ImageResponse } from 'next/og'
import { registry } from '../lib/registry'
import { SITE_NAME } from '../lib/site'

/**
 * The default social card, used by any route that does not define its own.
 *
 * Generated rather than a checked-in PNG so the counts in it cannot go stale — a card
 * claiming "83 components" after the library reaches 90 is a small, permanent lie in the
 * most-shared asset on the site.
 *
 * `next/og` renders a restricted subset of CSS via Satori: no custom properties, no
 * `gap` shorthand quirks, flexbox only. So the values here are literals, deliberately, and
 * they mirror the token palette rather than reading it.
 */
export const alt = `${SITE_NAME} — a free, zero-dependency React component library`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  const components = registry.components.length
  const charts = registry.charts.length

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#ffffff',
        padding: '72px',
        // Satori has no access to --vk-font-sans, so the stack is spelled out.
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#0071e3',
            fontWeight: 600,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 78,
            lineHeight: 1.05,
            // Matches the -0.03em the hero heading uses in the real stylesheet.
            letterSpacing: '-0.03em',
            color: '#1d1d1f',
            fontWeight: 700,
            maxWidth: 940,
          }}
        >
          Build the whole interface with one install
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 32,
            color: '#67676d',
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          {components} accessible React components and {charts} SVG charts. Zero runtime
          dependencies, MIT licensed.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {['Zero dependencies', 'Server-safe', 'No Tailwind needed', 'Free forever'].map((chip) => (
          <div
            key={chip}
            style={{
              display: 'flex',
              padding: '12px 22px',
              borderRadius: 999,
              background: '#f5f5f7',
              border: '1px solid #e3e3e8',
              fontSize: 24,
              color: '#424245',
            }}
          >
            {chip}
          </div>
        ))}
      </div>
    </div>,
    size,
  )
}
