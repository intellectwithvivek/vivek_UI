import {
  Breadcrumb,
  Button,
  Container,
  Divider,
  Heading,
  Stack,
  Table,
  Text,
} from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '../../../components/json-ld'
import { COMPARISONS, comparisonBySlug } from '../../../lib/comparisons'
import { pageMeta } from '../../../lib/page-meta'
import { breadcrumbs, techArticle } from '../../../lib/structured-data'

export function generateStaticParams() {
  return COMPARISONS.map((comparison) => ({ slug: comparison.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const comparison = comparisonBySlug(slug)
  if (!comparison) return {}
  return pageMeta({
    title: `VivekUI vs ${comparison.name}`,
    description: comparison.description,
    path: `/compare/${slug}`,
    keywords: [
      `vivekui vs ${comparison.name.toLowerCase()}`,
      `${comparison.name.toLowerCase()} alternative`,
      'react component library comparison',
    ],
  })
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const comparison = comparisonBySlug(slug)
  if (!comparison) notFound()
  const path = `/compare/${slug}`

  return (
    <Container className="docs-shell" size="lg">
      <JsonLd
        data={[
          techArticle({
            title: `VivekUI vs ${comparison.name}`,
            description: comparison.description,
            path,
          }),
          breadcrumbs([
            { name: 'Compare', path: '/compare' },
            { name: comparison.name, path },
          ]),
        ]}
      />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: comparison.name },
        ]}
        label="Breadcrumb"
      />

      <header className="doc-header">
        <Heading level={1}>VivekUI vs {comparison.name}</Heading>
        <Text size="lg">{comparison.description}</Text>
      </header>

      <section>
        <Heading level={2} size="lg">
          How {comparison.name} works
        </Heading>
        <Text tone="muted">{comparison.summary}</Text>
      </section>

      <section>
        <Heading level={2} size="lg">
          Side by side
        </Heading>
        <Table scrollLabel={`VivekUI compared with ${comparison.name}`}>
          <Table.Caption>Each aspect, for both libraries</Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell scope="col">Aspect</Table.HeaderCell>
              <Table.HeaderCell scope="col">VivekUI</Table.HeaderCell>
              <Table.HeaderCell scope="col">{comparison.name}</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {comparison.rows.map((row) => (
              <Table.Row key={row.aspect}>
                <Table.HeaderCell scope="row">{row.aspect}</Table.HeaderCell>
                <Table.Cell>{row.vivek}</Table.Cell>
                <Table.Cell>{row.other}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </section>

      <section>
        <Heading level={2} size="lg">
          Choose {comparison.name} when
        </Heading>
        <ul>
          {comparison.chooseOther.map((reason) => (
            <li key={reason}>
              <Text>{reason}</Text>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Heading level={2} size="lg">
          Choose VivekUI when
        </Heading>
        <ul>
          {comparison.chooseVivek.map((reason) => (
            <li key={reason}>
              <Text>{reason}</Text>
            </li>
          ))}
        </ul>
      </section>

      <Divider />

      <Stack direction="horizontal" gap={2} wrap>
        <Button asChild>
          <Link href="/docs/installation">Install VivekUI</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/blocks">See the blocks</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/compare">All comparisons</Link>
        </Button>
      </Stack>
    </Container>
  )
}
