import type { Metadata } from 'next'
import { GUIDES, GuideBody } from '../../../components/guide'
import { pageMeta } from '../../../lib/page-meta'

export const metadata: Metadata = pageMeta({
  title: GUIDES['quick-start'].title,
  description: GUIDES['quick-start'].description,
  path: '/docs/quick-start',
})

export default function Page() {
  return <GuideBody slug={'quick-start'} />
}
