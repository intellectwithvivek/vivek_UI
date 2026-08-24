/**
 * Generate every icon the site serves from one source logo.
 *
 * Input:  `public/branding/vivek-ui-logo.png`
 * Output: `favicon.ico`, `favicon-96x96.png`, `apple-touch-icon.png`,
 *         `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png`
 *
 * Written from scratch rather than with `sharp` because this package has no dependencies and
 * the docs app should not grow a 30 MB native binary to resize one logo five times. The
 * source is 8-bit RGB, non-interlaced, no palette — the one PNG shape this handles, and it
 * refuses anything else rather than emitting a corrupt file.
 *
 * Run with `--check` in CI: it regenerates into memory and compares, so a logo swapped
 * without regenerating fails the build instead of shipping a stale favicon.
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync, inflateSync } from 'node:zlib'

const HERE = dirname(fileURLToPath(import.meta.url))
const BRANDING = resolve(HERE, '..', 'public', 'branding')
const SOURCE = join(BRANDING, 'vivek-ui-logo.png')

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/* -------------------------------------------------------------------------- CRC32 */

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/* ------------------------------------------------------------------------- decode */

/** Decode an 8-bit RGB non-interlaced PNG into `{ width, height, pixels }` (RGB triples). */
function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(SIGNATURE)) throw new Error('not a PNG')

  const width = buffer.readUInt32BE(16)
  const height = buffer.readUInt32BE(20)
  const [bitDepth, colourType, , , interlace] = [
    buffer[24],
    buffer[25],
    buffer[26],
    buffer[27],
    buffer[28],
  ]

  // Narrow on purpose. Silently mishandling a palette or an alpha channel would produce a
  // plausible-looking icon with the wrong colours.
  if (bitDepth !== 8) throw new Error(`bit depth ${bitDepth} unsupported — need 8`)
  if (colourType !== 2 && colourType !== 6) {
    throw new Error(`colour type ${colourType} unsupported — need 2 (RGB) or 6 (RGBA)`)
  }
  if (interlace !== 0) throw new Error('interlaced PNGs unsupported')

  const channels = colourType === 6 ? 4 : 3

  const idat = []
  let offset = 8
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii')
    if (type === 'IDAT') idat.push(buffer.subarray(offset + 8, offset + 8 + length))
    offset += 12 + length
  }

  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const pixels = Buffer.alloc(height * stride)

  // Undo the per-scanline filters. Each row is prefixed with its filter type byte.
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride)
    const out = pixels.subarray(y * stride, (y + 1) * stride)
    const previous = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null

    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[x - channels] : 0
      const b = previous ? previous[x] : 0
      const c = previous && x >= channels ? previous[x - channels] : 0
      let value = line[x]

      if (filter === 1) value += a
      else if (filter === 2) value += b
      else if (filter === 3) value += (a + b) >> 1
      else if (filter === 4) {
        // Paeth: pick whichever neighbour the gradient predicts best.
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      } else if (filter !== 0) {
        throw new Error(`unknown PNG filter ${filter} on row ${y}`)
      }
      out[x] = value & 0xff
    }
  }

  // Normalise to RGB. The alpha channel is composited onto white rather than dropped: an
  // icon with a hole in it is what you get if you just discard it.
  if (channels === 4) {
    const rgb = Buffer.alloc(width * height * 3)
    for (let i = 0, j = 0; i < pixels.length; i += 4, j += 3) {
      const alpha = pixels[i + 3] / 255
      rgb[j] = Math.round(pixels[i] * alpha + 255 * (1 - alpha))
      rgb[j + 1] = Math.round(pixels[i + 1] * alpha + 255 * (1 - alpha))
      rgb[j + 2] = Math.round(pixels[i + 2] * alpha + 255 * (1 - alpha))
    }
    return { width, height, pixels: rgb }
  }

  return { width, height, pixels }
}

/* ------------------------------------------------------------------------- resize */

/**
 * Resize RGB pixels.
 *
 * Downscaling averages the whole source rectangle each destination pixel covers — a plain
 * nearest-neighbour sample of a 300px logo at 32px throws away 98% of the image and turns a
 * smooth gradient into a stipple. Upscaling interpolates instead, since there is no area to
 * average over.
 */
function resize(image, size) {
  const { width, height, pixels } = image
  const out = Buffer.alloc(size * size * 3)
  const scaleX = width / size
  const scaleY = height / size
  const downscaling = scaleX >= 1 && scaleY >= 1

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const target = (y * size + x) * 3

      if (downscaling) {
        const x0 = Math.floor(x * scaleX)
        const x1 = Math.min(Math.ceil((x + 1) * scaleX), width)
        const y0 = Math.floor(y * scaleY)
        const y1 = Math.min(Math.ceil((y + 1) * scaleY), height)
        let r = 0
        let g = 0
        let b = 0
        let n = 0
        for (let sy = y0; sy < y1; sy++) {
          for (let sx = x0; sx < x1; sx++) {
            const source = (sy * width + sx) * 3
            r += pixels[source]
            g += pixels[source + 1]
            b += pixels[source + 2]
            n++
          }
        }
        out[target] = Math.round(r / n)
        out[target + 1] = Math.round(g / n)
        out[target + 2] = Math.round(b / n)
        continue
      }

      // Bilinear.
      const fx = Math.min((x + 0.5) * scaleX - 0.5, width - 1)
      const fy = Math.min((y + 0.5) * scaleY - 0.5, height - 1)
      const x0 = Math.max(Math.floor(fx), 0)
      const y0 = Math.max(Math.floor(fy), 0)
      const x1 = Math.min(x0 + 1, width - 1)
      const y1 = Math.min(y0 + 1, height - 1)
      const tx = fx - x0
      const ty = fy - y0

      for (let channel = 0; channel < 3; channel++) {
        const p00 = pixels[(y0 * width + x0) * 3 + channel]
        const p10 = pixels[(y0 * width + x1) * 3 + channel]
        const p01 = pixels[(y1 * width + x0) * 3 + channel]
        const p11 = pixels[(y1 * width + x1) * 3 + channel]
        const top = p00 + (p10 - p00) * tx
        const bottom = p01 + (p11 - p01) * tx
        out[target + channel] = Math.round(top + (bottom - top) * ty)
      }
    }
  }

  return { width: size, height: size, pixels: out }
}

/* ------------------------------------------------------------------------- encode */

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function encodePng({ width, height, pixels }) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // colour type: RGB
  ihdr[10] = 0 // deflate
  ihdr[11] = 0 // adaptive filtering
  ihdr[12] = 0 // no interlace

  // Filter 0 (None) on every row. Filtering would shave a few hundred bytes off files that
  // are already tiny, at the cost of a heuristic worth arguing about.
  const stride = width * 3
  const raw = Buffer.alloc(height * (stride + 1))
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/**
 * A multi-size .ico holding PNG payloads.
 *
 * Every browser still in use reads PNG-in-ICO (Vista onwards), which avoids hand-rolling the
 * BMP encoding the old format wanted. Three sizes because Windows picks per context and
 * downscaling a 48px icon to 16px in the taskbar looks worse than a 16px one drawn for it.
 */
function encodeIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // 1 = icon
  header.writeUInt16LE(images.length, 4)

  const directory = Buffer.alloc(16 * images.length)
  let offset = header.length + directory.length

  images.forEach((png, index) => {
    const at = index * 16
    // 0 means 256 in this field; none of our sizes reach it.
    directory[at] = png.size >= 256 ? 0 : png.size
    directory[at + 1] = png.size >= 256 ? 0 : png.size
    directory[at + 2] = 0 // palette size
    directory[at + 3] = 0 // reserved
    directory.writeUInt16LE(1, at + 4) // colour planes
    directory.writeUInt16LE(32, at + 6) // bits per pixel
    directory.writeUInt32BE(0, at + 8)
    directory.writeUInt32LE(png.data.length, at + 8)
    directory.writeUInt32LE(offset, at + 12)
    offset += png.data.length
  })

  return Buffer.concat([header, directory, ...images.map((image) => image.data)])
}

/* --------------------------------------------------------------------------- main */

const OUTPUTS = [
  { file: 'favicon-96x96.png', size: 96 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'web-app-manifest-192x192.png', size: 192 },
  { file: 'web-app-manifest-512x512.png', size: 512 },
]

const ICO_SIZES = [16, 32, 48]

const check = process.argv.includes('--check')
const source = decodePng(readFileSync(SOURCE))

if (source.width !== source.height) {
  console.error(
    `gen-favicons: the logo is ${source.width}x${source.height}. Icons are square, and a ` +
      'non-square source would be squashed. Pad it to a square first.',
  )
  process.exit(1)
}

const generated = new Map()
for (const { file, size } of OUTPUTS) {
  generated.set(file, encodePng(resize(source, size)))
}
generated.set(
  'favicon.ico',
  encodeIco(ICO_SIZES.map((size) => ({ size, data: encodePng(resize(source, size)) }))),
)

const digest = (buffer) => createHash('sha256').update(buffer).digest('hex').slice(0, 12)

if (check) {
  const stale = []
  for (const [file, data] of generated) {
    let current = null
    try {
      current = readFileSync(join(BRANDING, file))
    } catch {
      stale.push(`${file} (missing)`)
      continue
    }
    if (!current.equals(data)) stale.push(`${file} (${digest(current)} != ${digest(data)})`)
  }
  if (stale.length > 0) {
    console.error(
      `gen-favicons: these do not match the logo — run \`pnpm gen:favicons\`:\n  ${stale.join('\n  ')}`,
    )
    process.exit(1)
  }
  console.log(`gen-favicons: OK — ${generated.size} icons match ${source.width}px source.`)
} else {
  for (const [file, data] of generated) {
    writeFileSync(join(BRANDING, file), data)
    console.log(`  ${file.padEnd(32)} ${(data.length / 1024).toFixed(1)} kB`)
  }
  if (source.width < 512) {
    console.log(
      `\n  note: the source is ${source.width}px, so the 512px manifest icon is upscaled.\n` +
        '  A 512px or larger original would be sharper on a PWA install screen.',
    )
  }
}
