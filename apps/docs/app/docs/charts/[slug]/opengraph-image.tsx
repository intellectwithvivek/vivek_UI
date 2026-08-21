import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '../../../../components/og-card'
import { registry } from '../../../../lib/registry'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return registry.charts.map((entry) => ({ slug: entry.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = registry.charts.find((item) => item.slug === slug)

  return ogCard({
    eyebrow: 'Chart',
    title: entry?.title ?? 'Chart',
    description: entry?.description,
    chips: ['Pure SVG', 'No chart library', 'Accessible table fallback'],
  })
}
