import { forwardRef, type HTMLAttributes, type ImgHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Image URL. When absent (or it fails to load) the fallback shows instead. */
  src?: string
  /** Describes the person. Also seeds the initials fallback. */
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  /** Overrides the derived initials. */
  fallback?: string
  imgProps?: ImgHTMLAttributes<HTMLImageElement>
}

/** Derive up to two initials: "Vivek Kumar Singh" -> "VS". */
function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return (parts[0] as string).slice(0, 2).toUpperCase()
  const first = parts[0] as string
  const last = parts[parts.length - 1] as string
  return (first[0] ?? '').concat(last[0] ?? '').toUpperCase()
}

const AvatarRoot = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, name, size = 'md', shape = 'circle', fallback, imgProps, className, ...rest },
  ref,
) {
  // Two explicit branches rather than a conditional role: with an image the <img>
  // carries the accessible name via alt, so the wrapper stays silent. Without one,
  // the wrapper itself becomes the labelled image and the initials are decorative.
  if (src) {
    return (
      <span
        ref={ref}
        className={cx('vk-avatar', className)}
        data-size={size}
        data-shape={shape}
        {...rest}
      >
        <img className="vk-avatar__image" src={src} alt={name ?? ''} {...imgProps} />
      </span>
    )
  }

  return (
    <span
      ref={ref}
      className={cx('vk-avatar', className)}
      data-size={size}
      data-shape={shape}
      role="img"
      aria-label={name}
      {...rest}
    >
      <span className="vk-avatar__fallback" aria-hidden="true">
        {fallback ?? (name ? initialsFrom(name) : '')}
      </span>
    </span>
  )
})

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Overlap amount. Defaults to `md`. */
  spacing?: 'sm' | 'md' | 'lg'
}

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { spacing = 'md', className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('vk-avatar-group', className)} data-spacing={spacing} {...rest} />
  )
})

/** Compound component: `Avatar` and `Avatar.Group`. */
export const Avatar = Object.assign(AvatarRoot, { Group: AvatarGroup })
