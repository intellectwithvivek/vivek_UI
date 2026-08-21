'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'

/** A rendered slot: a page number, or a gap standing in for the pages we skipped. */
type PageSlot = number | 'gap-start' | 'gap-end'

/** Overridable strings, so the control can be localised without forking it. */
export interface PaginationLabels {
  /** Accessible name for the `nav`. */
  root: string
  first: string
  previous: string
  next: string
  last: string
  /** Given a page number, returns that button's accessible name. */
  page: (page: number) => string
}

const DEFAULT_LABELS: PaginationLabels = {
  root: 'Pagination',
  first: 'First page',
  previous: 'Previous page',
  next: 'Next page',
  last: 'Last page',
  page: (page) => `Page ${page}`,
}

/**
 * The visible window of page numbers.
 *
 * Constant width by construction: the control shows `siblingCount * 2 + 5` slots — first,
 * last, the current page, its siblings, and two gaps — and when the window sits against
 * an edge the gap that is no longer needed is spent on one more page number instead. So
 * the control does not resize as you walk through it, which is the bug that makes
 * hand-rolled pagination jump under the cursor.
 */
function buildSlots(page: number, pageCount: number, siblingCount: number): PageSlot[] {
  if (pageCount <= 0) return []
  if (pageCount <= siblingCount * 2 + 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const last = pageCount
  const span = siblingCount * 2 + 1
  let start = Math.max(2, page - siblingCount)
  let end = Math.min(last - 1, page + siblingCount)

  if (start <= 2) {
    start = 2
    end = Math.min(last - 1, span + 2)
  } else if (end >= last - 1) {
    end = last - 1
    start = Math.max(2, last - span - 1)
  }

  const slots: PageSlot[] = [1]
  if (start > 2) slots.push('gap-start')
  for (let index = start; index <= end; index += 1) slots.push(index)
  if (end < last - 1) slots.push('gap-end')
  slots.push(last)
  return slots
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** 1-based current page. Clamped into `[1, pageCount]`. Default `1`. */
  page?: number
  /** Total number of pages. `0` renders nothing; `1` renders a single, inert page. */
  pageCount?: number
  /** Called with the 1-based page the user asked for. Never called with the current page. */
  onPageChange?: (page: number) => void
  /** Pages shown either side of the current one. Default `1`. */
  siblingCount?: number
  /** Add "first" and "last" jump buttons outside prev/next. Default `false`. */
  showFirstLast?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Localised strings. Merged over the English defaults. */
  labels?: Partial<PaginationLabels>
  /** Glyph for the gap. Always decorative. Default `…`. */
  ellipsis?: ReactNode
}

/** Which way a step button points. Also the value of its `data-direction`. */
type StepDirection = 'start' | 'end' | 'first' | 'last'

const CHEVRON_PATHS: Record<StepDirection, string> = {
  start: 'M12 5l-5 5 5 5',
  end: 'M8 5l5 5-5 5',
  first: 'M13 5l-5 5 5 5M6 5v10',
  last: 'M7 5l5 5-5 5M14 5v10',
}

function Chevron({ direction }: { direction: StepDirection }) {
  return (
    <svg
      className="vk-pagination__chevron"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={CHEVRON_PATHS[direction]} />
    </svg>
  )
}

/**
 * Page-by-page navigation.
 *
 * A named `<nav>` around a list of pages. The current page carries `aria-current="page"`
 * and is not clickable; the gaps are `aria-hidden`, because "ellipsis" is not a
 * destination; and prev/next/first/last are icon-only buttons that still have real
 * accessible names, which is the failure this component exists to prevent.
 *
 * Fully controlled — it holds no state. `page` outside `[1, pageCount]` is clamped rather
 * than trusted, `pageCount` of `1` renders one inert page, and `pageCount` of `0` renders
 * `null`: there is nothing to navigate.
 *
 * ```tsx
 * <Pagination page={page} pageCount={12} onPageChange={setPage} showFirstLast />
 * ```
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page = 1,
    pageCount = 1,
    onPageChange,
    siblingCount = 1,
    showFirstLast = false,
    size = 'md',
    labels,
    ellipsis = '…',
    className,
    ...rest
  },
  ref,
) {
  const total = Math.max(0, Math.floor(pageCount))
  if (total === 0) return null

  const text = { ...DEFAULT_LABELS, ...labels }
  const current = clamp(Math.floor(page), 1, total)
  const siblings = Math.max(0, Math.floor(siblingCount))
  const slots = buildSlots(current, total, siblings)

  const go = (target: number) => {
    const next = clamp(target, 1, total)
    if (next !== current) onPageChange?.(next)
  }

  const step = (
    key: string,
    label: string,
    target: number,
    disabled: boolean,
    direction: StepDirection,
  ) => (
    <li className="vk-pagination__item" key={key}>
      <button
        type="button"
        className="vk-pagination__step"
        data-direction={direction}
        aria-label={label}
        disabled={disabled}
        onClick={() => go(target)}
      >
        <Chevron direction={direction} />
      </button>
    </li>
  )

  return (
    <nav
      ref={ref}
      className={cx('vk-pagination', className)}
      aria-label={text.root}
      data-size={size}
      {...rest}
    >
      <ul
        // biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics from a list-style:none list; the role restores them.
        role="list"
        className="vk-pagination__list"
      >
        {showFirstLast ? step('first', text.first, 1, current === 1, 'first') : null}
        {step('previous', text.previous, current - 1, current === 1, 'start')}

        {slots.map((slot) =>
          typeof slot === 'number' ? (
            <li className="vk-pagination__item" key={slot}>
              <button
                type="button"
                className="vk-pagination__page"
                aria-label={text.page(slot)}
                aria-current={slot === current ? 'page' : undefined}
                data-current={slot === current || undefined}
                onClick={() => go(slot)}
              >
                {slot}
              </button>
            </li>
          ) : (
            /* Punctuation, not a destination: out of the accessibility tree entirely. */
            <li className="vk-pagination__ellipsis" aria-hidden="true" key={slot}>
              {ellipsis}
            </li>
          ),
        )}

        {step('next', text.next, current + 1, current === total, 'end')}
        {showFirstLast ? step('last', text.last, total, current === total, 'last') : null}
      </ul>
    </nav>
  )
})
