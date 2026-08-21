import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ROVING_ITEM_ATTRIBUTE } from '../hooks/use-roving-tab-index'
import { DropdownMenu } from './dropdown-menu'
import { Popover } from './popover'
import { Tooltip } from './tooltip'

/*
 * Overlay behaviour tests.
 *
 * What jsdom can and cannot do here, stated up front so nothing below is mistaken
 * for more than it is: jsdom has no layout engine, so every `getBoundingClientRect()`
 * returns 0x0 at 0,0 and `window.innerWidth/Height` are constants. The positioning
 * *maths* is therefore tested exhaustively in `utils/position.test.ts` instead, and
 * these tests cover what jsdom is actually good at - the DOM, ARIA wiring, focus and
 * the keyboard.
 */

/**
 * React synthesises `onPointerEnter`/`onPointerLeave` from the `pointerover`/
 * `pointerout` pair, so firing the enter/leave events alone would do nothing. Both
 * are fired here: whichever one React is listening for this version, the handler runs
 * exactly once (opening is idempotent).
 */
function hover(element: Element) {
  fireEvent.pointerOver(element)
  fireEvent.pointerEnter(element)
}

function unhover(element: Element, relatedTarget?: Element | null) {
  fireEvent.pointerOut(element, { relatedTarget })
  fireEvent.pointerLeave(element, { relatedTarget })
}

/** Real focus, not `fireEvent.focus`: only `.focus()` produces the focusin React listens to. */
function focus(element: HTMLElement) {
  act(() => element.focus())
}

function tick(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

/*
 * The `region` rule is about page structure - it wants every node inside a landmark -
 * and a portal target of `document.body` in a test harness has no landmarks at all.
 * That is a property of the page a consumer builds, not of an overlay. Every other
 * rule stays on.
 */
const AXE_OPTIONS = { rules: { region: { enabled: false } } }

function pressEscape(target: Document | Element = document) {
  fireEvent.keyDown(target, { key: 'Escape' })
}

/**
 * jsdom has no layout, so the only way to exercise the measure -> `position()` ->
 * inline style path is to stub the two rectangles the components read. `role` picks
 * them apart: the overlay always carries one, the trigger does not.
 */
function stubLayout(options: {
  trigger: { x: number; y: number; width: number; height: number }
  floating: { width: number; height: number }
  overlayRole: string
}) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ): DOMRect {
    const box =
      this.getAttribute('role') === options.overlayRole
        ? { x: 0, y: 0, ...options.floating }
        : options.trigger
    return {
      ...box,
      top: box.y,
      left: box.x,
      right: box.x + box.width,
      bottom: box.y + box.height,
      toJSON: () => box,
    } as DOMRect
  })
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('Tooltip', () => {
  it('opens on hover only after openDelay has passed', () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Saves your work" openDelay={200}>
        <button type="button">Save</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Save' })

    hover(trigger)
    // The delay is the whole point: a pointer crossing a toolbar must not light up
    // every tip on the way past.
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    tick(199)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    tick(1)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Saves your work')
  })

  it('opens on focus immediately, with no delay', () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Saves your work" openDelay={5000}>
        <button type="button">Save</button>
      </Tooltip>,
    )

    focus(screen.getByRole('button', { name: 'Save' }))
    // A keyboard user has already committed by pressing Tab; making them wait is lag.
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('closes on blur without waiting for closeDelay', () => {
    vi.useFakeTimers()
    render(
      <>
        <Tooltip content="Saves your work">
          <button type="button">Save</button>
        </Tooltip>
        <button type="button">Elsewhere</button>
      </>,
    )

    focus(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    focus(screen.getByRole('button', { name: 'Elsewhere' }))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('closes on Escape', () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Saves your work">
        <button type="button">Save</button>
      </Tooltip>,
    )

    focus(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    act(() => pressEscape())
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('waits closeDelay before closing on pointer leave, and cancels if the pointer returns', () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Saves your work" openDelay={0} closeDelay={150}>
        <button type="button">Save</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Save' })

    hover(trigger)
    tick(0)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    unhover(trigger)
    tick(100)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    hover(trigger)
    tick(200)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('stays open while the pointer travels from the trigger onto the tip', () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Saves your work" openDelay={0} closeDelay={150}>
        <button type="button">Save</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Save' })

    hover(trigger)
    tick(0)
    const tip = screen.getByRole('tooltip')

    // The gap between trigger and tip is crossed inside closeDelay. Without this the
    // tip would vanish from under the pointer and selectable content in a tip would
    // be impossible.
    unhover(trigger, tip)
    tick(50)
    hover(tip)
    tick(500)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    // Leaving the tip itself still closes it.
    unhover(tip)
    tick(150)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('describes the trigger while open, and only while open', () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Saves your work">
        <button type="button">Save</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Save' })
    expect(trigger).not.toHaveAttribute('aria-describedby')

    focus(trigger)
    const tip = screen.getByRole('tooltip')
    expect(trigger).toHaveAttribute('aria-describedby', tip.id)
    // Described, not labelled: the button keeps its own name.
    expect(trigger).toHaveAccessibleName('Save')
    expect(trigger).toHaveAccessibleDescription('Saves your work')
  })

  it('is neither focusable nor a focus trap', () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Saves your work">
        <button type="button">Save</button>
      </Tooltip>,
    )
    focus(screen.getByRole('button', { name: 'Save' }))

    const tip = screen.getByRole('tooltip')
    expect(tip).not.toHaveAttribute('tabindex')
    // Focus never left the trigger, and nothing pulled it into the tip.
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Save' }))
  })

  it('reports side and align as data attributes', () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Tip" side="right" align="start">
        <button type="button">Save</button>
      </Tooltip>,
    )
    focus(screen.getByRole('button', { name: 'Save' }))

    const tip = screen.getByRole('tooltip')
    // jsdom has no layout, so every rect is 0x0 and nothing can flip: this asserts
    // the plumbing from the resolved result to the DOM, not the maths.
    expect(tip).toHaveAttribute('data-side', 'right')
    expect(tip).toHaveAttribute('data-align', 'start')
    expect(tip).toHaveAttribute('data-positioned')
    // Every jsdom rect is 0x0 at 0,0, so the resolved point is the padding corner -
    // which does at least prove the clamp is wired through to the inline style.
    expect(tip.style.left).toBe('8px')
    expect(tip.style.top).toBe('8px')
  })

  it('measures the trigger, flips, and writes the result to the inline style', () => {
    vi.useFakeTimers()
    // A trigger 10px from the top of a 768px-tall jsdom viewport, with a 100px tall
    // tip: there is no room above, so `side="top"` must come out as "bottom".
    stubLayout({
      trigger: { x: 100, y: 10, width: 50, height: 20 },
      floating: { width: 200, height: 100 },
      overlayRole: 'tooltip',
    })
    render(
      <Tooltip content="Tip" side="top" offset={8} padding={8}>
        <button type="button">Save</button>
      </Tooltip>,
    )
    focus(screen.getByRole('button', { name: 'Save' }))

    const tip = screen.getByRole('tooltip')
    expect(tip).toHaveAttribute('data-side', 'bottom')
    expect(tip.style.top).toBe('38px') // 10 + 20 + 8
    expect(tip.style.left).toBe('25px') // 100 + (50 - 200) / 2

    // And it re-resolves when the viewport changes under it: 200px of tip cannot fit
    // in 100px of width, so the clamp pins it to the padding.
    const width = window.innerWidth
    try {
      window.innerWidth = 100
      act(() => {
        fireEvent(window, new Event('resize'))
      })
      expect(screen.getByRole('tooltip').style.left).toBe('8px')
    } finally {
      window.innerWidth = width
    }
  })

  it('honours a controlled open prop and reports intent through onOpenChange', () => {
    vi.useFakeTimers()
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <Tooltip content="Tip" open={false} onOpenChange={onOpenChange}>
        <button type="button">Save</button>
      </Tooltip>,
    )

    focus(screen.getByRole('button', { name: 'Save' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    // Controlled means controlled: the tip does not open itself.
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    rerender(
      <Tooltip content="Tip" open onOpenChange={onOpenChange}>
        <button type="button">Save</button>
      </Tooltip>,
    )
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('positions a tip opened programmatically, with no pointer or focus involved', () => {
    // The anchor has to come from a ref, not from the event that opened the tip: an
    // onboarding hint that opens on a timer has neither. Without this the tip would
    // measure against nothing and stay at opacity 0 forever.
    render(
      <Tooltip content="Tip" open>
        <button type="button">Save</button>
      </Tooltip>,
    )
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-positioned')
  })

  it('passes the trigger through to a ref the caller put on the child', () => {
    const seen: Array<HTMLElement | null> = []
    render(
      <Tooltip content="Tip">
        <button
          type="button"
          ref={(node: HTMLButtonElement | null) => {
            seen.push(node)
          }}
        >
          Save
        </button>
      </Tooltip>,
    )
    // Composed, not replaced. Swallowing a caller's ref is the classic wrapper bug.
    expect(seen[0]).toBe(screen.getByRole('button', { name: 'Save' }))
  })

  it('never opens while disabled', () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Tip" openDelay={0} disabled>
        <button type="button">Save</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Save' })

    hover(trigger)
    focus(trigger)
    tick(500)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(trigger).not.toHaveAttribute('aria-describedby')
  })

  it('composes with the handlers already on its child', () => {
    vi.useFakeTimers()
    const onFocus = vi.fn()
    render(
      <Tooltip content="Tip">
        <button type="button" onFocus={onFocus}>
          Save
        </button>
      </Tooltip>,
    )

    focus(screen.getByRole('button', { name: 'Save' }))
    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('renders no tip on the server, even when open', () => {
    // Nothing positioned may render on the server, and no measurement may run there.
    const html = renderToString(
      <Tooltip content="Saves your work" defaultOpen>
        <button type="button">Save</button>
      </Tooltip>,
    )
    expect(html).toContain('Save<')
    expect(html).not.toContain('Saves your work')
    expect(html).not.toContain('role="tooltip"')
  })

  it('has no axe violations while open', async () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Saves your work">
        <button type="button">Save</button>
      </Tooltip>,
    )
    focus(screen.getByRole('button', { name: 'Save' }))

    vi.useRealTimers()
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})

function BasicPopover({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Popover onOpenChange={onOpenChange}>
      <Popover.Trigger>Share</Popover.Trigger>
      <Popover.Content>
        <input aria-label="Link" defaultValue="https://example.com" />
        <Popover.Close>Done</Popover.Close>
      </Popover.Content>
    </Popover>
  )
}

describe('Popover', () => {
  it('opens and closes on trigger clicks while uncontrolled', () => {
    render(<BasicPopover />)
    const trigger = screen.getByRole('button', { name: 'Share' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('reports open state and leaves the decision to the parent when controlled', () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <Popover open={false} onOpenChange={onOpenChange}>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content>Panel</Popover.Content>
      </Popover>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    rerender(
      <Popover open onOpenChange={onOpenChange}>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content>Panel</Popover.Content>
      </Popover>,
    )
    expect(screen.getByRole('dialog')).toHaveTextContent('Panel')
  })

  it('drives a parent that stores the state itself', () => {
    function Controlled() {
      const [open, setOpen] = useState(false)
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger>Share</Popover.Trigger>
          <Popover.Content>
            <Popover.Close>Done</Popover.Close>
          </Popover.Content>
        </Popover>
      )
    }

    render(<Controlled />)
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('wires the trigger to the panel with aria-haspopup, aria-expanded and a name', () => {
    render(<BasicPopover />)
    const trigger = screen.getByRole('button', { name: 'Share' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls', dialog.id)
    // A dialog with no accessible name is both an axe violation and an unannounced
    // context switch, so it borrows its trigger's label by default.
    expect(dialog).toHaveAttribute('aria-labelledby', trigger.id)
    expect(dialog).toHaveAccessibleName('Share')
  })

  it('lets the caller name the panel itself', () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="Sharing options">Panel</Popover.Content>
      </Popover>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAccessibleName('Sharing options')
    expect(dialog).not.toHaveAttribute('aria-labelledby')
  })

  it('moves focus into the panel on open and back to the trigger on close', () => {
    render(<BasicPopover />)
    const trigger = screen.getByRole('button', { name: 'Share' })

    fireEvent.click(trigger)
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Link' }))

    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(document.activeElement).toBe(trigger)
  })

  it('focuses the panel itself when there is nothing inside to focus', () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content>Nothing interactive here</Popover.Content>
      </Popover>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('tabindex', '-1')
    expect(document.activeElement).toBe(dialog)
  })

  it('leaves focus alone when autoFocus is off', () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content autoFocus={false}>
          <input aria-label="Link" />
        </Popover.Content>
      </Popover>,
    )
    expect(document.activeElement).toBe(document.body)
  })

  it('closes on Escape and returns focus to the trigger', () => {
    render(<BasicPopover />)
    const trigger = screen.getByRole('button', { name: 'Share' })
    fireEvent.click(trigger)

    act(() => pressEscape())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on an outside press but not on a press inside', () => {
    render(
      <>
        <BasicPopover />
        <button type="button">Outside</button>
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))

    fireEvent.pointerDown(screen.getByRole('textbox', { name: 'Link' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('measures, flips and positions the panel', () => {
    // Each overlay carries its own copy of the measure-and-resolve effect, so each
    // one gets its own end-to-end check. Trigger hard against the right edge of the
    // 1024px jsdom viewport: `side="right"` has nowhere to go and must flip.
    stubLayout({
      trigger: { x: 980, y: 300, width: 40, height: 40 },
      floating: { width: 200, height: 100 },
      overlayRole: 'dialog',
    })
    render(
      <Popover defaultOpen side="right" offset={8} padding={8}>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content>Panel</Popover.Content>
      </Popover>,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('data-side', 'left')
    expect(dialog.style.left).toBe('772px') // 980 - 8 - 200
    expect(dialog.style.top).toBe('270px') // 300 + (40 - 100) / 2
  })

  it('renders no panel on the server, even when open', () => {
    const html = renderToString(
      <Popover defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content>Panel body</Popover.Content>
      </Popover>,
    )
    expect(html).toContain('Share')
    expect(html).not.toContain('Panel body')
    expect(html).not.toContain('role="dialog"')
  })

  it('names the part that was used outside a Popover', () => {
    // The default failure here is a null-property TypeError from inside the library,
    // which tells the consumer nothing.
    expect(() => render(<Popover.Trigger>Orphan</Popover.Trigger>)).toThrow(
      /Popover\.Trigger must be rendered inside <Popover>/,
    )
  })

  it('has no axe violations while open', async () => {
    render(<BasicPopover />)
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})

function BasicMenu({
  onSelect,
  onOpenChange,
}: {
  onSelect?: (value: string) => void
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Danger zone</DropdownMenu.Label>
        <DropdownMenu.Item onSelect={() => onSelect?.('edit')}>Edit</DropdownMenu.Item>
        <DropdownMenu.Item disabled onSelect={() => onSelect?.('duplicate')}>
          Duplicate
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onSelect={() => onSelect?.('delete')} shortcut="⌫">
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

function items() {
  return screen.getAllByRole('menuitem')
}

describe('DropdownMenu', () => {
  it('advertises itself on the trigger', () => {
    render(<BasicMenu />)
    const trigger = screen.getByRole('button', { name: 'Actions' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)
    const menu = screen.getByRole('menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls', menu.id)
    expect(menu).toHaveAttribute('aria-labelledby', trigger.id)
  })

  it('opens on click with the first item focused', () => {
    render(<BasicMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }))
  })

  it('opens downwards on ArrowDown and upwards on ArrowUp', () => {
    const { unmount } = render(<BasicMenu />)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Actions' }), { key: 'ArrowDown' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }))
    unmount()

    render(<BasicMenu />)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Actions' }), { key: 'ArrowUp' })
    // ArrowUp is the one-keystroke route to the bottom of the menu.
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: /Delete/ }))
  })

  it('moves with the arrows, skipping disabled items', () => {
    render(<BasicMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const [edit, duplicate, remove] = items()
    if (!edit || !duplicate || !remove) throw new Error('expected three items')

    expect(duplicate).toHaveAttribute('aria-disabled', 'true')

    fireEvent.keyDown(edit, { key: 'ArrowDown' })
    // Straight past "Duplicate": a disabled command is not a stop on the way.
    expect(document.activeElement).toBe(remove)

    fireEvent.keyDown(remove, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(edit)
  })

  it('loops past the ends by default', () => {
    render(<BasicMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const [edit, , remove] = items()
    if (!edit || !remove) throw new Error('expected items')

    fireEvent.keyDown(edit, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(remove)

    fireEvent.keyDown(remove, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(edit)
  })

  it('stops at the ends when loop is off', () => {
    render(
      <DropdownMenu loop={false}>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Edit</DropdownMenu.Item>
          <DropdownMenu.Item>Delete</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const [edit] = items()
    if (!edit) throw new Error('expected items')

    fireEvent.keyDown(edit, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(edit)
  })

  it('jumps to the ends with Home and End', () => {
    render(<BasicMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const [edit, , remove] = items()
    if (!edit || !remove) throw new Error('expected items')

    fireEvent.keyDown(edit, { key: 'End' })
    expect(document.activeElement).toBe(remove)

    fireEvent.keyDown(remove, { key: 'Home' })
    expect(document.activeElement).toBe(edit)
  })

  it('activates an item and closes, and ignores a disabled one', () => {
    const onSelect = vi.fn()
    render(<BasicMenu onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))

    fireEvent.click(screen.getByRole('menuitem', { name: 'Duplicate' }))
    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(onSelect).toHaveBeenCalledWith('edit')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('gets Enter and Space for free by being a real button', () => {
    // jsdom does not translate keydown into a click the way a browser does, so this
    // asserts the mechanism rather than simulating the keystroke: a `<button>` needs
    // no key handling of ours for Enter and Space, and cannot regress into needing it.
    render(<BasicMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    for (const item of items()) {
      expect(item.tagName).toBe('BUTTON')
      expect(item).toHaveAttribute('type', 'button')
    }
  })

  it('closes on Escape and returns focus to the trigger', () => {
    render(<BasicMenu />)
    const trigger = screen.getByRole('button', { name: 'Actions' })
    fireEvent.click(trigger)

    act(() => pressEscape())
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on Tab and returns focus to the trigger', () => {
    render(<BasicMenu />)
    const trigger = screen.getByRole('button', { name: 'Actions' })
    fireEvent.click(trigger)

    const [edit] = items()
    if (!edit) throw new Error('expected items')
    fireEvent.keyDown(edit, { key: 'Tab' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on an outside press', () => {
    render(
      <>
        <BasicMenu />
        <button type="button">Outside</button>
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('reports open state through onOpenChange', () => {
    const onOpenChange = vi.fn()
    render(<BasicMenu onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(true)

    act(() => pressEscape())
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('jumps to an item by typing its first letters', () => {
    render(<BasicMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const menu = screen.getByRole('menu')

    fireEvent.keyDown(menu, { key: 'd' })
    // "Duplicate" is disabled and therefore not a typeahead target either.
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: /Delete/ }))
  })

  it('toggles a checkbox item without closing the menu', () => {
    const onCheckedChange = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>View</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem onCheckedChange={onCheckedChange}>
            Show gridlines
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'View' }))

    const box = screen.getByRole('menuitemcheckbox', { name: 'Show gridlines' })
    expect(box).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(box)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'true')
    // Ticking two boxes should be one visit to the menu, not two.
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('lets a checkbox item be controlled', () => {
    const { rerender } = render(
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger>View</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem checked={false}>Gridlines</DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )
    fireEvent.click(screen.getByRole('menuitemcheckbox'))
    expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'false')

    rerender(
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger>View</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem checked>Gridlines</DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )
    expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'true')
  })

  it('marks items with the attribute the roving hook looks for', () => {
    render(<BasicMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    // The component writes this attribute literally; the hook queries for it. This is
    // the test that stops the two drifting apart.
    for (const item of items()) {
      expect(item).toHaveAttribute(ROVING_ITEM_ATTRIBUTE)
      expect(item).toHaveAttribute('tabindex', '-1')
    }
  })

  it('renders a separator and a non-item label', () => {
    render(<BasicMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    expect(screen.getByRole('separator')).toBeInTheDocument()
    // The label is decoration inside role="menu": visible, but not a menu item.
    const label = screen.getByText('Danger zone')
    expect(label).toHaveAttribute('role', 'presentation')
    expect(items()).toHaveLength(3)
  })

  it('measures, flips and positions the menu', () => {
    // Bottom-left of the viewport: the default `side="bottom"` has no room, and the
    // default `align="start"` would hang off the right edge, so both rules fire.
    stubLayout({
      trigger: { x: 900, y: 700, width: 80, height: 30 },
      floating: { width: 200, height: 150 },
      overlayRole: 'menu',
    })
    render(<BasicMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))

    const menu = screen.getByRole('menu')
    expect(menu).toHaveAttribute('data-side', 'top')
    expect(menu.style.top).toBe('546px') // 700 - 4 (default offset) - 150
    expect(menu.style.left).toBe('816px') // clamped: 1024 - 8 - 200
  })

  it('renders no menu on the server, even when open', () => {
    const html = renderToString(
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Edit</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )
    expect(html).toContain('Actions')
    expect(html).not.toContain('role="menu"')
    expect(html).not.toContain('Edit')
  })

  it('names the part that was used outside a DropdownMenu', () => {
    expect(() => render(<DropdownMenu.Item>Orphan</DropdownMenu.Item>)).toThrow(
      /DropdownMenu\.Item must be rendered inside <DropdownMenu>/,
    )
  })

  it('has no axe violations while open', async () => {
    render(<BasicMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})
