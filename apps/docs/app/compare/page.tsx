import { Breadcrumb, Card, Container, Grid, Heading, Stack, Text } from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '../../components/json-ld'
import { COMPARISONS } from '../../lib/comparisons'
import { pageMeta } from '../../lib/page-meta'
import { breadcrumbs, techArticle } from '../../lib/structured-data'

const DESCRIPTION =
  'How VivekUI compares with shadcn/ui, MUI, Chakra UI, Radix UI and Ant Design: dependencies, styling, overrides, Server Components and what each is best for.'

export const metadata: Metadata = pageMeta({
  title: 'Compare',
  description: DESCRIPTION,
  path: '/compare',
  keywords: [
    'vivekui vs shadcn',
    'react component library comparison',
    'shadcn alternative',
    'mui alternative',
    'zero dependency react ui library',
  ],
})

export default function CompareIndex() {
  return (
    <Container className="docs-shell" size="xl">
      <JsonLd
        data={[
          techArticle({ title: 'VivekUI compared', description: DESCRIPTION, path: '/compare' }),
          breadcrumbs([{ name: 'Compare', path: '/compare' }]),
        ]}
      />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Compare' }]} label="Breadcrumb" />

      <header className="doc-header">
        <Heading level={1}>Compared with the libraries you are weighing it against</Heading>
        <Text size="lg">
          Every claim about VivekUI on these pages is one this repository proves with a test or a
          file. Every statement about another library describes how it works, in terms its own
          documentation would agree with. They are good libraries; the trade-offs are different.
        </Text>
      </header>

      <Grid cols={{ base: 1, md: 2 }} gap={4} minItemWidth="18rem">
        {COMPARISONS.map((comparison) => (
          <Card interactive key={comparison.slug} padding="md" variant="outline">
            <Stack gap={2}>
              <Heading level={2} size="sm">
                <Link href={`/compare/${comparison.slug}`}>VivekUI vs {comparison.name}</Link>
              </Heading>
              <Text size="sm" tone="muted">
                {comparison.description}
              </Text>
            </Stack>
          </Card>
        ))}
      </Grid>
    </Container>
  )
}
