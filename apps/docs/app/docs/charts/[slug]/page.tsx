import { Alert, Badge, Button, Divider, Heading, Stack, Text } from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChartPreview } from '../../../../components/chart-preview'
import { CodeBlock } from '../../../../components/code-block'
import { PropsTable } from '../../../../components/props-table'
import { chartExamplesFor } from '../../../../lib/chart-examples'
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
  if (!entry) return {}
  return {
    title: entry.title,
    description: entry.description || `${entry.title} — a zero-dependency SVG chart.`,
  }
}

export default async function ChartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = registry.charts.find((item) => item.slug === slug)
  if (!entry) notFound()

  const examples = chartExamplesFor(slug)
  const index = registry.charts.findIndex((item) => item.slug === slug)
  const previous = index > 0 ? registry.charts[index - 1] : undefined
  const next = index < registry.charts.length - 1 ? registry.charts[index + 1] : undefined

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
          <Badge tone="neutral">Pure SVG</Badge>
          <Badge tone="neutral">0 dependencies</Badge>
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
        <Text tone="muted">
          Charts live at their own subpath with their own stylesheet, so an app that never draws one
          pays nothing for them.
        </Text>
        <CodeBlock
          code={`import { ${entry.exports.join(', ')} } from '${PACKAGE_NAME}/charts'
import '${PACKAGE_NAME}/charts.css'`}
        />
      </section>

      {examples.map((example) => (
        <section key={example.title}>
          <Heading level={2} size="lg">
            {example.title}
          </Heading>
          {example.description ? <Text tone="muted">{example.description}</Text> : null}
          <div className="preview preview--center">
            <ChartPreview slug={slug} variant={example.variant} />
          </div>
          <CodeBlock code={example.code} />
        </section>
      ))}

      <section>
        <Heading level={2} size="lg">
          Accessibility
        </Heading>
        <Alert title="A chart is not an image" tone="info">
          <Text size="sm">
            Every chart carries <code>role="img"</code> with a generated accessible name, and
            renders a real <code>&lt;table&gt;</code> alongside it — visually hidden, never{' '}
            <code>display: none</code> — so a screen-reader user gets the actual numbers instead of
            "chart". Set <code>accessibleTable={'{false}'}</code> only if you have provided the data
            in a table elsewhere on the page.
          </Text>
        </Alert>
        <Text tone="muted">
          No series is ever encoded by colour alone: each carries a distinct dash pattern and marker
          shape on top of its colour, so the chart survives greyscale printing and every common form
          of colour blindness. The palette is Okabe-Ito, with a lightness-lifted ramp under{' '}
          <code>data-theme="dark"</code>.
        </Text>
      </section>

      <section>
        <Heading level={2} size="lg">
          Hostile data
        </Heading>
        <Text tone="muted">
          Real series contain gaps and rubbish. Every chart is tested against empty arrays, a single
          point, all-equal values, negatives crossing zero, <code>NaN</code>, <code>±Infinity</code>
          , <code>1e308</code> and <code>1e-320</code>, with an assertion that no rendered SVG
          attribute ever contains <code>NaN</code>. A bad row degrades the chart; it does not blank
          your page.
        </Text>
      </section>

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

      <Divider />

      <nav aria-label="Adjacent charts" className="doc-pager">
        {previous ? (
          <Button asChild variant="outline">
            <Link href={`/docs/charts/${previous.slug}`}>← {previous.title}</Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild variant="outline">
            <Link href={`/docs/charts/${next.slug}`}>{next.title} →</Link>
          </Button>
        ) : null}
      </nav>
    </>
  )
}
