/**
 * Stops a version number from being written by hand anywhere in the site.
 *
 * The header badge said `v0.2.2` while the package was on 0.3.1, and the landing hero said
 * the same. Nobody notices, because a version number always looks plausible - which makes
 * it exactly the sort of thing to derive and then assert.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LIBRARY_VERSION } from './version'

const ROOT = join(__dirname, '..')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (name === 'node_modules' || name === '.next' || name.startsWith('.')) return []
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.tsx?$/.test(name) && !name.endsWith('.test.ts') && !name.endsWith('.test.tsx')
      ? [path]
      : []
  })
}

describe('LIBRARY_VERSION', () => {
  it('is a semver string', () => {
    expect(LIBRARY_VERSION).toMatch(/^\d+\.\d+\.\d+(-[\w.]+)?$/)
  })

  it('matches the workspace package', () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, '..', '..', 'packages', 'ui', 'package.json'), 'utf8'),
    )
    expect(LIBRARY_VERSION).toBe(pkg.version)
  })

  it('is not shadowed by a hand-written version anywhere in the site', () => {
    // A `vN.N.N` literal in a component is a version that will silently go stale.
    const offenders: string[] = []
    for (const file of sourceFiles(join(ROOT, 'app')).concat(
      sourceFiles(join(ROOT, 'components')),
    )) {
      const source = readFileSync(file, 'utf8')
      for (const match of source.matchAll(/v\d+\.\d+\.\d+/g)) {
        offenders.push(`${file.slice(ROOT.length + 1)}: ${match[0]}`)
      }
    }
    expect(offenders, 'derive these from LIBRARY_VERSION instead').toEqual([])
  })
})
