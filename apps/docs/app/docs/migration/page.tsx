import type { Metadata } from 'next'
import { GUIDES, GuideBody } from '../../../components/guide'
import { pageMeta } from '../../../lib/page-meta'

export const metadata: Metadata = pageMeta({
  title: GUIDES.migration.title,
  description: GUIDES.migration.description,
  path: '/docs/migration',
})

export default function Page() {
  return <GuideBody slug={'migration'} />
}
