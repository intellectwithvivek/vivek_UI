/**
 * Property tests over the pure utilities: many random inputs, invariants that must hold
 * for all of them. A seeded generator keeps every run identical, so a failure here is a
 * bug, not weather — and the seed in the message reproduces it.
 */
import jsQR from 'jsqr'
import { describe, expect, it } from 'vitest'
import { hsvToRgb, parseColor, rgbToHsv, toHex } from './color'
import { formatTime } from './format-time'
import { position } from './position'
import { encodeQr } from './qr'

/** Mulberry32: tiny, seedable, good enough to walk an input space. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const SEED = 20260829
const int = (next: () => number, lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1))

describe('fuzz · colour', () => {
  it('every 24-bit colour survives hex -> hsv -> hex', () => {
    const next = rng(SEED)
    for (let i = 0; i < 2000; i += 1) {
      const rgb = { r: int(next, 0, 255), g: int(next, 0, 255), b: int(next, 0, 255), a: 1 }
      const hex = toHex(rgb)
      const back = toHex(hsvToRgb(rgbToHsv(rgb)))
      expect(back, `seed ${SEED} case ${i}: ${hex}`).toBe(hex)
      expect(parseColor(hex), hex).toEqual(rgb)
    }
  })

  it('hsv components stay in range for any colour, and alpha passes straight through', () => {
    const next = rng(SEED + 1)
    for (let i = 0; i < 1000; i += 1) {
      const a = Math.round(next() * 100) / 100
      const hsv = rgbToHsv({ r: int(next, 0, 255), g: int(next, 0, 255), b: int(next, 0, 255), a })
      expect(hsv.h).toBeGreaterThanOrEqual(0)
      expect(hsv.h).toBeLessThan(360)
      expect(hsv.s).toBeGreaterThanOrEqual(0)
      expect(hsv.s).toBeLessThanOrEqual(100)
      expect(hsv.v).toBeGreaterThanOrEqual(0)
      expect(hsv.v).toBeLessThanOrEqual(100)
      expect(hsv.a).toBe(a)
    }
  })

  it('never throws on arbitrary strings, and only ever returns null or a full colour', () => {
    const next = rng(SEED + 2)
    const alphabet = '#0123456789abcdefABCDEFxyz%(),. /rgba-'
    for (let i = 0; i < 2000; i += 1) {
      const length = int(next, 0, 12)
      let text = ''
      for (let j = 0; j < length; j += 1) text += alphabet[int(next, 0, alphabet.length - 1)]
      const parsed = parseColor(text)
      if (parsed !== null) {
        for (const channel of [parsed.r, parsed.g, parsed.b]) {
          expect(channel).toBeGreaterThanOrEqual(0)
          expect(channel).toBeLessThanOrEqual(255)
        }
        expect(parsed.a).toBeGreaterThanOrEqual(0)
        expect(parsed.a).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe('fuzz · formatTime', () => {
  it('is monotonic in whole seconds and always matches the clock shape', () => {
    const next = rng(SEED + 3)
    const shape = /^(\d+:)?\d{1,2}:\d{2}$/
    let previous = -1
    const samples = Array.from({ length: 500 }, () => next() * 100_000).sort((a, b) => a - b)
    for (const seconds of samples) {
      const text = formatTime(seconds)
      expect(text).toMatch(shape)
      const parts = text.split(':').map(Number)
      const total = parts.reduce((sum, part) => sum * 60 + part, 0)
      expect(total).toBeGreaterThanOrEqual(previous)
      expect(total).toBe(Math.floor(seconds))
      previous = total
    }
  })
})

describe('fuzz · position', () => {
  it('keeps the floating box inside the viewport whenever it can fit', () => {
    const next = rng(SEED + 4)
    const sides = ['top', 'bottom', 'left', 'right'] as const
    const aligns = ['start', 'center', 'end'] as const
    for (let i = 0; i < 1500; i += 1) {
      const viewport = { width: int(next, 320, 2000), height: int(next, 480, 1400) }
      const floating = { width: int(next, 20, 400), height: int(next, 20, 400) }
      const trigger = {
        x: int(next, 0, viewport.width - 10),
        y: int(next, 0, viewport.height - 10),
        width: int(next, 1, 200),
        height: int(next, 1, 80),
      }
      const padding = int(next, 0, 16)
      const offset = int(next, 0, 16)
      const result = position({
        trigger,
        floating,
        viewport,
        side: sides[int(next, 0, 3)] as (typeof sides)[number],
        align: aligns[int(next, 0, 2)] as (typeof aligns)[number],
        offset,
        padding,
      })
      const fitsX = floating.width + 2 * padding <= viewport.width
      const fitsY = floating.height + 2 * padding <= viewport.height
      const label = `seed ${SEED + 4} case ${i}`
      expect(Number.isFinite(result.x), label).toBe(true)
      expect(Number.isFinite(result.y), label).toBe(true)
      if (fitsX) {
        expect(result.x, label).toBeGreaterThanOrEqual(padding - 0.001)
        expect(result.x + floating.width, label).toBeLessThanOrEqual(
          viewport.width - padding + 0.001,
        )
      }
      if (fitsY) {
        expect(result.y, label).toBeGreaterThanOrEqual(padding - 0.001)
        expect(result.y + floating.height, label).toBeLessThanOrEqual(
          viewport.height - padding + 0.001,
        )
      }
    }
  })
})

describe('fuzz · QR', () => {
  /** Rasterise and decode, as in qr.test.ts. */
  function decode(text: string, level: 'L' | 'M' | 'Q' | 'H'): string | null {
    const m = encodeQr(text, level)
    const scale = m.size > 100 ? 2 : 4
    const quiet = 4
    const side = (m.size + quiet * 2) * scale
    const data = new Uint8ClampedArray(side * side * 4).fill(255)
    for (let y = 0; y < m.size; y += 1) {
      for (let x = 0; x < m.size; x += 1) {
        if (!m.modules[y]?.[x]) continue
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

  it('random ASCII payloads of every length up to 300 bytes decode back exactly', () => {
    const next = rng(SEED + 5)
    const alphabet =
      ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
    const levels = ['L', 'M', 'Q', 'H'] as const
    for (let i = 0; i < 40; i += 1) {
      const length = int(next, 1, 300)
      let text = ''
      for (let j = 0; j < length; j += 1) text += alphabet[int(next, 0, alphabet.length - 1)]
      const level = levels[int(next, 0, 3)] as (typeof levels)[number]
      expect(decode(text, level), `seed ${SEED + 5} case ${i} (${length} bytes, ${level})`).toBe(
        text,
      )
    }
  })

  it('multi-byte payloads decode back exactly', () => {
    const next = rng(SEED + 6)
    const words = [
      'नमस्ते',
      'दुनिया',
      '東京',
      'Zürich',
      'São Paulo',
      'Кыргызстан',
      '🌍',
      '✓',
      'العربية',
    ]
    for (let i = 0; i < 20; i += 1) {
      const count = int(next, 1, 12)
      const text = Array.from({ length: count }, () => words[int(next, 0, words.length - 1)]).join(
        ' ',
      )
      expect(decode(text, 'M'), `seed ${SEED + 6} case ${i}`).toBe(text)
    }
  })
})
