import { forwardRef } from 'react'
import type { ChartData, ChartRootProps, ChartSeries } from '../internal/types'
import { XYChart } from '../internal/xy-chart'

export interface LineChartProps extends ChartRootProps {
  /** Single series. `[{ x, y }]`, or a bare `number[]` where the index is the x. */
  data?: ChartData
  /** Multiple series. Takes precedence over `data` when both are given. */
  series?: readonly ChartSeries[]
  /** Height of the `viewBox`, in px. The chart scales to its container width. */
  height?: number
  showGrid?: boolean
  showAxes?: boolean
  /** Defaults to on for more than one series. */
  showLegend?: boolean
  /** Per-point markers. Defaults to on while every series has 24 points or fewer. */
  showPoints?: boolean
  /** `smooth` draws a Catmull-Rom spline; control points are clamped to the plot. */
  curve?: 'linear' | 'smooth'
  strokeWidth?: number
  /** Opt in to the pointer hover tooltip. Mouse only - the data table is the AT path. */
  tooltip?: boolean
}

/**
 * A multi-series line chart in pure SVG - no d3, no canvas, nothing measured, so it
 * renders complete on the server.
 *
 * Series are told apart by colour *and* by a dash pattern *and* by a marker shape, so
 * the chart still reads in greyscale or with any form of colour blindness.
 */
export const LineChart = forwardRef<HTMLDivElement, LineChartProps>(function LineChart(
  {
    data,
    series,
    height,
    showGrid,
    showAxes,
    showLegend,
    showPoints,
    curve,
    strokeWidth,
    tooltip,
    title,
    description,
    accessibleTable,
    xLabel,
    yLabel,
    formatValue,
    className,
    style,
    ...rest
  },
  ref,
) {
  return (
    <XYChart
      rootClass="vk-line-chart"
      kind="line"
      rootRef={ref}
      data={data}
      series={series}
      height={height}
      showGrid={showGrid}
      showAxes={showAxes}
      showLegend={showLegend}
      showPoints={showPoints}
      curve={curve}
      strokeWidth={strokeWidth}
      tooltip={tooltip}
      title={title}
      description={description}
      accessibleTable={accessibleTable}
      xLabel={xLabel}
      yLabel={yLabel}
      formatValue={formatValue}
      className={className}
      style={style}
      rest={rest}
    />
  )
})
