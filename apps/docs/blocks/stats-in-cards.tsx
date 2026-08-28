import { Card, Container, Grid, Heading, Section, Stack, Text } from '@the_viveksingh/vivek-ui'

const KPIS = [
  { id: 'mrr', label: 'Monthly revenue', value: '₹42.8L', trend: '+12% vs last month' },
  { id: 'customers', label: 'Customers', value: '1,284', trend: '+86 this month' },
  { id: 'churn', label: 'Churn', value: '1.1%', trend: '−0.3 pts' },
  { id: 'nps', label: 'NPS', value: '71', trend: 'Up from 64' },
]

export default function StatsInCards() {
  return (
    <Section padding="md">
      <Container>
        <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={4}>
          {KPIS.map((kpi) => (
            <Card key={kpi.id} padding="md" variant="outline">
              <Stack gap={1}>
                <Text size="sm" tone="muted">
                  {kpi.label}
                </Text>
                <Heading level={3} size="lg">
                  {kpi.value}
                </Heading>
                <Text size="sm" tone="muted">
                  {kpi.trend}
                </Text>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
