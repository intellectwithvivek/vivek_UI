import { Badge, Table } from '@the_viveksingh/vivek-ui'

const INVOICES = [
  { id: 'INV-1042', client: 'Northwind', amount: '$4,280.00', status: 'Paid' },
  { id: 'INV-1041', client: 'Acme Corp', amount: '$1,150.00', status: 'Pending' },
  { id: 'INV-1040', client: 'Globex', amount: '$820.00', status: 'Overdue' },
]

const TONE = {
  Paid: 'success',
  Pending: 'warning',
  Overdue: 'danger',
} as const

export default function TablePreview({ name }: { name: string }) {
  const striped = name === 'striped'
  return (
    <Table striped={striped} hoverable size="md">
      <Table.Caption visuallyHidden>Recent invoices</Table.Caption>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Invoice</Table.HeaderCell>
          <Table.HeaderCell>Client</Table.HeaderCell>
          <Table.HeaderCell numeric>Amount</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {INVOICES.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell label="Invoice">{invoice.id}</Table.Cell>
            <Table.Cell label="Client">{invoice.client}</Table.Cell>
            <Table.Cell label="Amount" numeric>
              {invoice.amount}
            </Table.Cell>
            <Table.Cell label="Status">
              <Badge tone={TONE[invoice.status as keyof typeof TONE]}>{invoice.status}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
