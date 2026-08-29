import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { normalizeSeries } from '../internal/cartesian'
import { markerPath } from '../internal/palette'
import { ChartCaption, ChartLegend, ChartTable, chartLabel } from '../internal/parts'
import { f, formatNumber, isNum, polarPoint } from '../internal/scale'
import type { ChartData, ChartRootProps, ChartSeries } from '../internal/types'

export interface RadarChartProps extends ChartRootProps {
  /** Single series: one value per axis, in axis order. */
  data?: ChartData
  /** Multiple series. Takes precedence over `data` when both are given. */
  series?: readonly ChartSeries[]
  /** Axis names, clockwise from the top. Values beyond the axis count are dropped. */
  axes: readonly string[]
  /** Top of the scale. Defaults to the largest value across every series. */
  max?: number
  /** Diameter of the `viewBox`, in px. The chart scales to its container width. */
  diameter?: number
  /** Concentric guide rings. */
  rings?: number
  /** Fill each polygon with a translucent wash. */
  fill?: boolean
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
}

const TAU = Math.PI * 2

/**
 * A radar chart — several measures of one thing, drawn as a polygon per series.
 *
 * The right chart for "compare these skills / stats / scores across the same axes", and
 * the wrong one for time series or precise reading — a value's position depends on which
 * axis it landed on, which is why every figure is also in the accessible table.
 *
 * Pure SVG, server-rendered, no dependency. Series are distinguished by colour *and*
 * marker shape at the vertices, and the polygon outline carries the per-series dash, so
 * two overlapping series stay separable in greyscale and under colour blindness.
 */
export const RadarChart = forwardRef<HTMLDivElement, RadarChartProps>(function RadarChart(
  {
    data,
    series,
    axes,
    max,
    diameter = 260,
    rings = 4,
    fill = true,
    showLegend,
    interactiveLegend = true,
    title,
    description,
    accessibleTable = true,
    formatValue = formatNumber,
    className,
    style,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const resolved = normalizeSeries(data, series).map((s) => ({
    ...s,
    // One value per axis; extras are dropped rather than wrapped, which would silently
    // plot two observations on one spoke.
    points: s.points.slice(0, axes.length),
  }))

  const values = resolved.flatMap((s) => s.points.map((p) => p.y)).filter(isNum)
  const hasData = axes.length >= 3 && values.length > 0
  const top = isNum(max) && max > 0 ? max : Math.max(1, ...values)

  const size = isNum(diameter) && diameter > 80 ? Math.round(diameter) : 260
  const cxp = size / 2
  const cyp = size / 2
  // Leave a margin for axis labels around the plot circle.
  const radius = size / 2 - 34

  /** Angle of axis `i`, starting at 12 o'clock and going clockwise. */
  const angleOf = (i: number) => -Math.PI / 2 + (TAU * i) / axes.length
  const at = (i: number, value: number) =>
    polarPoint(cxp, cyp, (Math.max(0, Math.min(value, top)) / top) * radius, angleOf(i))

  const polygonPath = (points: readonly (readonly [number, number])[]) =>
    points.length === 0 ? '' : `M ${points.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L ')} Z`

  const label = chartLabel(
    ariaLabel,
    title,
    hasData
      ? `Radar chart, ${resolved.length} series across ${axes.length} axes`
      : 'Radar chart, no data',
  )
  const showTable = accessibleTable && hasData
  const legendOn = showLegend ?? resolved.length > 1

  return (
    <div ref={ref} className={cx('vk-chart', 'vk-radar-chart', className)} style={style} {...rest}>
      <svg
        className="vk-chart__svg"
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={label}
        focusable="false"
      >
        <ChartCaption title={title} description={description} />
        {!hasData ? (
          <text className="vk-chart__empty" x={cxp} y={cyp} textAnchor="middle">
            {axes.length < 3 ? 'Radar needs at least 3 axes' : 'No data'}
          </text>
        ) : (
          <>
            {/* Guide rings + spokes: the polar equivalent of a cartesian grid. */}
            {Array.from({ length: rings }, (_, r) => (
              <polygon
                // biome-ignore lint/suspicious/noArrayIndexKey: rings are positional
                key={r}
                className="vk-radar-chart__ring"
                points={axes
                  .map((_, i) => {
                    const [x, y] = polarPoint(cxp, cyp, (radius * (r + 1)) / rings, angleOf(i))
                    return `${f(x)},${f(y)}`
                  })
                  .join(' ')}
              />
            ))}
            {axes.map((axis, i) => {
              const [x, y] = polarPoint(cxp, cyp, radius, angleOf(i))
              const [lx, ly] = polarPoint(cxp, cyp, radius + 16, angleOf(i))
              return (
                <g key={axis}>
                  <line className="vk-radar-chart__spoke" x1={cxp} y1={cyp} x2={f(x)} y2={f(y)} />
                  <text
                    className="vk-radar-chart__axis-label"
                    x={f(lx)}
                    y={f(ly)}
                    textAnchor={Math.abs(lx - cxp) < 1 ? 'middle' : lx > cxp ? 'start' : 'end'}
                    dominantBaseline="middle"
                  >
                    {axis}
                  </text>
                </g>
              )
            })}
            {resolved.map((s) => {
              const pts = s.points.map((p, i) => at(i, p.y))
              return (
                <g key={s.name} className="vk-radar-chart__series">
                  <path
                    className="vk-radar-chart__shape"
                    d={polygonPath(pts)}
                    stroke={s.color}
                    strokeDasharray={s.dash}
                    fill={fill ? s.color : 'none'}
                    data-filled={fill || undefined}
                  />
                  {pts.map(([x, y], i) => (
                    <path
                      // biome-ignore lint/suspicious/noArrayIndexKey: vertices are positional
                      key={i}
                      className="vk-radar-chart__vertex"
                      d={markerPath(s.marker, x, y, 3.5)}
                      fill={s.color}
                    />
                  ))}
                </g>
              )
            })}
          </>
        )}
      </svg>
      {legendOn && hasData ? (
        <ChartLegend
          items={resolved.map((s, i) => ({
            key: `${i}:${s.name}`,
            name: s.name,
            color: s.color,
            dash: s.dash,
          }))}
          interactive={interactiveLegend}
          swatch="line"
          redundant={showTable}
        />
      ) : null}
      {showTable ? (
        <ChartTable
          caption={title ?? label}
          columns={['Axis', ...resolved.map((s) => s.name)]}
          rows={axes.map((axis, i) => ({
            key: axis,
            header: axis,
            cells: resolved.map((s, si) => ({
              key: `${si}`,
              text: isNum(s.points[i]?.y) ? formatValue(s.points[i]?.y as number) : '',
            })),
          }))}
        />
      ) : null}
    </div>
  )
})
