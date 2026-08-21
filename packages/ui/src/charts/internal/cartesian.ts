/**
 * Layout for the x/y charts (line, area, bar). Pure maths: props in, pixel positions
 * out, in a fixed `viewBox` coordinate space. Nothing measures the DOM, so what the
 * server renders is the finished chart.
 *
 * Axes are named by role, not by letter: `valueAt` positions a number along the value
 * axis and `categoryAt` positions a datum along the category axis. In a vertical chart
 * that means y and x; in a horizontal one it is the other way round, and every consumer
 * gets the flip for free.
 */

import type { MarkerShape } from './palette'
import { seriesColor, seriesDash, seriesMarker } from './palette'
import type { Domain } from './scale'
import {
  bandScale,
  extent,
  formatNumber,
  includeZero as includeZeroDomain,
  isNum,
  makeScale,
  num,
  padDomain,
  ticks,
} from './scale'
import type { ChartData, ChartSeries } from './types'

/** Width of the internal coordinate space. The `viewBox` scales it to any real width. */
export const VIEW_WIDTH = 640
const PAD = 10
const GUTTER_VALUE = 46
const GUTTER_CATEGORY = 88
const AXIS_BOTTOM = 28
export const LABEL_SIZE = 12

export type Orientation = 'vertical' | 'horizontal'

export interface ResolvedPoint {
  x: string | number
  y: number
  /** `x` as text: the category key, the table row header and the tooltip heading. */
  label: string
}

export interface ResolvedSeries {
  name: string
  color: string
  dash: string | undefined
  marker: MarkerShape
  points: ResolvedPoint[]
}

function labelOf(x: string | number): string {
  return typeof x === 'number' ? formatNumber(x) : String(x)
}

function toPoints(data: ChartData | undefined): ResolvedPoint[] {
  if (!data) return []
  const out: ResolvedPoint[] = []
  for (let i = 0; i < data.length; i++) {
    const entry = data[i]
    if (typeof entry === 'number') {
      // number[] shorthand: the index is the category.
      if (isNum(entry)) out.push({ x: i, y: entry, label: String(i) })
      continue
    }
    if (!entry) continue
    // Non-finite values are dropped here, once, so no later stage has to think about them.
    if (!isNum(entry.y)) continue
    const x = typeof entry.x === 'number' || typeof entry.x === 'string' ? entry.x : i
    out.push({ x, y: entry.y, label: labelOf(x) })
  }
  return out
}

/** Fold the `data` / `series` prop pair into one shape, applying the palette defaults. */
export function normalizeSeries(
  data?: ChartData,
  series?: readonly ChartSeries[],
): ResolvedSeries[] {
  const input: readonly ChartSeries[] = series?.length
    ? series
    : data
      ? [{ data } satisfies ChartSeries]
      : []
  return input.map((s, i) => ({
    name: s.name ?? (input.length > 1 ? `Series ${i + 1}` : 'Value'),
    color: seriesColor(i, s.color),
    dash: seriesDash(i, s.dash),
    marker: seriesMarker(i, s.marker),
    points: toPoints(s.data),
  }))
}

export interface PlotRect {
  x: number
  y: number
  width: number
  height: number
}

export interface AxisTick {
  value: number | string
  label: string
  at: number
}

export interface CartesianOptions {
  data?: ChartData
  series?: readonly ChartSeries[]
  height: number
  showAxes: boolean
  orientation?: Orientation
  /** Bars and stacks must measure from zero even when every value is positive. */
  baselineZero?: boolean
  /** Derive the value domain from cumulative sums rather than individual values. */
  stacked?: boolean
  /** Space categories edge-to-edge (lines) or at band centres (bars). */
  placement?: 'point' | 'band'
  valueTickCount?: number
  bandPadding?: number
}

export interface CartesianModel {
  series: ResolvedSeries[]
  /** Ordered, de-duplicated category labels across every series. */
  categories: string[]
  /** `linear` when every x is a real number, so spacing honours the values. */
  categoryKind: 'linear' | 'category'
  orientation: Orientation
  plot: PlotRect
  width: number
  height: number
  hasData: boolean
  valueDomain: Domain
  /** Pixel position of a value along the value axis (y when vertical, x when not). */
  valueAt: (value: number) => number
  /** Pixel position of a datum along the category axis. */
  categoryAt: (point: ResolvedPoint, indexInSeries: number) => number
  /** Pixel position of category `index` along the category axis. */
  categoryAtIndex: (index: number) => number
  /** Band geometry along the category axis. `width` is 0 when there is nothing to draw. */
  band: { step: number; width: number; at: (index: number) => number }
  valueTicks: AxisTick[]
  categoryTicks: AxisTick[]
  /** Position of value 0 along the value axis, clamped into the plot. */
  zeroAt: number
  /** True when the value domain straddles zero, so a baseline is worth drawing. */
  crossesZero: boolean
  /** The value axis as [start, end] pixels, for clamping smoothed control points. */
  bounds: Domain
}

/** Per-series, per-category stack segments, in data space. */
export interface StackSegment {
  y0: number
  y1: number
}

/**
 * Split each category into a positive and a negative stack. Negatives accumulate
 * downward from zero, so a mixed-sign stacked chart stays readable instead of
 * cancelling itself out.
 */
export function stackSeries(
  series: readonly ResolvedSeries[],
  categories: string[],
): StackSegment[][] {
  const posTotals = new Map<string, number>()
  const negTotals = new Map<string, number>()
  return series.map((s) => {
    const byLabel = new Map<string, number>()
    for (const p of s.points) byLabel.set(p.label, (byLabel.get(p.label) ?? 0) + p.y)
    return categories.map((c) => {
      const v = byLabel.get(c)
      if (!isNum(v) || v === 0) {
        const base = posTotals.get(c) ?? 0
        return { y0: base, y1: base }
      }
      const totals = v > 0 ? posTotals : negTotals
      const y0 = totals.get(c) ?? 0
      const y1 = y0 + v
      totals.set(c, y1)
      return { y0, y1 }
    })
  })
}

export function resolveCartesian(options: CartesianOptions): CartesianModel {
  const {
    data,
    series,
    height: rawHeight,
    showAxes,
    orientation = 'vertical',
    baselineZero = false,
    stacked = false,
    placement = 'point',
    valueTickCount = 5,
    bandPadding = 0.24,
  } = options

  const horizontal = orientation === 'horizontal'
  const width = VIEW_WIDTH
  const height = isNum(rawHeight) && rawHeight > 40 ? Math.round(rawHeight) : 240
  const resolved = normalizeSeries(data, series)

  const left = showAxes ? (horizontal ? GUTTER_CATEGORY : GUTTER_VALUE) : PAD
  const bottom = showAxes ? AXIS_BOTTOM : PAD
  const plot: PlotRect = {
    x: left,
    y: PAD,
    // Math.max keeps a comically small `height` prop from inverting the plot.
    width: Math.max(1, width - left - PAD),
    height: Math.max(1, height - PAD - bottom),
  }

  // Categories in first-appearance order, across every series, so stacks line up.
  const categories: string[] = []
  const categoryIndex = new Map<string, number>()
  for (const s of resolved) {
    for (const p of s.points) {
      if (!categoryIndex.has(p.label)) {
        categoryIndex.set(p.label, categories.length)
        categories.push(p.label)
      }
    }
  }

  const allPoints = resolved.flatMap((s) => s.points)
  const hasData = allPoints.length > 0
  // A numeric category axis only when *every* x is a real number, and only for lines.
  const categoryKind: 'linear' | 'category' =
    placement === 'point' && allPoints.length > 1 && allPoints.every((p) => isNum(p.x))
      ? 'linear'
      : 'category'

  const values = stacked
    ? stackSeries(resolved, categories).flatMap((segs) => segs.flatMap((s) => [s.y0, s.y1]))
    : allPoints.map((p) => p.y)
  let valueDomain = padDomain(extent(values))
  if (baselineZero || stacked) valueDomain = padDomain(includeZeroDomain(valueDomain))

  // Vertical charts grow upward, so the value range is inverted; horizontal ones grow right.
  const valueRange: Domain = horizontal
    ? [plot.x, plot.x + plot.width]
    : [plot.y + plot.height, plot.y]
  const categoryRange: Domain = horizontal
    ? [plot.y, plot.y + plot.height]
    : [plot.x, plot.x + plot.width]

  const valueAt = makeScale(valueDomain, valueRange)
  const band = bandScale(Math.max(1, categories.length), categoryRange, bandPadding)

  const xNumbers = allPoints.map((p) => (isNum(p.x) ? p.x : 0))
  const numericDomain = padDomain(extent(xNumbers))
  const numericAt = makeScale(numericDomain, categoryRange)
  const spread = categoryRange[1] - categoryRange[0]
  const lastCategory = Math.max(1, categories.length - 1)
  const spreadAt = (index: number): number =>
    categories.length <= 1
      ? num(categoryRange[0] + spread / 2)
      : num(categoryRange[0] + (index / lastCategory) * spread)

  const categoryAtIndex = (index: number): number =>
    placement === 'band' ? num(band.at(index) + band.width / 2) : spreadAt(index)

  const categoryAt = (point: ResolvedPoint, indexInSeries: number): number => {
    if (categoryKind === 'linear' && isNum(point.x)) return numericAt(point.x)
    return categoryAtIndex(categoryIndex.get(point.label) ?? indexInSeries)
  }

  const valueTicks: AxisTick[] = hasData
    ? ticks(valueDomain[0], valueDomain[1], valueTickCount).map((v) => ({
        value: v,
        label: formatNumber(v),
        at: valueAt(v),
      }))
    : []

  let categoryTicks: AxisTick[] = []
  if (hasData && categoryKind === 'linear') {
    categoryTicks = ticks(numericDomain[0], numericDomain[1], 6).map((v) => ({
      value: v,
      label: formatNumber(v),
      at: numericAt(v),
    }))
  } else if (hasData) {
    // Thin the labels rather than measure text: about 8 fit across the value axis.
    const stride = Math.max(1, Math.ceil(categories.length / (horizontal ? 12 : 8)))
    categoryTicks = categories
      .map((label, index) => ({ label, index }))
      .filter((t) => t.index % stride === 0)
      .map((t) => ({ value: t.label, label: t.label, at: categoryAtIndex(t.index) }))
  }

  const lo = Math.min(valueRange[0], valueRange[1])
  const hi = Math.max(valueRange[0], valueRange[1])

  return {
    series: resolved,
    categories,
    categoryKind,
    orientation,
    plot,
    width,
    height,
    hasData,
    valueDomain,
    valueAt,
    categoryAt,
    categoryAtIndex,
    band,
    valueTicks,
    categoryTicks,
    zeroAt: Math.min(hi, Math.max(lo, valueAt(0))),
    crossesZero: valueDomain[0] < 0 && valueDomain[1] > 0,
    bounds: [lo, hi],
  }
}
