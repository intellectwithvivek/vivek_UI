/**
 * Keeps the brand assets and the metadata that references them in step, and keeps them small.
 *
 * Both halves came from real failures on the first set of icons that arrived:
 *
 * 1. **Names.** They came out of realfavicongenerator.net — `apple-touch-icon.png`,
 *    `web-app-manifest-192x192.png` — and the site was reading names I had invented. Four of
 *    six files were silently ignored: no error, the site just fell back to the generated
 *    icon, and nothing said the files had done nothing.
 * 2. **Size.** `icon.svg` was a 1528×1592 PNG base64-embedded in an `<svg>` wrapper: 4.8 MB,
 *    zero `<path>` elements. Browsers *prefer* SVG when it is offered, so that was the
 *    favicon being downloaded on every single page view.
 *
 * Neither is visible by looking at the site — the icon renders fine either way.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  brandIcons,
  ICON_ROLES,
  type IconRole,
  manifestIcons,
  RECOGNISED_FILENAMES,
  resolveRole,
} from './branding'

const ROOT = join(__dirname, '..')
const BRANDING = join(ROOT, 'public', 'branding')

const ROLES = Object.keys(ICON_ROLES) as IconRole[]

/** Every URL the icon metadata emits, flattened. */
function iconUrls(): string[] {
  const icons = brandIcons()
  if (!icons || typeof icons !== 'object' || Array.isArray(icons)) return []
  const urls: string[] = []
  for (const value of Object.values(icons)) {
    if (!Array.isArray(value)) continue
    for (const entry of value) {
      if (typeof entry === 'object' && entry && 'url' in entry) urls.push(String(entry.url))
    }
  }
  return urls
}

const kb = (bytes: number) => `${(bytes / 1024).toFixed(0)} KB`

describe('brand asset wiring', () => {
  it('has the folder, with its instructions', () => {
    expect(readdirSync(BRANDING)).toContain('README.md')
  })

  it('points only at files that exist', () => {
    // A <link rel="icon"> to a 404 is worse than no link: the browser fetches, fails, then
    // falls back anyway.
    for (const url of iconUrls()) {
      const path = join(ROOT, 'public', url.replace(/^\//, ''))
      expect(statSync(path).isFile(), `metadata references ${url}, which is not a file`).toBe(true)
    }
  })

  it('leaves no image in the folder unused', () => {
    // The check that would have caught the naming mismatch. A file the site does not read is
    // indistinguishable, from the outside, from a file it does.
    const strays = readdirSync(BRANDING).filter(
      (name) => name !== 'README.md' && !RECOGNISED_FILENAMES.includes(name),
    )
    expect(
      strays,
      `not names the site reads. Accepted: ${RECOGNISED_FILENAMES.join(', ')}`,
    ).toEqual([])
  })

  it('wires in every role that has a file present', () => {
    const urls = iconUrls()
    for (const role of ['ico', 'svg', 'png96', 'apple'] as const) {
      const found = resolveRole(role)
      if (found) {
        expect(urls, `${found.file} exists but nothing links to it`).toContain(
          `/branding/${found.file}`,
        )
      }
    }
  })

  it('always yields at least one manifest icon', () => {
    expect(manifestIcons().length).toBeGreaterThan(0)
  })
})

describe('brand asset weight', () => {
  /*
   * Budgets differ by how often a browser fetches the file, which is the only thing that
   * makes a budget meaningful. An `everyLoad` icon rides along with every page view; an
   * `install` icon is fetched once, if ever.
   */
  it.each(ROLES.map((role) => [role, ICON_ROLES[role]] as const))(
    '%s stays within its budget',
    (role, spec) => {
      const found = resolveRole(role)
      if (!found) return
      expect(
        found.bytes,
        `${found.file} is ${kb(found.bytes)}; the budget for a ${spec.frequency} icon is ${kb(spec.maxBytes)}`,
      ).toBeLessThanOrEqual(spec.maxBytes)
    },
  )

  it('has no SVG that is really a raster in a wrapper', () => {
    // The specific 4.8 MB failure. An SVG with an embedded base64 image and no vector
    // geometry is a PNG wearing a costume: it is the file browsers prefer, and it is the
    // largest one in the folder.
    const found = resolveRole('svg')
    if (!found) return
    const source = readFileSync(join(BRANDING, found.file), 'utf8')
    const hasGeometry = /<(path|circle|rect|polygon|ellipse|line|polyline)\b/.test(source)
    const hasEmbeddedRaster = /<image\b[^>]*base64/.test(source)
    expect(
      hasEmbeddedRaster && !hasGeometry,
      `${found.file} embeds a raster image and contains no vector geometry — export a real vector, or delete it and let the .ico and PNGs serve`,
    ).toBe(false)
  })

  it('keeps the every-page-load icons small in total', () => {
    // What a first-time visitor actually pays for icons before seeing anything.
    const total = ROLES.filter((role) => ICON_ROLES[role].frequency === 'everyLoad').reduce(
      (sum, role) => sum + (resolveRole(role)?.bytes ?? 0),
      0,
    )
    expect(total, `every-page-load icons total ${kb(total)}`).toBeLessThanOrEqual(150 * 1024)
  })
})

describe('branding module', () => {
  it('is never imported by a client component', () => {
    // It reads the filesystem. Reaching a client bundle would be a build error at best.
    const files: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === '.next') continue
        const path = join(dir, entry.name)
        if (entry.isDirectory()) walk(path)
        else if (/\.tsx?$/.test(entry.name)) files.push(path)
      }
    }
    walk(join(ROOT, 'app'))
    walk(join(ROOT, 'components'))

    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      if (!source.startsWith("'use client'")) continue
      expect(
        source.includes('lib/branding'),
        `${file} is a client component importing branding`,
      ).toBe(false)
    }
  })
})
