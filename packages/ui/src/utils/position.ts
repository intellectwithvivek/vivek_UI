/*
 * Anchored positioning - the whole engine, deliberately small.
 *
 * This is NOT a floating-ui replacement and must not grow into one. The product
 * decision (and the reason this file is ~150 lines instead of ~4000) is:
 *
 *   1. The caller states the `side` and `align` it wants. No auto-placement.
 *   2. ONE flip check: if the preferred side cannot fit the floating box, use the
 *      opposite side. If neither fits, use the roomier of the two.
 *   3. Shift (clamp) into the viewport, keeping `padding` away from the edges. On
 *      the cross axis that is the feature; on the main axis it is a floor, so a
 *      floating box bigger than the viewport can never be pushed off-screen.
 *
 * No middleware chain, no virtual elements, no arrow positioning, no size matching,
 * no fallback placement lists. A design that needs those needs a different library,
 * not a bigger version of this one.
 *
 * Everything is plain numbers - `Rect`s and `Size`s, never DOM nodes. That is what
 * makes the math exhaustively unit-testable in Node with no browser and no jsdom
 * layout (see `position.test.ts`). The DOM half - calling `getBoundingClientRect()`
 * and writing `left`/`top` - lives in the components, inside effects, so this file
 * stays pure and needs no `'use client'` directive.
 *
 * Coordinate space: the one `getBoundingClientRect()` reports - viewport pixels, y
 * growing downwards. The returned `x`/`y` are therefore meant for a
 * `position: fixed` element, which is how all three overlays render.
 */

/** Which edge of the trigger the floating element sits against. */
export type Side = 'top' | 'bottom' | 'left' | 'right'

/** Where along the trigger's cross axis the floating element lines up. */
export type Align = 'start' | 'center' | 'end'

/** A rectangle in viewport coordinates, as `getBoundingClientRect()` reports it. */
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/** Just the dimensions - the floating element's position is what we are solving for. */
export interface Size {
  width: number
  height: number
}

export interface PositionOptions {
  /** The anchor, in viewport coordinates. */
  trigger: Rect
  /** The floating element's measured size. */
  floating: Size
  /** The visible area to stay inside. Usually the window's inner size. */
  viewport: Size
  /** Preferred side. Default `'bottom'`. May be flipped to its opposite. */
  side?: Side
  /** Cross-axis alignment. Default `'center'`. Never changed by this function. */
  align?: Align
  /** Gap between trigger and floating element, in px. Default `0`. */
  offset?: number
  /** Minimum distance to keep from the viewport edges, in px. Default `0`. */
  padding?: number
}

export interface PositionResult {
  /** Viewport x for the floating element's left edge. Finite, never negative. */
  x: number
  /** Viewport y for the floating element's top edge. Finite, never negative. */
  y: number
  /** The side actually used - the preferred one, or its opposite after a flip. */
  side: Side
  /** The alignment used. Echoed back so one object can drive both data attributes. */
  align: Align
}

const OPPOSITE: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

function isVertical(side: Side): boolean {
  return side === 'top' || side === 'bottom'
}

/**
 * Every number that reaches the math goes through here first.
 *
 * `getBoundingClientRect()` on a detached or `display: none` node, a viewport read
 * from a stale ref, a `Number.parseFloat` of a bad CSS value - all of these hand us
 * `NaN` or `Infinity` in the wild, and one of them poisoning `x` means the overlay
 * silently vanishes, because a browser drops `left: NaNpx` on the floor. Coercing at
 * the boundary is cheaper than auditing every call site forever.
 */
function num(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

/** Sizes are additionally never negative - a negative width breaks every comparison. */
function size(value: number | undefined): number {
  return Math.max(0, num(value, 0))
}

/**
 * Clamp, with an opinion about the impossible case: when the floating element is
 * larger than the viewport minus padding, `max` lands below `min`. Naive
 * `Math.min(Math.max(...))` then returns `max`, which is negative - the box's top or
 * left edge goes off-screen and the content there becomes unreachable. Pinning to
 * `min` instead keeps the leading edge visible and lets the overflow fall off the
 * far side, which the user can still scroll or resize to.
 */
function clamp(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

/** Free space between the trigger's named edge and the viewport edge, minus padding. */
function room(side: Side, trigger: Rect, viewport: Size, padding: number): number {
  switch (side) {
    case 'top':
      return trigger.y - padding
    case 'bottom':
      return viewport.height - (trigger.y + trigger.height) - padding
    case 'left':
      return trigger.x - padding
    case 'right':
      return viewport.width - (trigger.x + trigger.width) - padding
  }
}

/**
 * Resolve a floating element's position against its trigger.
 *
 * Pure: same inputs, same outputs, no DOM, no globals, no time. Guaranteed to
 * return finite, non-negative `x`/`y` for any input at all, including garbage.
 */
export function position({
  trigger,
  floating,
  viewport,
  side = 'bottom',
  align = 'center',
  offset,
  padding,
}: PositionOptions): PositionResult {
  const pad = Math.max(0, num(padding, 0))
  const gap = num(offset, 0)

  const anchor: Rect = {
    x: num(trigger?.x, 0),
    y: num(trigger?.y, 0),
    width: size(trigger?.width),
    height: size(trigger?.height),
  }
  const box: Size = { width: size(floating?.width), height: size(floating?.height) }
  const view: Size = { width: size(viewport?.width), height: size(viewport?.height) }

  // --- the single flip check ------------------------------------------------
  // A side "fits" when the gap plus the floating element's main-axis extent still
  // leaves `pad` between it and the viewport edge. That requirement is identical
  // for a side and its opposite (same axis, same extent), so compute it once.
  const needed = (isVertical(side) ? box.height : box.width) + gap
  const preferredRoom = room(side, anchor, view, pad)

  let resolvedSide = side
  if (preferredRoom < needed) {
    const opposite = OPPOSITE[side]
    const oppositeRoom = room(opposite, anchor, view, pad)
    // Neither side fits: take the roomier one, and keep the caller's preference on a
    // tie so the layout does not look like it picks sides at random.
    if (oppositeRoom >= needed || oppositeRoom > preferredRoom) resolvedSide = opposite
  }

  // --- main axis ------------------------------------------------------------
  let x = 0
  let y = 0
  switch (resolvedSide) {
    case 'top':
      y = anchor.y - gap - box.height
      break
    case 'bottom':
      y = anchor.y + anchor.height + gap
      break
    case 'left':
      x = anchor.x - gap - box.width
      break
    case 'right':
      x = anchor.x + anchor.width + gap
      break
  }

  // --- cross axis -----------------------------------------------------------
  if (isVertical(resolvedSide)) {
    if (align === 'start') x = anchor.x
    else if (align === 'end') x = anchor.x + anchor.width - box.width
    else x = anchor.x + (anchor.width - box.width) / 2
  } else {
    if (align === 'start') y = anchor.y
    else if (align === 'end') y = anchor.y + anchor.height - box.height
    else y = anchor.y + (anchor.height - box.height) / 2
  }

  // --- shift into the viewport ---------------------------------------------
  // Both axes. On the cross axis this is the whole point: an end-aligned menu on a
  // trigger near the left edge would otherwise hang off it. On the main axis it only
  // ever bites when the flip above could not find room either.
  x = clamp(x, pad, view.width - pad - box.width)
  y = clamp(y, pad, view.height - pad - box.height)

  return { x, y, side: resolvedSide, align }
}
