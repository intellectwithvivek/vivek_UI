'use client'

import { Segmented, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

export default function SegmentedPreview({ name }: { name: string }) {
  const [view, setView] = useState('list')
  const [range, setRange] = useState('30d')

  if (name === 'sizes') {
    return (
      <Stack gap={3}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Segmented
            defaultValue="day"
            key={size}
            label={`Zoom, ${size}`}
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
            size={size}
          />
        ))}
      </Stack>
    )
  }

  return (
    <Stack gap={4}>
      <Stack gap={2}>
        <Segmented
          label="View"
          onValueChange={setView}
          options={[
            { value: 'list', label: 'List' },
            { value: 'board', label: 'Board' },
            { value: 'timeline', label: 'Timeline' },
          ]}
          value={view}
        />
        <Text size="sm" tone="muted">
          Showing the {view} view. Tab reaches the checked segment; arrows move and select in one
          keystroke, because a radio you land on is a radio you chose.
        </Text>
      </Stack>

      <Segmented
        fullWidth
        label="Date range"
        onValueChange={setRange}
        options={[
          { value: '7d', label: '7 days' },
          { value: '30d', label: '30 days' },
          { value: '90d', label: '90 days' },
          { value: 'all', label: 'All time', disabled: true },
        ]}
        value={range}
      />
    </Stack>
  )
}
