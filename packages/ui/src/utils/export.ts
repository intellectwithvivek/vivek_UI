/**
 * Data-export helpers: CSV text, a browser download, and print-to-PDF.
 *
 * Zero dependencies, by the same rule as the rest of the library (ARCHITECTURE §1) —
 * no `papaparse`, no `file-saver`, no `jspdf`. Everything here is either string work or
 * three DOM calls.
 *
 * These live in `utils/` and are therefore NOT exported from the package entry point
 * yet; see the note in the report about the `src/index.ts` line they need.
 */

/**
 * The shape `toCsv` needs from a column.
 *
 * Deliberately structural and React-free: `DataTable`'s `Column<Row>` satisfies it, so
 * `toCsv(rows, columns)` works with the very same array you passed to the table, but
 * nothing here imports from `components/` and nothing here needs React.
 */
export interface CsvColumn<Row> {
  /** Property of `Row` to read, unless `csvValue`/`sortAccessor` overrides it. */
  key: string
  /** Used as the CSV heading when it is a string or number. */
  header?: unknown
  /** Explicit CSV heading. Wins over `header` — use it when `header` is JSX. */
  csvHeader?: string
  /** Skipped unless `includeHidden` is set. */
  hidden?: boolean
  /**
   * `DataTable`'s accessor for computed columns. Reused here so a column that renders
   * something derived (`fullName`, `total`) exports the derived value rather than
   * `undefined`.
   */
  sortAccessor?: (row: Row) => unknown
  /** Export-only accessor. Wins over `sortAccessor` and over reading `key`. */
  csvValue?: (row: Row) => unknown
}

export interface EscapeCsvOptions {
  /** Field separator to escape against. Default `','`. */
  delimiter?: string
  /** Neutralise leading formula characters. Default `true`. Turn it off at your peril. */
  formulaGuard?: boolean
  /** Text for `null` / `undefined`. Default `''`. */
  nullish?: string
}

export interface ToCsvOptions<Row> extends EscapeCsvOptions {
  /**
   * Prepend a UTF-8 byte order mark. Default `false`.
   *
   * Excel on Windows assumes the local ANSI codepage for a BOM-less CSV, which turns
   * `é` into `Ã©`; the BOM is what makes it read the file as UTF-8.
   */
  bom?: boolean
  /** Emit the heading row. Default `true`. */
  header?: boolean
  /** Row separator. Default `'\r\n'` (RFC 4180, and what Excel prefers). */
  newline?: string
  /** Include columns marked `hidden`. Default `false`. */
  includeHidden?: boolean
  /** Last chance to transform a cell before it is stringified and escaped. */
  formatValue?: (value: unknown, row: Row, column: CsvColumn<Row>) => unknown
}

/**
 * Characters a spreadsheet treats as "this cell is a formula".
 *
 * `=`, `+`, `-` and `@` are the four everyone knows. Tab and carriage return are here
 * because Excel strips leading whitespace before deciding, so a field starting with a
 * tab and then `=` is a live formula too (OWASP CSV Injection).
 */
const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'] as const

/** A value whose text form is machine-generated, so guarding it would only corrupt it. */
function isNonTextValue(value: unknown): boolean {
  return (
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    typeof value === 'boolean' ||
    value instanceof Date
  )
}

function stringifyValue(value: unknown, nullish: string): string {
  if (value === null || value === undefined) return nullish
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString()
  if (typeof value === 'string') return value
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''
  if (typeof value === 'bigint' || typeof value === 'boolean') return String(value)
  try {
    // Objects and arrays: JSON keeps them in one field instead of spraying delimiters.
    return JSON.stringify(value) ?? ''
  } catch {
    // Circular, or a toJSON that throws.
    return ''
  }
}

/**
 * One CSV field: stringified, formula-guarded, and quoted only when it has to be.
 *
 * Two separate jobs, in this order:
 *
 * 1. **Formula guard.** A leading `=`/`+`/`-`/`@`/tab/CR gets a single-quote prefix, so
 *    `=1+1` arrives as text and a `=HYPERLINK(...)` payload never runs. Quoting alone
 *    would NOT prevent this — a spreadsheet evaluates the *content* of a quoted field.
 *    Values that are genuinely numbers, bigints, booleans or Dates are exempt, because
 *    prefixing `-5` would turn a number into the text `'-5`. A *string* `'-5'` is still
 *    guarded: it came from data we do not control.
 * 2. **RFC 4180 quoting.** Wrap in double quotes if the field contains the delimiter, a
 *    double quote, CR or LF, and double every embedded quote.
 */
export function escapeCsvValue(value: unknown, options: EscapeCsvOptions = {}): string {
  const { delimiter = ',', formulaGuard = true, nullish = '' } = options
  let text = stringifyValue(value, nullish)

  if (formulaGuard && !isNonTextValue(value)) {
    const first = text.charAt(0)
    if (FORMULA_TRIGGERS.some((trigger) => trigger === first)) text = `'${text}`
  }

  const mustQuote =
    (delimiter !== '' && text.includes(delimiter)) ||
    text.includes('"') ||
    text.includes('\n') ||
    text.includes('\r')

  return mustQuote ? `"${text.replaceAll('"', '""')}"` : text
}

function readCell<Row>(row: Row, column: CsvColumn<Row>): unknown {
  if (column.csvValue) return column.csvValue(row)
  if (column.sortAccessor) return column.sortAccessor(row)
  if (row !== null && typeof row === 'object') return (row as Record<string, unknown>)[column.key]
  return undefined
}

function headerText<Row>(column: CsvColumn<Row>): string {
  if (typeof column.csvHeader === 'string') return column.csvHeader
  if (typeof column.header === 'string') return column.header
  if (typeof column.header === 'number') return String(column.header)
  // JSX, an icon, undefined: the key is the only thing left that means anything.
  return column.key
}

/**
 * Rows plus columns to a CSV string. Pure — nothing here touches the DOM, so it runs on
 * a server just as happily.
 */
export function toCsv<Row>(
  rows: readonly Row[],
  columns: readonly CsvColumn<Row>[],
  options: ToCsvOptions<Row> = {},
): string {
  const {
    delimiter = ',',
    bom = false,
    header = true,
    newline = '\r\n',
    includeHidden = false,
    formatValue,
    formulaGuard = true,
    nullish = '',
  } = options

  const used = includeHidden ? columns : columns.filter((column) => !column.hidden)
  const escapeOptions: EscapeCsvOptions = { delimiter, formulaGuard, nullish }
  const lines: string[] = []

  if (header) {
    const headings = used.map((column) => escapeCsvValue(headerText(column), escapeOptions))
    lines.push(headings.join(delimiter))
  }

  for (const row of rows) {
    const cells = used.map((column) => {
      const raw = readCell(row, column)
      const value = formatValue ? formatValue(raw, row, column) : raw
      return escapeCsvValue(value, escapeOptions)
    })
    lines.push(cells.join(delimiter))
  }

  return `${bom ? '\uFEFF' : ''}${lines.join(newline)}`
}

/**
 * Hand a CSV string to the browser as a file download.
 *
 * A no-op returning `false` anywhere there is no `document` (server render, a Node
 * script, a worker) — importing this module must never be the thing that breaks SSR.
 */
export function downloadCsv(filename: string, csv: string, mimeType?: string): boolean {
  if (typeof document === 'undefined') return false
  if (typeof Blob === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) {
    return false
  }

  const blob = new Blob([csv], { type: mimeType ?? 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  link.style.display = 'none'

  // Firefox will not follow a click on a detached anchor, hence the round trip.
  document.body.append(link)
  try {
    link.click()
  } finally {
    link.remove()
    // The download is already queued against the blob by the time click() returns, so
    // the object URL can go now rather than leaking for the life of the document.
    URL.revokeObjectURL(url)
  }
  return true
}

/** An element, or any ref-like object holding one. */
export type PrintTarget = Element | { readonly current: Element | null } | null | undefined

export interface PrintElementOptions {
  /**
   * Temporarily replace `document.title`. Browsers use it for the page header and for
   * the default filename of a "Save as PDF", which is the only naming control we get.
   */
  documentTitle?: string
  /** Called once printing is done (or immediately, if the browser never tells us). */
  onAfterPrint?: () => void
}

const PRINTING_ATTRIBUTE = 'data-vk-printing'
const PRINT_ROOT_ATTRIBUTE = 'data-vk-print-root'

function resolvePrintTarget(target: PrintTarget): Element | null {
  if (!target) return null
  if ('current' in target) return target.current
  return target
}

/**
 * Open the browser's print dialog with only one element in scope.
 *
 * **This is browser printing, not PDF generation.** There is no PDF encoder in this
 * package and there never will be — that is a megabyte of dependency. What happens is:
 * the element is tagged, `styles/print.css` hides everything else inside `@media print`,
 * and `window.print()` runs. The user then picks a printer or "Save as PDF", and their
 * browser does the actual PDF writing. So: no server round trip, no bundle cost, and no
 * control over pagination beyond what CSS `break-*` gives us.
 *
 * Requires `styles/print.css` to be loaded, and returns `false` (never throws) when
 * there is no document, no element, or no `window.print`.
 */
export function printElement(target: PrintTarget, options: PrintElementOptions = {}): boolean {
  if (typeof document === 'undefined' || typeof window === 'undefined') return false

  const element = resolvePrintTarget(target)
  if (!element) return false

  const root = document.documentElement
  const previousTitle = document.title
  // A second call while one is still tagged would otherwise print both elements.
  for (const stale of Array.from(document.querySelectorAll(`[${PRINT_ROOT_ATTRIBUTE}]`))) {
    stale.removeAttribute(PRINT_ROOT_ATTRIBUTE)
  }

  element.setAttribute(PRINT_ROOT_ATTRIBUTE, '')
  root.setAttribute(PRINTING_ATTRIBUTE, '')
  if (options.documentTitle !== undefined) document.title = options.documentTitle

  let done = false
  const cleanup = () => {
    if (done) return
    done = true
    window.removeEventListener('afterprint', cleanup)
    element.removeAttribute(PRINT_ROOT_ATTRIBUTE)
    root.removeAttribute(PRINTING_ATTRIBUTE)
    if (options.documentTitle !== undefined) document.title = previousTitle
    options.onAfterPrint?.()
  }

  window.addEventListener('afterprint', cleanup)

  if (typeof window.print !== 'function') {
    cleanup()
    return false
  }

  try {
    window.print()
  } catch {
    cleanup()
    return false
  }

  // Chrome and Firefox block inside print() and then fire afterprint; Safari has been
  // known to do neither. 'onafterprint' in window tells us whether waiting is safe.
  if (!('onafterprint' in window)) cleanup()
  return true
}
