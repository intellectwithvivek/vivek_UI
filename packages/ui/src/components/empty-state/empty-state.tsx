import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Heading, type HeadingProps } from '../heading'
import { type HeadingLevel, proseTag } from '../section/section'
import { Text } from '../text'

export type EmptyStateSize = 'sm' | 'md' | 'lg'

/** Visual weight of the title follows the block's size, not the document outline. */
const TITLE_SIZE: Record<EmptyStateSize, NonNullable<HeadingProps['size']>> = {
  sm: 'md',
  md: 'lg',
  lg: 'xl',
}

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Decorative glyph or illustration. Hidden from assistive technology. */
  icon?: ReactNode
  title?: ReactNode
  description?: ReactNode
  /** Usually one or two `Button`s. The way out of the empty state. */
  actions?: ReactNode
  size?: EmptyStateSize
  /** Level of `title`, so the block does not break the page outline. Defaults to `3`. */
  headingLevel?: HeadingLevel
}

/**
 * The "nothing here yet" block: a glyph, a line explaining what is missing, and the
 * action that fixes it.
 *
 * Server-safe: no state, no effects, no event handlers.
 *
 * The icon is `aria-hidden` because it never carries information the title does not
 * already carry — an empty inbox drawing announced as "envelope" is noise. The heading
 * defaults to level 3 rather than 2: an empty state almost always lives inside a card or
 * a panel that already has a title of its own.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  {
    icon,
    title,
    description,
    actions,
    size = 'md',
    headingLevel = 3,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <div ref={ref} className={cx('vk-empty-state', className)} data-size={size} {...rest}>
      {icon ? (
        <div className="vk-empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      {title ? (
        <Heading level={headingLevel} size={TITLE_SIZE[size]} className="vk-empty-state__title">
          {title}
        </Heading>
      ) : null}
      {description ? (
        <Text as={proseTag(description)} tone="muted" className="vk-empty-state__description">
          {description}
        </Text>
      ) : null}
      {children}
      {actions ? <div className="vk-empty-state__actions">{actions}</div> : null}
    </div>
  )
})
