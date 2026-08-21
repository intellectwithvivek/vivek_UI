import { Container, Stack, Text } from '@the_viveksingh/vivek-ui'

export default function ContainerPreview({ name }: { name: string }) {
  if (name === 'sizes') {
    return (
      <Stack gap={3}>
        <Container size="sm" className="preview-panel">
          <Text>size=&quot;sm&quot;</Text>
        </Container>
        <Container size="md" className="preview-panel">
          <Text>size=&quot;md&quot;</Text>
        </Container>
        <Container size="lg" className="preview-panel">
          <Text>size=&quot;lg&quot;</Text>
        </Container>
      </Stack>
    )
  }
  return (
    <Container className="preview-panel">
      <Text>Centred, max-width capped, with responsive side padding.</Text>
    </Container>
  )
}
