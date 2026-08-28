import { Container, Section, Table } from '@the_viveksingh/vivek-ui'

const PLANS = ['starter', 'pro', 'scale'] as const
const ROWS = [
  { feature: 'Projects', starter: '1', pro: 'Unlimited', scale: 'Unlimited' },
  { feature: 'Events per day', starter: '1,000', pro: '1,000,000', scale: '10,000,000' },
  { feature: 'Data retention', starter: '7 days', pro: '90 days', scale: '400 days' },
  { feature: 'Custom domains', starter: '—', pro: '✓', scale: '✓' },
  { feature: 'SAML SSO', starter: '—', pro: '—', scale: '✓' },
  { feature: 'Support', starter: 'Community', pro: 'Email', scale: 'Priority, 1-hour' },
]

export default function PricingComparisonTable() {
  return (
    <Section>
      <Container size="lg">
        <Section.Header eyebrow="Compare" title="What each plan includes" align="center" />
        <Table stickyHeader striped scrollLabel="Plan comparison">
          <Table.Caption>Features by plan</Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell scope="col">Feature</Table.HeaderCell>
              <Table.HeaderCell scope="col">Starter</Table.HeaderCell>
              <Table.HeaderCell scope="col">Pro</Table.HeaderCell>
              <Table.HeaderCell scope="col">Scale</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {ROWS.map((row) => (
              <Table.Row key={row.feature}>
                <Table.HeaderCell scope="row">{row.feature}</Table.HeaderCell>
                {PLANS.map((plan) => (
                  <Table.Cell key={plan}>{row[plan]}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>
    </Section>
  )
}
