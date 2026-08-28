import {
  Button,
  Container,
  Grid,
  Heading,
  Image,
  Section,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'

export default function CtaAppDownload() {
  return (
    <Section>
      <Container>
        <Grid
          cols={{ base: 1, md: 2 }}
          gap={6}
          style={{
            alignItems: 'center',
            padding: '2rem',
            borderRadius: 'var(--vk-radius-lg)',
            background: 'var(--vk-color-surface)',
            border: '1px solid var(--vk-color-border)',
          }}
        >
          <Stack gap={4}>
            <Heading level={2} size="lg">
              Take it with you
            </Heading>
            <Text tone="muted">
              Everything on the web app, offline on your phone, synced the moment you are back.
            </Text>
            <Stack direction="horizontal" gap={3} wrap>
              <Button variant="outline">App Store</Button>
              <Button variant="outline">Google Play</Button>
            </Stack>
          </Stack>
          <Image
            src="https://picsum.photos/seed/vk-app/900/700"
            alt="The app on a phone"
            ratio={9 / 7}
            rounded="md"
          />
        </Grid>
      </Container>
    </Section>
  )
}
