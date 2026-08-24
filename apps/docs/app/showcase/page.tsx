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
import { displayUrl, SHOWCASE, SHOWCASE_CATEGORIES } from '../../lib/showcase'
import { posterFor } from '../../lib/showcase-poster'
import { breadcrumbs, techArticle } from '../../lib/structured-data'

const DESCRIPTION =
  'Twelve complete websites built with VivekUI — portfolio, booking, storefront, dashboard, conference, magazine. All free, MIT licensed, source on GitHub.'

export const metadata: Metadata = pageMeta({
  title: 'Showcase',
  description: DESCRIPTION,
  path: '/showcase',
  keywords: [
    'free react website templates',
    'open source nextjs templates',
    'free react portfolio template',
    'react dashboard template github',
    'mit licensed website templates',
  ],
})

export default function ShowcaseIndex() {
  const componentsUsed = new Set(SHOWCASE.flatMap((site) => site.components))

  return (
    <Container className="docs-shell" size="xl">
      <JsonLd
        data={[
          techArticle({
            title: 'Showcase — twelve free websites built with VivekUI',
            description: DESCRIPTION,
            path: '/showcase',
          }),
          breadcrumbs([{ name: 'Showcase', path: '/showcase' }]),
        ]}
      />

      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Showcase' }]}
        label="Breadcrumb"
      />

      <header className="doc-header">
        <Heading level={1}>Showcase</Heading>
        <Text size="lg">
          Twelve complete websites, built with nothing but this library and deployed. Each one is
          MIT licensed with the source on GitHub — clone it, change the words, ship it.
        </Text>
        <Stack direction="horizontal" gap={2} wrap>
          <Badge tone="success">All free</Badge>
          <Badge tone="neutral">MIT licensed</Badge>
          <Badge tone="neutral">{SHOWCASE.length} sites</Badge>
          <Badge tone="neutral">{componentsUsed.size} components between them</Badge>
        </Stack>
      </header>

      {SHOWCASE_CATEGORIES.map((category) => {
        const sites = SHOWCASE.filter((site) => site.category === category)
        if (sites.length === 0) return null

        return (
          <section key={category}>
            <Heading level={2} size="lg">
              {category}
            </Heading>
            <Grid gap={4} minItemWidth="20rem">
              {sites.map((site) => (
                <Card key={site.slug} padding="md" variant="outline">
                  <Stack gap={3}>
                    {/*
                      A poster, not a screenshot. A stale screenshot of a site that has since
                      been redesigned is worse than an honest placeholder, and the live frame
                      is one click away on the site's own page.
                    */}
                    <div
                      aria-hidden="true"
                      className="showcase-card__poster"
                      style={{ background: posterFor(site.slug) }}
                    >
                      {site.name}
                    </div>

                    <Stack gap={1}>
                      <Heading level={3} size="md">
                        {/* The link is on the heading, so its accessible name stays short. */}
                        <Link href={`/showcase/${site.slug}`}>{site.name}</Link>
                      </Heading>
                      <Text size="sm" tone="muted">
                        {displayUrl(site)}
                      </Text>
                    </Stack>

                    <Text size="sm">{site.tagline}</Text>

                    <Stack direction="horizontal" gap={2} wrap>
                      {site.components.slice(0, 4).map((name) => (
                        <Badge key={name} size="sm" variant="soft">
                          {name}
                        </Badge>
                      ))}
                      {site.components.length > 4 ? (
                        <Badge size="sm" tone="neutral" variant="soft">
                          +{site.components.length - 4}
                        </Badge>
                      ) : null}
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </section>
        )
      })}
    </Container>
  )
}
