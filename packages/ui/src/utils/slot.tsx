import {
  Children,
  type CSSProperties,
  cloneElement,
  type ForwardedRef,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  version,
} from 'react'
import { cx } from './cx'

/**
 * `asChild` — render as the caller's element instead of ours.
 *
 * This is how the library stays router-agnostic with zero dependencies: a
 * `Navbar.Link` renders a plain `<a>` by default, and
 * `<Navbar.Link asChild><Link href="/x">X</Link></Navbar.Link>` hands our class names,
 * `aria-current`, `data-*` and ref to `next/link` (or React Router's `Link`, or an
 * `<a>` with an analytics wrapper) instead. No `LinkComponent` prop, no context, no
 * peer dependency on a router.
 *
 * Internal utility: deliberately NOT exported from `src/index.ts`, so it stays
 * refactorable.
 */

/** Anything a Slot can forward. A Slot is a pass-through, so the keys are open. */
export interface SlotProps {
  /**
   * Exactly one React element — or a mix of our own decoration and one `Slottable`
   * holding the caller's element. Anything else throws.
   */
  children?: ReactNode
  className?: string
  style?: CSSProperties
  [key: string]: unknown
}

export interface SlottableProps {
  children?: ReactNode
  /** Wrap the content in a `span` carrying this class, e.g. `vk-sidebar__label`. */
  wrapperClassName?: string
}

/**
 * Marks where the caller's content goes, so a part can decorate an `asChild` element
 * instead of being replaced by it.
 *
 * `Sidebar.Item` renders an icon, a label and a badge around its children. Without this,
 * `asChild` would have to choose between the caller's element and that decoration — so it
 * renders
 *
 * ```tsx
 * <Component>{icon}<Slottable wrapperClassName="vk-sidebar__label">{children}</Slottable>{badge}</Component>
 * ```
 *
 * which, plain, is exactly the markup it always was, and under a `Slot` becomes the
 * caller's `<a>` with that same icon/label/badge inside it. Must be a **direct** child of
 * the Slot — the search is deliberately shallow, so a `Slottable` nested inside another
 * component is not found.
 */
export function Slottable({ children, wrapperClassName }: SlottableProps) {
  if (wrapperClassName) return <span className={wrapperClassName}>{children}</span>
  return <>{children}</>
}

function isSlottable(node: ReactNode): node is ReactElement<SlottableProps> {
  return isValidElement(node) && node.type === Slottable
}

type AnyProps = Record<string, unknown>

/**
 * React 19 moved `ref` into `props`; React 18 keeps it on the element and React 19
 * logs an error if you read it there. Both halves of the peer range are supported, so
 * branch on the version once at module scope rather than probing both per render.
 */
const REACT_MAJOR = Number.parseInt(version, 10)

function readChildRef(element: ReactElement<AnyProps>): Ref<unknown> | undefined {
  if (REACT_MAJOR >= 19) return element.props.ref as Ref<unknown> | undefined
  return (element as unknown as { ref?: Ref<unknown> }).ref
}

/**
 * One callback ref that feeds several.
 *
 * Cleanup functions returned by React 19 callback refs are intentionally dropped: a
 * merged ref has no single cleanup to return, and `null` is passed on unmount anyway.
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): (node: T | null) => void {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as { current: T | null }).current = node
    }
  }
}

/**
 * Child props win, with three exceptions that compose instead of replacing:
 * `className` is concatenated, `style` is merged, and an `on*` handler present on both
 * sides is chained — the child's first, ours second — so a consumer's own `onClick`
 * is never swallowed and can still `preventDefault()` ours.
 */
function mergeProps(childProps: AnyProps, slotProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...slotProps }

  for (const key of Object.keys(childProps)) {
    // `children` is the child's own subtree and `ref` is handled separately.
    if (key === 'children' || key === 'ref') continue

    const childValue = childProps[key]
    const slotValue = slotProps[key]

    if (key === 'className') {
      merged[key] = cx(slotValue as string | undefined, childValue as string | undefined)
    } else if (key === 'style') {
      merged[key] = { ...(slotValue as CSSProperties), ...(childValue as CSSProperties) }
    } else if (
      typeof childValue === 'function' &&
      typeof slotValue === 'function' &&
      key.length > 2 &&
      key.startsWith('on') &&
      key[2] === key[2]?.toUpperCase()
    ) {
      const childHandler = childValue as (...args: unknown[]) => void
      const slotHandler = slotValue as (...args: unknown[]) => void
      merged[key] = (...args: unknown[]) => {
        childHandler(...args)
        slotHandler(...args)
      }
    } else if (childValue !== undefined) {
      merged[key] = childValue
    }
  }

  return merged
}

/**
 * Merges its own props, `className`, `style` and `ref` onto its single element child
 * and renders that child in its place.
 *
 * ```tsx
 * const Component = asChild ? Slot : 'a'
 * return <Component ref={ref} className="vk-navbar__link" {...rest}>{children}</Component>
 * ```
 */
export const Slot = forwardRef<unknown, SlotProps>(function Slot(
  { children, ...slotProps },
  forwardedRef: ForwardedRef<unknown>,
) {
  // The cast is forced by SlotProps' index signature: `[key: string]: unknown` widens
  // every destructured member, `children` included.
  const nodes = Children.toArray(children as ReactNode)
  const slottable = nodes.find(isSlottable)

  if (slottable) {
    const target = slottable.props.children
    if (!isValidElement(target)) {
      throw new Error('Slot expects a single React element inside its Slottable (asChild).')
    }
    const element = target as ReactElement<AnyProps>
    /*
     * Swap the Slottable for a copy of itself holding the caller's own children. Our
     * decoration keeps its position and its wrapper, the caller's element becomes the box
     * around all of it, and no part has to know which of the two modes it is in.
     */
    const decorated = nodes.map((node) =>
      node === slottable
        ? cloneElement(slottable, undefined, element.props.children as ReactNode)
        : node,
    )
    return clone(element, slotProps as AnyProps, forwardedRef, decorated)
  }

  // Throws a clear message for zero children, several children, or a string — all of
  // which would otherwise fail later as a silent render of nothing.
  const only = Children.only(children as ReactNode)
  if (!isValidElement(only)) {
    throw new Error('Slot expects a single React element child (asChild).')
  }
  return clone(only as ReactElement<AnyProps>, slotProps as AnyProps, forwardedRef)
})

function clone(
  element: ReactElement<AnyProps>,
  slotProps: AnyProps,
  forwardedRef: ForwardedRef<unknown>,
  children?: ReactNode[],
) {
  const props = {
    ...mergeProps(element.props, slotProps),
    ref: mergeRefs(forwardedRef as Ref<unknown>, readChildRef(element)),
  }
  // `mergeProps` never copies `children`, so the third argument is the only thing that
  // can replace the child's own subtree — and it is only passed when we decorated it.
  if (children === undefined) return cloneElement(element, props)
  return cloneElement(element, props, ...children)
}
