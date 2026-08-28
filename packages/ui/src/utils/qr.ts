/**
 * QR code encoder — ISO/IEC 18004, byte mode, versions 1–40, all four error-correction
 * levels, automatic version selection and mask choice by penalty score.
 *
 * Written in-house so `QRCode` costs the consumer no dependency. Text is encoded as UTF-8
 * bytes in byte mode, which every scanner reads back as UTF-8; the alphanumeric and numeric
 * modes would save a few modules on a subset of inputs and are not worth the surface.
 *
 * The output is a matrix of booleans (`true` = dark). Rendering is the component's job.
 */

export type QrLevel = 'L' | 'M' | 'Q' | 'H'

export interface QrMatrix {
  /** Modules per side, `17 + 4 × version`. */
  size: number
  version: number
  level: QrLevel
  /** `modules[y][x]`, `true` for a dark module. */
  modules: boolean[][]
}

export interface QrOptions {
  /** Lowest version to consider. Default `1`. */
  minVersion?: number
  /** Highest version to consider. Default `40`. */
  maxVersion?: number
  /**
   * Once the smallest fitting version is chosen, raise the error-correction level as far
   * as still fits in that version. Free robustness. Default `true`.
   */
  boostLevel?: boolean
}

const LEVELS: QrLevel[] = ['L', 'M', 'Q', 'H']
const FORMAT_BITS: Record<QrLevel, number> = { L: 1, M: 0, Q: 3, H: 2 }

// Index = version (0 unused). From the specification's Table 9.
const ECC_CODEWORDS_PER_BLOCK: Record<QrLevel, number[]> = {
  L: [
    -1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30,
    30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
  M: [
    -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
  ],
  Q: [
    -1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30,
    30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
  H: [
    -1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
}
const NUM_ECC_BLOCKS: Record<QrLevel, number[]> = {
  L: [
    -1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14,
    15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
  ],
  M: [
    -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23,
    25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
  ],
  Q: [
    -1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34,
    34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68,
  ],
  H: [
    -1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35,
    37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81,
  ],
}

/* ------------------------------------------------------------------ capacity */

/** Modules available for data + ECC after every function pattern is placed. */
function rawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2
    result -= (25 * numAlign - 10) * numAlign - 55
    if (version >= 7) result -= 36
  }
  return result
}

function dataCodewords(version: number, level: QrLevel): number {
  const ecc = ECC_CODEWORDS_PER_BLOCK[level][version] ?? 0
  const blocks = NUM_ECC_BLOCKS[level][version] ?? 0
  return Math.floor(rawDataModules(version) / 8) - ecc * blocks
}

function charCountBits(version: number): number {
  return version < 10 ? 8 : 16
}

/** Bits needed to encode `byteLength` bytes in byte mode at `version`. */
function encodedBits(byteLength: number, version: number): number {
  return 4 + charCountBits(version) + 8 * byteLength
}

/** The most bytes a version/level holds in byte mode. */
export function qrCapacityBytes(version: number, level: QrLevel): number {
  return Math.floor((dataCodewords(version, level) * 8 - 4 - charCountBits(version)) / 8)
}

/* -------------------------------------------------------------- reed–solomon */

function gfMultiply(x: number, y: number): number {
  let z = 0
  for (let i = 7; i >= 0; i -= 1) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((y >>> i) & 1) * x
  }
  return z
}

function rsDivisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0)
  result[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < degree; j += 1) {
      result[j] = gfMultiply(result[j] ?? 0, root)
      if (j + 1 < degree) result[j] = (result[j] ?? 0) ^ (result[j + 1] ?? 0)
    }
    root = gfMultiply(root, 0x02)
  }
  return result
}

function rsRemainder(data: number[], divisor: number[]): number[] {
  const result = new Array<number>(divisor.length).fill(0)
  for (const b of data) {
    const factor = b ^ (result.shift() ?? 0)
    result.push(0)
    for (let i = 0; i < divisor.length; i += 1) {
      result[i] = (result[i] ?? 0) ^ gfMultiply(divisor[i] ?? 0, factor)
    }
  }
  return result
}

function interleave(data: number[], version: number, level: QrLevel): number[] {
  const numBlocks = NUM_ECC_BLOCKS[level][version] ?? 1
  const eccLen = ECC_CODEWORDS_PER_BLOCK[level][version] ?? 0
  const rawCodewords = Math.floor(rawDataModules(version) / 8)
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks)
  const shortBlockLen = Math.floor(rawCodewords / numBlocks)

  const blocks: number[][] = []
  const divisor = rsDivisor(eccLen)
  let k = 0
  for (let i = 0; i < numBlocks; i += 1) {
    const datLen = shortBlockLen - eccLen + (i < numShortBlocks ? 0 : 1)
    const dat = data.slice(k, k + datLen)
    k += datLen
    const ecc = rsRemainder(dat, divisor)
    if (i < numShortBlocks) dat.push(0) // placeholder, skipped on read-out
    blocks.push(dat.concat(ecc))
  }

  const result: number[] = []
  const blockLen = blocks[0]?.length ?? 0
  for (let i = 0; i < blockLen; i += 1) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - eccLen || j >= numShortBlocks) result.push(block[i] ?? 0)
    })
  }
  return result
}

/* ------------------------------------------------------------------- matrix */

class Matrix {
  readonly size: number
  readonly modules: boolean[][]
  readonly isFunction: boolean[][]

  constructor(size: number) {
    this.size = size
    this.modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
    this.isFunction = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  }

  setFunction(x: number, y: number, dark: boolean) {
    const row = this.modules[y]
    const fnRow = this.isFunction[y]
    if (row && fnRow && x >= 0 && x < this.size && y >= 0 && y < this.size) {
      row[x] = dark
      fnRow[x] = true
    }
  }

  get(x: number, y: number): boolean {
    return this.modules[y]?.[x] ?? false
  }
}

function alignmentPositions(version: number): number[] {
  if (version === 1) return []
  const size = version * 4 + 17
  const numAlign = Math.floor(version / 7) + 2
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2
  const result = [6]
  for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos)
  return result
}

function drawFinder(m: Matrix, x: number, y: number) {
  for (let dy = -4; dy <= 4; dy += 1) {
    for (let dx = -4; dx <= 4; dx += 1) {
      const dist = Math.max(Math.abs(dx), Math.abs(dy))
      m.setFunction(x + dx, y + dy, dist !== 2 && dist !== 4)
    }
  }
}

function drawAlignment(m: Matrix, x: number, y: number) {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      m.setFunction(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
    }
  }
}

function drawFormatBits(m: Matrix, level: QrLevel, mask: number) {
  const data = (FORMAT_BITS[level] << 3) | mask
  let rem = data
  for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
  const bits = ((data << 10) | rem) ^ 0x5412
  const bit = (i: number) => ((bits >>> i) & 1) !== 0
  const s = m.size

  for (let i = 0; i <= 5; i += 1) m.setFunction(8, i, bit(i))
  m.setFunction(8, 7, bit(6))
  m.setFunction(8, 8, bit(7))
  m.setFunction(7, 8, bit(8))
  for (let i = 9; i < 15; i += 1) m.setFunction(14 - i, 8, bit(i))

  for (let i = 0; i < 8; i += 1) m.setFunction(s - 1 - i, 8, bit(i))
  for (let i = 8; i < 15; i += 1) m.setFunction(8, s - 15 + i, bit(i))
  m.setFunction(8, s - 8, true)
}

function drawVersion(m: Matrix, version: number) {
  if (version < 7) return
  let rem = version
  for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
  const bits = (version << 12) | rem
  const s = m.size
  for (let i = 0; i < 18; i += 1) {
    const dark = ((bits >>> i) & 1) !== 0
    const a = s - 11 + (i % 3)
    const b = Math.floor(i / 3)
    m.setFunction(a, b, dark)
    m.setFunction(b, a, dark)
  }
}

function drawFunctionPatterns(m: Matrix, version: number, level: QrLevel) {
  const s = m.size
  for (let i = 0; i < s; i += 1) {
    m.setFunction(6, i, i % 2 === 0)
    m.setFunction(i, 6, i % 2 === 0)
  }
  drawFinder(m, 3, 3)
  drawFinder(m, s - 4, 3)
  drawFinder(m, 3, s - 4)

  const align = alignmentPositions(version)
  const n = align.length
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      // Skip the three corners occupied by finders.
      if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue
      drawAlignment(m, align[i] ?? 0, align[j] ?? 0)
    }
  }
  drawFormatBits(m, level, 0) // reserves the area; rewritten with the chosen mask later
  drawVersion(m, version)
}

function drawCodewords(m: Matrix, data: number[]) {
  const s = m.size
  let i = 0
  for (let right = s - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let vert = 0; vert < s; vert += 1) {
      for (let j = 0; j < 2; j += 1) {
        const x = right - j
        const upward = ((right + 1) & 2) === 0
        const y = upward ? s - 1 - vert : vert
        const row = m.modules[y]
        if (row && !m.isFunction[y]?.[x] && i < data.length * 8) {
          row[x] = (((data[i >>> 3] ?? 0) >>> (7 - (i & 7))) & 1) !== 0
          i += 1
        }
      }
    }
  }
}

function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0
    case 1:
      return y % 2 === 0
    case 2:
      return x % 3 === 0
    case 3:
      return (x + y) % 3 === 0
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0
    default:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
  }
}

function applyMask(m: Matrix, mask: number) {
  for (let y = 0; y < m.size; y += 1) {
    const row = m.modules[y]
    const fnRow = m.isFunction[y]
    if (!row || !fnRow) continue
    for (let x = 0; x < m.size; x += 1) {
      if (!fnRow[x] && maskBit(mask, x, y)) row[x] = !row[x]
    }
  }
}

const PENALTY_N1 = 3
const PENALTY_N2 = 3
const PENALTY_N3 = 40
const PENALTY_N4 = 10

/** Finder-like 1:1:3:1:1 runs with a 4-module light border, in one direction. */
function finderPenaltyCount(history: number[], size: number): number {
  const n = history[1] ?? 0
  const core =
    n > 0 && history[2] === n && history[3] === n * 3 && history[4] === n && history[5] === n
  const front = core && (history[0] ?? 0) >= n * 4 && (history[6] ?? 0) >= n
  const back = core && (history[6] ?? 0) >= n * 4 && (history[0] ?? 0) >= n
  void size
  return (front ? 1 : 0) + (back ? 1 : 0)
}

function finderPenaltyTerminate(dark: boolean, run: number, history: number[], size: number) {
  let currentRun = run
  if (dark) {
    history.unshift(currentRun)
    history.pop()
    currentRun = 0
  }
  currentRun += size // light border padding
  history.unshift(currentRun)
  history.pop()
  return finderPenaltyCount(history, size)
}

function penaltyScore(m: Matrix): number {
  const s = m.size
  let result = 0

  for (let y = 0; y < s; y += 1) {
    let runColor = false
    let runX = 0
    const history = [0, 0, 0, 0, 0, 0, 0]
    for (let x = 0; x < s; x += 1) {
      if (m.get(x, y) === runColor) {
        runX += 1
        if (runX === 5) result += PENALTY_N1
        else if (runX > 5) result += 1
      } else {
        history.unshift(runX)
        history.pop()
        if (!runColor) result += finderPenaltyCount(history, s) * PENALTY_N3
        runColor = m.get(x, y)
        runX = 1
      }
    }
    result += finderPenaltyTerminate(runColor, runX, history, s) * PENALTY_N3
  }

  for (let x = 0; x < s; x += 1) {
    let runColor = false
    let runY = 0
    const history = [0, 0, 0, 0, 0, 0, 0]
    for (let y = 0; y < s; y += 1) {
      if (m.get(x, y) === runColor) {
        runY += 1
        if (runY === 5) result += PENALTY_N1
        else if (runY > 5) result += 1
      } else {
        history.unshift(runY)
        history.pop()
        if (!runColor) result += finderPenaltyCount(history, s) * PENALTY_N3
        runColor = m.get(x, y)
        runY = 1
      }
    }
    result += finderPenaltyTerminate(runColor, runY, history, s) * PENALTY_N3
  }

  for (let y = 0; y < s - 1; y += 1) {
    for (let x = 0; x < s - 1; x += 1) {
      const c = m.get(x, y)
      if (c === m.get(x + 1, y) && c === m.get(x, y + 1) && c === m.get(x + 1, y + 1)) {
        result += PENALTY_N2
      }
    }
  }

  let dark = 0
  for (const row of m.modules) for (const cell of row) if (cell) dark += 1
  const total = s * s
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1
  result += k * PENALTY_N4
  return result
}

/* ------------------------------------------------------------------- encode */

function utf8Bytes(text: string): number[] {
  if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(text))
  const out: number[] = []
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0
    if (cp < 0x80) out.push(cp)
    else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f))
    else if (cp < 0x10000)
      out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f))
    else
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      )
  }
  return out
}

function appendBits(bits: number[], value: number, length: number) {
  for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1)
}

/**
 * Encode `text` as a QR code. Throws a `RangeError` if it does not fit in `maxVersion` at
 * `level` (2,953 bytes at version 40, level L).
 */
export function encodeQr(text: string, level: QrLevel = 'M', options: QrOptions = {}): QrMatrix {
  const { minVersion = 1, maxVersion = 40, boostLevel = true } = options
  if (minVersion < 1 || maxVersion > 40 || minVersion > maxVersion) {
    throw new RangeError('QR version range must lie within 1–40.')
  }
  const bytes = utf8Bytes(text)

  let version = minVersion
  for (;;) {
    if (encodedBits(bytes.length, version) <= dataCodewords(version, level) * 8) break
    if (version >= maxVersion) {
      throw new RangeError(
        `Text of ${bytes.length} bytes does not fit a QR code at level ${level} (max version ${maxVersion}).`,
      )
    }
    version += 1
  }

  let chosen: QrLevel = level
  if (boostLevel) {
    for (const candidate of LEVELS) {
      if (
        LEVELS.indexOf(candidate) > LEVELS.indexOf(chosen) &&
        encodedBits(bytes.length, version) <= dataCodewords(version, candidate) * 8
      ) {
        chosen = candidate
      }
    }
  }

  // Bit stream: mode, count, data, terminator, byte padding, pad codewords.
  const bits: number[] = []
  appendBits(bits, 0b0100, 4)
  appendBits(bits, bytes.length, charCountBits(version))
  for (const b of bytes) appendBits(bits, b, 8)
  const capacity = dataCodewords(version, chosen) * 8
  appendBits(bits, 0, Math.min(4, capacity - bits.length))
  appendBits(bits, 0, (8 - (bits.length % 8)) % 8)
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) appendBits(bits, pad, 8)

  const data: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | (bits[i + j] ?? 0)
    data.push(byte)
  }

  const size = version * 4 + 17
  const m = new Matrix(size)
  drawFunctionPatterns(m, version, chosen)
  drawCodewords(m, interleave(data, version, chosen))

  // Choose the mask with the lowest penalty.
  let bestMask = 0
  let bestScore = Number.POSITIVE_INFINITY
  for (let mask = 0; mask < 8; mask += 1) {
    applyMask(m, mask)
    drawFormatBits(m, chosen, mask)
    const score = penaltyScore(m)
    if (score < bestScore) {
      bestScore = score
      bestMask = mask
    }
    applyMask(m, mask) // XOR is its own inverse
  }
  applyMask(m, bestMask)
  drawFormatBits(m, chosen, bestMask)

  return { size, version, level: chosen, modules: m.modules }
}
