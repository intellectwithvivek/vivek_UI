/**
 * Scheduler.
 *
 * A timeline says everything through position, and position is invisible to a screen reader,
 * so the accessible names and the keyboard model are the component — most of these test that.
 * The rest test the two things a scheduler gets wrong quietly: hiding an overlapping booking,
 * and reading the clock during render.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Scheduler, type SchedulerEvent, type SchedulerResource } from './scheduler'

const day = (hour: number, minute = 0) => new Date(2026, 0, 15, hour, minute)

const RESOURCES: SchedulerResource[] = [
  { id: 'a', label: 'Studio A', sublabel: 'Ground floor' },
  { id: 'b', label: 'Studio B' },
  { id: 'c', label: 'Studio C' },
]

const EVENTS: SchedulerEvent[] = [
  { id: 'e1', resourceId: 'a', title: 'Standup', start: day(9), end: day(9, 30) },
  { id: 'e2', resourceId: 'a', title: 'Design review', start: day(11), end: day(12, 30) },
  { id: 'e3', resourceId: 'b', title: 'Recording', start: day(10), end: day(13), tone: 'accent' },
]

const setup = (props: Partial<React.ComponentProps<typeof Scheduler>> = {}) =>
  render(
    <Scheduler
      end={day(14)}
      events={EVENTS}
      label="Studio bookings"
      resources={RESOURCES}
      start={day(9)}
      {...props}
    />,
  )

const slot = (id: string) => document.querySelector(`[data-event-id="${id}"]`) as HTMLElement
const left = (el: HTMLElement) => Number.parseFloat(el.style.insetInlineStart)
const width = (el: HTMLElement) => Number.parseFloat(el.style.inlineSize)

function press(target: HTMLElement, key: string) {
  target.focus()
  fireEvent.keyDown(target, { key })
}

describe('Scheduler · what a screen reader gets', () => {
  it('names the board and every resource track', () => {
    setup()
    expect(screen.getByRole('group', { name: 'Studio bookings' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Studio A' })).toBeInTheDocument()
  })

  it('puts the resource, the times and the duration in every booking name', () => {
    // Sighted users read all three off the position. Nothing else conveys them.
    setup()
    expect(
      screen.getByRole('button', {
        name: 'Design review. Studio A, 11:00 to 12:30, 1 hour 30 minutes.',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Standup\. Studio A, 09:00 to 09:30, 30 minutes\./ }),
    ).toBeInTheDocument()
  })

  it('hides the axis, which carries no information without the layout', () => {
    const { container } = setup()
    expect(container.querySelector('.vk-scheduler__axis')).toHaveAttribute('aria-hidden', 'true')
  })

  it('says a resource is free rather than rendering an empty row', () => {
    setup()
    expect(screen.getByText('Nothing scheduled')).toBeInTheDocument()
  })
})

describe('Scheduler · placement', () => {
  it('positions a booking by its time, as a fraction of the window', () => {
    // 09:00–14:00 window; 11:00–12:30 starts 40% in and runs for 30% of it.
    setup()
    expect(left(slot('e2'))).toBeCloseTo(40, 5)
    expect(width(slot('e2'))).toBeCloseTo(30, 5)
  })

  it('stacks overlapping bookings into lanes instead of hiding one', () => {
    const overlapping: SchedulerEvent[] = [
      { id: 'x', resourceId: 'a', title: 'First', start: day(9), end: day(11) },
      { id: 'y', resourceId: 'a', title: 'Second', start: day(10), end: day(12) },
      { id: 'z', resourceId: 'a', title: 'Third', start: day(12), end: day(13) },
    ]
    setup({ events: overlapping })
    expect(slot('x').style.getPropertyValue('--vk-scheduler-lane')).toBe('0')
    expect(slot('y').style.getPropertyValue('--vk-scheduler-lane')).toBe('1')
    // Third starts after First ends, so it reuses lane 0 rather than opening a third lane.
    expect(slot('z').style.getPropertyValue('--vk-scheduler-lane')).toBe('0')
    // Both overlapping bookings are still on the board.
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('touching bookings share a lane — an end is not an overlap', () => {
    setup({
      events: [
        { id: 'x', resourceId: 'a', title: 'First', start: day(9), end: day(10) },
        { id: 'y', resourceId: 'a', title: 'Second', start: day(10), end: day(11) },
      ],
    })
    expect(slot('y').style.getPropertyValue('--vk-scheduler-lane')).toBe('0')
  })

  it('clips a booking that runs past the window, and marks it as clipped', () => {
    setup({
      events: [{ id: 'x', resourceId: 'a', title: 'Overnight', start: day(8), end: day(20) }],
    })
    expect(left(slot('x'))).toBeCloseTo(0, 5)
    expect(width(slot('x'))).toBeCloseTo(100, 5)
    expect(slot('x')).toHaveAttribute('data-clipped')
    // The name still reports the real times, not the clipped ones.
    expect(slot('x')).toHaveAccessibleName(/08:00 to 20:00/)
  })

  it('leaves a booking entirely outside the window off the board', () => {
    // A zero-width sliver is unhittable by pointer but still reachable by keyboard, which is
    // worse than not drawing it.
    setup({
      events: [{ id: 'x', resourceId: 'a', title: 'Yesterday', start: day(2), end: day(4) }],
    })
    expect(slot('x')).toBeNull()
  })

  it('drops an event whose resource is not on the board', () => {
    setup({
      events: [{ id: 'ghost', resourceId: 'nowhere', title: 'Ghost', start: day(9), end: day(10) }],
    })
    expect(screen.queryByText('Ghost')).not.toBeInTheDocument()
  })

  it('drops a booking that ends before it starts', () => {
    setup({
      events: [{ id: 'x', resourceId: 'a', title: 'Backwards', start: day(11), end: day(9) }],
    })
    expect(screen.queryByText('Backwards')).not.toBeInTheDocument()
  })

  it('snaps a derived window to the local clock rather than to UTC', () => {
    // Snapping with `Math.floor(ms / hour)` snaps against the epoch, which is UTC, and puts
    // every tick at :30 in a half-hour timezone — India, Nepal, Newfoundland.
    render(
      <Scheduler
        events={[{ id: 'x', resourceId: 'a', title: 'X', start: day(9, 20), end: day(10, 40) }]}
        label="Snap"
        resources={RESOURCES}
      />,
    )
    const ticks = [...document.querySelectorAll('.vk-scheduler__tick')].map((el) => el.textContent)
    expect(ticks).toEqual(['09:00', '10:00'])
  })

  it('derives the window from the events when none is given', () => {
    render(<Scheduler events={EVENTS} label="Auto" resources={RESOURCES} />)
    // Earliest 09:00, latest 13:00, both already on the hour.
    expect(left(slot('e1'))).toBeCloseTo(0, 5)
    expect(width(slot('e3'))).toBeCloseTo(75, 5)
  })
})

describe('Scheduler · keyboard, the only way in without a pointer', () => {
  it('is a single tab stop', () => {
    setup()
    const tabbable = screen.getAllByRole('button').filter((el) => el.tabIndex === 0)
    expect(tabbable).toHaveLength(1)
  })

  it('Right and Left walk this resource in time order', () => {
    setup()
    press(slot('e1'), 'ArrowRight')
    expect(slot('e2')).toHaveFocus()
    press(slot('e2'), 'ArrowLeft')
    expect(slot('e1')).toHaveFocus()
  })

  it('stops at the ends of a row instead of wrapping into another resource', () => {
    setup()
    press(slot('e1'), 'ArrowLeft')
    expect(slot('e1')).toHaveFocus()
  })

  it('Down lands on the booking nearest in time on the next resource', () => {
    setup()
    press(slot('e2'), 'ArrowDown')
    expect(slot('e3')).toHaveFocus()
  })

  it('Down skips a resource with nothing on it', () => {
    // Studio C is empty and Studio B is not; stopping on C would look like a dead key.
    setup({
      events: [
        { id: 'top', resourceId: 'a', title: 'Top', start: day(9), end: day(10) },
        { id: 'bottom', resourceId: 'c', title: 'Bottom', start: day(9), end: day(10) },
      ],
      resources: [RESOURCES[0], RESOURCES[1], RESOURCES[2]] as SchedulerResource[],
    })
    press(slot('top'), 'ArrowDown')
    expect(slot('bottom')).toHaveFocus()
  })

  it('Home and End reach the ends of the resource', () => {
    setup()
    press(slot('e1'), 'End')
    expect(slot('e2')).toHaveFocus()
    press(slot('e2'), 'Home')
    expect(slot('e1')).toHaveFocus()
  })

  it('reports a selection, and does not mutate anything', () => {
    const onEventSelect = vi.fn()
    setup({ onEventSelect })
    fireEvent.click(slot('e2'))
    expect(onEventSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'e2' }))
    // Still exactly where it was: state is the caller's.
    expect(left(slot('e2'))).toBeCloseTo(40, 5)
  })
})

describe('Scheduler · the clock', () => {
  it('draws no marker by default, because rendering one would need the clock', () => {
    // A `Date.now()` in the render body gives the server one position and the client
    // another, which is a hydration mismatch.
    const { container } = setup()
    expect(container.querySelector('.vk-scheduler__now')).toBeNull()
  })

  it('draws the marker for an explicit now', () => {
    const { container } = setup({ now: day(11, 30) })
    expect(container.querySelector('.vk-scheduler__now')).toBeInTheDocument()
  })

  it('leaves the marker off when now is outside the window', () => {
    const { container } = setup({ now: day(20) })
    expect(container.querySelector('.vk-scheduler__now')).toBeNull()
  })

  it('reads the clock after mount when asked to', () => {
    vi.useFakeTimers()
    vi.setSystemTime(day(11))
    try {
      const { container } = render(
        <Scheduler
          end={day(14)}
          events={EVENTS}
          label="Live"
          resources={RESOURCES}
          showNow
          start={day(9)}
        />,
      )
      expect(container.querySelector('.vk-scheduler__now')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('Scheduler · edges', () => {
  it('renders with no resources and no events without dividing by zero', () => {
    const { container } = render(<Scheduler events={[]} label="Empty" resources={[]} />)
    expect(screen.getByRole('group', { name: 'Empty' })).toBeInTheDocument()
    expect(container.querySelector('.vk-scheduler__tick')).toBeInTheDocument()
  })

  it('accepts timestamps as well as Dates', () => {
    setup({
      events: [
        {
          id: 'x',
          resourceId: 'a',
          title: 'Numeric',
          start: day(11).getTime(),
          end: day(12, 30).getTime(),
        },
      ],
    })
    expect(left(slot('x'))).toBeCloseTo(40, 5)
  })

  it('uses a supplied time format everywhere a time is written', () => {
    setup({
      formatTime: (value) => `${value.getHours() % 12 || 12}${value.getHours() < 12 ? 'am' : 'pm'}`,
    })
    expect(slot('e2')).toHaveAccessibleName(/11am to 12pm/)
    expect(screen.getAllByText('9am').length).toBeGreaterThan(0)
  })

  it('accepts a custom booking renderer', () => {
    setup({ renderEvent: (event, resource) => <span>{`${event.title} @ ${resource.label}`}</span> })
    expect(screen.getByText('Standup @ Studio A')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = setup({ now: day(11, 30) })
    expect(await axe(container)).toHaveNoViolations()
  })
})
