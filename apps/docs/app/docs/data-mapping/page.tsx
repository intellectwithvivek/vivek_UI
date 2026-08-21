import type { Metadata } from 'next'
import { GUIDES, GuideBody } from '../../../components/guide'

export const metadata: Metadata = {
  title: GUIDES['data-mapping'].title,
  description: undefined,
}

export default function Page() {
  return <GuideBody slug={'data-mapping'} />
}
