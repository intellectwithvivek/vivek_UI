/**
 * The §4.1 component contract, enforced.
 *
 * CLAUDE.md constraint 6: merge incoming className/style, spread ...rest onto the root,
 * forward refs. Four components shipped in violation — EditableGrid, FileTree, KanbanBoard
 * and Scheduler took no ref, no style and no rest at all, so a consumer needing a test id
 * or an inline style had to wrap them in a div, and those wrappers become load-bearing.
 * This suite makes the contract checkable for the components where it was missed, so the
 * fix cannot regress and the next data widget starts from the same bar.
 */
import { render } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { EditableGrid } from './components/editable-grid'
import { FileTree } from './components/file-tree'
import { KanbanBoard } from './components/kanban-board'
import { Scheduler } from './components/scheduler'

const at = (h: number) => new Date(2026, 0, 15, h)

/** Each renders with minimal real props; the contract assertions are shared. */
const WIDGETS = [
  {
    name: 'EditableGrid',
    render: (extra: Record<string, unknown>, ref: React.Ref<HTMLElement>) => (
      <EditableGrid
        columns={[{ key: 'a', header: 'A' }]}
        data={[{ a: 1 }]}
        label="grid"
        ref={ref as React.Ref<HTMLDivElement>}
        {...extra}
      />
    ),
  },
  {
    name: 'FileTree',
    render: (extra: Record<string, unknown>, ref: React.Ref<HTMLElement>) => (
      <FileTree
        label="tree"
        nodes={[{ id: 'x', label: 'x' }]}
        ref={ref as React.Ref<HTMLUListElement>}
        {...extra}
      />
    ),
  },
  {
    name: 'KanbanBoard',
    render: (extra: Record<string, unknown>, ref: React.Ref<HTMLElement>) => (
      <KanbanBoard
        columns={[{ id: 'c', title: 'C', cards: [] }]}
        label="board"
        ref={ref as React.Ref<HTMLDivElement>}
        {...extra}
      />
    ),
  },
  {
    name: 'Scheduler',
    render: (extra: Record<string, unknown>, ref: React.Ref<HTMLElement>) => (
      <Scheduler
        events={[{ id: 'e', resourceId: 'r', title: 'E', start: at(9), end: at(10) }]}
        label="times"
        ref={ref as React.Ref<HTMLDivElement>}
        resources={[{ id: 'r', label: 'R' }]}
        {...extra}
      />
    ),
  },
] as const

describe.each(WIDGETS)('$name honours the component contract', ({ render: mount }) => {
  it('forwards its ref to the root element', () => {
    const ref = createRef<HTMLElement>()
    render(mount({}, ref))
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('spreads rest props onto the root', () => {
    const ref = createRef<HTMLElement>()
    render(mount({ 'data-testid': 'contract-root' }, ref))
    // The rest landing on the same node the ref names is the whole point: one root.
    expect(ref.current?.getAttribute('data-testid')).toBe('contract-root')
  })

  it('merges style instead of replacing its own', () => {
    const ref = createRef<HTMLElement>()
    render(mount({ style: { outlineOffset: '7px' } }, ref))
    expect(ref.current?.style.outlineOffset).toBe('7px')
  })
})
