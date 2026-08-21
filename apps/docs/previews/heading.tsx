import { Heading, Stack } from '@the_viveksingh/vivek-ui'

export default function HeadingPreview({ name }: { name: string }) {
  if (name === 'sizeVsLevel') {
    return (
      <Stack gap={3}>
        <Heading level={2} size="md">
          An h2 that looks small
        </Heading>
        <Heading level={4} size="2xl">
          An h4 that looks large
        </Heading>
      </Stack>
    )
  }
  return (
    <Stack gap={3}>
      <Heading level={1}>Level 1</Heading>
      <Heading level={2}>Level 2</Heading>
      <Heading level={3}>Level 3</Heading>
      <Heading level={4}>Level 4</Heading>
    </Stack>
  )
}
