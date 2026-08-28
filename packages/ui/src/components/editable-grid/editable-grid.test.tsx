/**
 * EditableGrid.
 *
 * The keyboard model is the whole component, so that is what these test. The failure being
 * designed against is the obvious implementation — an `<input>` in every cell — which gives
 * a 50-column grid fifty tab stops and turns it into a tab trap. Exactly one cell is
 * tabbable here, and several tests exist only to pin that down.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { type EditableColumn, EditableGrid } from './editable-grid'

interface Row {
  id: number
  name: string
  qty: number
}

const ROWS: Row[] = [
  { id: 1, name: 'Widget', qty: 4 },
  { id: 2, name: 'Gadget', qty: 7 },
  { id: 3, name: 'Doohickey', qty: 1 },
]

const COLUMNS: EditableColumn<Row>[] = [
  { key: 'name', header: 'Name', editable: true },
  { key: 'qty', header: 'Qty', editable: true, numeric: true, parse: (input) => Number(input) },
]

function setup(props: Partial<React.ComponentProps<typeof EditableGrid<Row>>> = {}) {
  return render(<EditableGrid columns={COLUMNS} label="Inventory" data={ROWS} {...props} />)
}

const cell = (row: number, col: number) =>
  document.querySelector(`[data-cell="${row}-${col}"]`) as HTMLElement

/** Focus a cell and press a key on it, which is what a real keyboard user does. */
function press(target: HTMLElement, key: string, init: Record<string, unknown> = {}) {
  target.focus()
  fireEvent.keyDown(target, { key, ...init })
}

const editor = () => screen.getByRole('textbox') as HTMLInputElement

/** Type into the open editor. `fireEvent.change` sets the value in one go. */
function type(value: string) {
  fireEvent.change(editor(), { target: { value } })
}

describe('EditableGrid · structure', () => {
  it('exposes grid semantics with the real row and column counts', () => {
    setup()
    const grid = screen.getByRole('grid', { name: 'Inventory' })
    // rowcount includes the header row, per the ARIA grid pattern.
    expect(grid).toHaveAttribute('aria-rowcount', '4')
    expect(grid).toHaveAttribute('aria-colcount', '2')
  })

  it('renders a columnheader per column and a gridcell per value', () => {
    setup()
    expect(screen.getAllByRole('columnheader')).toHaveLength(2)
    expect(screen.getAllByRole('gridcell')).toHaveLength(6)
  })

  it('marks non-editable cells aria-readonly', () => {
    render(<EditableGrid columns={[{ key: 'name', header: 'Name' }]} label="RO" data={ROWS} />)
    expect(screen.getAllByRole('gridcell')[0]).toHaveAttribute('aria-readonly', 'true')
  })
})

describe('EditableGrid · the whole grid is one tab stop', () => {
  it('makes exactly one cell tabbable', () => {
    // The property that stops a wide grid becoming a tab trap: 6 cells, 1 tab stop.
    setup()
    const tabbable = screen.getAllByRole('gridcell').filter((c) => c.tabIndex === 0)
    expect(tabbable).toHaveLength(1)
  })

  it('moves the single tab stop as focus moves, rather than adding another', () => {
    setup()
    press(cell(0, 0), 'ArrowRight')
    const tabbable = screen.getAllByRole('gridcell').filter((c) => c.tabIndex === 0)
    expect(tabbable).toHaveLength(1)
    expect(tabbable[0]).toBe(cell(0, 1))
  })
})

describe('EditableGrid · navigation', () => {
  it('moves with the arrow keys', () => {
    setup()
    press(cell(0, 0), 'ArrowRight')
    expect(cell(0, 1)).toHaveFocus()
    press(cell(0, 1), 'ArrowDown')
    expect(cell(1, 1)).toHaveFocus()
    press(cell(1, 1), 'ArrowLeft')
    expect(cell(1, 0)).toHaveFocus()
    press(cell(1, 0), 'ArrowUp')
    expect(cell(0, 0)).toHaveFocus()
  })

  it('stops at the edges rather than wrapping', () => {
    // Wrapping in two dimensions is disorienting: Left in column 1 must not jump to the far
    // end of the previous row.
    setup()
    press(cell(0, 0), 'ArrowLeft')
    expect(cell(0, 0)).toHaveFocus()
    press(cell(0, 0), 'ArrowUp')
    expect(cell(0, 0)).toHaveFocus()
  })

  it('Home and End move within the row', () => {
    setup()
    press(cell(1, 0), 'End')
    expect(cell(1, 1)).toHaveFocus()
    press(cell(1, 1), 'Home')
    expect(cell(1, 0)).toHaveFocus()
  })

  it('Ctrl+Home and Ctrl+End move to the corners of the grid', () => {
    setup()
    press(cell(1, 0), 'End', { ctrlKey: true })
    expect(cell(2, 1)).toHaveFocus()
    press(cell(2, 1), 'Home', { ctrlKey: true })
    expect(cell(0, 0)).toHaveFocus()
  })
})

describe('EditableGrid · editing', () => {
  it('Enter opens an editor seeded with the current value', () => {
    setup()
    press(cell(0, 0), 'Enter')
    expect(editor()).toHaveValue('Widget')
  })

  it('F2 opens the editor too, matching every spreadsheet', () => {
    setup()
    press(cell(0, 0), 'F2')
    expect(editor()).toBeInTheDocument()
  })

  it('typing replaces the cell rather than appending to it', () => {
    setup()
    press(cell(0, 0), 'X')
    expect(editor()).toHaveValue('X')
  })

  it('ignores modifier combinations, so Ctrl+C does not start an edit', () => {
    setup()
    press(cell(0, 0), 'c', { ctrlKey: true })
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('Enter commits and moves down, which is how data entry flows', () => {
    const onCellChange = vi.fn()
    setup({ onCellChange })
    press(cell(0, 0), 'Enter')
    type('Sprocket')
    fireEvent.keyDown(editor(), { key: 'Enter' })

    expect(onCellChange).toHaveBeenCalledWith(
      expect.objectContaining({ rowIndex: 0, columnKey: 'name', value: 'Sprocket' }),
    )
    expect(cell(1, 0)).toHaveFocus()
  })

  it('Escape cancels without reporting a change', () => {
    const onCellChange = vi.fn()
    setup({ onCellChange })
    press(cell(0, 0), 'Enter')
    type('Discarded')
    fireEvent.keyDown(editor(), { key: 'Escape' })

    expect(onCellChange).not.toHaveBeenCalled()
    expect(cell(0, 0)).toHaveFocus()
  })

  it('Tab commits and moves right', () => {
    const onCellChange = vi.fn()
    setup({ onCellChange })
    press(cell(0, 0), 'Enter')
    type('Moved')
    fireEvent.keyDown(editor(), { key: 'Tab' })
    expect(onCellChange).toHaveBeenCalled()
    expect(cell(0, 1)).toHaveFocus()
  })

  it('Shift+Tab commits and moves left', () => {
    setup()
    press(cell(0, 1), 'Enter')
    fireEvent.keyDown(editor(), { key: 'Tab', shiftKey: true })
    expect(cell(0, 0)).toHaveFocus()
  })

  it('runs parse, so a numeric column commits a number and not a string', () => {
    const onCellChange = vi.fn()
    setup({ onCellChange })
    press(cell(0, 1), 'Enter')
    type('99')
    fireEvent.keyDown(editor(), { key: 'Enter' })
    expect(onCellChange).toHaveBeenCalledWith(expect.objectContaining({ value: 99 }))
  })

  it('treats parse returning undefined as a rejected edit', () => {
    // The documented validation path: no second callback, no error state to thread through.
    const onCellChange = vi.fn()
    render(
      <EditableGrid
        columns={[{ key: 'name', header: 'Name', editable: true, parse: () => undefined }]}
        label="Validated"
        onCellChange={onCellChange}
        data={ROWS}
      />,
    )
    press(cell(0, 0), 'Enter')
    type('nope')
    fireEvent.keyDown(editor(), { key: 'Enter' })
    expect(onCellChange).not.toHaveBeenCalled()
  })

  it('never edits a column that is not marked editable', () => {
    render(<EditableGrid columns={[{ key: 'name', header: 'Name' }]} label="Locked" data={ROWS} />)
    press(cell(0, 0), 'Enter')
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('readOnly overrides the columns entirely', () => {
    setup({ readOnly: true })
    press(cell(0, 0), 'Enter')
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.getByRole('grid')).toHaveAttribute('aria-readonly', 'true')
  })

  it('uses format for the editor when the display and edit values differ', () => {
    // A currency cell shows "$4.00" and must edit as "4", not as the formatted string.
    render(
      <EditableGrid
        columns={[
          {
            key: 'qty',
            header: 'Price',
            editable: true,
            render: (row) => `$${row.qty}.00`,
            format: (row) => String(row.qty),
          },
        ]}
        label="Prices"
        data={ROWS}
      />,
    )
    expect(screen.getByText('$4.00')).toBeInTheDocument()
    press(cell(0, 0), 'Enter')
    expect(editor()).toHaveValue('4')
  })

  it('commits on blur, so clicking away does not silently discard an edit', () => {
    const onCellChange = vi.fn()
    setup({ onCellChange })
    press(cell(0, 0), 'Enter')
    type('Clicked away')
    fireEvent.blur(editor())
    expect(onCellChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'Clicked away' }))
  })
})

describe('EditableGrid · edge cases', () => {
  it('renders with no rows without crashing', () => {
    render(<EditableGrid columns={COLUMNS} label="Empty" data={[]} />)
    expect(screen.getByRole('grid')).toHaveAttribute('aria-rowcount', '1')
    expect(screen.queryAllByRole('gridcell')).toHaveLength(0)
  })

  it('renders with no columns without crashing', () => {
    render(<EditableGrid columns={[]} label="No columns" data={ROWS} />)
    expect(screen.getByRole('grid')).toHaveAttribute('aria-colcount', '0')
  })

  it('shows an empty cell rather than the word "undefined" for a missing value', () => {
    // The classic: String(undefined) renders "undefined" into the cell.
    render(
      <EditableGrid
        columns={[{ key: 'missing', header: 'Missing' }]}
        label="Sparse"
        data={[{ id: 1, name: 'a', qty: 1 }]}
      />,
    )
    expect(screen.getAllByRole('gridcell')[0]).toHaveTextContent('')
  })

  it('merges className, per the component contract', () => {
    const { container } = setup({ className: 'mine' })
    expect(container.querySelector('.vk-editable-grid')).toHaveClass('mine')
  })

  it('has no axe violations', async () => {
    const { container } = setup()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations while a cell is being edited', async () => {
    // The editor is an input inside a gridcell, which is the arrangement most likely to
    // produce a nesting violation.
    const { container } = setup()
    press(cell(0, 0), 'Enter')
    expect(await axe(container)).toHaveNoViolations()
  })
})
