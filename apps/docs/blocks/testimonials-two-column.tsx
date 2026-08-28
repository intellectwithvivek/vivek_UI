import { Card, Container, Grid, Section, Stack, Text } from '@the_viveksingh/vivek-ui'

const QUOTES = [
  {
    id: 'a',
    quote: 'We removed four dependencies the week we switched. The audit noise just stopped.',
    author: 'Priya Raman',
    role: 'Staff engineer, Meridian',
  },
  {
    id: 'b',
    quote:
      'The keyboard support is the part I did not expect. Our accessibility audit came back clean first time.',
    author: 'Tom Okafor',
    role: 'Frontend lead, Halcyon',
  },
  {
    id: 'c',
    quote: 'Theming is one CSS variable. I rebranded the whole admin panel on a Friday afternoon.',
    author: 'Elena Vasquez',
    role: 'Design engineer, Fieldwork',
  },
]

export default function TestimonialsTwoColumn() {
  return (
    <Section>
      <Container>
        <Grid cols={{ base: 1, md: 3 }} gap={8}>
          <Section.Header
            eyebrow="Customers"
            title="Why teams stay"
            description="Retention is the honest metric. These are the reasons they give."
            align="start"
          />
          <div style={{ gridColumn: 'span 2 / span 2' }}>
            <Stack gap={4}>
              {QUOTES.map((q) => (
                <Card key={q.id} padding="md" variant="ghost">
                  <Stack gap={2}>
                    <Text>“{q.quote}”</Text>
                    <Text size="sm" tone="muted">
                      — {q.author}, {q.role}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </div>
        </Grid>
      </Container>
    </Section>
  )
}
