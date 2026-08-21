import { forwardRef, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Heading } from '../heading'
import { type HeadingLevel, landmarkName, Section, type SectionProps } from '../section/section'

export interface Logo {
  /**
   * Stable React key. Supply it whenever the data is dynamic: the fallback key is a
   * content field, which collides when two items share it (two reviews by the same
   * author, two stats with the same label) and makes React mis-attach state on reorder.
   */
  id?: string | number
  /** Image URL. Rendered as an `<img>` with `alt` set from `alt`. */
  src?: string
  /** The company name. Required — it is the accessible name of the logo, whichever form it takes. */
  alt: string
  /** An inline SVG or other node, used instead of `src`. Labelled with `alt`. */
  node?: ReactNode
}

export interface LogoCloudProps extends Omit<SectionProps, 'title'> {
  logos?: Logo[]
  title?: ReactNode
  /**
   * Level of `title`, defaulting to `2`. The title is a real heading rendered at a
   * small visual size — `Heading` separates level from size precisely so a modest-looking
   * "Trusted by" line does not have to lie about its place in the outline.
   */
  headingLevel?: HeadingLevel
}

/**
 * Three shapes, one accessible name. A supplied node becomes a labelled `role="img"`
 * wrapper (its internals are almost always an unlabelled `<svg>`); a URL becomes an
 * `<img alt>`; with neither, the name itself is the wordmark.
 */
function LogoMark({ logo }: { logo: Logo }) {
  if (logo.node) {
    return (
      <span className="vk-logo-cloud__mark" role="img" aria-label={logo.alt}>
        {logo.node}
      </span>
    )
  }
  if (logo.src) {
    return <img className="vk-logo-cloud__mark" src={logo.src} alt={logo.alt} />
  }
  return <span className="vk-logo-cloud__mark">{logo.alt}</span>
}

/**
 * A row of customer or partner logos.
 *
 * Each logo carries its company name as its accessible name — an `<img alt>` for a
 * URL, or an `aria-label`led `role="img"` wrapper for a supplied node — so the row is
 * never a run of unlabelled graphics. The row wraps; it does not scroll or animate.
 */
export const LogoCloud = forwardRef<HTMLElement, LogoCloudProps>(function LogoCloud(
  {
    logos = [],
    title,
    headingLevel = 2,
    align = 'center',
    padding = 'md',
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <Section
      ref={ref}
      className={cx('vk-logo-cloud', className)}
      align={align}
      padding={padding}
      {...rest}
      aria-label={landmarkName(title, rest)}
    >
      {children ?? (
        <div className="vk-logo-cloud__inner">
          {title ? (
            <Heading level={headingLevel} size="sm" className="vk-logo-cloud__title">
              {title}
            </Heading>
          ) : null}
          {logos.length > 0 ? (
            <ul
              // biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics from a list-style:none list; the role restores them.
              role="list"
              className="vk-logo-cloud__list"
            >
              {logos.map((logo) => (
                <li className="vk-logo-cloud__item" key={logo.id ?? logo.alt}>
                  <LogoMark logo={logo} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </Section>
  )
})
