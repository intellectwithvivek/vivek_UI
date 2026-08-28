/**
 * Colour maths for `ColorPicker`: parse what people paste, convert between RGB and HSV,
 * format back to hex. Pure functions, no DOM.
 *
 * Hue is kept in degrees (0–360), saturation/value in percent (0–100), alpha 0–1.
 */

export interface RGBA {
  r: number
  g: number
  b: number
  a: number
}

export interface HSVA {
  h: number
  s: number
  v: number
  a: number
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const round = (n: number, places = 0) => {
  const f = 10 ** places
  return Math.round(n * f) / f
}

/**
 * Accepts `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa` (hash optional) and `rgb()` / `rgba()`
 * with numbers or percentages. Returns `null` for anything else — no guessing.
 */
export function parseColor(input: string): RGBA | null {
  const text = input.trim()
  const hex = text.startsWith('#') ? text.slice(1) : text
  if (/^[0-9a-f]{3,4}$/i.test(hex)) {
    const [r, g, b, a] = hex.split('').map((c) => Number.parseInt(c + c, 16))
    return { r: r ?? 0, g: g ?? 0, b: b ?? 0, a: a === undefined ? 1 : a / 255 }
  }
  if (/^[0-9a-f]{6}$|^[0-9a-f]{8}$/i.test(hex)) {
    const n = (i: number) => Number.parseInt(hex.slice(i, i + 2), 16)
    return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? n(6) / 255 : 1 }
  }
  const fn = /^rgba?\(\s*([^)]+)\)$/i.exec(text)
  if (fn) {
    const parts = (fn[1] ?? '')
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map((p) =>
        p.endsWith('%')
          ? { v: Number.parseFloat(p), pct: true }
          : { v: Number.parseFloat(p), pct: false },
      )
    if (parts.length < 3 || parts.length > 4 || parts.some((p) => Number.isNaN(p.v))) return null
    const channel = (p: { v: number; pct: boolean }) =>
      clamp(p.pct ? (p.v / 100) * 255 : p.v, 0, 255)
    const alpha = parts[3]
    return {
      r: channel(parts[0] as { v: number; pct: boolean }),
      g: channel(parts[1] as { v: number; pct: boolean }),
      b: channel(parts[2] as { v: number; pct: boolean }),
      a: alpha ? clamp(alpha.pct ? alpha.v / 100 : alpha.v, 0, 1) : 1,
    }
  }
  return null
}

/** `#rrggbb`, or `#rrggbbaa` when `withAlpha` is set. Lower-case, always hashed. */
export function toHex(color: RGBA, withAlpha = false): string {
  const h = (n: number) =>
    Math.round(clamp(n, 0, 255))
      .toString(16)
      .padStart(2, '0')
  const base = `#${h(color.r)}${h(color.g)}${h(color.b)}`
  return withAlpha ? `${base}${h(clamp(color.a, 0, 1) * 255)}` : base
}

export function rgbToHsv({ r, g, b, a }: RGBA): HSVA {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : (d / max) * 100
  return { h: round(h, 2), s: round(s, 2), v: round(max * 100, 2), a }
}

export function hsvToRgb({ h, s, v, a }: HSVA): RGBA {
  const sn = clamp(s, 0, 100) / 100
  const vn = clamp(v, 0, 100) / 100
  const hn = (((h % 360) + 360) % 360) / 60
  const c = vn * sn
  const x = c * (1 - Math.abs((hn % 2) - 1))
  const m = vn - c
  let rgb: [number, number, number]
  if (hn < 1) rgb = [c, x, 0]
  else if (hn < 2) rgb = [x, c, 0]
  else if (hn < 3) rgb = [0, c, x]
  else if (hn < 4) rgb = [0, x, c]
  else if (hn < 5) rgb = [x, 0, c]
  else rgb = [c, 0, x]
  return { r: (rgb[0] + m) * 255, g: (rgb[1] + m) * 255, b: (rgb[2] + m) * 255, a }
}

/** Relative luminance per WCAG, from 0–255 channels. */
export function luminance({ r, g, b }: RGBA): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** WCAG contrast ratio between two opaque colours, 1–21. */
export function contrastRatio(a: RGBA, b: RGBA): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return round((hi + 0.05) / (lo + 0.05), 2)
}
