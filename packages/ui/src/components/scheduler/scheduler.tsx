'use client'

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cx } from '../../utils/cx'

export interface SchedulerResource {
  id: string
  label: string
  /** A second line under the name — a role, a room capacity, a location. */
  sublabel?: string
}

export interface SchedulerEvent {
  id: string
  /** Must match a `SchedulerResource.id`. Events pointing nowhere are dropped. */
  resourceId: string
  title: string
  start: Date | number
  end: Date | number
  /** Drives `data-tone`, so you can colour by status without writing a renderer. */
  tone?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
  /** Anything you need back in `onEventSelect`. */
  meta?: unknown
}

export interface SchedulerProps {
  resources: readonly SchedulerResource[]
  events: readonly SchedulerEvent[]
  /** Required. A timeline with no accessible name is one more unlabelled region. */
  label: string
  /** Window start. Defaults to the earliest event, floored to the step. */
  start?: Date | number
  /** Window end. Defaults to the latest event, ceiled to the step. */
  end?: Date | number
  /** Minutes between axis ticks. Default 60. */
  step?: number
  /** Minimum pixels per tick. Below this the timeline scrolls rather than crushing. */
  minTickWidth?: number
  /**
   * Draw the current-time marker.
   *
   * Left to itself this component never reads the clock during render — that would produce a
   * different marker on the server and the client, which React reports as a hydration
   * mismatch. The clock is read in an effect, after mount.
   */
  showNow?: boolean
  /** An explicit "now", which overrides {@link showNow}'s clock. Useful in tests and demos. */
  now?: Date | number
  onEventSelect?: (event: SchedulerEvent) => void
  /** Rendered instead of the default title + time. The wrapper button stays ours. */
  renderEvent?: (event: SchedulerEvent, resource: SchedulerResource) => ReactNode
  /**
   * How a time is written, in the axis and in every accessible name.
   *
   * The default is a deterministic 24-hour `HH:MM` rather than `Intl.DateTimeFormat`, because
   * ICU output varies between Node builds and browsers — the same code would render
   * differently for two of your users. Pass your own for 12-hour clocks or other locales.
   */
  formatTime?: (value: Date) => string
  className?: string
}

const MINUTE = 60_000

const pad = (value: number) => String(value).padStart(2, '0')
const defaultFormatTime = (value: Date) => `${pad(value.getHours())}:${pad(value.getMinutes())}`

const ms = (value: Date | number) => (value instanceof Date ? value.getTime() : value)

/**
 * Snap a time to the step, anchored to **local midnight**.
 *
 * The obvious `Math.floor(value / stepMs) * stepMs` snaps against the epoch, which is UTC, so
 * in any timezone whose offset is not a whole number of hours — India, Nepal, Newfoundland,
 * parts of Australia — an hourly axis would come out labelled 08:30, 09:30, 10:30. Anchoring
 * to the local day puts the ticks where the user reads them.
 */
function snap(value: number, stepMs: number, direction: 'floor' | 'ceil'): number {
  const at = new Date(value)
  const midnight = new Date(at.getFullYear(), at.getMonth(), at.getDate()).getTime()
  const offset = value - midnight
  const steps = direction === 'ceil' ? Math.ceil(offset / stepMs) : Math.floor(offset / stepMs)
  return midnight + steps * stepMs
}

/** Reads well in an accessible name: "1 hour 30 minutes", not "PT1H30M" or "90". */
function spokenDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`)
  if (rest > 0) parts.push(`${rest} minute${rest === 1 ? '' : 's'}`)
  return parts.length > 0 ? parts.join(' ') : '0 minutes'
}

interface Placed {
  event: SchedulerEvent
  startMs: number
  endMs: number
  /** Stacking row within the resource, so overlapping events never hide one another. */
  lane: number
}

/**
 * Greedy lane packing: an event takes the first lane whose last event has already finished.
 *
 * The alternative — one lane per event — wastes vertical space, and the other alternative
 * — overlapping them — hides bookings, which on a scheduler is a data-loss bug rather than a
 * cosmetic one.
 */
function packLanes(events: readonly SchedulerEvent[]): { placed: Placed[]; lanes: number } {
  const sorted = events
    .map((event) => ({ event, startMs: ms(event.start), endMs: ms(event.end) }))
    .sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs)

  const laneEnds: number[] = []
  const placed: Placed[] = []

  for (const entry of sorted) {
    let lane = laneEnds.findIndex((endsAt) => endsAt <= entry.startMs)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(entry.endMs)
    } else {
      laneEnds[lane] = entry.endMs
    }
    placed.push({ ...entry, lane })
  }

  return { placed, lanes: Math.max(laneEnds.length, 1) }
}

/**
 * A resource scheduler — people, rooms or machines down the side, time across the top.
 *
 * This is the view every booking tool, studio calendar and shift roster needs, and the one
 * no free component library ships: shadcn/ui, Mantine and Radix have none, and MUI's is
 * behind a paid licence.
 *
 * **It is navigable without a pointer,** which is the part that is usually skipped. A
 * timeline conveys everything through position, and position is invisible to a screen
 * reader, so every booking carries its resource, its times and its duration in its
 * accessible name, and the whole board is one tab stop with a roving focus:
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | Left / Right | Previous / next booking for this resource, in time order |
 * | Up / Down | The nearest booking on the resource above / below |
 * | Home / End | First / last booking for this resource |
 * | Enter or Space | Select it |
 *
 * Overlapping bookings are packed into stacked lanes rather than drawn on top of each other,
 * so a double-booking is visible instead of hidden.
 *
 * **Nothing is mutated for you.** `onEventSelect` reports; your state decides.
 */
export function Scheduler({
  resources,
  events,
  label,
  start,
  end,
  step = 60,
  minTickWidth = 96,
  showNow = false,
  now,
  onEventSelect,
  renderEvent,
  formatTime = defaultFormatTime,
  className,
}: SchedulerProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const known = useMemo(() => new Set(resources.map((resource) => resource.id)), [resources])
  const scheduled = useMemo(
    // An event on a resource that is not on the board has nowhere to be drawn. Dropping it is
    // the only honest option; rendering it against the wrong row would be worse.
    () => events.filter((event) => known.has(event.resourceId) && ms(event.end) > ms(event.start)),
    [events, known],
  )

  const window = useMemo(() => {
    const stepMs = Math.max(step, 1) * MINUTE
    const starts = scheduled.map((event) => ms(event.start))
    const ends = scheduled.map((event) => ms(event.end))
    const rawStart = start !== undefined ? ms(start) : Math.min(...starts)
    const rawEnd = end !== undefined ? ms(end) : Math.max(...ends)

    // With no events and no explicit window there is nothing to scale against. One empty tick
    // keeps the layout valid rather than dividing by zero.
    if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd) || rawEnd <= rawStart) {
      const base = Number.isFinite(rawStart) ? rawStart : 0
      return { from: base, to: base + stepMs, stepMs }
    }

    return {
      from: start !== undefined ? rawStart : snap(rawStart, stepMs, 'floor'),
      to: end !== undefined ? rawEnd : snap(rawEnd, stepMs, 'ceil'),
      stepMs,
    }
  }, [scheduled, start, end, step])

  const span = window.to - window.from
  const ticks = useMemo(() => {
    const out: number[] = []
    for (let at = window.from; at < window.to; at += window.stepMs) out.push(at)
    return out
  }, [window])

  const rows = useMemo(
    () =>
      resources.map((resource) => ({
        resource,
        ...packLanes(scheduled.filter((event) => event.resourceId === resource.id)),
      })),
    [resources, scheduled],
  )

  /** Time order per row is the order Left/Right walks, and it is already sorted by packLanes. */
  const order = useMemo(() => rows.map((row) => row.placed.map((entry) => entry.event.id)), [rows])
  const firstId = order.find((ids) => ids.length > 0)?.[0] ?? null
  const active = activeId ?? firstId

  // The clock is read here, not during render: a `Date.now()` in the render body gives the
  // server one marker position and the client another, which React flags as a mismatch.
  const [clock, setClock] = useState<number | null>(null)
  useEffect(() => {
    if (!showNow || now !== undefined) return
    setClock(Date.now())
    const id = setInterval(() => setClock(Date.now()), MINUTE)
    return () => clearInterval(id)
  }, [showNow, now])

  const marker = now !== undefined ? ms(now) : clock
  const showMarker = marker !== null && marker >= window.from && marker <= window.to

  const focusEvent = useCallback((id: string) => {
    setActiveId(id)
    rootRef.current?.querySelector<HTMLElement>(`[data-event-id="${CSS.escape(id)}"]`)?.focus()
  }, [])

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>, rowIndex: number, at: number) => {
    const here = order[rowIndex]
    if (!here) return

    const step = (delta: number) => {
      const next = here[at + delta]
      if (next) {
        event.preventDefault()
        focusEvent(next)
      }
    }

    switch (event.key) {
      case 'ArrowRight':
        step(1)
        return
      case 'ArrowLeft':
        step(-1)
        return
      case 'Home': {
        const first = here[0]
        if (first) {
          event.preventDefault()
          focusEvent(first)
        }
        return
      }
      case 'End': {
        const last = here[here.length - 1]
        if (last) {
          event.preventDefault()
          focusEvent(last)
        }
        return
      }
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault()
        const direction = event.key === 'ArrowDown' ? 1 : -1
        const anchor = rows[rowIndex]?.placed[at]?.startMs ?? window.from
        // Skip empty rows: stopping on a row with nothing in it would look like a dead key.
        for (let row = rowIndex + direction; row >= 0 && row < rows.length; row += direction) {
          const candidates = rows[row]?.placed
          if (!candidates || candidates.length === 0) continue
          // Land on the booking nearest in time, which is the one under the cursor visually.
          let best = candidates[0]
          if (!best) continue
          for (const candidate of candidates) {
            if (Math.abs(candidate.startMs - anchor) < Math.abs(best.startMs - anchor)) {
              best = candidate
            }
          }
          focusEvent(best.event.id)
          return
        }
        return
      }
      default:
    }
  }

  const percent = (value: number) => ((value - window.from) / span) * 100

  return (
    <div
      aria-label={label}
      className={cx('vk-scheduler', className)}
      ref={rootRef}
      role="group"
      style={
        { '--vk-scheduler-min-width': `${ticks.length * minTickWidth}px` } as React.CSSProperties
      }
    >
      <div className="vk-scheduler__scroll">
        <div className="vk-scheduler__canvas">
          {/*
            The axis is decorative: it says nothing a screen reader can use, because it
            communicates purely through horizontal position. Every time it shows is repeated
            inside the accessible name of the bookings it sits above.
          */}
          <div aria-hidden="true" className="vk-scheduler__axis">
            <div className="vk-scheduler__gutter" />
            <div className="vk-scheduler__ticks">
              {ticks.map((at) => (
                <span
                  className="vk-scheduler__tick"
                  key={at}
                  style={{ insetInlineStart: `${percent(at)}%` }}
                >
                  {formatTime(new Date(at))}
                </span>
              ))}
            </div>
          </div>

          {rows.map((row, rowIndex) => (
            <div
              className="vk-scheduler__row"
              key={row.resource.id}
              style={{ '--vk-scheduler-lanes': row.lanes } as React.CSSProperties}
            >
              <div className="vk-scheduler__gutter">
                <span className="vk-scheduler__resource">{row.resource.label}</span>
                {row.resource.sublabel ? (
                  <span className="vk-scheduler__sublabel">{row.resource.sublabel}</span>
                ) : null}
              </div>

              {/* biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics from a list-style:none list; the role restores them. */}
              <ul aria-label={row.resource.label} className="vk-scheduler__track" role="list">
                {/* Grid lines belong to the track so they scroll with it. */}
                <span aria-hidden="true" className="vk-scheduler__lines">
                  {ticks.map((at) => (
                    <span
                      className="vk-scheduler__line"
                      key={at}
                      style={{ insetInlineStart: `${percent(at)}%` }}
                    />
                  ))}
                </span>

                {row.placed.map((entry, at) => {
                  const clippedStart = Math.max(entry.startMs, window.from)
                  const clippedEnd = Math.min(entry.endMs, window.to)
                  // Entirely outside the window: drawing it at zero width would be a sliver
                  // the user cannot hit but the keyboard can still reach.
                  if (clippedEnd <= clippedStart) return null

                  const minutes = (entry.endMs - entry.startMs) / MINUTE
                  const from = formatTime(new Date(entry.startMs))
                  const to = formatTime(new Date(entry.endMs))

                  return (
                    <li className="vk-scheduler__slot" key={entry.event.id}>
                      <button
                        aria-label={`${entry.event.title}. ${row.resource.label}, ${from} to ${to}, ${spokenDuration(minutes)}.`}
                        className="vk-scheduler__event"
                        data-clipped={
                          entry.startMs < window.from || entry.endMs > window.to || undefined
                        }
                        data-event-id={entry.event.id}
                        data-tone={entry.event.tone ?? 'default'}
                        onClick={() => {
                          setActiveId(entry.event.id)
                          onEventSelect?.(entry.event)
                        }}
                        onKeyDown={(keyEvent) => onKeyDown(keyEvent, rowIndex, at)}
                        style={
                          {
                            insetInlineStart: `${percent(clippedStart)}%`,
                            inlineSize: `${((clippedEnd - clippedStart) / span) * 100}%`,
                            '--vk-scheduler-lane': entry.lane,
                          } as React.CSSProperties
                        }
                        // One tab stop for the whole board, moved as focus moves.
                        tabIndex={active === entry.event.id ? 0 : -1}
                        type="button"
                      >
                        {renderEvent ? (
                          renderEvent(entry.event, row.resource)
                        ) : (
                          <>
                            <span className="vk-scheduler__title">{entry.event.title}</span>
                            <span aria-hidden="true" className="vk-scheduler__time">
                              {from}–{to}
                            </span>
                          </>
                        )}
                      </button>
                    </li>
                  )
                })}

                {row.placed.length === 0 ? (
                  <li className="vk-scheduler__free">Nothing scheduled</li>
                ) : null}
              </ul>
            </div>
          ))}

          {showMarker ? (
            <span
              aria-hidden="true"
              className="vk-scheduler__now"
              data-testid="vk-scheduler-now"
              style={{
                insetInlineStart: `calc(var(--vk-scheduler-gutter) + (100% - var(--vk-scheduler-gutter)) * ${percent(marker) / 100})`,
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
