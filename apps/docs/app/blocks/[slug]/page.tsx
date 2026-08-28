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
import { BlockPreview } from '../../../components/block-preview'
import { CodeBlock } from '../../../components/code-block'
import { JsonLd } from '../../../components/json-ld'
import { blockBySlug, blocks, neighbouringBlocks } from '../../../lib/blocks'
import { pageMeta } from '../../../lib/page-meta'
import { PACKAGE_NAME, REPO_URL, registry } from '../../../lib/registry'
import { breadcrumbs, techArticle } from '../../../lib/structured-data'

/** Export name to docs path, from the registry rather than guessed from the name. */
const DOC_PATHS: Record<string, string> = Object.fromEntries([
  ...registry.components.flatMap((entry) =>
    entry.exports.map((name) => [name, `/docs/components/${entry.slug}`] as const),
  ),
  ...registry.charts.flatMap((entry) =>
    entry.exports.map((name) => [name, `/docs/charts/${entry.slug}`] as const),
  ),
])

export function generateStaticParams() {
  return blocks.map((block) => ({ slug: block.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const block = blockBySlug(slug)
  if (!block) return {}
  return pageMeta({
    title: `${block.title} — React block`,
    description: block.description,
    path: `/blocks/${slug}`,
    keywords: [
      `react ${block.category.toLowerCase().replace(/s$/, '')} component`,
      `${block.title.toLowerCase()} react`,
      'copy paste react section',
    ],
  })
}

export default async function BlockPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const block = blockBySlug(slug)
  if (!block) notFound()

  const { previous, next } = neighbouringBlocks(slug)
  const path = `/blocks/${slug}`
  const imports = [
    `import { ${block.uses.join(', ')} } from '${PACKAGE_NAME}'`,
    block.chartUses.length > 0
      ? `import { ${block.chartUses.join(', ')} } from '${PACKAGE_NAME}/charts'`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <Container className="docs-shell" size="xl">
      <JsonLd
        data={[
          techArticle({
            title: `${block.title} — a React ${block.category.toLowerCase()} block`,
            description: block.description,
            path,
          }),
          breadcrumbs([
            { name: 'Blocks', path: '/blocks' },
            { name: block.title, path },
          ]),
        ]}
      />

      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Blocks', href: '/blocks' },
          { label: block.title },
        ]}
        label="Breadcrumb"
      />

      <header className="doc-header">
        <Text size="sm" tone="muted">
          {block.category}
        </Text>
        <Heading level={1}>{block.title}</Heading>
        <Text size="lg">{block.description}</Text>
        <Stack direction="horizontal" gap={2} wrap>
          <Badge tone="neutral" variant="soft">
            {block.uses.length + block.chartUses.length} components
          </Badge>
          <Badge tone="neutral" variant="soft">
            {block.lines} lines
          </Badge>
          {block.isClient ? (
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
              href={`${REPO_URL}/blob/main/apps/docs/blocks/${slug}.tsx`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Source on GitHub
            </a>
          </Button>
        </Stack>
      </header>

      <section>
        <Heading level={2} size="lg">
          Live demo
        </Heading>
        <BlockPreview slug={slug} title={block.title} height={block.height} />
      </section>

      <section>
        <Heading level={2} size="lg">
          What it uses
        </Heading>
        <Stack direction="horizontal" gap={2} wrap>
          {[...block.uses, ...block.chartUses].map((name) => {
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
          The block
        </Heading>
        <Text tone="muted">
          This is the file that renders the demo above, read at build time. Copy it into your
          project, change the words, and it runs — the only thing it needs is{' '}
          <Code>{PACKAGE_NAME}</Code> and its stylesheet.
        </Text>
        {block.isClient ? (
          <Alert title="This one is a client component" tone="warning">
            <Text size="sm">
              It opens with <Code>'use client'</Code> because it holds state. Everything above it in
              your tree stays on the server.
            </Text>
          </Alert>
        ) : null}
        <CodeBlock code={block.source} />
      </section>

      <Divider />

      <nav aria-label="Adjacent blocks" className="doc-pager">
        {previous ? (
          <Button asChild variant="outline">
            <Link href={`/blocks/${previous.slug}`}>← {previous.title}</Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild variant="outline">
            <Link href={`/blocks/${next.slug}`}>{next.title} →</Link>
          </Button>
        ) : null}
      </nav>

      <Stack align="center" gap={2}>
        <Button asChild variant="ghost">
          <Link href="/blocks">← All {blocks.length} blocks</Link>
        </Button>
      </Stack>
    </Container>
  )
}
