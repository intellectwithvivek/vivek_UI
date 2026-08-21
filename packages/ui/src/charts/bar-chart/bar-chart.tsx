import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { LABEL_SIZE, resolveCartesian, stackSeries } from '../internal/cartesian'
import type { HoverSlot } from '../internal/hover-layer'
import { ChartHoverLayer } from '../internal/hover-layer'
import { SERIES_COUNT } from '../internal/palette'
import {
  CartesianFrame,
  ChartCaption,
  ChartEmpty,
  ChartLegend,
  ChartTable,
  cartesianTable,
  chartLabel,
} from '../internal/parts'
import { clamp, f, formatNumber, isNum } from '../internal/scale'
import type { ChartData, ChartRootProps, ChartSeries } from '../internal/types'

export interface BarChartProps extends ChartRootProps {
  /** Single series. `[{ x, y }]`, or a bare `number[]` where the index is the x. */
  data?: ChartData
  /** Multiple series. Takes precedence over `data` when both are given. */
  series?: readonly ChartSeries[]
  height?: number
  showGrid?: boolean
  showAxes?: boolean
  showLegend?: boolean
  /**
   * Turn each legend entry into a checkbox that shows and hides its series, with a fade.
   *
   * No JavaScript and no client boundary: the entries are real checkboxes and the chart
   * reacts with `:has()`. Off by default, because it makes the legend a set of controls -
   * right for a dashboard, wrong for a figure in a report.
   */
  interactiveLegend?: boolean
  /**
   * `grouped` puts a series side by side inside each category; `stacked` piles them,
   * with negatives stacking downward from zero.
   */
  mode?: 'grouped' | 'stacked'
  /** Bars run left to right, with the categories down the left edge. */
  horizontal?: boolean
  /** Corner radius, in viewBox px. Clamped so short bars do not turn into lozenges. */
  barRadius?: number
  /** Fraction of each category slot left empty, 0 to 0.9. */
  categoryPadding?: number
  /** Print each value at the end of its bar - the clearest non-colour cue there is. */
  showValues?: boolean
  /** Pointer hover tooltip. Mouse only, and ignored for `horizontal`. */
  tooltip?: boolean
}

interface Bar {
  key: string
  /** Palette slot, 1-based. What the interactive-legend rules in charts.css target. */
  seriesIndex: number
  x: number
  y: number
  width: number
  height: number
  radius: number
  color: string
  dash: string | undefined
  /** Where a value label goes, and how to anchor it. */
  labelX: number
  labelY: number
  anchor: 'start' | 'middle' | 'end'
  text: string
}

/**
 * Vertical or horizontal bars, grouped or stacked, in pure SVG. The value axis always
 * includes zero - a bar chart that starts anywhere else misrepresents its own data -
 * and negative bars extend the other side of the zero line.
 */
export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(function BarChart(
  {
    data,
    series,
    height = 260,
    showGrid = true,
    showAxes = true,
    showLegend,
    interactiveLegend,
    mode = 'grouped',
    horizontal = false,
    barRadius = 3,
    categoryPadding = 0.24,
    showValues = false,
    tooltip = false,
    title,
    description,
    accessibleTable = true,
    xLabel = 'Category',
    yLabel = 'Value',
    formatValue = formatNumber,
    className,
    style,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const stacked = mode === 'stacked'
  const model = resolveCartesian({
    data,
    series,
    height,
    showAxes,
    orientation: horizontal ? 'horizontal' : 'vertical',
    baselineZero: true,
    stacked,
    placement: 'band',
    bandPadding: clamp(isNum(categoryPadding) ? categoryPadding : 0.24, 0, 0.9),
  })
  const { plot, series: resolved, categories, band, hasData, zeroAt } = model
  const stacks = stacked ? stackSeries(resolved, categories) : null

  const groupCount = Math.max(1, resolved.length)
  const innerStep = stacked ? band.width : band.width / groupCount
  const barSize = stacked ? band.width : Math.max(0, innerStep * 0.88)

  const bars: Bar[] = []
  resolved.forEach((s, si) => {
    const byLabel = new Map<string, number>()
    for (const p of s.points) byLabel.set(p.label, p.y)
    categories.forEach((category, ci) => {
      const stack = stacks?.[si]?.[ci]
      const value = stack ? stack.y1 - stack.y0 : byLabel.get(category)
      if (value === undefined || !isNum(value) || value === 0) return

      const from = stack ? model.valueAt(stack.y0) : zeroAt
      const to = stack ? model.valueAt(stack.y1) : model.valueAt(value)
      const start = Math.min(from, to)
      const length = Math.abs(to - from)
      const offset = band.at(ci) + (stacked ? 0 : si * innerStep + (innerStep - barSize) / 2)
      const radius = Math.max(
        0,
        Math.min(isNum(barRadius) ? barRadius : 0, barSize / 2, length / 2),
      )
      const text = formatValue(value)

      bars.push(
        horizontal
          ? {
              key: `${si}:${category}`,
              seriesIndex: (si % SERIES_COUNT) + 1,
              x: start,
              y: offset,
              width: length,
              height: barSize,
              radius,
              color: s.color,
              dash: s.dash,
              labelX: value >= 0 ? start + length + 4 : start - 4,
              labelY: offset + barSize / 2,
              anchor: value >= 0 ? 'start' : 'end',
              text,
            }
          : {
              key: `${si}:${category}`,
              seriesIndex: (si % SERIES_COUNT) + 1,
              x: offset,
              y: start,
              width: barSize,
              height: length,
              radius,
              color: s.color,
              dash: s.dash,
              labelX: offset + barSize / 2,
              labelY: value >= 0 ? start - 5 : start + length + LABEL_SIZE,
              anchor: 'middle',
              text,
            },
      )
    })
  })

  const slots: HoverSlot[] =
    tooltip && !horizontal
      ? categories.map((label, ci) => ({
          key: label,
          label,
          x: model.categoryAtIndex(ci),
          x0: band.at(ci) - (band.step - band.width) / 2,
          x1: band.at(ci) + band.width + (band.step - band.width) / 2,
          rows: resolved
            .map((s) => {
              const point = s.points.find((p) => p.label === label)
              return point
                ? { key: s.name, name: s.name, value: formatValue(point.y), color: s.color }
                : null
            })
            .filter((r): r is NonNullable<typeof r> => r !== null),
        }))
      : []

  const label = chartLabel(
    ariaLabel,
    title,
    hasData
      ? `Bar chart, ${resolved.length} series across ${categories.length} ${
          categories.length === 1 ? 'category' : 'categories'
        }${stacked ? ', stacked' : ''}`
      : 'Bar chart, no data',
  )
  const table = cartesianTable(model, formatValue, xLabel, yLabel)
  const showTable = accessibleTable && hasData
  const legendOn = showLegend ?? resolved.length > 1

  return (
    <div
      ref={ref}
      className={cx('vk-chart', 'vk-bar-chart', className)}
      data-mode={mode}
      data-orientation={horizontal ? 'horizontal' : 'vertical'}
      style={style}
      {...rest}
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
        <g className="vk-chart__series">
          {bars.map((bar) =>
            bar.width > 0 && bar.height > 0 ? (
              <rect
                className="vk-bar-chart__bar"
                key={bar.key}
                data-series-index={bar.seriesIndex}
                x={f(bar.x)}
                y={f(bar.y)}
                width={f(bar.width)}
                height={f(bar.height)}
                rx={f(bar.radius)}
                fill={bar.color}
                strokeDasharray={bar.dash}
              />
            ) : null,
          )}
        </g>
        {showValues ? (
          <g className="vk-chart__values">
            {bars.map((bar) => (
              <text
                className="vk-chart__value"
                key={`v-${bar.key}`}
                x={f(bar.labelX)}
                y={f(bar.labelY)}
                textAnchor={bar.anchor}
                dominantBaseline={horizontal ? 'middle' : 'auto'}
                fontSize={LABEL_SIZE}
              >
                {bar.text}
              </text>
            ))}
          </g>
        ) : null}
        {tooltip && !horizontal && hasData ? (
          <ChartHoverLayer slots={slots} plot={plot} crosshair={false} />
        ) : null}
      </svg>
      {legendOn ? (
        <ChartLegend
          items={resolved.map((s, i) => ({
            key: `${i}:${s.name}`,
            name: s.name,
            color: s.color,
            dash: s.dash,
          }))}
          interactive={interactiveLegend}
          swatch="box"
          redundant={showTable}
        />
      ) : null}
      {showTable ? (
        <ChartTable caption={title ?? label} columns={table.columns} rows={table.rows} />
      ) : null}
    </div>
  )
})
