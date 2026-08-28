/**
 * Read the page templates and emit `page-sources.json`.
 *
 * The code shown on a template's page is the file that renders the demo above it, read at
 * build time. The alternative — a hand-written copy of the code in a string — is a copy, and
 * a copy goes stale the first time someone edits the original. Then the gallery is teaching
 * people something that no longer compiles.
 *
 * It also enforces the rule that makes the gallery worth anything: **a template may import
 * only from the published package and from React.** The moment a template reaches for a
 * docs-local helper, the code on the page stops being copy-and-run, and the gallery quietly
 * stops proving what it claims to prove.
 *
 * Output: `apps/docs/page-sources.json`. Run with `--check` in CI to fail on drift.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const HERE = dirname(fileURLToPath(import.meta.url))
const DOCS = resolve(HERE, '..')

/**
 * `--dir <name>` / `--out <file>` point the same generator at another gallery. The block
 * gallery (`blocks/` -> `block-sources.json`) is held to exactly the rules the page
 * templates are, so it reuses this file rather than growing a copy of it.
 */
function argValue(flag, fallback) {
  const index = process.argv.indexOf(flag)
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback
}
const DIR_NAME = argValue('--dir', 'page-templates')
const DIR = join(DOCS, DIR_NAME)
const OUT = join(DOCS, argValue('--out', 'page-sources.json'))
const OUT_NAME = OUT.slice(DOCS.length + 1)
const NOUN = DIR_NAME === 'blocks' ? 'block' : 'template'
const REGEN = DIR_NAME === 'blocks' ? 'pnpm gen:blocks' : 'pnpm gen:pages'

const PACKAGE = '@the_viveksingh/vivek-ui'
const CHARTS = `${PACKAGE}/charts`
const ALLOWED = new Set([PACKAGE, CHARTS, 'react'])

const problems = []

/** Every named import, grouped by the module it came from. */
function importsOf(source, file) {
  const named = { [PACKAGE]: [], [CHARTS]: [] }

  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const from = statement.moduleSpecifier
    if (!ts.isStringLiteral(from)) continue

    if (!ALLOWED.has(from.text)) {
      problems.push(
        `${file}: imports from "${from.text}". A ${NOUN} may only import from ` +
          `"${PACKAGE}", "${CHARTS}" and "react" — otherwise the code on the page is not ` +
          'something a reader can paste into their own project and run.',
      )
      continue
    }

    const bindings = statement.importClause?.namedBindings
    if (!bindings || !ts.isNamedImports(bindings)) continue
    for (const element of bindings.elements) {
      // `import type { Foo }` and `import { type Foo }` are both erased at runtime; the
      // gallery lists what the template *uses*, so types do not belong in that list.
      if (statement.importClause?.isTypeOnly || element.isTypeOnly) continue
      if (from.text === 'react') continue
      named[from.text]?.push(element.name.text)
    }
  }

  return named
}

const files = readdirSync(DIR)
  .filter((file) => file.endsWith('.tsx'))
  .sort()

const out = {}

for (const file of files) {
  const slug = file.slice(0, -'.tsx'.length)
  const path = join(DIR, file)
  const text = readFileSync(path, 'utf8')
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

  const named = importsOf(source, file)

  if (!/export default function/.test(text)) {
    problems.push(`${file}: needs a default-exported component, which is what the page renders.`)
  }

  out[slug] = {
    // Verbatim, including the comments. The comments are half of why the gallery is useful.
    source: text.replace(/\r\n/g, '\n'),
    uses: [...new Set(named[PACKAGE])].sort(),
    chartUses: [...new Set(named[CHARTS])].sort(),
    // Read from the file rather than declared by hand, so it can never disagree with it.
    isClient: /^'use client'/m.test(text),
    lines: text.replace(/\r\n/g, '\n').trimEnd().split('\n').length,
  }
}

// The metadata list and the directory have to agree, or a template ships with no page or a
// page ships with no template.
const metaSource = readFileSync(join(DIR, 'index.ts'), 'utf8')
const declared = new Set(
  Array.from(metaSource.matchAll(/^\s*slug: '([a-z0-9-]+)',$/gm), (m) => m[1]),
)

for (const slug of Object.keys(out)) {
  if (!declared.has(slug)) {
    problems.push(`${DIR_NAME}/${slug}.tsx has no entry in ${DIR_NAME}/index.ts.`)
  }
}
for (const slug of declared) {
  if (!out[slug]) {
    problems.push(`${DIR_NAME}/index.ts declares "${slug}", but there is no ${slug}.tsx.`)
  }
}

if (problems.length > 0) {
  console.error('gen-page-sources: failed.\n')
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

const json = `${JSON.stringify(out, null, 2)}\n`

if (process.argv.includes('--check')) {
  let existing = ''
  try {
    existing = readFileSync(OUT, 'utf8')
  } catch {
    existing = ''
  }
  if (existing !== json) {
    console.error(`gen-page-sources: ${OUT_NAME} is out of date. Run \`${REGEN}\`.`)
    process.exit(1)
  }
  console.log(`gen-page-sources: OK - ${Object.keys(out).length} ${NOUN}s, up to date.`)
} else {
  writeFileSync(OUT, json)
  const total = Object.values(out).reduce((sum, entry) => sum + entry.lines, 0)
  console.log(`gen-page-sources: ${Object.keys(out).length} ${NOUN}s, ${total} lines.`)
}
