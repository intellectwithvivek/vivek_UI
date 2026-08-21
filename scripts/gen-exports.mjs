#!/usr/bin/env node
/**
 * Regenerate the tail of `packages/ui/src/index.ts` from each component's own barrel.
 *
 * Hand-maintaining ~100 explicit re-export blocks is exactly the kind of thing that
 * silently drifts — a component gets built and simply never becomes public API. This
 * reads every `src/components/<dir>/index.ts`, takes the names it actually exports, and
 * emits one grouped re-export block per directory.
 *
 * `export *` would be shorter but is the wrong tool: it hides name collisions between
 * components until a consumer trips over one, and it makes the public surface invisible
 * in review.
 *
 * Run with `--check` in CI to fail when a component is missing from the barrel.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'packages', 'ui', 'src')
const COMPONENTS = join(SRC, 'components')
const INDEX = join(SRC, 'index.ts')
const ENTRY = join(SRC, 'styles', 'entry.css')

/**
 * Stylesheets whose cascade position matters, in the order they must be imported.
 * Everything is zero-specificity `:where()`, so for the few components that style the
 * same element as another (command-palette on modal's panel, chat-code-block on Code)
 * source order is the only tie-break there is.
 */
const CSS_ORDER = ['code', 'modal', 'drawer', 'chat-code-block', 'command-palette']

/** Directories that are deliberately internal and must never be re-exported. */
const PRIVATE = new Set(['internal'])

const MARKER = '// --- generated below by scripts/gen-exports.mjs; run `pnpm gen:exports` ---'

/** Pull every exported specifier out of a barrel, preserving `type` modifiers. */
function specifiersFrom(source) {
  const names = new Set()

  // `export type { A, B } from '...'` — the modifier applies to the whole clause.
  for (const match of source.matchAll(/export\s+type\s*\{([^}]*)\}/g)) {
    for (const raw of match[1].split(',')) {
      const name = raw.trim()
      if (name) names.add(`type ${name.replace(/^type\s+/, '')}`)
    }
  }

  // `export { A, type B } from '...'` — per-specifier modifiers.
  for (const match of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    // Skip the `export type {` form already handled above.
    if (/export\s+type\s*\{/.test(match[0])) continue
    for (const raw of match[1].split(',')) {
      const name = raw.trim().replace(/\s+/g, ' ')
      if (name) names.add(name)
    }
  }

  return [...names].sort((a, b) => a.replace(/^type /, '').localeCompare(b.replace(/^type /, '')))
}

const directories = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !PRIVATE.has(entry.name))
  .map((entry) => entry.name)
  .sort()

const blocks = []
const skipped = []

for (const directory of directories) {
  let barrel
  try {
    barrel = readFileSync(join(COMPONENTS, directory, 'index.ts'), 'utf8')
  } catch {
    skipped.push(`${directory} (no index.ts)`)
    continue
  }
  const names = specifiersFrom(barrel)
  if (names.length === 0) {
    skipped.push(`${directory} (barrel exports nothing)`)
    continue
  }
  const from = `./components/${directory}`
  const single = `export { ${names.join(', ')} } from '${from}'`
  blocks.push(
    single.length <= 96
      ? single
      : `export {\n${names.map((n) => `  ${n},`).join('\n')}\n} from '${from}'`,
  )
}

// --- entry.css -------------------------------------------------------------------
const CSS_MARKER = '/* generated below by scripts/gen-exports.mjs */'

const stylesheets = directories.filter((directory) => {
  try {
    readFileSync(join(COMPONENTS, directory, `${directory}.css`))
    return true
  } catch {
    return false
  }
})

const rank = (name) => {
  const index = CSS_ORDER.indexOf(name)
  return index === -1 ? CSS_ORDER.length : index
}
const orderedCss = [...stylesheets].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
const cssLines = orderedCss.map((d) => `@import \"../components/${d}/${d}.css\";`)

const entryExisting = readFileSync(ENTRY, 'utf8')
const entryHead = entryExisting.split(CSS_MARKER)[0].trimEnd()
const NL = String.fromCharCode(10)
const entryNext = [entryHead, '', CSS_MARKER, ...cssLines, ''].join(NL)
const existing = readFileSync(INDEX, 'utf8')
const head = existing.split(MARKER)[0].trimEnd()
const next = `${head}\n\n${MARKER}\n\n${blocks.join('\n')}\n`

if (process.argv.includes('--check')) {
  const stale = []
  if (next !== existing) stale.push('src/index.ts')
  if (entryNext !== entryExisting) stale.push('src/styles/entry.css')
  if (stale.length > 0) {
    console.error(`gen-exports: ${stale.join(' and ')} out of date. Run \`pnpm gen:exports\`.`)
    process.exit(1)
  }
  console.log(
    `gen-exports: OK - ${blocks.length} exported, ${cssLines.length} stylesheet(s) bundled.`,
  )
} else {
  writeFileSync(INDEX, next)
  writeFileSync(ENTRY, entryNext)
  console.log(
    `gen-exports: wrote ${blocks.length} re-export block(s) and ${cssLines.length} @import(s).`,
  )
}

if (skipped.length > 0) {
  console.warn(`gen-exports: skipped ${skipped.length}: ${skipped.join(', ')}`)
}
