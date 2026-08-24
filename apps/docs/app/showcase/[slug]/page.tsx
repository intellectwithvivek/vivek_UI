import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Container,
  Divider,
  Heading,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BrowserFrame } from '../../../components/browser-frame'
import { CodeBlock } from '../../../components/code-block'
import { JsonLd } from '../../../components/json-ld'
import { pageMeta } from '../../../lib/page-meta'
import { registry } from '../../../lib/registry'
import {
  cloneCommand,
  displayUrl,
  neighbouringSites,
  SHOWCASE,
  showcaseBySlug,
} from '../../../lib/showcase'
import { posterFor } from '../../../lib/showcase-poster'
import { breadcrumbs, softwareSourceCode, techArticle } from '../../../lib/structured-data'

export function generateStaticParams() {
  return SHOWCASE.map((site) => ({ slug: site.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const site = showcaseBySlug(slug)
  if (!site) return {}

  return pageMeta({
    // Not "free {category} template": "Learning & events" pushed the rendered title past 60
    // characters, where Google truncates. The category still carries in the description and
    // in the keywords below.
    title: `${site.name} — free React template`,
    description: `${site.tagline} Free and MIT licensed, source on GitHub.`,
    path: `/showcase/${slug}`,
    keywords: [
      `free ${site.name.toLowerCase()} template`,
      `react ${site.category.toLowerCase()} template`,
      'open source react website template',
      'nextjs template github',
    ],
  })
}

/** Slug of the docs page for a component, when the registry has one. */
function docsSlugFor(name: string): string | null {
  const component = registry.components.find((entry) => entry.exports.includes(name))
  if (component) return `/docs/components/${component.slug}`
  const chart = registry.charts.find((entry) => entry.exports.includes(name))
  return chart ? `/docs/charts/${chart.slug}` : null
}

export default async function ShowcasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const site = showcaseBySlug(slug)
  if (!site) notFound()

  const { previous, next } = neighbouringSites(slug)
  const path = `/showcase/${slug}`
  const description = `${site.tagline} Free, MIT licensed, built with VivekUI.`

  return (
    <Container className="docs-shell" size="xl">
      <JsonLd
        data={[
          techArticle({ title: `${site.name} — free website template`, description, path }),
          softwareSourceCode({
            name: site.name,
            description,
            path,
            repository: site.repo,
            live: site.live,
          }),
          breadcrumbs([
            { name: 'Showcase', path: '/showcase' },
            { name: site.name, path },
          ]),
        ]}
      />

      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Showcase', href: '/showcase' },
          { label: site.name },
        ]}
        label="Breadcrumb"
      />

      <header className="doc-header">
        <Text size="sm" tone="muted">
          {site.category}
        </Text>
        <Heading level={1}>{site.name}</Heading>
        <Text size="lg">{site.tagline}</Text>
        <Stack direction="horizontal" gap={2} wrap>
          <Button asChild>
            <a href={site.live} rel="noopener noreferrer" target="_blank">
              Visit the live site ↗
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={site.repo} rel="noopener noreferrer" target="_blank">
              Source on GitHub ↗
            </a>
          </Button>
          <Badge tone="success">MIT licensed</Badge>
        </Stack>
      </header>

      <section>
        <Heading level={2} size="lg">
          Live preview
        </Heading>
        <Text tone="muted">
          Nothing is fetched from {displayUrl(site)} until you press the button — this page does not
          load twelve other people's sites behind your back.
        </Text>
        <BrowserFrame
          label={displayUrl(site)}
          name={site.name}
          poster={posterFor(site.slug)}
          url={site.live}
        />
      </section>

      <section>
        <Heading level={2} size="lg">
          Clone it
        </Heading>
        <Text tone="muted">{site.detail}</Text>
        <CodeBlock code={cloneCommand(site)} language="bash" />
      </section>

      <section>
        <Heading level={2} size="lg">
          What it demonstrates
        </Heading>
        <Stack gap={3}>
          <ul className="doc-list">
            {site.highlights.map((highlight) => (
              <li key={highlight}>
                <Text size="sm">{highlight}</Text>
              </li>
            ))}
          </ul>

          {site.components.length > 0 ? (
            <Card padding="md" variant="outline">
              <Stack gap={2}>
                <Text size="sm" weight="semibold">
                  VivekUI components you can see working here
                </Text>
                <Stack direction="horizontal" gap={2} wrap>
                  {site.components.map((name) => {
                    const href = docsSlugFor(name)
                    return href ? (
                      <Button asChild key={name} size="sm" variant="outline">
                        <Link href={href}>{name}</Link>
                      </Button>
                    ) : (
                      <Badge key={name} variant="soft">
                        {name}
                      </Badge>
                    )
                  })}
                </Stack>
              </Stack>
            </Card>
          ) : null}
        </Stack>
      </section>

      <Divider />

      <nav aria-label="Adjacent showcase sites" className="doc-pager">
        {previous ? (
          <Button asChild variant="outline">
            <Link href={`/showcase/${previous.slug}`}>← {previous.name}</Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild variant="outline">
            <Link href={`/showcase/${next.slug}`}>{next.name} →</Link>
          </Button>
        ) : null}
      </nav>

      <Stack align="center" gap={2}>
        <Button asChild variant="ghost">
          <Link href="/showcase">← All {SHOWCASE.length} showcase sites</Link>
        </Button>
      </Stack>
    </Container>
  )
}
