/**
 * The shared renderer behind `LineChart` and `AreaChart`. They are the same picture
 * with and without a fill, so the geometry lives here once; each public component keeps
 * its own props, class name and defaults.
 *
 * Server-safe: this is not a client component. The only client code is the hover layer,
 * kept in its own module so this file stays free of state and effects.
 */

import type { CSSProperties, ForwardedRef, HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import { resolveCartesian, stackSeries } from './cartesian'
import type { HoverSlot } from './hover-layer'
import { ChartHoverLayer } from './hover-layer'
import { markerPath, SERIES_COUNT } from './palette'
import {
  CartesianFrame,
  ChartCaption,
  ChartEmpty,
  ChartLegend,
  ChartTable,
  cartesianTable,
  chartLabel,
} from './parts'
import type { Point } from './scale'
import { areaPath, f, formatNumber, isNum, linePath } from './scale'
import type { ChartData, ChartSeries } from './types'

/** Auto-hide point markers once they would collide at this many points per series. */
const MARKER_LIMIT = 24

export interface XYChartProps {
  rootClass: string
  kind: 'line' | 'area'
  rootRef: ForwardedRef<HTMLDivElement>
  data?: ChartData
  series?: readonly ChartSeries[]
  height?: number
  showGrid?: boolean
  showAxes?: boolean
  showLegend?: boolean
  /**
   * Each legend entry is a checkbox that shows and hides its series, with a fade — the way
   * every charting library's users expect a legend to behave. On by default whenever the
   * legend shows; pass `false` for a figure in a report, where the legend is a key and not a
   * control.
   *
   * No JavaScript and no client boundary: the entries are real checkboxes and the chart
   * reacts with `:has()`.
   */
  interactiveLegend?: boolean
  showPoints?: boolean
  curve?: 'linear' | 'smooth'
  stacked?: boolean
  strokeWidth?: number
  tooltip?: boolean
  title?: string
  description?: string
  accessibleTable?: boolean
  xLabel?: string
  yLabel?: string
  formatValue?: (value: number) => string
  rest: Omit<HTMLAttributes<HTMLDivElement>, 'title'>
  className?: string | undefined
  style?: CSSProperties | undefined
}

export function XYChart({
  rootClass,
  kind,
  rootRef,
  data,
  series,
  height = 240,
  showGrid = true,
  showAxes = true,
  showLegend,
  interactiveLegend = true,
  showPoints,
  curve = 'linear',
  stacked = false,
  strokeWidth = 2,
  tooltip = false,
  title,
  description,
  accessibleTable = true,
  xLabel = 'Category',
  yLabel = 'Value',
  formatValue = formatNumber,
  rest,
  className,
  style,
}: XYChartProps) {
  const { 'aria-label': ariaLabel, ...domProps } = rest
  const isArea = kind === 'area'
  const model = resolveCartesian({
    data,
    series,
    height,
    showAxes,
    // An area measured from an arbitrary floor lies about magnitude, so areas anchor to zero.
    baselineZero: isArea,
    stacked: isArea && stacked,
    placement: 'point',
  })
  const { plot, series: resolved, categories, bounds, hasData } = model
  const smooth = curve === 'smooth'
  const sw = isNum(strokeWidth) && strokeWidth > 0 ? strokeWidth : 2
  const useStack = isArea && stacked
  const stacks = useStack ? stackSeries(resolved, categories) : null

  // One x per category, taken from whichever series actually has that point, so a
  // numeric x axis and a categorical one both land in the right place.
  const categoryX = categories.map((label, index) => {
    for (const s of resolved) {
      const i = s.points.findIndex((p) => p.label === label)
      const point = i >= 0 ? s.points[i] : undefined
      if (point) return model.categoryAt(point, i)
    }
    return model.categoryAtIndex(index)
  })

  const markersOn =
    showPoints ?? resolved.every((s) => s.points.length > 0 && s.points.length <= MARKER_LIMIT)

  const layers = resolved.map((s, index) => {
    const stack = stacks?.[index]
    const top: Point[] = stack
      ? categories.map((_, ci) => [categoryX[ci] ?? plot.x, model.valueAt(stack[ci]?.y1 ?? 0)])
      : s.points.map((p, i) => [model.categoryAt(p, i), model.valueAt(p.y)])
    const labels = stack ? categories : s.points.map((p) => p.label)
    const line = linePath(top, smooth, bounds)
    let fill = ''
    if (isArea && top.length > 0) {
      const baseline: Point[] = stack
        ? categories
            .map((_, ci): Point => [categoryX[ci] ?? plot.x, model.valueAt(stack[ci]?.y0 ?? 0)])
            .reverse()
        : [
            [top[top.length - 1]?.[0] ?? plot.x, model.zeroAt],
            [top[0]?.[0] ?? plot.x, model.zeroAt],
          ]
      fill = areaPath(top, baseline, smooth, bounds)
    }
    return { key: `${index}:${s.name}`, series: s, top, labels, line, fill }
  })

  const slots: HoverSlot[] = tooltip
    ? categories.map((label, index) => {
        const x = categoryX[index] ?? plot.x
        const prev = categoryX[index - 1]
        const next = categoryX[index + 1]
        return {
          key: label,
          label,
          x,
          x0: prev === undefined ? plot.x : (prev + x) / 2,
          x1: next === undefined ? plot.x + plot.width : (x + next) / 2,
          rows: resolved
            .map((s) => {
              const point = s.points.find((p) => p.label === label)
              return point
                ? { key: s.name, name: s.name, value: formatValue(point.y), color: s.color }
                : null
            })
            .filter((r): r is NonNullable<typeof r> => r !== null),
        }
      })
    : []

  const label = chartLabel(
    ariaLabel,
    title,
    hasData
      ? `${isArea ? 'Area' : 'Line'} chart, ${resolved.length} series, ${categories.length} ${
          categories.length === 1 ? 'point' : 'points'
        }`
      : `${isArea ? 'Area' : 'Line'} chart, no data`,
  )
  const table = cartesianTable(model, formatValue, xLabel, yLabel)
  const showTable = accessibleTable && hasData
  const legendOn = showLegend ?? resolved.length > 1

  return (
    <div
      ref={rootRef}
      className={cx('vk-chart', rootClass, className)}
      data-curve={curve}
      data-stacked={useStack ? 'true' : undefined}
      style={style}
      {...domProps}
    >
      <svg
        className="vk-chart__svg"
        viewBox={`0 0 ${f(model.width)} ${f(model.height)}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={label}
        focusable="false"
      >
        <ChartCaption title={title} description={description} />
        <CartesianFrame model={model} showGrid={showGrid} showAxes={showAxes} />
        {hasData ? null : <ChartEmpty model={model} />}
        {layers.map((layer, seriesIndex) => (
          <g
            className="vk-chart__series"
            key={layer.key}
            data-series-name={layer.series.name}
            // Palette slot, so the six static rules in charts.css can hide this group when
            // its legend checkbox is cleared. Wraps with the palette, same as the colour.
            data-series-index={(seriesIndex % SERIES_COUNT) + 1}
          >
            {layer.fill ? (
              <path className="vk-chart__area" d={layer.fill} fill={layer.series.color} />
            ) : null}
            {layer.line ? (
              <path
                className="vk-chart__line"
                d={layer.line}
                stroke={layer.series.color}
                strokeWidth={sw}
                strokeDasharray={layer.series.dash}
              />
            ) : null}
            {markersOn
              ? layer.top.map((pt, i) => {
                  const d = markerPath(layer.series.marker, pt[0], pt[1], sw + 1.5)
                  const key = layer.labels[i] ?? String(pt[0])
                  return d ? (
                    <path className="vk-chart__marker" key={key} d={d} fill={layer.series.color} />
                  ) : null
                })
              : null}
          </g>
        ))}
        {tooltip && hasData ? <ChartHoverLayer slots={slots} plot={plot} /> : null}
      </svg>
      {legendOn ? (
        <ChartLegend
          items={resolved.map((s, i) => ({
            key: `${i}:${s.name}`,
            name: s.name,
            color: s.color,
            dash: s.dash,
            marker: markersOn ? s.marker : undefined,
          }))}
          swatch="line"
          redundant={showTable}
          interactive={interactiveLegend}
        />
      ) : null}
      {showTable ? (
        <ChartTable caption={title ?? label} columns={table.columns} rows={table.rows} />
      ) : null}
    </div>
  )
}
