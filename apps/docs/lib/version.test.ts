/**
 * Proves the version flows from the package to the site automatically.
 *
 * Three separate failures motivated this file, all of the same shape — a number that looked
 * plausible and was wrong:
 *
 * 1. The header badge and the landing hero both read `v0.2.2` while the package was on
 *    0.3.1. Hardcoded, and nobody spots a stale version number.
 * 2. `structured-data.ts` read `process.env.NEXT_PUBLIC_PACKAGE_VERSION`, which nothing ever
 *    set, so the JSON-LD `softwareVersion` was silently absent.
 * 3. The first fix imported the library's `package.json` into a Client Component, which
 *    inlined the WHOLE file — `devDependencies`, `size-limit` budgets, build scripts — into
 *    a public client chunk to obtain one string.
 *
 * So the assertions here cover the wiring, not just the value: that there is exactly one
 * source, that a bump propagates, and that nothing reintroduces a literal.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LIBRARY_VERSION, LIBRARY_VERSION_LABEL } from './version'

const ROOT = join(__dirname, '..')
const require_ = createRequire(import.meta.url)
const PKG = require_('@the_viveksingh/vivek-ui/package.json')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (name === 'node_modules' || name === '.next' || name.startsWith('.')) return []
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

/** Every file the site is built from, tests excluded. */
const SITE_FILES = ['app', 'components', 'lib'].flatMap((dir) => sourceFiles(join(ROOT, dir)))

/**
 * Source with comments removed.
 *
 * The checks below look for a version written by hand, and documentation that *explains* the
 * old hardcoded values is not that - the first run of this test flagged the very comment
 * recording the bug it exists to prevent.
 */
function code(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

describe('LIBRARY_VERSION', () => {
  it('is a semver string', () => {
    expect(LIBRARY_VERSION).toMatch(/^\d+\.\d+\.\d+(-[\w.]+)?$/)
  })

  it('equals the library package version', () => {
    expect(LIBRARY_VERSION).toBe(PKG.version)
  })

  it('formats the display label in exactly one place', () => {
    expect(LIBRARY_VERSION_LABEL).toBe(`v${PKG.version}`)
  })
})

describe('the version has a single source', () => {
  it('is injected by next.config.mjs from the library package.json', () => {
    const config = readFileSync(join(ROOT, 'next.config.mjs'), 'utf8')
    expect(config).toContain('@the_viveksingh/vivek-ui/package.json')
    expect(config).toContain('NEXT_PUBLIC_LIBRARY_VERSION')
  })

  it('is injected identically for tests, so this suite exercises the real wiring', () => {
    const config = readFileSync(join(ROOT, 'vitest.config.ts'), 'utf8')
    expect(config).toContain('@the_viveksingh/vivek-ui/package.json')
    expect(config).toContain('NEXT_PUBLIC_LIBRARY_VERSION')
  })

  it('is read from the environment in exactly one module', () => {
    // More than one reader is more than one thing to keep in step. Paths are normalised to
    // forward slashes so this assertion reads the same on Windows and on CI.
    const readers = SITE_FILES.filter((file) =>
      code(file).includes('process.env.NEXT_PUBLIC_LIBRARY_VERSION'),
    ).map((file) =>
      file
        .slice(ROOT.length + 1)
        .split(/[\\/]/)
        .join('/'),
    )
    expect(readers).toEqual(['lib/version.ts'])
  })

  it('has no module reading a version env var that nothing sets', () => {
    // `NEXT_PUBLIC_PACKAGE_VERSION` was read for weeks and never set anywhere.
    for (const file of SITE_FILES) {
      for (const match of code(file).matchAll(
        /process\.env\.(NEXT_PUBLIC_[A-Z_]*VERSION[A-Z_]*)/g,
      )) {
        expect(
          match[1],
          `${file.slice(ROOT.length + 1)} reads ${match[1]}, which no config injects`,
        ).toBe('NEXT_PUBLIC_LIBRARY_VERSION')
      }
    }
  })
})

describe('no hand-written version survives anywhere', () => {
  it('has no vN.N.N literal in any site source file', () => {
    const offenders: string[] = []
    for (const file of SITE_FILES) {
      for (const match of code(file).matchAll(/v\d+\.\d+\.\d+/g)) {
        offenders.push(`${file.slice(ROOT.length + 1)}: ${match[0]}`)
      }
    }
    expect(offenders, 'derive these from LIBRARY_VERSION_LABEL instead').toEqual([])
  })

  it('has no bare copy of the current version in any site source file', () => {
    // Catches `"0.3.1"` written without the `v`, which the check above would miss.
    const offenders: string[] = []
    for (const file of SITE_FILES) {
      if (code(file).includes(PKG.version)) offenders.push(file.slice(ROOT.length + 1))
    }
    expect(offenders, `these embed "${PKG.version}" literally`).toEqual([])
  })
})

describe('a version bump reaches the whole site', () => {
  /*
   * The propagation test. Rather than asserting "the value is 0.3.1" - which passes for a
   * hardcoded 0.3.1 too - this feeds a version that appears nowhere in the codebase through
   * the same substitution the build performs, and checks it comes out the other side.
   */
  const FAKE = '9.8.7-propagation-check'

  it('renders whatever version it is given, not a baked-in one', async () => {
    const previous = process.env.NEXT_PUBLIC_LIBRARY_VERSION
    process.env.NEXT_PUBLIC_LIBRARY_VERSION = FAKE
    try {
      // A fresh module instance, so the top-level read runs again with the new value.
      const fresh = await import(`./version?bump=${Date.now()}`)
      expect(fresh.LIBRARY_VERSION).toBe(FAKE)
      expect(fresh.LIBRARY_VERSION_LABEL).toBe(`v${FAKE}`)
    } finally {
      process.env.NEXT_PUBLIC_LIBRARY_VERSION = previous
    }
  })

  it('refuses to render a placeholder when the injection is missing', async () => {
    const previous = process.env.NEXT_PUBLIC_LIBRARY_VERSION
    process.env.NEXT_PUBLIC_LIBRARY_VERSION = ''
    try {
      await expect(import(`./version?missing=${Date.now()}`)).rejects.toThrow(
        /NEXT_PUBLIC_LIBRARY_VERSION is not set/,
      )
    } finally {
      process.env.NEXT_PUBLIC_LIBRARY_VERSION = previous
    }
  })
})

describe('every surface that states a version derives it', () => {
  it.each([
    ['the site header badge', 'app/site-header.tsx'],
    ['the landing hero', 'app/page.tsx'],
    ['the JSON-LD softwareVersion', 'lib/structured-data.ts'],
    ['llms.txt', 'app/llms.txt/route.ts'],
  ])('%s reads it from lib/version', (_label, relative) => {
    const source = readFileSync(join(ROOT, relative), 'utf8')
    expect(source).toMatch(/LIBRARY_VERSION(_LABEL)?/)
  })
})
