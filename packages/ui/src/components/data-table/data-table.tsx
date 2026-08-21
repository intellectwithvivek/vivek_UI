'use client'

import {
  type ForwardedRef,
  forwardRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
import { Button } from '../button'
import { Checkbox } from '../checkbox'
import { Input } from '../input'
import { Skeleton } from '../skeleton'
import { Table, type TableAlign, type TableSize } from '../table'

/**
 * A column key.
 *
 * `Extract<keyof Row, string>` gives autocomplete and typo-checking for real properties
 * of `Row`; the `string & {}` arm keeps computed columns (`'actions'`, `'fullName'`)
 * legal without collapsing the union and throwing the autocomplete away.
 *
 * `string & {}` is a type-level trick, not a banned empty object type: intersecting with
 * `{}` keeps the arm distinct from the literal union so TypeScript does not reduce
 * `'name' | 'role' | string` down to plain `string`.
 */
export type ColumnKey<Row> = Extract<keyof Row, string> | (string & {})

export type SortDirection = 'asc' | 'desc'

/** Values a column can sort or search by. Anything else needs `sortAccessor`. */
export type SortValue = string | number | boolean | Date | null | undefined

export type SelectionKey = string | number

export interface DataTableSort {
  /** The `key` of the column being sorted. */
  key: string
  direction: SortDirection
}

export interface Column<Row> {
  /** Property of `Row` to read, or any string for a column you render yourself. */
  key: ColumnKey<Row>
  /** Heading content. Keep it a string where you can — CSV export and the stack layout both reuse it. */
  header: ReactNode
  /** Turns the heading into a real `<button>` that cycles asc -> desc -> unsorted. */
  sortable?: boolean
  align?: TableAlign
  /** Right-align with tabular figures. */
  numeric?: boolean
  /** Passed straight to the `<th>` as a CSS width. */
  width?: string | number
  /** Cell content. `index` is the row's position in the page being rendered. */
  render?: (row: Row, index: number) => ReactNode
  /**
   * The sortable/searchable/exportable value behind this column.
   *
   * Required for computed columns: without it, sorting `fullName` sorts `undefined`.
   * `toCsv` reads it too, so one accessor covers all three.
   */
  sortAccessor?: (row: Row) => SortValue
  /** Left in `columns` but not rendered. Handy for a toggleable column set. */
  hidden?: boolean
}

export interface DataTableStatusInfo {
  /** 1-based index of the first visible row; 0 when there are none. */
  start: number
  end: number
  /** Rows after filtering (or `totalRows` in `manual` mode). */
  total: number
  /** Whether a search is narrowing the set. */
  filtered: boolean
  /** Header text of the sorted column, if any. */
  sortColumn?: string
  sortDirection?: SortDirection
}

/** Every string the component says out loud, so it can be translated. */
export interface DataTableLabels {
  search: string
  searchPlaceholder: string
  selectAll: string
  /** Named per row, never just "select" — see `rowLabel`. */
  selectRow: (rowLabel: string) => string
  pagination: string
  previousPage: string
  nextPage: string
  pageStatus: (page: number, pageCount: number) => string
  /** The sentence pushed into the live region after every sort, search or page change. */
  status: (info: DataTableStatusInfo) => string
  empty: string
  loading: string
}

export interface DataTableProps<Row> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  data?: readonly Row[]
  columns?: readonly Column<Row>[]
  /**
   * Stable identity for a row: a property name, or a function returning one.
   *
   * Required, and deliberately without an index argument. Keying rows by array index is
   * the bug that makes a selected row "move" when you sort — the checkbox stays on
   * position 3 instead of on the row you ticked.
   */
  rowKey: Extract<keyof Row, string> | ((row: Row) => SelectionKey)
  /** Human name for a row, used for its selection checkbox. Defaults to the first column's value. */
  rowLabel?: (row: Row, index: number) => string

  size?: TableSize
  striped?: boolean
  bordered?: boolean
  hoverable?: boolean
  stickyHeader?: boolean
  /**
   * `'scroll'` (default) keeps the grid and scrolls it sideways inside its own box.
   * `'stack'` additionally collapses each row into a labelled card once the table's own
   * container gets narrow — a container query, so it depends on the space the table has
   * rather than on the size of the window.
   */
  responsive?: 'scroll' | 'stack'
  /** `<caption>` content. The most robust way to name a table. */
  caption?: ReactNode
  /** Keep the caption for screen readers only. */
  hideCaption?: boolean

  /** Controlled sort. `null` means unsorted; omit the prop entirely to stay uncontrolled. */
  sort?: DataTableSort | null
  defaultSort?: DataTableSort | null
  onSortChange?: (sort: DataTableSort | null) => void

  /** Render the search field. */
  searchable?: boolean
  /** Columns (or plain row properties) to search. Defaults to every visible column. */
  searchKeys?: readonly ColumnKey<Row>[]
  search?: string
  defaultSearch?: string
  onSearchChange?: (search: string) => void

  /** Rows per page. Omit for no pagination. */
  pageSize?: number
  /** Controlled page, 1-based. */
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  /** Row count for `manual` mode, where `data` holds only the current page. */
  totalRows?: number
  /**
   * Turn off local filtering, sorting and slicing.
   *
   * The escape hatch for server-driven tables: you get `onSortChange`, `onSearchChange`
   * and `onPageChange`, you fetch, and you pass back the page you fetched plus
   * `totalRows`. Without this the component would filter and slice your already-sliced
   * page and show nothing.
   */
  manual?: boolean

  /** Render the selection column. */
  selectable?: boolean
  selectedKeys?: readonly SelectionKey[]
  defaultSelectedKeys?: readonly SelectionKey[]
  onSelectionChange?: (keys: SelectionKey[], rows: Row[]) => void

  loading?: boolean
  /** Skeleton row count while `loading`. Defaults to `pageSize`, capped at 5. */
  skeletonRows?: number
  /** Shown instead of rows when there are none. */
  emptyState?: ReactNode

  /** Extra controls beside the search field — an export button, filters, a column picker. */
  toolbar?: ReactNode
  /** Column to render as `<th scope="row">`, naming its row for screen readers. */
  rowHeader?: ColumnKey<Row>
  labels?: Partial<DataTableLabels>
}

const EMPTY_SELECTION: readonly SelectionKey[] = Object.freeze([])

/** `numeric: true` so "Item 2" sorts before "Item 10". */
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

const defaultLabels: DataTableLabels = {
  search: 'Search',
  searchPlaceholder: 'Search',
  selectAll: 'Select all rows on this page',
  selectRow: (rowLabel) => `Select ${rowLabel}`,
  pagination: 'Pagination',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  pageStatus: (page, pageCount) => `Page ${page} of ${pageCount}`,
  status: ({ start, end, total, sortColumn, sortDirection }) => {
    const base =
      total === 0
        ? 'No rows found'
        : `Showing ${start} to ${end} of ${total} ${total === 1 ? 'row' : 'rows'}`
    if (!sortColumn || !sortDirection) return base
    const direction = sortDirection === 'asc' ? 'ascending' : 'descending'
    return `${base}, sorted by ${sortColumn} ${direction}`
  },
  empty: 'No rows to show',
  loading: 'Loading rows',
}

function isEmptyValue(value: SortValue): boolean {
  return value === null || value === undefined || value === ''
}

/** Empty last on ascending (and therefore first on descending — one predictable rule). */
function compareValues(a: SortValue, b: SortValue): number {
  if (isEmptyValue(a) || isEmptyValue(b)) {
    if (isEmptyValue(a) && isEmptyValue(b)) return 0
    return isEmptyValue(a) ? 1 : -1
  }
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? 1 : -1
  return collator.compare(String(a), String(b))
}

function readValue<Row>(row: Row, column: Column<Row>): SortValue {
  if (column.sortAccessor) return column.sortAccessor(row)
  if (row === null || typeof row !== 'object') return undefined
  const value = (row as Record<string, unknown>)[column.key]
  if (value === null || value === undefined) return value
  if (value instanceof Date) return value
  const type = typeof value
  if (type === 'string' || type === 'number' || type === 'boolean') return value as SortValue
  return undefined
}

/** Plain text for a value with no `render`. Anything richer is the caller's job. */
function displayValue(value: SortValue): ReactNode {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function searchText(value: SortValue): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  return String(value).toLowerCase()
}

function headerToText(header: ReactNode, fallback: string): string {
  if (typeof header === 'string') return header
  if (typeof header === 'number') return String(header)
  return fallback
}

function DataTableRoot<Row>(props: DataTableProps<Row>, ref: ForwardedRef<HTMLDivElement>) {
  const {
    data = [],
    columns = [],
    rowKey,
    rowLabel,
    size = 'md',
    striped,
    bordered,
    hoverable,
    stickyHeader,
    responsive = 'scroll',
    caption,
    hideCaption,
    sort: sortProp,
    defaultSort,
    onSortChange,
    searchable,
    searchKeys,
    search: searchProp,
    defaultSearch,
    onSearchChange,
    pageSize,
    page: pageProp,
    defaultPage,
    onPageChange,
    totalRows,
    manual,
    selectable,
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
    loading,
    skeletonRows,
    emptyState,
    toolbar,
    rowHeader,
    labels: labelOverrides,
    className,
    ...rest
  } = props

  const labels = useMemo(() => ({ ...defaultLabels, ...labelOverrides }), [labelOverrides])
  const baseId = useIsomorphicId()
  const statusId = `${baseId}-status`

  const [sort, setSort] = useControllableState<DataTableSort | null>({
    value: sortProp,
    defaultValue: defaultSort ?? null,
    onChange: onSortChange,
  })
  const [search, setSearch] = useControllableState<string>({
    value: searchProp,
    defaultValue: defaultSearch ?? '',
    onChange: onSearchChange,
  })
  const [page, setPage] = useControllableState<number>({
    value: pageProp,
    defaultValue: defaultPage ?? 1,
    onChange: onPageChange,
  })

  const visibleColumns = useMemo(() => columns.filter((column) => !column.hidden), [columns])

  const rowKeyOf = useMemo(() => {
    return (row: Row): SelectionKey => {
      if (typeof rowKey === 'function') return rowKey(row)
      if (typeof rowKey === 'string' && row !== null && typeof row === 'object') {
        const value = (row as Record<string, unknown>)[rowKey]
        if (typeof value === 'string' || typeof value === 'number') return value
        return String(value)
      }
      // Unreachable through the type; better than throwing if a JS caller omits rowKey.
      return String(row)
    }
  }, [rowKey])

  /* ---------------------------------------------------------------- searching */

  const query = search.trim().toLowerCase()

  const searchColumns = useMemo(() => {
    if (!searchKeys || searchKeys.length === 0) return visibleColumns
    return searchKeys.map((key) => {
      const existing = columns.find((column) => column.key === key)
      return existing ?? ({ key, header: key } as Column<Row>)
    })
  }, [searchKeys, columns, visibleColumns])

  const filtered = useMemo(() => {
    if (manual || !query) return data
    return data.filter((row) =>
      searchColumns.some((column) => searchText(readValue(row, column)).includes(query)),
    )
  }, [data, manual, query, searchColumns])

  /* ------------------------------------------------------------------ sorting */

  const sortedColumn = sort ? visibleColumns.find((column) => column.key === sort.key) : undefined

  const sorted = useMemo(() => {
    if (manual || !sort || !sortedColumn) return filtered
    const direction = sort.direction === 'asc' ? 1 : -1
    // Copy first: sorting `data` in place would mutate the caller's array.
    return [...filtered].sort(
      (a, b) => compareValues(readValue(a, sortedColumn), readValue(b, sortedColumn)) * direction,
    )
  }, [filtered, manual, sort, sortedColumn])

  /* --------------------------------------------------------------- pagination */

  const paged = pageSize !== undefined && pageSize > 0
  const total = manual ? (totalRows ?? data.length) : sorted.length
  const pageCount = paged ? Math.max(1, Math.ceil(total / pageSize)) : 1
  // Clamped rather than corrected in an effect: filtering down to two rows while on
  // page 9 must not blank the table, and must not fight a controlled `page` prop.
  const currentPage = Math.min(Math.max(1, Math.trunc(page) || 1), pageCount)
  const rows = useMemo(() => {
    if (!paged || manual || pageSize === undefined) return sorted
    const from = (currentPage - 1) * pageSize
    return sorted.slice(from, from + pageSize)
  }, [sorted, paged, manual, pageSize, currentPage])

  /* ---------------------------------------------------------------- selection */

  const rowsByKey = useMemo(() => {
    const map = new Map<SelectionKey, Row>()
    for (const row of data) map.set(rowKeyOf(row), row)
    return map
  }, [data, rowKeyOf])

  const [selection, setSelection] = useControllableState<readonly SelectionKey[]>({
    value: selectedKeys,
    defaultValue: defaultSelectedKeys ?? EMPTY_SELECTION,
    onChange: (keys) => {
      if (!onSelectionChange) return
      const selectedRows: Row[] = []
      for (const key of keys) {
        const row = rowsByKey.get(key)
        if (row !== undefined) selectedRows.push(row)
      }
      onSelectionChange([...keys], selectedRows)
    },
  })

  const selectionSet = useMemo(() => new Set(selection), [selection])
  const pageKeys = useMemo(() => rows.map((row) => rowKeyOf(row)), [rows, rowKeyOf])
  const selectedOnPage = pageKeys.filter((key) => selectionSet.has(key)).length
  const allOnPageSelected = pageKeys.length > 0 && selectedOnPage === pageKeys.length
  const someOnPageSelected = selectedOnPage > 0 && !allOnPageSelected

  // `indeterminate` is a DOM property, not an attribute — React cannot set it for us.
  const selectAllRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someOnPageSelected
  }, [someOnPageSelected])

  function toggleRow(key: SelectionKey) {
    setSelection((previous) => {
      const next = new Set(previous)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return Array.from(next)
    })
  }

  /** Select-all is scoped to the current page, and leaves other pages' choices alone. */
  function toggleAllOnPage() {
    setSelection((previous) => {
      const next = new Set(previous)
      for (const key of pageKeys) {
        if (allOnPageSelected) next.delete(key)
        else next.add(key)
      }
      return Array.from(next)
    })
  }

  /* ------------------------------------------------------------- interactions */

  function cycleSort(key: string) {
    const next: DataTableSort | null =
      sort?.key !== key
        ? { key, direction: 'asc' }
        : sort.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
    setSort(next)
    // A different order makes "page 4" meaningless; every table resets here.
    if (paged && currentPage !== 1) setPage(1)
  }

  function handleSearch(value: string) {
    setSearch(value)
    if (paged && currentPage !== 1) setPage(1)
  }

  /* ------------------------------------------------------------------ display */

  const columnCount = visibleColumns.length + (selectable ? 1 : 0) || 1
  // Both 0 when nothing is on screen — including a manual page the server sent empty,
  // which must not be announced as "showing 21 to 20".
  const rangeStart =
    total === 0 || rows.length === 0 ? 0 : paged && pageSize ? (currentPage - 1) * pageSize + 1 : 1
  const rangeEnd = rangeStart === 0 ? 0 : Math.min(rangeStart + rows.length - 1, total)
  const statusText = loading
    ? labels.loading
    : labels.status({
        start: rangeStart,
        end: rangeEnd,
        total,
        filtered: query !== '',
        sortColumn: sortedColumn
          ? headerToText(sortedColumn.header, String(sortedColumn.key))
          : undefined,
        sortDirection: sort?.direction,
      })

  const stack = responsive === 'stack'
  // Card mode changes `display` on table elements, which drops the implicit table
  // semantics in WebKit and Blink. Explicit roles keep the grid readable either way.
  const roles = stack
    ? ({
        table: 'table',
        rowgroup: 'rowgroup',
        row: 'row',
        cell: 'cell',
        columnheader: 'columnheader',
        rowheader: 'rowheader',
      } as const)
    : ({
        table: undefined,
        rowgroup: undefined,
        row: undefined,
        cell: undefined,
        columnheader: undefined,
        rowheader: undefined,
      } as const)

  const skeletonCount = Math.max(1, skeletonRows ?? Math.min(pageSize ?? 5, 5))

  function labelFor(row: Row, index: number): string {
    if (rowLabel) return rowLabel(row, index)
    const first = visibleColumns[0]
    if (first) {
      const value = readValue(row, first)
      if (!isEmptyValue(value)) return String(displayValue(value))
    }
    return String(rowKeyOf(row))
  }

  return (
    <div
      ref={ref}
      className={cx('vk-data-table', className)}
      data-responsive={responsive}
      data-loading={loading || undefined}
      {...rest}
    >
      {searchable || toolbar ? (
        <div className="vk-data-table__toolbar" data-vk-print-hide="">
          {searchable ? (
            <Input
              type="search"
              className="vk-data-table__search"
              size={size === 'lg' ? 'md' : size}
              value={search}
              placeholder={labels.searchPlaceholder}
              aria-label={labels.search}
              aria-controls={`${baseId}-table`}
              onChange={(event) => handleSearch(event.target.value)}
            />
          ) : null}
          {toolbar ? <div className="vk-data-table__actions">{toolbar}</div> : null}
        </div>
      ) : null}

      <Table
        id={`${baseId}-table`}
        size={size}
        striped={striped}
        bordered={bordered}
        hoverable={hoverable}
        stickyHeader={stickyHeader}
        className="vk-data-table__table"
        containerProps={{ className: 'vk-data-table__wrap' }}
        aria-describedby={statusId}
        aria-busy={loading || undefined}
        role={roles.table}
      >
        {caption ? <Table.Caption visuallyHidden={hideCaption}>{caption}</Table.Caption> : null}

        <Table.Head role={roles.rowgroup}>
          <Table.Row role={roles.row}>
            {selectable ? (
              <Table.HeaderCell
                className="vk-data-table__select-cell"
                role={roles.columnheader}
                align="center"
              >
                <Checkbox
                  ref={selectAllRef}
                  size="sm"
                  checked={allOnPageSelected}
                  onChange={toggleAllOnPage}
                  aria-label={labels.selectAll}
                  disabled={pageKeys.length === 0}
                />
              </Table.HeaderCell>
            ) : null}
            {visibleColumns.map((column) => {
              const isSorted = sort?.key === column.key
              const ariaSort = column.sortable
                ? isSorted
                  ? sort?.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
                : undefined
              return (
                <Table.HeaderCell
                  key={column.key}
                  align={column.align}
                  numeric={column.numeric}
                  aria-sort={ariaSort}
                  style={column.width === undefined ? undefined : { width: column.width }}
                  data-sortable={column.sortable || undefined}
                  role={roles.columnheader}
                >
                  {column.sortable ? (
                    // A real button: tabbable, activated by Enter and Space, announced as
                    // a button — none of which a click handler on the <th> would give.
                    <button
                      type="button"
                      className="vk-data-table__sort"
                      onClick={() => cycleSort(String(column.key))}
                      data-direction={isSorted ? sort?.direction : undefined}
                    >
                      <span className="vk-data-table__sort-text">{column.header}</span>
                      <span className="vk-data-table__sort-icon" aria-hidden="true" />
                    </button>
                  ) : (
                    column.header
                  )}
                </Table.HeaderCell>
              )
            })}
          </Table.Row>
        </Table.Head>

        <Table.Body role={roles.rowgroup}>
          {loading
            ? Array.from({ length: skeletonCount }, (_, rowIndex) => (
                <Table.Row
                  // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
                  key={`skeleton-${rowIndex}`}
                  className="vk-data-table__skeleton-row"
                  role={roles.row}
                >
                  {Array.from({ length: columnCount }, (_, cellIndex) => (
                    <Table.Cell
                      // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
                      key={`skeleton-${rowIndex}-${cellIndex}`}
                      role={roles.cell}
                    >
                      <Skeleton />
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            : null}

          {!loading && rows.length === 0 ? (
            <Table.Row role={roles.row}>
              <Table.Cell
                className="vk-data-table__empty"
                colSpan={columnCount}
                role={roles.cell}
                align="center"
              >
                {emptyState ?? labels.empty}
              </Table.Cell>
            </Table.Row>
          ) : null}

          {!loading &&
            rows.map((row, index) => {
              const key = rowKeyOf(row)
              const selected = selectionSet.has(key)
              return (
                <Table.Row key={key} selected={selected} role={roles.row}>
                  {selectable ? (
                    <Table.Cell
                      className="vk-data-table__select-cell"
                      role={roles.cell}
                      align="center"
                    >
                      <Checkbox
                        size="sm"
                        checked={selected}
                        onChange={() => toggleRow(key)}
                        aria-label={labels.selectRow(labelFor(row, index))}
                      />
                    </Table.Cell>
                  ) : null}
                  {visibleColumns.map((column) => {
                    const content = column.render
                      ? column.render(row, index)
                      : displayValue(readValue(row, column))
                    const label = headerToText(column.header, String(column.key))
                    if (rowHeader !== undefined && column.key === rowHeader) {
                      return (
                        <Table.HeaderCell
                          key={column.key}
                          scope="row"
                          align={column.align}
                          numeric={column.numeric}
                          data-label={label}
                          role={roles.rowheader}
                        >
                          {content}
                        </Table.HeaderCell>
                      )
                    }
                    return (
                      <Table.Cell
                        key={column.key}
                        align={column.align}
                        numeric={column.numeric}
                        label={label}
                        role={roles.cell}
                      >
                        {content}
                      </Table.Cell>
                    )
                  })}
                </Table.Row>
              )
            })}
        </Table.Body>
      </Table>

      <div className="vk-data-table__footer">
        {/*
          One live region for every state change. Sorting, searching and paging all end
          up rewriting this sentence, which is what makes them audible; it is visible
          too, because "showing 1 to 10 of 42" is useful to everybody.
        */}
        <output
          id={statusId}
          className="vk-data-table__status"
          aria-live="polite"
          aria-atomic="true"
        >
          {statusText}
        </output>
        {paged ? (
          <nav className="vk-data-table__pagination" aria-label={labels.pagination}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1 || loading || undefined}
              aria-label={labels.previousPage}
            >
              <span aria-hidden="true">&#8249;</span>
            </Button>
            <span className="vk-data-table__page-status">
              {labels.pageStatus(currentPage, pageCount)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= pageCount || loading || undefined}
              aria-label={labels.nextPage}
            >
              <span aria-hidden="true">&#8250;</span>
            </Button>
          </nav>
        ) : null}
      </div>
    </div>
  )
}

/**
 * A sortable, searchable, paginated, selectable table.
 *
 * Built entirely out of `Table`'s parts, so the markup is a plain semantic `<table>`
 * with real `<th scope>`, real `aria-sort` and real `<button>` headings. State is
 * uncontrolled by default and every piece of it has a controlled twin
 * (`sort`/`onSortChange`, `search`/`onSearchChange`, `page`/`onPageChange`,
 * `selectedKeys`/`onSelectionChange`) so a server-driven table is the same component
 * with `manual` set.
 */
interface DataTableComponent {
  <Row>(props: DataTableProps<Row> & RefAttributes<HTMLDivElement>): ReactElement | null
  displayName?: string
}

/**
 * A table with sorting, search, pagination and row selection built in.
 *
 * Generic over the row type, so a mistyped column `key` is a compile error rather than a
 * silently empty column. `render` and `sortAccessor` mean raw API rows go straight in —
 * nested objects and nulls included — with no pre-transform. Every client-side feature
 * has a controlled counterpart (`onSortChange`, `onPageChange`, `onSearchChange`) for
 * driving it from a server instead.
 */
export const DataTable = forwardRef(DataTableRoot) as DataTableComponent

DataTable.displayName = 'DataTable'
