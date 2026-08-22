import type { Metadata } from 'next'
import { GUIDES, GuideBody } from '../../../components/guide'
import { pageMeta } from '../../../lib/page-meta'

export const metadata: Metadata = pageMeta({
  title: GUIDES.styling.title,
  description: GUIDES.styling.description,
  path: '/docs/styling',
})

export default function Page() {
  return <GuideBody slug={'styling'} />
}
