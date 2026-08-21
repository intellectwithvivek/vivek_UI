import { forwardRef, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Grid, type ResponsiveCols } from '../grid'
import { type HeadingLevel, landmarkName, Section, type SectionProps } from '../section/section'

export interface Stat {
  /**
   * Stable React key. Supply it whenever the data is dynamic: the fallback key is a
   * content field, which collides when two items share it (two reviews by the same
   * author, two stats with the same label) and makes React mis-attach state on reorder.
   */
  id?: string | number
  /** The headline figure, e.g. `"99.98%"`. */
  value: ReactNode
  /** What the figure measures. Always announced with the value. */
  label: string
  description?: string
}

export interface StatsProps extends Omit<SectionProps, 'title'> {
  items?: Stat[]
  /** Omit for an auto-fitting grid, which reflows at every width. */
  columns?: number | ResponsiveCols
  /** Auto-fit track floor when `columns` is omitted. Defaults to `12rem`. */
  minItemWidth?: string
  /** A plain string becomes a pill `Badge`; a node is rendered as given. */
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  /** Level of the section's own `title`. Defaults to `2`. */
  headingLevel?: HeadingLevel
}

/**
 * A row of headline figures.
 *
 * Rendered as a description list: each figure is a `<dd>` bound to a `<dt>` naming
 * what it measures. A big number on its own is meaningless to a screen reader, so the
 * label is always in the a11y tree — and it comes FIRST in the DOM, so the reading
 * order is "Uptime, 99.98%". CSS `order` then lifts the number above it visually,
 * which is the only place the two orders differ, and nothing here is focusable.
 */
export const Stats = forwardRef<HTMLElement, StatsProps>(function Stats(
  {
    items = [],
    columns,
    minItemWidth = '12rem',
    eyebrow,
    title,
    description,
    headingLevel = 2,
    className,
    children,
    ...rest
  },
  ref,
) {
  const hasHeader = Boolean(eyebrow || title || description)

  return (
    <Section
      ref={ref}
      className={cx('vk-stats', className)}
      {...rest}
      aria-label={landmarkName(title, rest)}
    >
      {children ?? (
        <>
          {hasHeader ? (
            <Section.Header
              eyebrow={eyebrow}
              title={title}
              description={description}
              headingLevel={headingLevel}
            />
          ) : null}
          {items.length > 0 ? (
            <Grid
              as="dl"
              cols={columns}
              minItemWidth={minItemWidth}
              gap={8}
              className="vk-stats__list"
            >
              {items.map((item) => (
                <div className="vk-stats__item" key={item.id ?? item.label}>
                  <dt className="vk-stats__label">{item.label}</dt>
                  <dd className="vk-stats__value">{item.value}</dd>
                  {item.description ? (
                    <dd className="vk-stats__description">{item.description}</dd>
                  ) : null}
                </div>
              ))}
            </Grid>
          ) : null}
        </>
      )}
    </Section>
  )
})
