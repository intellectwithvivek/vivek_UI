import { Avatar, Stack } from '@the_viveksingh/vivek-ui'

export default function AvatarPreview({ name }: { name: string }) {
  if (name === 'group') {
    return (
      <Avatar.Group>
        <Avatar name="Vivek Kumar Singh" />
        <Avatar name="Aditi Sharma" />
        <Avatar name="Rahul Verma" />
        <Avatar fallback="+4" />
      </Avatar.Group>
    )
  }
  if (name === 'shapes') {
    return (
      <Stack direction="horizontal" gap={4} align="center">
        <Avatar name="Vivek Kumar Singh" shape="circle" />
        <Avatar name="Vivek Kumar Singh" shape="square" />
      </Stack>
    )
  }
  return (
    <Stack direction="horizontal" gap={4} align="center">
      <Avatar name="Vivek Kumar Singh" size="xs" />
      <Avatar name="Vivek Kumar Singh" size="sm" />
      <Avatar name="Vivek Kumar Singh" size="md" />
      <Avatar name="Vivek Kumar Singh" size="lg" />
      <Avatar name="Vivek Kumar Singh" size="xl" />
    </Stack>
  )
}
