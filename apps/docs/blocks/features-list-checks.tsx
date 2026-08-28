import { Container, Grid, Section, Stack, Text } from '@the_viveksingh/vivek-ui'

const INCLUDED = [
  'Unlimited projects and collaborators',
  'Preview deployments for every branch',
  'Custom domains with automatic TLS',
  'Edge caching in 35 regions',
  'Log drains and OpenTelemetry export',
  'Role-based access control',
  'Audit log with 400-day retention',
  'SAML single sign-on',
  '99.99% uptime SLA',
  'Priority support, 1-hour response',
]

const Check = () => (
  <svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18" style={{ flex: 'none' }}>
    <path
      d="M5 12l5 5L20 7"
      fill="none"
      stroke="var(--vk-color-success)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default function FeaturesListChecks() {
  return (
    <Section background="muted">
      <Container size="md">
        <Section.Header eyebrow="Included" title="Everything in every plan" align="center" />
        <Grid cols={{ base: 1, sm: 2 }} gap={3}>
          {INCLUDED.map((item) => (
            <Stack key={item} direction="horizontal" gap={2} align="center">
              <Check />
              <Text size="sm">{item}</Text>
            </Stack>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
