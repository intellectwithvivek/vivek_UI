/**
 * Shared render pieces: the SVG label block, the visually hidden data table, the
 * legend, and the cartesian grid/axes. All server-safe - no state, no effects, no
 * measurement - so a chart built from them renders completely on the server.
 */

import type { ReactNode } from 'react'
import type { CartesianModel } from './cartesian'
import { LABEL_SIZE } from './cartesian'
import type { MarkerShape } from './palette'
import { markerPath } from './palette'
import { f } from './scale'

/**
 * The accessible name for a chart. `aria-label` wins, then `title`; the fallback keeps
 * a chart from being announced as an unlabelled graphic even when the caller forgets.
 */
export function chartLabel(
  ariaLabel: string | undefined,
  title: string | undefined,
  fallback: string,
): string {
  return ariaLabel ?? title ?? fallback
}

/** SVG `<title>`/`<desc>`. Rendered first so AT that reads them finds them immediately. */
export function ChartCaption({ title, description }: { title?: string; description?: string }) {
  if (!title && !description) return null
  return (
    <>
      {title ? <title>{title}</title> : null}
      {description ? <desc>{description}</desc> : null}
    </>
  )
}

export interface TableCell {
  key: string
  text: string
}

export interface TableRow {
  key: string
  header: string
  cells: TableCell[]
}

export interface ChartTableProps {
  caption: string
  /** First column heading, then one heading per value column. */
  columns: string[]
  rows: TableRow[]
}

/**
 * The data behind the picture, as a real `<table>`, hidden from sight but not from
 * assistive tech (clip-path, never `display: none`). This is the part most chart
 * libraries skip, and it is the only way a screen reader user gets the actual numbers.
 */
export function ChartTable({ caption, columns, rows }: ChartTableProps) {
  if (rows.length === 0) return null
  const [first, ...rest] = columns
  return (
    <table className="vk-chart__table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{first ?? ''}</th>
          {rest.map((c) => (
            <th key={c} scope="col">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <th scope="row">{row.header}</th>
            {row.cells.map((cell) => (
              <td key={cell.key}>{cell.text}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Rows for the hidden table of an x/y chart: one row per category, one column per
 * series. A category a series has no point for reads as an em dash, not `0`.
 */
export function cartesianTable(
  model: CartesianModel,
  format: (value: number) => string,
  xLabel: string,
  yLabel = 'Value',
): { columns: string[]; rows: TableRow[] } {
  const lookup = model.series.map((s) => {
    const byLabel = new Map<string, number>()
    for (const p of s.points) byLabel.set(p.label, p.y)
    return byLabel
  })
  return {
    // A lone unnamed series takes the y axis label as its column heading.
    columns: [
      xLabel,
      ...model.series.map((s, i) =>
        model.series.length === 1 && s.name === 'Value' ? yLabel : s.name || `Series ${i + 1}`,
      ),
    ],
    rows: model.categories.map((category) => ({
      key: category,
      header: category,
      cells: model.series.map((s, i) => {
        const value = lookup[i]?.get(category)
        return {
          key: `${i}:${s.name}`,
          text: value === undefined ? '—' : format(value),
        }
      }),
    })),
  }
}

export interface LegendItem {
  key: string
  name: string
  color: string
  dash?: string | undefined
  marker?: MarkerShape | undefined
}

export interface ChartLegendProps {
  items: LegendItem[]
  /** `line` draws the dash pattern, `box` a filled swatch. */
  swatch?: 'line' | 'box'
  /** Hide from AT when a data table already names every series. */
  redundant?: boolean
}

export function ChartLegend({ items, swatch = 'line', redundant }: ChartLegendProps) {
  if (items.length === 0) return null
  return (
    <ul className="vk-chart__legend" aria-hidden={redundant ? 'true' : undefined}>
      {items.map((item) => (
        <li className="vk-chart__legend-item" key={item.key}>
          <svg
            className="vk-chart__swatch"
            viewBox="0 0 18 12"
            width="18"
            height="12"
            aria-hidden="true"
            focusable="false"
          >
            {swatch === 'box' ? (
              <rect x="1" y="2" width="16" height="8" rx="2" fill={item.color} />
            ) : (
              <>
                <line
                  x1="0"
                  y1="6"
                  x2="18"
                  y2="6"
                  stroke={item.color}
                  strokeWidth="2"
                  strokeDasharray={item.dash}
                />
                {item.marker ? (
                  <path d={markerPath(item.marker, 9, 6, 3)} fill={item.color} />
                ) : null}
              </>
            )}
          </svg>
          <span className="vk-chart__legend-label">{item.name}</span>
        </li>
      ))}
    </ul>
  )
}

export interface CartesianFrameProps {
  model: CartesianModel
  showGrid: boolean
  showAxes: boolean
}

/**
 * Grid lines, axis rules, tick labels and the zero baseline. Reads `orientation` off
 * the model, so a horizontal bar chart gets vertical grid lines and its category
 * labels down the left without any caller-side bookkeeping.
 */
export function CartesianFrame({ model, showGrid, showAxes }: CartesianFrameProps) {
  const { plot, valueTicks, categoryTicks, crossesZero, zeroAt, orientation } = model
  const horizontal = orientation === 'horizontal'
  const right = plot.x + plot.width
  const bottom = plot.y + plot.height
  const leftTicks = horizontal ? categoryTicks : valueTicks
  const bottomTicks = horizontal ? valueTicks : categoryTicks

  // No aria-hidden on the subtree: the parent <svg role="img"> already hides it from AT.
  return (
    <g className="vk-chart__frame">
      {showGrid
        ? valueTicks.map((tick) => (
            <line
              className="vk-chart__grid-line"
              key={`grid-${tick.value}`}
              x1={f(horizontal ? tick.at : plot.x)}
              y1={f(horizontal ? plot.y : tick.at)}
              x2={f(horizontal ? tick.at : right)}
              y2={f(horizontal ? bottom : tick.at)}
            />
          ))
        : null}
      {showAxes ? (
        <>
          <line
            className="vk-chart__axis"
            x1={f(plot.x)}
            y1={f(plot.y)}
            x2={f(plot.x)}
            y2={f(bottom)}
          />
          <line
            className="vk-chart__axis"
            x1={f(plot.x)}
            y1={f(bottom)}
            x2={f(right)}
            y2={f(bottom)}
          />
          {leftTicks.map((tick) => (
            <text
              className="vk-chart__tick"
              key={`lt-${tick.value}`}
              x={f(plot.x - 8)}
              y={f(tick.at)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={LABEL_SIZE}
            >
              {tick.label}
            </text>
          ))}
          {bottomTicks.map((tick) => (
            <text
              className="vk-chart__tick"
              key={`bt-${tick.value}`}
              x={f(tick.at)}
              y={f(bottom + LABEL_SIZE + 4)}
              textAnchor="middle"
              fontSize={LABEL_SIZE}
            >
              {tick.label}
            </text>
          ))}
        </>
      ) : null}
      {crossesZero ? (
        <line
          className="vk-chart__zero"
          x1={f(horizontal ? zeroAt : plot.x)}
          y1={f(horizontal ? plot.y : zeroAt)}
          x2={f(horizontal ? zeroAt : right)}
          y2={f(horizontal ? bottom : zeroAt)}
        />
      ) : null}
    </g>
  )
}

export interface EmptyStateProps {
  model: Pick<CartesianModel, 'plot'>
  children?: ReactNode
}

/** What an empty data array looks like: an axis frame and a word, never a throw. */
export function ChartEmpty({ model, children = 'No data' }: EmptyStateProps) {
  return (
    <text
      className="vk-chart__empty"
      x={f(model.plot.x + model.plot.width / 2)}
      y={f(model.plot.y + model.plot.height / 2)}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={LABEL_SIZE}
    >
      {children}
    </text>
  )
}
