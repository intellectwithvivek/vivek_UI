/**
 * Make arbitrary pasted source runnable inside the playground.
 *
 * The playground evaluates code with `new Function`, which is a *script* body — ESM
 * syntax is a hard syntax error there. So `export default function Page()`, which is how
 * every example on this site is written, failed with "Unexpected token 'default'". Anyone
 * copying a docs snippet into the playground hit it immediately.
 *
 * Rather than telling people to edit their code, this normalises it:
 *
 *   - `import` statements are dropped. Every library export, plus React, is already in
 *     scope, so the imports are noise rather than information.
 *   - `export default function X` / `export function X` / `export const X` lose the
 *     keyword and stay ordinary declarations.
 *   - `export { … }` lists are dropped.
 *   - The component to render is resolved by preference: an `App`, then whatever was
 *     exported as default, then the first function with a capitalised name.
 *
 * Deliberately string-based rather than a full parse: adding a parser to find an export
 * would mean shipping one, and these are the only forms real examples use. Anything it
 * cannot resolve produces a clear message instead of a blank preview.
 */
export interface PreparedSource {
  /** Script-safe code, ready for `new Function`. */
  code: string
  /** Expression that evaluates to the component to render. */
  resolver: string
  /** Names that were exported, for the error message when none can be rendered. */
  candidates: string[]
}

const DEFAULT_ALIAS = '__vkDefaultExport'

export function prepareSource(source: string): PreparedSource {
  const candidates: string[] = []
  let sawDefault = false

  const lines = source.split('\n')
  const out: string[] = []

  let inImport = false
  let inExportList = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Multi-line `import { … } from '…'`.
    if (inImport) {
      if (
        /from\s+['"][^'"]+['"]\s*;?$/.test(trimmed) ||
        trimmed.endsWith("'") ||
        trimmed.endsWith('"')
      ) {
        inImport = false
      }
      continue
    }
    if (/^import[\s{*'"]/.test(trimmed)) {
      // Single-line if it already reaches its source string.
      if (
        !/from\s+['"][^'"]+['"]\s*;?$/.test(trimmed) &&
        !/^import\s+['"][^'"]+['"]\s*;?$/.test(trimmed)
      ) {
        inImport = true
      }
      continue
    }

    // Multi-line `export { … }`.
    if (inExportList) {
      if (trimmed.includes('}')) inExportList = false
      continue
    }
    if (/^export\s*\{/.test(trimmed)) {
      if (!trimmed.includes('}')) inExportList = true
      continue
    }

    // `export default function Name(…)`
    const namedDefault = /^export\s+default\s+(function\s*\*?\s+|class\s+)(\w+)/.exec(trimmed)
    if (namedDefault) {
      sawDefault = true
      candidates.push(namedDefault[2] as string)
      out.push(
        line.replace(/^\s*export\s+default\s+/, (match) =>
          match.replace(/export\s+default\s+/, ''),
        ),
      )
      continue
    }

    // `export default function (…)` or `export default () => …` or `export default Name`
    if (/^export\s+default\s+/.test(trimmed)) {
      sawDefault = true
      candidates.push(DEFAULT_ALIAS)
      out.push(line.replace(/^(\s*)export\s+default\s+/, `$1const ${DEFAULT_ALIAS} = `))
      continue
    }

    // `export function X` / `export const X` / `export class X`
    const namedExport =
      /^export\s+(async\s+)?(function\s*\*?\s+|const\s+|let\s+|var\s+|class\s+)(\w+)/.exec(trimmed)
    if (namedExport) {
      candidates.push(namedExport[3] as string)
      out.push(line.replace(/^(\s*)export\s+/, '$1'))
      continue
    }

    out.push(line)
  }

  const code = out.join('\n')

  // Anything that looks like a component declaration, so `function Dashboard()` with no
  // export at all still renders.
  const declared = [...code.matchAll(/(?:function|const|class)\s+([A-Z]\w*)/g)].map(
    (match) => match[1] as string,
  )
  const preference = ['App', ...(sawDefault ? candidates : []), ...candidates, ...declared].filter(
    (name, index, all) => name && all.indexOf(name) === index,
  )

  // Guarded with typeof so a name that did not actually make it into scope cannot throw
  // a ReferenceError in place of a useful message.
  const resolver = preference.length
    ? preference.map((name) => `(typeof ${name} !== 'undefined' ? ${name} : null)`).join(' || ')
    : 'null'

  return { code, resolver, candidates: preference }
}
