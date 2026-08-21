/**
 * Chart palette gate: contrast and colour-blind separation.
 *
 * Two series shipped below the WCAG 2.1 SC 1.4.11 threshold — `#e69f00` at 2.25:1 on
 * white and `#56b4e9` at 2.31:1 — which is a chart line you can barely see. Neither is
 * noticeable by eye, because an amber line looks perfectly fine until measured.
 *
 * The separation half matters just as much and is easier to get wrong: the obvious repair
 * (darken the failing colours) drops the worst pair from dE 16.1 to 6.1 under simulated
 * deuteranopia, trading a contrast bug for a colour-blindness bug. So this asserts both
 * properties at once, and asserts them per series count, because a palette can be fine
 * for three series and unusable for six.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const CSS = readFileSync(join(__dirname, 'charts.css'), 'utf8')

function palette(selector: string): string[] {
  const start = CSS.indexOf(selector)
  if (start === -1) throw new Error(`charts.css has no ${selector} block`)
  const body = CSS.slice(start, CSS.indexOf('\n}', start))
  const out: string[] = []
  for (let i = 1; i <= 6; i++) {
    const m = body.match(new RegExp(`--vk-chart-${i}:\\s*(#[0-9a-f]{6})`, 'i'))
    const hex = m?.[1]
    if (!hex) throw new Error(`${selector} is missing --vk-chart-${i}`)
    out.push(hex)
  }
  return out
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const clamp = (v: number) => Math.min(1, Math.max(0, v))
const rgb = (hex: string) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)

const luminance = (c: number[]) =>
  0.2126 * toLinear(c[0] ?? 0) + 0.7152 * toLinear(c[1] ?? 0) + 0.0722 * toLinear(c[2] ?? 0)

function contrast(a: string, b: string): number {
  const x = luminance(rgb(a))
  const y = luminance(rgb(b))
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/*
 * Viénot/Brettel dichromacy matrices, applied in linear light. This is the same
 * simulation colour-blindness checkers use; doing it here means the property is asserted
 * rather than assumed from "we picked a colourblind-safe palette".
 */
const DICHROMACY = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
} as const

function simulate(colour: number[], kind: keyof typeof DICHROMACY): number[] {
  const [r = 0, g = 0, b = 0] = colour.map(toLinear)
  return DICHROMACY[kind].map((row) =>
    toGamma(clamp((row[0] ?? 0) * r + (row[1] ?? 0) * g + (row[2] ?? 0) * b)),
  )
}

function lab(colour: number[]): [number, number, number] {
  const [r = 0, g = 0, b = 0] = colour.map(toLinear)
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047)
  const y = f(0.2126 * r + 0.7152 * g + 0.0722 * b)
  const z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883)
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}

const deltaE = (a: number[], b: number[]) => {
  const [l1, a1, b1] = lab(a)
  const [l2, a2, b2] = lab(b)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

/** Narrowing helper: the loops below index arrays whose bounds they already guarantee. */
const at = <T>(list: readonly T[], i: number): T => {
  const value = list[i]
  if (value === undefined) throw new Error(`index ${i} out of range`)
  return value
}

/** Worst pairwise separation across normal vision and all three dichromacies. */
function worstSeparation(hexes: string[]): { dE: number; kind: string; pair: [number, number] } {
  const colours = hexes.map(rgb)
  let worst = { dE: Number.POSITIVE_INFINITY, kind: 'normal', pair: [0, 0] as [number, number] }
  const views: Array<[string, number[][]]> = [
    ['normal', colours],
    ...(Object.keys(DICHROMACY) as Array<keyof typeof DICHROMACY>).map(
      (kind) => [kind, colours.map((c) => simulate(c, kind))] as [string, number[][]],
    ),
  ]
  for (const [kind, seen] of views) {
    for (let i = 0; i < seen.length; i++) {
      for (let j = i + 1; j < seen.length; j++) {
        const dE = deltaE(at(seen, i), at(seen, j))
        if (dE < worst.dE) worst = { dE, kind, pair: [i + 1, j + 1] }
      }
    }
  }
  return worst
}

/** WCAG 2.1 SC 1.4.11, Non-text Contrast. */
const NON_TEXT = 3
/** Comfortably above the ~2.3 CIELAB just-noticeable difference. */
const SEPARATION_FLOOR = 6

const THEMES: Array<[string, string, string]> = [
  ['light', ':where(:root)', '#ffffff'],
  ['dark', ':where([data-theme="dark"])', '#17171a'],
]

describe.each(THEMES)('%s chart palette', (themeName, selector, surface) => {
  const series = palette(selector)

  it('has all six series meet non-text contrast against the chart surface', () => {
    series.forEach((hex, i) => {
      expect(
        contrast(hex, surface),
        `--vk-chart-${i + 1} (${hex}) on ${surface} in ${themeName}`,
      ).toBeGreaterThanOrEqual(NON_TEXT)
    })
  })

  /*
   * Per prefix, because series are allocated in order. The first four have to be the
   * strongest: a two-series chart must never draw two colours a deuteranope reads as one,
   * and that is far more common than a six-series chart.
   */
  it.each([2, 3, 4])('keeps the first %i series separable under all dichromacies', (n) => {
    const worst = worstSeparation(series.slice(0, n))
    expect(
      worst.dE,
      `first ${n} series in ${themeName}: closest pair ${worst.pair.join(' vs ')} under ${worst.kind}`,
    ).toBeGreaterThanOrEqual(12)
  })

  it('keeps the full six above the just-noticeable difference', () => {
    // Deliberately a lower bar than the 1-4 case. Fitting six colours that all clear 3:1
    // AND stay 12 apart under three dichromacies is not solvable in sRGB, so past four
    // series the dash patterns and marker shapes carry series identity - see
    // `internal/palette.ts`, which assigns both.
    const worst = worstSeparation(series)
    expect(
      worst.dE,
      `all six in ${themeName}: closest pair ${worst.pair.join(' vs ')} under ${worst.kind}`,
    ).toBeGreaterThanOrEqual(SEPARATION_FLOOR)
  })
})

describe('palette structure', () => {
  it('gives each theme its own palette', () => {
    // One palette cannot serve both: a colour at 3:1 against white is close in luminance
    // to white, so it is nowhere near 3:1 against near-black. Sharing them is how the two
    // failing light-theme series went unnoticed.
    expect(palette(':where(:root)')).not.toEqual(palette(':where([data-theme="dark"])'))
  })

  it('backs colour with a dash pattern and a marker shape per series', () => {
    // The non-colour channels. If these ever go away, the six-series case above loses its
    // justification for the lower separation floor.
    const source = readFileSync(join(__dirname, 'internal/palette.ts'), 'utf8')
    expect(source).toMatch(/DASHES\s*=\s*\[/)
    expect(source).toMatch(/MARKERS\s*:/)
  })
})
