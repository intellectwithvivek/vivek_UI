import { Button, Card, Container, FAQ, Heading, Stack, Text } from '@the_viveksingh/vivek-ui'

const FAQS = [
  {
    id: 'deps',
    question: 'Really no runtime dependencies?',
    answer:
      'None. The package.json has no dependencies field at all. React and React DOM are peers you already have.',
  },
  {
    id: 'tailwind',
    question: 'Does it work alongside Tailwind?',
    answer:
      'Yes. Every selector is wrapped in :where(), so any utility class you add wins without !important.',
  },
  {
    id: 'rsc',
    question: 'Does it work with React Server Components?',
    answer: "Yes. The build is unbundled, so each file keeps its own 'use client' directive.",
  },
  {
    id: 'licence',
    question: 'What is the catch with the licence?',
    answer:
      'There is none. MIT, including commercial use, with no attribution beyond the licence text.',
  },
  {
    id: 'browsers',
    question: 'Which browsers?',
    answer:
      'The last two versions of everything evergreen. Container queries and :has() are the floor.',
  },
  {
    id: 'a11y',
    question: 'How is accessibility tested?',
    answer:
      'Every component test has an axe assertion, and the browser suite runs axe on the composed pages in three viewports.',
  },
]

export default function FaqWithContact() {
  return (
    <>
      <FAQ title="Questions" items={FAQS.slice(0, 4)} padding="md" />
      <Container size="md" style={{ paddingBlockEnd: '3rem' }}>
        <Card padding="lg" variant="outline">
          <Stack direction="horizontal" gap={4} wrap align="center" justify="between">
            <Stack gap={1}>
              <Heading level={3} size="sm">
                Still have a question?
              </Heading>
              <Text size="sm" tone="muted">
                A person replies within one working day.
              </Text>
            </Stack>
            <Button>Contact support</Button>
          </Stack>
        </Card>
      </Container>
    </>
  )
}
