import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { LABEL_SIZE } from '../internal/cartesian'
import { seriesColor, seriesDash } from '../internal/palette'
import { ChartCaption, ChartLegend, ChartTable, chartLabel } from '../internal/parts'
import { arcPath, clamp, f, formatNumber, isNum, num, polarPoint, sum } from '../internal/scale'
import type { ChartRootProps } from '../internal/types'

export interface PieDatum {
  label: string
  value: number
  /** Any CSS colour. Defaults to the `--vk-chart-n` token for this slice index. */
  color?: string
  /** `stroke-dasharray` for the slice edge, so slices differ without colour. */
  dash?: string
}

export interface PieChartProps extends ChartRootProps {
  /** Slices, in drawing order (clockwise from 12 o clock). */
  data?: readonly PieDatum[]
  /** Punch out the middle. */
  donut?: boolean
  /**
   * Hole size as a fraction of the outer radius, `0` to `0.95`. Only applies with
   * `donut`; defaults to `0.6`.
   */
  innerRadius?: number
  /** Side of the square `viewBox`, in px, and the widest the chart will draw. */
  size?: number
  showLegend?: boolean
  /** Percentage inside each slice. Slices under 4% are skipped, as they cannot fit. */
  showLabels?: boolean
  /** Degrees clockwise from 12 o clock for the first slice. */
  startAngle?: number
  /** Gap between slices, in degrees. */
  padAngle?: number
  /** Big text in the middle of a donut, e.g. the total. */
  centerLabel?: string
  /** Smaller text under `centerLabel`. */
  centerSublabel?: string
}

const TAU = Math.PI * 2
const DEG = Math.PI / 180
const MIN_LABEL_SHARE = 0.04

/**
 * A pie or donut chart in pure SVG. Non-positive and non-finite slices are dropped -
 * they have no meaning in a part-to-whole picture - and the remaining values are
 * normalised, so slices always add up to the circle.
 */
export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(function PieChart(
  {
    data,
    donut = false,
    innerRadius = 0.6,
    size = 240,
    showLegend = true,
    showLabels = false,
    startAngle = 0,
    padAngle = 0.6,
    centerLabel,
    centerSublabel,
    title,
    description,
    accessibleTable = true,
    xLabel = 'Category',
    yLabel = 'Value',
    formatValue = formatNumber,
    className,
    style,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const box = isNum(size) && size > 40 ? Math.round(size) : 240
  const slices = (data ?? []).filter(
    (d): d is PieDatum => !!d && isNum(d.value) && d.value > 0 && typeof d.label === 'string',
  )
  const total = sum(slices.map((d) => d.value))
  const hasData = slices.length > 0 && total > 0

  const cx0 = box / 2
  const cy0 = box / 2
  const outer = Math.max(1, box / 2 - 8)
  const inner = donut ? clamp(isNum(innerRadius) ? innerRadius : 0.6, 0, 0.95) * outer : 0
  const gap = clamp(isNum(padAngle) ? padAngle : 0, 0, 10) * DEG
  const from = (isNum(startAngle) ? startAngle : 0) * DEG

  let cursor = from
  const wedges = slices.map((d, i) => {
    const share = total > 0 ? d.value / total : 0
    const sweep = share * TAU
    const start = cursor
    cursor += sweep
    // Only pad when there is room, so a hair-thin slice does not vanish entirely.
    const pad = slices.length > 1 && sweep > gap * 2 ? gap / 2 : 0
    const color = seriesColor(i, d.color)
    const mid = start + sweep / 2
    const labelR = inner + (outer - inner) * (inner > 0 ? 0.55 : 0.62)
    const at = polarPoint(cx0, cy0, labelR, mid)
    return {
      key: `${i}:${d.label}`,
      label: d.label,
      value: d.value,
      share,
      color,
      dash: seriesDash(i, d.dash),
      d: arcPath(cx0, cy0, outer, inner, start + pad, start + sweep - pad),
      labelX: at[0],
      labelY: at[1],
      labelText: `${num(share * 100, share < 0.1 ? 1 : 0)}%`,
    }
  })

  const label = chartLabel(
    ariaLabel,
    title,
    hasData
      ? `${donut ? 'Donut' : 'Pie'} chart, ${slices.length} ${
          slices.length === 1 ? 'slice' : 'slices'
        }, total ${formatValue(total)}`
      : `${donut ? 'Donut' : 'Pie'} chart, no data`,
  )
  const showTable = accessibleTable && hasData

  return (
    <div
      ref={ref}
      className={cx('vk-chart', 'vk-pie-chart', className)}
      data-donut={donut ? 'true' : undefined}
      style={style}
      {...rest}
    >
      <svg
        className="vk-chart__svg vk-pie-chart__svg"
        viewBox={`0 0 ${f(box)} ${f(box)}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={label}
        focusable="false"
        style={{ maxWidth: `${box}px` }}
      >
        <ChartCaption title={title} description={description} />
        {hasData ? null : (
          <>
            <circle
              className="vk-pie-chart__track"
              cx={f(cx0)}
              cy={f(cy0)}
              r={f((outer + inner) / 2)}
              strokeWidth={f(Math.max(2, outer - inner))}
              fill="none"
            />
            <text
              className="vk-chart__empty"
              x={f(cx0)}
              y={f(cy0)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={LABEL_SIZE}
            >
              No data
            </text>
          </>
        )}
        {wedges.map((w) =>
          w.d ? (
            <path
              className="vk-pie-chart__slice"
              key={w.key}
              d={w.d}
              fill={w.color}
              strokeDasharray={w.dash}
            />
          ) : null,
        )}
        {showLabels ? (
          <g className="vk-pie-chart__labels">
            {wedges.map((w) =>
              w.share >= MIN_LABEL_SHARE ? (
                <text
                  className="vk-pie-chart__label"
                  key={`l-${w.key}`}
                  x={f(w.labelX)}
                  y={f(w.labelY)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={LABEL_SIZE}
                >
                  {w.labelText}
                </text>
              ) : null,
            )}
          </g>
        ) : null}
        {donut && (centerLabel || centerSublabel) ? (
          <g className="vk-pie-chart__center-group">
            {centerLabel ? (
              <text
                className="vk-pie-chart__center"
                x={f(cx0)}
                y={f(centerSublabel ? cy0 - 4 : cy0)}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {centerLabel}
              </text>
            ) : null}
            {centerSublabel ? (
              <text
                className="vk-pie-chart__center-sub"
                x={f(cx0)}
                y={f(centerLabel ? cy0 + 16 : cy0)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={LABEL_SIZE}
              >
                {centerSublabel}
              </text>
            ) : null}
          </g>
        ) : null}
      </svg>
      {showLegend ? (
        <ChartLegend
          items={wedges.map((w) => ({ key: w.key, name: w.label, color: w.color }))}
          swatch="box"
          redundant={showTable}
        />
      ) : null}
      {showTable ? (
        <ChartTable
          caption={title ?? label}
          columns={[xLabel, yLabel, 'Share']}
          rows={wedges.map((w) => ({
            key: w.key,
            header: w.label,
            cells: [
              { key: 'v', text: formatValue(w.value) },
              { key: 's', text: `${num(w.share * 100, 1)}%` },
            ],
          }))}
        />
      ) : null}
    </div>
  )
})
