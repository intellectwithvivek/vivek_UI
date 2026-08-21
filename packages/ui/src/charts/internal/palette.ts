import { f, isNum } from './scale'

/** How many `--vk-chart-*` tokens exist. Series wrap around after this many. */
export const SERIES_COUNT = 6

/**
 * The colour for series `index`, as a token reference so consumers restyle a chart with
 * plain CSS (`:root { --vk-chart-1: hotpink }`) instead of prop drilling.
 */
export function seriesColor(index: number, explicit?: string): string {
  if (explicit) return explicit
  const i = isNum(index) ? Math.abs(Math.floor(index)) % SERIES_COUNT : 0
  return `var(--vk-chart-${i + 1})`
}

/**
 * Dash patterns, so lines stay distinguishable in greyscale, in print, and to anyone
 * who cannot separate the hues. Series 1 is solid; the rest are increasingly distinct.
 */
const DASHES = ['', '6 4', '1 4', '10 4 2 4', '4 3 1 3', '2 2 8 2'] as const

export function seriesDash(index: number, explicit?: string): string | undefined {
  if (explicit !== undefined) return explicit || undefined
  const i = isNum(index) ? Math.abs(Math.floor(index)) % SERIES_COUNT : 0
  return DASHES[i] || undefined
}

export type MarkerShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'cross' | 'plus'

const MARKERS: readonly MarkerShape[] = ['circle', 'square', 'triangle', 'diamond', 'plus', 'cross']

export function seriesMarker(index: number, explicit?: MarkerShape): MarkerShape {
  if (explicit) return explicit
  const i = isNum(index) ? Math.abs(Math.floor(index)) % SERIES_COUNT : 0
  return MARKERS[i] ?? 'circle'
}

/**
 * A marker as a single `d` string, so one `<path>` covers every shape and there is no
 * `<defs>`/`<use>` id to generate. Returns `''` for an unusable position or radius.
 */
export function markerPath(shape: MarkerShape, cx: number, cy: number, r: number): string {
  if (!isNum(cx) || !isNum(cy) || !isNum(r) || r <= 0) return ''
  const x = cx
  const y = cy
  switch (shape) {
    case 'square':
      return `M${f(x - r)} ${f(y - r)}h${f(r * 2)}v${f(r * 2)}h${f(-r * 2)}Z`
    case 'triangle':
      return `M${f(x)} ${f(y - r * 1.15)}L${f(x + r)} ${f(y + r * 0.75)}L${f(x - r)} ${f(y + r * 0.75)}Z`
    case 'diamond':
      return `M${f(x)} ${f(y - r * 1.25)}L${f(x + r * 1.25)} ${f(y)}L${f(x)} ${f(y + r * 1.25)}L${f(x - r * 1.25)} ${f(y)}Z`
    case 'plus': {
      const t = r / 2.6
      return `M${f(x - t)} ${f(y - r)}h${f(t * 2)}v${f(r - t)}h${f(r - t)}v${f(t * 2)}h${f(-(r - t))}v${f(r - t)}h${f(-t * 2)}v${f(-(r - t))}h${f(-(r - t))}v${f(-t * 2)}h${f(r - t)}Z`
    }
    case 'cross': {
      const t = r / 3.4
      const a = r * 0.78
      return [
        `M${f(x - a)} ${f(y - a + t)}`,
        `L${f(x - a + t)} ${f(y - a)}`,
        `L${f(x)} ${f(y - t)}`,
        `L${f(x + a - t)} ${f(y - a)}`,
        `L${f(x + a)} ${f(y - a + t)}`,
        `L${f(x + t)} ${f(y)}`,
        `L${f(x + a)} ${f(y + a - t)}`,
        `L${f(x + a - t)} ${f(y + a)}`,
        `L${f(x)} ${f(y + t)}`,
        `L${f(x - a + t)} ${f(y + a)}`,
        `L${f(x - a)} ${f(y + a - t)}`,
        `L${f(x - t)} ${f(y)}`,
        'Z',
      ].join('')
    }
    default:
      // A circle drawn as two arcs, so every marker is the same element type.
      return `M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(r * 2)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-r * 2)} 0Z`
  }
}
