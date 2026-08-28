/**
 * Resizable.
 *
 * jsdom has no layout, so the root's box is mocked for pointer maths; everything else -
 * the separator semantics, the keyboard contract, limits, persistence, control - is
 * plain DOM.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Resizable } from './resizable'

const sep = (name = 'Resize panels') => screen.getByRole('separator', { name })
const shares = () =>
  Array.from(document.querySelectorAll<HTMLElement>('.vk-resizable__panel')).map((p) =>
    Math.round(Number.parseFloat(p.style.getPropertyValue('--vk-resizable-size'))),
  )

function Two(props: Partial<Parameters<typeof Resizable>[0]> = {}) {
  return (
    <Resizable data-testid="root" {...props}>
      <Resizable.Panel minSize={20} maxSize={80}>
        Files
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel minSize={15}>Editor</Resizable.Panel>
    </Resizable>
  )
}

afterEach(() => {
  window.localStorage.clear()
})

describe('Resizable · structure', () => {
  it('renders with zero props as an empty flex row', () => {
    render(<Resizable data-testid="root" />)
    expect(screen.getByTestId('root')).toHaveAttribute('data-orientation', 'horizontal')
    expect(screen.queryByRole('separator')).toBeNull()
  })

  it('splits equally by default; the handle is a valued separator controlling the panel before it', () => {
    render(<Two />)
    expect(shares()).toEqual([50, 50])
    const handle = sep()
    expect(handle).toHaveAttribute('tabindex', '0')
    expect(handle).toHaveAttribute('aria-orientation', 'vertical') // a vertical bar between side-by-side panels
    expect(handle).toHaveAttribute('aria-valuenow', '50')
    expect(handle).toHaveAttribute('aria-valuemin', '20')
    expect(handle).toHaveAttribute('aria-valuemax', '80')
    const first = document.querySelector('.vk-resizable__panel') as HTMLElement
    expect(handle).toHaveAttribute('aria-controls', first.id)
    expect(first).toHaveTextContent('Files')
  })

  it('normalises defaultSizes to 100 and supports three panels with two handles', () => {
    render(
      <Resizable defaultSizes={[1, 1, 2]}>
        <Resizable.Panel>A</Resizable.Panel>
        <Resizable.Handle label="Between A and B" />
        <Resizable.Panel>B</Resizable.Panel>
        <Resizable.Handle label="Between B and C" />
        <Resizable.Panel>C</Resizable.Panel>
      </Resizable>,
    )
    expect(shares()).toEqual([25, 25, 50])
    expect(sep('Between B and C')).toHaveAttribute('aria-valuenow', '25')
    fireEvent.keyDown(sep('Between B and C'), { key: 'ArrowRight', shiftKey: true })
    expect(shares()).toEqual([25, 35, 40])
  })

  it('vertical stacks panels and listens to Up/Down', () => {
    render(<Two orientation="vertical" />)
    expect(screen.getByTestId('root')).toHaveAttribute('data-orientation', 'vertical')
    expect(sep()).toHaveAttribute('aria-orientation', 'horizontal')
    fireEvent.keyDown(sep(), { key: 'ArrowDown' })
    expect(shares()).toEqual([52, 48])
    fireEvent.keyDown(sep(), { key: 'ArrowRight' })
    expect(shares()).toEqual([52, 48])
  })

  it('merges className/style, spreads rest, forwards refs on every part', () => {
    const root = { current: null as HTMLDivElement | null }
    const handle = { current: null as HTMLDivElement | null }
    render(
      <Resizable ref={root} className="mine" style={{ height: 300 }} data-x="y">
        <Resizable.Panel className="p">A</Resizable.Panel>
        <Resizable.Handle ref={handle} className="h" />
        <Resizable.Panel>B</Resizable.Panel>
      </Resizable>,
    )
    expect(root.current).toHaveClass('vk-resizable', 'mine')
    expect(root.current).toHaveStyle({ height: '300px' })
    expect(root.current).toHaveAttribute('data-x', 'y')
    expect(handle.current).toHaveClass('vk-resizable__handle', 'h')
    expect(document.querySelector('.p')).toHaveClass('vk-resizable__panel')
  })
})

describe('Resizable · keyboard', () => {
  it('arrows move by step, Shift by five steps, and stop at the limits', () => {
    const onSizesChange = vi.fn()
    render(<Two step={5} onSizesChange={onSizesChange} />)
    fireEvent.keyDown(sep(), { key: 'ArrowRight' })
    expect(shares()).toEqual([55, 45])
    expect(onSizesChange).toHaveBeenLastCalledWith([55, 45])
    fireEvent.keyDown(sep(), { key: 'ArrowLeft', shiftKey: true })
    expect(shares()).toEqual([30, 70])
    fireEvent.keyDown(sep(), { key: 'ArrowLeft', shiftKey: true })
    expect(shares()).toEqual([20, 80]) // the first panel's minSize
    fireEvent.keyDown(sep(), { key: 'ArrowLeft' })
    expect(shares()).toEqual([20, 80])
    expect(sep()).toHaveAttribute('aria-valuenow', '20')
  })

  it('Home and End go to the limits; the neighbour is protected too; Enter resets', () => {
    render(<Two defaultSizes={[40, 60]} />)
    fireEvent.keyDown(sep(), { key: 'End' })
    // maxSize 80 for the first panel, but the second must keep its minSize 15 -> 85 cap: 80 wins.
    expect(shares()).toEqual([80, 20])
    fireEvent.keyDown(sep(), { key: 'Home' })
    expect(shares()).toEqual([20, 80])
    fireEvent.keyDown(sep(), { key: 'Enter' })
    expect(shares()).toEqual([40, 60])
  })

  it('flips the arrows in a right-to-left page', () => {
    render(
      <div dir="rtl">
        <Two />
      </div>,
    )
    const root = screen.getByTestId('root')
    const original = window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) =>
      el === root ? ({ direction: 'rtl' } as CSSStyleDeclaration) : original(el),
    )
    fireEvent.keyDown(sep(), { key: 'ArrowRight' })
    expect(shares()).toEqual([48, 52])
    vi.restoreAllMocks()
  })
})

describe('Resizable · pointer', () => {
  it('drags with pointer capture: 100px across a 1000px root is 10%; double-click resets', () => {
    render(<Two />)
    const root = screen.getByTestId('root')
    root.getBoundingClientRect = () => ({ width: 1000, height: 400, left: 0, top: 0 }) as DOMRect
    const handle = sep()
    fireEvent.pointerDown(handle, { clientX: 500, clientY: 10, button: 0, pointerId: 1 })
    expect(root).toHaveAttribute('data-dragging')
    fireEvent.pointerMove(handle, { clientX: 600, clientY: 10, pointerId: 1 })
    expect(shares()).toEqual([60, 40])
    fireEvent.pointerMove(handle, { clientX: 1000, clientY: 10, pointerId: 1 })
    expect(shares()).toEqual([80, 20]) // clamped to the panel's maxSize
    fireEvent.pointerUp(handle, { pointerId: 1 })
    expect(root).not.toHaveAttribute('data-dragging')
    fireEvent.pointerMove(handle, { clientX: 300, clientY: 10, pointerId: 1 })
    expect(shares()).toEqual([80, 20]) // not dragging any more
    fireEvent.doubleClick(handle)
    expect(shares()).toEqual([50, 50])
  })

  it('ignores a drag when the root has no size yet', () => {
    render(<Two />)
    fireEvent.pointerDown(sep(), { clientX: 10, button: 0, pointerId: 1 })
    fireEvent.pointerMove(sep(), { clientX: 200, pointerId: 1 })
    expect(shares()).toEqual([50, 50])
  })
})

describe('Resizable · control and persistence', () => {
  it('is controllable through sizes', () => {
    function Harness() {
      const [sizes, setSizes] = useState([30, 70])
      return (
        <>
          <Two sizes={sizes} onSizesChange={setSizes} />
          <button type="button" onClick={() => setSizes([70, 30])}>
            wide
          </button>
        </>
      )
    }
    render(<Harness />)
    expect(shares()).toEqual([30, 70])
    fireEvent.keyDown(sep(), { key: 'ArrowRight' })
    expect(shares()).toEqual([32, 68])
    fireEvent.click(screen.getByText('wide'))
    expect(shares()).toEqual([70, 30])
  })

  it('remembers the split under storageKey and restores it, ignoring junk', () => {
    const { unmount } = render(<Two storageKey="split" />)
    fireEvent.keyDown(sep(), { key: 'ArrowRight', shiftKey: true })
    expect(JSON.parse(window.localStorage.getItem('split') ?? '[]')).toEqual([60, 40])
    unmount()
    render(<Two storageKey="split" />)
    expect(shares()).toEqual([60, 40])
    window.localStorage.setItem('split', '{"nope":1}')
    render(<Two storageKey="split" defaultSizes={[25, 75]} />)
    expect(shares().slice(-2)).toEqual([25, 75])
  })

  it('has no axe violations', async () => {
    const { container } = render(<Two />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
