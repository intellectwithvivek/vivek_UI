import type { Metadata } from 'next'
import { GUIDES, GuideBody } from '../../../components/guide'
import { pageMeta } from '../../../lib/page-meta'

export const metadata: Metadata = pageMeta({
  title: GUIDES.typescript.title,
  description: GUIDES.typescript.description,
  path: '/docs/typescript',
})

export default function Page() {
  return <GuideBody slug={'typescript'} />
}
