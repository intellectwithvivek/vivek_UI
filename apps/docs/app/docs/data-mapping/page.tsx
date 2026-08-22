import type { Metadata } from 'next'
import { GUIDES, GuideBody } from '../../../components/guide'
import { pageMeta } from '../../../lib/page-meta'

export const metadata: Metadata = pageMeta({
  title: GUIDES['data-mapping'].title,
  description: GUIDES['data-mapping'].description,
  path: '/docs/data-mapping',
})

export default function Page() {
  return <GuideBody slug={'data-mapping'} />
}
