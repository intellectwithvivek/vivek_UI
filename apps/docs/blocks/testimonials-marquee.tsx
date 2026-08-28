import { Card, Container, Marquee, Section, Stack, Text } from '@the_viveksingh/vivek-ui'

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

export default function TestimonialsMarquee() {
  return (
    <Section>
      <Container>
        <Section.Header eyebrow="Loved by" title="Two thousand teams and counting" align="center" />
      </Container>
      <Marquee gradient pauseOnHover gap={4}>
        {[...QUOTES, ...QUOTES].map((q, i) => (
          <Card
            key={`${q.id}-${i < QUOTES.length ? 'a' : 'b'}`}
            padding="md"
            style={{ inlineSize: '20rem' }}
          >
            <Stack gap={3}>
              <Text size="sm">“{q.quote}”</Text>
              <Text size="sm" tone="muted">
                {q.author} · {q.role}
              </Text>
            </Stack>
          </Card>
        ))}
      </Marquee>
    </Section>
  )
}
