import { fireEvent, render, screen, within } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { AreaChart } from './area-chart'
import { BarChart } from './bar-chart'
import { markerPath, seriesColor, seriesDash } from './internal/palette'
import {
  arcPath,
  areaPath,
  bandScale,
  extent,
  formatNumber,
  linePath,
  makeScale,
  num,
  padDomain,
  ticks,
} from './internal/scale'
import { LineChart } from './line-chart'
import { PieChart } from './pie-chart'
import { ProgressRing } from './progress-ring'
import { Sparkline } from './sparkline'

/**
 * The invariant that matters most: a chart may render nothing, but it may never render
 * garbage. One `NaN` in a `d` attribute silently blanks an entire series in the browser,
 * so every edge-case test below funnels through this.
 */
function expectCleanNumbers(container: HTMLElement) {
  for (const node of Array.from(container.querySelectorAll('*'))) {
    for (const attr of Array.from(node.attributes)) {
      expect(
        /NaN|Infinity/.test(attr.value),
        `${node.nodeName}[${attr.name}] = "${attr.value}"`,
      ).toBe(false)
    }
  }
}

const SERIES = [
  {
    name: 'Alpha',
    data: [
      { x: 'Jan', y: 3 },
      { x: 'Feb', y: 8 },
      { x: 'Mar', y: 5 },
    ],
  },
  {
    name: 'Beta',
    data: [
      { x: 'Jan', y: 6 },
      { x: 'Feb', y: 2 },
      { x: 'Mar', y: 9 },
    ],
  },
]

// --------------------------------------------------------------------------- maths

describe('scale maths', () => {
  it('never lets a domain have a zero span', () => {
    expect(padDomain(null)).toEqual([0, 1])
    expect(padDomain([5, 5])).toEqual([2.5, 7.5])
    expect(padDomain([0, 0])).toEqual([0, 1])
    expect(padDomain([9, 2])).toEqual([2, 9])
    expect(padDomain([Number.NaN, 4])).toEqual([0, 1])
  })

  it('extent ignores non-finite values and reports null for nothing usable', () => {
    expect(extent([3, Number.NaN, -1, Number.POSITIVE_INFINITY])).toEqual([-1, 3])
    expect(extent([])).toBeNull()
    expect(extent([Number.NaN])).toBeNull()
  })

  it('maps a zero-span domain to the middle of the range instead of dividing by zero', () => {
    const scale = makeScale([7, 7], [0, 100])
    expect(scale(7)).toBe(50)
    expect(scale(999)).toBe(50)
    expect(Number.isFinite(scale(Number.NaN))).toBe(true)
  })

  it('maps a normal domain linearly, inverted ranges included', () => {
    const scale = makeScale([0, 10], [100, 0])
    expect(scale(0)).toBe(100)
    expect(scale(10)).toBe(0)
    expect(scale(5)).toBe(50)
  })

  it('handles a negative domain that crosses zero', () => {
    const scale = makeScale([-10, 10], [200, 0])
    expect(scale(0)).toBe(100)
    expect(scale(-10)).toBe(200)
  })

  it('produces finite ticks for degenerate and normal ranges alike', () => {
    expect(ticks(0, 10, 5)).toEqual([0, 2, 4, 6, 8, 10])
    expect(ticks(4, 4)).toEqual([4])
    expect(ticks(0, 0)).toEqual([0])
    expect(ticks(Number.NaN, 5)).toEqual([])
    for (const t of ticks(-0.0001, 0.0001, 5)) expect(Number.isFinite(t)).toBe(true)
    expect(ticks(0, 1e-12, 5).every((t) => Number.isFinite(t))).toBe(true)
  })

  it('keeps band geometry finite when there are no categories', () => {
    const empty = bandScale(0, [0, 100])
    expect(Number.isFinite(empty.step)).toBe(true)
    expect(Number.isFinite(empty.at(0))).toBe(true)
    const band = bandScale(4, [0, 100], 0)
    expect(band.step).toBe(25)
    expect(band.width).toBe(25)
    expect(band.at(2)).toBe(50)
  })

  it('num() collapses non-finite input rather than propagating it', () => {
    expect(num(Number.NaN)).toBe(0)
    expect(num(Number.POSITIVE_INFINITY)).toBe(0)
    expect(num(1.23456)).toBe(1.23)
    expect(num(-0)).toBe(0)
  })

  it('refuses to build a path from fewer than two points', () => {
    expect(linePath([])).toBe('')
    expect(linePath([[1, 2]])).toBe('')
    expect(
      linePath([
        [0, 0],
        [10, 10],
      ]),
    ).toBe('M0 0L10 10')
    expect(
      linePath([
        [0, 0],
        [Number.NaN, 5],
      ]),
    ).toBe('')
    expect(areaPath([], [[0, 0]])).toBe('')
  })

  it('closes an area path and keeps every coordinate finite', () => {
    const d = areaPath(
      [
        [0, 10],
        [10, 4],
        [20, 8],
      ],
      [
        [20, 30],
        [0, 30],
      ],
    )
    expect(d.startsWith('M')).toBe(true)
    expect(d.endsWith('Z')).toBe(true)
    expect(d).not.toMatch(/NaN/)
  })

  it('smooths with cubic segments clamped into the plot band', () => {
    const d = linePath(
      [
        [0, 10],
        [10, 0],
        [20, 10],
        [30, 0],
      ],
      true,
      [0, 10],
    )
    expect(d).toContain('C')
    for (const n of d.match(/-?\d+(\.\d+)?/g) ?? []) expect(Number.isFinite(Number(n))).toBe(true)
  })

  it('splits a full turn into two arcs, since one arc cannot express 360 degrees', () => {
    const full = arcPath(50, 50, 40, 0, 0, Math.PI * 2)
    expect((full.match(/A/g) ?? []).length).toBe(2)
    const donut = arcPath(50, 50, 40, 20, 0, Math.PI * 2)
    expect((donut.match(/A/g) ?? []).length).toBe(4)
    expect(arcPath(50, 50, 40, 0, 0, 0)).toBe('')
    expect(arcPath(50, 50, 0, 0, 0, 1)).toBe('')
    expect(arcPath(Number.NaN, 50, 40, 0, 0, 1)).toBe('')
  })

  it('clamps a donut hole to the outer radius instead of inverting the ring', () => {
    expect(arcPath(50, 50, 40, 999, 0, 1)).not.toMatch(/NaN/)
  })

  it('formats numbers without a locale, so server and client agree', () => {
    expect(formatNumber(1234)).toBe('1234')
    expect(formatNumber(15000)).toBe('15k')
    expect(formatNumber(2_500_000)).toBe('2.5M')
    expect(formatNumber(Number.NaN)).toBe('')
  })

  it('gives every series a colour token, a dash and a marker path', () => {
    expect(seriesColor(0)).toBe('var(--vk-chart-1)')
    expect(seriesColor(7)).toBe('var(--vk-chart-2)')
    expect(seriesColor(0, '#abc')).toBe('#abc')
    expect(seriesDash(0)).toBeUndefined()
    expect(seriesDash(1)).toBe('6 4')
    for (const shape of ['circle', 'square', 'triangle', 'diamond', 'plus', 'cross'] as const) {
      const d = markerPath(shape, 10, 10, 3)
      expect(d).not.toBe('')
      expect(d).not.toMatch(/NaN/)
    }
    expect(markerPath('circle', 10, 10, 0)).toBe('')
    expect(markerPath('circle', Number.NaN, 10, 3)).toBe('')
  })
})

// ----------------------------------------------------------------------- Sparkline

describe('Sparkline', () => {
  it('renders a line and an accessible summary', () => {
    const { container } = render(<Sparkline data={[1, 4, 2, 8]} />)
    const svg = within(container).getByRole('img')
    expect(svg.getAttribute('aria-label')).toContain('4 values')
    expect(container.querySelector('.vk-sparkline__line')).not.toBeNull()
    expectCleanNumbers(container)
  })

  it('renders nothing but stays alive on an empty array', () => {
    const { container } = render(<Sparkline data={[]} />)
    expect(container.querySelector('.vk-sparkline__line')).toBeNull()
    expect(within(container).getByRole('img').getAttribute('aria-label')).toContain('no data')
    expectCleanNumbers(container)
  })

  it('renders a single point as a dot, with no division by zero', () => {
    const { container } = render(<Sparkline data={[42]} />)
    expect(container.querySelector('.vk-sparkline__line')).toBeNull()
    const dot = container.querySelector('.vk-sparkline__point')
    expect(dot).not.toBeNull()
    expect(Number(dot?.getAttribute('cy'))).toBeGreaterThan(0)
    expectCleanNumbers(container)
  })

  it('centres a flat series instead of producing NaN', () => {
    const { container } = render(<Sparkline data={[5, 5, 5, 5]} height={40} />)
    const d = container.querySelector('.vk-sparkline__line')?.getAttribute('d') ?? ''
    expect(d).not.toMatch(/NaN/)
    const ys = [...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => Number(m[2]))
    expect(new Set(ys).size).toBe(1)
    expect(ys[0]).toBeCloseTo(20, 1)
  })

  it('drops NaN and Infinity before drawing', () => {
    const { container } = render(
      <Sparkline
        data={[1, Number.NaN, 3, Number.POSITIVE_INFINITY, 5]}
        showLastPoint
        accessibleTable
      />,
    )
    expectCleanNumbers(container)
    // Three usable values -> three table rows.
    expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
  })

  it('handles values either side of zero', () => {
    const { container } = render(<Sparkline data={[-5, 0, 5]} fill />)
    expectCleanNumbers(container)
    expect(container.querySelector('.vk-sparkline__area')).not.toBeNull()
  })

  it('exposes a data table by default and drops it on request', () => {
    const { container } = render(<Sparkline data={[1, 2]} title="Signups" />)
    expect(within(container).getByRole('table')).toBeInTheDocument()
    const bare = render(<Sparkline data={[1, 2]} accessibleTable={false} />)
    expect(within(bare.container).queryByRole('table')).toBeNull()
    // No table means no flow content, so the root can stay an inline element.
    expect(bare.container.firstElementChild?.tagName).toBe('SPAN')
  })

  it('passes stroke and fill through as custom properties, so CSS cannot beat them', () => {
    const { container } = render(<Sparkline data={[1, 2]} stroke="#ff0000" fill="#00ff00" />)
    const root = container.firstElementChild as HTMLElement
    expect(root.style.getPropertyValue('--vk-sparkline-stroke')).toBe('#ff0000')
    expect(root.style.getPropertyValue('--vk-sparkline-area')).toBe('#00ff00')
  })

  it('renders title and description into the SVG', () => {
    const { container } = render(
      <Sparkline data={[1, 2]} title="Traffic" description="Sessions per day" />,
    )
    expect(container.querySelector('title')?.textContent).toBe('Traffic')
    expect(container.querySelector('desc')?.textContent).toBe('Sessions per day')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Sparkline data={[3, 1, 4, 1, 5]} title="Pi digits" showLastPoint />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ----------------------------------------------------------------------- LineChart

describe('LineChart', () => {
  it('draws one path per series with distinct dash patterns', () => {
    const { container } = render(<LineChart series={SERIES} title="Two series" />)
    const lines = container.querySelectorAll('.vk-chart__line')
    expect(lines).toHaveLength(2)
    expect(lines[0]?.getAttribute('stroke-dasharray')).toBeNull()
    expect(lines[1]?.getAttribute('stroke-dasharray')).toBe('6 4')
    expectCleanNumbers(container)
  })

  it('gives each series a different marker shape, so colour is never the only cue', () => {
    const { container } = render(<LineChart series={SERIES} />)
    const groups = container.querySelectorAll('.vk-chart__series')
    const first = groups[0]?.querySelector('.vk-chart__marker')?.getAttribute('d') ?? ''
    const second = groups[1]?.querySelector('.vk-chart__marker')?.getAttribute('d') ?? ''
    expect(first).not.toBe('')
    expect(first).not.toBe(second)
  })

  it('labels a categorical axis with the category names', () => {
    const { container } = render(
      <LineChart
        data={[
          { x: 'Mon', y: 1 },
          { x: 'Tue', y: 4 },
        ]}
      />,
    )
    const labels = Array.from(container.querySelectorAll('.vk-chart__tick')).map(
      (n) => n.textContent,
    )
    expect(labels).toContain('Mon')
    expect(labels).toContain('Tue')
  })

  it('spaces a numeric x axis by value, not by index', () => {
    const { container } = render(
      <LineChart
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 100, y: 3 },
        ]}
        showPoints
      />,
    )
    const xs = Array.from(container.querySelectorAll('.vk-chart__marker')).map((n) =>
      Number((n.getAttribute('d') ?? '').match(/-?[\d.]+/)?.[0]),
    )
    const [a, b, c] = xs as [number, number, number]
    expect(b - a).toBeLessThan(c - b)
    expectCleanNumbers(container)
  })

  it('renders an empty state for an empty array, without throwing', () => {
    const { container } = render(<LineChart data={[]} />)
    expect(container.querySelector('.vk-chart__empty')?.textContent).toBe('No data')
    expect(container.querySelectorAll('.vk-chart__line')).toHaveLength(0)
    expect(within(container).queryByRole('table')).toBeNull()
    expectCleanNumbers(container)
  })

  it('survives a single data point', () => {
    const { container } = render(<LineChart data={[{ x: 'only', y: 12 }]} />)
    expect(container.querySelectorAll('.vk-chart__line')).toHaveLength(0)
    expect(container.querySelectorAll('.vk-chart__marker')).toHaveLength(1)
    expect(container.querySelectorAll('tbody tr')).toHaveLength(1)
    expectCleanNumbers(container)
  })

  it('centres a zero-range series and keeps the ticks finite', () => {
    const { container } = render(<LineChart data={[7, 7, 7]} height={200} />)
    const d = container.querySelector('.vk-chart__line')?.getAttribute('d') ?? ''
    expect(d).not.toMatch(/NaN/)
    expectCleanNumbers(container)
    for (const tick of Array.from(container.querySelectorAll('.vk-chart__tick'))) {
      expect(tick.textContent).not.toContain('NaN')
    }
  })

  it('draws a zero baseline when the data crosses zero', () => {
    const { container } = render(<LineChart data={[-8, 4, -2, 9]} />)
    expect(container.querySelector('.vk-chart__zero')).not.toBeNull()
    expectCleanNumbers(container)
  })

  it('filters non-finite values out of the series and the table', () => {
    const { container } = render(
      <LineChart
        data={[
          { x: 'a', y: 1 },
          { x: 'b', y: Number.NaN },
          { x: 'c', y: Number.NEGATIVE_INFINITY },
          { x: 'd', y: 4 },
        ]}
      />,
    )
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2)
    expectCleanNumbers(container)
  })

  it('switches to cubic segments for the smooth curve', () => {
    const { container } = render(<LineChart data={[1, 5, 2, 8]} curve="smooth" />)
    expect(container.querySelector('.vk-chart__line')?.getAttribute('d')).toContain('C')
    expect(container.firstElementChild).toHaveAttribute('data-curve', 'smooth')
  })

  it('can drop the grid and the axes', () => {
    const { container } = render(<LineChart data={[1, 2, 3]} showGrid={false} showAxes={false} />)
    expect(container.querySelectorAll('.vk-chart__grid-line')).toHaveLength(0)
    expect(container.querySelectorAll('.vk-chart__axis')).toHaveLength(0)
  })

  it('builds a data table with one column per series', () => {
    const { container } = render(<LineChart series={SERIES} title="Traffic" />)
    const table = within(container).getByRole('table')
    expect(within(table).getByText('Traffic')).toBeInTheDocument()
    const headers = within(table)
      .getAllByRole('columnheader')
      .map((n) => n.textContent)
    expect(headers).toEqual(['Category', 'Alpha', 'Beta'])
    expect(within(table).getAllByRole('row')).toHaveLength(4)
  })

  it('marks a gap in one series as an em dash rather than a zero', () => {
    const { container } = render(
      <LineChart
        series={[
          {
            name: 'A',
            data: [
              { x: 'p', y: 1 },
              { x: 'q', y: 2 },
            ],
          },
          { name: 'B', data: [{ x: 'p', y: 3 }] },
        ]}
      />,
    )
    const cells = Array.from(container.querySelectorAll('tbody td')).map((n) => n.textContent)
    expect(cells).toContain('—')
  })

  it('prefers an explicit aria-label over the generated one', () => {
    const { container } = render(<LineChart data={[1, 2]} aria-label="Revenue by month" />)
    expect(within(container).getByRole('img')).toHaveAttribute('aria-label', 'Revenue by month')
  })

  it('shows a tooltip on hover, and only then loads the hover layer', () => {
    const plain = render(<LineChart series={SERIES} />)
    expect(plain.container.querySelectorAll('.vk-chart__hit')).toHaveLength(0)

    const { container } = render(<LineChart series={SERIES} tooltip />)
    const hits = container.querySelectorAll('.vk-chart__hit')
    expect(hits).toHaveLength(3)
    const first = hits[0]
    if (!first) throw new Error('expected a hit area')
    fireEvent.mouseMove(first)
    const tooltip = container.querySelector('.vk-chart__tooltip')
    expect(tooltip).not.toBeNull()
    expect(tooltip?.textContent).toContain('Jan')
    expect(tooltip?.textContent).toContain('Alpha: 3')
    expectCleanNumbers(container)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <LineChart series={SERIES} title="Weekly traffic" description="Sessions per week" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ----------------------------------------------------------------------- AreaChart

describe('AreaChart', () => {
  it('fills a closed region under the line', () => {
    const { container } = render(<AreaChart data={[3, 6, 4]} />)
    const d = container.querySelector('.vk-chart__area')?.getAttribute('d') ?? ''
    expect(d.endsWith('Z')).toBe(true)
    expectCleanNumbers(container)
  })

  it('stacks series without letting them overlap', () => {
    const { container } = render(<AreaChart series={SERIES} stacked />)
    expect(container.firstElementChild).toHaveAttribute('data-stacked', 'true')
    const areas = container.querySelectorAll('.vk-chart__area')
    expect(areas).toHaveLength(2)
    // The upper layer of a stack sits above the lower one at every category.
    const topOf = (el: Element | null) =>
      Math.min(
        ...[...(el?.getAttribute('d') ?? '').matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) =>
          Number(m[2]),
        ),
      )
    expect(topOf(areas[1] ?? null)).toBeLessThan(topOf(areas[0] ?? null))
    expectCleanNumbers(container)
  })

  it('stacks mixed signs in opposite directions from zero', () => {
    const { container } = render(
      <AreaChart
        series={[
          {
            name: 'up',
            data: [
              { x: 'a', y: 5 },
              { x: 'b', y: 3 },
            ],
          },
          {
            name: 'down',
            data: [
              { x: 'a', y: -4 },
              { x: 'b', y: -6 },
            ],
          },
        ]}
        stacked
      />,
    )
    expect(container.querySelector('.vk-chart__zero')).not.toBeNull()
    expectCleanNumbers(container)
  })

  it('anchors the value axis to zero so the fill cannot overstate itself', () => {
    const { container } = render(<AreaChart data={[100, 101, 102]} />)
    const labels = Array.from(container.querySelectorAll('.vk-chart__tick')).map(
      (n) => n.textContent,
    )
    expect(labels).toContain('0')
  })

  it('handles empty, single-point and flat data', () => {
    for (const data of [[], [5], [2, 2, 2]]) {
      const { container } = render(<AreaChart data={data} stacked />)
      expectCleanNumbers(container)
    }
  })

  it('has no axe violations', async () => {
    const { container } = render(<AreaChart series={SERIES} stacked title="Stacked areas" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ------------------------------------------------------------------------ BarChart

describe('BarChart', () => {
  it('draws one bar per series per category when grouped', () => {
    const { container } = render(<BarChart series={SERIES} />)
    expect(container.querySelectorAll('.vk-bar-chart__bar')).toHaveLength(6)
    expect(container.firstElementChild).toHaveAttribute('data-mode', 'grouped')
    expectCleanNumbers(container)
  })

  it('stacks bars into one column per category', () => {
    const { container } = render(<BarChart series={SERIES} mode="stacked" />)
    const bars = Array.from(container.querySelectorAll('.vk-bar-chart__bar'))
    expect(bars).toHaveLength(6)
    // Stacked bars share an x per category; grouped ones never do.
    const xs = new Set(bars.map((b) => b.getAttribute('x')))
    expect(xs.size).toBe(3)
    expectCleanNumbers(container)
  })

  it('flips the axes when horizontal', () => {
    const { container } = render(<BarChart data={[{ x: 'a', y: 4 }]} horizontal />)
    expect(container.firstElementChild).toHaveAttribute('data-orientation', 'horizontal')
    const bar = container.querySelector('.vk-bar-chart__bar')
    expect(Number(bar?.getAttribute('width'))).toBeGreaterThan(0)
    expect(Number(bar?.getAttribute('height'))).toBeGreaterThan(0)
    // Category labels move to the left gutter, values to the bottom.
    const labels = Array.from(container.querySelectorAll('.vk-chart__tick')).map(
      (n) => n.textContent,
    )
    expect(labels).toContain('a')
    expectCleanNumbers(container)
  })

  it('grows negative bars from the zero line, on both orientations', () => {
    for (const horizontal of [false, true]) {
      const { container } = render(
        <BarChart
          data={[
            { x: 'down', y: -6 },
            { x: 'up', y: 6 },
          ]}
          horizontal={horizontal}
        />,
      )
      const zero = container.querySelector('.vk-chart__zero')
      expect(zero).not.toBeNull()
      const bars = Array.from(container.querySelectorAll('.vk-bar-chart__bar'))
      expect(bars).toHaveLength(2)
      for (const bar of bars) {
        expect(Number(bar.getAttribute('width'))).toBeGreaterThan(0)
        expect(Number(bar.getAttribute('height'))).toBeGreaterThan(0)
      }
      expectCleanNumbers(container)
    }
  })

  it('skips zero-valued bars instead of drawing a zero-height rect', () => {
    const { container } = render(
      <BarChart
        data={[
          { x: 'a', y: 0 },
          { x: 'b', y: 5 },
        ]}
      />,
    )
    expect(container.querySelectorAll('.vk-bar-chart__bar')).toHaveLength(1)
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2)
  })

  it('renders empty, single-bar and flat data cleanly', () => {
    const empty = render(<BarChart data={[]} />)
    expect(empty.container.querySelector('.vk-chart__empty')).not.toBeNull()
    expectCleanNumbers(empty.container)

    const single = render(<BarChart data={[9]} />)
    expect(single.container.querySelectorAll('.vk-bar-chart__bar')).toHaveLength(1)
    expectCleanNumbers(single.container)

    const flat = render(<BarChart data={[4, 4, 4]} mode="stacked" />)
    expectCleanNumbers(flat.container)

    const zeros = render(<BarChart data={[0, 0]} />)
    expectCleanNumbers(zeros.container)
  })

  it('prints values on request', () => {
    const { container } = render(<BarChart data={[{ x: 'a', y: 12 }]} showValues />)
    expect(container.querySelector('.vk-chart__value')?.textContent).toBe('12')
  })

  it('formats every label through formatValue', () => {
    const { container } = render(
      <BarChart data={[{ x: 'a', y: 12 }]} showValues formatValue={(v) => `${v} kg`} />,
    )
    expect(container.querySelector('.vk-chart__value')?.textContent).toBe('12 kg')
    expect(container.querySelector('tbody td')?.textContent).toBe('12 kg')
  })

  it('has no axe violations, grouped or stacked or horizontal', async () => {
    for (const props of [{}, { mode: 'stacked' as const }, { horizontal: true }]) {
      const { container } = render(<BarChart series={SERIES} title="Sales" {...props} />)
      expect(await axe(container)).toHaveNoViolations()
    }
  })
})

// ------------------------------------------------------------------------ PieChart

const PIE = [
  { label: 'Direct', value: 40 },
  { label: 'Search', value: 35 },
  { label: 'Social', value: 25 },
]

describe('PieChart', () => {
  it('draws one wedge per slice', () => {
    const { container } = render(<PieChart data={PIE} />)
    expect(container.querySelectorAll('.vk-pie-chart__slice')).toHaveLength(3)
    expectCleanNumbers(container)
  })

  it('punches a hole for a donut and honours the inner radius', () => {
    const pie = render(<PieChart data={PIE} />)
    const donut = render(<PieChart data={PIE} donut innerRadius={0.75} />)
    const arcs = (el: Element | null) => ((el?.getAttribute('d') ?? '').match(/A/g) ?? []).length
    expect(arcs(pie.container.querySelector('.vk-pie-chart__slice'))).toBe(1)
    expect(arcs(donut.container.querySelector('.vk-pie-chart__slice'))).toBe(2)
    expect(donut.container.firstElementChild).toHaveAttribute('data-donut', 'true')
    expectCleanNumbers(donut.container)
  })

  it('draws a single 100% slice as a full circle rather than a degenerate arc', () => {
    const { container } = render(<PieChart data={[{ label: 'All', value: 5 }]} />)
    const d = container.querySelector('.vk-pie-chart__slice')?.getAttribute('d') ?? ''
    expect((d.match(/A/g) ?? []).length).toBe(2)
    expect(d).not.toMatch(/NaN/)
  })

  it('renders an empty state for no data, all zeros, or only negatives', () => {
    for (const data of [
      [],
      [{ label: 'a', value: 0 }],
      [{ label: 'a', value: -5 }],
      [{ label: 'a', value: Number.NaN }],
    ]) {
      const { container } = render(<PieChart data={data} donut />)
      expect(container.querySelector('.vk-chart__empty')?.textContent).toBe('No data')
      expect(container.querySelectorAll('.vk-pie-chart__slice')).toHaveLength(0)
      expectCleanNumbers(container)
    }
  })

  it('normalises shares and reports them in the table', () => {
    const { container } = render(<PieChart data={PIE} title="Traffic" showLabels />)
    const labels = Array.from(container.querySelectorAll('.vk-pie-chart__label')).map(
      (n) => n.textContent,
    )
    expect(labels).toEqual(['40%', '35%', '25%'])
    const table = within(container).getByRole('table')
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((n) => n.textContent),
    ).toEqual(['Category', 'Value', 'Share'])
    expect(within(table).getByText('40%')).toBeInTheDocument()
  })

  it('keeps a hair-thin slice drawable', () => {
    const { container } = render(
      <PieChart
        data={[
          { label: 'big', value: 1000 },
          { label: 'tiny', value: 0.001 },
        ]}
      />,
    )
    const slices = container.querySelectorAll('.vk-pie-chart__slice')
    expect(slices).toHaveLength(2)
    expectCleanNumbers(container)
  })

  it('shows centre text on a donut', () => {
    const { container } = render(
      <PieChart data={PIE} donut centerLabel="100" centerSublabel="visits" />,
    )
    expect(container.querySelector('.vk-pie-chart__center')?.textContent).toBe('100')
    expect(container.querySelector('.vk-pie-chart__center-sub')?.textContent).toBe('visits')
  })

  it('has no axe violations', async () => {
    const { container } = render(<PieChart data={PIE} donut title="Traffic sources" showLabels />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// --------------------------------------------------------------------- ProgressRing

describe('ProgressRing', () => {
  it('reports itself as a progressbar', () => {
    render(<ProgressRing value={40} label="Storage" />)
    const el = screen.getByRole('progressbar', { name: 'Storage' })
    expect(el).toHaveAttribute('aria-valuenow', '40')
    expect(el).toHaveAttribute('aria-valuemax', '100')
  })

  it('clamps out-of-range values', () => {
    const over = render(<ProgressRing value={500} label="a" />)
    expect(within(over.container).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    const under = render(<ProgressRing value={-20} label="b" />)
    expect(within(under.container).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('survives a non-finite value and a nonsensical max', () => {
    const nan = render(<ProgressRing value={Number.NaN} label="a" showValue />)
    expect(nan.container.querySelector('.vk-progress-ring__center')?.textContent).toBe('0%')
    expectCleanNumbers(nan.container)

    const zeroMax = render(<ProgressRing value={50} max={0} label="b" showValue />)
    expect(within(zeroMax.container).getByRole('progressbar')).toHaveAttribute(
      'aria-valuemax',
      '100',
    )
    expectCleanNumbers(zeroMax.container)
  })

  it('empties the dash gap at 100% and fills it at 0%', () => {
    const full = render(<ProgressRing value={100} label="a" />)
    expect(full.container.querySelector('.vk-progress-ring__arc')).toHaveAttribute(
      'stroke-dashoffset',
      '0',
    )
    const none = render(<ProgressRing value={0} label="b" />)
    const arc = none.container.querySelector('.vk-progress-ring__arc')
    expect(Number(arc?.getAttribute('stroke-dashoffset'))).toBeCloseTo(
      Number(arc?.getAttribute('stroke-dasharray')),
      3,
    )
  })

  it('never lets the stroke swallow the radius', () => {
    const { container } = render(
      <ProgressRing value={50} diameter={40} thickness={400} label="a" />,
    )
    const arc = container.querySelector('.vk-progress-ring__arc')
    expect(Number(arc?.getAttribute('r'))).toBeGreaterThan(0)
    expectCleanNumbers(container)
  })

  it('shows a percentage, a custom format, or arbitrary children', () => {
    const pct = render(<ProgressRing value={33.333} label="a" showValue />)
    expect(pct.container.querySelector('.vk-progress-ring__center')?.textContent).toBe('33%')

    const custom = render(
      <ProgressRing value={0.5} max={1} label="b" showValue formatValue={(p) => `${p} pc`} />,
    )
    expect(custom.container.querySelector('.vk-progress-ring__center')?.textContent).toBe('50 pc')

    const kids = render(
      <ProgressRing value={10} label="c" showValue>
        <strong>7</strong>
      </ProgressRing>,
    )
    expect(kids.container.querySelector('.vk-progress-ring__center')?.textContent).toBe('7')
  })

  it('passes colours through as custom properties, so CSS cannot beat them', () => {
    const { container } = render(
      <ProgressRing value={10} label="a" color="#123456" trackColor="#654321" />,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.style.getPropertyValue('--vk-progress-ring-color')).toBe('#123456')
    expect(root.style.getPropertyValue('--vk-progress-ring-track')).toBe('#654321')
  })

  it('has no axe violations', async () => {
    const { container } = render(<ProgressRing value={72} label="Upload progress" showValue />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ------------------------------------------------------------- server-render safety

describe('server safety', () => {
  it('renders every chart to static markup with no DOM and no NaN', () => {
    const markup = [
      renderToStaticMarkup(<Sparkline data={[1, 2, 3]} />),
      renderToStaticMarkup(<LineChart series={SERIES} title="L" />),
      renderToStaticMarkup(<AreaChart series={SERIES} stacked title="A" />),
      renderToStaticMarkup(<BarChart series={SERIES} mode="stacked" title="B" />),
      renderToStaticMarkup(<PieChart data={PIE} donut title="P" showLabels />),
      renderToStaticMarkup(<ProgressRing value={50} label="R" showValue />),
    ]
    for (const html of markup) {
      expect(html).toContain('<svg')
      expect(html).not.toMatch(/NaN|Infinity/)
    }
  })

  // The complementary guarantee - that only internal/hover-layer.tsx carries a
  // 'use client' directive, and that the directive survives the build - is enforced
  // repo-wide by scripts/check-directives.mjs during `pnpm build`.
})
