import type { Metadata } from 'next'
import { GUIDES, GuideBody } from '../../../components/guide'

export const metadata: Metadata = {
  title: GUIDES.accessibility.title,
  description: undefined,
}

export default function Page() {
  return <GuideBody slug={'accessibility'} />
}
