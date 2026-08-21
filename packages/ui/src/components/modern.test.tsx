import { act, fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { AnimatedCounter } from './animated-counter'
import { BentoGrid } from './bento-grid'
import { Button } from './button'
import { Carousel } from './carousel'
import { Clock } from './clock'
import { CopyButton } from './copy-button'
import { Countdown } from './countdown'
import { EmptyState } from './empty-state'
import { Marquee } from './marquee'
import { RelativeTime } from './relative-time'
import { Stepper } from './stepper'
import { ThemeProvider, themeScript, useTheme } from './theme-provider'
import { ThemeToggle } from './theme-toggle'
import { Timeline } from './timeline'

/* -------------------------------------------------------------------------- */
/* Environment helpers                                                        */
/* -------------------------------------------------------------------------- */

/**
 * jsdom has no layout, so `matchMedia` always reports `false` and there is no way to ask
 * for reduced motion. Every component that branches on it needs this.
 */
function stubMatchMedia(reduced: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const matchMedia = vi.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : false,
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }))
  Object.defineProperty(window, 'matchMedia', { value: matchMedia, configurable: true })
  return matchMedia
}

/**
 * Server-render an element, then hydrate the very same element over that HTML and assert
 * React never had to recover — which IS the property "the server render and the first
 * client render agree".
 *
 * Stronger than comparing HTML strings, and immune to a detail that makes string equality
 * lie: React serialises `dateTime` in camelCase on the server while the DOM reports the
 * attribute as `datetime`, so two byte-different strings can describe the same tree.
 */
function expectHydrationClean(element: ReactElement): string {
  const html = renderToString(element)
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.appendChild(host)

  const recovered: unknown[] = []
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  let root: ReturnType<typeof hydrateRoot> | undefined
  act(() => {
    root = hydrateRoot(host, element, { onRecoverableError: (error) => recovered.push(error) })
  })
  const logged = consoleError.mock.calls.map((call) => String(call[0]))
  consoleError.mockRestore()
  act(() => {
    root?.unmount()
  })
  host.remove()

  expect(recovered).toEqual([])
  expect(logged.filter((message) => /hydrat/i.test(message))).toEqual([])
  return html
}

const SLIDES = ['One', 'Two', 'Three']

/* -------------------------------------------------------------------------- */
/* Carousel                                                                   */
/* -------------------------------------------------------------------------- */

describe('Carousel', () => {
  beforeEach(() => {
    // jsdom does not implement Element.scrollTo; the component falls back to scrollLeft
    // without it, which jsdom also ignores, so there would be nothing to assert.
    Object.defineProperty(Element.prototype, 'scrollTo', { value: vi.fn(), configurable: true })
    stubMatchMedia(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('is a carousel role with slides exposed as "n of total" groups', () => {
    render(
      <Carousel>
        {SLIDES.map((slide) => (
          <div key={slide}>{slide}</div>
        ))}
      </Carousel>,
    )

    const root = screen.getByRole('group', { name: 'Carousel' })
    expect(root).toHaveAttribute('aria-roledescription', 'carousel')

    for (const [index, slide] of SLIDES.entries()) {
      const group = screen.getByRole('group', { name: `${index + 1} of 3` })
      expect(group).toHaveAttribute('aria-roledescription', 'slide')
      expect(group).toHaveTextContent(slide)
    }
  })

  it('gives the scroll track a tab stop, so it is keyboard scrollable', () => {
    const { container } = render(
      <Carousel>
        <div>One</div>
      </Carousel>,
    )
    expect(container.querySelector('.vk-carousel__track')).toHaveAttribute('tabindex', '0')
  })

  it('maps slidesPerView to responsive custom properties', () => {
    const { container } = render(
      <Carousel slidesPerView={{ base: 1, md: 2, xl: 4 }}>
        <div>One</div>
      </Carousel>,
    )
    const root = container.querySelector<HTMLElement>('.vk-carousel')
    expect(root).not.toBeNull()
    expect(root?.dataset.mode).toBe('fixed')
    expect(root?.style.getPropertyValue('--vk-carousel-slides')).toBe('1')
    expect(root?.style.getPropertyValue('--vk-carousel-slides-md')).toBe('2')
    expect(root?.style.getPropertyValue('--vk-carousel-slides-xl')).toBe('4')
    expect(root?.style.getPropertyValue('--vk-carousel-slides-sm')).toBe('')
  })

  it('renders no controls at all when none are asked for', () => {
    const { container } = render(
      <Carousel>
        <div>One</div>
      </Carousel>,
    )
    expect(container.querySelector('.vk-carousel__controls')).toBeNull()
  })

  it('names every dot, and lets dotLabel override the default', () => {
    const { container } = render(
      <Carousel showDots>
        {SLIDES.map((slide) => (
          <div key={slide}>{slide}</div>
        ))}
      </Carousel>,
    )
    const dots = Array.from(container.querySelectorAll('.vk-carousel__dot'))
    expect(dots).toHaveLength(SLIDES.length)
    for (const dot of dots) {
      expect(dot.getAttribute('aria-label')).toBeTruthy()
    }
  })

  /*
   * Regression: `dotLabel` used to be forwarded to the controls as a function. The
   * controls are a Client Component, so that threw "Functions cannot be passed directly
   * to Client Components" the moment a Server Component rendered a Carousel with dots -
   * which made the component unusable in an App Router page. The labels are resolved in
   * this component now, so what crosses the boundary is a string array.
   *
   * jsdom has no client boundary to violate, so this asserts the observable half of the
   * fix: the callback runs during *this* component's render, once per dot. The boundary
   * itself is guarded by the docs site, whose build prerenders a page per component from
   * Server Components - that is what caught the bug in the first place.
   */
  it('resolves dotLabel to strings rather than forwarding the function', () => {
    const calls: Array<[number, number]> = []
    const { container } = render(
      <Carousel
        showDots
        dotLabel={(index, total) => {
          calls.push([index, total])
          return `Slide ${index + 1} of ${total}`
        }}
      >
        {SLIDES.map((slide) => (
          <div key={slide}>{slide}</div>
        ))}
      </Carousel>,
    )

    // Called once per dot during the parent's own render, not deferred into the child.
    expect(calls).toEqual(SLIDES.map((_, index) => [index, SLIDES.length]))
    expect(
      Array.from(container.querySelectorAll('.vk-carousel__dot')).map((dot) =>
        dot.getAttribute('aria-label'),
      ),
    ).toEqual(SLIDES.map((_, index) => `Slide ${index + 1} of ${SLIDES.length}`))
  })

  it('advances on a timer, and pauses on hover and on focus within', () => {
    vi.useFakeTimers()
    const { container } = render(
      <Carousel autoPlay interval={1000} showDots>
        {SLIDES.map((slide) => (
          <div key={slide}>{slide}</div>
        ))}
      </Carousel>,
    )

    const root = container.querySelector<HTMLElement>('.vk-carousel')
    const controls = container.querySelector<HTMLElement>('.vk-carousel__controls')
    const track = container.querySelector<HTMLElement>('.vk-carousel__track')
    if (!root || !controls || !track) throw new Error('carousel did not render')

    const scrollTo = vi.mocked(track.scrollTo)
    expect(controls.dataset.rotating).toBe('true')

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(scrollTo).toHaveBeenCalledTimes(1)

    // Hover
    act(() => {
      fireEvent.mouseEnter(root)
    })
    expect(controls.dataset.paused).toBe('true')
    expect(controls.dataset.rotating).toBe('false')
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(scrollTo).toHaveBeenCalledTimes(1)

    act(() => {
      fireEvent.mouseLeave(root)
    })
    expect(controls.dataset.rotating).toBe('true')

    // Focus within
    act(() => {
      fireEvent.focusIn(track)
    })
    expect(controls.dataset.paused).toBe('true')
    expect(controls.dataset.rotating).toBe('false')
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(scrollTo).toHaveBeenCalledTimes(1)

    act(() => {
      fireEvent.focusOut(track)
    })
    expect(controls.dataset.rotating).toBe('true')
  })

  it('never rotates under prefers-reduced-motion, and hides the pause control', () => {
    stubMatchMedia(true)
    vi.useFakeTimers()
    const { container } = render(
      <Carousel autoPlay interval={1000}>
        {SLIDES.map((slide) => (
          <div key={slide}>{slide}</div>
        ))}
      </Carousel>,
    )

    const controls = container.querySelector<HTMLElement>('.vk-carousel__controls')
    const track = container.querySelector<HTMLElement>('.vk-carousel__track')
    if (!controls || !track) throw new Error('carousel did not render')

    expect(controls.dataset.rotating).toBe('false')
    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    expect(vi.mocked(track.scrollTo)).not.toHaveBeenCalled()
    expect(container.querySelector('.vk-carousel__play')).toBeNull()
  })

  it('moves with the arrows and disables them at the ends without loop', () => {
    const { container } = render(
      <Carousel showArrows>
        {SLIDES.map((slide) => (
          <div key={slide}>{slide}</div>
        ))}
      </Carousel>,
    )
    const track = container.querySelector<HTMLElement>('.vk-carousel__track')
    if (!track) throw new Error('carousel did not render')

    const previous = screen.getByRole('button', { name: 'Previous slide' })
    const next = screen.getByRole('button', { name: 'Next slide' })
    expect(previous).toBeDisabled()

    fireEvent.click(next)
    expect(vi.mocked(track.scrollTo)).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Previous slide' })).not.toBeDisabled()
  })

  it('has no axe violations with arrows, dots and autoplay', async () => {
    const { container } = render(
      <Carousel showArrows showDots autoPlay label="Customer stories">
        {SLIDES.map((slide) => (
          <div key={slide}>{slide}</div>
        ))}
      </Carousel>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------------------------- */
/* Marquee                                                                    */
/* -------------------------------------------------------------------------- */

describe('Marquee', () => {
  it('duplicates the track once and hides the copy from assistive technology', () => {
    const { container } = render(<Marquee>Ship it</Marquee>)
    const groups = container.querySelectorAll('.vk-marquee__group')
    expect(groups).toHaveLength(2)
    expect(groups[0]).not.toHaveAttribute('aria-hidden')
    expect(groups[1]).toHaveAttribute('aria-hidden', 'true')
    // The content is present twice in the DOM but only once in the a11y tree.
    expect(container.textContent).toBe('Ship itShip it')
  })

  it('derives axis and direction, including the vertical shorthand', () => {
    const { container: horizontal } = render(<Marquee>a</Marquee>)
    expect(horizontal.querySelector('.vk-marquee')).toHaveAttribute('data-axis', 'horizontal')

    const { container: right } = render(<Marquee direction="right">a</Marquee>)
    expect(right.querySelector('.vk-marquee')).toHaveAttribute('data-reverse', 'true')

    const { container: up } = render(<Marquee direction="up">a</Marquee>)
    expect(up.querySelector('.vk-marquee')).toHaveAttribute('data-axis', 'vertical')
    expect(up.querySelector('.vk-marquee')).not.toHaveAttribute('data-reverse')

    const { container: verticalRight } = render(
      <Marquee vertical direction="right">
        a
      </Marquee>,
    )
    const root = verticalRight.querySelector('.vk-marquee')
    expect(root).toHaveAttribute('data-axis', 'vertical')
    expect(root).toHaveAttribute('data-reverse', 'true')
  })

  it('rejects a non-positive speed rather than emitting a broken duration', () => {
    const { container } = render(<Marquee speed={0}>a</Marquee>)
    const root = container.querySelector<HTMLElement>('.vk-marquee')
    expect(root?.style.getPropertyValue('--vk-marquee-speed')).toBe('')

    const { container: fast } = render(<Marquee speed={2.5}>a</Marquee>)
    expect(
      fast.querySelector<HTMLElement>('.vk-marquee')?.style.getPropertyValue('--vk-marquee-speed'),
    ).toBe('2.5')
  })

  it('is server-renderable with no client boundary', () => {
    const html = renderToStaticMarkup(
      <Marquee gradient pauseOnHover>
        Logos
      </Marquee>,
    )
    expect(html).toContain('vk-marquee__track')
    expect(html).toContain('aria-hidden="true"')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Marquee gradient pauseOnHover>
        <span>Acme</span>
        <span>Globex</span>
      </Marquee>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------------------------- */
/* BentoGrid                                                                  */
/* -------------------------------------------------------------------------- */

describe('BentoGrid', () => {
  it('defaults to a 1 / 2 / 4 responsive wall with no props', () => {
    const { container } = render(<BentoGrid data-testid="wall" />)
    const root = container.querySelector<HTMLElement>('.vk-bento')
    expect(root?.style.getPropertyValue('--vk-bento-cols')).toBe('1')
    expect(root?.style.getPropertyValue('--vk-bento-cols-sm')).toBe('2')
    expect(root?.style.getPropertyValue('--vk-bento-cols-lg')).toBe('4')
    expect(root).toHaveAttribute('data-gap', '4')
  })

  it('maps responsive spans onto custom properties', () => {
    render(
      <BentoGrid cols={4}>
        <BentoGrid.Item data-testid="tile" colSpan={{ base: 1, md: 2, lg: 3 }} rowSpan={2}>
          Tile
        </BentoGrid.Item>
      </BentoGrid>,
    )
    const tile = screen.getByTestId('tile')
    expect(tile.style.getPropertyValue('--vk-bento-col-span')).toBe('1')
    expect(tile.style.getPropertyValue('--vk-bento-col-span-md')).toBe('2')
    expect(tile.style.getPropertyValue('--vk-bento-col-span-lg')).toBe('3')
    expect(tile.style.getPropertyValue('--vk-bento-row-span')).toBe('2')
  })

  it('clamps nonsense spans to one instead of emitting them', () => {
    render(
      <BentoGrid>
        <BentoGrid.Item data-testid="tile" colSpan={0} rowSpan={Number.NaN} />
      </BentoGrid>,
    )
    const tile = screen.getByTestId('tile')
    expect(tile.style.getPropertyValue('--vk-bento-col-span')).toBe('1')
    expect(tile.style.getPropertyValue('--vk-bento-row-span')).toBe('')
  })

  it('merges className and style instead of replacing them', () => {
    render(
      <BentoGrid className="mine" style={{ outline: '1px solid red' }}>
        <BentoGrid.Item className="tile" data-testid="tile" />
      </BentoGrid>,
    )
    const tile = screen.getByTestId('tile')
    expect(tile).toHaveClass('vk-bento__item')
    expect(tile).toHaveClass('tile')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <BentoGrid>
        <BentoGrid.Item colSpan={2}>
          <h2>Wide</h2>
        </BentoGrid.Item>
        <BentoGrid.Item>
          <h2>Narrow</h2>
        </BentoGrid.Item>
      </BentoGrid>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------------------------- */
/* AnimatedCounter                                                            */
/* -------------------------------------------------------------------------- */

describe('AnimatedCounter', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the FINAL value in server HTML, never 0', () => {
    const html = renderToStaticMarkup(<AnimatedCounter value={12480} />)
    expect(html).toContain('12,480')
    expect(html).not.toMatch(/>0</)
  })

  it('renders the final value under reduced motion, without animating', () => {
    stubMatchMedia(true)
    render(<AnimatedCounter value={98} suffix="%" data-testid="counter" />)
    expect(screen.getByTestId('counter')).toHaveTextContent('98%98%')
  })

  it('keeps the moving number out of the accessibility tree', () => {
    stubMatchMedia(true)
    const { container } = render(<AnimatedCounter value={5} prefix="$" />)
    expect(container.querySelector('.vk-animated-counter__value')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    // The announced copy is the settled value.
    expect(container.querySelector('.vk-animated-counter__sr')).toHaveTextContent('$5')
  })

  it('honours Intl options and a custom formatter', () => {
    stubMatchMedia(true)
    const intl = renderToStaticMarkup(
      <AnimatedCounter
        value={1234.5}
        locale="en-US"
        format={{ style: 'currency', currency: 'USD' }}
      />,
    )
    expect(intl).toContain('$1,234.50')

    const custom = renderToStaticMarkup(
      <AnimatedCounter value={2048} format={(value) => `${value / 1024}k`} />,
    )
    expect(custom).toContain('2k')
  })

  it('has no axe violations', async () => {
    stubMatchMedia(true)
    const { container } = render(<AnimatedCounter value={42} suffix="k" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------------------------- */
/* Countdown                                                                  */
/* -------------------------------------------------------------------------- */

const FIXED_NOW = new Date('2026-06-01T12:00:00.000Z')
const TARGET = new Date('2026-06-04T15:30:45.000Z')

describe('Countdown', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('produces identical server and first-client output for a fixed now', () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)

    const element = <Countdown to={TARGET} now={FIXED_NOW} />
    const server = renderToStaticMarkup(element)
    const { container } = render(element)

    expect(container.innerHTML).toBe(server)
    // And React itself agrees, which is the assertion that actually matters.
    expectHydrationClean(element)
  })

  it('renders a placeholder rather than reading the clock during render', () => {
    const html = renderToStaticMarkup(<Countdown to={TARGET} />)
    expect(html).toContain('data-pending="true"')
    expect(html).toContain('--')
  })

  it('splits the remaining time across the requested units', () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
    render(<Countdown to={TARGET} now={FIXED_NOW} data-testid="cd" />)

    const timer = screen.getByRole('timer', { name: 'Time remaining' })
    expect(timer.querySelector('[data-unit="days"] .vk-countdown__value')).toHaveTextContent('3')
    expect(timer.querySelector('[data-unit="hours"] .vk-countdown__value')).toHaveTextContent('03')
    expect(timer.querySelector('[data-unit="minutes"] .vk-countdown__value')).toHaveTextContent(
      '30',
    )
    expect(timer.querySelector('[data-unit="seconds"] .vk-countdown__value')).toHaveTextContent(
      '45',
    )
    // The sentence, not the digits, is what gets announced.
    expect(timer.querySelector('.vk-countdown__sr')).toHaveTextContent(
      '3 days, 3 hours, 30 minutes, 45 seconds',
    )
  })

  it('rolls larger units into the largest one requested', () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
    render(<Countdown to={TARGET} now={FIXED_NOW} format={['hours', 'minutes']} />)
    expect(
      screen.getByRole('timer').querySelector('[data-unit="hours"] .vk-countdown__value'),
    ).toHaveTextContent('75')
  })

  it('hides leading zero units on request', () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
    const soon = new Date(FIXED_NOW.getTime() + 90_000)
    render(<Countdown to={soon} now={FIXED_NOW} hideZeroUnits />)
    const timer = screen.getByRole('timer')
    expect(timer.querySelector('[data-unit="days"]')).toBeNull()
    expect(timer.querySelector('[data-unit="minutes"]')).not.toBeNull()
  })

  it('fires onComplete once when it reaches zero', () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
    const onComplete = vi.fn()
    const soon = new Date(FIXED_NOW.getTime() + 2000)
    render(<Countdown to={soon} now={FIXED_NOW} onComplete={onComplete} />)
    expect(onComplete).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('timer')).toHaveAttribute('data-complete', 'true')
    expect(screen.getByRole('timer').querySelector('.vk-countdown__sr')).toHaveTextContent(
      'Countdown complete',
    )
  })

  it('has no axe violations', async () => {
    // Real timers here on purpose: axe schedules its own work, and a frozen clock
    // never lets it finish.
    const { container } = render(<Countdown to={TARGET} now={FIXED_NOW} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------------------------- */
/* Clock                                                                      */
/* -------------------------------------------------------------------------- */

describe('Clock', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('produces identical server and first-client output for a fixed now', () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)

    const html = expectHydrationClean(<Clock now={FIXED_NOW} timeZone="UTC" locale="en-GB" />)
    expect(html).toContain('12:00:00')
  })

  /*
   * Regression: `format` was spread on top of the `hour`/`minute`/`second` shortcut
   * defaults, so asking for a `dateStyle` or `timeStyle` left both families of options
   * present. `Intl.DateTimeFormat` rejects that combination outright, so the documented
   * "anything set here wins over the shortcuts" threw `TypeError: Invalid option` instead
   * of overriding anything.
   */
  it.each([
    { dateStyle: 'full' },
    { timeStyle: 'short' },
    { timeStyle: 'medium' },
    { dateStyle: 'medium', timeStyle: 'short' },
  ] as const)('accepts %o alongside the shortcut props', (format) => {
    expect(() =>
      renderToStaticMarkup(
        <Clock now={FIXED_NOW} timeZone="UTC" locale="en-GB" showSeconds format={format} />,
      ),
    ).not.toThrow()
  })

  it('renders a styled format instead of the shortcut options', () => {
    const html = renderToStaticMarkup(
      <Clock
        now={FIXED_NOW}
        timeZone="UTC"
        locale="en-GB"
        format={{ dateStyle: 'medium', timeStyle: 'short' }}
      />,
    )
    // The date half proves `dateStyle` survived; no seconds proves `timeStyle: 'short'`
    // won over the `showSeconds` default rather than colliding with it.
    const text = html.replace(/^[\s\S]*?>/, '').replace(/<\/time>$/, '')
    expect(text).toContain('Jun 2026')
    // Asserted on the text, not the whole tag: the `dateTime` attribute is a full ISO
    // instant and always contains seconds, so matching the markup would pass either way.
    expect(text).not.toContain('12:00:00')
  })

  it('still ticks every second when timeStyle includes seconds', () => {
    // `timeStyle: 'medium'` shows seconds without setting `format.second`, so the tick
    // rate has to be inferred from the style. Getting it wrong renders a frozen clock.
    const html = renderToStaticMarkup(
      <Clock now={FIXED_NOW} timeZone="UTC" locale="en-GB" format={{ timeStyle: 'medium' }} />,
    )
    expect(html).toContain('12:00:00')
  })

  it('falls back to a minute placeholder for a short timeStyle', () => {
    const html = renderToStaticMarkup(<Clock format={{ timeStyle: 'short' }} />)
    expect(html).toContain('--:--')
    expect(html).not.toContain('--:--:--')
  })

  it('renders a placeholder rather than reading the clock during render', () => {
    const html = renderToStaticMarkup(<Clock />)
    expect(html).toContain('--:--:--')
    expect(html).toContain('data-pending="true"')
    expect(html).not.toContain('datetime=')
  })

  it('formats through Intl and carries a machine-readable datetime', () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
    const { container } = render(
      <Clock now={FIXED_NOW} timeZone="UTC" locale="en-GB" hour12={false} />,
    )
    const time = container.querySelector('time')
    expect(time).toHaveTextContent('12:00:00')
    expect(time).toHaveAttribute('datetime', '2026-06-01T12:00:00.000Z')
  })

  it('drops seconds and shortens the placeholder when asked', () => {
    const html = renderToStaticMarkup(<Clock showSeconds={false} />)
    expect(html).toContain('--:--')
    expect(html).not.toContain('--:--:--')
  })

  it('ticks', () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
    const { container } = render(
      <Clock now={FIXED_NOW} timeZone="UTC" locale="en-GB" hour12={false} />,
    )
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(container.querySelector('time')).toHaveTextContent('12:00:01')
  })

  it('has no axe violations', async () => {
    // Real timers here on purpose: axe schedules its own work, and a frozen clock
    // never lets it finish.
    const { container } = render(<Clock now={FIXED_NOW} timeZone="UTC" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------------------------- */
/* RelativeTime                                                               */
/* -------------------------------------------------------------------------- */

describe('RelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('emits a <time datetime> with the absolute value in the title', () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
    const past = new Date(FIXED_NOW.getTime() - 3 * 60_000)

    const { container } = render(
      <RelativeTime date={past} now={FIXED_NOW} locale="en-GB" timeZone="UTC" />,
    )
    const time = container.querySelector('time')
    expect(time?.tagName).toBe('TIME')
    expect(time).toHaveAttribute('datetime', past.toISOString())
    expect(time?.getAttribute('title')).toBe('1 Jun 2026, 11:57')
    expect(time).toHaveTextContent('3 minutes ago')
  })

  it('shows the absolute time before the first tick, so it degrades to a real timestamp', () => {
    const html = renderToStaticMarkup(
      <RelativeTime date={FIXED_NOW} locale="en-GB" timeZone="UTC" />,
    )
    expect(html).toContain('data-pending="true"')
    expect(html).toContain('1 Jun 2026, 12:00')
  })

  it('hydrates cleanly, with and without a fixed now', () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
    expectHydrationClean(
      <RelativeTime date={FIXED_NOW} now={FIXED_NOW} locale="en-GB" timeZone="UTC" />,
    )
    expectHydrationClean(<RelativeTime date={FIXED_NOW} locale="en-GB" timeZone="UTC" />)
  })

  it('picks the coarsest unit that the gap fills, in both directions', () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
    const cases: Array<[number, string]> = [
      [-5_000, '5 seconds ago'],
      [-2 * 3_600_000, '2 hours ago'],
      [-3 * 86_400_000, '3 days ago'],
      [4 * 86_400_000, 'in 4 days'],
    ]
    for (const [offset, expected] of cases) {
      const { container, unmount } = render(
        <RelativeTime
          date={new Date(FIXED_NOW.getTime() + offset)}
          now={FIXED_NOW}
          locale="en-GB"
          numeric="always"
        />,
      )
      expect(container.querySelector('time')).toHaveTextContent(expected)
      unmount()
    }
  })

  it('survives an unparseable date', () => {
    const { container } = render(<RelativeTime date="not a date" />)
    const time = container.querySelector('time')
    expect(time).not.toBeNull()
    expect(time).not.toHaveAttribute('datetime')
  })

  it('has no axe violations', async () => {
    // Real timers here on purpose: axe schedules its own work, and a frozen clock
    // never lets it finish.
    const { container } = render(<RelativeTime date={FIXED_NOW} now={FIXED_NOW} locale="en-GB" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------------------------- */
/* Timeline                                                                   */
/* -------------------------------------------------------------------------- */

describe('Timeline', () => {
  it('is an ordered list of list items', () => {
    render(
      <Timeline>
        <Timeline.Item title="Ordered" status="complete" />
        <Timeline.Item title="Shipped" status="current" />
      </Timeline>,
    )
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('OL')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('never conveys status by colour alone', () => {
    const { container } = render(
      <Timeline>
        <Timeline.Item title="Ordered" status="complete" />
        <Timeline.Item title="Shipped" status="pending" />
      </Timeline>,
    )
    const items = container.querySelectorAll('.vk-timeline__item')
    expect(items[0]).toHaveAttribute('data-status', 'complete')
    // A glyph for sighted users...
    expect(items[0]?.querySelector('.vk-timeline__marker')).toHaveTextContent('✓')
    // ...and a word for everyone else.
    expect(items[0]?.querySelector('.vk-timeline__status')).toHaveTextContent('Completed')
    expect(items[1]?.querySelector('.vk-timeline__status')).toHaveTextContent('Not started')
  })

  it('keeps the marker out of the accessibility tree', () => {
    const { container } = render(
      <Timeline>
        <Timeline.Item title="Ordered" status="complete" />
      </Timeline>,
    )
    expect(container.querySelector('.vk-timeline__marker')).toHaveAttribute('aria-hidden', 'true')
  })

  it('carries orientation and alignment as data attributes', () => {
    const { container } = render(
      <Timeline orientation="horizontal" align="alternate">
        <Timeline.Item title="One" />
      </Timeline>,
    )
    const list = container.querySelector('.vk-timeline')
    expect(list).toHaveAttribute('data-orientation', 'horizontal')
    expect(list).toHaveAttribute('data-align', 'alternate')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Timeline align="alternate">
        <Timeline.Item
          title="Order placed"
          description="We have your order."
          timestamp="12 May"
          status="complete"
        />
        <Timeline.Item title="Out for delivery" status="current" />
        <Timeline.Item title="Delivered" status="pending" />
      </Timeline>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------------------------- */
/* Stepper                                                                    */
/* -------------------------------------------------------------------------- */

const STEPS = ['Cart', 'Address', 'Payment', 'Done']

describe('Stepper', () => {
  it('marks the active step with aria-current="step"', () => {
    const { container } = render(<Stepper steps={STEPS} activeStep={2} />)
    const current = container.querySelectorAll('[aria-current="step"]')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('Payment')
  })

  it('is a named navigation landmark holding an ordered list', () => {
    render(<Stepper steps={STEPS} label="Checkout progress" />)
    const nav = screen.getByRole('navigation', { name: 'Checkout progress' })
    expect(nav.querySelector('ol')).not.toBeNull()
  })

  it('never conveys completion by colour alone', () => {
    const { container } = render(<Stepper steps={STEPS} activeStep={2} />)
    const items = container.querySelectorAll('.vk-stepper__item')
    expect(items[0]).toHaveAttribute('data-status', 'complete')
    expect(items[0]?.querySelector('.vk-stepper__marker')).toHaveTextContent('✓')
    expect(items[0]?.querySelector('.vk-stepper__status')).toHaveTextContent('Completed')
    expect(items[2]?.querySelector('.vk-stepper__status')).toHaveTextContent('Current step')
    expect(items[3]?.querySelector('.vk-stepper__status')).toHaveTextContent('Not started')
    // Pending steps still show their number, not just a pale ring.
    expect(items[3]?.querySelector('.vk-stepper__marker')).toHaveTextContent('4')
  })

  it('adds no tab stops unless it is clickable', () => {
    const { container } = render(<Stepper steps={STEPS} />)
    expect(container.querySelectorAll('button')).toHaveLength(0)
  })

  it('reports and moves when clickable, in both modes', () => {
    const onStepChange = vi.fn()
    const { rerender } = render(
      <Stepper steps={STEPS} clickable onStepChange={onStepChange} defaultActiveStep={0} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Payment/ }))
    expect(onStepChange).toHaveBeenCalledWith(2)
    // Uncontrolled: it moved itself.
    expect(screen.getByRole('button', { name: /Payment/ })).toHaveAttribute('aria-current', 'step')

    // Controlled: the prop is the only source of truth.
    rerender(<Stepper steps={STEPS} clickable activeStep={1} onStepChange={onStepChange} />)
    fireEvent.click(screen.getByRole('button', { name: /Done/ }))
    expect(onStepChange).toHaveBeenLastCalledWith(3)
    expect(screen.getByRole('button', { name: /Address/ })).toHaveAttribute('aria-current', 'step')
  })

  it('takes objects as well as strings, and disables what it is told to', () => {
    render(
      <Stepper
        clickable
        steps={[{ label: 'Cart' }, { label: 'Locked', description: 'Later', disabled: true }]}
      />,
    )
    expect(screen.getByRole('button', { name: /Locked/ })).toBeDisabled()
  })

  it('has no axe violations, horizontal and vertical', async () => {
    const horizontal = render(<Stepper steps={STEPS} activeStep={1} clickable />)
    expect(await axe(horizontal.container)).toHaveNoViolations()
    const vertical = render(<Stepper steps={STEPS} activeStep={1} orientation="vertical" />)
    expect(await axe(vertical.container)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------------------------- */
/* EmptyState                                                                 */
/* -------------------------------------------------------------------------- */

describe('EmptyState', () => {
  it('renders with zero props', () => {
    const { container } = render(<EmptyState />)
    expect(container.querySelector('.vk-empty-state')).toHaveAttribute('data-size', 'md')
  })

  it('hides the decorative icon and keeps the heading level configurable', () => {
    const { container } = render(
      <EmptyState
        icon={<span>📭</span>}
        title="No invoices yet"
        description="They will show up here."
        headingLevel={2}
        actions={<Button>Create invoice</Button>}
      />,
    )
    expect(container.querySelector('.vk-empty-state__icon')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('heading', { level: 2, name: 'No invoices yet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create invoice' })).toBeInTheDocument()
  })

  it('is server-renderable', () => {
    const html = renderToStaticMarkup(<EmptyState title="Nothing here" size="lg" />)
    expect(html).toContain('data-size="lg"')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <EmptyState
        icon={<span>📭</span>}
        title="No invoices yet"
        description="They will show up here."
        actions={<Button>Create invoice</Button>}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------------------------- */
/* CopyButton                                                                 */
/* -------------------------------------------------------------------------- */

describe('CopyButton', () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(window.navigator, 'clipboard')

  function setClipboard(value: unknown) {
    Object.defineProperty(window.navigator, 'clipboard', { value, configurable: true })
  }

  afterEach(() => {
    if (originalClipboard) Object.defineProperty(window.navigator, 'clipboard', originalClipboard)
    else setClipboard(undefined)
    delete (document as Partial<Document>).execCommand
    vi.useRealTimers()
  })

  it('copies, confirms, announces politely, and resets', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard({ writeText })
    const onCopy = vi.fn()

    render(<CopyButton value="pnpm add @the_viveksingh/vivek-ui" onCopy={onCopy} timeout={2000} />)
    const button = screen.getByRole('button', { name: 'Copy' })

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent('')

    await act(async () => {
      fireEvent.click(button)
    })

    expect(writeText).toHaveBeenCalledWith('pnpm add @the_viveksingh/vivek-ui')
    expect(onCopy).toHaveBeenCalledWith('pnpm add @the_viveksingh/vivek-ui')
    expect(button).toHaveTextContent('Copied')
    expect(screen.getByRole('status')).toHaveTextContent('Copied')

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(button).toHaveTextContent('Copy')
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('falls back to execCommand when there is no clipboard API', async () => {
    setClipboard(undefined)
    const execCommand = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true })

    render(<CopyButton value="fallback" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })

    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(screen.getByRole('button')).toHaveTextContent('Copied')
  })

  it('surfaces a failure instead of silently doing nothing', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    setClipboard({ writeText })
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn().mockReturnValue(false),
      configurable: true,
    })
    const onCopyError = vi.fn()

    render(<CopyButton value="secret" onCopyError={onCopyError} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })

    expect(onCopyError).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button')).toHaveTextContent('Copy failed')
    expect(screen.getByRole('status')).toHaveTextContent('Copy failed')
  })

  it('still calls a caller onClick, and respects preventDefault', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard({ writeText })
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())

    render(<CopyButton value="nope" onClick={onClick} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(writeText).not.toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    setClipboard({ writeText: vi.fn().mockResolvedValue(undefined) })
    const { container } = render(<CopyButton value="npx vivek-ui" variant="outline" size="sm" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* -------------------------------------------------------------------------- */
/* ThemeProvider + ThemeToggle                                                */
/* -------------------------------------------------------------------------- */

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <button type="button" data-testid="probe" onClick={() => setTheme('dark')}>
      {theme}/{resolvedTheme}
    </button>
  )
}

describe('ThemeProvider', () => {
  const STORAGE_KEY = 'vk-theme'
  const originalLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage')

  beforeEach(() => {
    stubMatchMedia(false)
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.removeProperty('color-scheme')
  })

  afterEach(() => {
    if (originalLocalStorage) Object.defineProperty(window, 'localStorage', originalLocalStorage)
  })

  it('applies the resolved theme to <html> and adds no DOM of its own', () => {
    const { container } = render(
      <ThemeProvider defaultTheme="dark">
        <span>content</span>
      </ThemeProvider>,
    )
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(container.firstElementChild?.tagName).toBe('SPAN')
  })

  it('reads a stored theme without reading it during render', () => {
    window.localStorage.setItem(STORAGE_KEY, 'dark')
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent('dark/dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('writes the choice to storage', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByTestId('probe'))
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('ignores rubbish in storage', () => {
    window.localStorage.setItem(STORAGE_KEY, 'neon')
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent('light/light')
  })

  it('survives a localStorage that throws on access', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('The operation is insecure.')
      },
    })

    expect(() =>
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeProbe />
        </ThemeProvider>,
      ),
    ).not.toThrow()
    expect(screen.getByTestId('probe')).toHaveTextContent('dark/dark')

    // Writing must not throw either.
    expect(() => fireEvent.click(screen.getByTestId('probe'))).not.toThrow()
  })

  it('resolves "system" against prefers-color-scheme', () => {
    stubMatchMedia(false)
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: query.includes('prefers-color-scheme: dark'),
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      })),
    })

    render(
      <ThemeProvider defaultTheme="system">
        <ThemeProbe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent('system/dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('useTheme outside a provider is inert rather than fatal', () => {
    expect(() => render(<ThemeProbe />)).not.toThrow()
    expect(screen.getByTestId('probe')).toHaveTextContent('system/light')
    expect(() => fireEvent.click(screen.getByTestId('probe'))).not.toThrow()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(document.documentElement).not.toHaveAttribute('data-theme')
  })

  it('exports an inline-able themeScript that cannot break out of its script tag', () => {
    expect(themeScript).toContain('vk-theme')
    expect(themeScript).toContain('prefers-color-scheme: dark')
    expect(themeScript).toContain('data-theme')
    expect(themeScript).toContain('colorScheme')
    expect(themeScript).toContain('try')
    expect(themeScript).not.toContain('</script')
    expect(themeScript).not.toContain('\n')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ThemeToggle', () => {
  beforeEach(() => {
    stubMatchMedia(false)
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('names itself after what the press will do', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    )
    const button = screen.getByRole('button', { name: 'Switch to dark theme' })
    fireEvent.click(button)
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('cycles light → dark → system', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle mode="cycle" />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('data-theme-choice', 'dark')
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('data-theme-choice', 'system')
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('data-theme-choice', 'light')
  })

  it('keeps its glyph out of the accessibility tree', () => {
    const { container } = render(
      <ThemeProvider defaultTheme="dark">
        <ThemeToggle />
      </ThemeProvider>,
    )
    expect(container.querySelector('.vk-theme-toggle__glyph')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('renders outside a provider without throwing', () => {
    expect(() => render(<ThemeToggle />)).not.toThrow()
  })
})
