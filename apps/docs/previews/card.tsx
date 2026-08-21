import { Badge, Button, Card, Grid, Heading, Text } from '@the_viveksingh/vivek-ui'

export default function CardPreview({ name }: { name: string }) {
  if (name === 'variants') {
    return (
      <Grid cols={{ base: 1, md: 3 }} gap={4}>
        <Card variant="outline">Outline</Card>
        <Card variant="elevated">Elevated</Card>
        <Card variant="ghost">Ghost</Card>
      </Grid>
    )
  }
  return (
    <Card variant="elevated" padding="lg" style={{ maxWidth: '22rem' }}>
      <Card.Header>
        <Badge tone="success" pill>
          Most popular
        </Badge>
        <Heading level={3}>Pro</Heading>
      </Card.Header>
      <Card.Body>
        <Text tone="muted">Everything you need to ship.</Text>
      </Card.Body>
      <Card.Footer>
        <Button fullWidth>Choose Pro</Button>
      </Card.Footer>
    </Card>
  )
}
