import { Avatar, Container, Heading, Section, Stack, Text } from '@the_viveksingh/vivek-ui'

export default function TestimonialsSingleQuote() {
  return (
    <Section background="muted">
      <Container size="md">
        <Stack align="center" gap={6} style={{ textAlign: 'center' }}>
          <Heading level={2} size="xl" style={{ fontWeight: 500 }}>
            “We shipped the redesign in six weeks instead of the quarter we had budgeted. The
            library did the part of the work nobody enjoys.”
          </Heading>
          <Stack align="center" gap={2}>
            <Avatar name="Aditi Menon" size="lg" />
            <Text weight="medium">Aditi Menon</Text>
            <Text size="sm" tone="muted">
              VP Engineering, Northgate
            </Text>
          </Stack>
        </Stack>
      </Container>
    </Section>
  )
}
