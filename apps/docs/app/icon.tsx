import { ImageResponse } from 'next/og'

/**
 * The default favicon, generated at build time.
 *
 * Generated rather than committed as a binary so the site is never iconless — a missing
 * favicon is the most visible possible sign of an unfinished site, and it shows up in every
 * browser tab. Drop a `favicon.ico` into `public/branding/` to replace it; see the note in
 * `layout.tsx` about which one wins.
 *
 * 32×32 because that is what a browser tab actually renders. Designing at a larger size and
 * letting the browser downscale is how icons end up as mush: at 32px there is room for one
 * letterform and nothing else, so the mark here is a single glyph on a solid field.
 */
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Literals, not tokens: Satori cannot resolve CSS custom properties. Kept in step
        // with tokens.css by `lib/branding.test.ts`.
        background: '#0071e3',
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 700,
        // A tab icon is clipped to a rounded square by most browsers anyway; the radius
        // here keeps the corners from looking accidental where it is not.
        borderRadius: 7,
        fontFamily: 'Helvetica, Arial, sans-serif',
        // Optical centring: the glyph's own bearing sits it slightly low otherwise.
        lineHeight: 1,
        paddingBottom: 1,
      }}
    >
      V
    </div>,
    size,
  )
}
