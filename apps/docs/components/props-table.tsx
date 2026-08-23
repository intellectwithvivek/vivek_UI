import { Alert, Badge, Code, Table, Text } from '@the_viveksingh/vivek-ui'
import type { PropRow, PropsApi } from '../lib/registry'

function Rows({ rows }: { rows: PropRow[] }) {
  return (
    <>
      {rows.map((row) => (
        <Table.Row key={row.name}>
          <Table.Cell>
            <Code>{row.name}</Code>
            {row.required ? (
              <>
                {' '}
                <Badge tone="danger" size="sm">
                  required
                </Badge>
              </>
            ) : null}
          </Table.Cell>
          <Table.Cell>
            <Code>{row.type}</Code>
          </Table.Cell>
          <Table.Cell>{row.default ? <Code>{row.default}</Code> : '—'}</Table.Cell>
          <Table.Cell>{row.description || '—'}</Table.Cell>
        </Table.Row>
      ))}
    </>
  )
}

/**
 * A props table, rendered from the generated registry.
 *
 * Never hand-written: every row comes from the library's own emitted `.d.ts` via the
 * TypeScript compiler API, so a prop that changes in the library cannot silently keep its
 * old documentation here.
 */
export function PropsTable({ api, name }: { api: PropsApi | null; name: string }) {
  if (!api || (api.props.length === 0 && !api.variants?.length)) {
    return (
      <Alert tone="info" title="No props of its own">
        <Text size="sm">
          <Code>{name}</Code> takes no props beyond the standard host attributes.
        </Text>
      </Alert>
    )
  }

  return (
    <>
      {api.props.length > 0 ? (
        <Table size="sm" bordered hoverable>
          <Table.Caption visuallyHidden>Props for {name}</Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Prop</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Default</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Rows rows={api.props} />
          </Table.Body>
        </Table>
      ) : null}

      {/*
        Discriminated unions get one table per branch. Slider is single or range,
        Combobox and Calendar are single or multiple — flattening those into one list
        would document prop combinations that do not typecheck.
      */}
      {api.variants?.map((variant, index) =>
        variant.props.length === 0 ? null : (
          <section className="props-variant" key={variant.label}>
            <h3>Variant {index + 1}</h3>
            <Text size="sm" tone="muted">
              Additional props when the component is used in this form.
            </Text>
            <Table size="sm" bordered hoverable>
              <Table.Caption visuallyHidden>
                {name} props, variant {index + 1}
              </Table.Caption>
              <Table.Head>
                <Table.Row>
                  <Table.HeaderCell>Prop</Table.HeaderCell>
                  <Table.HeaderCell>Type</Table.HeaderCell>
                  <Table.HeaderCell>Default</Table.HeaderCell>
                  <Table.HeaderCell>Description</Table.HeaderCell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                <Rows rows={variant.props} />
              </Table.Body>
            </Table>
          </section>
        ),
      )}

      {api.spreadsHostProps ? (
        <Alert tone="info" icon={null}>
          <Text size="sm">
            Every remaining prop is spread onto the root element, so all standard HTML and ARIA
            attributes work. <Code>className</Code> and <Code>style</Code> are merged with the
            library's own, never replaced, and the ref forwards to the root DOM node.
          </Text>
        </Alert>
      ) : null}
    </>
  )
}
