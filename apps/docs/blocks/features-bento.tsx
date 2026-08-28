import {
  Badge,
  BentoGrid,
  Card,
  Container,
  Heading,
  Section,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'

function Tile({ title, body, badge }: { title: string; body: string; badge?: string }) {
  return (
    <Card padding="lg" style={{ blockSize: '100%' }}>
      <Stack gap={2}>
        {badge ? (
          <Badge size="sm" variant="soft">
            {badge}
          </Badge>
        ) : null}
        <Heading level={3} size="sm">
          {title}
        </Heading>
        <Text size="sm" tone="muted">
          {body}
        </Text>
      </Stack>
    </Card>
  )
}

export default function FeaturesBento() {
  return (
    <Section>
      <Container>
        <Section.Header
          eyebrow="Platform"
          title="One tool, the whole loop"
          description="Plan, build, review and measure without leaving the tab."
        />
        <BentoGrid cols={{ base: 1, md: 3 }} rowHeight="11rem" gap={4}>
          <BentoGrid.Item colSpan={{ base: 1, md: 2 }} rowSpan={2}>
            <Tile
              badge="New"
              title="Review that keeps up"
              body="Every pull request gets a summary, the risky files first, and a checklist generated from your own conventions. Reviewers read less and catch more."
            />
          </BentoGrid.Item>
          <BentoGrid.Item>
            <Tile
              title="Plan"
              body="Issues, cycles and roadmaps in the same keyboard-first interface."
            />
          </BentoGrid.Item>
          <BentoGrid.Item>
            <Tile
              title="Measure"
              body="Cycle time, review latency and deploy frequency, per team."
            />
          </BentoGrid.Item>
          <BentoGrid.Item colSpan={{ base: 1, md: 3 }}>
            <Tile
              title="Integrates with what you have"
              body="GitHub, GitLab, Slack, Linear, Jira, PagerDuty — two-way, and a webhook for everything else."
            />
          </BentoGrid.Item>
        </BentoGrid>
      </Container>
    </Section>
  )
}
