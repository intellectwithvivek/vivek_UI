import type { Metadata } from 'next'
import { GUIDES, GuideBody } from '../../../components/guide'

export const metadata: Metadata = {
  title: GUIDES['server-components'].title,
  description: undefined,
}

export default function Page() {
  return <GuideBody slug={'server-components'} />
}
