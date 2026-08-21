import { forwardRef, type HTMLAttributes, type LiHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Heading } from '../heading'
import { type HeadingLevel, proseTag } from '../section/section'
import { Text } from '../text'

export type TimelineOrientation = 'vertical' | 'horizontal'
/** `alternate` zig-zags entries either side of the rail — vertical only, and only when wide. */
export type TimelineAlign = 'start' | 'alternate'
export type TimelineStatus = 'complete' | 'current' | 'pending'

/**
 * The glyph that is NOT a colour. A screen reader gets `STATUS_LABEL`; a user who cannot
 * distinguish the marker's fill from its outline gets a tick, a dot, or an empty ring.
 */
const STATUS_GLYPH: Record<TimelineStatus, string> = {
  complete: '✓',
  current: '●',
  pending: '',
}

const STATUS_LABEL: Record<TimelineStatus, string> = {
  complete: 'Completed',
  current: 'In progress',
  pending: 'Not started',
}

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  orientation?: TimelineOrientation
  /**
   * `start` (default) keeps every entry on one side of the rail. `alternate` zig-zags
   * them, and falls back to `start` on a container too narrow to hold two columns —
   * so it is safe to set unconditionally.
   */
  align?: TimelineAlign
}

/**
 * A sequence of events, as an ordered list — because it *is* one. A screen reader user
 * gets "list, 4 items, item 1 of 4" for free, which is exactly the structure the visual
 * rail conveys, and no ARIA is needed to say it.
 *
 * Server-safe: no state, no effects, no event handlers. `align="alternate"` responds to
 * the container's own width through a container query, not the viewport's, so a timeline
 * dropped into a narrow column collapses correctly with no props.
 */
const TimelineRoot = forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { orientation = 'vertical', align = 'start', className, ...rest },
  ref,
) {
  return (
    <ol
      ref={ref}
      className={cx('vk-timeline', className)}
      data-orientation={orientation}
      data-align={align}
      {...rest}
    />
  )
})

export interface TimelineItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  /** When it happened. Pass a `RelativeTime` or a plain string. */
  timestamp?: ReactNode
  /** Replaces the default status glyph inside the marker. Decorative. */
  icon?: ReactNode
  status?: TimelineStatus
  /** Overrides the announced status text, e.g. for a different language. */
  statusLabel?: string
  /** Level of `title`. Defaults to `3`. */
  headingLevel?: HeadingLevel
}

/**
 * One event on the rail.
 *
 * Status is conveyed three ways on purpose: the marker's fill (colour), the glyph inside
 * it (shape), and a visually hidden word after the title (text). Colour alone would fail
 * WCAG 1.4.1, and a tick alone would be silent to a screen reader.
 */
const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(function TimelineItem(
  {
    title,
    description,
    timestamp,
    icon,
    status = 'pending',
    statusLabel,
    headingLevel = 3,
    className,
    children,
    ...rest
  },
  ref,
) {
  const glyph = icon === undefined ? STATUS_GLYPH[status] : icon

  return (
    <li ref={ref} className={cx('vk-timeline__item', className)} data-status={status} {...rest}>
      <span className="vk-timeline__marker" aria-hidden="true">
        {glyph}
      </span>
      <div className="vk-timeline__content">
        {timestamp ? <div className="vk-timeline__timestamp">{timestamp}</div> : null}
        {title ? (
          <Heading level={headingLevel} size="md" className="vk-timeline__title">
            {title}
          </Heading>
        ) : null}
        <span className="vk-timeline__status">{statusLabel ?? STATUS_LABEL[status]}</span>
        {description ? (
          <Text
            as={proseTag(description)}
            size="sm"
            tone="muted"
            className="vk-timeline__description"
          >
            {description}
          </Text>
        ) : null}
        {children}
      </div>
    </li>
  )
})

/** Compound component: `Timeline` and `Timeline.Item`. */
export const Timeline = Object.assign(TimelineRoot, { Item: TimelineItem })
