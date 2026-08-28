#!/usr/bin/env node
/**
 * Generate the docs registry from the library itself.
 *
 * 83 components cannot be documented by hand without going stale, so nothing here is
 * hand-written: descriptions come from each component's own JSDoc, prop tables from the
 * emitted `.d.ts` files via the TypeScript compiler API, and the client/server split from
 * the actual `'use client'` directives.
 *
 * Output: `apps/docs/registry.json`, consumed by the docs pages.
 *
 * Run with --check in CI to fail when the registry is stale.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const HERE = dirname(fileURLToPath(import.meta.url))
const DOCS = resolve(HERE, '..')
const LIB = resolve(DOCS, '..', '..', 'packages', 'ui')
const SRC = join(LIB, 'src')
const DIST = join(LIB, 'dist')
const OUT = join(DOCS, 'registry.json')

const CATEGORIES = {
  Layout: [
    'box',
    'stack',
    'grid',
    'container',
    'section',
    'divider',
    'aspect-ratio',
    'bento-grid',
    'scroll-area',
    'infinite-scroll',
  ],
  Typography: ['heading', 'text', 'code', 'kbd', 'prose'],
  Actions: ['button', 'icon-button', 'button-group', 'copy-button'],
  Forms: [
    'field',
    'form',
    'label',
    'input',
    'textarea',
    'select',
    'listbox',
    'checkbox',
    'radio-group',
    'segmented',
    'switch',
    'slider',
    'password-input',
    'otp-input',
    'time-picker',
    'number-input',
    'rating',
    'tag-input',
    'chip',
    'file-upload',
    'combobox',
    'calendar',
    'date-picker',
    'date-range-picker',
  ],
  Overlays: [
    'modal',
    'lightbox',
    'drawer',
    'tabs',
    'accordion',
    'tooltip',
    'hover-card',
    'popover',
    'dropdown-menu',
    'context-menu',
    'toast',
    'portal',
  ],
  Navigation: ['navbar', 'sidebar', 'breadcrumb', 'anchor-nav', 'pagination', 'command-palette'],
  'Data display': [
    'table',
    'data-table',
    'editable-grid',
    'virtual-list',
    'file-tree',
    'kanban-board',
    'scheduler',
    'card',
    'badge',
    'avatar',
    'qr-code',
    'timeline',
    'stepper',
  ],
  'AI chat': ['chat-thread', 'chat-message', 'chat-input', 'typing-indicator', 'chat-code-block'],
  Feedback: ['alert', 'spinner', 'skeleton', 'progress', 'empty-state'],
  Sections: [
    'hero',
    'feature-grid',
    'pricing',
    'testimonials',
    'faq',
    'cta',
    'stats',
    'footer',
    'logo-cloud',
    'newsletter',
  ],
  'Media & time': [
    'carousel',
    'marquee',
    'animated-counter',
    'countdown',
    'clock',
    'relative-time',
    'image',
    'video-player',
    'audio-player',
    'map-embed',
  ],
  Theming: ['theme-provider', 'theme-toggle'],
}

/**
 * A component with no category lands in a group the sidebar does not render, so it ships
 * invisible - which is how seven of them once did. Failing here is the only way that gets
 * noticed.
 */
const categoryOf = (slug) => {
  const found = Object.entries(CATEGORIES).find(([, slugs]) => slugs.includes(slug))?.[0]
  if (!found) {
    console.error(
      `gen-registry: "${slug}" is in no category, so it would not appear in the sidebar. ` +
        'Add it to CATEGORIES in scripts/gen-registry.mjs.',
    )
    process.exit(1)
  }
  return found
}

/** Title-case a slug: `data-table` -> `Data table`. */
const titleOf = (slug) => {
  const words = slug.split('-')
  const first = words[0] ?? ''
  return [first.charAt(0).toUpperCase() + first.slice(1), ...words.slice(1)].join(' ')
}

/** Does this source file's directive prologue contain 'use client'? */
function isClientFile(file) {
  const source = readFileSync(file, 'utf8').replace(/^﻿/, '').trimStart()
  return source.startsWith(`'use client'`) || source.startsWith('"use client"')
}

/**
 * The component's own JSDoc summary, read from its declared symbol.
 *
 * Deliberately NOT a regex over the source. The previous version scanned backwards for
 * the nearest `/** … *\/` followed by the declaration, and whenever a component's JSDoc
 * did not sit *directly* above it — an interface or a helper in between — the match
 * swallowed everything in the gap. 29 of 89 entries ended up with a "description" that
 * was raw interface source, comment markers and all, printed on the page.
 *
 * The checker knows exactly which comment belongs to which symbol, so it cannot drift.
 */
/** Paragraph break: a newline, optional horizontal whitespace, another newline. */
const BLANK_LINE = /\n[ \t]*\n/

function summaryFor(name) {
  const entry = declarations.get(name)
  if (!entry) return ''
  const symbol = checker.getSymbolAtLocation(entry.node.name)
  if (!symbol) return ''
  const docs = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim()
  if (!docs) return ''
  // First paragraph only: the rest is design rationale, valuable in the source but not a
  // one-line summary.
  const paragraph = docs.split(BLANK_LINE)[0] ?? ''
  return paragraph.replace(/\s+/g, ' ').trim()
}

/** Every value export a barrel declares, in order. */
function exportsFrom(barrel) {
  const values = []
  const types = []
  for (const match of barrel.matchAll(/export\s*\{([^}]*)\}/g)) {
    const isTypeClause = /export\s+type\s*\{/.test(match[0])
    for (const raw of match[1].split(',')) {
      const name = raw.trim()
      if (!name) continue
      if (isTypeClause || name.startsWith('type ')) types.push(name.replace(/^type\s+/, ''))
      else values.push(name)
    }
  }
  return { values, types }
}

// --- props extraction via the TypeScript compiler API ------------------------------

const dtsFiles = []
function collectDts(dir) {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) collectDts(full)
    else if (entry.name.endsWith('.d.ts')) dtsFiles.push(full)
  }
}
collectDts(DIST)

if (dtsFiles.length === 0) {
  console.error('gen-registry: no .d.ts files found. Build the library first.')
  process.exit(1)
}

const program = ts.createProgram(dtsFiles, {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
  noEmit: true,
  jsx: ts.JsxEmit.ReactJSX,
})
const checker = program.getTypeChecker()

/** Props declarations found in the emitted .d.ts, keyed by name. */
const interfaces = new Map()
const aliases = new Map()
/** Value declarations (`declare const Button: …`), for reading a component's own JSDoc. */
const declarations = new Map()
for (const file of program.getSourceFiles()) {
  if (!file.fileName.includes('dist')) continue
  ts.forEachChild(file, (node) => {
    if (ts.isInterfaceDeclaration(node)) interfaces.set(node.name.text, { node, file })
    else if (ts.isTypeAliasDeclaration(node)) aliases.set(node.name.text, { node, file })
    else if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          declarations.set(declaration.name.text, { node: declaration, file })
        }
      }
    } else if (ts.isFunctionDeclaration(node) && node.name) {
      declarations.set(node.name.text, { node, file })
    }
  })
}

const HOST_ATTRIBUTE_PARENTS = /HTMLAttributes|AriaAttributes|DOMAttributes|SVGAttributes/

/** Prop rows for one resolved type, straight from the checker. */
function rowsFromType(type, location) {
  const rows = []
  for (const symbol of checker.getPropertiesOfType(type)) {
    const declaration = symbol.declarations?.[0]
    const typeText = checker.typeToString(
      checker.getTypeOfSymbolAtLocation(symbol, declaration ?? location),
    )
    const defaultTag = symbol
      .getJsDocTags()
      .find((tag) => tag.name === 'default' || tag.name === 'defaultValue')
    rows.push({
      name: symbol.getName(),
      type: typeText.replace(/\s+/g, ' '),
      required: !(symbol.flags & ts.SymbolFlags.Optional),
      description: ts
        .displayPartsToString(symbol.getDocumentationComment(checker))
        .replace(/\s+/g, ' ')
        .trim(),
      default: defaultTag ? ts.displayPartsToString(defaultTag.text ?? []).trim() : '',
    })
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Resolve a props *type alias*.
 *
 * Six components take a discriminated union rather than a single interface — `Slider`
 * (single vs range), `Calendar` and `Combobox` (single vs multiple), `Accordion` (single
 * vs multiple). A union has no single member list, so each branch is documented
 * separately with the shared members listed once. Reporting "no props" for these, which
 * is what an interface-only reader does, would silently hide six of the most complex
 * components in the library.
 */
function propsFromAlias(name) {
  const entry = aliases.get(name)
  if (!entry) return null
  const declared = checker.getTypeAtLocation(entry.node.name)
  const location = entry.node

  // Intersections that wrap a union (Base & (A | B)) still resolve to a union here.
  if (declared.isUnion()) {
    const branches = declared.types.map((branch, index) => ({
      label: checker.typeToString(branch).slice(0, 60),
      index,
      props: rowsFromType(branch, location),
    }))
    // Members present in every branch are shared; the rest belong to their branch.
    const common =
      branches[0]?.props.filter((row) =>
        branches.every((b) => b.props.some((p) => p.name === row.name && p.type === row.type)),
      ) ?? []
    const commonNames = new Set(common.map((row) => row.name))
    return {
      props: common,
      variants: branches.map((branch) => ({
        label: branch.label,
        props: branch.props.filter((row) => !commonNames.has(row.name)),
      })),
      spreadsHostProps: common.some((row) => row.name === 'className'),
      extends: [entry.node.type.getText(entry.file).replace(/\s+/g, ' ')],
    }
  }

  return {
    props: rowsFromType(declared, location),
    spreadsHostProps: false,
    extends: [entry.node.type.getText(entry.file).replace(/\s+/g, ' ')],
  }
}

/**
 * Read one props interface into a serialisable list.
 *
 * Inherited host-element attributes are deliberately not expanded: nobody needs 250 rows
 * of `onCopy` / `onDrag` in a props table. They are summarised as one note instead.
 */
function propsFor(name) {
  const entry = interfaces.get(name)
  if (!entry) return propsFromAlias(name)

  const props = []
  let spreadsHostProps = false
  const extendsNames = []

  for (const clause of entry.node.heritageClauses ?? []) {
    for (const type of clause.types) {
      const text = type.getText(entry.file)
      extendsNames.push(text)
      if (HOST_ATTRIBUTE_PARENTS.test(text)) spreadsHostProps = true
    }
  }

  for (const member of entry.node.members) {
    if (!ts.isPropertySignature(member) || !member.name) continue
    const propName = member.name.getText(entry.file)
    const symbol = checker.getSymbolAtLocation(member.name)
    const docs = symbol ? ts.displayPartsToString(symbol.getDocumentationComment(checker)) : ''
    const typeText = member.type ? member.type.getText(entry.file).replace(/\s+/g, ' ') : 'unknown'
    const defaultTag = symbol
      ?.getJsDocTags()
      .find((tag) => tag.name === 'default' || tag.name === 'defaultValue')
    props.push({
      name: propName,
      type: typeText,
      required: member.questionToken === undefined,
      description: docs.replace(/\s*\n\s*/g, ' ').trim(),
      default: defaultTag ? ts.displayPartsToString(defaultTag.text ?? []).trim() : '',
    })
  }

  return { props, spreadsHostProps, extends: extendsNames }
}

// --- walk the component and chart directories --------------------------------------

function scan(root, kind) {
  const dirs = readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'internal')
    .map((e) => e.name)
    .sort()

  const entries = []
  const skipped = []

  for (const slug of dirs) {
    const barrelPath = join(root, slug, 'index.ts')
    const implPath = join(root, slug, `${slug}.tsx`)
    if (!existsSync(barrelPath)) {
      skipped.push(`${slug} (no barrel)`)
      continue
    }
    const barrel = readFileSync(barrelPath, 'utf8')
    const { values, types } = exportsFrom(barrel)
    if (values.length === 0) {
      skipped.push(`${slug} (no value exports)`)
      continue
    }

    // The primary export is the one named after the directory, not simply the first in
    // the barrel: `prose` exports `isSafeHref` first, and `theme-provider` exports
    // `createThemeScript` first, so taking values[0] looked for `isSafeHrefProps` and
    // silently reported "no props" for both.
    const pascal = slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    const primary =
      values.find((name) => name.toLowerCase() === pascal.toLowerCase()) ??
      values.find((name) => `${name}Props` in Object.fromEntries(types.map((t) => [t, true]))) ??
      values[0]
    const propsName = types.find((t) => t === `${primary}Props`) ?? `${primary}Props`

    entries.push({
      slug,
      title: kind === 'chart' ? primary : titleOf(slug),
      kind,
      category: kind === 'chart' ? 'Charts' : categoryOf(slug),
      exports: values,
      typeExports: types,
      primary,
      description: summaryFor(primary),
      isClient: existsSync(implPath) ? isClientFile(implPath) : false,
      api: propsFor(propsName),
      compound: values.length > 1,
    })
  }

  return { entries, skipped }
}

const components = scan(join(SRC, 'components'), 'component')
const charts = scan(join(SRC, 'charts'), 'chart')

const libraryVersion = JSON.parse(readFileSync(join(LIB, 'package.json'), 'utf8')).version

const registry = {
  version: libraryVersion,
  generatedFrom: 'packages/ui — do not edit by hand, run `pnpm gen:registry`',
  categories: [...Object.keys(CATEGORIES), 'Charts'],
  components: components.entries,
  charts: charts.entries,
}

const serialised = `${JSON.stringify(registry, null, 2)}\n`

if (process.argv.includes('--check')) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : ''
  if (current !== serialised) {
    console.error('gen-registry: registry.json is out of date. Run `pnpm gen:registry`.')
    process.exit(1)
  }
  console.log(
    `gen-registry: OK - ${registry.components.length} components, ${registry.charts.length} charts.`,
  )
} else {
  writeFileSync(OUT, serialised)
  const withProps = registry.components.filter((c) => c.api && c.api.props.length > 0).length
  const withDesc = registry.components.filter((c) => c.description).length
  console.log(
    `gen-registry: ${registry.components.length} components, ${registry.charts.length} charts.\n` +
      `  prop tables generated : ${withProps}/${registry.components.length}\n` +
      `  descriptions found    : ${withDesc}/${registry.components.length}\n` +
      `  client components     : ${registry.components.filter((c) => c.isClient).length}`,
  )
  const noProps = registry.components.filter((c) => !c.api || c.api.props.length === 0)
  if (noProps.length > 0) {
    console.warn(`  no props resolved     : ${noProps.map((c) => c.slug).join(', ')}`)
  }
}

for (const note of [...components.skipped, ...charts.skipped]) {
  console.warn(`gen-registry: skipped ${note}`)
}
