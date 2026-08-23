/**
 * KanbanBoard.
 *
 * The point of this component is that it works without a pointer, so that is what most of
 * these test. HTML5 drag-and-drop has no keyboard equivalent whatsoever — `dragstart` fires
 * for pointers and nothing else — which is why almost every Kanban board on the web is
 * unusable by keyboard. The pick-up / move / drop model is the real feature.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { KanbanBoard, type KanbanColumn } from './kanban-board'

const COLUMNS: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To do',
    cards: [
      { id: 'a', title: 'Write the spec' },
      { id: 'b', title: 'Review the design' },
    ],
  },
  { id: 'doing', title: 'In progress', cards: [{ id: 'c', title: 'Build the grid' }], limit: 2 },
  { id: 'done', title: 'Done', cards: [] },
]

const setup = (props: Partial<React.ComponentProps<typeof KanbanBoard>> = {}) =>
  render(<KanbanBoard columns={COLUMNS} label="Sprint board" {...props} />)

const card = (id: string) => document.querySelector(`[data-card-id="${id}"]`) as HTMLElement
const live = () => screen.getByRole('status')

function press(target: HTMLElement, key: string) {
  target.focus()
  fireEvent.keyDown(target, { key })
}

describe('KanbanBoard · structure', () => {
  it('names the board and each column, including its count', () => {
    setup()
    expect(screen.getByRole('group', { name: 'Sprint board' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'To do, 2 cards' })).toBeInTheDocument()
  })

  it('shows a work-in-progress limit when one is set', () => {
    setup()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('shows an empty column as empty rather than as nothing', () => {
    setup()
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
  })

  it('makes every card focusable, since each is independently movable', () => {
    setup()
    expect(card('a').tabIndex).toBe(0)
    expect(card('c').tabIndex).toBe(0)
  })
})

describe('KanbanBoard · keyboard, the path drag-and-drop cannot offer', () => {
  it('picks a card up with Enter and says so', () => {
    setup()
    press(card('a'), 'Enter')
    expect(card('a')).toHaveAttribute('data-grabbed')
    expect(live()).toHaveTextContent(/Picked up Write the spec/)
    // The instruction has to arrive at pick-up: there is no other moment to discover it.
    expect(live()).toHaveTextContent(/arrow keys/i)
  })

  it('picks up with Space too', () => {
    setup()
    press(card('a'), ' ')
    expect(card('a')).toHaveAttribute('data-grabbed')
  })

  it('moves right into the next column and reports the move', () => {
    const onMove = vi.fn()
    setup({ onMove })
    press(card('a'), 'Enter')
    fireEvent.keyDown(card('a'), { key: 'ArrowRight' })
    expect(onMove).toHaveBeenCalledWith({
      cardId: 'a',
      fromColumnId: 'todo',
      toColumnId: 'doing',
      toIndex: 1,
    })
    expect(live()).toHaveTextContent(/Moved to In progress/)
  })

  it('moves within a column with the up and down arrows', () => {
    const onMove = vi.fn()
    setup({ onMove })
    press(card('a'), 'Enter')
    fireEvent.keyDown(card('a'), { key: 'ArrowDown' })
    expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ toColumnId: 'todo', toIndex: 1 }))
  })

  it('does nothing at the edges rather than wrapping', () => {
    const onMove = vi.fn()
    setup({ onMove })
    press(card('a'), 'Enter')
    // Already in the first column and at the top.
    fireEvent.keyDown(card('a'), { key: 'ArrowLeft' })
    fireEvent.keyDown(card('a'), { key: 'ArrowUp' })
    expect(onMove).not.toHaveBeenCalled()
  })

  it('refuses to move into a column at its limit, and says why', () => {
    const onMove = vi.fn()
    // "In progress" holds 1 of a limit of 2; move one in and it is full.
    const full: KanbanColumn[] = [
      { id: 'todo', title: 'To do', cards: [{ id: 'a', title: 'A' }] },
      { id: 'doing', title: 'In progress', cards: [{ id: 'c', title: 'C' }], limit: 1 },
    ]
    render(<KanbanBoard columns={full} label="Board" onMove={onMove} />)
    press(card('a'), 'Enter')
    fireEvent.keyDown(card('a'), { key: 'ArrowRight' })
    expect(onMove).not.toHaveBeenCalled()
    expect(live()).toHaveTextContent(/at its limit/)
  })

  it('Escape cancels and says the card stayed put', () => {
    const onMove = vi.fn()
    setup({ onMove })
    press(card('a'), 'Enter')
    fireEvent.keyDown(card('a'), { key: 'Escape' })
    expect(card('a')).not.toHaveAttribute('data-grabbed')
    expect(live()).toHaveTextContent(/Cancelled/)
  })

  it('Enter again drops the card', () => {
    setup()
    press(card('a'), 'Enter')
    fireEvent.keyDown(card('a'), { key: 'Enter' })
    expect(card('a')).not.toHaveAttribute('data-grabbed')
    expect(live()).toHaveTextContent(/Dropped/)
  })

  it('ignores arrow keys when no card is held', () => {
    // Arrows must not move a card the user has not picked up.
    const onMove = vi.fn()
    setup({ onMove })
    press(card('a'), 'ArrowRight')
    expect(onMove).not.toHaveBeenCalled()
  })

  it('tells a screen reader how to pick a card up, before it is picked up', () => {
    setup()
    expect(card('a')).toHaveAccessibleDescription(/Press Enter or Space to pick this card up/)
  })
})

describe('KanbanBoard · pointer', () => {
  it('moves a card on drop', () => {
    const onMove = vi.fn()
    setup({ onMove })
    const data = new Map<string, string>()
    const dataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: (k: string, v: string) => data.set(k, v),
      getData: (k: string) => data.get(k) ?? '',
    }
    fireEvent.dragStart(card('a'), { dataTransfer })
    fireEvent.drop(screen.getByRole('region', { name: /In progress/ }), { dataTransfer })
    expect(onMove).toHaveBeenCalledWith(
      expect.objectContaining({ cardId: 'a', toColumnId: 'doing' }),
    )
  })

  it('does not report a move when dropped back on its own column', () => {
    const onMove = vi.fn()
    setup({ onMove })
    const data = new Map<string, string>([['text/plain', 'a']])
    const dataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: () => {},
      getData: (k: string) => data.get(k) ?? '',
    }
    fireEvent.drop(screen.getByRole('region', { name: /To do/ }), { dataTransfer })
    expect(onMove).not.toHaveBeenCalled()
  })
})

describe('KanbanBoard · edges', () => {
  it('renders with no columns without crashing', () => {
    render(<KanbanBoard columns={[]} label="Empty board" />)
    expect(screen.getByRole('group', { name: 'Empty board' })).toBeInTheDocument()
  })

  it('accepts a custom card renderer', () => {
    setup({ renderCard: (c) => <span>custom {c.title}</span> })
    expect(screen.getByText('custom Write the spec')).toBeInTheDocument()
  })

  it('has no axe violations, at rest and while holding a card', async () => {
    const { container } = setup()
    expect(await axe(container)).toHaveNoViolations()
    press(card('a'), 'Enter')
    expect(await axe(container)).toHaveNoViolations()
  })
})
