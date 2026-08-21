import type { HTMLAttributes } from 'react'
import type { MarkerShape } from './palette'

/** One observation. `x` is a category label or a numeric position; `y` is the value. */
export interface ChartDatum {
  x: string | number
  y: number
}

/**
 * Chart input. A bare `number[]` is shorthand for `[{ x: 0, y: n0 }, { x: 1, y: n1 }]`,
 * which is what makes `<Sparkline data={[1, 2, 3]} />` work.
 */
export type ChartData = readonly ChartDatum[] | readonly number[]

export interface ChartSeries {
  /** Shown in the legend, the tooltip and the data table. Defaults to `Series n`. */
  name?: string
  data: ChartData
  /** Any CSS colour. Defaults to the `--vk-chart-n` token for this series index. */
  color?: string
  /**
   * `stroke-dasharray`. Defaults to a per-index pattern so series stay distinguishable
   * without colour; pass `''` to force a solid line.
   */
  dash?: string
  /** Point glyph. Defaults to a per-index shape, again so colour is never the only cue. */
  marker?: MarkerShape
}

/** Props every chart shares. The root element is always a `<div>`. */
export interface ChartRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Rendered as the SVG `<title>` and used as the accessible name. Supply this or
   * `aria-label` - a chart with neither is unusable with a screen reader.
   */
  title?: string
  /** Rendered as the SVG `<desc>`: the longer "what am I looking at" sentence. */
  description?: string
  /**
   * Render a visually hidden `<table>` of the underlying numbers after the SVG, so
   * assistive tech gets the actual data rather than "graphic". On by default.
   */
  accessibleTable?: boolean
  /** Heading for the category column of that table, and the x axis. */
  xLabel?: string
  /** Heading for the value columns of that table, and the y axis. */
  yLabel?: string
  /** Formats every value label. Must be locale-stable to stay hydration-safe. */
  formatValue?: (value: number) => string
}
