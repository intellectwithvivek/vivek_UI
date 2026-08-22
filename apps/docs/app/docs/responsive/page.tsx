import type { Metadata } from 'next'
import { GUIDES, GuideBody } from '../../../components/guide'
import { pageMeta } from '../../../lib/page-meta'

export const metadata: Metadata = pageMeta({
  title: GUIDES.responsive.title,
  description: GUIDES.responsive.description,
  path: '/docs/responsive',
})

export default function Page() {
  return <GuideBody slug={'responsive'} />
}
