'use client'

import { Chip, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

const TAGS = ['Design', 'Engineering', 'Docs', 'A11y']

export default function ChipPreview({ name }: { name: string }) {
  const [tags, setTags] = useState(TAGS)
  const [filters, setFilters] = useState<string[]>(['Open'])

  if (name === 'tones') {
    return (
      <Stack direction="horizontal" gap={2} wrap>
        <Chip tone="neutral">Draft</Chip>
        <Chip tone="primary">In review</Chip>
        <Chip tone="success">Shipped</Chip>
        <Chip tone="warning">Blocked</Chip>
        <Chip tone="danger">Failing</Chip>
      </Stack>
    )
  }

  return (
    <Stack gap={4}>
      <Stack gap={2}>
        <Text size="sm" weight="semibold">
          Filters — each chip is a real toggle button
        </Text>
        <Stack direction="horizontal" gap={2} wrap>
          {['Open', 'Mine', 'Urgent'].map((filter) => (
            <Chip
              key={filter}
              onSelectedChange={(on) =>
                setFilters((current) =>
                  on ? [...current, filter] : current.filter((f) => f !== filter),
                )
              }
              selectable
              selected={filters.includes(filter)}
            >
              {filter}
            </Chip>
          ))}
        </Stack>
        <Text size="sm" tone="muted">
          Showing: {filters.length > 0 ? filters.join(', ') : 'everything'}
        </Text>
      </Stack>

      <Stack gap={2}>
        <Text size="sm" weight="semibold">
          Removable — Delete or Backspace works on the focused chip
        </Text>
        <Stack direction="horizontal" gap={2} wrap>
          {tags.map((tag) => (
            <Chip
              key={tag}
              onRemove={() => setTags((current) => current.filter((t) => t !== tag))}
              removeLabel={`Remove ${tag}`}
              tone="primary"
            >
              {tag}
            </Chip>
          ))}
          {tags.length === 0 ? (
            <Text size="sm" tone="muted">
              All removed.
            </Text>
          ) : null}
        </Stack>
      </Stack>
    </Stack>
  )
}
