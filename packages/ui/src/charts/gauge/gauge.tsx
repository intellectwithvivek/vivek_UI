import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { ChartCaption } from '../internal/parts'
import { arcPath, clamp, f, formatNumber, isNum, polarPoint } from '../internal/scale'
import type { ChartRootProps } from '../internal/types'

export interface GaugeBand {
  /** Band upper bound, in value units. Bands are drawn from `min` upward in array order. */
  to: number
  /** Any CSS colour. Semantic tokens read well here: `var(--vk-color-success)`. */
  color: string
  /** Names the band in the accessible summary, e.g. "healthy". */
  label?: string
}

export interface GaugeProps extends Omit<ChartRootProps, 'xLabel' | 'yLabel'> {
  value: number
  min?: number
  max?: number
  /**
   * Threshold bands under the arc — the "green / amber / red" zones a dashboard gauge
   * exists for. Without bands the track is a single neutral arc.
   */
  bands?: readonly GaugeBand[]
  /** Diameter of the `viewBox`, in px. The chart scales to its container width. */
  diameter?: number
  /** Arc thickness in px. */
  thickness?: number
  /** Text under the value, e.g. a unit. */
  caption?: string
  showValue?: boolean
}

/*
 * A 270° arc, opening downward: from 135° (bottom-left) clockwise to 405° (bottom-right).
 * The gap at the bottom is where the value and caption sit.
 */
// Angles follow `polarPoint`: zero at twelve o'clock, clockwise. The dial opens at the
// bottom: it starts at seven-thirty (-135°) and sweeps 270° to four-thirty.
const START = (-3 * Math.PI) / 4
const SWEEP = (3 * Math.PI) / 2

/**
 * A gauge — one value against a bounded scale, with optional threshold bands.
 *
 * This is the "is it in the healthy zone" chart. For plain percent-complete, ProgressRing
 * is the lighter fit; a gauge earns its needle when the *zones* matter, because the needle
 * against a coloured band answers the question before the number is read.
 *
 * The value is announced as text — the SVG is decoration around a number, and the number,
 * its range and the band it falls in are all in the accessible name.
 */
export const Gauge = forwardRef<HTMLDivElement, GaugeProps>(function Gauge(
  {
    value,
    min = 0,
    max = 100,
    bands,
    diameter = 200,
    thickness = 14,
    caption,
    showValue = true,
    title,
    description,
    accessibleTable,
    formatValue = formatNumber,
    className,
    style,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const size = isNum(diameter) && diameter > 80 ? Math.round(diameter) : 200
  const cxp = size / 2
  const cyp = size / 2
  const outer = size / 2 - 8
  const inner = outer - (isNum(thickness) && thickness > 0 ? thickness : 14)

  const span = max - min
  const ok = isNum(value) && isNum(span) && span > 0
  const fraction = ok ? clamp((value - min) / span, 0, 1) : 0

  /** Angle for a value fraction along the 270° sweep. */
  const angleAt = (fr: number) => START + SWEEP * fr

  // Bands are clamped and drawn in order from min; anything past max is cut, not wrapped.
  const resolvedBands = (bands ?? []).filter((b) => isNum(b.to))
  const bandArcs = resolvedBands.map((band, i) => {
    const from = i === 0 ? 0 : clamp(((resolvedBands[i - 1]?.to ?? min) - min) / span, 0, 1)
    const to = clamp((band.to - min) / span, 0, 1)
    return { ...band, from, to }
  })

  const within = ok
    ? (resolvedBands.find((band) => value <= band.to) ?? resolvedBands[resolvedBands.length - 1])
    : undefined

  const [nx, ny] = polarPoint(cxp, cyp, inner - 6, angleAt(fraction))

  /*
   * Not chartLabel(): that helper prefers the title, which is right for charts whose
   * numbers live in an accessible table. A gauge has no table - the value IS the content -
   * so the name always carries the figure, with the title as its prefix.
   */
  const spoken = ok
    ? `${formatValue(value)} of ${formatValue(min)} to ${formatValue(max)}${
        within?.label ? `, ${within.label}` : ''
      }`
    : 'no value'
  const label = ariaLabel ?? (title ? `${title}: ${spoken}` : `Gauge: ${spoken}`)

  return (
    <div ref={ref} className={cx('vk-chart', 'vk-gauge', className)} style={style} {...rest}>
      <svg
        className="vk-chart__svg"
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={label}
        focusable="false"
      >
        <ChartCaption title={title} description={description} />
        {/* Track: the full sweep, always visible so the scale's extent is never a guess. */}
        <path
          className="vk-gauge__track"
          d={arcPath(cxp, cyp, outer, inner, START, START + SWEEP)}
        />
        {bandArcs.map((band, i) =>
          band.to > band.from ? (
            <path
              // biome-ignore lint/suspicious/noArrayIndexKey: bands are positional zones
              key={i}
              className="vk-gauge__band"
              d={arcPath(cxp, cyp, outer, inner, angleAt(band.from), angleAt(band.to))}
              fill={band.color}
            />
          ) : null,
        )}
        {ok ? (
          <>
            {/* Value arc on top of the bands when there are none — otherwise the needle
                alone reads against the zones, which is the point of having zones. */}
            {bandArcs.length === 0 ? (
              <path
                className="vk-gauge__value-arc"
                d={arcPath(cxp, cyp, outer, inner, START, angleAt(fraction))}
              />
            ) : null}
            <line className="vk-gauge__needle" x1={cxp} y1={cyp} x2={f(nx)} y2={f(ny)} />
            <circle className="vk-gauge__hub" cx={cxp} cy={cyp} r={5} />
          </>
        ) : null}
        {showValue && ok ? (
          <text className="vk-gauge__value" x={cxp} y={size - 18} textAnchor="middle">
            {formatValue(value)}
          </text>
        ) : null}
        {caption ? (
          <text className="vk-gauge__caption" x={cxp} y={size - 4} textAnchor="middle">
            {caption}
          </text>
        ) : null}
      </svg>
      {/* The figure as real text: the SVG above is aria-labelled, this is for find-in-page. */}
      <span className="vk-visually-hidden">{label}</span>
    </div>
  )
})
