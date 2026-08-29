/**
 * The publish job's install-script allowlist must cover every dependency that needs one.
 *
 * `release.yml` installs with `--ignore-scripts`, because that job is the only one holding a
 * publish-capable credential and pnpm would otherwise run every devDependency's postinstall
 * with that credential in reach. It then re-runs the few that are genuinely required, by name.
 *
 * The list had one entry — `esbuild` — and the tree has two. `lightningcss-cli` downloads its
 * platform binary in a postinstall, so with the script skipped the binary was simply absent and
 * a placeholder was left in its place; `build:css` executed that placeholder and the shell
 * reported `1: This: not found`. The 1.0.0 publish died there, after the version PR had already
 * been merged and the changesets consumed.
 *
 * It failed for a structural reason worth naming: the publish job only runs when a version PR
 * lands, so nothing exercised this path between the hardening that added `--ignore-scripts` and
 * the release itself. Every other job installs *with* scripts and was always green. This test
 * moves the check somewhere that runs on every commit.
 *
 * The installed tree is the source of truth, not the lockfile: pnpm's v9 lockfile format no
 * longer records `requiresBuild` at all, so a lockfile-based check would silently pass forever.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = join(__dirname, '..', '..', '..')
const STORE = join(ROOT, 'node_modules', '.pnpm')
const LIFECYCLE = ['preinstall', 'install', 'postinstall'] as const

/** Every installed package whose manifest declares an install lifecycle script. */
function packagesNeedingScripts(): string[] {
  const names = new Set<string>()
  for (const dir of readdirSync(STORE)) {
    const inner = join(STORE, dir, 'node_modules')
    let scopes: string[]
    try {
      scopes = readdirSync(inner)
    } catch {
      continue // `.pnpm` also holds lock and index files
    }
    for (const scope of scopes) {
      // A scoped package nests one level deeper: @scope/name.
      const candidates = scope.startsWith('@')
        ? readdirSync(join(inner, scope)).map((n) => join(scope, n))
        : [scope]
      for (const candidate of candidates) {
        const manifest = join(inner, candidate, 'package.json')
        try {
          if (!statSync(manifest).isFile()) continue
          const pkg = JSON.parse(readFileSync(manifest, 'utf8')) as {
            name?: string
            scripts?: Record<string, string>
          }
          const scripts = pkg.scripts ?? {}
          if (pkg.name && LIFECYCLE.some((key) => key in scripts)) names.add(pkg.name)
        } catch {
          // A directory without a readable manifest is not a package.
        }
      }
    }
  }
  return [...names].sort()
}

/** Package names passed to `pnpm rebuild` in the publish job. */
function allowlist(): string[] {
  const workflow = readFileSync(join(ROOT, '.github', 'workflows', 'release.yml'), 'utf8')
  const line = workflow.match(/pnpm rebuild -r ([^\n]+)/)?.[1] ?? ''
  return line.trim().split(/\s+/).filter(Boolean).sort()
}

describe('the publish job rebuilds every dependency that needs an install script', () => {
  it('names each one explicitly, and nothing it does not need', () => {
    const needed = packagesNeedingScripts()
    // Zero would mean the store layout changed under us and this test had quietly stopped
    // checking anything at all.
    expect(needed.length, 'no installed package declares an install script').toBeGreaterThan(0)
    expect(allowlist()).toEqual(needed)
  })

  it('still installs with --ignore-scripts, which is the reason the allowlist exists', () => {
    const workflow = readFileSync(join(ROOT, '.github', 'workflows', 'release.yml'), 'utf8')
    expect(workflow).toContain('pnpm install --frozen-lockfile --ignore-scripts')
  })

  it('rebuilds recursively, or it reaches nothing', () => {
    // Both packages belong to the `packages/ui` project, not the root. A non-recursive
    // `pnpm rebuild <name>` at the root matches nothing and still exits 0 — so the fix would
    // look applied and change nothing at all. Verified by hand against a cleared binary:
    // without `-r` it stays missing; with it, both postinstalls run.
    const workflow = readFileSync(join(ROOT, '.github', 'workflows', 'release.yml'), 'utf8')
    expect(workflow).toMatch(/pnpm rebuild -r /)
  })
})
