/**
 * ContextMenu.
 *
 * DropdownMenu's tests already cover the menu pattern the two components share. These
 * cover what is specific to a right-click menu: opening at a point, the keyboard path that
 * `contextmenu` alone would leave out, and giving focus back to wherever it was.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ContextMenu } from './context-menu'

function Menu({
  onSelect = () => {},
  onOpenChange,
}: {
  onSelect?: (id: string) => void
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <ContextMenu onOpenChange={onOpenChange}>
      <ContextMenu.Trigger data-testid="surface">Right-click me</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Label>File</ContextMenu.Label>
        <ContextMenu.Item onSelect={() => onSelect('copy')} shortcut="⌘C">
          Copy
        </ContextMenu.Item>
        <ContextMenu.Item disabled onSelect={() => onSelect('paste')}>
          Paste
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item closeOnSelect={false} onSelect={() => onSelect('rename')}>
          Rename
        </ContextMenu.Item>
        <ContextMenu.Item onSelect={() => onSelect('zip')}>Zip</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  )
}

const surface = () => screen.getByTestId('surface')
const openAt = (x = 40, y = 50) => fireEvent.contextMenu(surface(), { clientX: x, clientY: y })
const items = () => screen.getAllByRole('menuitem')

/** The test document has no landmarks; the menu is portalled to body, which is the point. */
const AXE_OPTIONS = { rules: { region: { enabled: false } } }

describe('ContextMenu · opening', () => {
  it('is closed by default and the surface is focusable for the keyboard path', () => {
    render(<Menu />)
    expect(screen.queryByRole('menu')).toBeNull()
    expect(surface()).toHaveAttribute('tabindex', '0')
    expect(surface()).toHaveAttribute('aria-haspopup', 'menu')
  })

  it('opens at the pointer on right-click and suppresses the browser menu', () => {
    const onOpenChange = vi.fn()
    render(<Menu onOpenChange={onOpenChange} />)
    const event = openAt(40, 50)
    expect(event).toBe(false) // preventDefault was called
    const menu = screen.getByRole('menu')
    expect(menu).toBeInTheDocument()
    // Anchored to a zero-size rect at the pointer: x is the pointer, y is pointer + offset.
    expect(menu.style.left).toBe('40px')
    expect(menu.style.top).toBe('52px')
    expect(surface()).toHaveAttribute('aria-controls', menu.id)
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('opens on Shift+F10 and on the ContextMenu key, so a keyboard has a way in', () => {
    render(<Menu />)
    surface().focus()
    fireEvent.keyDown(surface(), { key: 'F10', shiftKey: true })
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    fireEvent.keyDown(surface(), { key: 'ContextMenu' })
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('does not open from F10 without Shift', () => {
    render(<Menu />)
    fireEvent.keyDown(surface(), { key: 'F10' })
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('focuses the first enabled item on open', () => {
    render(<Menu />)
    openAt()
    expect(items()[0]).toHaveFocus()
    expect(items()[0]).toHaveTextContent('Copy')
  })
})

describe('ContextMenu · the menu', () => {
  it('has menu semantics: menuitems, a separator, aria-disabled rather than disabled', () => {
    render(<Menu />)
    openAt()
    expect(screen.getByRole('menu')).toHaveAttribute('aria-orientation', 'vertical')
    expect(items()).toHaveLength(4)
    expect(screen.getByRole('separator')).toBeInTheDocument()
    // The command stays announced; it is just unavailable.
    expect(items()[1]).toHaveAttribute('aria-disabled', 'true')
    expect(items()[1]).not.toBeDisabled()
  })

  it('arrows move between items, skipping disabled ones, and wrap', () => {
    render(<Menu />)
    openAt()
    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toHaveTextContent('Rename')
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toHaveTextContent('Zip')
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toHaveTextContent('Copy')
    fireEvent.keyDown(menu, { key: 'End' })
    expect(document.activeElement).toHaveTextContent('Zip')
  })

  it('typeahead jumps to a matching item', () => {
    render(<Menu />)
    openAt()
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'z' })
    expect(document.activeElement).toHaveTextContent('Zip')
  })

  it('activating an item reports it and closes, unless closeOnSelect is off', () => {
    const onSelect = vi.fn()
    render(<Menu onSelect={onSelect} />)
    openAt()
    fireEvent.click(screen.getByRole('menuitem', { name: /Rename/ }))
    expect(onSelect).toHaveBeenCalledWith('rename')
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('menuitem', { name: /Copy/ }))
    expect(onSelect).toHaveBeenCalledWith('copy')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('a disabled item does nothing when clicked', () => {
    const onSelect = vi.fn()
    render(<Menu onSelect={onSelect} />)
    openAt()
    fireEvent.click(screen.getByRole('menuitem', { name: /Paste/ }))
    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('keeps the shortcut out of the accessible name', () => {
    render(<Menu />)
    openAt()
    expect(screen.getByRole('menuitem', { name: 'Copy' })).toBeInTheDocument()
    expect(screen.getByText('⌘C')).toHaveClass('vk-context-menu__shortcut')
    expect(screen.getByText('⌘C')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('ContextMenu · closing and focus', () => {
  it('Escape closes and returns focus to the surface', () => {
    render(<Menu />)
    surface().focus()
    openAt()
    expect(items()[0]).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(surface()).toHaveFocus()
  })

  it('Tab closes rather than moving through the items', () => {
    render(<Menu />)
    openAt()
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Tab' })
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('a click outside closes', () => {
    const onOpenChange = vi.fn()
    render(<Menu onOpenChange={onOpenChange} />)
    openAt()
    fireEvent.pointerDown(document.body)
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('menu')).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('renders the surface as a caller element with asChild, keeping the wiring', () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger asChild>
          <section aria-label="Canvas">draw here</section>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>Reset</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    )
    const canvas = screen.getByRole('region', { name: 'Canvas' })
    expect(canvas.tagName).toBe('SECTION')
    fireEvent.contextMenu(canvas, { clientX: 10, clientY: 10 })
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('has no axe violations while open', async () => {
    render(<Menu />)
    openAt()
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})
