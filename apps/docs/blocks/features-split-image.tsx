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

const POINTS = [
  'Suggested replies drafted from your own past answers',
  'Every conversation tagged and routed before a human reads it',
  'A weekly digest of what customers asked that you could not answer',
]

export default function FeaturesSplitImage() {
  return (
    <Section>
      <Container>
        <Grid cols={{ base: 1, md: 2 }} gap={8} style={{ alignItems: 'center' }}>
          <Stack gap={4}>
            <Text size="sm" tone="muted" weight="medium">
              Inbox
            </Text>
            <Heading level={2} size="xl">
              Answer in minutes, not by Monday
            </Heading>
            <Text tone="muted">
              A shared inbox that reads every message first, so your team opens the ones that need a
              person and the rest are already handled.
            </Text>
            <ul
              style={{ margin: 0, paddingInlineStart: '1.25rem', display: 'grid', gap: '0.5rem' }}
            >
              {POINTS.map((point) => (
                <li key={point}>
                  <Text as="span" size="sm">
                    {point}
                  </Text>
                </li>
              ))}
            </ul>
            <div>
              <Button>See the inbox</Button>
            </div>
          </Stack>
          <Image
            src="https://picsum.photos/seed/vk-inbox/1200/900"
            alt="The shared inbox with a suggested reply open"
            ratio={4 / 3}
            rounded="lg"
          />
        </Grid>
      </Container>
    </Section>
  )
}
