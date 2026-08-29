import { Badge, Button, Card, Grid, Heading, Image, Stack, Text } from '@the_viveksingh/vivek-ui'
import { placeholderImage } from '../lib/placeholder-image'

const PRODUCTS = [
  { id: 'lamp', name: 'Arc floor lamp', price: '₹12,400', tag: 'New' },
  { id: 'chair', name: 'Oak dining chair', price: '₹8,900' },
  { id: 'rug', name: 'Wool rug, 200 × 300', price: '₹21,000', tag: 'Low stock' },
]

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
  if (name === 'image') {
    return (
      <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap={4}>
        {PRODUCTS.map((product) => (
          <Card key={product.id} interactive padding="none" variant="outline">
            <Image
              src={placeholderImage({ seed: product.id, width: 800, height: 600 })}
              alt={product.name}
              ratio={4 / 3}
            />
            <Card.Body style={{ padding: 'var(--vk-space-4)' }}>
              <Stack gap={2}>
                <Stack direction="horizontal" gap={2} align="center" justify="between">
                  <Heading level={3} size="sm">
                    {product.name}
                  </Heading>
                  {product.tag ? (
                    <Badge
                      size="sm"
                      tone={product.tag === 'New' ? 'success' : 'warning'}
                      variant="soft"
                    >
                      {product.tag}
                    </Badge>
                  ) : null}
                </Stack>
                <Text weight="medium">{product.price}</Text>
                <Button size="sm" variant="outline">
                  Add to basket
                </Button>
              </Stack>
            </Card.Body>
          </Card>
        ))}
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
