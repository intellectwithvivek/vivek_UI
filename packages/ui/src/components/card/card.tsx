import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'outline' | 'elevated' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Lift on hover. Only set this when the whole card is clickable. */
  interactive?: boolean
}

interface CardSlotProps extends HTMLAttributes<HTMLDivElement> {}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'outline', padding = 'md', interactive, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('vk-card', className)}
      data-variant={variant}
      data-padding={padding}
      data-interactive={interactive || undefined}
      {...rest}
    />
  )
})

const CardHeader = forwardRef<HTMLDivElement, CardSlotProps>(function CardHeader(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx('vk-card__header', className)} {...rest} />
})

const CardBody = forwardRef<HTMLDivElement, CardSlotProps>(function CardBody(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx('vk-card__body', className)} {...rest} />
})

const CardFooter = forwardRef<HTMLDivElement, CardSlotProps>(function CardFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx('vk-card__footer', className)} {...rest} />
})

/** Compound component: `Card`, `Card.Header`, `Card.Body`, `Card.Footer`. */
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
})

export type { CardSlotProps }
