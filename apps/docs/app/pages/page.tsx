import {
  Badge,
  Breadcrumb,
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
import { pageMeta } from '../../lib/page-meta'
import {
  componentsUsedAcrossTemplates,
  templates,
  templatesByCategory,
} from '../../lib/page-templates'
import { breadcrumbs, techArticle } from '../../lib/structured-data'

const DESCRIPTION =
  'Twelve free, copy-and-paste React page templates built only from VivekUI: landing, pricing, dashboard, checkout, sign in, settings, blog and more.'

export const metadata: Metadata = pageMeta({
  title: 'Page templates',
  description: DESCRIPTION,
  path: '/pages',
  keywords: [
    'react page templates',
    'free react landing page template',
    'react dashboard template',
    'tailwind alternative page templates',
    'copy paste react pages',
  ],
})

export default function PagesIndex() {
  const groups = templatesByCategory()
  const used = componentsUsedAcrossTemplates()
  const lines = templates.reduce((total, template) => total + template.lines, 0)

  return (
    <Container className="docs-shell" size="xl">
      <JsonLd
        data={[
          techArticle({
            title: 'Page templates built from VivekUI',
            description: DESCRIPTION,
            path: '/pages',
          }),
          breadcrumbs([{ name: 'Page templates', path: '/pages' }]),
        ]}
      />

      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Page templates' }]}
        label="Breadcrumb"
      />

      <header className="doc-header">
        <Heading level={1}>Page templates</Heading>
        <Text size="lg">
          Whole pages, not fragments. Each one is built only from exports of the published package —{' '}
          {used.length} of them across the {templates.length} templates, in{' '}
          {lines.toLocaleString('en-GB')} lines of content and effectively no layout code.
        </Text>
        <Text tone="muted">
          Every demo runs in its own frame with its own viewport, so the responsive behaviour you
          see is the real thing rather than a narrow box on a wide screen. The code beneath each
          demo is the file that renders it, read at build time, so it cannot drift.
        </Text>
      </header>

      {groups.map((group) => (
        <section key={group.category}>
          <Heading level={2} size="lg">
            {group.category}{' '}
            <Text as="span" size="md" tone="muted">
              ({group.items.length})
            </Text>
          </Heading>
          <Grid cols={{ base: 1, md: 2, xl: 3 }} gap={4} minItemWidth="17rem">
            {group.items.map((template) => (
              <Card interactive key={template.slug} padding="md" variant="outline">
                <Stack gap={2}>
                  <Heading level={3} size="sm">
                    <Link href={`/pages/${template.slug}`}>{template.title}</Link>
                  </Heading>
                  <Text size="sm" tone="muted">
                    {template.description}
                  </Text>
                  <Stack direction="horizontal" gap={2} wrap>
                    <Badge size="sm" tone="neutral" variant="soft">
                      {template.uses.length + template.chartUses.length} components
                    </Badge>
                    <Badge size="sm" tone="neutral" variant="soft">
                      {template.lines} lines
                    </Badge>
                    {template.isClient ? (
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
