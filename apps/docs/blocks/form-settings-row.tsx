import {
  Card,
  Container,
  Divider,
  Heading,
  Section,
  Stack,
  Switch,
  Text,
} from '@the_viveksingh/vivek-ui'

const PREFS = [
  {
    id: 'digest',
    label: 'Weekly digest',
    description: 'A summary of activity every Monday morning.',
    on: true,
  },
  {
    id: 'mentions',
    label: 'Mentions',
    description: 'Email me when someone mentions me.',
    on: true,
  },
  {
    id: 'marketing',
    label: 'Product news',
    description: 'Occasional updates about new features.',
    on: false,
  },
]

export default function FormSettingsRow() {
  return (
    <Section padding="md">
      <Container size="md">
        <Card padding="lg" variant="outline">
          <Stack gap={4}>
            <Heading level={2} size="md">
              Notifications
            </Heading>
            {PREFS.map((pref, index) => (
              <Stack key={pref.id} gap={4}>
                {index > 0 ? <Divider /> : null}
                <Stack direction="horizontal" gap={4} align="center" justify="between">
                  <Stack gap={1}>
                    <Text weight="medium">{pref.label}</Text>
                    <Text size="sm" tone="muted">
                      {pref.description}
                    </Text>
                  </Stack>
                  <Switch aria-label={pref.label} defaultChecked={pref.on} />
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Card>
      </Container>
    </Section>
  )
}
