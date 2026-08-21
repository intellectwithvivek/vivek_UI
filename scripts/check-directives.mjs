#!/usr/bin/env node
/**
 * Assert that every source file's 'use client' directive survived the build.
 *
 * Bundlers routinely strip or hoist directives when they merge modules. The library
 * therefore compiles per-file (ARCHITECTURE §5.3, §8.2, ADR-006) so each emitted file
 * keeps its own directive — and this script is the regression test for that, listed in
 * §15 as the mitigation for "'use client' stripped by build".
 *
 * In M0 this passes vacuously: no component needs the directive yet. It exists so the
 * build goes red the moment the first client component (Modal, Tabs, Navbar's mobile
 * menu) is added and something in the pipeline eats its directive.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'packages', 'ui', 'src')
const DIST = join(ROOT, 'packages', 'ui', 'dist')

const DIRECTIVE = /^(['"])use client\1/

function walk(dir, filter) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, filter))
    else if (filter(entry.name)) out.push(full)
  }
  return out
}

/** True when the file's first real statement is a 'use client' directive. */
function declaresUseClient(file) {
  const source = readFileSync(file, 'utf8')
  // Strip a leading BOM, then leading comments and blank lines.
  let body = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source
  for (;;) {
    const trimmed = body.replace(/^\s+/, '')
    if (trimmed.startsWith('//')) {
      body = trimmed.slice(trimmed.indexOf('\n') + 1)
      continue
    }
    if (trimmed.startsWith('/*')) {
      body = trimmed.slice(trimmed.indexOf('*/') + 2)
      continue
    }
    body = trimmed
    break
  }
  return DIRECTIVE.test(body)
}

if (!existsSync(DIST)) {
  console.error('check-directives: packages/ui/dist does not exist — run the build first.')
  process.exit(1)
}

const sources = walk(SRC, (name) => /\.(ts|tsx)$/.test(name) && !/\.(test|d)\./.test(name))
const clientSources = sources.filter(declaresUseClient)

const failures = []

for (const source of clientSources) {
  const stem = relative(SRC, source).replace(/\.(ts|tsx)$/, '')
  for (const ext of ['.js', '.cjs']) {
    const built = join(DIST, `${stem}${ext}`)
    if (!existsSync(built)) {
      failures.push(`${relative(ROOT, built)} is missing (source declares 'use client')`)
      continue
    }
    if (!declaresUseClient(built)) {
      failures.push(`${relative(ROOT, built)} lost its 'use client' directive`)
    }
  }
}

if (failures.length > 0) {
  console.error("check-directives: FAILED — 'use client' did not survive the build:\n")
  for (const failure of failures) console.error(`  - ${failure}`)
  console.error('\nPer-file output is what preserves directives; see ARCHITECTURE.md §8.2.')
  process.exit(1)
}

const summary =
  clientSources.length === 0
    ? 'no client components yet — nothing to verify (this becomes meaningful in M1+)'
    : `${clientSources.length} client component(s) kept their directive in both ESM and CJS`
console.log(`check-directives: OK — ${summary}.`)
