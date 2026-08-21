import { forwardRef } from 'react'
import type { ChartData, ChartRootProps, ChartSeries } from '../internal/types'
import { XYChart } from '../internal/xy-chart'

export interface AreaChartProps extends ChartRootProps {
  /** Single series. `[{ x, y }]`, or a bare `number[]` where the index is the x. */
  data?: ChartData
  /** Multiple series. Takes precedence over `data` when both are given. */
  series?: readonly ChartSeries[]
  height?: number
  showGrid?: boolean
  showAxes?: boolean
  showLegend?: boolean
  showPoints?: boolean
  curve?: 'linear' | 'smooth'
  strokeWidth?: number
  /**
   * Stack the series on top of one another instead of overlaying them. Positive and
   * negative values stack in opposite directions from zero, so mixed signs still read.
   */
  stacked?: boolean
  /** Opt in to the pointer hover tooltip. Mouse only - the data table is the AT path. */
  tooltip?: boolean
}

/**
 * A line chart with the region under each series filled. The y axis always includes
 * zero, because an area measured from an arbitrary floor overstates its own magnitude.
 */
export const AreaChart = forwardRef<HTMLDivElement, AreaChartProps>(function AreaChart(
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
    stacked,
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
      rootClass="vk-area-chart"
      kind="area"
      rootRef={ref}
      data={data}
      series={series}
      height={height}
      showGrid={showGrid}
      showAxes={showAxes}
      showLegend={showLegend}
      showPoints={showPoints}
      curve={curve}
      stacked={stacked}
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
