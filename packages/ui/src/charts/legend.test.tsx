/**
 * The interactive legend.
 *
 * Worth testing carefully because the mechanism is unusual: the toggle is a real checkbox
 * and a `:has()` selector, with no state and no client boundary. jsdom does not apply the
 * stylesheet, so what is asserted here is the contract the CSS depends on — the checkbox
 * exists, it is checked by default, it is labelled, and every series carries the palette
 * slot the six rules in `charts.css` target. If any of those drift the toggle silently
 * stops working, with nothing else to catch it.
 */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AreaChart } from './area-chart'
import { BarChart } from './bar-chart'
import { LineChart } from './line-chart'
import { PieChart } from './pie-chart'

const SERIES = [
  {
    name: 'Revenue',
    data: [
      { x: 'Jan', y: 10 },
      { x: 'Feb', y: 20 },
    ],
  },
  {
    name: 'Costs',
    data: [
      { x: 'Jan', y: 6 },
      { x: 'Feb', y: 9 },
    ],
  },
]

describe.each([
  ['LineChart', LineChart],
  ['AreaChart', AreaChart],
  ['BarChart', BarChart],
] as const)('%s interactive legend', (_name, Chart) => {
  it('renders a checked checkbox per series when enabled', () => {
    const { container } = render(<Chart series={SERIES} interactiveLegend title="Revenue" />)
    const toggles = container.querySelectorAll<HTMLInputElement>('.vk-chart__legend-toggle')
    expect(toggles).toHaveLength(SERIES.length)
    for (const toggle of toggles) {
      expect(toggle.type).toBe('checkbox')
      // Default-checked, so a chart renders with everything visible.
      expect(toggle.checked).toBe(true)
    }
  })

  it('gives each toggle a palette slot that a series element also carries', () => {
    const { container } = render(<Chart series={SERIES} interactiveLegend title="Revenue" />)
    const slots = [...container.querySelectorAll('.vk-chart__legend-toggle')].map((el) =>
      el.getAttribute('data-series'),
    )
    expect(slots).toEqual(['1', '2'])

    // The other half of the selector. Without a matching data-series-index the `:has()`
    // rule matches nothing and the checkbox becomes decorative.
    for (const slot of slots) {
      expect(
        container.querySelector(`[data-series-index="${slot}"]`),
        `no element carries data-series-index="${slot}"`,
      ).not.toBeNull()
    }
  })

  it('names each toggle from its series, via the wrapping label', () => {
    const { container } = render(<Chart series={SERIES} interactiveLegend title="Revenue" />)
    const controls = container.querySelectorAll('.vk-chart__legend-control')
    expect(controls).toHaveLength(2)
    for (const [i, control] of controls.entries()) {
      // Implicit association: the input is inside the label, so no id is generated and two
      // charts on one page cannot collide.
      expect(control.tagName).toBe('LABEL')
      expect(control.querySelector('input')).not.toBeNull()
      expect(control.textContent).toContain(SERIES[i]?.name)
    }
  })

  it('drops aria-hidden from the legend once it holds controls', () => {
    // The legend is aria-hidden when a data table already names every series. That
    // optimisation must not survive here: hiding a focusable control from assistive tech is
    // worse than the duplication it avoids.
    const { container } = render(<Chart series={SERIES} interactiveLegend title="Revenue" />)
    const legend = container.querySelector('.vk-chart__legend')
    expect(legend?.getAttribute('aria-hidden')).toBeNull()
    expect(legend?.hasAttribute('data-interactive')).toBe(true)
  })

  it('renders no checkbox and keeps aria-hidden when not enabled', () => {
    const { container } = render(<Chart series={SERIES} showLegend title="Revenue" />)
    expect(container.querySelector('.vk-chart__legend-toggle')).toBeNull()
    expect(container.querySelector('.vk-chart__legend')?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('PieChart', () => {
  it('has no interactive legend, deliberately', () => {
    // Hiding one wedge would leave a gap while the others kept their angles, so the chart
    // would stop summing to the whole. The prop is absent rather than ignored.
    const { container } = render(
      <PieChart
        data={[
          { label: 'A', value: 1 },
          { label: 'B', value: 2 },
        ]}
        title="Share"
      />,
    )
    expect(container.querySelector('.vk-chart__legend-toggle')).toBeNull()
  })
})
