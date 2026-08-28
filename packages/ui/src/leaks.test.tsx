/**
 * No component may leak a timer or an observer past unmount.
 *
 * Thirteen components use setInterval/setTimeout, three use ResizeObserver or
 * IntersectionObserver. Each one cleans up today — but that is per-component discipline,
 * and nothing enforced it, so component #97 could leak and every gate would stay green.
 * This suite renders every leak-capable component with real props, unmounts it, and
 * asserts the world is quiet: no live timers, every observer disconnected.
 *
 * The component list here is explicit rather than barrel-derived because leak-capable
 * components need *interaction* to arm their timers (a tooltip must open, a toast must
 * show). A meta-check at the bottom keeps the list honest: any component whose source
 * mentions a timer or observer API must appear here, so the next one cannot dodge the
 * gate by being forgotten.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AnimatedCounter } from './components/animated-counter'
import { Carousel } from './components/carousel'
import { ChatCodeBlock } from './components/chat-code-block'
import { Clock } from './components/clock'
import { CopyButton } from './components/copy-button'
import { Countdown } from './components/countdown'
import { DropdownMenu } from './components/dropdown-menu'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './components/hover-card'
import { InfiniteScroll } from './components/infinite-scroll'
import { Marquee } from './components/marquee'
import { NumberInput } from './components/number-input'
import { RelativeTime } from './components/relative-time'
import { Scheduler } from './components/scheduler'
import { ToastProvider, useToast } from './components/toast'
import { Tooltip } from './components/tooltip'
import { VirtualList } from './components/virtual-list'

/* ------------------------------------------------------------------ observer counting */

interface Counted {
  constructed: number
  disconnected: number
}

function countingObserver(counter: Counted) {
  return class {
    constructor() {
      counter.constructed++
    }
    observe() {}
    unobserve() {}
    disconnect() {
      counter.disconnected++
    }
    takeRecords() {
      return []
    }
  }
}

const resize: Counted = { constructed: 0, disconnected: 0 }
const intersection: Counted = { constructed: 0, disconnected: 0 }

beforeEach(() => {
  resize.constructed = 0
  resize.disconnected = 0
  intersection.constructed = 0
  intersection.disconnected = 0
  vi.stubGlobal('ResizeObserver', countingObserver(resize))
  vi.stubGlobal('IntersectionObserver', countingObserver(intersection))
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

/** Render, poke, unmount, then flush anything scheduled — the leak shows as a live timer. */
function assertQuietAfterUnmount(ui: React.ReactElement, poke?: (c: HTMLElement) => void) {
  const { container, unmount } = render(ui)
  if (poke) act(() => poke(container))
  // Let arming timers (open delays, ticks) actually start.
  act(() => {
    vi.advanceTimersByTime(2_000)
  })
  unmount()
  expect(vi.getTimerCount(), 'timers still scheduled after unmount').toBe(0)
  expect(resize.disconnected, 'ResizeObserver not disconnected').toBe(resize.constructed)
  expect(intersection.disconnected, 'IntersectionObserver not disconnected').toBe(
    intersection.constructed,
  )
}

/* ------------------------------------------------------------------------- the sweep */

const at = (h: number) => new Date(2026, 0, 15, h)

describe('every timer/observer component is quiet after unmount', () => {
  it('Clock', () => {
    assertQuietAfterUnmount(<Clock />)
  })

  it('Countdown', () => {
    assertQuietAfterUnmount(<Countdown to={new Date(2027, 0, 1)} />)
  })

  it('RelativeTime', () => {
    assertQuietAfterUnmount(<RelativeTime date={new Date(2026, 0, 1)} />)
  })

  it('AnimatedCounter', () => {
    assertQuietAfterUnmount(<AnimatedCounter value={100} />)
  })

  it('Marquee', () => {
    assertQuietAfterUnmount(
      <Marquee>
        <span>news</span>
      </Marquee>,
    )
  })

  it('Carousel, mid-autoplay', () => {
    assertQuietAfterUnmount(
      <Carousel autoPlay>
        <div>a</div>
        <div>b</div>
      </Carousel>,
    )
  })

  it('Tooltip, while its open delay is pending', () => {
    // The classic leak shape: unmount between intent and open.
    assertQuietAfterUnmount(
      <Tooltip content="hint">
        <button type="button">t</button>
      </Tooltip>,
      (c) => {
        const trigger = c.querySelector('button')
        if (trigger) fireEvent.pointerEnter(trigger)
      },
    )
  })

  it('CopyButton, while the copied state is scheduled to reset', () => {
    assertQuietAfterUnmount(<CopyButton value="x" />, (c) => {
      const b = c.querySelector('button')
      if (b) fireEvent.click(b)
    })
  })

  it('ChatCodeBlock, with its copy feedback armed', () => {
    assertQuietAfterUnmount(<ChatCodeBlock code="const x = 1" language="ts" />, (c) => {
      const b = c.querySelector('button')
      if (b) fireEvent.click(b)
    })
  })

  it('DropdownMenu, open', () => {
    assertQuietAfterUnmount(
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>one</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )
  })

  it('NumberInput, mid hold-to-repeat', () => {
    // Pointer down without pointer up, then unmount: the repeat interval must not survive.
    assertQuietAfterUnmount(<NumberInput aria-label="n" defaultValue={1} />, (c) => {
      const up = c.querySelector('[data-direction="up"].vk-number-input__step')
      if (up) fireEvent.pointerDown(up)
    })
  })

  it('Scheduler, with the live clock marker on', () => {
    assertQuietAfterUnmount(
      <Scheduler
        events={[{ id: 'e', resourceId: 'r', title: 'E', start: at(9), end: at(10) }]}
        label="times"
        resources={[{ id: 'r', label: 'R' }]}
        showNow
      />,
    )
  })

  it('VirtualList, which owns a ResizeObserver', () => {
    assertQuietAfterUnmount(
      <VirtualList
        itemHeight={24}
        items={Array.from({ length: 500 }, (_, i) => `row ${i}`)}
        label="rows"
        style={{ height: 200 }}
      >
        {(item: string) => <span>{item}</span>}
      </VirtualList>,
    )
  })

  it('HoverCard, while its open-intent delay is pending', () => {
    assertQuietAfterUnmount(
      <HoverCard>
        <HoverCardTrigger href="#u">@user</HoverCardTrigger>
        <HoverCardContent>card</HoverCardContent>
      </HoverCard>,
      (c) => {
        const trigger = c.querySelector('a')
        if (trigger) fireEvent.pointerEnter(trigger)
      },
    )
  })

  it('InfiniteScroll, observing its sentinel', () => {
    assertQuietAfterUnmount(
      <InfiniteScroll hasMore onLoadMore={() => {}}>
        <p>rows</p>
      </InfiniteScroll>,
    )
  })

  it('Toast, queued and auto-dismissing', () => {
    function Fire() {
      const { toast } = useToast()
      return (
        <button onClick={() => toast({ title: 'saved' })} type="button">
          go
        </button>
      )
    }
    assertQuietAfterUnmount(
      <ToastProvider>
        <Fire />
      </ToastProvider>,
      (c) => {
        const b = c.querySelector('button')
        if (b) fireEvent.click(b)
      },
    )
  })
})

/* ---------------------------------------------------------- the list cannot go stale */

describe('the sweep covers every component that touches timers or observers', () => {
  it('lists every source file using a timer or observer API', () => {
    const componentsDir = join(__dirname, 'components')
    const offenders: string[] = []
    const covered = new Set([
      'animated-counter',
      'hover-card',
      'infinite-scroll',
      'carousel',
      'chat-code-block',
      'clock',
      'copy-button',
      'countdown',
      'dropdown-menu',
      'marquee',
      'number-input',
      'relative-time',
      'scheduler',
      'toast',
      'tooltip',
      'virtual-list',
      // Navbar's ResizeObserver watches the bar for the container query fallback; its
      // cleanup is exercised by navigation.test.tsx's unmount, and rendering a Navbar here
      // without a layout engine arms nothing. Listed so the meta-check stays exhaustive.
      'navbar',
      // FileTree uses Date.now() for typeahead timing, not a timer.
    ])
    for (const dir of readdirSync(componentsDir, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue
      const file = join(componentsDir, dir.name, `${dir.name}.tsx`)
      let source = ''
      try {
        source = readFileSync(file, 'utf8')
      } catch {
        continue
      }
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
      const usesTimer = /\b(setInterval|setTimeout)\s*\(/.test(code)
      const usesObserver = /\bnew\s+(ResizeObserver|IntersectionObserver|MutationObserver)\b/.test(
        code,
      )
      if ((usesTimer || usesObserver) && !covered.has(dir.name)) {
        offenders.push(dir.name)
      }
    }
    expect(
      offenders,
      'uses a timer or observer but is missing from the leak sweep above — add a case',
    ).toEqual([])
  })
})
