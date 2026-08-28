/**
 * ScatterChart, RadarChart, Gauge, Heatmap.
 *
 * The house chart rules apply to all four, so they are tested together the way
 * charts.test.tsx tests the first six: pure SVG or HTML with no runtime dependency,
 * renderable on the server, an accessible name always, the real numbers in a table for
 * assistive tech, and never colour as the only channel.
 */
import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Gauge } from './gauge'
import { Heatmap } from './heatmap'
import { RadarChart } from './radar-chart'
import { ScatterChart, type ScatterDatum } from './scatter-chart'

const XY: ScatterDatum[] = [
  { x: 10, y: 20 },
  { x: 20, y: 40 },
  { x: 30, y: 25 },
  { x: 40, y: 60 },
]

describe('ScatterChart', () => {
  it('renders one mark per point, positioned by both values', () => {
    const { container } = render(<ScatterChart data={XY} title="Spend vs revenue" />)
    expect(container.querySelectorAll('.vk-scatter-chart__mark')).toHaveLength(4)
  })

  it('names itself for a screen reader and ships the numbers as a table', () => {
    render(<ScatterChart data={XY} title="Spend vs revenue" xLabel="Spend" yLabel="Revenue" />)
    expect(screen.getByRole('img', { name: 'Spend vs revenue' })).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('Spend')
    expect(table).toHaveTextContent('60')
  })

  it('becomes a bubble chart when any point carries r — scaled by area, not radius', () => {
    // Area-proportional: a value 4x as large draws a mark 2x the radius. Radius-
    // proportional scaling (the Chart.js default) would quadruple the ink instead.
    // Circles forced so the radius can be read straight out of the arc command.
    const { container } = render(
      <ScatterChart
        maxBubbleSize={20}
        series={[
          {
            marker: 'circle',
            data: [
              { x: 1, y: 1, r: 25 },
              { x: 2, y: 2, r: 100 },
            ],
          },
        ]}
        title="Bubbles"
      />,
    )
    const radii = Array.from(container.querySelectorAll('.vk-scatter-chart__mark')).map((el) => {
      const match = /a(-?\d*\.?\d+)/.exec(el.getAttribute('d') ?? '')
      return Number(match?.[1])
    })
    expect(radii[1]).toBeCloseTo(20, 5) // sqrt(100/100) * 20
    expect(radii[0]).toBeCloseTo(10, 5) // sqrt(25/100) * 20 — area ratio 4, radius ratio 2
    // And the size column appears in the data table.
    expect(screen.getByRole('table')).toHaveTextContent('Size')
  })

  it('drops unplottable points instead of rendering NaN geometry', () => {
    const { container } = render(
      <ScatterChart
        data={
          [
            { x: 1, y: 2 },
            { x: Number.NaN, y: 3 },
            { x: 4, y: Number.NaN },
          ] as ScatterDatum[]
        }
        title="Dirty"
      />,
    )
    expect(container.querySelectorAll('.vk-scatter-chart__mark')).toHaveLength(1)
    expect(container.innerHTML).not.toContain('NaN')
  })

  it('renders on the server', () => {
    expect(() => renderToString(<ScatterChart data={XY} title="SSR" />)).not.toThrow()
  })

  it('says "no data" rather than drawing an empty frame silently', () => {
    const { container } = render(<ScatterChart data={[]} title="Empty" />)
    expect(container.textContent).toContain('No data')
    expect(container.querySelector('.vk-scatter-chart__mark')).toBeNull()
  })
})

describe('RadarChart', () => {
  const AXES = ['JS', 'React', 'Node', 'SQL', 'AWS']

  it('draws one polygon per series with a vertex per axis', () => {
    const { container } = render(
      <RadarChart axes={AXES} data={[90, 85, 80, 70, 65]} title="Skills" />,
    )
    expect(container.querySelectorAll('.vk-radar-chart__shape')).toHaveLength(1)
    expect(container.querySelectorAll('.vk-radar-chart__vertex')).toHaveLength(5)
    expect(container.querySelectorAll('.vk-radar-chart__spoke')).toHaveLength(5)
  })

  it('refuses fewer than three axes, with words instead of a degenerate shape', () => {
    // Two axes make a line, one makes a point — neither is a radar chart, and drawing
    // one anyway would present noise as data.
    const { container } = render(<RadarChart axes={['a', 'b']} data={[1, 2]} title="Thin" />)
    expect(container.textContent).toContain('at least 3 axes')
    expect(container.querySelector('.vk-radar-chart__shape')).toBeNull()
  })

  it('drops values beyond the axis count rather than wrapping them onto spokes', () => {
    const { container } = render(
      <RadarChart axes={['a', 'b', 'c']} data={[1, 2, 3, 99, 98]} title="Extra" />,
    )
    expect(container.querySelectorAll('.vk-radar-chart__vertex')).toHaveLength(3)
  })

  it('puts every figure in the table, axis by axis', () => {
    render(
      <RadarChart
        axes={AXES}
        series={[
          { name: 'Vivek', data: [90, 85, 80, 70, 65] },
          { name: 'Team', data: [70, 75, 85, 80, 60] },
        ]}
        title="Skills"
      />,
    )
    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('Vivek')
    expect(table).toHaveTextContent('AWS')
    expect(table).toHaveTextContent('65')
  })

  it('renders on the server', () => {
    expect(() =>
      renderToString(<RadarChart axes={AXES} data={[1, 2, 3, 4, 5]} title="SSR" />),
    ).not.toThrow()
  })
})

describe('Gauge', () => {
  it('announces the value, the range and the band it falls in', () => {
    render(
      <Gauge
        bands={[
          { to: 60, color: 'var(--vk-color-success)', label: 'healthy' },
          { to: 85, color: 'var(--vk-color-warning)', label: 'elevated' },
          { to: 100, color: 'var(--vk-color-danger)', label: 'critical' },
        ]}
        title="CPU"
        value={72}
      />,
    )
    expect(screen.getByRole('img', { name: 'CPU: 72 of 0 to 100, elevated' })).toBeInTheDocument()
  })

  it('draws one band arc per zone plus the needle', () => {
    const { container } = render(
      <Gauge
        bands={[
          { to: 50, color: 'green' },
          { to: 100, color: 'red' },
        ]}
        title="Load"
        value={30}
      />,
    )
    expect(container.querySelectorAll('.vk-gauge__band')).toHaveLength(2)
    expect(container.querySelector('.vk-gauge__needle')).toBeInTheDocument()
  })

  it('clamps an out-of-range value instead of swinging the needle past the track', () => {
    const { container } = render(<Gauge max={100} title="Over" value={250} />)
    const needle = container.querySelector('.vk-gauge__needle')
    // At 100% the needle points to the sweep's end; x2 must stay inside the viewBox.
    expect(Number(needle?.getAttribute('x2'))).toBeLessThanOrEqual(200)
    expect(container.innerHTML).not.toContain('NaN')
  })

  it('survives a zero-width range without dividing by zero', () => {
    const { container } = render(<Gauge min={5} max={5} title="Degenerate" value={5} />)
    expect(container.innerHTML).not.toContain('NaN')
  })

  it('renders on the server', () => {
    expect(() => renderToString(<Gauge title="SSR" value={40} />)).not.toThrow()
  })
})

describe('Heatmap', () => {
  const CELLS = [
    { x: 'Mon', y: 'API', value: 10 },
    { x: 'Tue', y: 'API', value: 40 },
    { x: 'Mon', y: 'Web', value: 25 },
  ]

  it('renders a grid with a cell per column x row, marking missing pairs as empty', () => {
    const { container } = render(<Heatmap data={CELLS} title="Errors" />)
    // 2 rows x 2 columns = 4 cells; Web/Tue has no datum.
    expect(container.querySelectorAll('.vk-heatmap__cell')).toHaveLength(4)
    expect(container.querySelectorAll('.vk-heatmap__cell[data-empty]')).toHaveLength(1)
  })

  it('scales intensity by lightness mix, never leaving a present value at 0%', () => {
    // "Smallest value = invisible" makes real data look missing; the floor prevents it.
    const { container } = render(<Heatmap data={CELLS} title="Errors" />)
    const mixes = Array.from(container.querySelectorAll('.vk-heatmap__cell:not([data-empty])')).map(
      (cell) =>
        Number.parseInt((cell as HTMLElement).style.getPropertyValue('--vk-heatmap-mix'), 10),
    )
    expect(Math.min(...mixes)).toBeGreaterThanOrEqual(8)
    expect(Math.max(...mixes)).toBe(100)
  })

  it('keeps the numbers reachable: the grid is presentation, the table is the data', () => {
    const { container } = render(<Heatmap data={CELLS} title="Errors by day" />)
    expect(container.querySelector('.vk-heatmap__grid')).toHaveAttribute('aria-hidden', 'true')
    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('API')
    expect(table).toHaveTextContent('40')
  })

  it('respects explicit row and column order, including empty tracks', () => {
    const { container } = render(
      <Heatmap
        columns={['Mon', 'Tue', 'Wed']}
        data={CELLS}
        rows={['Web', 'API']}
        title="Ordered"
      />,
    )
    const labels = Array.from(container.querySelectorAll('.vk-heatmap__row-label')).map(
      (el) => el.textContent,
    )
    expect(labels).toEqual(['Web', 'API'])
    expect(container.querySelectorAll('.vk-heatmap__cell')).toHaveLength(6)
  })

  it('renders on the server', () => {
    expect(() => renderToString(<Heatmap data={CELLS} title="SSR" />)).not.toThrow()
  })
})

describe('the four together', () => {
  it('have no axe violations', async () => {
    const { container } = render(
      <div>
        <ScatterChart data={XY} title="Scatter" />
        <RadarChart axes={['a', 'b', 'c']} data={[1, 2, 3]} title="Radar" />
        <Gauge title="Gauge" value={40} />
        <Heatmap data={[{ x: 'a', y: 'b', value: 1 }]} title="Heatmap" />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
