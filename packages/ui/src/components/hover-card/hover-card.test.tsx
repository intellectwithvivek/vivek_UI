/**
 * HoverCard.
 *
 * A hover card is defined by what it refuses to be: not a tooltip (no describedby — the
 * content is rich, not a description), not a dialog (no focus move, no trap), not a
 * popup the trigger announces. So the tests here pin two things: the *absence* of that
 * ARIA wiring, which every future refactor will be tempted to "fix", and the timing
 * model — the open delay, the immediate keyboard path, and the safe-hover bridge from
 * trigger to card that makes text in the card selectable at all.
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'

/**
 * React synthesises `onPointerEnter`/`onPointerLeave` from the `pointerover`/
 * `pointerout` pair, so firing the enter/leave events alone would do nothing. Both are
 * fired here: whichever one React is listening for this version, the handler runs
 * exactly once (opening is idempotent).
 */
function hover(element: Element, init: Record<string, unknown> = {}) {
  fireEvent.pointerOver(element, init)
  fireEvent.pointerEnter(element, init)
}

function unhover(element: Element, init: Record<string, unknown> = {}) {
  fireEvent.pointerOut(element, init)
  fireEvent.pointerLeave(element, init)
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
 * The `region` rule is about page structure — it wants every node inside a landmark —
 * and a portal target of `document.body` in a test harness has no landmarks at all.
 * That is a property of the page a consumer builds, not of the card. Every other rule
 * stays on.
 */
const AXE_OPTIONS = { rules: { region: { enabled: false } } }

const card = () => document.querySelector('.vk-hover-card') as HTMLElement | null

const setup = (props: Partial<React.ComponentProps<typeof HoverCard>> = {}) =>
  render(
    <HoverCard openDelay={300} closeDelay={150} {...props}>
      <HoverCardTrigger href="/vivek">@vivek</HoverCardTrigger>
      <HoverCardContent>
        <strong>Vivek Kumar Singh</strong> builds VivekUI.
      </HoverCardContent>
    </HoverCard>,
  )

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('HoverCard · what it refuses to announce', () => {
  it('leaves the trigger a plain link — no aria-haspopup, aria-expanded or aria-describedby', () => {
    // The card is supplementary presentation. Promising a popup would tell a screen
    // reader user there is something to open that opening gives them nothing new from.
    setup({ defaultOpen: true })
    const trigger = screen.getByRole('link', { name: '@vivek' })
    expect(trigger).not.toHaveAttribute('aria-haspopup')
    expect(trigger).not.toHaveAttribute('aria-expanded')
    expect(trigger).not.toHaveAttribute('aria-describedby')
    expect(trigger).not.toHaveAttribute('aria-controls')
  })

  it('gives the card no role — neither dialog nor tooltip', () => {
    setup({ defaultOpen: true })
    expect(card()).not.toHaveAttribute('role')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('does not move focus into the card on open', () => {
    // Not a dialog: focus stays exactly where the user put it.
    setup()
    const trigger = screen.getByRole('link')
    focus(trigger)
    expect(card()).toBeInTheDocument()
    expect(document.activeElement).toBe(trigger)
  })

  it('has no axe violations while open', async () => {
    const { container } = setup({ defaultOpen: true })
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
    expect(container).toBeInTheDocument()
  })
})

describe('HoverCard · pointer timing', () => {
  it('opens on hover only after openDelay has passed', () => {
    vi.useFakeTimers()
    setup()
    hover(screen.getByRole('link'))
    // The delay is the point: a pointer crossing a feed of mentions must not open one
    // preview per name on the way past.
    expect(card()).not.toBeInTheDocument()

    tick(299)
    expect(card()).not.toBeInTheDocument()

    tick(1)
    expect(card()).toHaveTextContent('Vivek Kumar Singh')
  })

  it('never opens when the pointer leaves before openDelay elapses', () => {
    vi.useFakeTimers()
    setup()
    const trigger = screen.getByRole('link')
    hover(trigger)
    tick(200)
    unhover(trigger)
    tick(5000)
    expect(card()).not.toBeInTheDocument()
  })

  it('closes only after closeDelay once the pointer leaves the trigger', () => {
    vi.useFakeTimers()
    setup()
    const trigger = screen.getByRole('link')
    hover(trigger)
    tick(300)
    unhover(trigger)
    tick(149)
    expect(card()).toBeInTheDocument()
    tick(1)
    expect(card()).not.toBeInTheDocument()
  })

  it('stays open across the trigger-to-card gap — the safe-hover bridge', () => {
    vi.useFakeTimers()
    setup()
    const trigger = screen.getByRole('link')
    hover(trigger)
    tick(300)
    unhover(trigger)
    // Mid-flight: the close is scheduled but the pointer arrives before it fires.
    tick(100)
    hover(card() as HTMLElement)
    tick(5000)
    expect(card()).toBeInTheDocument()
  })

  it('closes after leaving the card itself, on the same closeDelay', () => {
    vi.useFakeTimers()
    setup()
    const trigger = screen.getByRole('link')
    hover(trigger)
    tick(300)
    unhover(trigger)
    const panel = card() as HTMLElement
    hover(panel)
    unhover(panel)
    tick(149)
    expect(card()).toBeInTheDocument()
    tick(1)
    expect(card()).not.toBeInTheDocument()
  })

  it('returning to the trigger before closeDelay cancels the pending close', () => {
    vi.useFakeTimers()
    setup()
    const trigger = screen.getByRole('link')
    hover(trigger)
    tick(300)
    unhover(trigger)
    tick(100)
    hover(trigger)
    tick(5000)
    expect(card()).toBeInTheDocument()
  })

  it('ignores a touch pointer entirely', () => {
    // A finger's pointerenter fires as part of a tap, and the tap is about to navigate
    // the link — opening a preview under it would race the navigation and lose.
    vi.useFakeTimers()
    setup()
    hover(screen.getByRole('link'), { pointerType: 'touch' })
    tick(5000)
    expect(card()).not.toBeInTheDocument()
  })
})

describe('HoverCard · keyboard', () => {
  it('opens on focus immediately, skipping openDelay', () => {
    vi.useFakeTimers()
    setup({ openDelay: 5000 })
    focus(screen.getByRole('link'))
    // No tick: a keyboard user pressed Tab on purpose, and making them wait is lag.
    expect(card()).toBeInTheDocument()
  })

  it('closes on blur immediately, skipping closeDelay', () => {
    vi.useFakeTimers()
    setup()
    const trigger = screen.getByRole('link')
    focus(trigger)
    act(() => trigger.blur())
    // No tick: focus has already moved on, so there is no pointer en route to the card.
    expect(card()).not.toBeInTheDocument()
  })

  it('closes on Escape without needing focus anywhere near it', () => {
    setup({ defaultOpen: true })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(card()).not.toBeInTheDocument()
  })

  it('closes on a pointer press outside both trigger and card', () => {
    // The one way a card can otherwise stick: opened by focus, no pointer nearby to
    // leave it. A press elsewhere is the universal "put that away".
    setup({ defaultOpen: true })
    fireEvent.pointerDown(document.body)
    expect(card()).not.toBeInTheDocument()
  })

  it('a press inside the card does not close it', () => {
    setup({ defaultOpen: true })
    fireEvent.pointerDown(card() as HTMLElement)
    expect(card()).toBeInTheDocument()
  })
})

describe('HoverCard · controlled and uncontrolled', () => {
  it('defaultOpen renders the card from the first client paint', () => {
    setup({ defaultOpen: true })
    expect(card()).toBeInTheDocument()
  })

  it('reports every open and close through onOpenChange while uncontrolled', () => {
    vi.useFakeTimers()
    const onOpenChange = vi.fn()
    setup({ onOpenChange })
    const trigger = screen.getByRole('link')
    hover(trigger)
    tick(300)
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    unhover(trigger)
    tick(150)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(onOpenChange).toHaveBeenCalledTimes(2)
  })

  it('when controlled, Escape reports false but the prop stays in charge', () => {
    const onOpenChange = vi.fn()
    setup({ open: true, onOpenChange })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onOpenChange).toHaveBeenCalledWith(false)
    // Still open: the caller owns the state and has not changed it.
    expect(card()).toBeInTheDocument()
  })

  it('a controlled caller who applies the report sees it close', () => {
    function Controlled() {
      const [open, setOpen] = useState(true)
      return (
        <HoverCard open={open} onOpenChange={setOpen}>
          <HoverCardTrigger href="/vivek">@vivek</HoverCardTrigger>
          <HoverCardContent>Profile</HoverCardContent>
        </HoverCard>
      )
    }
    render(<Controlled />)
    expect(card()).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(card()).not.toBeInTheDocument()
  })
})

describe('HoverCard · the §4.1 contract', () => {
  it('merges className and style on the card instead of replacing them', () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="/x">x</HoverCardTrigger>
        <HoverCardContent className="mine" style={{ color: 'red' }} data-testid="panel">
          Hi
        </HoverCardContent>
      </HoverCard>,
    )
    const panel = screen.getByTestId('panel')
    expect(panel).toHaveClass('vk-hover-card', 'mine')
    expect(panel.style.color).toBe('red')
    // The caller's style must not wipe out the resolved position.
    expect(panel.style.left).not.toBe('')
  })

  it('forwards refs to the real trigger and card nodes', () => {
    const triggerRef = { current: null as HTMLAnchorElement | null }
    const contentRef = { current: null as HTMLDivElement | null }
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="/x" ref={triggerRef}>
          x
        </HoverCardTrigger>
        <HoverCardContent ref={contentRef}>Hi</HoverCardContent>
      </HoverCard>,
    )
    expect(triggerRef.current?.tagName).toBe('A')
    expect(contentRef.current).toBe(card())
  })

  it('asChild renders the caller element as the trigger, classes and handlers merged', () => {
    vi.useFakeTimers()
    render(
      <HoverCard>
        <HoverCardTrigger asChild>
          <button type="button" className="mine">
            @vivek
          </button>
        </HoverCardTrigger>
        <HoverCardContent>Profile</HoverCardContent>
      </HoverCard>,
    )
    const trigger = screen.getByRole('button', { name: '@vivek' })
    expect(trigger).toHaveClass('vk-hover-card__trigger', 'mine')
    hover(trigger)
    tick(300)
    expect(card()).toBeInTheDocument()
  })

  it('exposes data-state on the trigger for styling, since there is no aria to hook', () => {
    setup({ defaultOpen: true })
    expect(screen.getByRole('link')).toHaveAttribute('data-state', 'open')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('link')).toHaveAttribute('data-state', 'closed')
  })

  it('renders on the server without touching the DOM, card closed or open', () => {
    // The card only ever renders inside a Portal, which is null until mount — so even
    // defaultOpen emits just the trigger during SSR and hydrates without mismatch.
    const html = renderToString(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="/vivek">@vivek</HoverCardTrigger>
        <HoverCardContent>Profile</HoverCardContent>
      </HoverCard>,
    )
    expect(html).toContain('@vivek')
    expect(html).not.toContain('vk-hover-card"')
  })

  it('unmounting mid-delay cancels the pending open instead of opening into the void', () => {
    vi.useFakeTimers()
    const { unmount } = setup()
    hover(screen.getByRole('link'))
    tick(200)
    unmount()
    // Nothing to assert but the absence of a crash and of a stray portal node.
    tick(5000)
    expect(card()).not.toBeInTheDocument()
  })

  it('positions the card and marks it measured with data-positioned', () => {
    setup({ defaultOpen: true })
    const panel = card() as HTMLElement
    // jsdom has no layout, so every rect is 0x0 at 0,0 — the maths itself is proven in
    // utils/position.test.ts. What jsdom can prove is the wiring: measure ran, the
    // resolved coordinates landed as inline styles, and the visibility gate opened.
    expect(panel).toHaveAttribute('data-positioned')
    expect(panel.style.left).toMatch(/px$/)
    expect(panel.style.top).toMatch(/px$/)
    expect(panel).toHaveAttribute('data-side')
    expect(panel).toHaveAttribute('data-align')
  })

  it('throws a named error when a part is rendered outside <HoverCard>', () => {
    // "Cannot read property of null" is not a bug report.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<HoverCardTrigger href="/x">x</HoverCardTrigger>)).toThrow(
      /HoverCard\.Trigger/,
    )
    spy.mockRestore()
  })
})
