import {
  Badge,
  Button,
  Card,
  Container,
  Heading,
  Section,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'

export default function PricingSingle() {
  return (
    <Section background="muted">
      <Container size="sm">
        <Card padding="lg" variant="elevated">
          <Stack align="center" gap={4} style={{ textAlign: 'center' }}>
            <Badge pill variant="soft">
              One plan
            </Badge>
            <Heading level={2} size="lg">
              Everything, for everyone
            </Heading>
            <Stack direction="horizontal" align="baseline" gap={1} justify="center">
              <Heading level={3} size="hero">
                $19
              </Heading>
              <Text tone="muted">/month</Text>
            </Stack>
            <Text tone="muted">
              Unlimited projects, unlimited collaborators, every feature we ship. No tiers, no
              surprise upgrade prompts.
            </Text>
            <Button size="lg" fullWidth>
              Start a 14-day trial
            </Button>
            <Text size="sm" tone="muted">
              No card needed. Cancel in one click.
            </Text>
          </Stack>
        </Card>
      </Container>
    </Section>
  )
}
