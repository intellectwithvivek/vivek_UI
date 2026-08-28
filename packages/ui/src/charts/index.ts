/**
 * `@the_viveksingh/vivek-ui/charts`.
 *
 * Six charts, zero runtime dependencies, pure inline SVG. No d3, no canvas, no
 * Recharts - the scale and path maths is in `internal/scale.ts`, about 300 lines of it.
 *
 * Everything here renders completely on the server: the geometry lives in a fixed
 * `viewBox` that CSS scales, so nothing measures a container and no chart component is
 * a client component. The one client module is the hover tooltip, isolated in
 * `internal/hover-layer.tsx`. Note the honest caveat: LineChart, AreaChart and BarChart
 * import it statically, so a bundler adds that ~1 KB client chunk to any route using
 * them even with `tooltip` unset - it just never renders. Sparkline, PieChart and
 * ProgressRing pull in no client code at all.
 *
 * Styling: `charts.css` first, then the per-chart stylesheets.
 */

export { AreaChart, type AreaChartProps } from './area-chart'
export { BarChart, type BarChartProps } from './bar-chart'
export { Gauge, type GaugeBand, type GaugeProps } from './gauge'
export { Heatmap, type HeatmapCell, type HeatmapProps } from './heatmap'
export type { MarkerShape } from './internal/palette'
export type { ChartData, ChartDatum, ChartRootProps, ChartSeries } from './internal/types'
export { LineChart, type LineChartProps } from './line-chart'
export { PieChart, type PieChartProps, type PieDatum } from './pie-chart'
export { ProgressRing, type ProgressRingProps } from './progress-ring'
export { RadarChart, type RadarChartProps } from './radar-chart'
export {
  ScatterChart,
  type ScatterChartProps,
  type ScatterDatum,
  type ScatterSeries,
} from './scatter-chart'
export { Sparkline, type SparklineProps } from './sparkline'
