/**
 * Turn a TypeScript example into idiomatic JavaScript.
 *
 * The library ships types, but plenty of people write plain JS, and "here is the TS
 * version, delete the types yourself" is not documentation. This is a deliberately small
 * transform over the shapes the examples actually use — not a general TS compiler, which
 * would mean shipping one to the browser.
 *
 * Each rule below exists because an example hits it. If an example needs a construct not
 * handled here, the honest fix is to add a rule, not to leave a broken JS tab.
 */
export function toJavaScript(source: string): string {
  const lines = source.split('\n')
  const out: string[] = []

  let depth = 0
  let inTypeBlock = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Drop whole `interface X { ... }` and `type X = { ... }` declarations.
    if (!inTypeBlock && /^(export\s+)?(interface|type)\s+\w/.test(trimmed)) {
      const opens = (trimmed.match(/\{/g) ?? []).length
      const closes = (trimmed.match(/\}/g) ?? []).length
      // A one-line alias (`type Row = { a: string }` or `type X = 'a' | 'b'`) ends here.
      if (trimmed.endsWith(';') || trimmed.endsWith('}') || opens === closes) continue
      inTypeBlock = true
      depth = opens - closes
      continue
    }
    if (inTypeBlock) {
      depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length
      if (depth <= 0) inTypeBlock = false
      continue
    }

    let next = line

    // `import { Button, type ButtonProps } from '…'` -> drop the type specifiers, and
    // drop the whole statement if nothing but types remain.
    if (/^\s*import\s/.test(next)) {
      if (/^\s*import\s+type\s/.test(next)) continue
      next = next.replace(/\{([^}]*)\}/, (_all, inner: string) => {
        const kept = inner
          .split(',')
          .map((part) => part.trim())
          .filter((part) => part && !part.startsWith('type '))
        return `{ ${kept.join(', ')} }`
      })
      if (/\{\s*\}/.test(next)) continue
      out.push(next)
      continue
    }

    // `satisfies X` and `as X` assertions.
    next = next.replace(/\s+satisfies\s+[\w.<>[\]|'"\s,{}]+$/, '')
    next = next.replace(/\s+as\s+(?:const|[A-Z][\w.<>[\]|'"\s,]*)(?=[,)\];}]|$)/g, '')

    // Generic call and JSX type arguments: `useState<string>(…)`, `<DataTable<Row> …>`.
    next = next.replace(/\b(useState|useRef|useMemo|useCallback|createRef)<[^>]*>/g, '$1')
    next = next.replace(/(<[A-Z]\w*)<[^>]*>/g, '$1')

    // Typed function parameters: `(row: Row, index: number) =>`.
    next = next.replace(/\(([^()]*)\)\s*=>/g, (all, params: string) => {
      if (!params.includes(':')) return all
      const stripped = params
        .split(',')
        .map((param) => param.split(':')[0]?.trim() ?? '')
        .filter(Boolean)
        .join(', ')
      return `(${stripped}) =>`
    })

    // Variable annotations: `const cols: Column<Row>[] = [`.
    next = next.replace(/\b(const|let|var)\s+(\w+)\s*:\s*[\w.<>[\]|'"\s,{}]+?\s*=/g, '$1 $2 =')

    // A non-null assertion has no JavaScript equivalent; dropping it is correct.
    next = next.replace(/!\./g, '.').replace(/!\)/g, ')')

    out.push(next)
  }

  // Collapse the blank lines a removed import block leaves behind.
  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
