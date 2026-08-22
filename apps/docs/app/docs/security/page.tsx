import type { Metadata } from 'next'
import { GUIDES, GuideBody } from '../../../components/guide'
import { pageMeta } from '../../../lib/page-meta'

export const metadata: Metadata = pageMeta({
  title: GUIDES.security.title,
  description: GUIDES.security.description,
  path: '/docs/security',
})

export default function Page() {
  return <GuideBody slug={'security'} />
}
