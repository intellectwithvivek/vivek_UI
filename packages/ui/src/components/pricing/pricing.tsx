import { forwardRef, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Badge } from '../badge'
import { Card } from '../card'
import { Grid, type ResponsiveCols } from '../grid'
import { Heading } from '../heading'
import {
  type HeadingLevel,
  landmarkName,
  nextHeadingLevel,
  Section,
  type SectionProps,
} from '../section/section'
import { Text } from '../text'

export interface PricingPlan {
  name: string
  /** `"$29"`, or a node if you need to mark up the currency. */
  price: ReactNode
  /** Billing unit, e.g. `"/month"`. Read out after the price. */
  period?: string
  description?: string
  features: string[]
  /** Usually a `Button`. */
  cta?: ReactNode
  /** Lifts the plan and gives it the brand accent. */
  highlighted?: boolean
  /** Short flag such as `"Most popular"`, rendered as a `Badge`. */
  badge?: string
}

export interface PricingProps extends Omit<SectionProps, 'title'> {
  plans?: PricingPlan[]
  /** Omit for an auto-fitting grid, which reflows at every width. */
  columns?: number | ResponsiveCols
  /** Auto-fit track floor when `columns` is omitted. Defaults to `18rem`. */
  minItemWidth?: string
  /** A plain string becomes a pill `Badge`; a node is rendered as given. */
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  /**
   * Level of the section's own `title`, defaulting to `2`. Plan names render one level
   * below it — or at this level when the section has no title of its own.
   */
  headingLevel?: HeadingLevel
}

/**
 * A plan comparison table built out of `Card`s.
 *
 * The plans are a real `<ul>`, so assistive technology announces how many there are,
 * and each plan's feature list is a nested list rather than a pile of divs. The tick
 * marks are drawn by CSS pseudo-elements, so nothing decorative reaches the a11y tree.
 */
export const Pricing = forwardRef<HTMLElement, PricingProps>(function Pricing(
  {
    plans = [],
    columns,
    minItemWidth = '18rem',
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
      className={cx('vk-pricing', className)}
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
          {plans.length > 0 ? (
            <Grid
              as="ul"
              role="list"
              cols={columns}
              minItemWidth={minItemWidth}
              gap={6}
              className="vk-pricing__plans"
            >
              {plans.map((plan) => (
                <li className="vk-pricing__plan" key={plan.name}>
                  <Card
                    variant={plan.highlighted ? 'elevated' : 'outline'}
                    padding="lg"
                    className="vk-pricing__card"
                    data-highlighted={plan.highlighted || undefined}
                  >
                    <Card.Header className="vk-pricing__head">
                      <div className="vk-pricing__name-row">
                        <Heading level={itemLevel} size="lg">
                          {plan.name}
                        </Heading>
                        {plan.badge ? (
                          <Badge variant="solid" pill>
                            {plan.badge}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="vk-pricing__price">
                        <span className="vk-pricing__amount">{plan.price}</span>
                        {plan.period ? (
                          <span className="vk-pricing__period">{plan.period}</span>
                        ) : null}
                      </div>
                      {plan.description ? (
                        <Text size="sm" tone="muted">
                          {plan.description}
                        </Text>
                      ) : null}
                    </Card.Header>
                    <Card.Body>
                      {plan.features.length > 0 ? (
                        <ul
                          // biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics from a list-style:none list; the role restores them.
                          role="list"
                          className="vk-pricing__features"
                        >
                          {plan.features.map((feature) => (
                            <li className="vk-pricing__feature" key={feature}>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </Card.Body>
                    {plan.cta ? (
                      <Card.Footer className="vk-pricing__cta">{plan.cta}</Card.Footer>
                    ) : null}
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
