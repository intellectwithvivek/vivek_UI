// @vitest-environment jsdom
/**
 * The page-gallery demo frame.
 *
 * This exists because the first version of `PreviewFrame` never rendered anything, in any
 * viewport, and shipped that way. Every gate was green: it typechecked, it linted, the build
 * succeeded, and 221 tests passed — because not one of them could render a component and
 * look at the result. The failure was silent by construction: React portals into a detached
 * document without complaining, so the page showed an empty box and no error anywhere.
 *
 * The bug was `srcDoc`. At the moment the ref fires, `contentDocument` is the iframe's
 * *initial* `about:blank`, whose `readyState` is already `complete` — so the effect attached
 * to that document, and the browser then discarded it and installed the parsed `srcdoc` one
 * in its place. The portal target no longer belonged to the page.
 *
 * So the assertion that matters is the plain one: after mounting, are the children actually
 * inside the iframe's live document?
 */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { PreviewFrame } from './preview-frame'

let container: HTMLDivElement | null = null
let root: Root | null = null

function mount(node: React.ReactNode) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root?.render(node)
  })
  return container
}

afterEach(() => {
  act(() => root?.unmount())
  container?.remove()
  root = null
  container = null
})

const frameOf = (host: HTMLElement) => host.querySelector('iframe') as HTMLIFrameElement

describe('PreviewFrame', () => {
  it('renders an iframe with an accessible name', () => {
    const host = mount(
      <PreviewFrame title="Landing page — live demo">
        <p>hello</p>
      </PreviewFrame>,
    )
    expect(frameOf(host)).toHaveProperty('title', 'Landing page — live demo')
  })

  it('puts the children inside the frame document, not the host page', () => {
    // The whole point. Before the fix this found nothing at all.
    const host = mount(
      <PreviewFrame title="demo">
        <p data-testid="demo-content">The template rendered</p>
      </PreviewFrame>,
    )
    const inner = frameOf(host).contentDocument
    expect(inner?.body.querySelector('[data-testid="demo-content"]')).not.toBeNull()
    expect(inner?.body.textContent).toContain('The template rendered')
    // And not leaked into the host document, which would mean the media queries are the
    // outer viewport's and the responsive preview is a lie.
    expect(host.querySelector('[data-testid="demo-content"]')).toBeNull()
  })

  it('never sets srcDoc, which is what discarded the document', () => {
    const host = mount(
      <PreviewFrame title="demo">
        <p>x</p>
      </PreviewFrame>,
    )
    expect(frameOf(host).hasAttribute('srcdoc')).toBe(false)
  })

  it('copies the host stylesheets into the frame, once', () => {
    const style = document.createElement('style')
    style.textContent = '.vk-probe { color: rebeccapurple }'
    document.head.appendChild(style)
    try {
      const host = mount(
        <PreviewFrame title="demo">
          <p>x</p>
        </PreviewFrame>,
      )
      const frame = frameOf(host)
      // Firing `load` again must not double every rule in the sheet.
      act(() => {
        frame.dispatchEvent(new Event('load'))
      })
      const copied = [...(frame.contentDocument?.head.querySelectorAll('style') ?? [])].filter(
        (node) => node.textContent?.includes('vk-probe'),
      )
      expect(copied).toHaveLength(1)
    } finally {
      style.remove()
    }
  })

  it('mirrors the theme onto the frame, and keeps mirroring it', async () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    try {
      const host = mount(
        <PreviewFrame title="demo">
          <p>x</p>
        </PreviewFrame>,
      )
      const inner = frameOf(host).contentDocument
      expect(inner?.documentElement.getAttribute('data-theme')).toBe('dark')

      // A MutationObserver delivers on a microtask, so the change has to be awaited — and
      // the host attribute has to still be set when it lands, which is why the cleanup
      // below runs after the await rather than in a `finally` around a returned promise.
      document.documentElement.setAttribute('data-theme', 'light')
      await Promise.resolve()
      expect(inner?.documentElement.getAttribute('data-theme')).toBe('light')
    } finally {
      document.documentElement.removeAttribute('data-theme')
    }
  })

  it('offers three viewport widths and starts on desktop', () => {
    const host = mount(
      <PreviewFrame title="demo">
        <p>x</p>
      </PreviewFrame>,
    )
    const buttons = [...host.querySelectorAll('[aria-label="Preview width"] button')]
    expect(buttons.map((b) => b.textContent)).toEqual(['Phone', 'Tablet', 'Desktop'])
    expect(buttons.filter((b) => b.getAttribute('aria-pressed') === 'true')).toHaveLength(1)
    expect(buttons.at(-1)?.getAttribute('aria-pressed')).toBe('true')
  })

  it('resizes the frame when a narrower viewport is chosen', () => {
    const host = mount(
      <PreviewFrame title="demo">
        <p>x</p>
      </PreviewFrame>,
    )
    expect(frameOf(host).style.width).toBe('100%')

    const phone = [...host.querySelectorAll('button')].find((b) => b.textContent === 'Phone')
    act(() => {
      phone?.click()
    })
    expect(frameOf(host).style.width).toBe('390px')
  })

  it('keeps the children mounted across a width change', () => {
    // Switching width re-renders the iframe element's style. If that ever remounted the
    // iframe, the document would be replaced and the demo would vanish on the first click.
    const host = mount(
      <PreviewFrame title="demo">
        <p data-testid="demo-content">still here</p>
      </PreviewFrame>,
    )
    const before = frameOf(host).contentDocument
    const tablet = [...host.querySelectorAll('button')].find((b) => b.textContent === 'Tablet')
    act(() => {
      tablet?.click()
    })
    const after = frameOf(host).contentDocument
    expect(after).toBe(before)
    expect(after?.body.querySelector('[data-testid="demo-content"]')).not.toBeNull()
  })
})
