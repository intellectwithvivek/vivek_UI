import { Badge, Button, Divider, Heading, Stack, Text } from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChartPreview } from '../../../../components/chart-preview'
import { CodeBlock } from '../../../../components/code-block'
import { PropsTable } from '../../../../components/props-table'
import { PACKAGE_NAME, REPO_URL, registry } from '../../../../lib/registry'

export function generateStaticParams() {
  return registry.charts.map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = registry.charts.find((item) => item.slug === slug)
  return entry ? { title: entry.title, description: entry.description } : {}
}

export default async function ChartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = registry.charts.find((item) => item.slug === slug)
  if (!entry) notFound()

  return (
    <>
      <header className="doc-header">
        <Text size="sm" tone="muted">
          Charts
        </Text>
        <Heading level={1}>{entry.title}</Heading>
        {entry.description ? <Text size="lg">{entry.description}</Text> : null}
        <Stack direction="horizontal" gap={2} wrap>
          <Badge tone={entry.isClient ? 'warning' : 'success'}>
            {entry.isClient ? 'Client component' : 'Server safe'}
          </Badge>
          <Button asChild size="sm" variant="ghost">
            <a
              href={`${REPO_URL}/tree/main/packages/ui/src/charts/${slug}`}
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
        <CodeBlock
          code={`import { ${entry.exports.join(', ')} } from '${PACKAGE_NAME}/charts'
import '${PACKAGE_NAME}/charts.css'`}
        />
      </section>

      <section>
        <Heading level={2} size="lg">
          Example
        </Heading>
        <div className="preview">
          <ChartPreview slug={slug} />
        </div>
      </section>

      <Divider />

      <section>
        <Heading level={2} size="lg">
          Props
        </Heading>
        <Text tone="muted">Generated from the package's own type declarations.</Text>
        <PropsTable api={entry.api} name={entry.primary} />
      </section>
    </>
  )
}
