/**
 * Asserts the docs cover every component, and that the three lists agree.
 *
 * A page needs three things to show a live example: a `previews/<slug>.tsx` module, an
 * entry in that module's registry in `components/component-preview.tsx`, and at least one
 * example in `lib/examples.ts` (or one of the sets it merges). Miss any one and the page
 * silently falls back to "examples coming" — which is how 74 pages ended up without a
 * preview while every build stayed green.
 *
 * The example keys are read with the TypeScript parser rather than a regex, because the
 * regex version of this check is exactly the kind of thing that reports success on a file
 * it did not really understand.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')

const EXAMPLE_FILES = [
  'lib/examples.ts',
  'lib/example-sets/layout.ts',
  'lib/example-sets/typography.ts',
  'lib/example-sets/forms.ts',
  'lib/example-sets/overlays.ts',
  'lib/example-sets/sections.ts',
]

/** Every top-level key of every `Record<string, Example[]>` literal in a file. */
function exampleKeys(relativePath) {
  const path = join(ROOT, relativePath)
  const source = ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )

  const keys = new Map()
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      const initializer = declaration.initializer
      if (!initializer || !ts.isObjectLiteralExpression(initializer)) continue
      for (const property of initializer.properties) {
        // Spread members are the aggregator merging the sets; their keys live in the
        // files being spread, which this script reads separately.
        if (!ts.isPropertyAssignment(property)) continue
        if (!ts.isArrayLiteralExpression(property.initializer)) continue
        const name = property.name
        const slug = ts.isIdentifier(name) ? name.text : ts.isStringLiteral(name) ? name.text : null
        if (slug === null) continue
        const names = property.initializer.elements.flatMap((element) => {
          if (!ts.isObjectLiteralExpression(element)) return []
          for (const field of element.properties) {
            if (!ts.isPropertyAssignment(field)) continue
            if (ts.isIdentifier(field.name) && field.name.text === 'name') {
              return ts.isStringLiteral(field.initializer) ? [field.initializer.text] : []
            }
          }
          return []
        })
        keys.set(slug, names)
      }
    }
  }
  return keys
}

const registry = JSON.parse(readFileSync(join(ROOT, 'registry.json'), 'utf8'))
const slugs = registry.components.map((component) => component.slug)

const previewFiles = new Set(
  readdirSync(join(ROOT, 'previews'))
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => file.slice(0, -'.tsx'.length)),
)

const registrySource = readFileSync(join(ROOT, 'components/component-preview.tsx'), 'utf8')
const registered = new Set(
  Array.from(registrySource.matchAll(/import\('\.\.\/previews\/([a-z0-9-]+)'\)/g), (m) => m[1]),
)

const examples = new Map()
const duplicates = []
for (const file of EXAMPLE_FILES) {
  for (const [slug, names] of exampleKeys(file)) {
    if (examples.has(slug)) duplicates.push(`${slug} (in ${file} and ${examples.get(slug).file})`)
    examples.set(slug, { file, names })
  }
}

const problems = []

for (const slug of slugs) {
  if (!previewFiles.has(slug)) problems.push(`${slug}: no previews/${slug}.tsx`)
  else if (!registered.has(slug)) {
    problems.push(`${slug}: previews/${slug}.tsx exists but is not in the PREVIEWS map`)
  }
  if (!examples.has(slug)) problems.push(`${slug}: no entry in the example sets`)
}

for (const [slug] of examples) {
  if (!slugs.includes(slug) && !previewFiles.has(slug)) {
    problems.push(`${slug}: has examples but is neither a component nor a preview`)
  }
}

for (const file of previewFiles) {
  if (!registered.has(file)) problems.push(`${file}: preview module is not in the PREVIEWS map`)
}

for (const duplicate of duplicates) {
  problems.push(`duplicate example key: ${duplicate}`)
}

if (problems.length > 0) {
  console.error('check-examples: FAILED')
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

const exampleCount = Array.from(examples.values()).reduce((sum, e) => sum + e.names.length, 0)
console.log(
  `check-examples: OK - ${slugs.length} components, ${previewFiles.size} preview modules, ` +
    `${exampleCount} examples across ${examples.size} slugs.`,
)
