import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Code,
  Container,
  Divider,
  Heading,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CodeBlock } from '../../../components/code-block'
import { JsonLd } from '../../../components/json-ld'
import { TemplatePreview } from '../../../components/template-preview'
import { pageMeta } from '../../../lib/page-meta'
import { neighbouringTemplates, templateBySlug, templates } from '../../../lib/page-templates'
import { PACKAGE_NAME, REPO_URL, registry } from '../../../lib/registry'
import { breadcrumbs, techArticle } from '../../../lib/structured-data'

/**
 * Export name to docs path, built from the registry rather than guessed from the name.
 *
 * A rule like `KanbanBoard -> kanban-board` looks right until it meets `NavbarLink`, whose
 * page is `/docs/components/navbar`, or `CTA`, or `TabsList`. The registry already knows
 * which page every export is documented on.
 */
const DOC_PATHS: Record<string, string> = Object.fromEntries([
  ...registry.components.flatMap((entry) =>
    entry.exports.map((name) => [name, `/docs/components/${entry.slug}`] as const),
  ),
  ...registry.charts.flatMap((entry) =>
    entry.exports.map((name) => [name, `/docs/charts/${entry.slug}`] as const),
  ),
])

export function generateStaticParams() {
  return templates.map((template) => ({ slug: template.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const template = templateBySlug(slug)
  if (!template) return {}
  return pageMeta({
    title: `${template.title} template`,
    // The description already carries the licence line; appending more here pushed every
    // one of these past the 165 characters Google renders, which `canonical.test.ts` caught.
    description: template.description,
    path: `/pages/${slug}`,
    keywords: [
      `react ${template.title.toLowerCase()} template`,
      `free ${template.title.toLowerCase()} page react`,
      'copy paste react page template',
    ],
  })
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const template = templateBySlug(slug)
  if (!template) notFound()

  const { previous, next } = neighbouringTemplates(slug)
  const path = `/pages/${slug}`
  const imports = [
    `import { ${template.uses.join(', ')} } from '${PACKAGE_NAME}'`,
    template.chartUses.length > 0
      ? `import { ${template.chartUses.join(', ')} } from '${PACKAGE_NAME}/charts'`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <Container className="docs-shell" size="xl">
      <JsonLd
        data={[
          techArticle({
            title: `${template.title} — a free React page template`,
            description: template.description,
            path,
          }),
          breadcrumbs([
            { name: 'Page templates', path: '/pages' },
            { name: template.title, path },
          ]),
        ]}
      />

      {/*
        A trail, not just a category label. These pages sit outside the docs shell, so
        without this the only way back to the gallery was the browser's back button - and
        for anyone arriving from a search result there was no way back at all.
      */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Page templates', href: '/pages' },
          { label: template.title },
        ]}
        label="Breadcrumb"
      />

      <header className="doc-header">
        <Text size="sm" tone="muted">
          {template.category}
        </Text>
        <Heading level={1}>{template.title}</Heading>
        <Text size="lg">{template.description}</Text>
        <Stack direction="horizontal" gap={2} wrap>
          <Badge tone="neutral" variant="soft">
            {template.uses.length + template.chartUses.length} components
          </Badge>
          <Badge tone="neutral" variant="soft">
            {template.lines} lines
          </Badge>
          {template.isClient ? (
            <Badge tone="warning" title="Declares 'use client'">
              Client component
            </Badge>
          ) : (
            <Badge tone="success" title="Renders in a Server Component">
              Server safe
            </Badge>
          )}
          <Button asChild size="sm" variant="ghost">
            <a
              href={`${REPO_URL}/blob/main/apps/docs/page-templates/${slug}.tsx`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Source on GitHub
            </a>
          </Button>
        </Stack>
      </header>

      <section>
        <Text tone="muted">{template.detail}</Text>
      </section>

      <section>
        <Heading level={2} size="lg">
          Live demo
        </Heading>
        <TemplatePreview slug={slug} title={template.title} />
      </section>

      <section>
        <Heading level={2} size="lg">
          What it uses
        </Heading>
        <Text tone="muted">
          Every one of these is an export of the published package. Nothing on this page is
          hand-rolled, which is the point of the gallery: if a page needed something the library
          does not have, the library would be missing a component.
        </Text>
        <Stack direction="horizontal" gap={2} wrap>
          {[...template.uses, ...template.chartUses].map((name) => {
            const href = DOC_PATHS[name]
            return href ? (
              <Button asChild key={name} size="sm" variant="outline">
                <Link href={href}>{name}</Link>
              </Button>
            ) : (
              <Badge key={name} tone="neutral" variant="outline">
                {name}
              </Badge>
            )
          })}
        </Stack>
      </section>

      <section>
        <Heading level={2} size="lg">
          Imports
        </Heading>
        <CodeBlock code={imports} />
      </section>

      <section>
        <Heading level={2} size="lg">
          The whole page
        </Heading>
        <Text tone="muted">
          This is the file that renders the demo above, read at build time. Copy it into your
          project, change the words, and it runs — the only thing it needs is{' '}
          <Code>{PACKAGE_NAME}</Code> and its stylesheet.
        </Text>
        {template.isClient ? (
          <Alert title="This one is a client component" tone="warning">
            <Text size="sm">
              It opens with <Code>'use client'</Code> because it holds state. Everything above it in
              your tree stays on the server.
            </Text>
          </Alert>
        ) : null}
        <CodeBlock code={template.source} />
      </section>

      <Divider />

      <nav aria-label="Adjacent templates" className="doc-pager">
        {previous ? (
          <Button asChild variant="outline">
            <Link href={`/pages/${previous.slug}`}>← {previous.title}</Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild variant="outline">
            <Link href={`/pages/${next.slug}`}>{next.title} →</Link>
          </Button>
        ) : null}
      </nav>

      <Stack align="center" gap={2}>
        <Button asChild variant="ghost">
          <Link href="/pages">← All {templates.length} page templates</Link>
        </Button>
      </Stack>
    </Container>
  )
}
