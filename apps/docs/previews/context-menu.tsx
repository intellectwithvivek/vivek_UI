'use client'

import { ContextMenu, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

export default function ContextMenuPreview() {
  const [last, setLast] = useState<string | null>(null)

  return (
    <Stack gap={3}>
      <ContextMenu>
        <ContextMenu.Trigger
          className="preview-tile"
          style={{ minHeight: '9rem', display: 'grid', placeItems: 'center' }}
        >
          <Text tone="muted">Right-click here — or focus it and press Shift+F10</Text>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Label>Report</ContextMenu.Label>
          <ContextMenu.Item onSelect={() => setLast('Duplicate')} shortcut="⌘D">
            Duplicate
          </ContextMenu.Item>
          <ContextMenu.Item onSelect={() => setLast('Rename')} shortcut="F2">
            Rename
          </ContextMenu.Item>
          <ContextMenu.Item disabled shortcut="⌘P">
            Print
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item onSelect={() => setLast('Move to trash')} shortcut="⌫">
            Move to trash
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
      <Text size="sm" tone="muted">
        {last
          ? `Selected: ${last}.`
          : 'Nothing selected yet. Escape returns focus to where it was.'}
      </Text>
    </Stack>
  )
}
