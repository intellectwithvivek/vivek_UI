import { forwardRef, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Avatar } from '../avatar'
import { Card } from '../card'
import { Grid, type ResponsiveCols } from '../grid'
import { type HeadingLevel, landmarkName, Section, type SectionProps } from '../section/section'
import { Text } from '../text'

export interface Testimonial {
  quote: ReactNode
  author: string
  role?: string
  /** An image URL becomes an `Avatar`; a node is rendered as given. */
  avatar?: ReactNode
}

export interface TestimonialsProps extends Omit<SectionProps, 'title'> {
  items?: Testimonial[]
  /** Omit for an auto-fitting grid, which reflows at every width. */
  columns?: number | ResponsiveCols
  /** Auto-fit track floor when `columns` is omitted. Defaults to `20rem`. */
  minItemWidth?: string
  /** A plain string becomes a pill `Badge`; a node is rendered as given. */
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  /** Level of the section's own `title`. Defaults to `2`. */
  headingLevel?: HeadingLevel
}

/**
 * Customer quotes.
 *
 * Each item is `<figure><blockquote>…</blockquote><figcaption>` — the markup HTML
 * actually defines for an attributed quotation. The attribution deliberately lives
 * in the `figcaption` and not inside the `blockquote`, because per the HTML spec the
 * quote element must contain only the quoted words. `<cite>` names the source.
 */
export const Testimonials = forwardRef<HTMLElement, TestimonialsProps>(function Testimonials(
  {
    items = [],
    columns,
    minItemWidth = '20rem',
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
      className={cx('vk-testimonials', className)}
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
              as="ul"
              role="list"
              cols={columns}
              minItemWidth={minItemWidth}
              gap={6}
              className="vk-testimonials__list"
            >
              {items.map((item) => (
                <li className="vk-testimonials__item" key={item.author}>
                  <Card variant="outline" padding="lg" className="vk-testimonials__card">
                    <figure className="vk-testimonials__figure">
                      <blockquote className="vk-testimonials__quote">{item.quote}</blockquote>
                      <figcaption className="vk-testimonials__attribution">
                        {typeof item.avatar === 'string' ? (
                          <Avatar src={item.avatar} name={item.author} size="md" />
                        ) : (
                          item.avatar
                        )}
                        <div className="vk-testimonials__source">
                          <cite className="vk-testimonials__author">{item.author}</cite>
                          {item.role ? (
                            <Text as="span" size="sm" tone="muted">
                              {item.role}
                            </Text>
                          ) : null}
                        </div>
                      </figcaption>
                    </figure>
                  </Card>
                </li>
              ))}
            </Grid>
          ) : null}
        </>
      )}
    </Section>
  )
})
