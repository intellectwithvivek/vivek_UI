import { forwardRef, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Grid, type ResponsiveCols } from '../grid'
import { Heading } from '../heading'
import {
  type HeadingLevel,
  landmarkName,
  nextHeadingLevel,
  proseTag,
  Section,
  type SectionProps,
} from '../section/section'
import { Text } from '../text'

export interface Feature {
  /**
   * Stable React key. Supply it whenever the data is dynamic: the fallback key is a
   * content field, which collides when two items share it (two reviews by the same
   * author, two stats with the same label) and makes React mis-attach state on reorder.
   */
  id?: string | number
  /** Decorative by definition — it is rendered `aria-hidden`, because the title says it. */
  icon?: ReactNode
  title: string
  description: string
}

export interface FeatureGridProps extends Omit<SectionProps, 'title'> {
  features?: Feature[]
  /**
   * Fixed or per-breakpoint column count. Omit it and the grid auto-fits, which is
   * the better default: it reflows at every width instead of at four fixed ones.
   */
  columns?: number | ResponsiveCols
  /** Auto-fit track floor when `columns` is omitted. Defaults to `16rem`. */
  minItemWidth?: string
  /** A plain string becomes a pill `Badge`; a node is rendered as given. */
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  /**
   * Level of the section's own `title`, defaulting to `2`. Feature titles render one
   * level below it — or at this level when the section has no title of its own, so the
   * document outline stays valid either way.
   */
  headingLevel?: HeadingLevel
}

/** A responsive grid of icon + title + description cells. */
export const FeatureGrid = forwardRef<HTMLElement, FeatureGridProps>(function FeatureGrid(
  {
    features = [],
    columns,
    minItemWidth,
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
  const itemLevel = hasHeader ? nextHeadingLevel(headingLevel) : headingLevel

  return (
    <Section
      ref={ref}
      className={cx('vk-feature-grid', className)}
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
          {features.length > 0 ? (
            <Grid
              as="ul"
              role="list"
              cols={columns}
              minItemWidth={minItemWidth}
              gap={8}
              className="vk-feature-grid__list"
            >
              {features.map((feature) => (
                <li className="vk-feature-grid__item" key={feature.id ?? feature.title}>
                  {feature.icon ? (
                    <span className="vk-feature-grid__icon" aria-hidden="true">
                      {feature.icon}
                    </span>
                  ) : null}
                  <Heading level={itemLevel} size="md" className="vk-feature-grid__title">
                    {feature.title}
                  </Heading>
                  <Text as={proseTag(feature.description)} tone="muted">
                    {feature.description}
                  </Text>
                </li>
              ))}
            </Grid>
          ) : null}
        </>
      )}
    </Section>
  )
})
