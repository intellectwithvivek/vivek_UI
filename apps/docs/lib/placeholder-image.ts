/**
 * Demo images, generated locally as SVG.
 *
 * The obvious answer for image demos is Lorem Picsum or Unsplash Source, and it is the wrong
 * one for a documentation site:
 *
 * - **It is a third-party request on every page view.** A docs site that fetches images from
 *   someone else's server is slower, leaks the visitor's IP to that server, and breaks
 *   entirely when the service rate-limits or goes down. Unsplash Source was in fact retired.
 * - **It is a licence question nobody wants.** "Free" image services change terms; committing
 *   photographs means auditing each one forever.
 * - **It makes the demo non-deterministic.** A random photo per load means the preview looks
 *   different every time, which is useless for judging a component.
 *
 * These are deterministic gradients built from a seed. Zero requests, no licence, identical
 * every render, and they work offline and in CI. They are obviously placeholders, which is
 * honest: a docs page showing stock photography implies the library supplies it.
 *
 * Two forms: `placeholderImage()` returns a data URI for previews to pass straight to
 * `<Image src>`; `placeholderSvg()` returns the SVG document, which `app/demo/[image]/route.ts`
 * serves at `/demo/<name>.svg` so the blocks — which may import only from the package — can
 * reference a picture that is still ours.
 *
 * The palettes are picked to sit alongside the token colours rather than fight them.
 */

/** Deterministic hash, so the same seed always yields the same image. */
function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * Hue pairs that read as photographic rather than as a test card: dusk, forest, ember,
 * ocean, orchid, slate.
 */
const PALETTES: Array<[number, number]> = [
  [212, 265],
  [150, 190],
  [18, 45],
  [195, 225],
  [280, 320],
  [210, 240],
]

export interface PlaceholderOptions {
  /** Same seed, same image. Use the item's name or id. */
  seed: string
  width?: number
  height?: number
  /** Short caption drawn into the corner, so a demo image explains itself. */
  label?: string
}

/** The SVG document for a placeholder. */
export function placeholderSvg({
  seed,
  width = 800,
  height = 600,
  label,
}: PlaceholderOptions): string {
  const h = hash(seed)
  const palette = PALETTES[h % PALETTES.length] ?? [212, 265]
  const [h1, h2] = palette
  const angle = h % 360
  const id = `g${h % 9999}`

  // Two soft radial highlights over a linear base reads as depth rather than as a flat
  // swatch, without needing a real photograph.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
<defs>
<linearGradient id="${id}" gradientTransform="rotate(${angle} 0.5 0.5)">
<stop offset="0%" stop-color="hsl(${h1} 62% 58%)"/>
<stop offset="100%" stop-color="hsl(${h2} 58% 38%)"/>
</linearGradient>
<radialGradient id="${id}b" cx="25%" cy="20%" r="60%">
<stop offset="0%" stop-color="hsl(${h1} 90% 78%)" stop-opacity="0.55"/>
<stop offset="100%" stop-color="hsl(${h1} 90% 78%)" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="${width}" height="${height}" fill="url(#${id})"/>
<rect width="${width}" height="${height}" fill="url(#${id}b)"/>
${
  label
    ? `<text x="${width / 2}" y="${height / 2}" fill="rgba(255,255,255,0.92)" font-family="system-ui,sans-serif" font-size="${Math.round(height / 14)}" font-weight="600" text-anchor="middle" dominant-baseline="middle">${escapeXml(label)}</text>`
    : ''
}
</svg>`
}

/**
 * An SVG data URI. Safe to pass straight to `<Image src>`.
 *
 * Not base64: a URI-encoded SVG is smaller than the same SVG base64-encoded, and it stays
 * readable in devtools, which matters when someone is trying to work out what a demo is
 * doing.
 */
export function placeholderImage(options: PlaceholderOptions): string {
  return `data:image/svg+xml,${encodeURIComponent(placeholderSvg(options).replace(/\n/g, ''))}`
}

/** XML-escape, so a label containing `&` or `<` cannot break the SVG. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** A deliberately broken URL, for demonstrating the failure state. */
export const BROKEN_IMAGE = '/branding/this-file-does-not-exist.png'
