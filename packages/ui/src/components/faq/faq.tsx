import { forwardRef, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
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

export interface FaqItem {
  question: string
  answer: ReactNode
}

export interface FAQProps extends Omit<SectionProps, 'title'> {
  items?: FaqItem[]
  /**
   * Index of the item to render open on first paint. Server-rendered as the native
   * `open` attribute, so there is nothing to hydrate.
   */
  defaultOpen?: number
  /**
   * Shared `name` for every `<details>`, which makes the group mutually exclusive —
   * opening one closes the others, natively. Supply a value unique to the page; it is
   * opt-in rather than generated because ids cannot be minted in a Server Component.
   */
  name?: string
  /** A plain string becomes a pill `Badge`; a node is rendered as given. */
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  /**
   * Level of the section's own `title`, defaulting to `2`. Questions render one level
   * below it — or at this level when the section has no title of its own.
   */
  headingLevel?: HeadingLevel
}

/**
 * A frequently-asked-questions list built on native `<details>`/`<summary>`.
 *
 * This is not a compromise for the sake of server-safety — it is the better
 * accordion. It opens with zero JavaScript, is keyboard-operable and
 * screen-reader-correct for free, participates in in-page find (browsers expand a
 * closed `details` to reveal a match), and needs no ARIA at all: `<summary>` already
 * exposes the expanded state. So there is none here, deliberately.
 *
 * The question sits inside the `summary` as a heading, which the HTML spec allows
 * explicitly, so the questions show up in a screen reader's heading list.
 */
export const FAQ = forwardRef<HTMLElement, FAQProps>(function FAQ(
  {
    items = [],
    defaultOpen,
    name,
    eyebrow,
    title,
    description,
    headingLevel = 2,
    size = 'md',
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
      className={cx('vk-faq', className)}
      size={size}
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
            <div className="vk-faq__list">
              {items.map((item, index) => (
                <details
                  className="vk-faq__item"
                  key={item.question}
                  name={name}
                  open={index === defaultOpen || undefined}
                >
                  <summary className="vk-faq__question">
                    <Heading level={itemLevel} size="md" className="vk-faq__question-text">
                      {item.question}
                    </Heading>
                  </summary>
                  <div className="vk-faq__answer">
                    <Text as={proseTag(item.answer)} tone="muted">
                      {item.answer}
                    </Text>
                  </div>
                </details>
              ))}
            </div>
          ) : null}
        </>
      )}
    </Section>
  )
})
