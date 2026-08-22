'use client'

import { Card, Newsletter } from '@the_viveksingh/vivek-ui'

export default function NewsletterPreview({ name }: { name: string }) {
  // A resolved promise stands in for the network call, so the busy and success states are
  // both reachable in the demo.
  const subscribe = () => new Promise<void>((resolve) => setTimeout(resolve, 900))

  if (name === 'stacked') {
    return (
      <Card padding="lg" variant="outline" style={{ maxWidth: '22rem' }}>
        <Newsletter
          description="One email a month. Unsubscribe in a click."
          layout="stacked"
          note="We never share your address."
          onSubscribe={subscribe}
          title="Product updates"
        />
      </Card>
    )
  }

  return (
    <Newsletter
      description="New components, release notes, and the occasional deep dive."
      note="No spam. Unsubscribe any time."
      onSubscribe={subscribe}
      title="Stay in the loop"
    />
  )
}
