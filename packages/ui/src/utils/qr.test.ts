/**
 * The QR encoder, checked the only way that counts: a real decoder reads the text back.
 * jsQR is a dev dependency of the tests alone; the library ships no dependency.
 */
import jsQR from 'jsqr'
import { describe, expect, it } from 'vitest'
import { encodeQr, type QrLevel, qrCapacityBytes } from './qr'

/** Rasterise a matrix the way a camera would see it: scaled, with a quiet zone. */
function decode(matrix: ReturnType<typeof encodeQr>, scale = 4, quiet = 4): string | null {
  const side = (matrix.size + quiet * 2) * scale
  const data = new Uint8ClampedArray(side * side * 4).fill(255)
  for (let y = 0; y < matrix.size; y += 1) {
    for (let x = 0; x < matrix.size; x += 1) {
      if (!matrix.modules[y]?.[x]) continue
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const px = ((y + quiet) * scale + dy) * side + (x + quiet) * scale + dx
          data[px * 4] = 0
          data[px * 4 + 1] = 0
          data[px * 4 + 2] = 0
        }
      }
    }
  }
  return jsQR(data, side, side)?.data ?? null
}

describe('encodeQr · decodes with a real reader', () => {
  it.each<QrLevel>(['L', 'M', 'Q', 'H'])('short text at level %s, no boost', (level) => {
    const m = encodeQr('https://vivek-ui.dev', level, { boostLevel: false })
    expect(m.level).toBe(level)
    expect(m.size).toBe(17 + 4 * m.version)
    expect(decode(m)).toBe('https://vivek-ui.dev')
  })

  it('a medium payload spans versions with 8-bit counts (v < 10)', () => {
    const text = 'The quick brown fox jumps over the lazy dog. '.repeat(3) // 135 bytes
    const m = encodeQr(text, 'M')
    expect(m.version).toBeGreaterThanOrEqual(5)
    expect(m.version).toBeLessThan(10)
    expect(decode(m)).toBe(text)
  })

  it('a long payload uses 16-bit counts and alignment grids (v >= 10)', () => {
    const text = 'vivek-ui:'.padEnd(700, 'abcdefghij0123456789')
    const m = encodeQr(text, 'L')
    expect(m.version).toBeGreaterThanOrEqual(10)
    expect(decode(m)).toBe(text)
  })

  it('a payload needing version info bits (v >= 7) at level H', () => {
    const text = 'x'.repeat(200)
    const m = encodeQr(text, 'H')
    expect(m.version).toBeGreaterThanOrEqual(7)
    expect(decode(m)).toBe(text)
  })

  it('UTF-8 round-trips: Devanagari and an emoji', () => {
    const text = 'नमस्ते दुनिया 🌍'
    expect(decode(encodeQr(text, 'M'))).toBe(text)
  })

  it('the empty string is a valid version-1 code', () => {
    const m = encodeQr('')
    expect(m.version).toBe(1)
    expect(decode(m)).toBe('')
  })

  it('fills version 40 at level L to the byte and refuses one more', () => {
    const max = qrCapacityBytes(40, 'L')
    expect(max).toBe(2953)
    const text = 'a'.repeat(max)
    const m = encodeQr(text, 'L')
    expect(m.version).toBe(40)
    expect(m.level).toBe('L')
    expect(decode(m, 2, 4)).toBe(text)
    expect(() => encodeQr('a'.repeat(max + 1), 'L')).toThrow(RangeError)
  })
})

describe('encodeQr · options', () => {
  it('boosts the level when the chosen version has room, and reports it', () => {
    const boosted = encodeQr('hi', 'L')
    expect(boosted.version).toBe(1)
    expect(boosted.level).toBe('H')
    expect(decode(boosted)).toBe('hi')
    expect(encodeQr('hi', 'L', { boostLevel: false }).level).toBe('L')
  })

  it('respects minVersion / maxVersion and rejects an impossible range', () => {
    expect(encodeQr('hi', 'M', { minVersion: 5 }).version).toBe(5)
    expect(() => encodeQr('x'.repeat(100), 'H', { maxVersion: 3 })).toThrow(RangeError)
    expect(() => encodeQr('x', 'M', { minVersion: 0 })).toThrow(RangeError)
  })

  it('is deterministic', () => {
    const a = encodeQr('same input', 'Q')
    const b = encodeQr('same input', 'Q')
    expect(a.modules).toEqual(b.modules)
  })
})

describe('encodeQr · structure', () => {
  it('has the three finder patterns and a dark module beside the bottom-left finder', () => {
    const m = encodeQr('structure', 'M')
    const s = m.size
    const at = (x: number, y: number) => m.modules[y]?.[x]
    for (const [cx, cy] of [
      [3, 3],
      [s - 4, 3],
      [3, s - 4],
    ] as const) {
      expect(at(cx, cy)).toBe(true) // centre
      expect(at(cx - 2, cy - 2)).toBe(false) // inner ring is light
      expect(at(cx - 3, cy - 3)).toBe(true) // outer ring is dark
    }
    expect(at(8, s - 8)).toBe(true)
  })

  it('capacity is monotonic in version and decreasing in level for every version', () => {
    const levels: QrLevel[] = ['L', 'M', 'Q', 'H']
    for (let v = 1; v <= 40; v += 1) {
      for (let i = 1; i < levels.length; i += 1) {
        const lo = levels[i - 1] as QrLevel
        const hi = levels[i] as QrLevel
        expect(qrCapacityBytes(v, hi)).toBeLessThan(qrCapacityBytes(v, lo))
      }
      if (v > 1) expect(qrCapacityBytes(v, 'M')).toBeGreaterThan(qrCapacityBytes(v - 1, 'M'))
    }
    expect(qrCapacityBytes(1, 'L')).toBe(17)
    expect(qrCapacityBytes(1, 'H')).toBe(7)
  })
})
