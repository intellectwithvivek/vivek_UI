'use client'

import { Badge, KanbanBoard, type KanbanColumn, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

const INITIAL: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      {
        id: '1',
        title: 'Audit the colour palette',
        description: 'Check every token pair for contrast.',
        badge: (
          <Badge tone="neutral" variant="soft">
            P3
          </Badge>
        ),
      },
      {
        id: '2',
        title: 'Write the migration note',
        badge: (
          <Badge tone="neutral" variant="soft">
            P2
          </Badge>
        ),
      },
    ],
  },
  {
    id: 'doing',
    title: 'In progress',
    limit: 2,
    cards: [
      {
        id: '3',
        title: 'Ship the Kanban board',
        description: 'Keyboard path is the hard part.',
        badge: (
          <Badge tone="warning" variant="soft">
            P1
          </Badge>
        ),
      },
    ],
  },
  {
    id: 'review',
    title: 'In review',
    cards: [
      {
        id: '4',
        title: 'FileTree keyboard model',
        badge: (
          <Badge tone="primary" variant="soft">
            P1
          </Badge>
        ),
      },
    ],
  },
  { id: 'done', title: 'Done', cards: [{ id: '5', title: 'VirtualList' }] },
]

export default function KanbanBoardPreview() {
  const [columns, setColumns] = useState(INITIAL)

  // The board never mutates: it reports the intended move and this owns the state.
  const move = ({
    cardId,
    fromColumnId,
    toColumnId,
    toIndex,
  }: {
    cardId: string
    fromColumnId: string
    toColumnId: string
    toIndex: number
  }) => {
    setColumns((current) => {
      const from = current.find((c) => c.id === fromColumnId)
      const card = from?.cards.find((c) => c.id === cardId)
      if (!from || !card) return current
      return current.map((column) => {
        if (column.id === fromColumnId && column.id === toColumnId) {
          const rest = column.cards.filter((c) => c.id !== cardId)
          rest.splice(toIndex, 0, card)
          return { ...column, cards: rest }
        }
        if (column.id === fromColumnId) {
          return { ...column, cards: column.cards.filter((c) => c.id !== cardId) }
        }
        if (column.id === toColumnId) {
          const next = [...column.cards]
          next.splice(toIndex, 0, card)
          return { ...column, cards: next }
        }
        return column
      })
    })
  }

  return (
    <Stack gap={3}>
      <Text size="sm" tone="muted">
        Drag with a mouse, or Tab to a card and press Enter to pick it up — then arrow keys to move,
        Enter to drop, Escape to cancel. Every move is announced to a screen reader.
      </Text>
      <KanbanBoard columns={columns} label="Sprint board" onMove={move} />
    </Stack>
  )
}
