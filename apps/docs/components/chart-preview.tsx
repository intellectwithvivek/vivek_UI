import { Card, Heading, Text } from '@the_viveksingh/vivek-ui'
import {
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  ProgressRing,
  Sparkline,
} from '@the_viveksingh/vivek-ui/charts'

/**
 * Live chart previews, one per documented example.
 *
 * All of these render on the server: the charts produce a complete SVG from a `viewBox`
 * with no measurement, which is what keeps them out of the client bundle unless a hover
 * tooltip is switched on.
 */
const MONTHS = [
  { x: 'Jan', y: 1200 },
  { x: 'Feb', y: 2600 },
  { x: 'Mar', y: 2450 },
  { x: 'Apr', y: 3800 },
  { x: 'May', y: 3200 },
  { x: 'Jun', y: 4600 },
]

// Each series carries its own data array — that is the real shape of `ChartSeries`.
const REVENUE_VS_COSTS = [
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
]

const WEEK = [
  { x: 'Mon', y: 320 },
  { x: 'Tue', y: 480 },
  { x: 'Wed', y: 410 },
  { x: 'Thu', y: 610 },
  { x: 'Fri', y: 540 },
]

const TRAFFIC = [
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
]

const BY_PLAN = [
  {
    name: 'Pro',
    data: [
      { x: 'Q1', y: 40 },
      { x: 'Q2', y: 62 },
      { x: 'Q3', y: 71 },
    ],
  },
  {
    name: 'Team',
    data: [
      { x: 'Q1', y: 12 },
      { x: 'Q2', y: 18 },
      { x: 'Q3', y: 24 },
    ],
  },
]

const SOURCES = [
  { x: 'Organic search', y: 4200 },
  { x: 'Direct traffic', y: 3100 },
  { x: 'Social referral', y: 1800 },
  { x: 'Paid campaigns', y: 900 },
]

const SLICES = [
  { label: 'Direct', value: 42 },
  { label: 'Search', value: 31 },
  { label: 'Social', value: 17 },
  { label: 'Referral', value: 10 },
]

const PLANS = [
  { label: 'Free', value: 620 },
  { label: 'Pro', value: 240 },
  { label: 'Team', value: 90 },
]

const TREND = [12, 19, 14, 27, 24, 31, 38]

export function ChartPreview({ slug, variant = 'basic' }: { slug: string; variant?: string }) {
  const key = `${slug}:${variant}`

  switch (key) {
    // --- line ---
    case 'line-chart:basic':
      return <LineChart data={MONTHS} height={240} showGrid title="Revenue" />
    case 'line-chart:multi':
      return (
        <LineChart
          height={260}
          series={REVENUE_VS_COSTS}
          showGrid
          showLegend
          title="Revenue vs costs"
        />
      )
    case 'line-chart:mapped':
      return <LineChart curve="smooth" data={MONTHS} height={240} showGrid title="Revenue" />

    // --- area ---
    case 'area-chart:basic':
      return <AreaChart data={WEEK} height={240} showGrid title="Sessions this week" />
    case 'area-chart:stacked':
      return (
        <AreaChart height={260} series={TRAFFIC} showLegend stacked title="Traffic by channel" />
      )

    // --- bar ---
    case 'bar-chart:basic':
      return <BarChart data={MONTHS} height={240} showValues title="Revenue by month" />
    case 'bar-chart:grouped':
      return (
        <BarChart
          height={260}
          mode="grouped"
          series={BY_PLAN}
          showLegend
          title="New customers by plan"
        />
      )
    case 'bar-chart:horizontal':
      return (
        <BarChart data={SOURCES} height={260} horizontal showValues title="Sessions by source" />
      )

    // --- pie ---
    case 'pie-chart:basic':
      return (
        <PieChart
          centerLabel="100%"
          centerSublabel="of traffic"
          data={SLICES}
          donut
          showLabels
          title="Traffic by source"
        />
      )
    case 'pie-chart:pie':
      return <PieChart data={PLANS} showLabels title="Customers by plan" />

    // --- ring ---
    case 'progress-ring:basic':
      return <ProgressRing label="Storage used" showValue value={68} />
    case 'progress-ring:custom':
      return (
        <ProgressRing label="Onboarding" max={10} size={140} thickness={12} value={7}>
          <strong>7/10</strong>
          <span>steps done</span>
        </ProgressRing>
      )

    // --- sparkline ---
    case 'sparkline:basic':
      return <Sparkline data={TREND} title="Signups trend" />
    case 'sparkline:tile':
      return (
        <Card padding="lg" style={{ maxWidth: '16rem' }}>
          <Card.Body>
            <Text size="sm" tone="muted">
              Signups
            </Text>
            <Heading level={3} size="2xl">
              1,284
            </Heading>
            <Sparkline data={TREND} fill showLastPoint title="Signups over 7 days" />
          </Card.Body>
        </Card>
      )

    default:
      return null
  }
}
