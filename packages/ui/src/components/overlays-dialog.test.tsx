import { fireEvent, render, screen } from '@testing-library/react'
import { type ReactNode, useRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Drawer, type DrawerProps } from './drawer'
import { Modal, type ModalProps } from './modal'

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

/**
 * jsdom reports a `clientWidth` of 0, which `useScrollLock` would read as a
 * 1024px-wide scrollbar. Same stub the hook's own tests use.
 */
function stubScrollbar(scrollbar: number) {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    value: window.innerWidth - scrollbar,
  })
}

afterEach(() => {
  Reflect.deleteProperty(document.documentElement, 'clientWidth')
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})

/** The backdrop element, without a non-null assertion. */
function backdrop(block: 'vk-modal' | 'vk-drawer' = 'vk-modal'): HTMLElement {
  const found = document.querySelector(`.${block}[data-part="overlay"]`)
  if (!(found instanceof HTMLElement)) throw new Error(`no ${block} backdrop in the document`)
  return found
}

function elementById(id: string | null): HTMLElement {
  if (!id) throw new Error('expected an id to resolve')
  const found = document.getElementById(id)
  if (!found) throw new Error(`no element with id ${id}`)
  return found
}

/** The `render` container — the sibling root a dialog has to make inert. */
function outsideRoot(): HTMLElement {
  const found = document.body.firstElementChild
  if (!(found instanceof HTMLElement)) throw new Error('no render container')
  return found
}

interface FixtureProps extends Omit<ModalProps, 'children'> {
  /** Extra content inside the body, e.g. a nested dialog. */
  extra?: ReactNode
}

/** Controlled: the parent owns `open`, the way an app normally wires this up. */
function ControlledModal({ extra, onOpenChange, ...props }: FixtureProps) {
  const [open, setOpen] = useState(false)
  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Modal open={open} onOpenChange={handleOpenChange} {...props}>
        <Modal.Header>
          <Modal.Title>Settings</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>Body copy</Modal.Body>
        <Modal.Footer>
          <button type="button">Save</button>
        </Modal.Footer>
        {extra}
      </Modal>
    </>
  )
}

/** Controlled, but the parent ignores `onOpenChange` — nothing may close by itself. */
function StuckOpenModal(props: Omit<ModalProps, 'children' | 'open'>) {
  const onOpenChange = vi.fn()
  return (
    <Modal open onOpenChange={onOpenChange} {...props}>
      <Modal.Header>
        <Modal.Title>Stuck</Modal.Title>
        <Modal.CloseButton />
      </Modal.Header>
      <Modal.Body>Body copy</Modal.Body>
    </Modal>
  )
}

/** Uncontrolled: the dialog owns its own state from `defaultOpen` onwards. */
function UncontrolledModal({
  onOpenChange,
  ...props
}: Omit<ModalProps, 'children' | 'open' | 'defaultOpen'>) {
  return (
    <>
      <button type="button">Outside</button>
      <Modal defaultOpen onOpenChange={onOpenChange} {...props}>
        <Modal.Header>
          <Modal.Title>Untamed</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>Body copy</Modal.Body>
      </Modal>
    </>
  )
}

function open(): void {
  fireEvent.click(triggerButton())
}

function triggerButton(): HTMLElement {
  const found = screen.getByRole('button', { name: 'Open', hidden: true })
  // Real clicks focus the trigger; fireEvent does not, and focus restoration is exactly
  // what these tests are about.
  found.focus()
  return found
}

/* ------------------------------------------------------------------ *
 * Modal
 * ------------------------------------------------------------------ */

describe('Modal', () => {
  it('renders nothing at all while closed', () => {
    const { container } = render(<ControlledModal />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.querySelector('.vk-modal')).toBeNull()
    // No hidden DOM anywhere: the trigger is the only thing rendered.
    expect(container.querySelectorAll('*')).toHaveLength(1)
  })

  it('opens and closes while controlled', () => {
    const onOpenChange = vi.fn()
    render(<ControlledModal onOpenChange={onOpenChange} />)

    open()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    // Opening came from the parent, so there is nothing for the dialog to report yet.
    expect(onOpenChange).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('stays open while controlled if the parent ignores onOpenChange', () => {
    render(<StuckOpenModal />)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    fireEvent.keyDown(document.body, { key: 'Escape' })
    fireEvent.pointerDown(backdrop())

    // The prop is the single source of truth; the dialog may not close itself.
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('opens from defaultOpen and closes itself while uncontrolled', () => {
    const onOpenChange = vi.fn()
    render(<UncontrolledModal onOpenChange={onOpenChange} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    // Still reported, so analytics and side effects work in both modes.
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('wires role, aria-modal, aria-labelledby and aria-describedby', () => {
    render(<ControlledModal />)
    open()

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')

    const labelledBy = dialog.getAttribute('aria-labelledby')
    expect(elementById(labelledBy)).toHaveTextContent('Settings')
    expect(elementById(labelledBy).tagName).toBe('H2')

    const describedBy = dialog.getAttribute('aria-describedby')
    expect(elementById(describedBy)).toHaveTextContent('Body copy')

    // Derived, never hardcoded.
    expect(labelledBy).not.toBe(describedBy)
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBe(dialog)
  })

  it('gives two dialogs on one page different ids', () => {
    render(
      <>
        <UncontrolledModal />
        <UncontrolledModal />
      </>,
    )
    // `hidden: true` because the second dialog has made the first one inert.
    const ids = screen
      .getAllByRole('dialog', { hidden: true })
      .map((dialog) => dialog.getAttribute('aria-labelledby'))
    expect(ids[0]).toBeTruthy()
    expect(ids[0]).not.toBe(ids[1])
  })

  it('accepts the title prop as a shortcut for a Title part', () => {
    render(
      <Modal defaultOpen title="Delete project?">
        <Modal.Body>This cannot be undone.</Modal.Body>
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Delete project?' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Delete project?' })).toBeInTheDocument()
  })

  it('leaves aria-describedby off when there is no Body', () => {
    render(
      <Modal defaultOpen title="No body">
        <p>plain content</p>
      </Modal>,
    )
    // A dangling aria-describedby is worse than none: it is an axe failure and a
    // screen reader dead end.
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby')
  })

  it('honours a caller-supplied aria-labelledby over the Title part', () => {
    render(
      <>
        <h1 id="page-title">Page</h1>
        <Modal defaultOpen aria-labelledby="page-title">
          <Modal.Title>Ignored</Modal.Title>
        </Modal>
      </>,
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'page-title')
  })

  /* --- focus ----------------------------------------------------- */

  it('moves focus into the dialog on open and back to the trigger on close', () => {
    render(<ControlledModal />)
    const trigger = triggerButton()
    fireEvent.click(trigger)

    // First focusable inside the panel.
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it('honours initialFocus', () => {
    function Fixture() {
      const inputRef = useRef<HTMLInputElement>(null)
      const [isOpen, setIsOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open
          </button>
          <Modal open={isOpen} onOpenChange={setIsOpen} initialFocus={inputRef} title="Rename">
            <Modal.Body>
              <input ref={inputRef} aria-label="New name" />
            </Modal.Body>
            <Modal.Footer>
              <button type="button">Save</button>
            </Modal.Footer>
          </Modal>
        </>
      )
    }

    render(<Fixture />)
    open()
    // Not the first focusable — the one the caller asked for.
    expect(screen.getByRole('textbox', { name: 'New name' })).toHaveFocus()
  })

  it('focuses the panel itself when it holds nothing focusable', () => {
    render(
      <Modal defaultOpen title="Nothing here">
        <Modal.Body>read-only</Modal.Body>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('tabindex', '-1')
    expect(dialog).toHaveFocus()
  })

  it('keeps Tab inside the dialog', () => {
    render(<ControlledModal />)
    open()

    const close = screen.getByRole('button', { name: 'Close' })
    const save = screen.getByRole('button', { name: 'Save' })

    save.focus()
    fireEvent.keyDown(save, { key: 'Tab' })
    expect(close).toHaveFocus()

    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true })
    expect(save).toHaveFocus()
  })

  /* --- dismissal ------------------------------------------------- */

  it('closes on Escape', () => {
    render(<ControlledModal />)
    open()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('respects closeOnEscape={false}', () => {
    render(<ControlledModal closeOnEscape={false} />)
    open()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // The rest of the dismissal contract still works.
    fireEvent.pointerDown(backdrop())
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes on a backdrop press', () => {
    render(<ControlledModal />)
    open()
    fireEvent.pointerDown(backdrop())
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('respects closeOnOverlayClick={false}', () => {
    render(<ControlledModal closeOnOverlayClick={false} />)
    open()
    fireEvent.pointerDown(backdrop())
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('ignores a secondary-button press on the backdrop', () => {
    render(<ControlledModal />)
    open()
    fireEvent.pointerDown(backdrop(), { button: 2 })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not close on a press inside the panel', () => {
    render(<ControlledModal />)
    open()

    fireEvent.pointerDown(screen.getByRole('dialog'))
    fireEvent.pointerDown(screen.getByText('Body copy'))
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not close when a press starts in the panel and ends on the backdrop', () => {
    render(<ControlledModal />)
    open()

    // A text selection that drags out of the panel. Dismissing here is the classic
    // click-based bug; the press target is what decides.
    fireEvent.pointerDown(screen.getByText('Body copy'))
    fireEvent.pointerUp(backdrop())
    fireEvent.click(backdrop())

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  /* --- scroll lock ----------------------------------------------- */

  it('locks body scroll while open and releases it on close', () => {
    stubScrollbar(0)
    render(<ControlledModal />)
    expect(document.body.style.overflow).toBe('')

    open()
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(document.body.style.overflow).toBe('')
  })

  it('compensates for the scrollbar so the page does not shift', () => {
    stubScrollbar(15)
    render(<ControlledModal />)
    open()
    expect(document.body.style.paddingRight).toBe('15px')

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(document.body.style.paddingRight).toBe('')
  })

  /* --- inert outside content ------------------------------------- */

  it('makes the rest of the page inert while open and restores it on close', () => {
    render(<ControlledModal />)
    const root = outsideRoot()
    expect(root).not.toHaveAttribute('inert')

    open()
    expect(root).toHaveAttribute('inert')
    expect(root).toHaveAttribute('aria-hidden', 'true')
    // The portal the dialog lives in is on the ancestor path and must stay reachable.
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(root).not.toHaveAttribute('inert')
    expect(root).not.toHaveAttribute('aria-hidden')
  })

  it('hides the trigger from assistive technology while open', () => {
    render(<ControlledModal />)
    open()
    // `getByRole` ignores the accessibility-hidden subtree, which is the point.
    expect(screen.queryByRole('button', { name: 'Open' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Open', hidden: true })).toBeInTheDocument()
  })

  it('leaves a live region rooted at the body announcing', () => {
    // Where a Toast actually lives: its own portal at the body, a sibling of the
    // dialog's. Nested inside another root it would be hidden with that root — see the
    // limitation noted on hideOutside.
    const live = document.createElement('div')
    live.setAttribute('role', 'status')
    live.textContent = 'saved'
    document.body.append(live)

    try {
      render(<UncontrolledModal />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      // A toast must still be heard over an open dialog.
      expect(live).not.toHaveAttribute('aria-hidden')
      expect(live).not.toHaveAttribute('inert')
    } finally {
      live.remove()
    }
  })

  /* --- nesting --------------------------------------------------- */

  it('lets Escape close only the innermost dialog', () => {
    function Nested() {
      const [innerOpen, setInnerOpen] = useState(false)
      return (
        <ControlledModal
          extra={
            <>
              <button type="button" onClick={() => setInnerOpen(true)}>
                Open inner
              </button>
              <Modal open={innerOpen} onOpenChange={setInnerOpen} title="Inner">
                <Modal.Body>Inner body</Modal.Body>
                <Modal.Footer>
                  <button type="button">Confirm</button>
                </Modal.Footer>
              </Modal>
            </>
          }
        />
      )
    }

    render(<Nested />)
    open()
    const innerTrigger = screen.getByRole('button', { name: 'Open inner' })
    innerTrigger.focus()
    fireEvent.click(innerTrigger)

    expect(screen.getAllByRole('dialog', { hidden: true })).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus()

    fireEvent.keyDown(document.body, { key: 'Escape' })

    // Only the inner one goes, and focus lands back on what opened it.
    const remaining = screen.getAllByRole('dialog')
    expect(remaining).toHaveLength(1)
    expect(remaining[0]).toHaveAccessibleName('Settings')
    expect(screen.getByRole('button', { name: 'Open inner' })).toHaveFocus()

    // The outer dialog is now the top layer again.
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('keeps the scroll locked while a nested dialog closes', () => {
    stubScrollbar(0)
    function Nested() {
      const [innerOpen, setInnerOpen] = useState(true)
      return (
        <Modal defaultOpen title="Outer">
          <Modal.Body>outer</Modal.Body>
          <Modal open={innerOpen} onOpenChange={setInnerOpen} title="Inner">
            <Modal.Body>inner</Modal.Body>
          </Modal>
        </Modal>
      )
    }

    render(<Nested />)
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(document.body, { key: 'Escape' })
    // The outer dialog is still open: releasing the lock here would hand scrolling back
    // to a user who is still looking at a modal.
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(document.body.style.overflow).toBe('')
  })

  it('restores the outer dialog when a nested one closes', () => {
    render(
      <Modal defaultOpen title="Outer">
        <Modal.Body>outer</Modal.Body>
        <Modal defaultOpen title="Inner">
          <Modal.Body>inner</Modal.Body>
        </Modal>
      </Modal>,
    )

    const outerPanel = screen.getByRole('dialog', { name: 'Outer', hidden: true })
    const outerPortal = outerPanel.parentElement?.parentElement
    // While the inner dialog is up, the outer one is behind it and therefore inert too.
    expect(outerPortal).toHaveAttribute('inert')

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(outerPortal).not.toHaveAttribute('inert')
    expect(screen.getByRole('dialog', { name: 'Outer' })).toBeInTheDocument()
  })

  /* --- variants and passthrough ---------------------------------- */

  it('defaults to size md and maps size to a data attribute', () => {
    const { rerender } = render(<UncontrolledModal />)
    expect(screen.getByRole('dialog')).toHaveAttribute('data-size', 'md')

    rerender(<UncontrolledModal size="full" />)
    expect(screen.getByRole('dialog')).toHaveAttribute('data-size', 'full')
  })

  it('puts overlayClassName on the backdrop, not the panel', () => {
    render(
      <Modal defaultOpen title="Backdrop" overlayClassName="dim" className="mine">
        <Modal.Body>body</Modal.Body>
      </Modal>,
    )
    expect(backdrop()).toHaveClass('vk-modal')
    expect(backdrop()).toHaveClass('dim')
    expect(screen.getByRole('dialog')).not.toHaveClass('dim')
  })

  it('does not let Escape tunnel to the outer dialog when the inner one opts out', () => {
    render(
      <Modal defaultOpen title="Outer">
        <Modal.Body>outer</Modal.Body>
        <Modal defaultOpen title="Inner" closeOnEscape={false}>
          <Modal.Body>inner</Modal.Body>
        </Modal>
      </Modal>,
    )

    fireEvent.keyDown(document.body, { key: 'Escape' })
    // The innermost layer answers Escape — and answering with "no" is still answering.
    expect(screen.getAllByRole('dialog', { hidden: true })).toHaveLength(2)
  })

  it('merges className and forwards rest onto the panel', () => {
    render(
      <Modal defaultOpen title="Passthrough" className="mine" data-testid="panel">
        <Modal.Body>body</Modal.Body>
      </Modal>,
    )
    const dialog = screen.getByTestId('panel')
    expect(dialog).toHaveClass('vk-modal__panel')
    expect(dialog).toHaveClass('mine')
  })

  it('forwards a ref to the panel', () => {
    function Fixture() {
      const ref = useRef<HTMLDivElement>(null)
      const [seen, setSeen] = useState('')
      return (
        <>
          <Modal defaultOpen title="Ref" ref={ref}>
            <Modal.Body>body</Modal.Body>
          </Modal>
          <button type="button" onClick={() => setSeen(ref.current?.getAttribute('role') ?? '')}>
            probe
          </button>
          <span data-testid="seen">{seen}</span>
        </>
      )
    }
    render(<Fixture />)
    fireEvent.click(screen.getByRole('button', { name: 'probe', hidden: true }))
    expect(screen.getByTestId('seen')).toHaveTextContent('dialog')
  })

  it('lets a CloseButton onClick run first and cancel the close', () => {
    render(
      <Modal defaultOpen title="Guarded">
        <Modal.CloseButton onClick={(event) => event.preventDefault()} />
        <Modal.Body>body</Modal.Body>
      </Modal>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  /* --- a11y ------------------------------------------------------ */

  it('has no axe violations while open', async () => {
    render(<ControlledModal />)
    open()
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('has no axe violations while closed', async () => {
    const { container } = render(<ControlledModal />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders to nothing on the server, even when open', () => {
    // Server-safe by default (§9): no document at module scope, and the portal has
    // nothing to mount into until it is in a browser.
    expect(
      renderToString(
        <Modal defaultOpen title="SSR">
          <Modal.Body>body</Modal.Body>
        </Modal>,
      ),
    ).toBe('')
  })
})

/* ------------------------------------------------------------------ *
 * Drawer
 * ------------------------------------------------------------------ */

function ControlledDrawer({ onOpenChange, ...props }: Omit<DrawerProps, 'children'>) {
  const [isOpen, setIsOpen] = useState(false)
  const handleOpenChange = (next: boolean) => {
    setIsOpen(next)
    onOpenChange?.(next)
  }
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open
      </button>
      <Drawer open={isOpen} onOpenChange={handleOpenChange} {...props}>
        <Drawer.Header>
          <Drawer.Title>Filters</Drawer.Title>
          <Drawer.CloseButton />
        </Drawer.Header>
        <Drawer.Body>Drawer body</Drawer.Body>
        <Drawer.Footer>
          <button type="button">Apply</button>
        </Drawer.Footer>
      </Drawer>
    </>
  )
}

describe('Drawer', () => {
  it('renders nothing while closed', () => {
    render(<ControlledDrawer />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.querySelector('.vk-drawer')).toBeNull()
  })

  it('opens and closes while controlled', () => {
    const onOpenChange = vi.fn()
    render(<ControlledDrawer onOpenChange={onOpenChange} />)

    open()
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('opens from defaultOpen and closes itself while uncontrolled', () => {
    render(
      <Drawer defaultOpen title="Menu">
        <Drawer.Body>links</Drawer.Body>
        <Drawer.CloseButton />
      </Drawer>,
    )
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('is a modal dialog with the same ARIA wiring as Modal', () => {
    render(<ControlledDrawer />)
    open()

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(elementById(dialog.getAttribute('aria-labelledby'))).toHaveTextContent('Filters')
    expect(elementById(dialog.getAttribute('aria-describedby'))).toHaveTextContent('Drawer body')
  })

  it('moves focus in on open and back to the trigger on close', () => {
    render(<ControlledDrawer />)
    const trigger = triggerButton()
    fireEvent.click(trigger)
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(trigger).toHaveFocus()
  })

  it('honours initialFocus', () => {
    function Fixture() {
      const ref = useRef<HTMLButtonElement>(null)
      return (
        <Drawer defaultOpen title="Filters" initialFocus={ref}>
          <Drawer.CloseButton />
          <Drawer.Body>
            <button type="button" ref={ref}>
              Reset
            </button>
          </Drawer.Body>
        </Drawer>
      )
    }
    render(<Fixture />)
    expect(screen.getByRole('button', { name: 'Reset' })).toHaveFocus()
  })

  it('closes on Escape and respects closeOnEscape={false}', () => {
    const { unmount } = render(<ControlledDrawer closeOnEscape={false} />)
    open()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    unmount()

    render(<ControlledDrawer />)
    open()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes on a backdrop press and respects closeOnOverlayClick={false}', () => {
    const { unmount } = render(<ControlledDrawer closeOnOverlayClick={false} />)
    open()
    fireEvent.pointerDown(backdrop('vk-drawer'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    unmount()

    render(<ControlledDrawer />)
    open()
    fireEvent.pointerDown(backdrop('vk-drawer'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('does not close on a press inside the panel', () => {
    render(<ControlledDrawer />)
    open()
    fireEvent.pointerDown(screen.getByText('Drawer body'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('locks and releases body scroll', () => {
    stubScrollbar(0)
    render(<ControlledDrawer />)
    open()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(document.body.style.overflow).toBe('')
  })

  it('makes the rest of the page inert while open', () => {
    render(<ControlledDrawer />)
    const root = outsideRoot()
    open()
    expect(root).toHaveAttribute('inert')
    expect(root).toHaveAttribute('aria-hidden', 'true')
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(root).not.toHaveAttribute('inert')
  })

  it('defaults to side end / size md and maps both to logical data attributes', () => {
    const { rerender } = render(
      <Drawer defaultOpen title="Menu">
        <Drawer.Body>links</Drawer.Body>
      </Drawer>,
    )
    let dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('data-side', 'end')
    expect(dialog).toHaveAttribute('data-size', 'md')

    for (const side of ['start', 'end', 'top', 'bottom'] as const) {
      rerender(
        <Drawer defaultOpen title="Menu" side={side} size="lg">
          <Drawer.Body>links</Drawer.Body>
        </Drawer>,
      )
      dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('data-side', side)
      expect(dialog).toHaveAttribute('data-size', 'lg')
    }
  })

  it('nests inside a Modal, with Escape closing only the drawer', () => {
    function Nested() {
      const [drawerOpen, setDrawerOpen] = useState(true)
      return (
        <Modal defaultOpen title="Outer modal">
          <Modal.Body>outer</Modal.Body>
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Inner drawer">
            <Drawer.Body>inner</Drawer.Body>
          </Drawer>
        </Modal>
      )
    }
    render(<Nested />)
    expect(screen.getAllByRole('dialog', { hidden: true })).toHaveLength(2)

    fireEvent.keyDown(document.body, { key: 'Escape' })
    const remaining = screen.getAllByRole('dialog')
    expect(remaining).toHaveLength(1)
    expect(remaining[0]).toHaveAccessibleName('Outer modal')
  })

  it('merges className and forwards rest onto the panel', () => {
    render(
      <Drawer defaultOpen title="Menu" className="mine" data-testid="panel">
        <Drawer.Body>links</Drawer.Body>
      </Drawer>,
    )
    const dialog = screen.getByTestId('panel')
    expect(dialog).toHaveClass('vk-drawer__panel')
    expect(dialog).toHaveClass('mine')
  })

  it('has no axe violations while open', async () => {
    render(<ControlledDrawer />)
    open()
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('has no axe violations while closed', async () => {
    const { container } = render(<ControlledDrawer />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders to nothing on the server, even when open', () => {
    expect(
      renderToString(
        <Drawer defaultOpen title="SSR" side="start">
          <Drawer.Body>body</Drawer.Body>
        </Drawer>,
      ),
    ).toBe('')
  })
})
