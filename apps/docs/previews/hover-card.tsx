'use client'

import {
  Avatar,
  Badge,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'

export default function HoverCardPreview() {
  return (
    <Stack gap={3}>
      <Text>
        Shipped by{' '}
        <HoverCard>
          <HoverCardTrigger href="#vivek">@vivek</HoverCardTrigger>
          <HoverCardContent>
            <Stack direction="horizontal" gap={3}>
              <Avatar name="Vivek Kumar Singh" size="lg" />
              <Stack gap={1}>
                <Text weight="semibold">Vivek Kumar Singh</Text>
                <Text size="sm" tone="muted">
                  Author of VivekUI. 97 components, zero dependencies.
                </Text>
                <Stack direction="horizontal" gap={2}>
                  <Badge size="sm" variant="soft">
                    maintainer
                  </Badge>
                  <Badge size="sm" tone="neutral" variant="soft">
                    since 2026
                  </Badge>
                </Stack>
              </Stack>
            </Stack>
          </HoverCardContent>
        </HoverCard>{' '}
        this morning.
      </Text>
      <Text size="sm" tone="muted">
        Hover the mention, or Tab to it — the card opens on focus too, immediately, because a
        keyboard user should not be denied a preview a mouse user gets. Everything in the card is
        also reachable elsewhere; a hover card is a shortcut, never the only path.
      </Text>
    </Stack>
  )
}
