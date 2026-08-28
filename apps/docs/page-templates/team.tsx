import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  CTA,
  Grid,
  Heading,
  Image,
  Section,
  Stack,
  Stats,
  Text,
  Timeline,
} from '@the_viveksingh/vivek-ui'

/** A deterministic gradient rather than a stock photo — see `product.tsx` for the reasoning. */
const swatch = (from: string, to: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs><rect width="600" height="600" fill="url(%23g)"/></svg>`,
  )}`

const TEAM = [
  { name: 'Priya Raman', role: 'Engineering', location: 'Bristol', tint: ['#22303f', '#4a6b8a'] },
  { name: 'Tom Okafor', role: 'Accessibility', location: 'Lagos', tint: ['#4a3a12', '#b58a2a'] },
  { name: 'Elena Vasquez', role: 'Design', location: 'Madrid', tint: ['#2f2145', '#6f5aa8'] },
  { name: 'Jun Watanabe', role: 'Infrastructure', location: 'Osaka', tint: ['#123a33', '#3f8f7a'] },
  { name: 'Amara Diallo', role: 'Support', location: 'Dakar', tint: ['#3d1f22', '#96525a'] },
  { name: 'Ben Halloran', role: 'Operations', location: 'Dublin', tint: ['#1f3145', '#527aa8'] },
]

export default function TeamPage() {
  return (
    <>
      <Section padding="xl">
        <Container size="md">
          <Stack align="center" gap={4}>
            <Badge variant="soft">About us</Badge>
            <Heading align="center" level={1} size="2xl">
              Six people, one product, no roadmap theatre
            </Heading>
            <Text align="center" size="lg" tone="muted">
              We started Northwind because every team we worked on rebuilt the same twelve
              components, badly, and then shipped them without a keyboard story. We decided to do it
              once, properly, and give it away.
            </Text>
          </Stack>
        </Container>
      </Section>

      <Stats
        items={[
          { id: 'founded', value: '2023', label: 'Founded', description: 'In a shared office' },
          { id: 'people', value: '6', label: 'People', description: 'Across five countries' },
          { id: 'customers', value: '1,284', label: 'Teams using it' },
          { id: 'oss', value: '100%', label: 'Open source', description: 'MIT, no open-core' },
        ]}
      />

      <Section padding="lg">
        <Container size="md">
          <Stack gap={6}>
            <Heading level={2} size="lg">
              How we got here
            </Heading>
            <Timeline>
              <Timeline.Item
                description="One component, one stylesheet, and a stubborn rule about having no dependencies."
                status="complete"
                timestamp="March 2023"
                title="The first Button"
              />
              <Timeline.Item
                description="The hard half. Focus traps, controlled state, and the first accessibility audit — which we did not pass on the first attempt."
                status="complete"
                timestamp="January 2024"
                title="Forms and overlays"
              />
              <Timeline.Item
                description="One hundred and two components, ten charts, and a props table generated from the type declarations so it cannot drift."
                status="complete"
                timestamp="November 2025"
                title="v1.0 and the docs site"
              />
              <Timeline.Item
                description="Editable grids, file trees, Kanban boards and resource schedulers — with keyboard models, which is why nobody bundles them."
                status="current"
                timestamp="August 2026"
                title="The things nobody bundles"
              />
            </Timeline>
          </Stack>
        </Container>
      </Section>

      <Section background="muted" padding="lg">
        <Container size="lg">
          <Stack gap={6}>
            <Stack gap={2}>
              <Heading level={2} size="lg">
                The team
              </Heading>
              <Text tone="muted">Everyone here writes code or talks to the people using it.</Text>
            </Stack>

            <Grid gap={6} minItemWidth="14rem">
              {TEAM.map((person) => (
                <Card key={person.name} padding="none" variant="outline">
                  <Image
                    alt={`Portrait of ${person.name}`}
                    ratio={1}
                    src={swatch(person.tint[0] ?? '#333', person.tint[1] ?? '#777')}
                  />
                  <Stack gap={1} style={{ padding: 'var(--vk-space-4)' }}>
                    <Text weight="semibold">{person.name}</Text>
                    <Text size="sm" tone="muted">
                      {person.role}
                    </Text>
                    <Text size="sm" tone="muted">
                      {person.location}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Grid>

            <Stack align="center" direction="horizontal" gap={3}>
              <Avatar name="Northwind" size="sm" />
              <Text size="sm" tone="muted">
                Remote-first since day one, with two weeks together each year.
              </Text>
            </Stack>
          </Stack>
        </Container>
      </Section>

      <CTA
        actions={
          <>
            <Button size="lg">See open roles</Button>
            <Button size="lg" variant="outline">
              Read the handbook
            </Button>
          </>
        }
        description="We hire slowly and we write everything down. Both of those are on purpose."
        title="We are usually looking for one more person"
      />
    </>
  )
}
