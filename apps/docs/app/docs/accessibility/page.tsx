import type { Metadata } from 'next'
import { GUIDES, GuideBody } from '../../../components/guide'
import { pageMeta } from '../../../lib/page-meta'

export const metadata: Metadata = pageMeta({
  title: GUIDES.accessibility.title,
  description: GUIDES.accessibility.description,
  path: '/docs/accessibility',
})

export default function Page() {
  return <GuideBody slug={'accessibility'} />
}
