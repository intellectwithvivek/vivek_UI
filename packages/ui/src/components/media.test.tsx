/**
 * Image, Newsletter and MapEmbed.
 *
 * Grouped because they share a theme: each replaces something people hand-roll onto a
 * marketing page and get subtly wrong. The tests target those specific mistakes rather than
 * re-proving that React renders.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Image } from './image'
import { MapEmbed } from './map-embed'
import { Newsletter } from './newsletter'

describe('Image', () => {
  it('reserves the box before the file arrives, so the page cannot shift', () => {
    // The largest single contributor to a bad CLS score is images with no reserved space.
    const { container } = render(<Image alt="A landscape" ratio={16 / 9} src="/x.jpg" />)
    const frame = container.querySelector('.vk-image') as HTMLElement
    // jsdom normalises the shorthand to "<ratio> / 1", so compare the computed number
    // rather than the string it chose to store.
    const [w, h] = frame.style.aspectRatio.split('/').map((part) => Number(part.trim()))
    expect((w ?? 0) / (h || 1)).toBeCloseTo(16 / 9, 5)
  })

  it('shows the fallback instead of a broken-image icon when loading fails', () => {
    render(<Image alt="Team photo" fallback="Unavailable" src="/missing.jpg" />)
    fireEvent.error(screen.getByRole('img', { name: 'Team photo' }))
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
  })

  it('keeps the description reachable even after the image is gone', () => {
    // The <img> is unmounted on error, so the alt text has to survive somewhere else or the
    // information disappears entirely for a screen-reader user.
    const { container } = render(<Image alt="Our Bengaluru office" src="/missing.jpg" />)
    fireEvent.error(screen.getByRole('img'))
    expect(container.textContent).toContain('Our Bengaluru office')
  })

  it('fades in only once loaded, so there is no flash of a half-painted image', () => {
    const { container } = render(<Image alt="A photo" src="/x.jpg" />)
    const frame = container.querySelector('.vk-image') as HTMLElement
    expect(frame).toHaveAttribute('data-status', 'loading')
    fireEvent.load(screen.getByRole('img'))
    expect(frame).toHaveAttribute('data-status', 'loaded')
  })

  it('lazy-loads by default and can be made eager for a hero', () => {
    const { rerender } = render(<Image alt="a" src="/x.jpg" />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy')
    rerender(<Image alt="a" loading="eager" src="/x.jpg" />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager')
  })

  it('renders a figure only when there is a caption', () => {
    const { container, rerender } = render(<Image alt="a" src="/x.jpg" />)
    expect(container.querySelector('figure')).toBeNull()
    rerender(<Image alt="a" caption="Photo: Vivek" src="/x.jpg" />)
    expect(container.querySelector('figcaption')).toHaveTextContent('Photo: Vivek')
  })

  it('treats an empty alt as decorative rather than unnamed', () => {
    // alt="" is a deliberate statement, and axe must not flag it.
    render(<Image alt="" src="/decoration.svg" />)
    expect(screen.getByRole('presentation', { hidden: true })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<Image alt="A described photo" ratio={4 / 3} src="/x.jpg" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Newsletter', () => {
  it('labels the field even though the label is not visible', () => {
    // A placeholder disappears the moment you type, so it cannot be the only label.
    render(<Newsletter />)
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
  })

  it('gives each instance a unique field id', () => {
    // Two newsletters on a page - a hero and a footer - is the normal case. A shared
    // hardcoded id silently breaks BOTH labels: clicking either focuses the first field.
    render(
      <>
        <Newsletter label="Hero email" />
        <Newsletter label="Footer email" />
      </>,
    )
    const first = screen.getByLabelText('Hero email')
    const second = screen.getByLabelText('Footer email')
    expect(first.id).not.toBe(second.id)
    expect(first.id).toBeTruthy()
  })

  it('uses the browser email type, rather than a hand-rolled regex', () => {
    render(<Newsletter />)
    const input = screen.getByLabelText('Email address')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toBeRequired()
  })

  it('reports success through a live region', async () => {
    render(<Newsletter onSubscribe={() => Promise.resolve()} />)
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'a@b.com' },
    })
    fireEvent.submit(
      screen.getByRole('button', { name: 'Subscribe' }).closest('form') as HTMLFormElement,
    )
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/check your inbox/i)
    })
  })

  it('reports failure rather than silently doing nothing', async () => {
    render(<Newsletter onSubscribe={() => Promise.reject(new Error('nope'))} />)
    fireEvent.submit(
      screen.getByRole('button', { name: 'Subscribe' }).closest('form') as HTMLFormElement,
    )
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/did not work/i)
    })
  })

  it('disables the control while in flight, so it cannot be double-submitted', async () => {
    let release: (() => void) | undefined
    const pending = new Promise<void>((resolve) => {
      release = resolve
    })
    render(<Newsletter onSubscribe={() => pending} />)
    const form = screen.getByRole('button').closest('form') as HTMLFormElement
    fireEvent.submit(form)
    await waitFor(() => expect(screen.getByRole('button')).toBeDisabled())
    release?.()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Newsletter description="Monthly, no spam." title="Stay in the loop" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('MapEmbed', () => {
  it('loads OpenStreetMap immediately, because it sets no cookies', () => {
    render(<MapEmbed query="Bengaluru" title="Our office" />)
    const frame = screen.getByTitle('Our office')
    expect(frame.tagName).toBe('IFRAME')
    expect(frame.getAttribute('src')).toContain('openstreetmap.org')
  })

  it('gates Google behind a click, because the iframe sets cookies on render', () => {
    // The GDPR footgun: a Google Maps iframe contacts Google on first paint, before the
    // visitor has agreed to anything.
    render(<MapEmbed provider="google" query="Bengaluru" title="Our office" />)
    expect(screen.queryByTitle('Our office')).toBeNull()
    expect(screen.getByRole('button', { name: 'Load map' })).toBeInTheDocument()
  })

  it('loads Google once consent is given', () => {
    render(<MapEmbed provider="google" query="Bengaluru" title="Our office" />)
    fireEvent.click(screen.getByRole('button', { name: 'Load map' }))
    expect(screen.getByTitle('Our office').getAttribute('src')).toContain('maps.google.com')
  })

  it('can skip the gate when a consent banner already handled it', () => {
    render(
      <MapEmbed provider="google" query="Bengaluru" requireConsent={false} title="Our office" />,
    )
    expect(screen.getByTitle('Our office')).toBeInTheDocument()
  })

  it('offers a real link out while the map is gated', () => {
    // Someone who never consents still needs to find the place.
    render(<MapEmbed provider="google" query="Bengaluru" title="Our office" />)
    const link = screen.getByRole('link', { name: /open in a new tab/i })
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('lazy-loads and sandboxes the frame', () => {
    render(<MapEmbed query="Bengaluru" title="Our office" />)
    const frame = screen.getByTitle('Our office')
    expect(frame).toHaveAttribute('loading', 'lazy')
    // No allow-same-origin: the map has no business reading this origin's cookies.
    expect(frame.getAttribute('sandbox')).not.toContain('allow-same-origin')
  })

  it('builds a bounding box from coordinates', () => {
    render(<MapEmbed lat={12.97} lon={77.59} title="Office" />)
    const src = screen.getByTitle('Office').getAttribute('src') ?? ''
    expect(src).toContain('bbox=')
    expect(src).toContain('marker=12.97,77.59')
  })

  it('escapes the query, so a place name cannot break the URL', () => {
    render(<MapEmbed query="Café & Bar, Paris" title="Venue" />)
    const src = screen.getByTitle('Venue').getAttribute('src') ?? ''
    expect(src).not.toContain('& Bar')
    expect(src).toContain('%26')
  })

  it('has no axe violations while gated', async () => {
    /*
     * Only the gated state is checked here. Running axe over the loaded state throws
     * "Respondable target must be a frame in the current window" - axe-core tries to reach
     * into the iframe to audit its contents, and jsdom has no real frame for it to enter.
     * That is a limitation of the test environment, not a finding: the frame's own
     * accessibility obligation is a title, which `renders a titled iframe` covers directly,
     * and the page inside it belongs to OpenStreetMap or Google.
     */
    const { container } = render(
      <MapEmbed provider="google" query="Bengaluru" title="Our Bengaluru office" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders a titled iframe once loaded, which is the frame a11y requirement', () => {
    render(<MapEmbed provider="google" query="Bengaluru" title="Our Bengaluru office" />)
    fireEvent.click(screen.getByRole('button', { name: 'Load map' }))
    // An untitled iframe is announced as just "frame", and a page with several is
    // unnavigable - which is why `title` is required at the type level.
    expect(screen.getByTitle('Our Bengaluru office').tagName).toBe('IFRAME')
  })
})
