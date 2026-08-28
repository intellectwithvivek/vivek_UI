/**
 * Lightbox.
 *
 * The dialog behaviour (trap, inert, scroll lock, focus return) is the shared core that
 * Modal's suite already proves. These cover what a viewer adds: the set, the position in
 * its name and live counter, arrows, keys, swipe, thumbnails, and the boundaries.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Lightbox, type LightboxItem } from './lightbox'

const ITEMS: LightboxItem[] = [
  { src: '/a.jpg', alt: 'A red barn', caption: 'Barn, 2024' },
  { src: '/b.jpg', alt: 'A blue lake', thumbnail: '/b-thumb.jpg' },
  { src: '/c.jpg', alt: 'A green hill' },
]

/** The test document has no landmarks; the viewer is portalled to body, which is the point. */
const AXE_OPTIONS = { rules: { region: { enabled: false } } }

const dialog = () => screen.getByRole('dialog')
const button = (name: string) => screen.getByRole('button', { name })
const shown = () => (dialog().querySelector('.vk-lightbox__image') as HTMLImageElement).alt

describe('Lightbox · structure', () => {
  it('renders nothing while closed, and an empty viewer with zero props when opened', () => {
    const { rerender } = render(<Lightbox />)
    expect(screen.queryByRole('dialog')).toBeNull()
    rerender(<Lightbox open />)
    expect(screen.getByRole('dialog', { name: 'Image viewer' })).toBeInTheDocument()
    expect(screen.getByText('No images')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next image' })).toBeNull()
  })

  it('is a modal dialog named with the position, showing the image, caption, counter and thumbnails', () => {
    render(<Lightbox items={ITEMS} open label="Gallery" />)
    const d = screen.getByRole('dialog', { name: 'Gallery, 1 of 3' })
    expect(d).toHaveAttribute('aria-modal', 'true')
    expect(d).toHaveAttribute('data-count', '3')
    expect(screen.getByRole('img', { name: 'A red barn' })).toHaveAttribute('src', '/a.jpg')
    expect(screen.getByText('Barn, 2024').tagName).toBe('FIGCAPTION')
    expect(screen.getByText('1 / 3')).toHaveAttribute('aria-live', 'polite')
    const thumbs = screen.getByRole('group', { name: 'Thumbnails' })
    expect(thumbs.querySelectorAll('button')).toHaveLength(3)
    expect(button('Show image 1: A red barn')).toHaveAttribute('aria-current', 'true')
    expect(button('Show image 2: A blue lake').querySelector('img')).toHaveAttribute(
      'src',
      '/b-thumb.jpg',
    )
    expect(button('Show image 2: A blue lake').querySelector('img')).toHaveAttribute('alt', '')
  })

  it('hides thumbnails on request and for a single image; single images have no arrows', () => {
    const { rerender } = render(<Lightbox items={ITEMS} open thumbnails={false} />)
    expect(screen.queryByRole('group', { name: 'Thumbnails' })).toBeNull()
    rerender(<Lightbox items={[ITEMS[0] as LightboxItem]} open />)
    expect(screen.queryByRole('group', { name: 'Thumbnails' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Next image' })).toBeNull()
  })

  it('merges className, spreads rest onto the dialog and forwards the ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Lightbox items={ITEMS} open ref={ref} className="mine" data-x="y" />)
    expect(dialog()).toHaveClass('vk-lightbox__panel', 'mine')
    expect(dialog()).toHaveAttribute('data-x', 'y')
    expect(ref.current).toBe(dialog())
  })
})

describe('Lightbox · moving through the set', () => {
  it('arrows move and wrap by default, updating the name, counter, thumbnail and callback', () => {
    const onIndexChange = vi.fn()
    render(<Lightbox items={ITEMS} open onIndexChange={onIndexChange} />)
    fireEvent.click(button('Next image'))
    expect(shown()).toBe('A blue lake')
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
    expect(screen.getByRole('dialog', { name: 'Image viewer, 2 of 3' })).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    expect(button('Show image 2: A blue lake')).toHaveAttribute('aria-current', 'true')
    fireEvent.click(button('Next image'))
    fireEvent.click(button('Next image'))
    expect(shown()).toBe('A red barn') // wrapped
    fireEvent.click(button('Previous image'))
    expect(shown()).toBe('A green hill')
  })

  it('without loop the ends are announced disabled and do nothing', () => {
    const onIndexChange = vi.fn()
    render(<Lightbox items={ITEMS} open loop={false} onIndexChange={onIndexChange} />)
    expect(button('Previous image')).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(button('Previous image'))
    expect(onIndexChange).not.toHaveBeenCalled()
    fireEvent.keyDown(dialog(), { key: 'ArrowLeft' })
    expect(onIndexChange).not.toHaveBeenCalled()
    fireEvent.keyDown(dialog(), { key: 'End' })
    expect(shown()).toBe('A green hill')
    expect(button('Next image')).toHaveAttribute('aria-disabled', 'true')
  })

  it('ArrowRight/ArrowLeft/Home/End on the dialog navigate; other keys pass through', () => {
    render(<Lightbox items={ITEMS} open />)
    expect(fireEvent.keyDown(dialog(), { key: 'ArrowRight' })).toBe(false)
    expect(shown()).toBe('A blue lake')
    fireEvent.keyDown(dialog(), { key: 'End' })
    expect(shown()).toBe('A green hill')
    fireEvent.keyDown(dialog(), { key: 'Home' })
    expect(shown()).toBe('A red barn')
    fireEvent.keyDown(dialog(), { key: 'ArrowLeft' })
    expect(shown()).toBe('A green hill')
    expect(fireEvent.keyDown(dialog(), { key: 'a' })).toBe(true)
  })

  it('a horizontal swipe past the threshold moves; a short drag does not', () => {
    render(<Lightbox items={ITEMS} open />)
    const stage = dialog().querySelector('.vk-lightbox__stage') as HTMLElement
    fireEvent.pointerDown(stage, { clientX: 300 })
    fireEvent.pointerUp(stage, { clientX: 200 })
    expect(shown()).toBe('A blue lake')
    fireEvent.pointerDown(stage, { clientX: 200 })
    fireEvent.pointerUp(stage, { clientX: 220 })
    expect(shown()).toBe('A blue lake')
    fireEvent.pointerDown(stage, { clientX: 100 })
    fireEvent.pointerUp(stage, { clientX: 300 })
    expect(shown()).toBe('A red barn')
  })

  it('thumbnails jump; the index is controllable and clamped', () => {
    function Harness() {
      const [i, setI] = useState(5)
      return <Lightbox items={ITEMS} open index={i} onIndexChange={setI} />
    }
    render(<Harness />)
    expect(shown()).toBe('A green hill') // 5 clamped to the last
    fireEvent.click(button('Show image 1: A red barn'))
    expect(shown()).toBe('A red barn')
  })
})

describe('Lightbox · opening and closing', () => {
  it('the Close button and Escape report closed; the trigger gets focus back', () => {
    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            View
          </button>
          <Lightbox items={ITEMS} open={open} onOpenChange={setOpen} />
        </>
      )
    }
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'View' })
    trigger.focus()
    fireEvent.click(trigger)
    expect(dialog()).toBeInTheDocument()
    expect(dialog().contains(document.activeElement)).toBe(true)
    fireEvent.click(button('Close'))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(trigger).toHaveFocus()
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('has no axe violations', async () => {
    render(<Lightbox items={ITEMS} open />)
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})
