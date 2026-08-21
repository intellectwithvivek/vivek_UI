import { Kbd, Stack, Text } from '@the_viveksingh/vivek-ui'

export default function KbdPreview({ name }: { name: string }) {
  if (name === 'inline') {
    return (
      <Text>
        Press <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> to open the command palette.
      </Text>
    )
  }
  return (
    <Stack direction="horizontal" gap={3} align="center" wrap>
      <Kbd size="sm">Esc</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd>Shift</Kbd>
      <Kbd>Tab</Kbd>
    </Stack>
  )
}
