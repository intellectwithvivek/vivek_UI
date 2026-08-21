/**
 * Code examples for the chart pages.
 *
 * Written by hand, not generated: a generated example is a render of the default props,
 * which teaches nothing. These are shaped like the data a real dashboard has — money in
 * integer cents, month keys from a database, a series that can be null.
 */
export interface ChartExample {
  title: string
  description?: string
  /** Key into `ChartPreview`. */
  variant: string
  code: string
}

const P = '@the_viveksingh/vivek-ui/charts'

export const CHART_EXAMPLES: Record<string, ChartExample[]> = {
  'line-chart': [
    {
      title: 'A single series',
      description: 'Pass `{ x, y }` points. The axis, grid and labels are derived.',
      variant: 'basic',
      code: `import { LineChart } from '${P}'
import '${P.replace('/charts', '')}/charts.css'

export default function Revenue() {
  return (
    <LineChart
      data={[
        { x: 'Jan', y: 1200 },
        { x: 'Feb', y: 2600 },
        { x: 'Mar', y: 2450 },
        { x: 'Apr', y: 3800 },
      ]}
      title="Revenue"
      height={240}
      showGrid
    />
  )
}`,
    },
    {
      title: 'Multiple series',
      description:
        'Each series gets its own colour, dash pattern and marker shape, so it stays readable in greyscale and to a colourblind reader.',
      variant: 'multi',
      code: `// Each series carries its own data array.
<LineChart
  series={[
    {
      name: 'Revenue',
      data: [
        { x: 'Jan', y: 1200 },
        { x: 'Feb', y: 2600 },
        { x: 'Mar', y: 2450 },
        { x: 'Apr', y: 3800 },
      ],
    },
    {
      name: 'Costs',
      data: [
        { x: 'Jan', y: 900 },
        { x: 'Feb', y: 1400 },
        { x: 'Mar', y: 1500 },
        { x: 'Apr', y: 1900 },
      ],
    },
  ]}
  title="Revenue vs costs"
  height={260}
  showGrid
  showLegend
/>`,
    },
    {
      title: 'Mapping from an API',
      description:
        'Money arrives as integer cents and dates as ISO strings. One `.map()` is the whole adapter.',
      variant: 'mapped',
      code: `const monthly = await db.revenueByMonth()
// [{ month: '2026-01', total_cents: 120000 }, …]

<LineChart
  data={monthly.map((row) => ({
    x: new Date(row.month).toLocaleDateString('en', { month: 'short' }),
    y: row.total_cents / 100,
  }))}
  title="Revenue"
  curve="smooth"
  height={240}
  showGrid
/>`,
    },
  ],

  'area-chart': [
    {
      title: 'Filled area',
      variant: 'basic',
      code: `<AreaChart
  data={[
    { x: 'Mon', y: 320 },
    { x: 'Tue', y: 480 },
    { x: 'Wed', y: 410 },
    { x: 'Thu', y: 610 },
    { x: 'Fri', y: 540 },
  ]}
  title="Sessions this week"
  height={240}
  showGrid
/>`,
    },
    {
      title: 'Stacked',
      description:
        'Set `stacked` and each series sits on the one below it rather than overlapping.',
      variant: 'stacked',
      code: `<AreaChart
  series={[
    {
      name: 'Organic',
      data: [
        { x: 'Mon', y: 200 },
        { x: 'Tue', y: 300 },
        { x: 'Wed', y: 260 },
        { x: 'Thu', y: 380 },
      ],
    },
    {
      name: 'Paid',
      data: [
        { x: 'Mon', y: 120 },
        { x: 'Tue', y: 180 },
        { x: 'Wed', y: 150 },
        { x: 'Thu', y: 230 },
      ],
    },
  ]}
  stacked
  showLegend
  title="Traffic by channel"
  height={260}
/>`,
    },
  ],

  'bar-chart': [
    {
      title: 'Vertical bars',
      description:
        '`showValues` prints the number on each bar, so the chart is readable without hovering.',
      variant: 'basic',
      code: `<BarChart
  data={[
    { x: 'Jan', y: 1200 },
    { x: 'Feb', y: 2600 },
    { x: 'Mar', y: 2450 },
    { x: 'Apr', y: 3800 },
  ]}
  title="Revenue by month"
  height={240}
  showValues
/>`,
    },
    {
      title: 'Grouped and stacked',
      variant: 'grouped',
      code: `<BarChart
  series={[
    { name: 'Pro', data: [{ x: 'Q1', y: 40 }, { x: 'Q2', y: 62 }, { x: 'Q3', y: 71 }] },
    { name: 'Team', data: [{ x: 'Q1', y: 12 }, { x: 'Q2', y: 18 }, { x: 'Q3', y: 24 }] },
  ]}
  mode="grouped"   /* or "stacked" */
  showLegend
  title="New customers by plan"
  height={260}
/>`,
    },
    {
      title: 'Horizontal, for long labels',
      description: 'Category names that would collide on a vertical axis read fine horizontally.',
      variant: 'horizontal',
      code: `<BarChart
  data={[
    { x: 'Organic search', y: 4200 },
    { x: 'Direct traffic', y: 3100 },
    { x: 'Social referral', y: 1800 },
    { x: 'Paid campaigns', y: 900 },
  ]}
  horizontal
  showValues
  title="Sessions by source"
  height={260}
/>`,
    },
  ],

  'pie-chart': [
    {
      title: 'Donut with a centre label',
      description:
        'Percentages are printed on the slices, so the chart does not rely on colour matching a legend.',
      variant: 'basic',
      code: `<PieChart
  data={[
    { label: 'Direct', value: 42 },
    { label: 'Search', value: 31 },
    { label: 'Social', value: 17 },
    { label: 'Referral', value: 10 },
  ]}
  donut
  showLabels
  centerLabel="100%"
  centerSublabel="of traffic"
  title="Traffic by source"
/>`,
    },
    {
      title: 'Full pie',
      variant: 'pie',
      code: `<PieChart
  data={[
    { label: 'Free', value: 620 },
    { label: 'Pro', value: 240 },
    { label: 'Team', value: 90 },
  ]}
  showLabels
  title="Customers by plan"
/>`,
    },
  ],

  'progress-ring': [
    {
      title: 'A single metric',
      description:
        'Real `role="progressbar"` semantics, so it is announced as progress, not an image.',
      variant: 'basic',
      code: `<ProgressRing value={68} label="Storage used" showValue />`,
    },
    {
      title: 'Custom content and scale',
      variant: 'custom',
      code: `<ProgressRing value={7} max={10} size={140} thickness={12} label="Onboarding">
  <strong>7/10</strong>
  <span>steps done</span>
</ProgressRing>`,
    },
  ],

  sparkline: [
    {
      title: 'Inline trend',
      description: 'No axes, no legend. Sized to sit beside a number in a stat tile.',
      variant: 'basic',
      code: `<Sparkline data={[12, 19, 14, 27, 24, 31, 38]} title="Signups trend" />`,
    },
    {
      title: 'In a stat tile',
      description: 'The pattern it exists for: a KPI with its recent shape next to it.',
      variant: 'tile',
      code: `<Card padding="lg">
  <Card.Body>
    <Text size="sm" tone="muted">Signups</Text>
    <Heading level={3} size="2xl">1,284</Heading>
    <Sparkline
      data={[12, 19, 14, 27, 24, 31, 38]}
      fill
      showLastPoint
      title="Signups over 7 days"
    />
  </Card.Body>
</Card>`,
    },
  ],
}

export function chartExamplesFor(slug: string): ChartExample[] {
  return CHART_EXAMPLES[slug] ?? []
}
