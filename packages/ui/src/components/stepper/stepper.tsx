'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { cx } from '../../utils/cx'

export type StepperOrientation = 'horizontal' | 'vertical'
export type StepStatus = 'complete' | 'current' | 'pending'

export interface Step {
  label: string
  description?: string
  /** Replaces the number (or the tick) inside the marker. Decorative. */
  icon?: ReactNode
  disabled?: boolean
}

/** The announced status words. Text, so status never rests on colour alone. */
const STATUS_LABEL: Record<StepStatus, string> = {
  complete: 'Completed',
  current: 'Current step',
  pending: 'Not started',
}

export interface StepperProps extends HTMLAttributes<HTMLElement> {
  /** A bare string is shorthand for `{ label }`. */
  steps?: readonly (Step | string)[]
  /** Controlled index. Pair with `onStepChange`. */
  activeStep?: number
  /** Initial index while uncontrolled. Defaults to `0`. */
  defaultActiveStep?: number
  orientation?: StepperOrientation
  /** Called with the index the user asked for, in both controlled and uncontrolled mode. */
  onStepChange?: (index: number) => void
  /** Render each step as a button. Without this the stepper is a read-only indicator. */
  clickable?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Accessible name of the navigation landmark. Defaults to `'Progress'`. */
  label?: string
  /** Override the announced status words, e.g. for another language. */
  statusLabels?: Partial<Record<StepStatus, string>>
}

function normalise(step: Step | string): Step {
  return typeof step === 'string' ? { label: step } : step
}

/**
 * Where the user is in a multi-step flow.
 *
 * An ordered list inside a `nav` landmark, so "step 2 of 5" is structure rather than
 * decoration, and the current step carries `aria-current="step"` — the one attribute a
 * screen reader user needs to answer "where am I?".
 *
 * State is conveyed three ways, never by colour alone (WCAG 1.4.1): the marker's fill,
 * the glyph inside it (a tick for done, the step number otherwise), and a visually hidden
 * word after the label. `clickable` swaps the inert `span` for a real `button`, so the
 * read-only form contributes nothing to the tab order.
 */
export const Stepper = forwardRef<HTMLElement, StepperProps>(function Stepper(
  {
    steps = [],
    activeStep,
    defaultActiveStep = 0,
    orientation = 'horizontal',
    onStepChange,
    clickable,
    size = 'md',
    label = 'Progress',
    statusLabels,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [active, setActive] = useControllableState<number>({
    value: activeStep,
    defaultValue: defaultActiveStep,
    onChange: onStepChange,
  })

  return (
    <nav
      ref={ref}
      className={cx('vk-stepper', className)}
      aria-label={label}
      data-orientation={orientation}
      data-size={size}
      {...rest}
    >
      <ol className="vk-stepper__list">
        {steps.map((raw, index) => {
          const step = normalise(raw)
          const status: StepStatus =
            index < active ? 'complete' : index === active ? 'current' : 'pending'
          const marker = step.icon ?? (status === 'complete' ? '✓' : index + 1)
          const body = (
            <>
              <span className="vk-stepper__marker" aria-hidden="true">
                {marker}
              </span>
              <span className="vk-stepper__text">
                <span className="vk-stepper__label">{step.label}</span>
                <span className="vk-stepper__status">
                  {statusLabels?.[status] ?? STATUS_LABEL[status]}
                </span>
                {step.description ? (
                  <span className="vk-stepper__description">{step.description}</span>
                ) : null}
              </span>
            </>
          )

          return (
            <li className="vk-stepper__item" data-status={status} key={step.label}>
              {clickable ? (
                <button
                  type="button"
                  className="vk-stepper__control"
                  aria-current={status === 'current' ? 'step' : undefined}
                  disabled={step.disabled}
                  onClick={() => setActive(index)}
                >
                  {body}
                </button>
              ) : (
                <span
                  className="vk-stepper__control"
                  aria-current={status === 'current' ? 'step' : undefined}
                  aria-disabled={step.disabled || undefined}
                >
                  {body}
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {children}
    </nav>
  )
})
