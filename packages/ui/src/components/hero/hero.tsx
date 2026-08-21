import { forwardRef, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { type HeadingLevel, landmarkName, Section, type SectionProps } from '../section/section'
import { Stack } from '../stack'

export interface HeroProps extends Omit<SectionProps, 'align' | 'title'> {
  /** A plain string becomes a pill `Badge`; a node is rendered as given. */
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  /** Usually one or two `Button`s. Laid out in a row that wraps. */
  actions?: ReactNode
  /** Screenshot or illustration. Sits beside the copy in the `split` layout. */
  media?: ReactNode
  align?: 'start' | 'center'
  /** `centered` stacks and centres; `split` puts `media` beside the copy when there is room. */
  layout?: 'centered' | 'split'
  /** Level of `title`. Defaults to `1` — a hero is normally the page's only h1. */
  headingLevel?: HeadingLevel
}

/**
 * The top-of-page pitch. Renders from props alone; pass `children` to take the
 * inner layout over completely.
 *
 * The `split` layout is a container query, not a media query: the copy and the
 * media sit side by side once the *hero* is wide enough, so it also collapses
 * correctly inside a narrow column where a viewport query would get it wrong.
 */
export const Hero = forwardRef<HTMLElement, HeroProps>(function Hero(
  {
    eyebrow,
    title,
    description,
    actions,
    media,
    align,
    layout = 'centered',
    headingLevel = 1,
    padding = 'xl',
    className,
    children,
    ...rest
  },
  ref,
) {
  // A centred hero reads as centred text; a split hero has to be start-aligned
  // or the copy fights the media beside it.
  const resolvedAlign = align ?? (layout === 'split' ? 'start' : 'center')

  return (
    <Section
      ref={ref}
      className={cx('vk-hero', className)}
      padding={padding}
      align={resolvedAlign}
      data-layout={layout}
      {...rest}
      aria-label={landmarkName(title, rest)}
    >
      {children ?? (
        <div className="vk-hero__inner">
          <Section.Header
            className="vk-hero__content"
            eyebrow={eyebrow}
            title={title}
            description={description}
            titleSize="hero"
            headingLevel={headingLevel}
            align={resolvedAlign}
          >
            {actions ? (
              <Stack
                direction="horizontal"
                gap={3}
                wrap
                align="center"
                className="vk-hero__actions"
              >
                {actions}
              </Stack>
            ) : null}
          </Section.Header>
          {media ? <div className="vk-hero__media">{media}</div> : null}
        </div>
      )}
    </Section>
  )
})
