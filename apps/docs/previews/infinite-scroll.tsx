'use client'

import { Card, InfiniteScroll, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

const PAGE = 8
const TOTAL = 40
/* Real records with real ids, not indices: the key must survive a reorder. */
const ITEMS = Array.from({ length: TOTAL }, (_, i) => ({
  id: `item-${i + 1}`,
  label: `Item ${i + 1}`,
}))

export default function InfiniteScrollPreview() {
  const [count, setCount] = useState(PAGE)

  return (
    <div style={{ maxHeight: '20rem', overflow: 'auto' }}>
      <InfiniteScroll
        endContent={
          <Text align="center" size="sm" tone="muted">
            All {TOTAL} items loaded — an ending you can see, not a spinner that never stops.
          </Text>
        }
        hasMore={count < TOTAL}
        onLoadMore={async () => {
          // A slow page, so the loader state is visible in the demo.
          await new Promise((resolve) => setTimeout(resolve, 600))
          setCount((current) => Math.min(current + PAGE, TOTAL))
        }}
      >
        <Stack gap={2}>
          {ITEMS.slice(0, count).map((item) => (
            <Card key={item.id} padding="sm" variant="outline">
              <Text size="sm">
                {item.label} of {TOTAL}
              </Text>
            </Card>
          ))}
        </Stack>
      </InfiniteScroll>
    </div>
  )
}
