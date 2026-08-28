import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Container,
  Grid,
  Heading,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '../../components/json-ld'
import { blocks, blocksByCategory, componentsUsedAcrossBlocks } from '../../lib/blocks'
import { pageMeta } from '../../lib/page-meta'
import { breadcrumbs, techArticle } from '../../lib/structured-data'

const DESCRIPTION =
  'Sixty-two copy-and-paste React page sections built only from VivekUI: ten heroes, ten headers, pricing tables, feature grids, testimonials, FAQs, footers and forms.'

export const metadata: Metadata = pageMeta({
  title: 'Blocks',
  description: DESCRIPTION,
  path: '/blocks',
  keywords: [
    'react hero section',
    'react header component examples',
    'react pricing table',
    'react landing page sections',
    'copy paste react blocks',
    'tailwind ui alternative',
  ],
})

export default function BlocksIndex() {
  const groups = blocksByCategory()
  const used = componentsUsedAcrossBlocks()

  return (
    <Container className="docs-shell" size="xl">
      <JsonLd
        data={[
          techArticle({
            title: 'Page sections built from VivekUI',
            description: DESCRIPTION,
            path: '/blocks',
          }),
          breadcrumbs([{ name: 'Blocks', path: '/blocks' }]),
        ]}
      />

      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blocks' }]} label="Breadcrumb" />

      <header className="doc-header">
        <Heading level={1}>Blocks</Heading>
        <Text size="lg">
          Sections of a page, ready to paste: {blocks.length} of them across {groups.length}{' '}
          categories, built from {used.length} exports of the published package and nothing else.
        </Text>
        <Text tone="muted">
          Each block page shows the section running in its own frame, at any of three widths, above
          the file that renders it — read at build time, so the code you copy is the code you saw.
          Ten heroes and ten headers, because those are the ones people go looking for.
        </Text>
      </header>

      <nav aria-label="Block categories">
        <Stack direction="horizontal" gap={2} wrap>
          {groups.map((group) => (
            <Button asChild key={group.category} size="sm" variant="outline">
              <a href={`#${group.category.toLowerCase()}`}>
                {group.category} ({group.items.length})
              </a>
            </Button>
          ))}
        </Stack>
      </nav>

      {groups.map((group) => (
        <section key={group.category} id={group.category.toLowerCase()}>
          <Heading level={2} size="lg">
            {group.category}{' '}
            <Text as="span" size="md" tone="muted">
              ({group.items.length})
            </Text>
          </Heading>
          <Grid cols={{ base: 1, md: 2, xl: 3 }} gap={4} minItemWidth="17rem">
            {group.items.map((block) => (
              <Card interactive key={block.slug} padding="md" variant="outline">
                <Stack gap={2}>
                  <Heading level={3} size="sm">
                    <Link href={`/blocks/${block.slug}`}>{block.title}</Link>
                  </Heading>
                  <Text size="sm" tone="muted">
                    {block.description}
                  </Text>
                  <Stack direction="horizontal" gap={2} wrap>
                    <Badge size="sm" tone="neutral" variant="soft">
                      {block.uses.length + block.chartUses.length} components
                    </Badge>
                    <Badge size="sm" tone="neutral" variant="soft">
                      {block.lines} lines
                    </Badge>
                    {block.isClient ? (
                      <Badge size="sm" tone="warning" variant="soft">
                        Client
                      </Badge>
                    ) : (
                      <Badge size="sm" tone="success" variant="soft">
                        Server safe
                      </Badge>
                    )}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>
        </section>
      ))}
    </Container>
  )
}
