import type { Metadata } from 'next'
import { GUIDES, GuideBody } from '../../../components/guide'

export const metadata: Metadata = {
  title: GUIDES.security.title,
  description: undefined,
}

export default function Page() {
  return <GuideBody slug={'security'} />
}
