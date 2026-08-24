/**
 * The generated icons must match the logo they were generated from.
 *
 * Icons are the one asset nobody looks at again. Swap the logo, forget to regenerate, and
 * the site keeps serving the previous brand from the browser tab, the home screen and every
 * shared link — for months, because the only place it shows is a 16-pixel square.
 *
 * `gen-favicons.mjs --check` regenerates into memory and compares byte for byte, so this is
 * the same guarantee the build gets, run as a test.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const BRANDING = join(__dirname, '..', 'public', 'branding')
const SCRIPT = join(__dirname, '..', 'scripts', 'gen-favicons.mjs')

const png = (file: string) => readFileSync(join(BRANDING, file))
/** PNG stores width and height as big-endian uint32 at fixed offsets in the IHDR chunk. */
const dimensions = (buffer: Buffer) => `${buffer.readUInt32BE(16)}x${buffer.readUInt32BE(20)}`

describe('generated icons', () => {
  it('are in sync with the source logo', () => {
    // Throws with a list of stale files if not.
    const output = execFileSync(process.execPath, [SCRIPT, '--check'], { encoding: 'utf8' })
    expect(output).toContain('OK')
  })

  it('are the sizes their filenames and manifest entries promise', () => {
    // A file called `favicon-96x96.png` that is 512 pixels wide is served at full size to
    // every visitor on every page load, because the browser trusts the `sizes` attribute.
    expect(dimensions(png('favicon-96x96.png'))).toBe('96x96')
    expect(dimensions(png('apple-touch-icon.png'))).toBe('180x180')
    expect(dimensions(png('web-app-manifest-192x192.png'))).toBe('192x192')
    expect(dimensions(png('web-app-manifest-512x512.png'))).toBe('512x512')
  })

  it('keeps the every-page icons small', () => {
    // These are requested on ordinary page views. The previous 512px icon was 422 kB.
    expect(png('favicon-96x96.png').length).toBeLessThan(10 * 1024)
    expect(png('favicon.ico').length).toBeLessThan(20 * 1024)
    expect(png('web-app-manifest-512x512.png').length).toBeLessThan(120 * 1024)
  })

  it('produces a multi-size .ico that really contains PNGs', () => {
    const ico = png('favicon.ico')
    expect(ico.readUInt16LE(0)).toBe(0) // reserved
    expect(ico.readUInt16LE(2)).toBe(1) // 1 = icon, not cursor
    const count = ico.readUInt16LE(4)
    expect(count).toBe(3)

    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    for (let index = 0; index < count; index++) {
      const entry = 6 + index * 16
      const declared = ico[entry] === 0 ? 256 : ico[entry]
      const length = ico.readUInt32LE(entry + 8)
      const offset = ico.readUInt32LE(entry + 12)
      const image = ico.subarray(offset, offset + length)

      expect(image.subarray(0, 8).equals(signature), `entry ${index} is not a PNG`).toBe(true)
      // The directory's declared size and the PNG's real size must agree, or Windows picks
      // an entry and then draws something a different size.
      expect(dimensions(image)).toBe(`${declared}x${declared}`)
    }
  })
})
