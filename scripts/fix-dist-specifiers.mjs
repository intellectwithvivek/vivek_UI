#!/usr/bin/env node
/**
 * Make per-file output resolvable by Node.
 *
 * tsup with `bundle: false` transpiles each source file
 * independently, which is what preserves per-file 'use client' directives — but it
 * copies relative import specifiers through verbatim. That leaves two things Node
 * cannot resolve:
 *
 * import { Button } from './components/button' -> ERR_UNSUPPORTED_DIR_IMPORT
 * require('../../utils/cx') -> looks for cx.js, we emit cx.cjs
 *
 * Bundlers (Vite, webpack, Next) paper over both with their own resolution, so the
 * breakage only shows up for consumers using native Node ESM or plain require() —
 * which is exactly the case a published package must not get wrong.
 *
 * This pass rewrites relative specifiers to be fully explicit: directory imports
 * become `/index`, and every specifier gets the extension matching its own format.
 * tsup already emits correct specifiers in the .d.ts / .d.cts files, so only the
 * JavaScript needs fixing.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'packages', 'ui', 'dist')

/** Matches the specifier in `from '...'`, `import '...'`, `require('...')`, `import('...')`. */
const SPECIFIER = /(\bfrom\s*|\bimport\s*|\brequire\s*\(\s*|\bimport\s*\(\s*)(['"])(\.[^'"]*)\2/g

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (/\.(js|cjs)$/.test(entry.name)) out.push(full)
  }
  return out
}

let filesChanged = 0
let specifiersRewritten = 0
const unresolved = []

if (!existsSync(DIST)) {
  console.error(`fix-dist-specifiers: ${DIST} does not exist — run the build first.`)
  process.exit(1)
}

for (const file of walk(DIST)) {
  const ext = file.endsWith('.cjs') ? '.cjs' : '.js'
  const source = readFileSync(file, 'utf8')
  let changed = 0

  const next = source.replace(SPECIFIER, (match, keyword, quote, spec) => {
    // Already explicit and pointing at a real file: leave it alone.
    if (spec.endsWith(ext) && existsSync(resolve(dirname(file), spec))) return match

    const base = resolve(dirname(file), spec)
    let fixed = null
    if (existsSync(`${base}${ext}`)) fixed = `${spec}${ext}`
    else if (existsSync(join(base, `index${ext}`))) fixed = `${spec}/index${ext}`

    if (!fixed) {
      unresolved.push(`${file}: ${spec}`)
      return match
    }

    changed++
    return `${keyword}${quote}${fixed}${quote}`
  })

  if (changed > 0) {
    writeFileSync(file, next)
    filesChanged++
    specifiersRewritten += changed
  }
}

if (unresolved.length > 0) {
  console.error('fix-dist-specifiers: could not resolve these relative specifiers:')
  for (const line of unresolved) console.error(` ${line}`)
  process.exit(1)
}

console.log(
  `fix-dist-specifiers: rewrote ${specifiersRewritten} specifier(s) across ${filesChanged} file(s).`,
)
