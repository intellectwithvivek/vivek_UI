import { LineChart } from '@the_viveksingh/vivek-ui/charts'

// Server-safe: the chart renders a complete SVG with no measurement, so it needs no
// client boundary unless you switch its hover tooltip on.
export default function LineChartPreview() {
  return (
    <LineChart
      data={[
        { x: 'Jan', y: 1200 },
        { x: 'Feb', y: 2600 },
        { x: 'Mar', y: 2450 },
        { x: 'Apr', y: 3800 },
        { x: 'May', y: 3200 },
        { x: 'Jun', y: 4600 },
      ]}
      height={240}
      showGrid
      title="Revenue"
    />
  )
}
