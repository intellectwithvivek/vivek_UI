#!/usr/bin/env node
/**
 * Remove references to internal-only documents from source and repo files.
 *
 * `docs/ARCHITECTURE.md` and `CLAUDE.md` are untracked working documents. Citing them
 * from source is wrong twice over: the JSDoc survives into the published `.d.ts` files,
 * so the package leaks internal structure to every consumer, and it points contributors
 * at files they cannot open.
 *
 * Deliberately narrow. An earlier version also "tidied" leftover punctuation, which
 * stripped legitimate empty parens — turning `:where()` into `:where` in comments and
 * breaking real code in `export.ts`. So: remove only the citation itself, collapse only
 * the double space it leaves, and never touch anything else. Any file that still holds a
 * reference afterwards is reported for a human to rewrite by hand rather than guessed at.
 *
 * Run with --check to fail when a reference reappears.
 */

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const CHECK = process.argv.includes('--check')
const TOKENS = /ARCHITECTURE|CLAUDE\.md/

/** Files where a reference is legitimate: the ignore rules, and this script. */
const ALLOWED = new Set(['.gitignore', 'scripts/strip-internal-refs.mjs'])

const RULES = [
  // ", per ARCHITECTURE §3.2" or ", see ARCHITECTURE §8.2" immediately before a `)`
  [/,\s*(?:per|see)\s+ARCHITECTURE\s+§[\d.]+[^)]*(?=\))/g, ''],
  // " (ARCHITECTURE §8.2)", " (ARCHITECTURE §14, M8)", " (CLAUDE.md, Conventions)"
  [/[ \t]*\((?:ARCHITECTURE|CLAUDE\.md)[^)]*\)/g, ''],
  // "; see ARCHITECTURE §12 for the roadmap" as a trailing clause
  [/[ \t]*[;,][ \t]*(?:see|per)[ \t]+(?:ARCHITECTURE|CLAUDE\.md)[^.\n]*/g, ''],
]

const files = execSync('git ls-files', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter((file) => file && !ALLOWED.has(file))

let changed = 0
const remaining = []

for (const file of files) {
  let source
  try {
    source = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  if (!TOKENS.test(source)) continue

  let next = source
  for (const [pattern, replacement] of RULES) next = next.replace(pattern, replacement)

  // The only tidying that is safe: a citation removed from mid-sentence can leave a
  // double space. Nothing else is touched.
  next = next.replace(/(\S)[ \t]{2,}(\S)/g, '$1 $2')

  if (TOKENS.test(next)) {
    remaining.push(file)
    continue
  }
  if (next !== source) {
    if (!CHECK) writeFileSync(file, next)
    changed += 1
    if (CHECK) remaining.push(file)
  }
}

if (remaining.length > 0) {
  console.error(`strip-internal-refs: ${remaining.length} file(s) need attention:`)
  for (const file of remaining) console.error(`  - ${file}`)
  console.error('\nRewrite these by hand — the reference is woven into prose, not a citation.')
  process.exit(1)
}

console.log(
  CHECK
    ? 'strip-internal-refs: OK - no references to internal documents.'
    : `strip-internal-refs: cleaned ${changed} file(s).`,
)
