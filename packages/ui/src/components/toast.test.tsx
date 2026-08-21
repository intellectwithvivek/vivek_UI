import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Toast, type ToastApi, ToastProvider, type ToastProviderProps, useToast } from './toast'

/**
 * The imperative API only exists inside the tree, so a throwaway child hands it out.
 * Reading it through `api()` instead of a non-null assertion keeps the failure legible
 * when a test forgets to mount the provider.
 */
let captured: ToastApi | null = null

function Capture() {
  captured = useToast()
  return null
}

function api(): ToastApi {
  if (captured === null) throw new Error('ToastProvider was not mounted')
  return captured
}

function setup(props: Omit<ToastProviderProps, 'children'> = {}) {
  return render(
    <ToastProvider {...props}>
      <Capture />
    </ToastProvider>,
  )
}

/** The toast element itself, given text rendered somewhere inside it. */
function toastOf(text: string): HTMLElement {
  const node = screen.getByText(text).closest('.vk-toast')
  if (!(node instanceof HTMLElement)) throw new Error(`no .vk-toast wraps "${text}"`)
  return node
}

function viewport(): HTMLElement {
  const node = document.querySelector('.vk-toast-viewport')
  if (!(node instanceof HTMLElement)) throw new Error('no .vk-toast-viewport in the document')
  return node
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    captured = null
    vi.useRealTimers()
  })

  it('mounts both live regions before any toast exists', () => {
    setup()

    const polite = screen.getByRole('status')
    const assertive = screen.getByRole('alert')

    // The whole point: a screen reader can observe both regions while they are empty,
    // so the very first toast is announced instead of silently missed.
    expect(polite).toBeEmptyDOMElement()
    expect(assertive).toBeEmptyDOMElement()
    expect(polite).toHaveAttribute('aria-live', 'polite')
    expect(assertive).toHaveAttribute('aria-live', 'assertive')
    expect(polite).toHaveAttribute('aria-atomic', 'true')
    expect(assertive).toHaveAttribute('aria-atomic', 'true')
  })

  it('reflects position and gap on the viewport', () => {
    setup({ position: 'top-center', gap: 12 })

    expect(viewport()).toHaveAttribute('data-position', 'top-center')
    expect(viewport().style.getPropertyValue('--vk-toast-gap')).toBe('12px')
  })

  it('shows a toast and auto-dismisses it after the duration', () => {
    setup({ duration: 3000 })

    act(() => {
      api().toast({ title: 'Saved', description: 'Your changes are live.' })
    })
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByText('Your changes are live.')).toBeInTheDocument()

    advance(2999)
    expect(screen.getByText('Saved')).toBeInTheDocument()

    advance(1)
    expect(screen.queryByText('Saved')).toBeNull()
  })

  it('lets a per-toast duration override the provider default', () => {
    setup({ duration: 5000 })

    act(() => {
      api().toast({ title: 'Quick' })
      api().toast({ title: 'Slow', duration: 400 })
    })

    advance(400)
    expect(screen.queryByText('Slow')).toBeNull()
    expect(screen.getByText('Quick')).toBeInTheDocument()
  })

  it.each([{ duration: Number.POSITIVE_INFINITY }, { duration: null }])(
    'never auto-dismisses when duration is $duration',
    ({ duration }) => {
      setup()

      act(() => {
        api().toast({ title: 'Sticky', duration })
      })

      advance(1000 * 60 * 60)
      expect(screen.getByText('Sticky')).toBeInTheDocument()
      // Sticky must mean "no timer", not "a timer with an absurd delay".
      expect(vi.getTimerCount()).toBe(0)
    },
  )

  it('pauses the timer on hover and resumes from where it left off', () => {
    setup({ duration: 1000 })

    act(() => {
      api().toast({ title: 'Read me' })
    })
    const el = toastOf('Read me')

    advance(600)
    // mouseOver/mouseOut, not mouseEnter/mouseLeave: React synthesises its enter/leave
    // events from the bubbling pair, so dispatching the non-bubbling ones does nothing.
    fireEvent.mouseOver(el)

    advance(60_000)
    expect(screen.getByText('Read me')).toBeInTheDocument()

    fireEvent.mouseOut(el)
    advance(399)
    expect(screen.getByText('Read me')).toBeInTheDocument()

    advance(1)
    expect(screen.queryByText('Read me')).toBeNull()
  })

  it('pauses the timer while focus is inside the toast', () => {
    setup({ duration: 1000 })

    act(() => {
      api().toast({
        title: 'Deleted',
        action: <button type="button">Undo</button>,
      })
    })
    const undo = screen.getByRole('button', { name: 'Undo' })

    act(() => {
      undo.focus()
    })
    advance(60_000)
    expect(screen.getByText('Deleted')).toBeInTheDocument()

    act(() => {
      undo.blur()
    })
    advance(1000)
    expect(screen.queryByText('Deleted')).toBeNull()
  })

  it('stays paused while hover and focus overlap', () => {
    setup({ duration: 1000 })

    act(() => {
      api().toast({
        title: 'Both',
        action: <button type="button">Retry</button>,
      })
    })
    const el = toastOf('Both')
    const retry = screen.getByRole('button', { name: 'Retry' })

    fireEvent.mouseOver(el)
    act(() => {
      retry.focus()
    })

    // Releasing only one of the two holds must not restart the clock.
    fireEvent.mouseOut(el)
    advance(60_000)
    expect(screen.getByText('Both')).toBeInTheDocument()

    act(() => {
      retry.blur()
    })
    advance(1000)
    expect(screen.queryByText('Both')).toBeNull()
  })

  it('caps visible toasts at max and releases the queue as slots free', () => {
    setup({ duration: 1000, max: 2 })

    act(() => {
      api().toast({ title: 'first' })
      api().toast({ title: 'second' })
      api().toast({ title: 'third' })
    })

    expect(screen.getByText('first')).toBeInTheDocument()
    expect(screen.getByText('second')).toBeInTheDocument()
    expect(screen.queryByText('third')).toBeNull()

    // Queued toasts hold no timer, so waiting in line does not burn their duration.
    advance(999)
    expect(screen.queryByText('third')).toBeNull()

    advance(1)
    expect(screen.queryByText('first')).toBeNull()
    expect(screen.queryByText('second')).toBeNull()
    expect(screen.getByText('third')).toBeInTheDocument()

    advance(999)
    expect(screen.getByText('third')).toBeInTheDocument()
    advance(1)
    expect(screen.queryByText('third')).toBeNull()
  })

  it('promotes a queued toast when an explicit dismiss frees the slot', () => {
    setup({ duration: null, max: 1 })

    let visible = ''
    act(() => {
      visible = api().toast({ title: 'holding the slot' })
      api().toast({ title: 'waiting' })
    })
    expect(screen.queryByText('waiting')).toBeNull()

    act(() => {
      api().dismiss(visible)
    })
    expect(screen.getByText('waiting')).toBeInTheDocument()
  })

  it('dismisses by id, dismisses everything, and ignores unknown ids', () => {
    setup({ duration: null })

    let first = ''
    let second = ''
    act(() => {
      first = api().toast({ title: 'alpha' })
      second = api().toast({ title: 'beta' })
    })
    expect(first).not.toBe(second)

    act(() => {
      api().dismiss(first)
    })
    expect(screen.queryByText('alpha')).toBeNull()
    expect(screen.getByText('beta')).toBeInTheDocument()

    // Idempotent: dismissing something already gone, and something never seen.
    expect(() => {
      act(() => {
        api().dismiss(first)
        api().dismiss('not-a-real-id')
      })
    }).not.toThrow()
    expect(screen.getByText('beta')).toBeInTheDocument()

    act(() => {
      api().dismissAll()
    })
    expect(screen.queryByText('beta')).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('dismissAll clears queued toasts too', () => {
    setup({ duration: null, max: 1 })

    act(() => {
      api().toast({ title: 'visible' })
      api().toast({ title: 'queued' })
    })
    act(() => {
      api().dismissAll()
    })

    expect(screen.queryByText('visible')).toBeNull()
    expect(screen.queryByText('queued')).toBeNull()
  })

  it('updates a toast in place', () => {
    setup({ duration: null })

    let id = ''
    act(() => {
      id = api().toast({ title: 'Uploading', tone: 'info' })
    })
    act(() => {
      api().update(id, { title: 'Uploaded', description: 'Done.', tone: 'success' })
    })

    expect(screen.queryByText('Uploading')).toBeNull()
    expect(screen.getByText('Uploaded')).toBeInTheDocument()
    expect(screen.getByText('Done.')).toBeInTheDocument()
    // In place, not appended.
    expect(document.querySelectorAll('.vk-toast')).toHaveLength(1)

    act(() => {
      api().update('not-a-real-id', { title: 'ghost' })
    })
    expect(screen.queryByText('ghost')).toBeNull()
    expect(document.querySelectorAll('.vk-toast')).toHaveLength(1)
  })

  it('reuses an explicit id instead of stacking a second toast', () => {
    setup({ duration: null })

    act(() => {
      api().toast({ id: 'save', title: 'Saving' })
      api().toast({ id: 'save', title: 'Saved' })
    })

    expect(document.querySelectorAll('.vk-toast')).toHaveLength(1)
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it.each([
    { tone: 'info', role: 'status', other: 'alert' },
    { tone: 'success', role: 'status', other: 'alert' },
    { tone: 'warning', role: 'alert', other: 'status' },
    { tone: 'danger', role: 'alert', other: 'status' },
  ] as const)('announces the $tone tone through the $role region', ({ tone, role, other }) => {
    setup({ duration: null })

    act(() => {
      api().toast({ title: 'routed', tone })
    })

    expect(within(screen.getByRole(role)).getByText('routed')).toBeInTheDocument()
    expect(within(screen.getByRole(other)).queryByText('routed')).toBeNull()
  })

  it('gives the dismiss button a real accessible name and closes on click', () => {
    setup({ duration: null })

    act(() => {
      api().toast({ title: 'Close me' })
    })

    const button = screen.getByRole('button', { name: 'Dismiss' })
    fireEvent.click(button)
    expect(screen.queryByText('Close me')).toBeNull()
  })

  it('honours a custom dismiss label and dismissible: false', () => {
    setup({ duration: null, dismissLabel: 'Close notification' })

    act(() => {
      api().toast({ title: 'named' })
      api().toast({ title: 'permanent', dismissible: false })
    })

    expect(screen.getAllByRole('button', { name: 'Close notification' })).toHaveLength(1)
    expect(toastOf('permanent').querySelector('.vk-toast__dismiss')).toBeNull()
  })

  it('never steals focus and puts nothing in the tab order', () => {
    render(
      <ToastProvider duration={null}>
        <Capture />
        <button type="button">outside</button>
      </ToastProvider>,
    )
    const outside = screen.getByRole('button', { name: 'outside' })
    act(() => {
      outside.focus()
    })

    act(() => {
      api().toast({
        title: 'ping',
        action: <button type="button">Retry</button>,
      })
    })

    expect(document.activeElement).toBe(outside)
    expect(viewport()).not.toHaveAttribute('tabindex')
    expect(screen.getByRole('status')).not.toHaveAttribute('tabindex')
    expect(toastOf('ping')).not.toHaveAttribute('tabindex')
  })

  it('clears every timer on unmount and never sets state afterwards', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { unmount } = setup({ duration: 1000 })

    act(() => {
      api().toast({ title: 'x' })
      api().toast({ title: 'y' })
    })
    expect(vi.getTimerCount()).toBe(2)

    unmount()
    expect(vi.getTimerCount()).toBe(0)

    // Nothing left to fire, so nothing can call setState on a gone component.
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })

  it('throws a useful error when useToast is called outside a provider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Capture />)).toThrow(/ToastProvider/)
    error.mockRestore()
  })

  it('has no axe violations with toasts on screen', async () => {
    // axe schedules its own work, so it needs the real clock back.
    vi.useRealTimers()
    setup({ duration: null })

    act(() => {
      api().toast({ title: 'Saved', description: 'All good.', tone: 'success' })
      api().toast({
        title: 'Upload failed',
        description: 'The file was too large.',
        tone: 'danger',
        action: <button type="button">Retry</button>,
      })
    })

    expect(await axe(viewport())).toHaveNoViolations()
  })
})

describe('Toast', () => {
  it('renders with no props at all', () => {
    const { container } = render(<Toast />)
    expect(container.querySelector('.vk-toast')).toBeInTheDocument()
  })

  it('renders title, description, action and tone', () => {
    render(
      <Toast
        tone="warning"
        title="Heads up"
        description="Disk is nearly full."
        action={<button type="button">Manage</button>}
      />,
    )

    expect(screen.getByText('Heads up')).toBeInTheDocument()
    expect(screen.getByText('Disk is nearly full.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument()
    expect(toastOf('Heads up')).toHaveAttribute('data-tone', 'warning')
  })

  it('carries no live role of its own, so the region is not doubled up', () => {
    render(<Toast title="quiet" />)
    expect(toastOf('quiet')).not.toHaveAttribute('role')
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('shows the dismiss button only when a handler is given', () => {
    const { rerender } = render(<Toast title="plain" />)
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull()

    const onDismiss = vi.fn()
    rerender(<Toast title="plain" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('merges className and spreads the rest onto the root', () => {
    render(<Toast title="merged" className="mine" data-testid="t" role="status" />)
    const el = screen.getByTestId('t')
    expect(el).toHaveClass('vk-toast')
    expect(el).toHaveClass('mine')
    expect(el).toHaveAttribute('role', 'status')
  })

  it('drops the icon when icon is null', () => {
    render(<Toast title="bare" icon={null} />)
    expect(toastOf('bare').querySelector('.vk-toast__icon')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Toast tone="danger" title="Failed" description="Try again." onDismiss={() => {}} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
