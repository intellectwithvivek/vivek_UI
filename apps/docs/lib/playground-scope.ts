/**
 * Build the identifier list the playground injects into `new Function`.
 *
 * This exists because of a bug that broke the playground for EVERY input, not just some.
 * The scope was assembled by spreading the library, chart and React namespace objects, and
 * their keys were passed straight to `new Function` as parameter names. Those namespaces
 * carry two keys that are not usable as parameters:
 *
 *   - `default`  — a reserved word
 *   - `module.exports` — not an identifier at all
 *
 * So `new Function(...)` threw `SyntaxError: Unexpected token 'default'` before it ever
 * looked at the user's code. The error was blamed on the pasted source for a while, which
 * it never was: nothing typed into the editor could have avoided it.
 *
 * Filtering here rather than at the call site keeps the rule in one testable place, and
 * the list of what got dropped is returned so the UI can surface it instead of silently
 * offering a smaller scope than it claims.
 */

/** Valid JS binding identifiers. Deliberately ASCII: every library export is ASCII. */
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/

/**
 * Reserved words and the handful of contextual keywords that cannot be a parameter name.
 * `new Function` accepts things like `await` at the top level of a non-async function, but
 * a name that is a keyword in *some* context is not worth the risk for a docs playground.
 */
const RESERVED = new Set([
  'arguments',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
])

/** Internal module plumbing that is never worth putting in scope. */
const INTERNAL = new Set(['__esModule', 'module.exports', 'default'])

export interface PlaygroundScope {
  /** Parameter names, safe to pass to `new Function`. */
  names: string[]
  /** Values, positionally aligned with `names`. */
  values: unknown[]
  /** Keys that were excluded, so the reason is inspectable rather than invisible. */
  dropped: string[]
}

export function buildScope(source: Record<string, unknown>): PlaygroundScope {
  const names: string[] = []
  const values: unknown[] = []
  const dropped: string[] = []

  for (const key of Object.keys(source)) {
    if (INTERNAL.has(key) || RESERVED.has(key) || !IDENTIFIER.test(key)) {
      dropped.push(key)
      continue
    }
    names.push(key)
    values.push(source[key])
  }

  return { names, values, dropped }
}

/**
 * Assert the list really is usable, before it reaches user code.
 *
 * The original failure mode was a syntax error from the *host* that read as a syntax error
 * in the *user's* code, which sent debugging in the wrong direction for a long time. This
 * compiles a trivial body with the same parameter list so a bad name is attributed here.
 */
export function assertBindable(names: readonly string[]): void {
  try {
    new Function(...names, 'return 0')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `playground scope is not bindable (${message}). This is a bug in the docs site, not in the code you wrote.`,
    )
  }
}
