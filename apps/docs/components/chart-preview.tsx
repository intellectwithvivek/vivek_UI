import {
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  ProgressRing,
  Sparkline,
} from '@the_viveksingh/vivek-ui/charts'

/**
 * Live chart previews.
 *
 * All six render on the server: the charts produce a complete SVG from a `viewBox` with no
 * measurement, which is what lets them stay out of the client bundle entirely unless you
 * switch a hover tooltip on.
 */
const SERIES = [
  { x: 'Jan', y: 1200 },
  { x: 'Feb', y: 2600 },
  { x: 'Mar', y: 2450 },
  { x: 'Apr', y: 3800 },
  { x: 'May', y: 3200 },
  { x: 'Jun', y: 4600 },
]

const SLICES = [
  { label: 'Direct', value: 42 },
  { label: 'Search', value: 31 },
  { label: 'Social', value: 17 },
  { label: 'Referral', value: 10 },
]

export function ChartPreview({ slug }: { slug: string }) {
  switch (slug) {
    case 'line-chart':
      return <LineChart data={SERIES} height={240} showGrid title="Revenue" />
    case 'area-chart':
      return <AreaChart data={SERIES} height={240} showGrid title="Revenue" />
    case 'bar-chart':
      return <BarChart data={SERIES} height={240} showValues title="Revenue by month" />
    case 'pie-chart':
      return <PieChart data={SLICES} donut showLabels title="Traffic by source" />
    case 'progress-ring':
      return <ProgressRing label="Storage used" showValue value={68} />
    case 'sparkline':
      return <Sparkline data={SERIES.map((point) => point.y)} fill title="Revenue trend" />
    default:
      return null
  }
}
