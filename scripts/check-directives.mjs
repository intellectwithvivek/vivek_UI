#!/usr/bin/env node
/**
 * Assert that every source file's 'use client' directive survived the build.
 *
 * Bundlers routinely strip or hoist directives when they merge modules. The library
 * therefore compiles per-file so each emitted file keeps its own directive, and this
 * script is the regression test for that.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'packages', 'ui', 'src')
const DIST = join(ROOT, 'packages', 'ui', 'dist')

function walk(dir, filter) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, filter))
    else if (filter(entry.name)) out.push(full)
  }
  return out
}

/**
 * True when the file's directive prologue contains 'use client'.
 *
 * The prologue is the leading run of string-literal statements, and it can hold more
 * than one. esbuild emits `"use strict"; "use client";` for CJS, where 'use client' is
 * second but still a directive and still effective — so checking only the first
 * statement reports a false failure on every CJS client component.
 *
 * Leading comments are skipped. A string that is part of a real statement
 * (`const s = 'use client'`) is not a directive and must not count.
 */
function declaresUseClient(file) {
  const source = readFileSync(file, 'utf8')
  let rest = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source

  const LINE_COMMENT = /^\/\/[^\n]*\n?/
  const BLOCK_COMMENT = /^\/\*[\s\S]*?\*\//
  const DIRECTIVE = /^(['"])((?:\\.|(?!\1)[^\\])*)\1[ \t]*;?/

  for (;;) {
    rest = rest.replace(/^\s+/, '')

    const line = LINE_COMMENT.exec(rest)
    if (line) {
      rest = rest.slice(line[0].length)
      continue
    }

    const block = BLOCK_COMMENT.exec(rest)
    if (block) {
      rest = rest.slice(block[0].length)
      continue
    }

    const directive = DIRECTIVE.exec(rest)
    if (!directive) return false
    if (directive[2] === 'use client') return true
    rest = rest.slice(directive[0].length)
  }
}

if (!existsSync(DIST)) {
  console.error('check-directives: packages/ui/dist does not exist - run the build first.')
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
  console.error("check-directives: FAILED - 'use client' did not survive the build:\n")
  for (const failure of failures) console.error(`  - ${failure}`)
  console.error('\nPer-file output is what preserves directives.')
  process.exit(1)
}

const summary =
  clientSources.length === 0
    ? 'no client components yet - nothing to verify'
    : `${clientSources.length} client component(s) kept their directive in both ESM and CJS`
console.log(`check-directives: OK - ${summary}.`)
