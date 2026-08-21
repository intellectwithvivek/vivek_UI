/**
 * Join class names, dropping anything falsy.
 *
 * This is why the library does not depend on `clsx` (ARCHITECTURE §4.2) — the five
 * lines below cover every case the component contract needs. Internal utility:
 * deliberately NOT exported from the package entry point, so it stays refactorable.
 */
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}
