import { Alert, Badge, Button, Code, Divider, Heading, Stack, Text } from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CodeBlock } from '../../../../components/code-block'
import { ComponentPreview } from '../../../../components/component-preview'
import { JsonLd } from '../../../../components/json-ld'
import { PropsTable } from '../../../../components/props-table'
import { examplesFor } from '../../../../lib/examples'
import { apiDescription, pageMeta } from '../../../../lib/page-meta'
import { neighbours, PACKAGE_NAME, REPO_URL, registry } from '../../../../lib/registry'
import { breadcrumbs, componentReference, techArticle } from '../../../../lib/structured-data'

export function generateStaticParams() {
  return registry.components.map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = registry.components.find((item) => item.slug === slug)
  if (!entry) return {}
  return pageMeta({
    title: entry.title,
    description: apiDescription({
      title: entry.title,
      kind: 'component',
      description: entry.description,
      exports: entry.exports,
    }),
    path: `/docs/components/${slug}`,
    hasOwnImage: true,
    // The phrases someone actually types. `entry.exports` covers the case where they
    // search the export name rather than the component name.
    keywords: [
      `react ${entry.title.toLowerCase()} component`,
      `${entry.title.toLowerCase()} react example`,
      ...entry.exports.map((name) => `${name} props`),
    ],
  })
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = registry.components.find((item) => item.slug === slug)
  if (!entry) notFound()

  const { previous, next } = neighbours(slug)
  const examples = examplesFor(slug)
  const importLine = `import { ${entry.exports.join(', ')} } from '${PACKAGE_NAME}'`

  const path = `/docs/components/${slug}`

  return (
    <>
      <JsonLd
        data={[
          techArticle({
            title: `${entry.title} — React component`,
            description: apiDescription({
              title: entry.title,
              kind: 'component',
              description: entry.description,
              exports: entry.exports,
            }),
            path,
          }),
          componentReference({
            name: entry.title,
            description: entry.description || `The ${entry.title} component.`,
            path,
            exports: entry.exports,
          }),
          breadcrumbs([
            { name: 'Docs', path: '/docs' },
            { name: 'Components', path: '/docs/components' },
            { name: entry.title, path },
          ]),
        ]}
      />
      <header className="doc-header">
        <Text size="sm" tone="muted">
          {entry.category}
        </Text>
        <Heading level={1}>{entry.title}</Heading>
        {entry.description ? <Text size="lg">{entry.description}</Text> : null}
        <Stack direction="horizontal" gap={2} wrap>
          {entry.isClient ? (
            <Badge tone="warning" title="Declares 'use client'">
              Client component
            </Badge>
          ) : (
            <Badge tone="success" title="Renders in a Server Component">
              Server safe
            </Badge>
          )}
          {entry.compound ? <Badge tone="neutral">{entry.exports.length} exports</Badge> : null}
          <Button asChild size="sm" variant="ghost">
            <a
              href={`${REPO_URL}/tree/main/packages/ui/src/components/${slug}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Source
            </a>
          </Button>
        </Stack>
      </header>

      <section>
        <Heading level={2} size="lg">
          Import
        </Heading>
        <CodeBlock code={importLine} />
      </section>

      {examples.length > 0 ? (
        examples.map((example) => (
          <section key={example.title}>
            <Heading level={2} size="lg">
              {example.title}
            </Heading>
            {example.description ? <Text tone="muted">{example.description}</Text> : null}
            <ComponentPreview slug={slug} name={example.name} />
            <CodeBlock code={example.code} />
          </section>
        ))
      ) : (
        <Alert title="Examples coming" tone="info">
          <Text size="sm">
            This component's props are documented below, generated from its own type declarations.
            Hand-written examples are still being written — the{' '}
            <Link href="/playground">playground</Link> has every export in scope if you want to try
            it now.
          </Text>
        </Alert>
      )}

      <Divider />

      <section>
        <Heading level={2} size="lg">
          Props
        </Heading>
        <Text tone="muted">
          Generated from the package's own type declarations, so this table cannot drift from the
          code.
        </Text>
        <PropsTable api={entry.api} name={entry.primary} />
      </section>

      {entry.compound ? (
        <section>
          <Heading level={2} size="lg">
            Exports
          </Heading>
          <Stack direction="horizontal" gap={2} wrap>
            {entry.exports.map((name) => (
              <Code key={name}>{name}</Code>
            ))}
          </Stack>
        </section>
      ) : null}

      <section>
        <Heading level={2} size="lg">
          Rendering
        </Heading>
        {entry.isClient ? (
          <Alert title="Client component" tone="warning">
            <Text size="sm">
              <Code>{entry.primary}</Code> declares <Code>'use client'</Code> because it needs
              state, effects or event handlers. Importing it into a Server Component creates a
              client boundary at this component — everything above it stays on the server.
            </Text>
          </Alert>
        ) : (
          <Alert title="Server safe" tone="success">
            <Text size="sm">
              <Code>{entry.primary}</Code> carries no <Code>'use client'</Code> directive and
              renders directly in a React Server Component. No client JavaScript is shipped for it.
            </Text>
          </Alert>
        )}
      </section>

      <Divider />

      <nav aria-label="Adjacent components" className="doc-pager">
        {previous ? (
          <Button asChild variant="outline">
            <Link href={`/docs/components/${previous.slug}`}>← {previous.title}</Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild variant="outline">
            <Link href={`/docs/components/${next.slug}`}>{next.title} →</Link>
          </Button>
        ) : null}
      </nav>
    </>
  )
}
