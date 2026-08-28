import {
  Container,
  Grid,
  Heading,
  Image,
  Section,
  Stack,
  Tabs,
  Text,
} from '@the_viveksingh/vivek-ui'

const AREAS = [
  {
    id: 'design',
    label: 'Design',
    title: 'Design in the browser',
    body: 'Tokens, components and pages in one canvas that is already your production CSS.',
  },
  {
    id: 'build',
    label: 'Build',
    title: 'Build without handoff',
    body: 'The design is the code. Export a component and it compiles.',
  },
  {
    id: 'ship',
    label: 'Ship',
    title: 'Ship with confidence',
    body: 'Visual diffs on every change, so a spacing regression never reaches a customer.',
  },
]

export default function FeaturesTabs() {
  return (
    <Section>
      <Container>
        <Section.Header
          eyebrow="Workflow"
          title="From idea to production, one surface"
          align="center"
        />
        <Tabs defaultValue="design">
          <Tabs.List aria-label="Product areas">
            {AREAS.map((area) => (
              <Tabs.Tab key={area.id} value={area.id}>
                {area.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panels>
            {AREAS.map((area) => (
              <Tabs.Panel key={area.id} value={area.id}>
                <Grid
                  cols={{ base: 1, md: 2 }}
                  gap={6}
                  style={{ alignItems: 'center', paddingBlockStart: '1.5rem' }}
                >
                  <Stack gap={3}>
                    <Heading level={3} size="lg">
                      {area.title}
                    </Heading>
                    <Text tone="muted">{area.body}</Text>
                  </Stack>
                  <Image
                    src={`https://picsum.photos/seed/vk-${area.id}/1200/800`}
                    alt=""
                    ratio={3 / 2}
                    rounded="lg"
                  />
                </Grid>
              </Tabs.Panel>
            ))}
          </Tabs.Panels>
        </Tabs>
      </Container>
    </Section>
  )
}
