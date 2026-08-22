import type { Metadata } from 'next'
import { GUIDES, GuideBody } from '../../../components/guide'
import { pageMeta } from '../../../lib/page-meta'

export const metadata: Metadata = pageMeta({
  title: GUIDES['server-components'].title,
  description: GUIDES['server-components'].description,
  path: '/docs/server-components',
})

export default function Page() {
  return <GuideBody slug={'server-components'} />
}
