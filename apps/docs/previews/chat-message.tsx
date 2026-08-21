/*
 * biome-ignore-all lint/a11y/useValidAriaRole: `role` here is ChatMessage's own prop -
 * 'user' | 'assistant' | 'system', matching the shape chat APIs return - not the DOM
 * `role` attribute. The rule cannot tell the difference on a capitalised component, and
 * its offered fix deletes the prop, so suppressing it beats taking the "fix".
 */
import { Avatar, Button, ChatMessage, Stack } from '@the_viveksingh/vivek-ui'

const AT = new Date(2026, 7, 21, 10, 42)

export default function ChatMessagePreview({ name }: { name: string }) {
  if (name === 'states') {
    return (
      <Stack gap={4}>
        <ChatMessage role="user" content="Sending this one now" status="sending" timestamp={AT} />
        <ChatMessage role="user" content="This one landed" status="sent" timestamp={AT} />
        <ChatMessage
          role="user"
          content="This one failed to send"
          status="error"
          timestamp={AT}
          actions={
            <Button size="sm" variant="ghost">
              Retry
            </Button>
          }
        />
      </Stack>
    )
  }
  if (name === 'flat') {
    return (
      <Stack gap={4}>
        <ChatMessage variant="flat" role="user" name="You" content="Summarise this thread." />
        <ChatMessage
          variant="flat"
          role="assistant"
          name="Assistant"
          content="Three open questions remain: pricing, the migration window, and who signs off."
        />
      </Stack>
    )
  }
  return (
    <Stack gap={4}>
      <ChatMessage
        role="system"
        content="You are chatting with the support assistant."
        timestamp={AT}
      />
      <ChatMessage
        role="user"
        name="You"
        avatar={<Avatar name="Vivek Kumar Singh" size="sm" />}
        content="How do I override a component's padding?"
        timestamp={AT}
        status="sent"
      />
      <ChatMessage
        role="assistant"
        name="Assistant"
        avatar={<Avatar fallback="AI" size="sm" />}
        content="Pass a className. Library selectors sit inside :where(), so they carry no specificity and your class wins outright."
        timestamp={AT}
      />
    </Stack>
  )
}
