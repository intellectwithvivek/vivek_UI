'use client'

import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
// The same 1–6 union every section-level component already uses; deliberately not
// re-declared here, and not re-exported, so there is one `HeadingLevel` in the package.
import type { HeadingLevel } from '../section/section'

/** Shared empty state, so an uncontrolled accordion does not churn array identity. */
const NO_VALUES: readonly string[] = []

interface AccordionContextValue {
  baseId: string
  values: readonly string[]
  toggle: (value: string) => void
  headingLevel: HeadingLevel
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

interface AccordionItemContextValue {
  value: string
  open: boolean
  disabled: boolean
  triggerId: string
  contentId: string
  headingLevel: HeadingLevel
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null)

function useAccordionContext(part: string): AccordionContextValue {
  const context = useContext(AccordionContext)
  if (!context) throw new Error(`<Accordion.${part}> must be rendered inside <Accordion>`)
  return context
}

function useAccordionItemContext(part: string): AccordionItemContextValue {
  const context = useContext(AccordionItemContext)
  if (!context) throw new Error(`<Accordion.${part}> must be rendered inside <Accordion.Item>`)
  return context
}

/** Values are author-supplied strings; ids are not, so strip anything an id cannot hold. */
function slug(value: string): string {
  return value.replace(/[^\w-]+/g, '-')
}

interface AccordionSingleProps {
  /** One item open at a time. The default. */
  type?: 'single'
  /** Controlled: the open item's value, or `null` for none. */
  value?: string | null
  /** Uncontrolled initial open item. */
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  /**
   * Whether clicking the open item closes it, leaving nothing open. Default `false` —
   * an accordion that can empty itself is a choice, not an accident.
   */
  collapsible?: boolean
}

interface AccordionMultipleProps {
  /** Any number of items open at once. */
  type: 'multiple'
  /** Controlled: the values of every open item. */
  value?: string[]
  /** Uncontrolled initial open items. */
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Meaningless here: every item is always closable in `multiple` mode. */
  collapsible?: never
}

interface AccordionBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /**
   * Heading level for every trigger, `1`–`6`. Default `3`. There is no correct universal
   * default — it depends entirely on what is above the accordion on the page — so set it
   * to whatever keeps the document outline gap-free.
   */
  headingLevel?: HeadingLevel
  variant?: AccordionVariant
  size?: AccordionSize
}

export type AccordionVariant = 'separated' | 'contained' | 'plain'
export type AccordionSize = 'sm' | 'md' | 'lg'

/**
 * Discriminated on `type`, so `single` gets a `string | null` value and `multiple` gets a
 * `string[]` — instead of one union type that forces every consumer to narrow by hand.
 */
export type AccordionProps = AccordionBaseProps & (AccordionSingleProps | AccordionMultipleProps)

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Identifies the item in `value` / `defaultValue` / `onValueChange`. */
  value: string
  /** Disables this item's trigger. */
  disabled?: boolean
  /** Overrides the accordion's `headingLevel` for this item only. */
  headingLevel?: HeadingLevel
}

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {}

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(props, ref) {
  const {
    type: _type,
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    collapsible: _collapsible,
    headingLevel = 3,
    variant = 'separated',
    size = 'md',
    id,
    className,
    ...rest
  } = props

  // `props` is still the discriminated union here, so both branches are fully typed:
  // no cast, and `onValueChange` cannot be called with the wrong shape.
  const spec =
    props.type === 'multiple'
      ? {
          multiple: true,
          controlled: props.value,
          initial: props.defaultValue ?? NO_VALUES,
          collapsible: true,
          emit: (next: readonly string[]) => props.onValueChange?.([...next]),
        }
      : {
          multiple: false,
          controlled:
            props.value === undefined
              ? undefined
              : props.value === null
                ? NO_VALUES
                : [props.value],
          initial: props.defaultValue == null ? NO_VALUES : [props.defaultValue],
          collapsible: props.collapsible ?? false,
          emit: (next: readonly string[]) => props.onValueChange?.(next[0] ?? null),
        }

  const baseId = useIsomorphicId(id)
  const { multiple, collapsible } = spec
  const [values, setValues] = useControllableState<readonly string[]>({
    value: spec.controlled,
    defaultValue: spec.initial,
    // Stored in a ref by the hook, so this fresh closure is the one that runs.
    onChange: spec.emit,
  })

  const toggle = useCallback(
    (itemValue: string) => {
      const isOpen = values.includes(itemValue)
      if (multiple) {
        setValues(isOpen ? values.filter((v) => v !== itemValue) : [...values, itemValue])
        return
      }
      if (!isOpen) {
        setValues([itemValue])
        return
      }
      // Single + not collapsible: the click is a no-op, and reporting a "change" that
      // did not happen would be worse than silence.
      if (collapsible) setValues(NO_VALUES)
    },
    [values, multiple, collapsible, setValues],
  )

  const context = useMemo<AccordionContextValue>(
    () => ({ baseId, values, toggle, headingLevel }),
    [baseId, values, toggle, headingLevel],
  )

  return (
    <AccordionContext.Provider value={context}>
      <div
        ref={ref}
        id={id}
        className={cx('vk-accordion', className)}
        data-variant={variant}
        data-size={size}
        data-type={multiple ? 'multiple' : 'single'}
        {...rest}
      />
    </AccordionContext.Provider>
  )
})

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, disabled = false, headingLevel, className, ...rest },
  ref,
) {
  const accordion = useAccordionContext('Item')
  const open = accordion.values.includes(value)
  const slugged = slug(value)

  const context = useMemo<AccordionItemContextValue>(
    () => ({
      value,
      open,
      disabled,
      triggerId: `${accordion.baseId}-trigger-${slugged}`,
      contentId: `${accordion.baseId}-content-${slugged}`,
      headingLevel: headingLevel ?? accordion.headingLevel,
    }),
    [value, open, disabled, accordion.baseId, slugged, headingLevel, accordion.headingLevel],
  )

  return (
    <AccordionItemContext.Provider value={context}>
      <div
        ref={ref}
        className={cx('vk-accordion__item', className)}
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled || undefined}
        {...rest}
      />
    </AccordionItemContext.Provider>
  )
})

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger({ className, onClick, ...rest }, ref) {
    const { toggle } = useAccordionContext('Trigger')
    const { value, open, disabled, triggerId, contentId, headingLevel } =
      useAccordionItemContext('Trigger')
    // A real heading around a real button: the two things a screen reader's heading list
    // and Enter/Space handling both depend on. The level is a prop precisely so this
    // never hardcodes an outline it cannot know.
    const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

    return (
      <Heading className="vk-accordion__heading" data-state={open ? 'open' : 'closed'}>
        <button
          ref={ref}
          type="button"
          id={triggerId}
          className={cx('vk-accordion__trigger', className)}
          aria-expanded={open}
          aria-controls={contentId}
          disabled={disabled}
          data-state={open ? 'open' : 'closed'}
          data-disabled={disabled || undefined}
          onClick={(event) => {
            onClick?.(event)
            // Enter and Space reach this as clicks — native `<button>` behaviour, so
            // there is no key handling here and nothing to keep in sync with it.
            if (!event.defaultPrevented) toggle(value)
          }}
          {...rest}
        />
      </Heading>
    )
  },
)

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ className, ...rest }, ref) {
    const { open, triggerId, contentId } = useAccordionItemContext('Content')

    return (
      <div
        ref={ref}
        role="region"
        id={contentId}
        aria-labelledby={triggerId}
        className={cx('vk-accordion__content', className)}
        // `hidden`, not a class: a closed panel must be gone from the accessibility tree
        // and out of the tab order. It stays mounted so `aria-controls` always resolves.
        hidden={!open}
        data-state={open ? 'open' : 'closed'}
        {...rest}
      />
    )
  },
)

/**
 * Accordion — `Accordion`, `Accordion.Item`, `Accordion.Trigger`, `Accordion.Content`.
 *
 * ```tsx
 * <Accordion type="multiple" defaultValue={['shipping']} headingLevel={2}>
 *   <Accordion.Item value="shipping">
 *     <Accordion.Trigger>Shipping</Accordion.Trigger>
 *     <Accordion.Content>Two to four days.</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion>
 * ```
 *
 * For a static, zero-JavaScript disclosure list, `FAQ` (native `<details>`) is the better
 * tool. This exists for the cases that need controlled state — one open item at a time,
 * a URL-driven selection, or open/close reported to the app.
 */
export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
})

/* Named part exports.
 *
 * Accordion is a client component, so a Server Component receives it as a client
 * reference and `Accordion.Part` reads `undefined` off that reference. These named
 * exports are the server-usable form; the dot access still works in client components.
 */
export { AccordionContent, AccordionItem, AccordionTrigger }
