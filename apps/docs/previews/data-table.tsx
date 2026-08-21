'use client'

import { type Column, DataTable } from '@the_viveksingh/vivek-ui'

// Deliberately snake_case with a nested object and a null, because that is what an API
// returns. Nothing is pre-transformed: render and sortAccessor do the work in place.
interface Row {
  id: string
  full_name: string
  team: { name: string } | null
  joined_at: string
}

const USERS: Row[] = [
  { id: 'u1', full_name: 'Ada Lovelace', team: { name: 'Engineering' }, joined_at: '2026-01-04' },
  { id: 'u2', full_name: 'Alan Turing', team: null, joined_at: '2026-02-11' },
  { id: 'u3', full_name: 'Grace Hopper', team: { name: 'Compilers' }, joined_at: '2026-01-22' },
  { id: 'u4', full_name: 'Katherine Johnson', team: { name: 'Flight' }, joined_at: '2026-03-02' },
  { id: 'u5', full_name: 'Barbara Liskov', team: { name: 'Engineering' }, joined_at: '2026-02-28' },
  { id: 'u6', full_name: 'Margaret Hamilton', team: { name: 'Flight' }, joined_at: '2026-03-14' },
]

const COLUMNS: Column<Row>[] = [
  { key: 'full_name', header: 'Name', sortable: true },
  {
    key: 'team',
    header: 'Team',
    render: (row) => row.team?.name ?? '—',
    sortAccessor: (row) => row.team?.name ?? '',
    sortable: true,
  },
  { key: 'joined_at', header: 'Joined', align: 'end', sortable: true },
]

export default function DataTablePreview() {
  return (
    <DataTable
      caption="Team members"
      columns={COLUMNS}
      data={USERS}
      pageSize={4}
      rowKey="id"
      searchable
      selectable
    />
  )
}
