import { fireEvent, render, screen } from '@testing-library/react'
import { createRef, forwardRef, type HTMLAttributes } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { mergeRefs, Slot } from './slot'

/* ------------------------------------------------------------------ mergeRefs */

describe('mergeRefs', () => {
  it('feeds callback refs and object refs alike', () => {
    const object = createRef<HTMLDivElement>()
    const callback = vi.fn()
    const setRef = mergeRefs<HTMLDivElement>(object, callback)

    render(<div ref={setRef}>x</div>)

    expect(object.current).toBeInstanceOf(HTMLDivElement)
    expect(callback).toHaveBeenCalledWith(object.current)
  })

  it('ignores null and undefined entries', () => {
    const object = createRef<HTMLDivElement>()
    const setRef = mergeRefs<HTMLDivElement>(null, undefined, object)

    expect(() => render(<div ref={setRef}>x</div>)).not.toThrow()
    expect(object.current).toBeInstanceOf(HTMLDivElement)
  })

  it('passes null through on unmount', () => {
    const object = createRef<HTMLDivElement>()
    const { unmount } = render(<div ref={mergeRefs<HTMLDivElement>(object)}>x</div>)

    expect(object.current).not.toBeNull()
    unmount()
    expect(object.current).toBeNull()
  })
})

/* ---------------------------------------------------------------------- Slot */

describe('Slot', () => {
  it('renders the child in its own place, with no wrapper element', () => {
    const { container } = render(
      <Slot data-testid="slotted">
        <a href="/docs">Docs</a>
      </Slot>,
    )

    expect(container.children).toHaveLength(1)
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('data-testid', 'slotted')
  })

  it('concatenates className instead of replacing it', () => {
    render(
      <Slot className="vk-navbar__link">
        <a href="/x" className="mine">
          X
        </a>
      </Slot>,
    )

    const link = screen.getByRole('link', { name: 'X' })
    expect(link).toHaveClass('vk-navbar__link', 'mine')
  })

  it('keeps our className when the child has none', () => {
    render(
      <Slot className="vk-navbar__link">
        <a href="/x">X</a>
      </Slot>,
    )
    expect(screen.getByRole('link', { name: 'X' })).toHaveClass('vk-navbar__link')
  })

  it('merges style, with the child winning on a shared property', () => {
    render(
      <Slot style={{ color: 'rgb(1, 2, 3)', margin: '4px' }}>
        <a href="/x" style={{ color: 'rgb(9, 9, 9)' }}>
          X
        </a>
      </Slot>,
    )

    const link = screen.getByRole('link', { name: 'X' })
    expect(link).toHaveStyle({ color: 'rgb(9, 9, 9)', margin: '4px' })
  })

  it('forwards arbitrary props onto the child', () => {
    render(
      <Slot aria-current="page" data-active="" href="/ours">
        <a href="/theirs">X</a>
      </Slot>,
    )

    const link = screen.getByRole('link', { name: 'X' })
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(link).toHaveAttribute('data-active', '')
    // The child's own value wins: an explicit prop on the element the consumer wrote is
    // the more specific intent.
    expect(link).toHaveAttribute('href', '/theirs')
  })

  it("preserves the child's own handler and still runs ours, child first", () => {
    const order: string[] = []
    const ours = vi.fn(() => order.push('slot'))
    const theirs = vi.fn(() => order.push('child'))

    render(
      <Slot onClick={ours}>
        <a href="/x" onClick={theirs}>
          X
        </a>
      </Slot>,
    )

    fireEvent.click(screen.getByText('X'))

    expect(theirs).toHaveBeenCalledTimes(1)
    expect(ours).toHaveBeenCalledTimes(1)
    expect(order).toEqual(['child', 'slot'])
  })

  it("runs ours second, so the child's handler can preventDefault out of it", () => {
    let sawPrevented: boolean | null = null

    render(
      <Slot
        onClick={(event: { defaultPrevented: boolean }) => {
          sawPrevented = event.defaultPrevented
        }}
      >
        <a href="/x" onClick={(event) => event.preventDefault()}>
          X
        </a>
      </Slot>,
    )

    fireEvent.click(screen.getByText('X'))
    expect(sawPrevented).toBe(true)
  })

  it('merges its own ref with the ref already on the child', () => {
    const outer = createRef<HTMLAnchorElement>()
    const inner = createRef<HTMLAnchorElement>()

    render(
      <Slot ref={outer}>
        <a href="/x" ref={inner}>
          X
        </a>
      </Slot>,
    )

    const link = screen.getByRole('link', { name: 'X' })
    expect(outer.current).toBe(link)
    expect(inner.current).toBe(link)
  })

  it('reaches a forwardRef child, not just an intrinsic element', () => {
    const Fancy = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
      function Fancy(props, ref) {
        return <button ref={ref} type="button" {...props} />
      },
    )
    const outer = createRef<HTMLButtonElement>()

    render(
      <Slot ref={outer} className="ours">
        <Fancy className="theirs">Go</Fancy>
      </Slot>,
    )

    const button = screen.getByRole('button', { name: 'Go' })
    expect(outer.current).toBe(button)
    expect(button).toHaveClass('ours', 'theirs')
  })

  it("does not overwrite the child's children", () => {
    render(
      <Slot className="ours">
        <a href="/x">
          <span>Deep</span>
        </a>
      </Slot>,
    )
    expect(screen.getByText('Deep')).toBeInTheDocument()
  })

  it('throws for zero, several, or non-element children', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => render(<Slot />)).toThrow()
      expect(() =>
        render(
          <Slot>
            <a href="/a">A</a>
            <a href="/b">B</a>
          </Slot>,
        ),
      ).toThrow()
      expect(() => render(<Slot>plain text</Slot>)).toThrow()
    } finally {
      quiet.mockRestore()
    }
  })
})
