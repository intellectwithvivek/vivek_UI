import {
  forwardRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react'
import { cx } from '../../utils/cx'

export type TableSize = 'sm' | 'md' | 'lg'
/** Logical alignment, so RTL works for free. `numeric` implies `end`. */
export type TableAlign = 'start' | 'center' | 'end'

/**
 * Props for the scroll container.
 *
 * The pattern index signature is there because `data-*` attributes are only special
 * inside JSX: passing `{ 'data-testid': 'x' }` as a plain object would otherwise be an
 * excess-property error.
 */
export interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  [dataAttribute: `data-${string}`]: unknown
}

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  size?: TableSize
  /** Zebra-stripe body rows. */
  striped?: boolean
  /** Outer border plus cell dividers. */
  bordered?: boolean
  /** Highlight body rows on hover (pointer devices only). */
  hoverable?: boolean
  /**
   * Pin the header while the body scrolls.
   *
   * The scroll container is the wrapper this component renders, so the wrapper needs a
   * block size for there to be anything to scroll: `stickyHeader` therefore caps it at
   * `--vk-table-max-block-size` (60vh by default). Override that variable — or pass a
   * `maxHeight` through `containerProps` — to choose your own.
   */
  stickyHeader?: boolean
  /**
   * Props for the scroll container that wraps the `<table>`.
   *
   * The wrapper exists so a too-wide table scrolls inside itself instead of making the
   * whole page scroll sideways. `className`/`style`/`...rest` on `Table` itself land on
   * the `<table>`, which is also what the forwarded ref points at.
   */
  containerProps?: TableContainerProps
  /**
   * Accessible name of the scroll wrapper, announced when a keyboard user tabs onto it.
   * Default `'Scrollable table'`; pass the table's subject when a page has several.
   */
  scrollLabel?: string
}

export interface TableSectionProps extends HTMLAttributes<HTMLTableSectionElement> {}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Sets `data-selected` for styling. Selection state itself belongs to the caller. */
  selected?: boolean
}

/** `align` is omitted because the native attribute of that name is deprecated. */
export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: TableAlign
  /** Right-align and switch to tabular figures, so digits line up in a column. */
  numeric?: boolean
  /**
   * Column name for this cell, surfaced as `data-label`.
   *
   * Only used by card/stack layouts (see `DataTable` `responsive="stack"`), where the
   * header row is gone and each cell has to carry its own label via CSS `attr()`.
   */
  label?: string
}

export interface TableHeaderCellProps
  extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: TableAlign
  numeric?: boolean
  /** Defaults to `col`. Use `row` for a `<th>` that names its row. */
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup'
}

export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {
  /**
   * Keep the caption for assistive tech but take it off the screen.
   *
   * A `<caption>` is the most reliable way to name a table; this is the escape hatch for
   * designs that have no room to show one.
   */
  visuallyHidden?: boolean
}

/**
 * A semantic `<table>`.
 *
 * Server-safe on purpose: no state, no effects, no `'use client'`. Everything
 * interactive (sorting, selection, paging) lives in `DataTable`, which is built out of
 * these same parts — so anything you can render statically here keeps working there.
 */
const TableRoot = forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    size = 'md',
    striped,
    bordered,
    hoverable,
    stickyHeader,
    containerProps,
    scrollLabel = 'Scrollable table',
    className,
    ...rest
  },
  ref,
) {
  const { className: containerClassName, ...containerRest } = containerProps ?? {}
  return (
    <div
      className={cx('vk-table-wrap', containerClassName)}
      data-bordered={bordered || undefined}
      data-sticky-header={stickyHeader || undefined}
      /*
       * A wide table scrolls sideways inside this wrapper on a narrow screen, which makes it
       * a scrollable region - and one a keyboard cannot reach strands every column past the
       * fold (WCAG 2.1.1; axe scrollable-region-focusable, found by the phone leg of the
       * browser suite). A group, not a landmark: a page may hold several tables.
       */
      role="group"
      aria-label={scrollLabel}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: WCAG 2.1.1 - a scrollable region must be focusable or a keyboard user cannot scroll it.
      tabIndex={0}
      {...containerRest}
    >
      <table
        ref={ref}
        className={cx('vk-table', className)}
        data-size={size}
        data-striped={striped || undefined}
        data-bordered={bordered || undefined}
        data-hoverable={hoverable || undefined}
        data-sticky-header={stickyHeader || undefined}
        {...rest}
      />
    </div>
  )
})

const TableHead = forwardRef<HTMLTableSectionElement, TableSectionProps>(function TableHead(
  { className, ...rest },
  ref,
) {
  return <thead ref={ref} className={cx('vk-table__head', className)} {...rest} />
})

const TableBody = forwardRef<HTMLTableSectionElement, TableSectionProps>(function TableBody(
  { className, ...rest },
  ref,
) {
  return <tbody ref={ref} className={cx('vk-table__body', className)} {...rest} />
})

const TableFoot = forwardRef<HTMLTableSectionElement, TableSectionProps>(function TableFoot(
  { className, ...rest },
  ref,
) {
  return <tfoot ref={ref} className={cx('vk-table__foot', className)} {...rest} />
})

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { selected, className, ...rest },
  ref,
) {
  return (
    <tr
      ref={ref}
      className={cx('vk-table__row', className)}
      data-selected={selected || undefined}
      {...rest}
    />
  )
})

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align, numeric, label, className, ...rest },
  ref,
) {
  return (
    <td
      ref={ref}
      className={cx('vk-table__cell', className)}
      data-align={align}
      data-numeric={numeric || undefined}
      data-label={label}
      {...rest}
    />
  )
})

const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell({ align, numeric, scope = 'col', className, ...rest }, ref) {
    return (
      <th
        ref={ref}
        scope={scope}
        className={cx('vk-table__header-cell', className)}
        data-align={align}
        data-numeric={numeric || undefined}
        {...rest}
      />
    )
  },
)

const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(function TableCaption(
  { visuallyHidden, className, ...rest },
  ref,
) {
  return (
    <caption
      ref={ref}
      className={cx('vk-table__caption', className)}
      data-visually-hidden={visuallyHidden || undefined}
      {...rest}
    />
  )
})

/**
 * Compound component: `Table`, `Table.Head`, `Table.Body`, `Table.Foot`, `Table.Row`,
 * `Table.Cell`, `Table.HeaderCell`, `Table.Caption`.
 */
export const Table = Object.assign(TableRoot, {
  Head: TableHead,
  Body: TableBody,
  Foot: TableFoot,
  Row: TableRow,
  Cell: TableCell,
  HeaderCell: TableHeaderCell,
  Caption: TableCaption,
})
