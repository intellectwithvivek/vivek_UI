/**
 * Generate the component catalogue in both READMEs from the registry.
 *
 * The README is the npm page — for most people it is the whole evaluation — and it had gone
 * quietly wrong: the catalogue listed none of the eight newest components, including every
 * one of the differentiators, and the headline said 44 components render on the server when
 * the real figure was 49. Nothing checks prose, so nothing caught it.
 *
 * Only the export lists and the headline are generated. The paragraphs and code samples
 * between them are hand-written and stay that way — they are the reason anyone reads the
 * file. Each generated run sits between `<!-- name:start -->` and `<!-- name:end -->`.
 *
 *   node scripts/gen-readme-catalog.mjs            # write
 *   node scripts/gen-readme-catalog.mjs --check    # fail if either README has drifted
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const READMES = [join(ROOT, 'README.md'), join(ROOT, 'packages', 'ui', 'README.md')]
const REGISTRY = JSON.parse(readFileSync(join(ROOT, 'apps', 'docs', 'registry.json'), 'utf8'))
const SRC = join(ROOT, 'packages', 'ui', 'src')

const check = process.argv.includes('--check')

/** `Data display` -> `catalog-data-display`, matching the marker names in the READMEs. */
const markerFor = (category) => `catalog-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

/**
 * The names worth listing for one component.
 *
 * Compound parts are dropped: `Navbar` earns a mention, `NavbarLink` and `NavbarActions` do
 * not — they are how you use `Navbar`, not separate things to choose between. The test is
 * whether the export name starts with the primary one, which keeps genuine second exports
 * like `Flex` (from `Stack`) in the list.
 */
function listed(entry) {
  return entry.exports.filter((name) => name === entry.primary || !name.startsWith(entry.primary))
}

function catalogue() {
  const byCategory = new Map()
  for (const entry of REGISTRY.components) {
    const names = listed(entry)
    const existing = byCategory.get(entry.category)
    if (existing) existing.push(...names)
    else byCategory.set(entry.category, [...names])
  }
  return byCategory
}

function statsLine() {
  const total = REGISTRY.components.length
  const exports = REGISTRY.components.reduce((sum, entry) => sum + entry.exports.length, 0)
  const serverSafe = REGISTRY.components.filter((entry) => !entry.isClient).length
  return (
    `**${total} components. ${exports} runtime exports.** Every one is covered by tests including\n` +
    `automated \`axe\` assertions, and **${serverSafe} need no \`'use client'\`** — they render directly in React\n` +
    'Server Components.'
  )
}

/**
 * Source files that open with the directive.
 *
 * Not the same as the count of client *components*: shared internals carry it too, and the
 * README's claim is about files, because that is what `check-directives` verifies in both
 * the ESM and the CJS output.
 */
function clientFiles(dir = SRC) {
  let count = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) count += clientFiles(path)
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) {
      if (/^'use client'/.test(readFileSync(path, 'utf8'))) count++
    }
  }
  return count
}

function serverComponentsBlock() {
  const total = REGISTRY.components.length
  const serverSafe = REGISTRY.components.filter((entry) => !entry.isClient).length
  return [
    `**${serverSafe} of the ${total} components carry no \`'use client'\`** and render directly in React Server Components.`,
    'Only genuinely interactive ones declare it, per file.',
    '',
    'The build is unbundled precisely so each file keeps its own directive, and CI asserts on every build',
    `that all ${clientFiles()} client files still carry theirs in **both** the ESM and CJS output.`,
  ].join('\n')
}

/** Replace what sits between `<!-- name:start -->` and `<!-- name:end -->`. */
function fill(text, name, body) {
  const start = `<!-- ${name}:start -->`
  const end = `<!-- ${name}:end -->`
  const from = text.indexOf(start)
  const to = text.indexOf(end)
  if (from === -1 || to === -1) throw new Error(`missing ${start} / ${end} marker`)
  return `${text.slice(0, from + start.length)}\n${body}\n${text.slice(to)}`
}

const groups = catalogue()

function render(text) {
  let out = fill(text, 'component-stats', statsLine())
  out = fill(out, 'server-components', serverComponentsBlock())
  for (const [category, names] of groups) {
    const marker = markerFor(category)
    if (!out.includes(`<!-- ${marker}:start -->`)) {
      throw new Error(
        `README has no <!-- ${marker}:start --> marker for the "${category}" category. ` +
          'A new category needs a section in the README before it can be generated into one.',
      )
    }
    out = fill(out, marker, names.map((name) => `\`${name}\``).join(' &middot; '))
  }
  return out
}

let failed = false
for (const path of READMES) {
  const current = readFileSync(path, 'utf8')
  const next = render(current)
  if (check) {
    if (next !== current) {
      console.error(`gen-readme-catalog: ${path} is out of date. Run \`pnpm gen:readme\`.`)
      failed = true
    }
  } else if (next !== current) {
    writeFileSync(path, next)
    console.log(`gen-readme-catalog: updated ${path}`)
  }
}

if (failed) process.exit(1)

if (check) {
  console.log(`gen-readme-catalog: OK - ${groups.size} categories, both READMEs up to date.`)
} else {
  const total = [...groups.values()].reduce((sum, names) => sum + names.length, 0)
  console.log(`gen-readme-catalog: ${total} exports across ${groups.size} categories.`)
}
