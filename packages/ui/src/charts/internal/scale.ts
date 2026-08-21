/**
 * Chart maths. No dependencies, no DOM, no React - every helper here is a pure
 * function, which is what lets the charts render identically on the server and in the
 * browser without measuring anything (ARCHITECTURE §9).
 *
 * The one rule that matters: **nothing in this file may return a non-finite number.**
 * Every coordinate a chart emits flows through `num()`, so a NaN or Infinity in the
 * caller data can never reach a `d` attribute or an `x`/`y`.
 */

export type Domain = readonly [number, number]
export type Point = readonly [number, number]

/** Narrow to a real, plottable number: rejects NaN, Infinity and non-numbers. */
export function isNum(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Round to `dp` decimals so paths stay short. Non-finite input collapses to `0`
 * instead of poisoning the SVG - this is the last line of defence, called on every
 * coordinate right before it is stringified.
 */
export function num(value: number, dp = 2): number {
  if (!Number.isFinite(value)) return 0
  const factor = 10 ** dp
  const rounded = Math.round(value * factor) / factor
  // Normalise -0, which would otherwise stringify as "-0".
  return rounded === 0 ? 0 : rounded
}

/** `num()` as a string, for building path data. */
export function f(value: number): string {
  return String(num(value))
}

export function clamp(value: number, min: number, max: number): number {
  if (!isNum(value)) return min
  if (min > max) return min
  return value < min ? min : value > max ? max : value
}

/** Sum of the finite entries only. */
export function sum(values: readonly number[]): number {
  let total = 0
  for (const v of values) if (isNum(v)) total += v
  return isNum(total) ? total : 0
}

/** Min/max across the finite values only. `null` when there is nothing to plot. */
export function extent(values: readonly number[]): Domain | null {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const v of values) {
    if (!isNum(v)) continue
    if (v < min) min = v
    if (v > max) max = v
  }
  return min <= max ? [min, max] : null
}

/**
 * Turn any extent - including `null` (no data), an inverted pair, or a zero-range one
 * (every value identical, or a single data point) - into a domain with a non-zero
 * span. This is what stops `makeScale` ever dividing by zero.
 */
export function padDomain(domain: Domain | null): Domain {
  if (!domain) return [0, 1]
  let [min, max] = domain
  if (!isNum(min) || !isNum(max)) return [0, 1]
  if (min > max) [min, max] = [max, min]
  if (min !== max) return [min, max]
  if (min === 0) return [0, 1]
  const pad = Math.abs(min) / 2
  return [min - pad, min + pad]
}

/** Extend a domain to include zero, so bars and stacks measure from a real baseline. */
export function includeZero(domain: Domain): Domain {
  return [Math.min(0, domain[0]), Math.max(0, domain[1])]
}

/**
 * A linear scale from data space to pixel space. A zero-span domain maps everything to
 * the middle of the range (a flat series sits in the centre of the plot) rather than
 * producing Infinity.
 */
export function makeScale(domain: Domain, range: Domain): (value: number) => number {
  const [d0, d1] = domain
  const [r0, r1] = range
  const span = d1 - d0
  const mid = num((r0 + r1) / 2)
  return (value: number): number => {
    if (!isNum(value) || !isNum(span) || span === 0) return mid
    return num(r0 + ((value - d0) / span) * (r1 - r0))
  }
}

/**
 * Human-friendly tick values inside [min, max], stepping by 1, 2, 5 or 10 x 10^n.
 * Degenerate ranges collapse to one or two ticks, and the loop is hard-capped so a
 * pathological domain cannot hang the render.
 */
export function ticks(min: number, max: number, count = 5): number[] {
  if (!isNum(min) || !isNum(max) || !isNum(count) || count < 1) return []
  if (min > max) return ticks(max, min, count)
  if (min === max) return [num(min, 6)]

  const rough = (max - min) / count
  if (!(rough > 0)) return [num(min, 6), num(max, 6)]
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  if (!(magnitude > 0)) return [num(min, 6), num(max, 6)]
  const normalised = rough / magnitude
  // Geometric-mean thresholds: they pick the 1/2/5/10 step whose tick count lands
  // closest to the count asked for, rather than always rounding the step up.
  const step =
    (normalised >= Math.sqrt(50)
      ? 10
      : normalised >= Math.sqrt(10)
        ? 5
        : normalised >= Math.SQRT2
          ? 2
          : 1) * magnitude
  if (!(step > 0)) return [num(min, 6), num(max, 6)]

  const out: number[] = []
  const start = Math.ceil(min / step) * step
  // The epsilon keeps floating point from dropping the last tick.
  for (let v = start; v <= max + step * 1e-9 && out.length < 200; v += step) out.push(num(v, 6))
  return out
}

export interface Band {
  /** Distance from the start of one band to the next. */
  step: number
  /** Drawable width of a single band, after padding. */
  width: number
  /** Left edge of band `index`. */
  at(index: number): number
}

/**
 * A categorical band scale, as bars need. `padding` is the fraction of each step left
 * empty. A zero or negative `count` yields a zero-width band instead of Infinity.
 */
export function bandScale(count: number, range: Domain, padding = 0.2): Band {
  const [r0, r1] = range
  const span = isNum(r1 - r0) ? r1 - r0 : 0
  const safeCount = isNum(count) && count > 0 ? Math.floor(count) : 0
  const pad = clamp(isNum(padding) ? padding : 0, 0, 0.9)
  const step = safeCount > 0 ? span / safeCount : span
  const width = Math.max(0, step * (1 - pad))
  return {
    step: num(step),
    width: num(width),
    at: (index: number) => num(r0 + (isNum(index) ? index : 0) * step + (step - width) / 2),
  }
}

/** Drop any point with a non-finite coordinate. Nothing else gets to become a path. */
export function finitePoints(points: readonly Point[]): Point[] {
  return points.filter((p): p is Point => isNum(p[0]) && isNum(p[1]))
}

function straightTail(points: readonly Point[]): string {
  let d = ''
  for (let i = 1; i < points.length; i++) {
    const p = points[i]
    if (!p) continue
    d += `L${f(p[0])} ${f(p[1])}`
  }
  return d
}

/**
 * Catmull-Rom through the points, expressed as cubic Beziers. Control points are
 * clamped into `bounds` (the plot band) so a smoothed curve cannot overshoot out of
 * the chart - which is the usual reason to reach for a clip path and a generated id.
 */
function smoothTail(points: readonly Point[], bounds?: Domain): string {
  let d = ''
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    if (!p1 || !p2) continue
    const p0 = points[i - 1] ?? p1
    const p3 = points[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    let c1y = p1[1] + (p2[1] - p0[1]) / 6
    let c2y = p2[1] - (p3[1] - p1[1]) / 6
    if (bounds) {
      c1y = clamp(c1y, bounds[0], bounds[1])
      c2y = clamp(c2y, bounds[0], bounds[1])
    }
    d += `C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}

/**
 * An open line through `points`. Returns `''` for fewer than two usable points; a
 * caller that gets `''` must not render the `<path>` at all.
 */
export function linePath(points: readonly Point[], smooth = false, bounds?: Domain): string {
  const pts = finitePoints(points)
  const first = pts[0]
  if (!first || pts.length < 2) return ''
  const tail = smooth ? smoothTail(pts, bounds) : straightTail(pts)
  return tail ? `M${f(first[0])} ${f(first[1])}${tail}` : ''
}

/**
 * A closed area between `top` (left to right) and `bottom` (right to left). Pass a
 * two-point baseline for a plain area, or the previous layer reversed for a stack.
 */
export function areaPath(
  top: readonly Point[],
  bottom: readonly Point[],
  smooth = false,
  bounds?: Domain,
): string {
  const upper = finitePoints(top)
  const lower = finitePoints(bottom)
  const start = upper[0]
  const join = lower[0]
  if (!start || upper.length < 2 || !join) return ''
  const upperTail = smooth ? smoothTail(upper, bounds) : straightTail(upper)
  const lowerTail = smooth ? smoothTail(lower, bounds) : straightTail(lower)
  return `M${f(start[0])} ${f(start[1])}${upperTail}L${f(join[0])} ${f(join[1])}${lowerTail}Z`
}

/** Cartesian coordinates of an angle measured clockwise from 12 oclock, in radians. */
export function polarPoint(cx: number, cy: number, r: number, angle: number): Point {
  if (!isNum(cx) || !isNum(cy) || !isNum(r) || !isNum(angle)) return [num(cx), num(cy)]
  return [num(cx + r * Math.sin(angle)), num(cy - r * Math.cos(angle))]
}

const TAU = Math.PI * 2

/**
 * A pie wedge (`inner <= 0`) or donut segment, from `start` to `end` radians measured
 * clockwise from the top. A full turn is split into two arcs, because a single
 * elliptical arc command cannot express 360 degrees.
 */
export function arcPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number,
): string {
  if (!isNum(cx) || !isNum(cy) || !isNum(outer) || !isNum(start) || !isNum(end)) return ''
  const rOuter = Math.max(0, outer)
  const rInner = clamp(isNum(inner) ? inner : 0, 0, rOuter)
  const sweep = end - start
  if (rOuter <= 0 || !isNum(sweep) || sweep <= 0) return ''

  if (sweep >= TAU - 1e-6) {
    const half = start + Math.PI
    const ring = (r: number, dir: 0 | 1) => {
      const a = polarPoint(cx, cy, r, start)
      const b = polarPoint(cx, cy, r, half)
      return `M${f(a[0])} ${f(a[1])}A${f(r)} ${f(r)} 0 1 ${dir} ${f(b[0])} ${f(b[1])}A${f(r)} ${f(r)} 0 1 ${dir} ${f(a[0])} ${f(a[1])}Z`
    }
    // Two subpaths wound in opposite directions: the nonzero fill rule punches the hole.
    return rInner > 0 ? `${ring(rOuter, 1)}${ring(rInner, 0)}` : ring(rOuter, 1)
  }

  const large = sweep > Math.PI ? 1 : 0
  const o0 = polarPoint(cx, cy, rOuter, start)
  const o1 = polarPoint(cx, cy, rOuter, end)
  if (rInner <= 0) {
    return `M${f(cx)} ${f(cy)}L${f(o0[0])} ${f(o0[1])}A${f(rOuter)} ${f(rOuter)} 0 ${large} 1 ${f(o1[0])} ${f(o1[1])}Z`
  }
  const i1 = polarPoint(cx, cy, rInner, end)
  const i0 = polarPoint(cx, cy, rInner, start)
  return `M${f(o0[0])} ${f(o0[1])}A${f(rOuter)} ${f(rOuter)} 0 ${large} 1 ${f(o1[0])} ${f(o1[1])}L${f(i1[0])} ${f(i1[1])}A${f(rInner)} ${f(rInner)} 0 ${large} 0 ${f(i0[0])} ${f(i0[1])}Z`
}

/**
 * Locale-independent number formatting for tick and value labels.
 *
 * Deliberately NOT `toLocaleString`: the server and the browser can disagree on
 * locale, and a label that differs between them is a hydration mismatch.
 */
export function formatNumber(value: number): string {
  if (!isNum(value)) return ''
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${num(value / 1_000_000_000, 1)}B`
  if (abs >= 1_000_000) return `${num(value / 1_000_000, 1)}M`
  if (abs >= 10_000) return `${num(value / 1000, 1)}k`
  return String(num(value, 2))
}
