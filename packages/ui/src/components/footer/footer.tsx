import { forwardRef, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Divider } from '../divider'
import { Heading } from '../heading'
import { type HeadingLevel, Section, type SectionProps } from '../section/section'
import { Text } from '../text'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export interface FooterProps extends Omit<SectionProps, 'as'> {
  columns?: FooterColumn[]
  /** Logo, wordmark and a line of copy. */
  brand?: ReactNode
  /** Rendered in the bottom bar. A plain string is wrapped in muted small text. */
  copyright?: ReactNode
  /** Social links or icon buttons, shown under the brand. */
  social?: ReactNode
  /** Accessible name for the link `nav`. Defaults to `"Footer"`. */
  navLabel?: string
  /** Level of the column titles. Defaults to `2`. */
  headingLevel?: HeadingLevel
}

/**
 * The site footer.
 *
 * A real `<footer>` — the `contentinfo` landmark — with the link columns inside a
 * single named `<nav>`. One named navigation region beats one per column: the
 * landmark list stays short, and each column still gets a heading above its list.
 *
 * The columns reflow on an auto-fit grid and the brand block sits beside them once
 * the footer itself is wide enough, so there are no breakpoint props to set.
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(function Footer(
  {
    columns = [],
    brand,
    copyright,
    social,
    navLabel = 'Footer',
    headingLevel = 2,
    background = 'muted',
    padding = 'lg',
    className,
    children,
    ...rest
  },
  ref,
) {
  const hasBrand = Boolean(brand || social)

  return (
    <Section
      ref={ref}
      as="footer"
      className={cx('vk-footer', className)}
      background={background}
      padding={padding}
      {...rest}
    >
      {children ?? (
        <>
          <div className="vk-footer__top">
            {hasBrand ? (
              <div className="vk-footer__brand">
                {brand}
                {social ? <div className="vk-footer__social">{social}</div> : null}
              </div>
            ) : null}
            {columns.length > 0 ? (
              <nav className="vk-footer__nav" aria-label={navLabel}>
                {columns.map((column) => (
                  <div className="vk-footer__column" key={column.title}>
                    <Heading level={headingLevel} size="sm" className="vk-footer__column-title">
                      {column.title}
                    </Heading>
                    <ul
                      // biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics from a list-style:none list; the role restores them.
                      role="list"
                      className="vk-footer__links"
                    >
                      {column.links.map((link) => (
                        <li key={link.href}>
                          <a className="vk-footer__link" href={link.href}>
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            ) : null}
          </div>
          {copyright ? (
            <>
              <Divider className="vk-footer__rule" />
              <div className="vk-footer__bottom">
                {typeof copyright === 'string' ? (
                  <Text size="sm" tone="muted">
                    {copyright}
                  </Text>
                ) : (
                  copyright
                )}
              </div>
            </>
          ) : null}
        </>
      )}
    </Section>
  )
})
