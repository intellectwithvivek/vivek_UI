#!/usr/bin/env node
/**
 * Export the parts of client compound components as named exports.
 *
 * A compound component built with `Object.assign(Root, { Part })` cannot be dot-accessed
 * across the React Server Component boundary: `Tabs` becomes a client *reference* in a
 * Server Component, and reading `.List` off that reference yields `undefined`, so the
 * render fails with "Element type is invalid ... got: undefined".
 *
 * It only bites the client compounds. `Card`, `Table`, `Section` and friends are
 * server-safe, so `Card.Header` is a real property on a real function and works fine.
 *
 * `Popover` and `DropdownMenu` already export their parts individually, which is exactly
 * why they were the two that worked — the library was simply inconsistent. This makes the
 * rest match, so `import { TabsList }` is available when a Server Component needs it,
 * while `Tabs.List` keeps working inside client components.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const COMPONENTS = join(ROOT, 'packages', 'ui', 'src', 'components')

/** Client components whose parts are attached with Object.assign. */
const TARGETS = ['accordion', 'chat-thread', 'drawer', 'modal', 'navbar', 'sidebar', 'tabs']

let touched = 0

for (const slug of TARGETS) {
  const file = join(COMPONENTS, slug, `${slug}.tsx`)
  let source = readFileSync(file, 'utf8')

  const assign = /export const (\w+) = Object\.assign\(\s*(\w+),\s*\{([\s\S]*?)\}\s*,?\s*\)/.exec(
    source,
  )
  if (!assign) {
    console.warn(`add-compound-exports: no Object.assign found in ${slug}`)
    continue
  }

  const [, rootName, , body] = assign
  /** `List: TabsList` or `Header: parts.Header` */
  const members = [...body.matchAll(/(\w+)\s*:\s*([\w.]+)/g)].map(([, key, value]) => ({
    key,
    value,
  }))

  const names = []
  const aliases = []
  for (const { key, value } of members) {
    if (value.includes('.')) {
      // `parts.Header` has no local identifier to export; alias it to a stable name.
      const alias = `${rootName}${key}`
      aliases.push(`const ${alias} = ${value}`)
      names.push(alias)
    } else {
      names.push(value)
    }
  }

  const marker = '/* Named part exports'
  if (source.includes(marker)) continue

  const block = [
    '',
    `${marker} — see scripts/add-compound-exports.mjs.`,
    ' *',
    ` * ${rootName} is a client component, so a Server Component receives it as a client`,
    ` * reference and \`${rootName}.Part\` reads \`undefined\` off that reference. These named`,
    ' * exports are the server-usable form; the dot access still works in client components.',
    ' */',
    ...aliases,
    `export { ${names.join(', ')} }`,
    '',
  ].join('\n')

  source = `${source.trimEnd()}\n${block}`
  writeFileSync(file, source)

  // Re-export from the barrel so they reach the package entry point.
  const barrelPath = join(COMPONENTS, slug, 'index.ts')
  const barrel = readFileSync(barrelPath, 'utf8')
  if (!barrel.includes(names[0] ?? '')) {
    writeFileSync(
      barrelPath,
      `${barrel.trimEnd()}\nexport { ${names.join(', ')} } from './${slug}'\n`,
    )
  }

  touched += 1
  console.log(`add-compound-exports: ${slug} -> ${names.join(', ')}`)
}

console.log(`add-compound-exports: updated ${touched} component(s).`)
