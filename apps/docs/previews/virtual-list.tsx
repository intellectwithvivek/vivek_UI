'use client'

import { Badge, Stack, Text, VirtualList } from '@the_viveksingh/vivek-ui'
import { useMemo, useState } from 'react'

interface Row {
  id: number
  name: string
  email: string
  status: 'Active' | 'Invited' | 'Suspended'
}

const STATUSES = ['Active', 'Invited', 'Suspended'] as const
const TONE = { Active: 'success', Invited: 'warning', Suspended: 'danger' } as const

/*
 * Fifty thousand rows, built once. This is the number that makes the point: rendering them
 * all mounts 50,000 components and locks the tab for seconds. The preview stays responsive
 * because only the visible dozen are ever in the DOM.
 */
function useRows(count: number): Row[] {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        name: `Customer ${i.toLocaleString()}`,
        email: `customer${i}@example.com`,
        status: STATUSES[i % 3] ?? 'Active',
      })),
    [count],
  )
}

export default function VirtualListPreview({ name }: { name: string }) {
  const rows = useRows(50_000)
  const [range, setRange] = useState({ start: 0, end: 0 })

  if (name === 'variable') {
    return (
      <VirtualList
        aria-describedby={undefined}
        getKey={(row) => row.id}
        items={rows.slice(0, 5_000)}
        // Every third row is taller. Heights are estimated, then corrected by measurement
        // as each row renders.
        itemHeight={(index) => (index % 3 === 0 ? 88 : 52)}
        label="Customers with variable row heights"
        style={{ height: '20rem', border: '1px solid var(--vk-color-border)' }}
      >
        {(row, index) => (
          <div style={{ padding: 'var(--vk-space-3) var(--vk-space-4)' }}>
            <Text weight="medium">{row.name}</Text>
            {index % 3 === 0 ? (
              <Text size="sm" tone="muted">
                {row.email} · this row is taller, and was measured rather than assumed
              </Text>
            ) : null}
          </div>
        )}
      </VirtualList>
    )
  }

  return (
    <Stack gap={3}>
      <Stack direction="horizontal" gap={3} align="center" wrap>
        <Badge tone="primary" variant="soft">
          {rows.length.toLocaleString()} rows
        </Badge>
        <Text size="sm" tone="muted">
          Rendering rows {range.start.toLocaleString()}–{range.end.toLocaleString()} — everything
          else is a scrollbar offset, not a DOM node.
        </Text>
      </Stack>

      <VirtualList
        getKey={(row) => row.id}
        items={rows}
        itemHeight={56}
        label="All customers"
        onRangeChange={setRange}
        style={{ height: '20rem', border: '1px solid var(--vk-color-border)' }}
      >
        {(row) => (
          <Stack
            align="center"
            direction="horizontal"
            gap={3}
            justify="between"
            style={{
              padding: 'var(--vk-space-3) var(--vk-space-4)',
              borderBlockEnd: '1px solid var(--vk-color-border-subtle)',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            <Stack gap={1} style={{ minWidth: 0 }}>
              <Text size="sm" weight="medium" truncate>
                {row.name}
              </Text>
              <Text size="sm" tone="muted" truncate>
                {row.email}
              </Text>
            </Stack>
            <Badge tone={TONE[row.status]} variant="soft">
              {row.status}
            </Badge>
          </Stack>
        )}
      </VirtualList>
    </Stack>
  )
}
