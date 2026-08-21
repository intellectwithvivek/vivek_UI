import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '../../../../components/og-card'
import { registry } from '../../../../lib/registry'

/**
 * A social card per component, so a link shared in a Slack channel or a tweet shows which
 * component it points at rather than the same generic site card 83 times over.
 *
 * `generateStaticParams` mirrors the page's, so these are rendered at build time and served
 * as static files — a card generated on request is a cold-start on the first crawl, which
 * some scrapers time out on and then cache as "no image".
 */
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return registry.components.map((entry) => ({ slug: entry.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = registry.components.find((item) => item.slug === slug)

  return ogCard({
    eyebrow: entry?.category ?? 'Component',
    title: entry?.title ?? 'Component',
    description: entry?.description,
    chips: [
      // The single most useful fact about a component at a glance, for anyone weighing
      // whether it will cost them a client boundary.
      entry?.isClient ? 'Client component' : 'Server-safe',
      'Zero dependencies',
      'MIT',
    ],
  })
}
