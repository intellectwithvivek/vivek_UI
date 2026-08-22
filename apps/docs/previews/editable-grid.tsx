'use client'

import { Badge, EditableGrid, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

interface Line {
  id: number
  sku: string
  product: string
  qty: number
  price: number
}

const INITIAL: Line[] = [
  { id: 1, sku: 'VK-1001', product: 'Annual licence', qty: 12, price: 240 },
  { id: 2, sku: 'VK-1002', product: 'Priority support', qty: 3, price: 1200 },
  { id: 3, sku: 'VK-1003', product: 'Onboarding workshop', qty: 1, price: 3500 },
  { id: 4, sku: 'VK-1004', product: 'Extra seats', qty: 25, price: 60 },
]

const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

export default function EditableGridPreview({ name }: { name: string }) {
  const [rows, setRows] = useState(INITIAL)
  const [lastEdit, setLastEdit] = useState<string | null>(null)

  // Nothing is mutated by the grid: it reports the edit and this owns the state.
  const apply = ({
    rowIndex,
    columnKey,
    value,
  }: {
    rowIndex: number
    columnKey: string
    value: unknown
  }) => {
    setRows((current) =>
      current.map((row, i) => (i === rowIndex ? { ...row, [columnKey]: value } : row)),
    )
    setLastEdit(`${columnKey} on row ${rowIndex + 1} → ${String(value)}`)
  }

  if (name === 'readOnly') {
    return (
      <EditableGrid
        columns={[
          { key: 'sku', header: 'SKU' },
          { key: 'product', header: 'Product' },
          { key: 'qty', header: 'Qty', numeric: true },
        ]}
        label="Order lines, read only"
        readOnly
        rows={rows}
      />
    )
  }

  return (
    <Stack gap={3}>
      <Text size="sm" tone="muted">
        Click a cell, then use the arrow keys. Enter or F2 edits; typing replaces. The whole grid is
        a single tab stop.
      </Text>

      <EditableGrid
        columns={[
          { key: 'sku', header: 'SKU', width: '7rem' },
          { key: 'product', header: 'Product', editable: true },
          {
            key: 'qty',
            header: 'Qty',
            editable: true,
            numeric: true,
            width: '5rem',
            // Rejecting the edit is just returning undefined — no error state to thread.
            parse: (input) => {
              const n = Number(input)
              return Number.isFinite(n) && n >= 0 ? n : undefined
            },
          },
          {
            key: 'price',
            header: 'Unit price',
            editable: true,
            numeric: true,
            width: '8rem',
            // Displays formatted, edits raw. Conflating the two corrupts the value.
            render: (row) => money(row.price),
            format: (row) => String(row.price),
            parse: (input) => {
              const n = Number(input.replace(/[^0-9.]/g, ''))
              return Number.isFinite(n) ? n : undefined
            },
          },
          {
            key: 'total',
            header: 'Total',
            numeric: true,
            width: '8rem',
            render: (row) => money(row.qty * row.price),
          },
        ]}
        getRowKey={(row) => row.id}
        label="Order lines"
        onCellChange={apply}
        rows={rows}
      />

      <Stack direction="horizontal" gap={3} align="center" wrap>
        <Badge tone="neutral" variant="soft">
          Order total {money(rows.reduce((sum, r) => sum + r.qty * r.price, 0))}
        </Badge>
        {lastEdit ? (
          <Text size="sm" tone="muted">
            Last edit: {lastEdit}
          </Text>
        ) : null}
      </Stack>
    </Stack>
  )
}
