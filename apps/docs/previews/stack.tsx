import { Box, Stack, Text } from '@the_viveksingh/vivek-ui'
import type { ReactNode } from 'react'

function Tile({ children }: { children: ReactNode }) {
  return <Box className="preview-tile">{children}</Box>
}

export default function StackPreview({ name }: { name: string }) {
  if (name === 'horizontal') {
    return (
      <Stack direction="horizontal" gap={3} wrap>
        <Tile>One</Tile>
        <Tile>Two</Tile>
        <Tile>Three</Tile>
      </Stack>
    )
  }
  if (name === 'justify') {
    return (
      <Stack direction="horizontal" justify="between" align="center" gap={3}>
        <Text weight="semibold">Total</Text>
        <Text>$4,280.00</Text>
      </Stack>
    )
  }
  return (
    <Stack gap={3}>
      <Tile>Vertical by default</Tile>
      <Tile>Gap sits on the --vk-space scale</Tile>
      <Tile>No margins to collapse</Tile>
    </Stack>
  )
}
