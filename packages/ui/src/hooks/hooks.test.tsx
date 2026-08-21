import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { createRef, type ReactNode, useRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Portal } from '../components/portal'
import { useControllableState } from './use-controllable-state'
import { useDismiss } from './use-dismiss'
import { useFocusTrap } from './use-focus-trap'
import { useIsomorphicId } from './use-isomorphic-id'
import { type RovingOrientation, useRovingTabIndex } from './use-roving-tab-index'
import { useScrollLock } from './use-scroll-lock'

describe('useControllableState', () => {
  it('behaves like useState while uncontrolled', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState<number>({ defaultValue: 1, onChange }))

    expect(result.current[0]).toBe(1)
    act(() => result.current[1](2))
    expect(result.current[0]).toBe(2)
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('composes functional setters called in the same tick', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState<number>({ defaultValue: 0, onChange }))

    act(() => {
      result.current[1]((n) => n + 1)
      result.current[1]((n) => n + 1)
    })

    // The second call must see the first one's result, not the value this render closed
    // over. Getting this wrong silently drops half of every double update.
    expect(result.current[0]).toBe(2)
    expect(onChange).toHaveBeenNthCalledWith(1, 1)
    expect(onChange).toHaveBeenNthCalledWith(2, 2)
  })

  it('does not lose updates when a controlled parent honours onChange', () => {
    function Counter() {
      const [value, setValue] = useState(0)
      const [state, setState] = useControllableState<number>({ value, onChange: setValue })
      return (
        <button
          type="button"
          onClick={() => {
            setState((n) => n + 1)
            setState((n) => n + 1)
          }}
        >
          {state}
        </button>
      )
    }

    render(<Counter />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent('2')
  })

  it('lets the controlled value win and leaves it to the parent to change', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useControllableState<string>({ value: 'a', defaultValue: 'z', onChange }),
    )

    expect(result.current[0]).toBe('a')
    act(() => result.current[1]('b'))
    expect(result.current[0]).toBe('a')
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('resolves a functional setter against the current controlled value', () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(
      (props: { value: number }) => useControllableState<number>({ value: props.value, onChange }),
      { initialProps: { value: 10 } },
    )

    act(() => result.current[1]((n) => n + 1))
    expect(onChange).toHaveBeenLastCalledWith(11)

    rerender({ value: 20 })
    act(() => result.current[1]((n) => n + 5))
    expect(onChange).toHaveBeenLastCalledWith(25)
  })

  it('carries the last controlled value over when the caller drops to uncontrolled', () => {
    const { result, rerender } = renderHook(
      (props: { value?: number }) =>
        useControllableState<number>({ value: props.value, defaultValue: 0 }),
      { initialProps: { value: 5 } as { value?: number } },
    )

    expect(result.current[0]).toBe(5)
    rerender({})
    // Snapping back to defaultValue here would look like the widget reset itself.
    expect(result.current[0]).toBe(5)

    act(() => result.current[1](6))
    expect(result.current[0]).toBe(6)
  })

  it('hands control over when the caller starts passing a value', () => {
    const { result, rerender } = renderHook(
      (props: { value?: number }) =>
        useControllableState<number>({ value: props.value, defaultValue: 0 }),
      { initialProps: {} as { value?: number } },
    )

    act(() => result.current[1](3))
    expect(result.current[0]).toBe(3)

    rerender({ value: 9 })
    expect(result.current[0]).toBe(9)
    act(() => result.current[1](4))
    expect(result.current[0]).toBe(9)
  })

  it('keeps a stable setter identity across renders', () => {
    const { result, rerender } = renderHook(() => useControllableState<number>({ defaultValue: 0 }))
    const setter = result.current[1]
    rerender()
    expect(result.current[1]).toBe(setter)
  })

  it('reports every set, including ones that change nothing', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState<number>({ defaultValue: 1, onChange }))

    act(() => result.current[1](1))
    act(() => result.current[1](1))
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('works with no options at all', () => {
    const { result } = renderHook(() => useControllableState<string | undefined>({}))
    expect(result.current[0]).toBeUndefined()
    act(() => result.current[1]('set'))
    expect(result.current[0]).toBe('set')
  })
})

function Trap({ active, children }: { active: boolean; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, active)
  return (
    <div ref={ref} data-testid="trap">
      {children}
    </div>
  )
}

describe('useFocusTrap', () => {
  it('focuses the first tabbable descendant on activation', () => {
    render(
      <Trap active>
        <button type="button">one</button>
        <button type="button">two</button>
      </Trap>,
    )
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus()
  })

  it('does not steal focus that is already inside', () => {
    const { rerender } = render(
      <Trap active={false}>
        <button type="button">one</button>
        <button type="button">two</button>
      </Trap>,
    )
    screen.getByRole('button', { name: 'two' }).focus()

    rerender(
      <Trap active>
        <button type="button">one</button>
        <button type="button">two</button>
      </Trap>,
    )
    expect(screen.getByRole('button', { name: 'two' })).toHaveFocus()
  })

  it('wraps Tab from the last element to the first', () => {
    render(
      <Trap active>
        <button type="button">one</button>
        <button type="button">two</button>
      </Trap>,
    )
    const last = screen.getByRole('button', { name: 'two' })
    last.focus()

    expect(fireEvent.keyDown(last, { key: 'Tab' })).toBe(false)
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus()
  })

  it('wraps Shift+Tab from the first element to the last', () => {
    render(
      <Trap active>
        <button type="button">one</button>
        <button type="button">two</button>
      </Trap>,
    )
    const first = screen.getByRole('button', { name: 'one' })
    first.focus()

    expect(fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })).toBe(false)
    expect(screen.getByRole('button', { name: 'two' })).toHaveFocus()
  })

  it('skips disabled elements and negative tabindex', () => {
    render(
      <Trap active>
        <button type="button">one</button>
        <button type="button" disabled>
          skipped-disabled
        </button>
        {/* A negative tabindex the trap must ignore. */}
        <div tabIndex={-1} data-testid="skipped-negative">
          skipped
        </div>
        <input type="hidden" defaultValue="skipped-hidden" />
        <button type="button">two</button>
      </Trap>,
    )

    // First focus proves the filter runs on entry as well as on Tab.
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus()

    const two = screen.getByRole('button', { name: 'two' })
    fireEvent.keyDown(two, { key: 'Tab' })
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus()

    fireEvent.keyDown(screen.getByRole('button', { name: 'one' }), { key: 'Tab', shiftKey: true })
    expect(two).toHaveFocus()
  })

  it('picks up children added after activation', () => {
    const { rerender } = render(
      <Trap active>
        <button type="button">one</button>
      </Trap>,
    )
    rerender(
      <Trap active>
        <button type="button">one</button>
        <button type="button">two</button>
        <button type="button">three</button>
      </Trap>,
    )

    const three = screen.getByRole('button', { name: 'three' })
    three.focus()
    fireEvent.keyDown(three, { key: 'Tab' })
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus()

    fireEvent.keyDown(screen.getByRole('button', { name: 'one' }), { key: 'Tab', shiftKey: true })
    expect(three).toHaveFocus()
  })

  it('holds focus on the container when there is nothing tabbable', () => {
    render(
      <Trap active>
        <span>nothing to focus here</span>
      </Trap>,
    )
    const container = screen.getByTestId('trap')

    expect(container).toHaveAttribute('tabindex', '-1')
    expect(container).toHaveFocus()
    // Tab must be swallowed, or focus escapes to the page behind the overlay.
    expect(fireEvent.keyDown(container, { key: 'Tab' })).toBe(false)
    expect(container).toHaveFocus()
    expect(fireEvent.keyDown(container, { key: 'Tab', shiftKey: true })).toBe(false)
    expect(container).toHaveFocus()
  })

  it('gives the borrowed tabindex back on deactivation', () => {
    const { rerender } = render(
      <Trap active>
        <span>nothing</span>
      </Trap>,
    )
    expect(screen.getByTestId('trap')).toHaveAttribute('tabindex', '-1')

    rerender(
      <Trap active={false}>
        <span>nothing</span>
      </Trap>,
    )
    expect(screen.getByTestId('trap')).not.toHaveAttribute('tabindex')
  })

  it('restores focus to the previously focused element', () => {
    function Fixture({ active }: { active: boolean }) {
      return (
        <>
          <button type="button">outside</button>
          <Trap active={active}>
            <button type="button">inside</button>
          </Trap>
        </>
      )
    }

    const { rerender } = render(<Fixture active={false} />)
    const outside = screen.getByRole('button', { name: 'outside' })
    outside.focus()

    rerender(<Fixture active />)
    expect(screen.getByRole('button', { name: 'inside' })).toHaveFocus()

    rerender(<Fixture active={false} />)
    expect(outside).toHaveFocus()
  })

  it('restores focus on unmount too', () => {
    render(<button type="button">outside</button>)
    const outside = screen.getByRole('button', { name: 'outside' })
    outside.focus()

    const trap = render(
      <Trap active>
        <button type="button">inside</button>
      </Trap>,
    )
    expect(screen.getByRole('button', { name: 'inside' })).toHaveFocus()

    trap.unmount()
    expect(outside).toHaveFocus()
  })

  it('leaves focus alone when something outside took it deliberately', () => {
    function Fixture({ active }: { active: boolean }) {
      return (
        <>
          <button type="button">first</button>
          <button type="button">second</button>
          <Trap active={active}>
            <button type="button">inside</button>
          </Trap>
        </>
      )
    }

    const { rerender } = render(<Fixture active={false} />)
    screen.getByRole('button', { name: 'first' }).focus()
    rerender(<Fixture active />)

    const second = screen.getByRole('button', { name: 'second' })
    second.focus()
    rerender(<Fixture active={false} />)
    expect(second).toHaveFocus()
  })

  it('does nothing while inactive', () => {
    render(
      <Trap active={false}>
        <button type="button">one</button>
        <button type="button">two</button>
      </Trap>,
    )
    const last = screen.getByRole('button', { name: 'two' })
    last.focus()

    expect(fireEvent.keyDown(last, { key: 'Tab' })).toBe(true)
    expect(last).toHaveFocus()
  })

  it('survives a container that never mounts', () => {
    function Fixture() {
      const ref = useRef<HTMLDivElement>(null)
      useFocusTrap(ref, true)
      return null
    }
    expect(() => render(<Fixture />)).not.toThrow()
  })
})

/** Pretend the viewport has a `scrollbar`-pixel-wide scrollbar. jsdom has no layout. */
function stubScrollbar(scrollbar: number) {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    value: window.innerWidth - scrollbar,
  })
}

describe('useScrollLock', () => {
  afterEach(() => {
    Reflect.deleteProperty(document.documentElement, 'clientWidth')
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  })

  it('locks and unlocks body scroll', () => {
    stubScrollbar(0)
    const { unmount } = renderHook(() => useScrollLock(true))
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('does nothing while inactive', () => {
    stubScrollbar(15)
    renderHook(() => useScrollLock(false))
    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
  })

  it('compensates for the scrollbar width without discarding existing padding', () => {
    document.body.style.paddingRight = '8px'
    stubScrollbar(15)

    const { unmount } = renderHook(() => useScrollLock(true))
    expect(document.body.style.paddingRight).toBe('23px')

    unmount()
    expect(document.body.style.paddingRight).toBe('8px')
  })

  it('adds no padding when there is no scrollbar to replace', () => {
    stubScrollbar(0)
    const { unmount } = renderHook(() => useScrollLock(true))
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.paddingRight).toBe('')
    unmount()
  })

  it('reference counts, so releasing one of two locks keeps the lock', () => {
    stubScrollbar(15)
    const first = renderHook(() => useScrollLock(true))
    const second = renderHook(() => useScrollLock(true))

    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.paddingRight).toBe('15px')

    first.unmount()
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.paddingRight).toBe('15px')

    second.unmount()
    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
  })

  it('locks when a hook flips to active and releases when it flips back', () => {
    stubScrollbar(0)
    const { rerender, unmount } = renderHook(
      ({ active }: { active: boolean }) => useScrollLock(active),
      { initialProps: { active: false } },
    )
    expect(document.body.style.overflow).toBe('')

    rerender({ active: true })
    expect(document.body.style.overflow).toBe('hidden')

    rerender({ active: false })
    expect(document.body.style.overflow).toBe('')
    unmount()
  })
})

function Dismissable({
  onDismiss,
  name,
  enabled,
  escapeKey,
  outsidePress,
}: {
  onDismiss: (reason: string) => void
  name: string
  enabled?: boolean
  escapeKey?: boolean
  outsidePress?: boolean
}) {
  const panel = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  useDismiss({ onDismiss, refs: [panel, trigger], enabled, escapeKey, outsidePress })

  return (
    <>
      <button ref={trigger} type="button">
        trigger {name}
      </button>
      <div ref={panel} data-testid={`panel-${name}`}>
        <button type="button">inside {name}</button>
      </div>
    </>
  )
}

describe('useDismiss', () => {
  it('dismisses on Escape', () => {
    const onDismiss = vi.fn()
    render(<Dismissable name="a" onDismiss={onDismiss} />)

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(onDismiss).toHaveBeenCalledWith('escape-key')
  })

  it('ignores other keys', () => {
    const onDismiss = vi.fn()
    render(<Dismissable name="a" onDismiss={onDismiss} />)

    fireEvent.keyDown(document.body, { key: 'Enter' })
    fireEvent.keyDown(document.body, { key: 'Esc' })
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('dismisses on a pointer press outside every ref', () => {
    const onDismiss = vi.fn()
    render(
      <>
        <Dismissable name="a" onDismiss={onDismiss} />
        <div data-testid="outside">outside</div>
      </>,
    )

    fireEvent.pointerDown(screen.getByTestId('outside'))
    expect(onDismiss).toHaveBeenCalledWith('outside-press')
  })

  it('does not dismiss on a press inside the panel or on the trigger', () => {
    const onDismiss = vi.fn()
    render(<Dismissable name="a" onDismiss={onDismiss} />)

    fireEvent.pointerDown(screen.getByRole('button', { name: 'inside a' }))
    fireEvent.pointerDown(screen.getByTestId('panel-a'))
    fireEvent.pointerDown(screen.getByRole('button', { name: 'trigger a' }))
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does not dismiss when a press starts inside and releases outside', () => {
    const onDismiss = vi.fn()
    render(
      <>
        <Dismissable name="a" onDismiss={onDismiss} />
        <div data-testid="outside">outside</div>
      </>,
    )
    const outside = screen.getByTestId('outside')

    // Dragging out of the panel — selecting text, dragging a slider thumb. The browser
    // fires the click on the common ancestor (<body>), which is why this hook watches
    // pointerdown and nothing else.
    fireEvent.pointerDown(screen.getByRole('button', { name: 'inside a' }))
    fireEvent.pointerUp(outside)
    fireEvent.click(outside)
    fireEvent.mouseUp(outside)

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does nothing when disabled', () => {
    const onDismiss = vi.fn()
    render(
      <>
        <Dismissable name="a" onDismiss={onDismiss} enabled={false} />
        <div data-testid="outside">outside</div>
      </>,
    )

    fireEvent.keyDown(document.body, { key: 'Escape' })
    fireEvent.pointerDown(screen.getByTestId('outside'))
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('can opt out of Escape while keeping outside presses', () => {
    const onDismiss = vi.fn()
    render(
      <>
        <Dismissable name="a" onDismiss={onDismiss} escapeKey={false} />
        <div data-testid="outside">outside</div>
      </>,
    )

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onDismiss).not.toHaveBeenCalled()

    fireEvent.pointerDown(screen.getByTestId('outside'))
    expect(onDismiss).toHaveBeenCalledWith('outside-press')
  })

  it('can opt out of outside presses while keeping Escape', () => {
    const onDismiss = vi.fn()
    render(
      <>
        <Dismissable name="a" onDismiss={onDismiss} outsidePress={false} />
        <div data-testid="outside">outside</div>
      </>,
    )

    fireEvent.pointerDown(screen.getByTestId('outside'))
    expect(onDismiss).not.toHaveBeenCalled()

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onDismiss).toHaveBeenCalledWith('escape-key')
  })

  it('lets only the innermost layer answer Escape', () => {
    const outer = vi.fn()
    const inner = vi.fn()
    const { rerender } = render(
      <>
        <Dismissable name="outer" onDismiss={outer} />
        <Dismissable name="inner" onDismiss={inner} />
      </>,
    )

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(inner).toHaveBeenCalledTimes(1)
    expect(outer).not.toHaveBeenCalled()

    // With the inner layer gone the outer one becomes the top of the stack.
    rerender(<Dismissable name="outer" onDismiss={outer} />)
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(outer).toHaveBeenCalledTimes(1)
  })

  it('still dismisses an outer layer when the press is outside both', () => {
    const outer = vi.fn()
    const inner = vi.fn()
    render(
      <>
        <Dismissable name="outer" onDismiss={outer} />
        <Dismissable name="inner" onDismiss={inner} />
        <div data-testid="outside">outside</div>
      </>,
    )

    fireEvent.pointerDown(screen.getByTestId('outside'))
    expect(inner).toHaveBeenCalledTimes(1)
    expect(outer).toHaveBeenCalledTimes(1)
  })

  it('dismisses the outer layer when the press lands inside it but outside the inner one', () => {
    const outer = vi.fn()
    const inner = vi.fn()
    render(
      <>
        <Dismissable name="outer" onDismiss={outer} />
        <Dismissable name="inner" onDismiss={inner} />
      </>,
    )

    fireEvent.pointerDown(screen.getByTestId('panel-outer'))
    expect(inner).toHaveBeenCalledTimes(1)
    expect(outer).not.toHaveBeenCalled()
  })

  it('tolerates refs that are empty or missing', () => {
    const onDismiss = vi.fn()
    function Fixture() {
      useDismiss({ onDismiss, refs: [{ current: null }, null, undefined] })
      return <div data-testid="outside">outside</div>
    }

    expect(() => render(<Fixture />)).not.toThrow()
    fireEvent.pointerDown(screen.getByTestId('outside'))
    expect(onDismiss).toHaveBeenCalledWith('outside-press')

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onDismiss).toHaveBeenCalledWith('escape-key')
  })

  it('treats no refs at all as "everything is outside"', () => {
    const onDismiss = vi.fn()
    render(<Fixtureless onDismiss={onDismiss} />)
    fireEvent.pointerDown(screen.getByTestId('anything'))
    expect(onDismiss).toHaveBeenCalledWith('outside-press')
  })
})

function Fixtureless({ onDismiss }: { onDismiss: (reason: string) => void }) {
  useDismiss({ onDismiss })
  return <div data-testid="anything">anything</div>
}

const ITEM_LABELS = ['alpha', 'beta', 'gamma', 'delta']

function Roving({
  orientation,
  loop,
  count = 3,
  disabled = [],
  ariaDisabled = [],
  activeIndex,
  onActiveIndexChange,
}: {
  orientation?: RovingOrientation
  loop?: boolean
  count?: number
  disabled?: number[]
  ariaDisabled?: number[]
  activeIndex?: number
  onActiveIndexChange?: (index: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const roving = useRovingTabIndex({
    containerRef: ref,
    orientation,
    loop,
    activeIndex,
    onActiveIndexChange,
  })

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label="fixture"
      data-testid="toolbar"
      onKeyDown={roving.onKeyDown}
      onFocus={roving.onFocus}
    >
      {ITEM_LABELS.slice(0, count).map((label, index) => (
        <button
          key={label}
          type="button"
          disabled={disabled.includes(index)}
          aria-disabled={ariaDisabled.includes(index) || undefined}
          {...roving.getItemProps(index)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/** The nth item, without a non-null assertion. */
function item(index: number): HTMLElement {
  const found = screen.getAllByRole('button')[index]
  if (!found) throw new Error(`no item at index ${index}`)
  return found
}

function tabStops(): number[] {
  return screen
    .getAllByRole('button')
    .map((element, index) => (element.tabIndex === 0 ? index : -1))
    .filter((index) => index !== -1)
}

describe('useRovingTabIndex', () => {
  it('exposes exactly one tab stop', () => {
    render(<Roving count={4} />)
    expect(tabStops()).toEqual([0])
  })

  it('moves focus and the tab stop with the arrows', () => {
    render(<Roving />)
    item(0).focus()

    expect(fireEvent.keyDown(item(0), { key: 'ArrowRight' })).toBe(false)
    expect(item(1)).toHaveFocus()
    expect(tabStops()).toEqual([1])
  })

  it('ignores the cross-axis arrows when horizontal', () => {
    render(<Roving orientation="horizontal" />)
    item(0).focus()

    // Not prevented: the page, or an outer widget, still owns the vertical arrows.
    expect(fireEvent.keyDown(item(0), { key: 'ArrowDown' })).toBe(true)
    expect(item(0)).toHaveFocus()
  })

  it('uses the vertical arrows when vertical', () => {
    render(<Roving orientation="vertical" />)
    item(0).focus()

    fireEvent.keyDown(item(0), { key: 'ArrowDown' })
    expect(item(1)).toHaveFocus()

    expect(fireEvent.keyDown(item(1), { key: 'ArrowRight' })).toBe(true)
    expect(item(1)).toHaveFocus()

    fireEvent.keyDown(item(1), { key: 'ArrowUp' })
    expect(item(0)).toHaveFocus()
  })

  it('uses all four arrows when both', () => {
    render(<Roving orientation="both" count={4} />)
    item(0).focus()

    fireEvent.keyDown(item(0), { key: 'ArrowDown' })
    expect(item(1)).toHaveFocus()
    fireEvent.keyDown(item(1), { key: 'ArrowRight' })
    expect(item(2)).toHaveFocus()
    fireEvent.keyDown(item(2), { key: 'ArrowUp' })
    expect(item(1)).toHaveFocus()
    fireEvent.keyDown(item(1), { key: 'ArrowLeft' })
    expect(item(0)).toHaveFocus()
  })

  it('jumps to the ends with Home and End', () => {
    render(<Roving count={4} />)
    item(1).focus()

    fireEvent.keyDown(item(1), { key: 'End' })
    expect(item(3)).toHaveFocus()

    fireEvent.keyDown(item(3), { key: 'Home' })
    expect(item(0)).toHaveFocus()
  })

  it('loops past both ends by default', () => {
    render(<Roving count={3} />)
    item(0).focus()

    fireEvent.keyDown(item(0), { key: 'ArrowLeft' })
    expect(item(2)).toHaveFocus()

    fireEvent.keyDown(item(2), { key: 'ArrowRight' })
    expect(item(0)).toHaveFocus()
  })

  it('stops at the ends when looping is off', () => {
    render(<Roving count={3} loop={false} />)
    item(0).focus()

    fireEvent.keyDown(item(0), { key: 'ArrowLeft' })
    expect(item(0)).toHaveFocus()

    item(2).focus()
    fireEvent.keyDown(item(2), { key: 'ArrowRight' })
    expect(item(2)).toHaveFocus()
  })

  it('skips disabled and aria-disabled items', () => {
    render(<Roving count={4} disabled={[1]} ariaDisabled={[2]} />)
    item(0).focus()

    fireEvent.keyDown(item(0), { key: 'ArrowRight' })
    expect(item(3)).toHaveFocus()

    fireEvent.keyDown(item(3), { key: 'ArrowRight' })
    expect(item(0)).toHaveFocus()
  })

  it('sends End to the last usable item, not the last item', () => {
    render(<Roving count={3} disabled={[2]} />)
    item(0).focus()

    fireEvent.keyDown(item(0), { key: 'End' })
    expect(item(1)).toHaveFocus()
  })

  it('moves the tab stop when an item is focused directly', () => {
    render(<Roving count={3} />)
    // Focusing outside an event handler is what needs the act() wrapper here: the
    // container's onFocus moves the tab stop, which is a state update.
    act(() => item(2).focus())
    expect(tabStops()).toEqual([2])
  })

  it('recovers the tab stop when the active item unmounts', () => {
    const { rerender } = render(<Roving count={4} />)
    act(() => item(3).focus())
    expect(tabStops()).toEqual([3])

    rerender(<Roving count={2} />)
    expect(screen.getAllByRole('button')).toHaveLength(2)
    // Without the self-heal, no item owns the tab stop and the widget drops out of the
    // tab order entirely.
    expect(tabStops()).toEqual([1])
  })

  it('recovers the tab stop when the active item becomes disabled', () => {
    const { rerender } = render(<Roving count={3} />)
    expect(tabStops()).toEqual([0])

    rerender(<Roving count={3} disabled={[0]} />)
    expect(tabStops()).toEqual([1])
  })

  it('reports changes and defers to a controlled activeIndex', () => {
    const onActiveIndexChange = vi.fn()
    render(<Roving count={3} activeIndex={1} onActiveIndexChange={onActiveIndexChange} />)
    expect(tabStops()).toEqual([1])

    item(1).focus()
    fireEvent.keyDown(item(1), { key: 'ArrowRight' })

    expect(onActiveIndexChange).toHaveBeenLastCalledWith(2)
    expect(item(2)).toHaveFocus()
    // The parent owns the tab stop, so it has not moved.
    expect(tabStops()).toEqual([1])
  })

  it('does nothing with an empty container', () => {
    render(<Roving count={0} />)
    const toolbar = screen.getByTestId('toolbar')
    expect(fireEvent.keyDown(toolbar, { key: 'ArrowRight' })).toBe(true)
    expect(fireEvent.keyDown(toolbar, { key: 'Home' })).toBe(true)
  })

  it('leaves unhandled keys alone', () => {
    render(<Roving count={3} />)
    item(0).focus()
    expect(fireEvent.keyDown(item(0), { key: 'a' })).toBe(true)
    expect(item(0)).toHaveFocus()
  })
})

describe('useIsomorphicId', () => {
  it('generates a stable id across renders', () => {
    const { result, rerender } = renderHook(() => useIsomorphicId())
    const first = result.current
    expect(first).toBeTruthy()
    rerender()
    expect(result.current).toBe(first)
  })

  it('generates a distinct id per call site', () => {
    function Two() {
      const a = useIsomorphicId()
      const b = useIsomorphicId()
      return (
        <>
          <span data-testid="a" id={a} />
          <span data-testid="b" id={b} />
        </>
      )
    }

    render(<Two />)
    const a = screen.getByTestId('a').id
    const b = screen.getByTestId('b').id
    expect(a).toBeTruthy()
    expect(b).toBeTruthy()
    expect(a).not.toBe(b)
  })

  it('returns the override verbatim', () => {
    const { result } = renderHook(() => useIsomorphicId('my-id'))
    expect(result.current).toBe('my-id')
  })

  it('falls back to the generated id when the override goes away', () => {
    const { result, rerender } = renderHook((props: { id?: string }) => useIsomorphicId(props.id), {
      initialProps: { id: 'given' } as { id?: string },
    })
    expect(result.current).toBe('given')

    rerender({})
    expect(result.current).toBeTruthy()
    expect(result.current).not.toBe('given')
  })

  it('matches on the server and the client', () => {
    function Labelled() {
      const id = useIsomorphicId()
      return <span id={id}>label</span>
    }
    // A server render that throws, or produces no id, is the bug this guards.
    expect(renderToString(<Labelled />)).toMatch(/id="[^"]+"/)
  })
})

describe('Portal', () => {
  it('renders nothing on the server', () => {
    const html = renderToString(
      <Portal>
        <span>should not appear</span>
      </Portal>,
    )
    expect(html).not.toContain('should not appear')
  })

  it('portals into document.body by default', () => {
    render(
      <Portal>
        <span data-testid="content">hello</span>
      </Portal>,
    )
    const wrapper = screen.getByTestId('content').closest('.vk-portal')
    expect(wrapper).not.toBeNull()
    expect(wrapper?.parentElement).toBe(document.body)
  })

  it('accepts an element as its container', () => {
    const host = document.createElement('div')
    document.body.append(host)

    render(
      <Portal container={host}>
        <span data-testid="content">hello</span>
      </Portal>,
    )
    expect(host.contains(screen.getByTestId('content'))).toBe(true)

    host.remove()
  })

  it('accepts a ref as its container', () => {
    function Fixture() {
      const host = useRef<HTMLDivElement>(null)
      return (
        <>
          <div ref={host} data-testid="host" />
          <Portal container={host}>
            <span data-testid="content">hello</span>
          </Portal>
        </>
      )
    }

    render(<Fixture />)
    expect(screen.getByTestId('host').contains(screen.getByTestId('content'))).toBe(true)
  })

  it('renders nothing while an explicit container is empty', () => {
    render(
      <Portal container={{ current: null }}>
        <span data-testid="content">hello</span>
      </Portal>,
    )
    expect(screen.queryByTestId('content')).toBeNull()
  })

  it('merges className, forwards its ref and spreads the rest', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Portal ref={ref} className="mine" data-testid="wrapper" aria-hidden="true">
        <span>hello</span>
      </Portal>,
    )

    expect(ref.current?.className).toBe('vk-portal mine')
    expect(screen.getByTestId('wrapper')).toBe(ref.current)
    expect(screen.getByTestId('wrapper')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders with no props beyond children', () => {
    expect(() => render(<Portal />)).not.toThrow()
  })

  it('takes its nodes with it on unmount', () => {
    const { unmount } = render(
      <Portal>
        <span data-testid="content">hello</span>
      </Portal>,
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()

    unmount()
    expect(screen.queryByTestId('content')).toBeNull()
    expect(document.querySelector('.vk-portal')).toBeNull()
  })

  it('has no axe violations', async () => {
    const host = document.createElement('div')
    document.body.append(host)

    render(
      <Portal container={host}>
        <button type="button">action</button>
      </Portal>,
    )
    expect(await axe(host)).toHaveNoViolations()

    host.remove()
  })
})
