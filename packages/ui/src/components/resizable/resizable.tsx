'use client'

import {
  Children,
  type CSSProperties,
  createContext,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'

export type ResizableOrientation = 'horizontal' | 'vertical'

export interface ResizablePanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Smallest share, in percent. Default `10`. */
  minSize?: number
  /** Largest share, in percent. Default `90`. */
  maxSize?: number
}

export interface ResizableHandleProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible name. Default `'Resize panels'`. */
  label?: string
}

export interface ResizableProps extends HTMLAttributes<HTMLDivElement> {
  /** `horizontal` lays panels side by side (the default); `vertical` stacks them. */
  orientation?: ResizableOrientation
  /** Controlled panel shares, in percent. Normalised to sum to 100. */
  sizes?: number[]
  /** Initial shares. Default: an equal split. */
  defaultSizes?: number[]
  onSizesChange?: (sizes: number[]) => void
  /** Percent moved per arrow key. Shift multiplies by five. Default `2`. */
  step?: number
  /** Persist the layout in `localStorage` under this key. */
  storageKey?: string
  children?: ReactNode
}

interface PanelMeta {
  min: number
  max: number
}

interface ResizableContextValue {
  orientation: ResizableOrientation
  sizes: number[]
  panels: PanelMeta[]
  panelIds: string[]
  step: number
  rootRef: { readonly current: HTMLDivElement | null }
  resizePair: (index: number, deltaPercent: number) => void
  setPair: (index: number, previousSize: number) => void
  resetPair: (index: number) => void
}

const ResizableContext = createContext<ResizableContextValue | null>(null)
const IndexContext = createContext<number>(-1)

function useResizable(part: string): ResizableContextValue {
  const ctx = useContext(ResizableContext)
  if (!ctx) throw new Error(`${part} must be rendered inside <Resizable>.`)
  return ctx
}

function normalise(sizes: number[], count: number): number[] {
  if (count === 0) return []
  const picked = sizes.slice(0, count)
  while (picked.length < count) picked.push(0)
  const total = picked.reduce((sum, n) => sum + Math.max(0, n), 0)
  if (total <= 0) return new Array<number>(count).fill(100 / count)
  return picked.map((n) => (Math.max(0, n) / total) * 100)
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

function readStored(key: string, count: number): number[] | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length !== count) return null
    if (!parsed.every((n) => typeof n === 'number' && Number.isFinite(n))) return null
    return normalise(parsed as number[], count)
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------------ root */

function ResizableRoot(
  {
    orientation = 'horizontal',
    sizes: sizesProp,
    defaultSizes,
    onSizesChange,
    step = 2,
    storageKey,
    className,
    style,
    children,
    ...rest
  }: ResizableProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )
  const baseId = useIsomorphicId()

  // Panels and handles, in order. Panels learn their index through context; handles sit
  // between panel i and i + 1.
  const { nodes, panels } = useMemo(() => {
    const metas: PanelMeta[] = []
    let panelIndex = 0
    const out = Children.toArray(children).map((child) => {
      if (!isValidElement(child)) return child
      const element = child as ReactElement<ResizablePanelProps>
      if (element.type === ResizablePanel) {
        const index = panelIndex
        panelIndex += 1
        metas.push({
          min: clamp(element.props.minSize ?? 10, 0, 100),
          max: clamp(element.props.maxSize ?? 90, 0, 100),
        })
        return (
          <IndexContext.Provider key={element.key ?? `panel-${index}`} value={index}>
            {element}
          </IndexContext.Provider>
        )
      }
      if (element.type === ResizableHandle) {
        return (
          <IndexContext.Provider key={element.key ?? `handle-${panelIndex}`} value={panelIndex - 1}>
            {element}
          </IndexContext.Provider>
        )
      }
      return child
    })
    return { nodes: out, panels: metas }
  }, [children])
  const count = panels.length

  const [sizes, setSizes] = useControllableState<number[]>({
    value: sizesProp ? normalise(sizesProp, count) : undefined,
    defaultValue: normalise(defaultSizes ?? [], count),
    onChange: onSizesChange,
  })
  const current = sizes.length === count ? sizes : normalise(sizes, count)
  const defaults = useMemo(() => normalise(defaultSizes ?? [], count), [defaultSizes, count])

  // Persistence: read once after mount (server-safe), write on every change.
  const restored = useRef(false)
  useEffect(() => {
    if (!storageKey || restored.current || typeof window === 'undefined') return
    restored.current = true
    const stored = readStored(storageKey, count)
    if (stored) setSizes(stored)
  }, [storageKey, count, setSizes])
  useEffect(() => {
    if (!storageKey || !restored.current || typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(current.map((n) => Math.round(n * 100) / 100)),
      )
    } catch {
      // Storage full or forbidden: the layout simply is not remembered.
    }
  }, [storageKey, current])

  /** Move the boundary between panel `index` and `index + 1` by `delta` percent. */
  const setPair = useCallback(
    (index: number, previousSize: number) => {
      const a = panels[index]
      const b = panels[index + 1]
      if (!a || !b) return
      const before = current[index] ?? 0
      const after = current[index + 1] ?? 0
      const pairTotal = before + after
      const lo = Math.max(a.min, pairTotal - b.max)
      const hi = Math.min(a.max, pairTotal - b.min)
      const nextA = clamp(previousSize, Math.min(lo, hi), Math.max(lo, hi))
      if (Math.abs(nextA - before) < 0.0001) return
      const next = [...current]
      next[index] = nextA
      next[index + 1] = pairTotal - nextA
      setSizes(next)
    },
    [panels, current, setSizes],
  )
  const resizePair = useCallback(
    (index: number, delta: number) => setPair(index, (current[index] ?? 0) + delta),
    [setPair, current],
  )
  const resetPair = useCallback(
    (index: number) => setPair(index, defaults[index] ?? 100 / Math.max(1, count)),
    [setPair, defaults, count],
  )

  const panelIds = useMemo(
    () => Array.from({ length: count }, (_, i) => `${baseId}-panel-${i}`),
    [baseId, count],
  )

  const value = useMemo<ResizableContextValue>(
    () => ({
      orientation,
      sizes: current,
      panels,
      panelIds,
      step,
      rootRef,
      resizePair,
      setPair,
      resetPair,
    }),
    [orientation, current, panels, panelIds, step, resizePair, setPair, resetPair],
  )

  return (
    <ResizableContext.Provider value={value}>
      <div
        ref={setRootRef}
        className={cx('vk-resizable', className)}
        data-orientation={orientation}
        style={style}
        {...rest}
      >
        {nodes}
      </div>
    </ResizableContext.Provider>
  )
}

/* ----------------------------------------------------------------------- panel */

export const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(
  function ResizablePanel({ minSize, maxSize, className, style, ...rest }, ref) {
    void minSize
    void maxSize
    const ctx = useResizable('Resizable.Panel')
    const index = useContext(IndexContext)
    const size = ctx.sizes[index] ?? 0
    return (
      <div
        ref={ref}
        id={ctx.panelIds[index]}
        className={cx('vk-resizable__panel', className)}
        data-index={index}
        style={{ '--vk-resizable-size': `${size}%`, ...style } as CSSProperties}
        {...rest}
      />
    )
  },
)

/* ---------------------------------------------------------------------- handle */

export const ResizableHandle = forwardRef<HTMLDivElement, ResizableHandleProps>(
  function ResizableHandle(
    { label = 'Resize panels', className, onKeyDown, onPointerDown, onDoubleClick, ...rest },
    ref,
  ) {
    const ctx = useResizable('Resizable.Handle')
    const index = useContext(IndexContext)
    const meta = ctx.panels[index]
    const horizontal = ctx.orientation === 'horizontal'
    const drag = useRef<{ start: number; size: number; span: number } | null>(null)

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented || index < 0) return
      const grow = horizontal ? 'ArrowRight' : 'ArrowDown'
      const shrink = horizontal ? 'ArrowLeft' : 'ArrowUp'
      let sign = 0
      if (event.key === grow) sign = 1
      else if (event.key === shrink) sign = -1
      if (sign !== 0) {
        // In a right-to-left page the start panel grows towards the left.
        if (horizontal && ctx.rootRef.current) {
          const dir = getComputedStyle(ctx.rootRef.current).direction
          if (dir === 'rtl') sign = -sign
        }
        event.preventDefault()
        ctx.resizePair(index, sign * ctx.step * (event.shiftKey ? 5 : 1))
        return
      }
      if (event.key === 'Home') {
        event.preventDefault()
        ctx.setPair(index, 0)
      } else if (event.key === 'End') {
        event.preventDefault()
        ctx.setPair(index, 100)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        ctx.resetPair(index)
      }
    }

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event)
      if (event.defaultPrevented || index < 0 || event.button !== 0) return
      const rect = ctx.rootRef.current?.getBoundingClientRect()
      const span = horizontal ? (rect?.width ?? 0) : (rect?.height ?? 0)
      if (span <= 0) return
      event.preventDefault()
      event.currentTarget.setPointerCapture?.(event.pointerId)
      drag.current = {
        start: horizontal ? event.clientX : event.clientY,
        size: ctx.sizes[index] ?? 0,
        span,
      }
      ctx.rootRef.current?.setAttribute('data-dragging', '')
    }
    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
      const d = drag.current
      if (!d) return
      let deltaPx = (horizontal ? event.clientX : event.clientY) - d.start
      if (
        horizontal &&
        ctx.rootRef.current &&
        getComputedStyle(ctx.rootRef.current).direction === 'rtl'
      ) {
        deltaPx = -deltaPx
      }
      ctx.setPair(index, d.size + (deltaPx / d.span) * 100)
    }
    const endDrag = () => {
      if (!drag.current) return
      drag.current = null
      ctx.rootRef.current?.removeAttribute('data-dragging')
    }

    const now = Math.round(ctx.sizes[index] ?? 0)
    return (
      <div
        ref={ref}
        role="separator"
        aria-label={label}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-valuenow={now}
        aria-valuemin={Math.round(meta?.min ?? 0)}
        aria-valuemax={Math.round(meta?.max ?? 100)}
        aria-controls={ctx.panelIds[index]}
        tabIndex={0}
        className={cx('vk-resizable__handle', className)}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(event) => {
          onDoubleClick?.(event)
          if (!event.defaultPrevented) ctx.resetPair(index)
        }}
        {...rest}
      >
        <span className="vk-resizable__grip" aria-hidden="true" />
      </div>
    )
  },
)

/* -------------------------------------------------------------------- compound */

/**
 * Split panes — panels side by side (or stacked) with draggable, keyboard-operable
 * boundaries between them. The editor/preview layout, the sidebar you can widen, the
 * inspector you can shrink.
 *
 * Each handle is a `role="separator"` with a value: `aria-valuenow` is the share of the
 * panel before it, `aria-controls` names that panel, and the arrow keys move it by `step`
 * percent (Shift × 5). Home and End send it to the panel's `minSize` / `maxSize`; Enter or a
 * double-click restores the default split. In a right-to-left page the arrows flip.
 * Dragging uses pointer capture, so a fast drag that leaves the handle still follows.
 *
 * Shares are percentages that always sum to 100, controlled through `sizes` or remembered
 * per `storageKey` in `localStorage`. Panels declare `minSize` / `maxSize`; a boundary
 * never pushes its neighbour past its own limits.
 *
 * ```tsx
 * <Resizable defaultSizes={[30, 70]} storageKey="editor-split">
 *   <Resizable.Panel minSize={20}>Files</Resizable.Panel>
 *   <Resizable.Handle />
 *   <Resizable.Panel>Editor</Resizable.Panel>
 * </Resizable>
 * ```
 */
export const Resizable = Object.assign(forwardRef<HTMLDivElement, ResizableProps>(ResizableRoot), {
  Panel: ResizablePanel,
  Handle: ResizableHandle,
})
