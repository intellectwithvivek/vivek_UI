import { describe, expect, it } from 'vitest'
import { type Align, type PositionOptions, position, type Rect, type Side } from './position'

/*
 * The foundation tests. `position()` is pure arithmetic over plain numbers, so every
 * case the positioning policy names can be pinned exactly here - in Node, with no
 * browser, no jsdom and no layout. The component tests inherit whatever this file
 * proves, which matters because jsdom reports every rectangle as 0x0 at 0,0 and so
 * cannot check any of it.
 */

const VIEWPORT = { width: 1000, height: 800 }

function rect(x: number, y: number, width: number, height: number): Rect {
  return { x, y, width, height }
}

/** A trigger comfortably in the middle of the viewport: nothing flips, nothing clamps. */
const CENTRED = rect(400, 300, 100, 40)

const SIDES: Side[] = ['top', 'bottom', 'left', 'right']
const ALIGNS: Align[] = ['start', 'center', 'end']

function at(options: Partial<PositionOptions> = {}) {
  return position({
    trigger: CENTRED,
    floating: { width: 200, height: 100 },
    viewport: VIEWPORT,
    ...options,
  })
}

describe('position: defaults', () => {
  it('defaults to bottom, centre, no offset and no padding', () => {
    const result = at()
    expect(result.side).toBe('bottom')
    expect(result.align).toBe('center')
    // bottom edge of the trigger, no gap
    expect(result.y).toBe(340)
    // centred on a 100-wide trigger with a 200-wide box
    expect(result.x).toBe(350)
  })

  it('echoes back the side and align it resolved, not the ones asked for', () => {
    const result = at({ side: 'top', align: 'end' })
    expect(result).toEqual({ x: 300, y: 200, side: 'top', align: 'end' })
  })
})

describe('position: main axis', () => {
  it('places the box against each side, with the offset as the gap', () => {
    expect(at({ side: 'top', offset: 8 }).y).toBe(192) // 300 - 8 - 100
    expect(at({ side: 'bottom', offset: 8 }).y).toBe(348) // 300 + 40 + 8
    expect(at({ side: 'left', offset: 8 }).x).toBe(192) // 400 - 8 - 200
    expect(at({ side: 'right', offset: 8 }).x).toBe(508) // 400 + 100 + 8
  })

  it('leaves the cross axis alone when only the offset changes', () => {
    expect(at({ side: 'bottom', offset: 0 }).x).toBe(at({ side: 'bottom', offset: 40 }).x)
    expect(at({ side: 'right', offset: 0 }).y).toBe(at({ side: 'right', offset: 40 }).y)
  })

  it('treats a zero-size trigger as a point', () => {
    const result = position({
      trigger: rect(500, 400, 0, 0),
      floating: { width: 100, height: 50 },
      viewport: VIEWPORT,
      side: 'bottom',
      offset: 10,
    })
    expect(result).toEqual({ x: 450, y: 410, side: 'bottom', align: 'center' })
  })
})

describe('position: cross axis alignment', () => {
  it('aligns along the trigger width on the vertical sides', () => {
    for (const side of ['top', 'bottom'] as const) {
      expect(at({ side, align: 'start' }).x).toBe(400) // trigger left edge
      expect(at({ side, align: 'center' }).x).toBe(350) // 400 + (100 - 200) / 2
      expect(at({ side, align: 'end' }).x).toBe(300) // 400 + 100 - 200
    }
  })

  it('aligns along the trigger height on the horizontal sides', () => {
    for (const side of ['left', 'right'] as const) {
      expect(at({ side, align: 'start' }).y).toBe(300) // trigger top edge
      expect(at({ side, align: 'center' }).y).toBe(270) // 300 + (40 - 100) / 2
      expect(at({ side, align: 'end' }).y).toBe(240) // 300 + 40 - 100
    }
  })

  it('produces a half-pixel centre rather than rounding it away', () => {
    // Rounding belongs to the caller (or the browser). Silently rounding here would
    // make two adjacent overlays disagree about where centre is.
    const result = position({
      trigger: rect(0, 0, 21, 0),
      floating: { width: 10, height: 10 },
      viewport: VIEWPORT,
      side: 'bottom',
    })
    expect(result.x).toBe(5.5)
  })
})

describe('position: the single flip', () => {
  it('flips to the opposite side when the preferred one cannot fit', () => {
    // 12px of room above, 108px needed.
    const nearTop = { trigger: rect(400, 20, 100, 40), floating: { width: 200, height: 100 } }
    const flipped = position({ ...nearTop, viewport: VIEWPORT, side: 'top', offset: 8, padding: 8 })
    expect(flipped.side).toBe('bottom')
    expect(flipped.y).toBe(68) // 20 + 40 + 8

    const nearBottom = { trigger: rect(400, 700, 100, 40), floating: { width: 200, height: 100 } }
    const up = position({
      ...nearBottom,
      viewport: VIEWPORT,
      side: 'bottom',
      offset: 8,
      padding: 8,
    })
    expect(up.side).toBe('top')
    expect(up.y).toBe(592) // 700 - 8 - 100

    const nearLeft = { trigger: rect(20, 300, 100, 40), floating: { width: 200, height: 100 } }
    const right = position({ ...nearLeft, viewport: VIEWPORT, side: 'left', offset: 8, padding: 8 })
    expect(right.side).toBe('right')
    expect(right.x).toBe(128) // 20 + 100 + 8

    const nearRight = { trigger: rect(900, 300, 80, 40), floating: { width: 200, height: 100 } }
    const left = position({
      ...nearRight,
      viewport: VIEWPORT,
      side: 'right',
      offset: 8,
      padding: 8,
    })
    expect(left.side).toBe('left')
    expect(left.x).toBe(692) // 900 - 8 - 200
  })

  it('does not flip when the preferred side fits exactly', () => {
    // Room above is 100 - 8 = 92; needed is 84 + 8 = 92. Exactly enough must stay put,
    // or a box that fits by a pixel jitters between sides as the page scrolls.
    const result = position({
      trigger: rect(400, 100, 100, 40),
      floating: { width: 200, height: 84 },
      viewport: VIEWPORT,
      side: 'top',
      offset: 8,
      padding: 8,
    })
    expect(result.side).toBe('top')
    expect(result.y).toBe(8)
  })

  it('counts padding as part of the room it needs', () => {
    const options = {
      trigger: rect(400, 120, 100, 40),
      floating: { width: 200, height: 100 },
      viewport: VIEWPORT,
      side: 'top' as const,
      offset: 8,
    }
    // 120 - 0 = 120 room, 108 needed: fits.
    expect(position({ ...options, padding: 0 }).side).toBe('top')
    // 120 - 20 = 100 room, 108 needed: no longer fits.
    expect(position({ ...options, padding: 20 }).side).toBe('bottom')
  })

  it('flips only once - it never lands on a perpendicular side', () => {
    // Boxed in on the vertical axis. The answer is top or bottom, never left/right:
    // that is the difference between this and an auto-placement engine.
    const result = position({
      trigger: rect(400, 100, 100, 40),
      floating: { width: 100, height: 400 },
      viewport: { width: 1000, height: 300 },
      side: 'bottom',
      offset: 8,
      padding: 8,
    })
    expect(['top', 'bottom']).toContain(result.side)
  })
})

describe('position: no room on either side', () => {
  it('picks the roomier side', () => {
    const floating = { width: 200, height: 300 }
    const viewport = { width: 1000, height: 200 }

    // 52px above, 92px below, 308px needed: neither fits, below is roomier.
    const preferTop = position({
      trigger: rect(400, 60, 40, 40),
      floating,
      viewport,
      side: 'top',
      offset: 8,
      padding: 8,
    })
    expect(preferTop.side).toBe('bottom')

    // Mirror image: preferring bottom must land on top.
    const preferBottom = position({
      trigger: rect(400, 100, 40, 40),
      floating,
      viewport,
      side: 'bottom',
      offset: 8,
      padding: 8,
    })
    expect(preferBottom.side).toBe('top')
  })

  it('picks the roomier side on the horizontal axis too', () => {
    const result = position({
      trigger: rect(80, 300, 40, 40),
      floating: { width: 400, height: 100 },
      viewport: { width: 300, height: 800 },
      side: 'left',
      offset: 8,
      padding: 8,
    })
    // 72px to the left, 172px to the right, 408px needed.
    expect(result.side).toBe('right')
  })

  it('keeps the caller preference when the two sides are equally cramped', () => {
    const shared = {
      trigger: rect(400, 80, 40, 40),
      floating: { width: 200, height: 300 },
      viewport: { width: 1000, height: 200 },
      offset: 8,
      padding: 8,
    }
    // 72px both above and below. A tie must be stable, not arbitrary.
    expect(position({ ...shared, side: 'top' }).side).toBe('top')
    expect(position({ ...shared, side: 'bottom' }).side).toBe('bottom')
  })
})

describe('position: shifting into the viewport', () => {
  it('clamps a start-aligned box that would hang off the right edge', () => {
    const result = position({
      trigger: rect(950, 300, 40, 40),
      floating: { width: 200, height: 100 },
      viewport: VIEWPORT,
      side: 'bottom',
      align: 'start',
      padding: 8,
    })
    expect(result.x).toBe(792) // 1000 - 8 - 200
    // Clamping shifts the box; it does not rewrite the alignment. A caller driving
    // an arrow or a transform-origin off data-align needs the value it asked for.
    expect(result.align).toBe('start')
  })

  it('clamps an end-aligned box that would hang off the left edge', () => {
    const result = position({
      trigger: rect(10, 300, 40, 40),
      floating: { width: 200, height: 100 },
      viewport: VIEWPORT,
      side: 'bottom',
      align: 'end',
      padding: 8,
    })
    expect(result.x).toBe(8)
  })

  it('clamps the cross axis on the horizontal sides as well', () => {
    const low = position({
      trigger: rect(400, 780, 40, 40),
      floating: { width: 200, height: 100 },
      viewport: VIEWPORT,
      side: 'right',
      align: 'start',
      padding: 8,
    })
    expect(low.y).toBe(692) // 800 - 8 - 100

    const high = position({
      trigger: rect(400, 4, 40, 40),
      floating: { width: 200, height: 100 },
      viewport: VIEWPORT,
      side: 'right',
      align: 'end',
      padding: 8,
    })
    expect(high.y).toBe(8)
  })

  it('respects padding of zero, sitting flush against the edge', () => {
    const result = position({
      trigger: rect(0, 300, 40, 40),
      floating: { width: 200, height: 100 },
      viewport: VIEWPORT,
      side: 'bottom',
      align: 'end',
      padding: 0,
    })
    expect(result.x).toBe(0)
  })

  it('clamps the main axis too, so a box with nowhere to go stays on screen', () => {
    const result = position({
      trigger: rect(400, 100, 40, 40),
      floating: { width: 100, height: 300 },
      viewport: { width: 1000, height: 200 },
      side: 'bottom',
      offset: 8,
      padding: 8,
    })
    // Bottom wins on room, but 300px does not fit in 200px: pin to the padding.
    expect(result.y).toBe(8)
    expect(result.y).toBeGreaterThanOrEqual(0)
  })

  it('keeps a trigger scrolled off the top of the viewport on screen', () => {
    const result = position({
      trigger: rect(400, -500, 100, 40),
      floating: { width: 200, height: 100 },
      viewport: VIEWPORT,
      side: 'top',
      offset: 8,
      padding: 8,
    })
    expect(result.x).toBeGreaterThanOrEqual(0)
    expect(result.y).toBeGreaterThanOrEqual(0)
    expect(result.side).toBe('bottom')
  })
})

describe('position: floating element larger than the viewport', () => {
  it('pins to the padding on both axes instead of going negative', () => {
    for (const side of SIDES) {
      for (const align of ALIGNS) {
        const result = position({
          trigger: rect(150, 100, 40, 40),
          floating: { width: 500, height: 400 },
          viewport: { width: 300, height: 200 },
          side,
          align,
          offset: 8,
          padding: 8,
        })
        expect(result.x).toBe(8)
        expect(result.y).toBe(8)
      }
    }
  })

  it('pins to zero when there is no padding either', () => {
    const result = position({
      trigger: rect(10, 10, 10, 10),
      floating: { width: 5000, height: 5000 },
      viewport: { width: 320, height: 480 },
      side: 'top',
      align: 'start',
    })
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
  })

  it('survives a zero-size viewport', () => {
    const result = position({
      trigger: rect(0, 0, 0, 0),
      floating: { width: 100, height: 100 },
      viewport: { width: 0, height: 0 },
      side: 'bottom',
      padding: 8,
    })
    expect(result.x).toBe(8)
    expect(result.y).toBe(8)
    expect(Number.isFinite(result.x)).toBe(true)
  })
})

describe('position: garbage in, numbers out', () => {
  it('never returns NaN, whatever it is handed', () => {
    const result = position({
      trigger: rect(Number.NaN, Number.NaN, Number.NaN, Number.NaN),
      floating: { width: Number.NaN, height: Number.NaN },
      viewport: { width: Number.NaN, height: Number.NaN },
      side: 'bottom',
      align: 'center',
      offset: Number.NaN,
      padding: Number.NaN,
    })
    expect(Number.isNaN(result.x)).toBe(false)
    expect(Number.isNaN(result.y)).toBe(false)
    expect(result).toEqual({ x: 0, y: 0, side: 'bottom', align: 'center' })
  })

  it('rejects Infinity the same way', () => {
    const result = position({
      trigger: rect(Number.POSITIVE_INFINITY, 0, 10, 10),
      floating: { width: Number.POSITIVE_INFINITY, height: 10 },
      viewport: { width: Number.NEGATIVE_INFINITY, height: 800 },
      side: 'right',
      padding: Number.POSITIVE_INFINITY,
    })
    expect(Number.isFinite(result.x)).toBe(true)
    expect(Number.isFinite(result.y)).toBe(true)
    expect(result.x).toBeGreaterThanOrEqual(0)
    expect(result.y).toBeGreaterThanOrEqual(0)
  })

  it('treats negative sizes as zero', () => {
    const result = position({
      trigger: rect(100, 100, -50, -50),
      floating: { width: -200, height: -200 },
      viewport: { width: 1000, height: 800 },
      side: 'bottom',
      align: 'center',
    })
    expect(result).toEqual({ x: 100, y: 100, side: 'bottom', align: 'center' })
  })

  it('treats a negative padding as zero rather than pulling the box off screen', () => {
    const result = position({
      trigger: rect(0, 300, 40, 40),
      floating: { width: 200, height: 100 },
      viewport: VIEWPORT,
      side: 'bottom',
      align: 'end',
      padding: -100,
    })
    expect(result.x).toBe(0)
  })

  it('accepts a negative offset as a deliberate overlap', () => {
    // Not sanitised away: a negative offset is how you tuck a menu over its trigger.
    const result = position({
      trigger: CENTRED,
      floating: { width: 200, height: 100 },
      viewport: VIEWPORT,
      side: 'bottom',
      offset: -10,
    })
    expect(result.y).toBe(330) // 300 + 40 - 10
  })
})

describe('position: purity', () => {
  it('does not mutate its inputs', () => {
    const trigger = rect(400, 300, 100, 40)
    const floating = { width: 200, height: 100 }
    const viewport = { width: 1000, height: 800 }
    position({ trigger, floating, viewport, side: 'top', offset: 8, padding: 8 })
    expect(trigger).toEqual(rect(400, 300, 100, 40))
    expect(floating).toEqual({ width: 200, height: 100 })
    expect(viewport).toEqual({ width: 1000, height: 800 })
  })

  it('is deterministic', () => {
    const options: PositionOptions = {
      trigger: rect(12, 34, 56, 78),
      floating: { width: 90, height: 12 },
      viewport: VIEWPORT,
      side: 'left',
      align: 'end',
      offset: 6,
      padding: 4,
    }
    expect(position(options)).toEqual(position(options))
  })
})

describe('position: exhaustive sweep', () => {
  // Every side x every align x a spread of triggers and box sizes, including boxes
  // bigger than the viewport. The invariants below are the contract the components
  // rely on, and this is the cheapest place to prove they hold everywhere.
  const triggers = [
    rect(0, 0, 0, 0),
    rect(0, 0, 40, 40),
    rect(500, 400, 100, 40),
    rect(960, 760, 40, 40),
    rect(-100, -100, 40, 40),
    rect(1500, 1200, 40, 40),
    rect(0, 400, 1000, 40),
  ]
  const boxes = [
    { width: 0, height: 0 },
    { width: 10, height: 10 },
    { width: 200, height: 100 },
    { width: 1200, height: 100 },
    { width: 200, height: 1200 },
    { width: 4000, height: 4000 },
  ]
  const padding = 8
  const offset = 8

  it('always returns finite, non-negative coordinates', () => {
    for (const side of SIDES) {
      for (const align of ALIGNS) {
        for (const trigger of triggers) {
          for (const floating of boxes) {
            const result = position({
              trigger,
              floating,
              viewport: VIEWPORT,
              side,
              align,
              offset,
              padding,
            })
            const where = `${side}/${align} trigger=${JSON.stringify(trigger)} box=${JSON.stringify(floating)}`

            expect(Number.isFinite(result.x), `x finite: ${where}`).toBe(true)
            expect(Number.isFinite(result.y), `y finite: ${where}`).toBe(true)
            expect(result.x, `x non-negative: ${where}`).toBeGreaterThanOrEqual(0)
            expect(result.y, `y non-negative: ${where}`).toBeGreaterThanOrEqual(0)
            expect(result.align, `align echoed: ${where}`).toBe(align)
            // The flip is to the opposite side or nowhere: never a perpendicular one.
            const axis = side === 'top' || side === 'bottom' ? ['top', 'bottom'] : ['left', 'right']
            expect(axis, `stays on its axis: ${where}`).toContain(result.side)
          }
        }
      }
    }
  })

  it('keeps a box that fits inside the padded viewport', () => {
    const fitting = { width: 200, height: 100 }
    for (const side of SIDES) {
      for (const align of ALIGNS) {
        for (const trigger of triggers) {
          const result = position({
            trigger,
            floating: fitting,
            viewport: VIEWPORT,
            side,
            align,
            offset,
            padding,
          })
          const where = `${side}/${align} trigger=${JSON.stringify(trigger)}`
          expect(result.x, `left inside: ${where}`).toBeGreaterThanOrEqual(padding)
          expect(result.y, `top inside: ${where}`).toBeGreaterThanOrEqual(padding)
          expect(result.x + fitting.width, `right inside: ${where}`).toBeLessThanOrEqual(
            VIEWPORT.width - padding,
          )
          expect(result.y + fitting.height, `bottom inside: ${where}`).toBeLessThanOrEqual(
            VIEWPORT.height - padding,
          )
        }
      }
    }
  })
})
