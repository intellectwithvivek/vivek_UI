'use client'

import { Badge, ChatInput, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

interface Sent {
  id: number
  text: string
}

export default function ChatInputPreview({ name }: { name: string }) {
  // Keyed by a counter rather than by index or text: sending the same message twice is
  // ordinary, and both of those keys collide when it happens.
  const [sent, setSent] = useState<Sent[]>([])

  if (name === 'busy') {
    return (
      <ChatInput
        busy
        defaultValue="Waiting for the model to finish..."
        label="Message"
        hideLabel
        hint="Send is disabled while busy, so a request cannot be fired twice."
      />
    )
  }
  if (name === 'attachments') {
    return (
      <ChatInput
        label="Message"
        hideLabel
        placeholder="Describe the change you want"
        attachments={
          <Stack direction="horizontal" gap={2} wrap>
            <Badge tone="neutral">screenshot.png</Badge>
            <Badge tone="neutral">logs.txt</Badge>
          </Stack>
        }
      />
    )
  }
  return (
    <Stack gap={3}>
      {sent.length > 0 ? (
        <Stack gap={1}>
          {sent.map((message) => (
            <Text key={message.id} size="sm" tone="muted">
              Sent: {message.text}
            </Text>
          ))}
        </Stack>
      ) : null}
      <ChatInput
        label="Message"
        hideLabel
        placeholder="Ask anything. Enter sends, Shift+Enter adds a line."
        maxRows={6}
        onSubmit={(value) =>
          setSent((prev) => [...prev, { id: (prev.at(-1)?.id ?? 0) + 1, text: value }])
        }
      />
    </Stack>
  )
}
