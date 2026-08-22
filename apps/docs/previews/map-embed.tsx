'use client'

import { MapEmbed, Stack, Text } from '@the_viveksingh/vivek-ui'

export default function MapEmbedPreview({ name }: { name: string }) {
  if (name === 'google') {
    return (
      <Stack gap={3}>
        <MapEmbed provider="google" query="Bengaluru, India" title="Our Bengaluru office" />
        <Text size="sm" tone="muted">
          Google is gated behind a click by default: the iframe contacts Google and sets cookies the
          moment it renders, which is a consent problem the embedding site owns.
        </Text>
      </Stack>
    )
  }

  return (
    <Stack gap={3}>
      <MapEmbed lat={12.9716} lon={77.5946} title="Our Bengaluru office" zoom={13} />
      <Text size="sm" tone="muted">
        OpenStreetMap is the default. It sets no cookies and runs no analytics, so it loads straight
        away with nothing to consent to.
      </Text>
    </Stack>
  )
}
