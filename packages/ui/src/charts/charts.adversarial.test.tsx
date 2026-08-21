/**
 * Independent adversarial check of the chart maths. Deliberately hostile inputs, run
 * through server rendering, asserting nothing invalid ever reaches an SVG attribute.
 * Temporary file - not part of the shipped suite.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AreaChart } from './area-chart'
import { BarChart } from './bar-chart'
import { LineChart } from './line-chart'
import { PieChart } from './pie-chart'
import { ProgressRing } from './progress-ring'
import { Sparkline } from './sparkline'

const HOSTILE: Array<[string, { x: string; y: number }[]]> = [
  ['empty', []],
  ['single point', [{ x: 'a', y: 5 }]],
  [
    'all equal',
    [
      { x: 'a', y: 7 },
      { x: 'b', y: 7 },
      { x: 'c', y: 7 },
    ],
  ],
  [
    'all zero',
    [
      { x: 'a', y: 0 },
      { x: 'b', y: 0 },
    ],
  ],
  [
    'negatives',
    [
      { x: 'a', y: -10 },
      { x: 'b', y: 5 },
      { x: 'c', y: -3 },
    ],
  ],
  [
    'NaN',
    [
      { x: 'a', y: Number.NaN },
      { x: 'b', y: 4 },
    ],
  ],
  [
    'Infinity',
    [
      { x: 'a', y: Number.POSITIVE_INFINITY },
      { x: 'b', y: 1 },
    ],
  ],
  [
    '-Infinity',
    [
      { x: 'a', y: Number.NEGATIVE_INFINITY },
      { x: 'b', y: 1 },
    ],
  ],
  [
    'all NaN',
    [
      { x: 'a', y: Number.NaN },
      { x: 'b', y: Number.NaN },
    ],
  ],
  [
    'huge',
    [
      { x: 'a', y: 1e308 },
      { x: 'b', y: -1e308 },
    ],
  ],
  [
    'tiny',
    [
      { x: 'a', y: 1e-320 },
      { x: 'b', y: 2e-320 },
    ],
  ],
]

/** Nothing that lands in the DOM may contain a non-finite token. */
function assertClean(html: string, label: string) {
  for (const bad of ['NaN', 'Infinity', 'undefined', 'null%', '=""']) {
    if (bad === '=""') continue
    expect(html, `${label} emitted ${bad}`).not.toContain(bad)
  }
}

describe('adversarial: cartesian charts', () => {
  for (const [label, data] of HOSTILE) {
    it(`LineChart survives ${label}`, () => {
      assertClean(renderToStaticMarkup(<LineChart data={data} title="t" />), `Line/${label}`)
    })
    it(`AreaChart survives ${label}`, () => {
      assertClean(renderToStaticMarkup(<AreaChart data={data} title="t" />), `Area/${label}`)
    })
    it(`BarChart survives ${label}`, () => {
      assertClean(renderToStaticMarkup(<BarChart data={data} title="t" />), `Bar/${label}`)
      assertClean(
        renderToStaticMarkup(<BarChart data={data} horizontal title="t" />),
        `BarH/${label}`,
      )
    })
    it(`Sparkline survives ${label}`, () => {
      assertClean(
        renderToStaticMarkup(<Sparkline data={data.map((d) => d.y)} title="t" />),
        `Spark/${label}`,
      )
    })
  }
})

describe('adversarial: radial charts', () => {
  const PIE: Array<[string, Array<{ label: string; value: number }>]> = [
    ['empty', []],
    ['single', [{ label: 'a', value: 1 }]],
    [
      'all zero',
      [
        { label: 'a', value: 0 },
        { label: 'b', value: 0 },
      ],
    ],
    [
      'negatives',
      [
        { label: 'a', value: -5 },
        { label: 'b', value: 5 },
      ],
    ],
    [
      'NaN',
      [
        { label: 'a', value: Number.NaN },
        { label: 'b', value: 3 },
      ],
    ],
    [
      'hair slice',
      [
        { label: 'a', value: 0.000001 },
        { label: 'b', value: 1e6 },
      ],
    ],
  ]
  for (const [label, data] of PIE) {
    it(`PieChart survives ${label}`, () => {
      assertClean(renderToStaticMarkup(<PieChart data={data} title="t" />), `Pie/${label}`)
      assertClean(renderToStaticMarkup(<PieChart data={data} donut title="t" />), `Donut/${label}`)
    })
  }

  const RING: Array<[string, number, number]> = [
    ['zero', 0, 100],
    ['over max', 500, 100],
    ['negative', -20, 100],
    ['NaN value', Number.NaN, 100],
    ['zero max', 50, 0],
    ['negative max', 50, -10],
    ['NaN max', 50, Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY, 100],
  ]
  for (const [label, value, max] of RING) {
    it(`ProgressRing survives ${label}`, () => {
      assertClean(renderToStaticMarkup(<ProgressRing value={value} max={max} />), `Ring/${label}`)
    })
  }
})

describe('adversarial: degenerate geometry', () => {
  it('donut inner radius above 1 does not invert', () => {
    assertClean(
      renderToStaticMarkup(
        <PieChart data={[{ label: 'a', value: 1 }]} donut innerRadius={4} title="t" />,
      ),
      'donut/innerRadius>1',
    )
  })
  it('ring thickness larger than the size does not invert', () => {
    assertClean(
      renderToStaticMarkup(<ProgressRing value={50} size={20} thickness={400} />),
      'ring/thick',
    )
  })
  it('zero height chart does not divide by zero', () => {
    assertClean(
      renderToStaticMarkup(<LineChart data={[{ x: 'a', y: 1 }]} height={0} title="t" />),
      'line/height0',
    )
  })
})
