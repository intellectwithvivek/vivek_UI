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
  /**
   * Stable React key. Supply it whenever the data is dynamic: the fallback key is a
   * content field, which collides when two items share it (two reviews by the same
   * author, two stats with the same label) and makes React mis-attach state on reorder.
   */
  id?: string | number
  question: string
  answer: ReactNode
  /**
   * Plain-text version of the answer, used only for the FAQPage structured data. Needed
   * when `answer` is JSX — a ReactNode cannot be serialised into JSON-LD, so an item
   * whose answer is not a string is silently left out of the emitted schema unless this
   * is provided. Items with a string `answer` need nothing extra.
   */
  answerText?: string
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
  /**
   * Emit schema.org `FAQPage` JSON-LD alongside the list. Default `true`.
   *
   * This is the markup an answer engine reads to quote a question and its answer
   * directly, and it is derived 1:1 from the items rendered on the page — never from
   * anything invisible, which is what Google's structured-data policy requires. Items
   * whose `answer` is JSX are included only when they carry `answerText`. Nothing is
   * emitted when the `children` escape hatch replaces the default layout, because the
   * schema must describe what is actually visible.
   */
  structuredData?: boolean
}

/**
 * FAQPage JSON-LD for the rendered items, or null when nothing is serialisable.
 *
 * `<` is escaped to `<` — still valid JSON — because a string containing
 * `</script>` would otherwise close the tag early, which is the classic JSON-LD
 * injection. This matters here more than most places: FAQ content routinely comes from
 * a CMS.
 */
function faqPageJson(items: FaqItem[]): string | null {
  const entries = items
    .map((item) => ({
      question: item.question,
      answer: typeof item.answer === 'string' ? item.answer : item.answerText,
    }))
    .filter((entry): entry is { question: string; answer: string } => Boolean(entry.answer))
  if (entries.length === 0) return null

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  }).replace(/</g, '\\u003c')
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
    structuredData = true,
    size = 'md',
    className,
    children,
    ...rest
  },
  ref,
) {
  const hasHeader = Boolean(eyebrow || title || description)
  const itemLevel = hasHeader ? nextHeadingLevel(headingLevel) : headingLevel
  // Only when the default layout renders: schema must describe what is visible.
  const jsonLd = structuredData && !children ? faqPageJson(items) : null

  return (
    <Section
      ref={ref}
      className={cx('vk-faq', className)}
      size={size}
      {...rest}
      aria-label={landmarkName(title, rest)}
    >
      {jsonLd ? (
        <script
          type="application/ld+json"
          /*
           * The one dangerouslySetInnerHTML in the library, and the reason it is safe: a
           * JSON-LD block has to be a raw script body (React escapes text children, which
           * would corrupt the JSON), and the payload is JSON.stringify output with `<`
           * escaped above — no markup can pass through it, whatever the items contain.
           * security.test.tsx pins usage to this file and asserts the escaping.
           */
          // biome-ignore lint/security/noDangerouslySetInnerHtml: serialised JSON with `<` escaped; see the comment above
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      ) : null}
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
                  key={item.id ?? item.question}
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
