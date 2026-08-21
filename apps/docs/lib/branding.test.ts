/**
 * Keeps the brand assets and the metadata that references them in step.
 *
 * The failure being prevented is a silent one: a filename typo, or a file added to
 * `public/branding/` that nothing reads. Neither errors — the site just renders with the
 * generated fallback icon and nobody notices the file they added did nothing.
 *
 * So this checks both directions: everything the metadata points at exists, and everything
 * present is actually wired in.
 */
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BRAND_FILES, brandIcons, hasBrandFile, manifestIcons } from './branding'

const ROOT = join(__dirname, '..')
const BRANDING = join(ROOT, 'public', 'branding')

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

describe('brand assets', () => {
  it('has the folder, with its instructions', () => {
    expect(existsSync(BRANDING), 'public/branding/ is missing').toBe(true)
    expect(existsSync(join(BRANDING, 'README.md')), 'the filename spec is missing').toBe(true)
  })

  it('points only at files that exist', () => {
    // A <link rel="icon"> to a 404 is worse than no link: the browser fetches, fails, and
    // then falls back anyway.
    for (const url of iconUrls()) {
      const relative = url.replace(/^\//, '')
      expect(existsSync(join(ROOT, 'public', relative)), `metadata references ${url}`).toBe(true)
    }
  })

  it('wires in every recognised file that is present', () => {
    const urls = iconUrls()
    for (const name of [BRAND_FILES.favicon, BRAND_FILES.svg, BRAND_FILES.png192]) {
      if (hasBrandFile(name)) {
        expect(urls, `${name} exists but nothing links to it`).toContain(`/branding/${name}`)
      }
    }
    if (hasBrandFile(BRAND_FILES.apple)) {
      expect(urls).toContain(`/branding/${BRAND_FILES.apple}`)
    }
  })

  it('has no unrecognised image sitting in the folder unused', () => {
    // Catches `favicon.png` when the site reads `favicon.ico`, or `apple-touch-icon.png`
    // when it reads `apple-icon.png` - a real filename to get wrong, and silent when wrong.
    const known = new Set<string>([...Object.values(BRAND_FILES), 'README.md'])
    const strays = readdirSync(BRANDING).filter((name) => !known.has(name))
    expect(
      strays,
      `these are not names the site reads - see public/branding/README.md for the list`,
    ).toEqual([])
  })

  it('always yields at least one manifest icon', () => {
    // Falls back to the generated /icon route, so an install prompt is never iconless.
    expect(manifestIcons().length).toBeGreaterThan(0)
  })

  it('falls back to the generated icon while the folder is empty', () => {
    const anyPresent = Object.values(BRAND_FILES).some(hasBrandFile)
    if (!anyPresent) {
      expect(brandIcons(), 'with no files present nothing should be linked').toBeUndefined()
      expect(existsSync(join(ROOT, 'app', 'icon.tsx')), 'the generated fallback is missing').toBe(
        true,
      )
    }
  })
})

describe('branding module', () => {
  it('is never imported by a client component', () => {
    // It reads the filesystem. Reaching a client bundle would be a build error at best and a
    // bundled `node:fs` shim at worst.
    const clientFiles: string[] = []
    const walk = (dir: string) => {
      for (const name of readdirSync(dir, { withFileTypes: true })) {
        if (name.name === 'node_modules' || name.name === '.next') continue
        const path = join(dir, name.name)
        if (name.isDirectory()) walk(path)
        else if (/\.tsx?$/.test(name.name)) clientFiles.push(path)
      }
    }
    walk(join(ROOT, 'app'))
    walk(join(ROOT, 'components'))

    const { readFileSync } = require('node:fs') as typeof import('node:fs')
    for (const file of clientFiles) {
      const source = readFileSync(file, 'utf8')
      if (!source.startsWith("'use client'")) continue
      expect(
        source.includes('lib/branding'),
        `${file} is a client component importing branding`,
      ).toBe(false)
    }
  })
})
