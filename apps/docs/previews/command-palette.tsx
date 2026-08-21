'use client'

import { Button, CommandPalette, Kbd, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

const ENTRIES = [
  {
    heading: 'Navigate',
    items: [
      { id: 'overview', label: 'Overview', keywords: ['start', 'install'] },
      { id: 'button', label: 'Button', description: 'Component', keywords: ['cta', 'action'] },
      { id: 'charts', label: 'Charts', description: 'Six chart types', keywords: ['graph'] },
    ],
  },
  {
    heading: 'Actions',
    items: [
      { id: 'theme', label: 'Toggle dark mode', shortcut: 'T' },
      { id: 'copy', label: 'Copy install command', shortcut: 'C' },
      { id: 'soon', label: 'Export to PDF', disabled: true },
    ],
  },
]

export default function CommandPalettePreview() {
  const [open, setOpen] = useState(false)
  const [last, setLast] = useState<string | null>(null)

  return (
    <Stack gap={3} align="start">
      <Button onClick={() => setOpen(true)}>Open command palette</Button>
      <Text size="sm" tone="muted">
        Or press <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
        {last ? ` - you picked "${last}"` : ''}
      </Text>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        placeholder="Search components, charts and pages"
        items={ENTRIES}
        onSelect={(item) => setLast(item.label)}
      />
    </Stack>
  )
}
