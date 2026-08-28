import { forwardRef, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { type HeadingLevel, landmarkName, Section, type SectionProps } from '../section/section'
import { Stack } from '../stack'

export interface CTAProps extends Omit<SectionProps, 'title' | 'background'> {
  /** A plain string becomes a pill `Badge`; a node is rendered as given. */
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  /** Usually one or two `Button`s. Laid out in a row that wraps. */
  actions?: ReactNode
  /** Surface treatment. `primary` re-points the palette for the whole block. */
  /**
   * Surface treatment, forwarded to the underlying `Section`. Named `background` because
   * that is exactly what it is — `variant` implied a structural difference that never
   * existed, and Section already calls this vocabulary `background`.
   */
  background?: 'default' | 'muted' | 'primary'
  /** Paint the background on a rounded card inside the container instead of a full-bleed band. */
  inset?: boolean
  /** `split` puts the actions beside the copy on wide screens whatever the alignment. Default `stack`. */
  layout?: 'stack' | 'split'
  /** Level of `title`. Defaults to `2`. */
  headingLevel?: HeadingLevel
}

/**
 * The closing ask.
 *
 * At narrow widths the copy and the actions stack; once the section itself is wide
 * enough and the content is start-aligned, the actions move alongside. That switch is
 * a container query on the section, so a CTA in a sidebar stays stacked even on a
 * wide screen — which a viewport media query would get wrong.
 */
export const CTA = forwardRef<HTMLElement, CTAProps>(function CTA(
  {
    eyebrow,
    title,
    description,
    actions,
    background = 'muted',
    inset = false,
    layout = 'stack',
    align = 'center',
    headingLevel = 2,
    padding = 'lg',
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <Section
      ref={ref}
      className={cx('vk-cta', className)}
      background={inset ? 'default' : background}
      align={align}
      padding={padding}
      data-inset={inset || undefined}
      data-tone={inset ? background : undefined}
      data-layout={layout}
      {...rest}
      aria-label={landmarkName(title, rest)}
    >
      {children ?? (
        <div className="vk-cta__inner">
          <Section.Header
            className="vk-cta__content"
            eyebrow={eyebrow}
            title={title}
            description={description}
            headingLevel={headingLevel}
            align={align}
          />
          {actions ? (
            <Stack direction="horizontal" gap={3} wrap align="center" className="vk-cta__actions">
              {actions}
            </Stack>
          ) : null}
        </div>
      )}
    </Section>
  )
})
