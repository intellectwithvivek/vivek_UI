import { fireEvent, render, screen, within } from '@testing-library/react'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { toCsv } from '../utils/export'
import { type Column, DataTable, type DataTableSort } from './data-table'
import { Table } from './table'

interface Person {
  id: string
  name: string
  role: string
  score: number
}

/**
 * Deliberately not in name order and not in score order, so "unsorted", "by name" and
 * "by score" are three visibly different sequences.
 */
const people: Person[] = [
  { id: 'p1', name: 'Grace Hopper', role: 'Admiral', score: 88 },
  { id: 'p2', name: 'Ada Lovelace', role: 'Analyst', score: 96 },
  { id: 'p3', name: 'Katherine Johnson', role: 'Mathematician', score: 92 },
]

const columns: Column<Person>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role' },
  { key: 'score', header: 'Score', sortable: true, numeric: true },
]

/** Text of one body column, top to bottom. */
function columnText(container: HTMLElement, index: number): string[] {
  return Array.from(container.querySelectorAll('tbody tr')).map((row) => {
    const cells = row.querySelectorAll('td, th')
    return cells[index]?.textContent?.trim() ?? ''
  })
}

function bodyRows(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('tbody tr'))
}

function headerCell(name: string): HTMLElement {
  const cell = screen.getByRole('button', { name }).closest('th')
  if (!cell) throw new Error(`No <th> around the ${name} header button`)
  return cell
}

function status(): HTMLElement {
  return screen.getByRole('status')
}

/* ============================================================== static Table */

describe('Table', () => {
  it('renders a semantic table with every compound part', () => {
    const { container } = render(
      <Table>
        <Table.Caption>Quarterly figures</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Region</Table.HeaderCell>
            <Table.HeaderCell numeric>Revenue</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.HeaderCell scope="row">EMEA</Table.HeaderCell>
            <Table.Cell numeric>1200</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Foot>
          <Table.Row>
            <Table.Cell>Total</Table.Cell>
            <Table.Cell numeric>1200</Table.Cell>
          </Table.Row>
        </Table.Foot>
      </Table>,
    )

    expect(screen.getByRole('table', { name: 'Quarterly figures' })).toBeInTheDocument()
    expect(container.querySelector('caption')).toHaveTextContent('Quarterly figures')
    expect(container.querySelectorAll('thead th')).toHaveLength(2)
    expect(container.querySelector('tfoot')).not.toBeNull()
    // scope defaults to col in the head, and is explicit in the body
    expect(container.querySelectorAll('thead th')[0]).toHaveAttribute('scope', 'col')
    expect(container.querySelector('tbody th')).toHaveAttribute('scope', 'row')
  })

  it('wraps itself in its own scroll container, so the page never scrolls sideways', () => {
    const { container } = render(<Table />)
    const wrap = container.querySelector('.vk-table-wrap')
    expect(wrap).not.toBeNull()
    expect(wrap?.firstElementChild?.tagName).toBe('TABLE')
  })

  it('renders sensibly with zero props', () => {
    const { container } = render(<Table />)
    const table = container.querySelector('table')
    expect(table).toHaveAttribute('data-size', 'md')
    expect(table).not.toHaveAttribute('data-striped')
    expect(table).not.toHaveAttribute('data-bordered')
  })

  it('maps its variants to data attributes on the table and the wrapper', () => {
    const { container } = render(<Table size="sm" striped bordered hoverable stickyHeader />)
    const table = container.querySelector('table')
    expect(table).toHaveAttribute('data-size', 'sm')
    expect(table).toHaveAttribute('data-striped', 'true')
    expect(table).toHaveAttribute('data-bordered', 'true')
    expect(table).toHaveAttribute('data-hoverable', 'true')
    expect(table).toHaveAttribute('data-sticky-header', 'true')
    // The wrapper is the scroll container, so it needs to know as well.
    expect(container.querySelector('.vk-table-wrap')).toHaveAttribute('data-sticky-header', 'true')
  })

  it('maps per-cell align, numeric and label', () => {
    const { container } = render(
      <Table>
        <Table.Body>
          <Table.Row selected>
            <Table.Cell align="center">a</Table.Cell>
            <Table.Cell numeric>1</Table.Cell>
            <Table.Cell label="Role">Analyst</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    )
    const cells = container.querySelectorAll('td')
    expect(cells[0]).toHaveAttribute('data-align', 'center')
    expect(cells[1]).toHaveAttribute('data-numeric', 'true')
    expect(cells[2]).toHaveAttribute('data-label', 'Role')
    expect(container.querySelector('tr')).toHaveAttribute('data-selected', 'true')
  })

  it('merges className, spreads rest and forwards its ref to the table', () => {
    const ref = createRef<HTMLTableElement>()
    const { container } = render(
      <Table
        ref={ref}
        className="mine"
        data-testid="t"
        aria-label="Figures"
        containerProps={{ className: 'my-wrap', 'data-testid': 'wrap' }}
      />,
    )
    const table = container.querySelector('table')
    expect(ref.current).toBe(table)
    expect(table).toHaveClass('vk-table')
    expect(table).toHaveClass('mine')
    expect(table).toHaveAttribute('data-testid', 't')
    expect(screen.getByTestId('wrap')).toHaveClass('vk-table-wrap', 'my-wrap')
  })

  it('keeps a visually hidden caption in the accessibility tree', () => {
    render(
      <Table>
        <Table.Caption visuallyHidden>Named for screen readers</Table.Caption>
      </Table>,
    )
    const table = screen.getByRole('table', { name: 'Named for screen readers' })
    expect(table.querySelector('caption')).toHaveAttribute('data-visually-hidden', 'true')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Table striped bordered>
        <Table.Caption>Team</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell numeric>Score</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.HeaderCell scope="row">Ada</Table.HeaderCell>
            <Table.Cell numeric>96</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* ================================================================= DataTable */

describe('DataTable rendering', () => {
  it('renders every row and column, and names the table from its caption', () => {
    const { container } = render(
      <DataTable data={people} columns={columns} rowKey="id" caption="Team" />,
    )
    expect(screen.getByRole('table', { name: 'Team' })).toBeInTheDocument()
    expect(bodyRows(container)).toHaveLength(3)
    expect(columnText(container, 0)).toEqual(['Grace Hopper', 'Ada Lovelace', 'Katherine Johnson'])
    expect(columnText(container, 2)).toEqual(['88', '96', '92'])
  })

  it('renders the empty state when it has no data at all', async () => {
    const { container } = render(<DataTable rowKey="id" />)
    expect(screen.getByText('No rows to show')).toBeInTheDocument()
    expect(status()).toHaveTextContent('No rows found')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('takes a custom empty state', () => {
    render(<DataTable data={[]} columns={columns} rowKey="id" emptyState={<em>Nothing here</em>} />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('skips hidden columns and uses render for cell content', () => {
    const withHidden: Column<Person>[] = [
      { key: 'name', header: 'Name' },
      { key: 'role', header: 'Role', hidden: true },
      { key: 'score', header: 'Score', render: (row) => `${row.score}%`, width: 120 },
    ]
    const { container } = render(<DataTable data={people} columns={withHidden} rowKey="id" />)
    expect(container.querySelectorAll('thead th')).toHaveLength(2)
    expect(screen.queryByText('Admiral')).toBeNull()
    expect(columnText(container, 1)).toEqual(['88%', '96%', '92%'])
    expect(container.querySelectorAll('thead th')[1]).toHaveStyle({ width: '120px' })
  })

  it('renders a chosen column as a row header', () => {
    const { container } = render(
      <DataTable data={people} columns={columns} rowKey="id" rowHeader="name" />,
    )
    const rowHeaders = container.querySelectorAll('tbody th')
    expect(rowHeaders).toHaveLength(3)
    expect(rowHeaders[0]).toHaveAttribute('scope', 'row')
    expect(rowHeaders[0]).toHaveTextContent('Grace Hopper')
  })

  it('merges className, spreads rest and forwards its ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <DataTable
        ref={ref}
        data={people}
        columns={columns}
        rowKey="id"
        className="mine"
        data-testid="dt"
      />,
    )
    const root = screen.getByTestId('dt')
    expect(ref.current).toBe(root)
    expect(root).toHaveClass('vk-data-table', 'mine')
  })

  it('accepts the same columns array for CSV export', () => {
    // A compile-time assertion as much as a runtime one: Column<Row> must satisfy
    // CsvColumn<Row> so nobody has to maintain two column arrays.
    expect(toCsv(people, columns, { newline: '\n' })).toBe(
      'Name,Role,Score\nGrace Hopper,Admiral,88\nAda Lovelace,Analyst,96\nKatherine Johnson,Mathematician,92',
    )
  })
})

describe('DataTable sorting', () => {
  it('puts a real button inside the th and marks it aria-sort="none" while unsorted', () => {
    render(<DataTable data={people} columns={columns} rowKey="id" />)
    const button = screen.getByRole('button', { name: /Name/ })
    expect(button.tagName).toBe('BUTTON')
    // type=button, so the platform activates it on Enter and Space and nothing submits.
    expect(button).toHaveAttribute('type', 'button')
    // Tabbable: no tabindex override, and it really takes focus.
    expect(button).not.toHaveAttribute('tabindex')
    button.focus()
    expect(button).toHaveFocus()
    expect(headerCell('Name')).toHaveAttribute('aria-sort', 'none')
  })

  it('cycles ascending, descending, unsorted with the matching aria-sort', () => {
    const { container } = render(<DataTable data={people} columns={columns} rowKey="id" />)
    const button = screen.getByRole('button', { name: /Name/ })

    fireEvent.click(button)
    expect(headerCell('Name')).toHaveAttribute('aria-sort', 'ascending')
    expect(columnText(container, 0)).toEqual(['Ada Lovelace', 'Grace Hopper', 'Katherine Johnson'])

    fireEvent.click(button)
    expect(headerCell('Name')).toHaveAttribute('aria-sort', 'descending')
    expect(columnText(container, 0)).toEqual(['Katherine Johnson', 'Grace Hopper', 'Ada Lovelace'])

    fireEvent.click(button)
    expect(headerCell('Name')).toHaveAttribute('aria-sort', 'none')
    // Back to the order the data arrived in.
    expect(columnText(container, 0)).toEqual(['Grace Hopper', 'Ada Lovelace', 'Katherine Johnson'])
  })

  it('sorts numbers as numbers and only ever sorts one column', () => {
    const { container } = render(<DataTable data={people} columns={columns} rowKey="id" />)
    fireEvent.click(screen.getByRole('button', { name: /Score/ }))
    expect(columnText(container, 2)).toEqual(['88', '92', '96'])
    expect(headerCell('Score')).toHaveAttribute('aria-sort', 'ascending')

    fireEvent.click(screen.getByRole('button', { name: /Name/ }))
    expect(headerCell('Score')).toHaveAttribute('aria-sort', 'none')
    expect(headerCell('Name')).toHaveAttribute('aria-sort', 'ascending')
  })

  it('sorts a computed column through sortAccessor', () => {
    const computed: Column<Person>[] = [
      {
        key: 'initials',
        header: 'Initials',
        sortable: true,
        render: (row) => row.name.slice(0, 1),
        sortAccessor: (row) => row.role,
      },
    ]
    const { container } = render(<DataTable data={people} columns={computed} rowKey="id" />)
    fireEvent.click(screen.getByRole('button', { name: /Initials/ }))
    // Sorted by role: Admiral, Analyst, Mathematician -> G, A, K
    expect(columnText(container, 0)).toEqual(['G', 'A', 'K'])
  })

  it('leaves a non-sortable column with no button and no aria-sort', () => {
    render(<DataTable data={people} columns={columns} rowKey="id" />)
    expect(screen.queryByRole('button', { name: /Role/ })).toBeNull()
    const roleHeader = screen.getByRole('columnheader', { name: 'Role' })
    expect(roleHeader).not.toHaveAttribute('aria-sort')
  })

  it('announces the sort in the live region', () => {
    render(<DataTable data={people} columns={columns} rowKey="id" />)
    fireEvent.click(screen.getByRole('button', { name: /Name/ }))
    expect(status()).toHaveTextContent('Showing 1 to 3 of 3 rows, sorted by Name ascending')
    fireEvent.click(screen.getByRole('button', { name: /Name/ }))
    expect(status()).toHaveTextContent('sorted by Name descending')
  })

  it('does not mutate the data array it was given', () => {
    const original = [...people]
    render(<DataTable data={people} columns={columns} rowKey="id" />)
    fireEvent.click(screen.getByRole('button', { name: /Name/ }))
    expect(people).toEqual(original)
  })
})

describe('DataTable searching', () => {
  it('filters rows and announces the new count', () => {
    const { container } = render(
      <DataTable data={people} columns={columns} rowKey="id" searchable />,
    )
    expect(status()).toHaveTextContent('Showing 1 to 3 of 3 rows')

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), {
      target: { value: 'ada' },
    })

    expect(bodyRows(container)).toHaveLength(1)
    expect(columnText(container, 0)).toEqual(['Ada Lovelace'])
    expect(status()).toHaveTextContent('Showing 1 to 1 of 1 row')
  })

  it('searches every visible column by default, case-insensitively', () => {
    const { container } = render(
      <DataTable data={people} columns={columns} rowKey="id" searchable />,
    )
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ADMIRAL' } })
    expect(columnText(container, 0)).toEqual(['Grace Hopper'])
  })

  it('restricts matching to searchKeys', () => {
    const { container } = render(
      <DataTable data={people} columns={columns} rowKey="id" searchable searchKeys={['name']} />,
    )
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Admiral' } })
    expect(bodyRows(container)).toHaveLength(1)
    expect(screen.getByText('No rows to show')).toBeInTheDocument()
    expect(status()).toHaveTextContent('No rows found')
  })

  it('shows the empty state and announces zero when nothing matches', () => {
    render(<DataTable data={people} columns={columns} rowKey="id" searchable />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } })
    expect(screen.getByText('No rows to show')).toBeInTheDocument()
    expect(status()).toHaveTextContent('No rows found')
  })

  it('returns to page one when the search changes', () => {
    const onPageChange = vi.fn()
    render(
      <DataTable
        data={people}
        columns={columns}
        rowKey="id"
        searchable
        pageSize={1}
        onPageChange={onPageChange}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'a' } })
    expect(onPageChange).toHaveBeenLastCalledWith(1)
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
  })
})

describe('DataTable pagination', () => {
  it('slices to pageSize and walks forward and back', () => {
    const { container } = render(
      <DataTable data={people} columns={columns} rowKey="id" pageSize={2} />,
    )
    expect(bodyRows(container)).toHaveLength(2)
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(status()).toHaveTextContent('Showing 1 to 2 of 3 rows')

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    // Last page, partially full: one row of a two-row page.
    expect(bodyRows(container)).toHaveLength(1)
    expect(columnText(container, 0)).toEqual(['Katherine Johnson'])
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    expect(status()).toHaveTextContent('Showing 3 to 3 of 3 rows')

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('disables both boundaries at the first and last page', () => {
    render(<DataTable data={people} columns={columns} rowKey="id" pageSize={2} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('handles a single page, with both controls dead', () => {
    render(<DataTable data={people} columns={columns} rowKey="id" pageSize={10} />)
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('handles zero rows without an off-by-one page count', () => {
    render(<DataTable data={[]} columns={columns} rowKey="id" pageSize={10} />)
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    expect(status()).toHaveTextContent('No rows found')
  })

  it('renders no pagination at all without pageSize', () => {
    render(<DataTable data={people} columns={columns} rowKey="id" />)
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(status()).toHaveTextContent('Showing 1 to 3 of 3 rows')
  })

  it('clamps a page that no longer exists instead of showing a blank table', () => {
    const { container } = render(
      <DataTable data={people} columns={columns} rowKey="id" pageSize={2} page={9} />,
    )
    expect(bodyRows(container)).toHaveLength(1)
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
  })
})

describe('DataTable selection', () => {
  it('names each checkbox after its row, not "select"', () => {
    render(<DataTable data={people} columns={columns} rowKey="id" selectable />)
    expect(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' })).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Select all rows on this page' }),
    ).toBeInTheDocument()
  })

  it('takes a custom row label', () => {
    render(
      <DataTable
        data={people}
        columns={columns}
        rowKey="id"
        selectable
        rowLabel={(row) => `${row.name}, ${row.role}`}
      />,
    )
    expect(screen.getByRole('checkbox', { name: 'Select Ada Lovelace, Analyst' })).toBeVisible()
  })

  it('reports keys and rows when a row is ticked', () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        data={people}
        columns={columns}
        rowKey="id"
        selectable
        onSelectionChange={onSelectionChange}
      />,
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' }))
    expect(onSelectionChange).toHaveBeenCalledWith(['p2'], [people[1]])

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith([], [])
  })

  it('drives the header checkbox through indeterminate to checked', () => {
    render(<DataTable data={people} columns={columns} rowKey="id" selectable />)
    const all = screen.getByRole<HTMLInputElement>('checkbox', {
      name: 'Select all rows on this page',
    })
    expect(all.checked).toBe(false)
    expect(all.indeterminate).toBe(false)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' }))
    expect(all.indeterminate).toBe(true)
    expect(all.checked).toBe(false)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Grace Hopper' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Katherine Johnson' }))
    expect(all.checked).toBe(true)
    expect(all.indeterminate).toBe(false)
  })

  it('selects and clears only the rows on the current page', () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        data={people}
        columns={columns}
        rowKey="id"
        selectable
        pageSize={2}
        onSelectionChange={onSelectionChange}
      />,
    )
    const selectAll = () =>
      screen.getByRole<HTMLInputElement>('checkbox', { name: 'Select all rows on this page' })

    fireEvent.click(selectAll())
    expect(onSelectionChange).toHaveBeenLastCalledWith(['p1', 'p2'], [people[0], people[1]])

    // Page two starts unselected, and selecting it keeps page one's choices.
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(selectAll().checked).toBe(false)
    expect(selectAll().indeterminate).toBe(false)
    fireEvent.click(selectAll())
    expect(onSelectionChange).toHaveBeenLastCalledWith(['p1', 'p2', 'p3'], people)

    // Back on page one, still all selected; clearing leaves page two alone.
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(selectAll().checked).toBe(true)
    fireEvent.click(selectAll())
    expect(onSelectionChange).toHaveBeenLastCalledWith(['p3'], [people[2]])
  })

  it('disables the header checkbox when there is nothing to select', () => {
    render(<DataTable data={[]} columns={columns} rowKey="id" selectable />)
    expect(screen.getByRole('checkbox', { name: 'Select all rows on this page' })).toBeDisabled()
  })

  it('keeps the selection on the row, not the position, when the table is sorted', () => {
    const { container } = render(
      <DataTable data={people} columns={columns} rowKey="id" selectable />,
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' }))

    // Score ascending moves Ada (96) from row two to row three.
    fireEvent.click(screen.getByRole('button', { name: /Score/ }))
    expect(columnText(container, 1)).toEqual(['Grace Hopper', 'Katherine Johnson', 'Ada Lovelace'])

    const rows = bodyRows(container)
    const checkboxes = rows.map((row) => within(row).getByRole<HTMLInputElement>('checkbox'))
    expect(checkboxes.map((box) => box.checked)).toEqual([false, false, true])
    // This is the bug index keys cause: without a rowKey, row two would still be ticked.
    expect(rows[2]).toHaveAttribute('data-selected', 'true')
    expect(
      screen.getByRole<HTMLInputElement>('checkbox', { name: 'Select Ada Lovelace' }).checked,
    ).toBe(true)
  })

  it('accepts a rowKey function', () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        data={people}
        columns={columns}
        rowKey={(row) => `person:${row.id}`}
        selectable
        onSelectionChange={onSelectionChange}
      />,
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Grace Hopper' }))
    expect(onSelectionChange).toHaveBeenCalledWith(['person:p1'], [people[0]])
  })

  it('honours a controlled selection', () => {
    const onSelectionChange = vi.fn()
    const { container } = render(
      <DataTable
        data={people}
        columns={columns}
        rowKey="id"
        selectable
        selectedKeys={['p3']}
        onSelectionChange={onSelectionChange}
      />,
    )
    expect(bodyRows(container)[2]).toHaveAttribute('data-selected', 'true')

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Grace Hopper' }))
    expect(onSelectionChange).toHaveBeenCalledWith(['p3', 'p1'], [people[2], people[0]])
    // Controlled: nothing moves until the parent says so.
    expect(bodyRows(container)[0]).not.toHaveAttribute('data-selected')
  })
})

describe('DataTable loading and empty states', () => {
  it('renders skeleton rows and marks the table busy', () => {
    const { container } = render(
      <DataTable data={people} columns={columns} rowKey="id" loading pageSize={3} />,
    )
    expect(container.querySelectorAll('.vk-data-table__skeleton-row')).toHaveLength(3)
    expect(container.querySelector('table')).toHaveAttribute('aria-busy', 'true')
    expect(status()).toHaveTextContent('Loading rows')
    // No real rows and no empty state while loading.
    expect(screen.queryByText('Grace Hopper')).toBeNull()
    expect(screen.queryByText('No rows to show')).toBeNull()
  })

  it('takes an explicit skeleton row count', () => {
    const { container } = render(
      <DataTable data={[]} columns={columns} rowKey="id" loading skeletonRows={7} />,
    )
    expect(container.querySelectorAll('.vk-data-table__skeleton-row')).toHaveLength(7)
  })

  it('disables paging while loading', () => {
    render(<DataTable data={people} columns={columns} rowKey="id" loading pageSize={1} />)
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })
})

describe('DataTable controlled mode', () => {
  it('reports sort changes and renders only what the parent allows', () => {
    const onSortChange = vi.fn()
    const { container } = render(
      <DataTable
        data={people}
        columns={columns}
        rowKey="id"
        sort={{ key: 'name', direction: 'desc' }}
        onSortChange={onSortChange}
      />,
    )
    expect(headerCell('Name')).toHaveAttribute('aria-sort', 'descending')
    expect(columnText(container, 0)).toEqual(['Katherine Johnson', 'Grace Hopper', 'Ada Lovelace'])

    // desc -> unsorted is the third step of the cycle, so it reports null.
    fireEvent.click(screen.getByRole('button', { name: /Name/ }))
    expect(onSortChange).toHaveBeenCalledWith(null)
    // The prop still says desc, so the view must not move on its own.
    expect(headerCell('Name')).toHaveAttribute('aria-sort', 'descending')
  })

  it('reports search and page changes', () => {
    const onSearchChange = vi.fn()
    const onPageChange = vi.fn()
    render(
      <DataTable
        data={people}
        columns={columns}
        rowKey="id"
        searchable
        search="a"
        onSearchChange={onSearchChange}
        pageSize={1}
        page={2}
        onPageChange={onPageChange}
      />,
    )
    // Every string state change is reported, and a new search asks for page one.
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ada' } })
    expect(onSearchChange).toHaveBeenCalledWith('ada')
    expect(onPageChange).toHaveBeenLastCalledWith(1)

    // Still on the page the parent gave us, so Next means three.
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(3)
  })

  it('drives sorting, searching and paging from parent state', () => {
    function Server() {
      const [sort, setSort] = useState<DataTableSort | null>(null)
      const [page, setPage] = useState(1)
      return (
        <DataTable
          data={people}
          columns={columns}
          rowKey="id"
          sort={sort}
          onSortChange={setSort}
          page={page}
          onPageChange={setPage}
          pageSize={2}
        />
      )
    }
    const { container } = render(<Server />)
    fireEvent.click(screen.getByRole('button', { name: /Name/ }))
    expect(columnText(container, 0)).toEqual(['Ada Lovelace', 'Grace Hopper'])
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(columnText(container, 0)).toEqual(['Katherine Johnson'])
  })

  it('leaves the data alone in manual mode, and counts from totalRows', () => {
    const serverPage = [people[1], people[2]] as Person[]
    const { container } = render(
      <DataTable
        data={serverPage}
        columns={columns}
        rowKey="id"
        manual
        searchable
        search="zzz"
        pageSize={10}
        page={3}
        totalRows={50}
      />,
    )
    // A search that matches nothing locally must not filter a server-driven page.
    expect(bodyRows(container)).toHaveLength(2)
    expect(screen.getByText('Page 3 of 5')).toBeInTheDocument()
    expect(status()).toHaveTextContent('Showing 21 to 22 of 50 rows')

    // Sorting is the server's job too, so the order stays as delivered.
    fireEvent.click(screen.getByRole('button', { name: /Name/ }))
    expect(columnText(container, 0)).toEqual(['Ada Lovelace', 'Katherine Johnson'])
  })
})

describe('DataTable responsive and a11y', () => {
  it('marks the scroll mode by default', () => {
    render(<DataTable data={people} columns={columns} rowKey="id" data-testid="dt" />)
    expect(screen.getByTestId('dt')).toHaveAttribute('data-responsive', 'scroll')
    expect(document.querySelector('.vk-table-wrap')).not.toBeNull()
  })

  it('labels every cell and keeps table semantics in stack mode', () => {
    const { container } = render(
      <DataTable
        data={people}
        columns={columns}
        rowKey="id"
        responsive="stack"
        data-testid="dt"
        caption="Team"
      />,
    )
    expect(screen.getByTestId('dt')).toHaveAttribute('data-responsive', 'stack')

    // The CSS labels each cell with attr(data-label) once the container is narrow, so
    // the label has to be on the cell even when the layout is still a grid.
    const firstRow = bodyRows(container)[0]
    const labels = Array.from(firstRow?.querySelectorAll('td') ?? []).map((cell) =>
      cell.getAttribute('data-label'),
    )
    expect(labels).toEqual(['Name', 'Role', 'Score'])

    // Explicit roles, because card layout changes `display` and browsers then drop the
    // implicit table semantics.
    expect(container.querySelector('table')).toHaveAttribute('role', 'table')
    expect(container.querySelector('tbody')).toHaveAttribute('role', 'rowgroup')
    expect(firstRow).toHaveAttribute('role', 'row')
    expect(firstRow?.querySelector('td')).toHaveAttribute('role', 'cell')
    expect(screen.getByRole('table', { name: 'Team' })).toBeInTheDocument()
  })

  it('describes the table with its own live region', () => {
    const { container } = render(<DataTable data={people} columns={columns} rowKey="id" />)
    const table = container.querySelector('table')
    const described = table?.getAttribute('aria-describedby')
    expect(described).toBeTruthy()
    expect(document.getElementById(described ?? '')).toBe(status())
    expect(status()).toHaveAttribute('aria-live', 'polite')
  })

  it('keeps a hidden caption available to screen readers', () => {
    render(
      <DataTable data={people} columns={columns} rowKey="id" caption="Team roster" hideCaption />,
    )
    expect(screen.getByRole('table', { name: 'Team roster' })).toBeInTheDocument()
  })

  it('translates every string it says', () => {
    render(
      <DataTable
        data={people}
        columns={columns}
        rowKey="id"
        selectable
        searchable
        pageSize={2}
        labels={{
          search: 'Suchen',
          selectAll: 'Alle auswählen',
          selectRow: (label) => `${label} auswählen`,
          nextPage: 'Weiter',
          pageStatus: (page, count) => `Seite ${page}/${count}`,
          status: ({ total }) => `${total} Zeilen`,
        }}
      />,
    )
    expect(screen.getByRole('searchbox', { name: 'Suchen' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Alle auswählen' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Grace Hopper auswählen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument()
    expect(screen.getByText('Seite 1/2')).toBeInTheDocument()
    expect(status()).toHaveTextContent('3 Zeilen')
  })

  it('renders extra toolbar content', () => {
    render(
      <DataTable
        data={people}
        columns={columns}
        rowKey="id"
        toolbar={<button type="button">Export CSV</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeInTheDocument()
  })

  it('has no axe violations with everything switched on', async () => {
    const { container } = render(
      <DataTable
        data={people}
        columns={columns}
        rowKey="id"
        caption="Team roster"
        searchable
        selectable
        pageSize={2}
        stickyHeader
        striped
        bordered
        hoverable
        rowHeader="name"
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations in stack mode, while loading, or when empty', async () => {
    const stack = render(
      <DataTable
        data={people}
        columns={columns}
        rowKey="id"
        caption="Team"
        responsive="stack"
        selectable
      />,
    )
    expect(await axe(stack.container)).toHaveNoViolations()

    const loading = render(
      <DataTable data={people} columns={columns} rowKey="id" caption="Team" loading />,
    )
    expect(await axe(loading.container)).toHaveNoViolations()

    const empty = render(
      <DataTable data={[]} columns={columns} rowKey="id" caption="Team" searchable pageSize={5} />,
    )
    expect(await axe(empty.container)).toHaveNoViolations()
  })
})
