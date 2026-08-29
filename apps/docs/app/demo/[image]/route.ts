import { DEMO_IMAGES } from '../../../lib/demo-images'
import { placeholderSvg } from '../../../lib/placeholder-image'

/**
 * `/demo/<name>.svg` — the site's own demo images, rendered at build time.
 *
 * Static, so the output is plain files on the CDN with no function behind them. An unknown
 * name is a 404, not a generated image: the list in `lib/demo-images.ts` is the contract,
 * and the blocks test checks every reference against it.
 */
export const dynamic = 'force-static'

export function generateStaticParams() {
  return Object.keys(DEMO_IMAGES).map((name) => ({ image: `${name}.svg` }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ image: string }> }) {
  const { image } = await params
  const name = image.endsWith('.svg') ? image.slice(0, -4) : image
  const options = DEMO_IMAGES[name]
  if (!options) return new Response('Not found', { status: 404 })
  return new Response(placeholderSvg({ seed: name, ...options }), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
