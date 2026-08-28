import { describe, expect, it } from 'vitest'
import { contrastRatio, hsvToRgb, parseColor, rgbToHsv, toHex } from './color'

describe('parseColor', () => {
  it('reads every hex length, with or without the hash', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(parseColor('#00f8')).toEqual({ r: 0, g: 0, b: 255, a: 136 / 255 })
    expect(parseColor('#3b82f6')).toEqual({ r: 59, g: 130, b: 246, a: 1 })
    expect(parseColor('#3b82f680')).toEqual({ r: 59, g: 130, b: 246, a: 128 / 255 })
    expect(parseColor(' #3B82F6 ')).toEqual({ r: 59, g: 130, b: 246, a: 1 })
  })

  it('reads rgb() and rgba(), legacy commas and modern slashes, numbers and percentages', () => {
    expect(parseColor('rgb(59, 130, 246)')).toEqual({ r: 59, g: 130, b: 246, a: 1 })
    expect(parseColor('rgba(59 130 246 / 0.5)')).toEqual({ r: 59, g: 130, b: 246, a: 0.5 })
    expect(parseColor('rgb(100%, 0%, 50%)')).toEqual({ r: 255, g: 0, b: 127.5, a: 1 })
    expect(parseColor('rgb(300, -5, 0)')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
  })

  it('returns null rather than guessing', () => {
    for (const bad of ['', '#ggg', '#12345', 'blue', 'rgb(1,2)', 'rgb(a,b,c)', 'hsl(1 2% 3%)']) {
      expect(parseColor(bad)).toBeNull()
    }
  })
})

describe('toHex', () => {
  it('formats lower-case hashed hex, with alpha only on request', () => {
    expect(toHex({ r: 59, g: 130, b: 246, a: 1 })).toBe('#3b82f6')
    expect(toHex({ r: 59, g: 130, b: 246, a: 0.5 })).toBe('#3b82f6')
    expect(toHex({ r: 59, g: 130, b: 246, a: 0.5 }, true)).toBe('#3b82f680')
    expect(toHex({ r: 300, g: -1, b: 12.6, a: 2 }, true)).toBe('#ff000dff')
  })
})

describe('HSV round trips', () => {
  it('converts the primaries and greys', () => {
    expect(rgbToHsv({ r: 255, g: 0, b: 0, a: 1 })).toEqual({ h: 0, s: 100, v: 100, a: 1 })
    expect(rgbToHsv({ r: 0, g: 255, b: 0, a: 1 })).toEqual({ h: 120, s: 100, v: 100, a: 1 })
    expect(rgbToHsv({ r: 0, g: 0, b: 255, a: 1 })).toEqual({ h: 240, s: 100, v: 100, a: 1 })
    expect(rgbToHsv({ r: 128, g: 128, b: 128, a: 1 })).toEqual({ h: 0, s: 0, v: 50.2, a: 1 })
    expect(rgbToHsv({ r: 0, g: 0, b: 0, a: 1 })).toEqual({ h: 0, s: 0, v: 0, a: 1 })
  })

  it('hsv -> rgb -> hex matches known colours and survives a round trip', () => {
    expect(toHex(hsvToRgb({ h: 120, s: 100, v: 50, a: 1 }))).toBe('#008000')
    for (const hex of [
      '#3b82f6',
      '#ef4444',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#111827',
      '#f9fafb',
    ]) {
      const rgb = parseColor(hex) as NonNullable<ReturnType<typeof parseColor>>
      expect(toHex(hsvToRgb(rgbToHsv(rgb)))).toBe(hex)
    }
  })

  it('wraps hue', () => {
    expect(toHex(hsvToRgb({ h: 360, s: 100, v: 100, a: 1 }))).toBe('#ff0000')
    expect(toHex(hsvToRgb({ h: -120, s: 100, v: 100, a: 1 }))).toBe('#0000ff')
  })
})

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for a colour on itself', () => {
    const black = { r: 0, g: 0, b: 0, a: 1 }
    const white = { r: 255, g: 255, b: 255, a: 1 }
    expect(contrastRatio(black, white)).toBe(21)
    expect(contrastRatio(white, black)).toBe(21)
    expect(contrastRatio(white, white)).toBe(1)
    expect(contrastRatio({ r: 59, g: 130, b: 246, a: 1 }, white)).toBeCloseTo(3.68, 1)
  })
})
