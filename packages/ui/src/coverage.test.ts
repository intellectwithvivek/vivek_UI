/**
 * Every component must actually be rendered by a test, and by a test that runs axe.
 *
 * "1,588 tests passing" says nothing about *which* components they cover. A component can
 * be exported, documented, shipped and completely untested, and every gate stays green —
 * the suite has no idea it exists. The same goes for the accessibility claim: the README
 * says every component carries an axe assertion, and until this file that was a promise
 * rather than a check.
 *
 * The list is derived from the export barrels rather than written down here, so a new
 * component is in scope the moment it is exported, without anyone remembering to add it.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = __dirname

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

const testFiles = walk(SRC).filter((file) => /\.test\.tsx?$/.test(file))
const bodies = testFiles.map((file) => ({ file, text: readFileSync(file, 'utf8') }))

/**
 * Component names exported from a barrel.
 *
 * Value exports only — `export { Button }` counts, `export type { ButtonProps }` and
 * `export { type ButtonProps }` do not, since a type cannot be rendered. Names that do not
 * start with a capital are hooks or utilities and are out of scope.
 */
function exportedComponents(barrel: string): string[] {
  const source = readFileSync(join(SRC, barrel), 'utf8')
  const names = new Set<string>()

  for (const match of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const raw of (match[1] ?? '').split(',')) {
      const name =
        raw
          .trim()
          .split(/\s+as\s+/)[0]
          ?.trim() ?? ''
      if (name.startsWith('type ') || name === '') continue
      if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) continue
      names.add(name)
    }
  }
  return [...names]
}

/**
 * Exports that are not renderable components, so "is it rendered in a test" does not apply.
 * Each is a value the library exports for a different reason.
 */
const NOT_COMPONENTS = new Set([
  // A `<script>` body, exported as a string.
  'DEFAULT_STORAGE_KEY',
])

const components = [...exportedComponents('index.ts'), ...exportedComponents('charts/index.ts')]
  .filter((name) => !NOT_COMPONENTS.has(name))
  .sort()

/**
 * Every JSX spelling a component can be rendered under.
 *
 * Compound parts are exported twice: `AccordionItem` as a flat name and `Accordion.Item` as
 * a member of its parent. Tests overwhelmingly use the dot form, so checking only the flat
 * name reports three dozen well-tested parts as untested.
 */
function spellings(name: string): RegExp[] {
  const out = [new RegExp(`<${name}[\\s/>]`)]
  // Every exported name that prefixes this one is a candidate parent, not just the longest:
  // `NavbarLinks` is `Navbar.Links`, but `NavbarLink` also prefixes it, and taking the
  // longest match alone produces `<NavbarLink.s`, which matches nothing.
  for (const parent of components) {
    if (parent === name || !name.startsWith(parent)) continue
    out.push(new RegExp(`<${parent}\\.${name.slice(parent.length)}[\\s/>]`))
  }
  return out
}

/** Test files whose source renders the component, under any of its spellings. */
const rendersIn = (name: string) =>
  bodies.filter(({ text }) => spellings(name).some((pattern) => pattern.test(text)))

describe('test coverage of the exported surface', () => {
  it('found the export barrels and the test files', () => {
    // Guards the whole suite against passing because a path moved and both lists went empty.
    expect(components.length).toBeGreaterThan(80)
    expect(testFiles.length).toBeGreaterThan(20)
  })

  it('renders every exported component in at least one test', () => {
    const untested = components.filter((name) => rendersIn(name).length === 0)
    expect(untested, 'exported, shipped, and never rendered by a test').toEqual([])
  })

  it('covers every exported component by a suite that runs axe', () => {
    // The README states this outright. Rendering a component in a file with no axe
    // assertion satisfies the test above and none of the accessibility claim.
    const unchecked = components.filter(
      (name) => !rendersIn(name).some(({ text }) => /toHaveNoViolations/.test(text)),
    )
    expect(unchecked, 'rendered only in test files that never call axe').toEqual([])
  })
})

describe('the shape of the test suite', () => {
  it('has no focused tests, which would silently skip everything else in the file', () => {
    const focused = bodies
      .filter(({ text }) => /\b(?:it|test|describe)\.only\(/.test(text))
      .map(({ file }) => file.slice(SRC.length + 1))
    expect(focused).toEqual([])
  })

  it('has no skipped tests left behind', () => {
    // `describe.skipIf` is legitimate — it is how the build-output suites opt out when
    // there is no build. A bare `.skip` is a test someone turned off and forgot.
    const skipped = bodies
      .filter(({ text }) => /\b(?:it|test|describe)\.skip\(/.test(text))
      .map(({ file }) => file.slice(SRC.length + 1))
    expect(skipped).toEqual([])
  })
})
