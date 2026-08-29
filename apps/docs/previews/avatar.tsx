import { Avatar, Stack, Text } from '@the_viveksingh/vivek-ui'
import { placeholderImage } from '../lib/placeholder-image'

const photo = (seed: string) => placeholderImage({ seed, width: 160, height: 160 })

export default function AvatarPreview({ name }: { name: string }) {
  if (name === 'group') {
    return (
      <Avatar.Group>
        <Avatar name="Vivek Kumar Singh" src={photo('vivek')} />
        <Avatar name="Aditi Sharma" src={photo('aditi')} />
        <Avatar name="Rahul Verma" src={photo('rahul')} />
        <Avatar fallback="+4" />
      </Avatar.Group>
    )
  }
  if (name === 'shapes') {
    return (
      <Stack direction="horizontal" gap={4} align="center">
        <Avatar name="Vivek Kumar Singh" src={photo('vivek')} shape="circle" />
        <Avatar name="Vivek Kumar Singh" src={photo('vivek')} shape="square" />
      </Stack>
    )
  }
  if (name === 'photo') {
    return (
      <Stack direction="horizontal" gap={4} align="center" wrap>
        <Avatar name="Aditi Sharma" src={photo('aditi')} size="lg" />
        <Avatar name="Aditi Sharma" size="lg" />
        <Avatar name="Aditi Sharma" src="/does-not-exist.jpg" size="lg" />
        <Text size="sm" tone="muted">
          With a photo, without one, and with one that failed to load — the initials are the
          fallback in both of the last two.
        </Text>
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
