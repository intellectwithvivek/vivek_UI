import { type ButtonHTMLAttributes, forwardRef, type Ref } from 'react'
import { cx } from '../../utils/cx'
import { Slot, Slottable } from '../../utils/slot'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  /**
   * Render the caller's element instead of a `<button>`, keeping every style and data
   * attribute.
   *
   * This is how a button navigates without the library depending on a router:
   *
   * ```tsx
   * <Button asChild><Link href="/pricing">Pricing</Link></Button>
   * ```
   *
   * A link that looks like a button must be an `<a>`, not a `<button>` with an onClick —
   * otherwise middle-click, cmd-click, "open in new tab" and "copy link address" all
   * break, and a screen reader announces the wrong role.
   *
   * `loading` and `disabled` are ignored when `asChild` is set: `disabled` is not a valid
   * attribute on an anchor, and a spinner inside someone else's element would fight their
   * children. Use a real `<button>` for anything with a pending state.
   */
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    size = 'md',
    fullWidth,
    loading,
    asChild,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  const shared = {
    className: cx('vk-button', className),
    'data-variant': variant,
    'data-size': size,
    'data-full-width': fullWidth || undefined,
  }

  if (asChild) {
    // `ref` is only spread when there is one. React forbids a `ref` prop in a Server
    // Component, and it counts passing `ref={undefined}` as passing one — so an
    // unconditional `ref={ref}` here fails the Next.js prerender with "Refs cannot be
    // used in Server Components" even though nothing is actually using a ref.
    //
    // `Button` is server-safe, which makes it the first component where `asChild` meets
    // a Server Component at all: Navbar, Sidebar and Breadcrumb are all client
    // components, so their own `asChild` never hits this.
    const refProp = ref ? { ref: ref as Ref<unknown> } : {}
    return (
      <Slot {...refProp} {...shared} {...rest}>
        <Slottable>{children}</Slottable>
      </Slot>
    )
  }

  return (
    <button
      ref={ref}
      {...shared}
      data-loading={loading || undefined}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="vk-button__spinner" aria-hidden="true" />}
      {children}
    </button>
  )
})
