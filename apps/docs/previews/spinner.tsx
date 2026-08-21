import { Spinner, Stack } from '@the_viveksingh/vivek-ui'

export default function SpinnerPreview({ name }: { name: string }) {
  if (name === 'label') {
    return <Spinner label="Loading your workspace" />
  }
  return (
    <Stack direction="horizontal" gap={4} align="center">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </Stack>
  )
}
