import { deflateSync } from 'node:zlib'

/**
 * A PNG of the same gradient `placeholderSvg` draws, written by hand with `node:zlib`.
 *
 * Why a raster form exists at all: **Safari ignores an SVG `poster` on a `<video>`** — and
 * worse, the document's `load` event never fires, so the page sits in `interactive`
 * forever. The browser suite caught it the first time it ran in WebKit. A video poster has
 * to be a raster image, so the docs serve one.
 *
 * No dependency: zlib is in Node, and a PNG is four chunks with CRC32s. The image is small
 * (a gradient at 640×360 compresses to a few kB) and generated at build time.
 */

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buffer: Buffer): number {
  let c = -1
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff]! ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

/** Deterministic hash, matching `placeholder-image.ts` so a seed yields the same hues. */
function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** HSL → RGB, 0–255 per channel. */
function hsl(h: number, s: number, l: number): [number, number, number] {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return Math.round(255 * (l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
  }
  return [f(0), f(8), f(4)]
}

const PALETTES: Array<[number, number]> = [
  [212, 265],
  [150, 190],
  [18, 45],
  [195, 225],
  [280, 320],
  [210, 240],
]

export interface PlaceholderPngOptions {
  seed: string
  width?: number
  height?: number
}

/** The gradient as a PNG buffer. */
export function placeholderPng({ seed, width = 640, height = 360 }: PlaceholderPngOptions): Buffer {
  const h = hash(seed)
  const [h1, h2] = PALETTES[h % PALETTES.length] ?? [212, 265]
  const from = hsl(h1 as number, 62, 58)
  const to = hsl(h2 as number, 58, 38)

  // One filter byte (0 = none) then RGB triples, per row. A diagonal ramp so it reads as
  // the same picture as the SVG rather than a flat band.
  const raw = Buffer.alloc(height * (1 + width * 3))
  let at = 0
  for (let y = 0; y < height; y++) {
    raw[at++] = 0
    for (let x = 0; x < width; x++) {
      const t = (x / width) * 0.65 + (y / height) * 0.35
      for (let c = 0; c < 3; c++) {
        raw[at++] = Math.round((from[c] as number) + ((to[c] as number) - (from[c] as number)) * t)
      }
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // colour type: truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}
