import { Divider, Stack, Text } from '@the_viveksingh/vivek-ui'

export default function DividerPreview({ name }: { name: string }) {
  if (name === 'label') {
    return (
      <Stack gap={4}>
        <Text>Sign in with your email</Text>
        <Divider label="or" />
        <Text>Continue with a single sign-on provider</Text>
      </Stack>
    )
  }
  if (name === 'vertical') {
    return (
      <Stack direction="horizontal" gap={3} align="center" style={{ height: '2rem' }}>
        <Text>Docs</Text>
        <Divider orientation="vertical" />
        <Text>Components</Text>
        <Divider orientation="vertical" />
        <Text>Charts</Text>
      </Stack>
    )
  }
  return (
    <Stack gap={4}>
      <Text>Above the rule</Text>
      <Divider />
      <Text>Below the rule</Text>
    </Stack>
  )
}
