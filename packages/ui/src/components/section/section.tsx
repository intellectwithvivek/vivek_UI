import { type ElementType, forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Badge } from '../badge'
import { Container, type ContainerProps } from '../container'
import { Heading, type HeadingProps } from '../heading'
import { Text } from '../text'

/** Semantic heading level, shared by every page section. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Landmark element. Defaults to `section`. Use `footer`/`header`/`aside` where correct. */
  as?: ElementType
  /** Vertical rhythm. Defaults to `lg`. */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Surface. `primary` re-points `--vk-color-bg`/`-fg`/`-muted`/`-border` for the whole
   * subtree, so nested primitives stay legible without a single extra prop.
   */
  background?: 'default' | 'muted' | 'primary'
  align?: 'start' | 'center' | 'end'
  /** Max width of the inner Container. Defaults to `lg`. */
  size?: ContainerProps['size']
  /** Drop the inner Container and let children run edge-to-edge. */
  bleed?: boolean
}

/**
 * The wrapper every page section is built on: a landmark element, vertical rhythm,
 * a surface, and a centred Container — nothing else. It owns no layout of its own,
 * which is why `Hero`, `Pricing`, `FAQ` and friends can all be `Section` plus content.
 *
 * Server-safe: no state, no effects, no event handlers.
 */
const SectionRoot = forwardRef<HTMLElement, SectionProps>(function Section(
  {
    as: Component = 'section',
    padding = 'lg',
    background = 'default',
    align,
    size = 'lg',
    bleed,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cx('vk-section', className)}
      data-padding={padding}
      data-background={background}
      data-align={align}
      {...rest}
    >
      {bleed ? (
        children
      ) : (
        <Container size={size} className="vk-section__inner">
          {children}
        </Container>
      )}
    </Component>
  )
})

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** A plain string becomes a pill `Badge`; a node is rendered as given. */
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  /** Level of `title`. Defaults to `2`. */
  headingLevel?: HeadingLevel
  /** Visual size of `title`, independent of `headingLevel`. */
  titleSize?: HeadingProps['size']
  /** Overrides the parent Section's alignment. */
  align?: 'start' | 'center' | 'end'
}

/** Eyebrow + heading + lead paragraph. Every section that has a title reuses this. */
const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  { eyebrow, title, description, headingLevel = 2, titleSize, align, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('vk-section__header', className)} data-align={align} {...rest}>
      {eyebrow ? (
        <div className="vk-section__eyebrow">
          {typeof eyebrow === 'string' ? <Badge pill>{eyebrow}</Badge> : eyebrow}
        </div>
      ) : null}
      {title ? (
        <Heading level={headingLevel} size={titleSize} className="vk-section__title">
          {title}
        </Heading>
      ) : null}
      {description ? (
        <Text as={proseTag(description)} size="lg" tone="muted" className="vk-section__description">
          {description}
        </Text>
      ) : null}
      {children}
    </div>
  )
})

/** Compound component: `Section` and `Section.Header`. */
export const Section = Object.assign(SectionRoot, { Header: SectionHeader })

/*
 * ---------------------------------------------------------------------------
 * Internal helpers shared by the section components.
 *
 * Exported from this module but deliberately NOT from `./index`, so they never
 * become public API and stay refactorable (CLAUDE.md, Conventions).
 * ---------------------------------------------------------------------------
 */

/** One level down, clamped at 6. Keeps a section's item headings under its own title. */
export function nextHeadingLevel(level: HeadingLevel): HeadingLevel {
  return (level < 6 ? level + 1 : 6) as HeadingLevel
}

/**
 * `p` for a plain string, `div` for anything richer.
 *
 * A caller-supplied node may well contain its own block elements, and `<p><div>`
 * is invalid HTML that the browser silently re-parents — which breaks the layout.
 */
export function proseTag(node: ReactNode): 'p' | 'div' {
  return typeof node === 'string' ? 'p' : 'div'
}

/**
 * The accessible name for a section's landmark element, or `undefined`.
 *
 * A bare `<section>` only counts as a `region` landmark once it has a name. When
 * the caller's title is a plain string we can name the landmark from it with no id
 * plumbing — which matters, because minting ids would need `useId`, and hooks are
 * not available in a React Server Component. A caller-supplied `aria-label` always
 * wins, and an `aria-labelledby` suppresses the derived label rather than fighting it.
 */
export function landmarkName(
  title: ReactNode,
  attrs: { 'aria-label'?: string | undefined; 'aria-labelledby'?: string | undefined },
): string | undefined {
  if (attrs['aria-label']) return attrs['aria-label']
  if (attrs['aria-labelledby']) return undefined
  return typeof title === 'string' && title.trim() !== '' ? title : undefined
}
