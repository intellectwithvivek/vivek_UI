'use client'

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { cx } from '../../utils/cx'

export type EditableColumnKey<Row> = Extract<keyof Row, string> | (string & {})

export interface EditableColumn<Row> {
  /** Property of `Row` to read, or any string for a column you render yourself. */
  key: EditableColumnKey<Row>
  /** Heading text. Kept a string because it is also the cell's accessible name. */
  header: string
  /** Editable cells become inputs on Enter, F2, or by typing. Default `false`. */
  editable?: boolean
  align?: 'start' | 'center' | 'end'
  /** Right-aligns and uses tabular figures, so digits line up down the column. */
  numeric?: boolean
  /** CSS width for the column. */
  width?: string | number
  /** Read-only display. Defaults to `String(value)`. */
  render?: (row: Row, index: number) => ReactNode
  /**
   * Value -> the string shown in the editor. Defaults to `String(value)`.
   *
   * Separate from `render` on purpose: a currency column might display "$1,240.00" and edit
   * as "1240", and conflating the two is how editing a formatted cell corrupts the value.
   */
  format?: (row: Row, index: number) => string
  /**
   * The typed string -> the value to commit. Return `undefined` to reject the edit and keep
   * the old value, which is how validation is expressed without a second callback.
   */
  parse?: (input: string, row: Row) => unknown
}

export interface CellChange<Row> {
  rowIndex: number
  columnKey: string
  value: unknown
  row: Row
}

export interface EditableGridProps<Row> {
  rows: readonly Row[]
  columns: readonly EditableColumn<Row>[]
  /** Required. A grid with no accessible name is unusable with a screen reader. */
  label: string
  /** Fired when an edit is committed. Nothing is mutated for you — apply it to your state. */
  onCellChange?: (change: CellChange<Row>) => void
  /** Stable row identity. Defaults to the index, which breaks if rows reorder. */
  getRowKey?: (row: Row, index: number) => string | number
  /** Blocks editing everywhere, whatever the columns say. */
  readOnly?: boolean
  /** Fixed height turns on scrolling with a sticky header. */
  height?: string | number
  className?: string
  id?: string
}

interface CellPosition {
  row: number
  col: number
}

/** Printable single characters start an edit, the way a spreadsheet does. */
function isTypingKey(event: ReactKeyboardEvent): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
}

function readValue<Row>(row: Row, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}

/**
 * A spreadsheet-style editable grid.
 *
 * The gap this fills: every component library ships a *table*, and none ship an editable
 * one. Teams reach for AG Grid, Handsontable or TanStack Table plus a lot of glue — a second
 * dependency, often a paid licence, for the single feature of typing into a cell.
 *
 * **Keyboard model is the WAI-ARIA grid pattern, not a table with inputs in it.** The
 * distinction matters: inputs in every cell means one tab stop per cell, so a 50-column grid
 * takes 50 tabs to escape. Here the whole grid is ONE tab stop, arrows move between cells,
 * and a cell only becomes an input while it is being edited.
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | Arrows | Move the focused cell |
 * | Home / End | First / last cell in the row |
 * | Ctrl+Home / Ctrl+End | First / last cell in the grid |
 * | Enter or F2 | Start editing |
 * | Any printable key | Start editing, replacing the cell |
 * | Enter while editing | Commit and move down |
 * | Tab while editing | Commit and move right |
 * | Escape | Cancel, restoring the previous value |
 *
 * **Nothing is mutated for you.** `onCellChange` reports the edit and your state decides. A
 * grid that writes into the array it was handed is impossible to make work with immutable
 * state, undo, or a server round-trip that might fail.
 */
export function EditableGrid<Row>({
  rows,
  columns,
  label,
  onCellChange,
  getRowKey,
  readOnly = false,
  height,
  className,
  id,
}: EditableGridProps<Row>) {
  const [focused, setFocused] = useState<CellPosition>({ row: 0, col: 0 })
  const [editing, setEditing] = useState<CellPosition | null>(null)
  const [draft, setDraft] = useState('')
  const gridRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  /** Set when a keystroke moved focus, so the DOM focus follows — but not on mere re-render. */
  const shouldRefocus = useRef(false)

  const rowCount = rows.length
  const colCount = columns.length

  const clamp = useCallback(
    (pos: CellPosition): CellPosition => ({
      row: Math.min(Math.max(pos.row, 0), Math.max(rowCount - 1, 0)),
      col: Math.min(Math.max(pos.col, 0), Math.max(colCount - 1, 0)),
    }),
    [rowCount, colCount],
  )

  const move = useCallback(
    (next: CellPosition) => {
      shouldRefocus.current = true
      setFocused(clamp(next))
    },
    [clamp],
  )

  // Focus follows the keyboard, but only when a keystroke asked for it. Focusing on every
  // render would steal focus from whatever the user actually clicked.
  useEffect(() => {
    if (!shouldRefocus.current || editing) return
    shouldRefocus.current = false
    const selector = `[data-cell="${focused.row}-${focused.col}"]`
    gridRef.current?.querySelector<HTMLElement>(selector)?.focus()
  }, [focused, editing])

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const columnAt = (index: number) => columns[index]

  const beginEdit = useCallback(
    (pos: CellPosition, initial?: string) => {
      const column = columnAt(pos.col)
      const row = rows[pos.row]
      if (!column || row === undefined) return
      if (readOnly || !column.editable) return
      const current =
        initial ??
        (column.format ? column.format(row, pos.row) : String(readValue(row, column.key) ?? ''))
      setDraft(current)
      setEditing(pos)
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: columnAt is derived from columns
    [columns, rows, readOnly],
  )

  const commit = useCallback(
    (then?: CellPosition) => {
      if (!editing) return
      const column = columnAt(editing.col)
      const row = rows[editing.row]
      if (column && row !== undefined) {
        // `parse` returning undefined is the documented way to reject an edit, so an invalid
        // entry restores the old value rather than writing a broken one.
        const parsed = column.parse ? column.parse(draft, row) : draft
        if (parsed !== undefined) {
          onCellChange?.({
            rowIndex: editing.row,
            columnKey: column.key,
            value: parsed,
            row,
          })
        }
      }
      setEditing(null)
      shouldRefocus.current = true
      if (then) setFocused(clamp(then))
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: columnAt is derived from columns
    [editing, columns, rows, draft, onCellChange, clamp],
  )

  const cancel = useCallback(() => {
    setEditing(null)
    shouldRefocus.current = true
  }, [])

  const onCellKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, pos: CellPosition) => {
    if (editing) return

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        move({ ...pos, col: pos.col + 1 })
        return
      case 'ArrowLeft':
        event.preventDefault()
        move({ ...pos, col: pos.col - 1 })
        return
      case 'ArrowDown':
        event.preventDefault()
        move({ ...pos, row: pos.row + 1 })
        return
      case 'ArrowUp':
        event.preventDefault()
        move({ ...pos, row: pos.row - 1 })
        return
      case 'Home':
        event.preventDefault()
        move(event.ctrlKey ? { row: 0, col: 0 } : { ...pos, col: 0 })
        return
      case 'End':
        event.preventDefault()
        move(
          event.ctrlKey ? { row: rowCount - 1, col: colCount - 1 } : { ...pos, col: colCount - 1 },
        )
        return
      case 'Enter':
      case 'F2':
        event.preventDefault()
        beginEdit(pos)
        return
      default:
        // Typing over a cell replaces it, which is what a spreadsheet does and what anyone
        // entering data at speed expects.
        if (isTypingKey(event)) {
          event.preventDefault()
          beginEdit(pos, event.key)
        }
    }
  }

  const onEditorKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>, pos: CellPosition) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commit({ ...pos, row: pos.row + 1 })
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancel()
    } else if (event.key === 'Tab') {
      event.preventDefault()
      commit({ ...pos, col: pos.col + (event.shiftKey ? -1 : 1) })
    }
  }

  const scrolls = height !== undefined

  return (
    <div
      aria-colcount={colCount}
      aria-label={label}
      aria-readonly={readOnly || undefined}
      aria-rowcount={rowCount + 1}
      className={cx('vk-editable-grid', className)}
      data-scrolls={scrolls || undefined}
      id={id}
      ref={gridRef}
      role="grid"
      style={scrolls ? { height, overflow: 'auto' } : undefined}
    >
      <div className="vk-editable-grid__head" role="rowgroup">
        <div aria-rowindex={1} className="vk-editable-grid__row" role="row">
          {columns.map((column, col) => (
            <div
              aria-colindex={col + 1}
              className="vk-editable-grid__header"
              data-align={column.align}
              data-numeric={column.numeric || undefined}
              key={column.key}
              role="columnheader"
              style={column.width ? { width: column.width, flex: 'none' } : undefined}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      <div className="vk-editable-grid__body" role="rowgroup">
        {rows.map((row, rowIndex) => (
          <div
            aria-rowindex={rowIndex + 2}
            className="vk-editable-grid__row"
            key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
            role="row"
          >
            {columns.map((column, col) => {
              const isFocused = focused.row === rowIndex && focused.col === col
              const isEditing = editing?.row === rowIndex && editing?.col === col
              const canEdit = !readOnly && Boolean(column.editable)
              const pos = { row: rowIndex, col }

              return (
                <div
                  aria-colindex={col + 1}
                  aria-readonly={canEdit ? undefined : true}
                  className="vk-editable-grid__cell"
                  data-align={column.align}
                  data-cell={`${rowIndex}-${col}`}
                  data-editable={canEdit || undefined}
                  data-editing={isEditing || undefined}
                  data-numeric={column.numeric || undefined}
                  key={column.key}
                  onClick={() => {
                    shouldRefocus.current = true
                    setFocused(pos)
                  }}
                  onDoubleClick={() => beginEdit(pos)}
                  onKeyDown={(event) => onCellKeyDown(event, pos)}
                  role="gridcell"
                  style={column.width ? { width: column.width, flex: 'none' } : undefined}
                  /*
                   * Exactly one cell is tabbable — the roving tab stop. Inputs in every cell
                   * would mean one tab stop per cell, so a wide grid becomes a tab trap.
                   */
                  tabIndex={isFocused && !isEditing ? 0 : -1}
                >
                  {isEditing ? (
                    <input
                      aria-label={`${column.header}, row ${rowIndex + 1}`}
                      className="vk-editable-grid__input"
                      onBlur={() => commit()}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => onEditorKeyDown(event, pos)}
                      ref={inputRef}
                      value={draft}
                    />
                  ) : column.render ? (
                    column.render(row, rowIndex)
                  ) : (
                    String(readValue(row, column.key) ?? '')
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
