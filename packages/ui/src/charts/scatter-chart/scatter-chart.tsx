import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { resolveCartesian } from '../internal/cartesian'
import { markerPath } from '../internal/palette'
import {
  CartesianFrame,
  ChartCaption,
  ChartEmpty,
  ChartLegend,
  ChartTable,
  chartLabel,
} from '../internal/parts'
import { f, formatNumber, isNum } from '../internal/scale'
import type { ChartRootProps, ChartSeries } from '../internal/types'

export interface ScatterDatum {
  x: number
  y: number
  /**
   * Optional third measure — supplying it on any point turns the series into a bubble
   * chart. Encoded as the **area** of the mark, not its radius: a value twice as big
   * reads as twice the ink. Scaling the radius directly (as Chart.js does with `r`)
   * squares the visual difference and quietly exaggerates every ratio.
   */
  r?: number
  /** Names the point in the accessible table. Position alone rarely identifies one. */
  label?: string
}

export interface ScatterSeries extends Omit<ChartSeries, 'data'> {
  data: readonly ScatterDatum[]
}

export interface ScatterChartProps extends ChartRootProps {
  /** Single series. */
  data?: readonly ScatterDatum[]
  /** Multiple series. Takes precedence over `data` when both are given. */
  series?: readonly ScatterSeries[]
  /** Height of the `viewBox`, in px. The chart scales to its container width. */
  height?: number
  showGrid?: boolean
  showAxes?: boolean
  /** Defaults to on for more than one series. */
  showLegend?: boolean
  /** Real checkboxes plus `:has()` — see LineChart. No client boundary. */
  interactiveLegend?: boolean
  /** Mark radius in px when no point carries `r`. */
  markSize?: number
  /** Largest bubble radius in px, reached by the largest `r` in the data. */
  maxBubbleSize?: number
}

/** Drop anything unplottable up front, so bubble radii stay index-aligned downstream. */
function clean(data: readonly ScatterDatum[] | undefined): ScatterDatum[] {
  if (!data) return []
  return data.filter((d) => d && isNum(d.x) && isNum(d.y) && (d.r === undefined || isNum(d.r)))
}

/**
 * A scatter chart — and, the moment any point carries `r`, a bubble chart. One
 * component for both because they are one picture: position encodes the relationship,
 * and `r` optionally encodes a third measure.
 *
 * Pure SVG like every chart here: no d3, no canvas, nothing measured at runtime, so it
 * renders complete on the server. Series are told apart by colour *and* marker shape,
 * so the plot still reads in greyscale or under any form of colour blindness, and the
 * hidden data table carries x, y and r for assistive tech.
 */
export const ScatterChart = forwardRef<HTMLDivElement, ScatterChartProps>(function ScatterChart(
  {
    data,
    series,
    height,
    showGrid = true,
    showAxes = true,
    showLegend,
    interactiveLegend,
    markSize = 4.5,
    maxBubbleSize = 18,
    title,
    description,
    accessibleTable = true,
    xLabel,
    yLabel,
    formatValue = formatNumber,
    className,
    style,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  // Pre-filtered here so resolveCartesian drops nothing further and `r` can be looked up
  // by (series, point) index with no drift.
  const cleaned: ScatterSeries[] = (
    series?.length ? series : data ? [{ data } as ScatterSeries] : []
  ).map((s) => ({ ...s, data: clean(s.data) }))

  const model = resolveCartesian({
    series: cleaned.map((s) => ({ ...s, data: s.data.map((d) => ({ x: d.x, y: d.y })) })),
    height: height ?? 240,
    showAxes,
    // Both axes are measures: numeric x makes the category scale linear, which is the
    // whole difference between a scatter plot and a category chart.
    baselineZero: false,
  })
  const { hasData } = model

  const rMax = Math.max(0, ...cleaned.flatMap((s) => s.data.map((d) => (isNum(d.r) ? d.r : 0))))
  const isBubble = rMax > 0

  /** Area-proportional bubble radius; plain scatter marks keep a constant size. */
  const radiusOf = (d: ScatterDatum): number =>
    isBubble && isNum(d.r) ? Math.max(2, Math.sqrt(d.r / rMax) * maxBubbleSize) : markSize

  const pointCount = cleaned.reduce((n, s) => n + s.data.length, 0)
  const label = chartLabel(
    ariaLabel,
    title,
    hasData
      ? `${isBubble ? 'Bubble' : 'Scatter'} chart, ${pointCount} points across ${model.series.length} series`
      : 'Scatter chart, no data',
  )

  const showTable = accessibleTable && hasData
  const legendOn = showLegend ?? model.series.length > 1

  return (
    <div
      ref={ref}
      className={cx('vk-chart', 'vk-scatter-chart', className)}
      data-bubble={isBubble || undefined}
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
        {model.series.map((s, si) => (
          <g key={s.name} className="vk-scatter-chart__series">
            {s.points.map((p, pi) => {
              const source = cleaned[si]?.data[pi]
              if (!source) return null
              return (
                <path
                  // Positional identity: two measurements may legitimately coincide.
                  // biome-ignore lint/suspicious/noArrayIndexKey: points are positional data
                  key={pi}
                  className="vk-scatter-chart__mark"
                  d={markerPath(
                    s.marker,
                    model.categoryAt(p, pi),
                    model.valueAt(p.y),
                    radiusOf(source),
                  )}
                  fill={s.color}
                />
              )
            })}
          </g>
        ))}
      </svg>
      {legendOn && hasData ? (
        <ChartLegend
          items={model.series.map((s, i) => ({
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
        <ChartTable
          caption={title ?? label}
          columns={[xLabel ?? 'x', yLabel ?? 'y', ...(isBubble ? ['Size'] : [])]}
          rows={cleaned.flatMap((s, si) =>
            s.data.map((d, pi) => ({
              key: `${si}:${pi}`,
              header: d.label ?? formatValue(d.x),
              cells: [
                {
                  key: 'y',
                  text: `${cleaned.length > 1 ? `${model.series[si]?.name ?? ''}: ` : ''}${formatValue(d.y)}`,
                },
                ...(isBubble
                  ? [{ key: 'r', text: d.r === undefined ? '' : formatValue(d.r) }]
                  : []),
              ],
            })),
          )}
        />
      ) : null}
    </div>
  )
})
