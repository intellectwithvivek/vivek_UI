import { DEMO_IMAGES } from '../../../lib/demo-images'
import { placeholderSvg } from '../../../lib/placeholder-image'
import { placeholderPng } from '../../../lib/placeholder-png'

/**
 * `/demo/<name>.svg` — the site's own demo images, rendered at build time.
 *
 * Static, so the output is plain files on the CDN with no function behind them. An unknown
 * name is a 404, not a generated image: the list in `lib/demo-images.ts` is the contract,
 * and the blocks test checks every reference against it.
 */
export const dynamic = 'force-static'

export function generateStaticParams() {
  return Object.entries(DEMO_IMAGES).map(([name, options]) => ({
    image: `${name}.${options.raster ? 'png' : 'svg'}`,
  }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ image: string }> }) {
  const { image } = await params
  const png = image.endsWith('.png')
  const name = image.replace(/\.(svg|png)$/, '')
  const options = DEMO_IMAGES[name]
  // The extension decides the format; the name decides whether the image exists at all.
  // (Pinning the format to the entry's `raster` flag as well made a build-time render of
  // the PNG return "Not found" — nine bytes served as an image.)
  if (!options) return new Response('Not found', { status: 404 })
  const cache = { 'Cache-Control': 'public, max-age=31536000, immutable' }
  if (png) {
    // Safari ignores an SVG poster on a <video> and never fires the document's load event,
    // so anything used as a poster is served as a real raster image.
    return new Response(new Uint8Array(placeholderPng({ seed: name, ...options })), {
      headers: { 'Content-Type': 'image/png', ...cache },
    })
  }
  return new Response(placeholderSvg({ seed: name, ...options }), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', ...cache },
  })
}
