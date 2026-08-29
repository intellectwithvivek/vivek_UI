import { type CSSProperties, forwardRef, type HTMLAttributes, type Ref } from 'react'
import { cx } from '../../utils/cx'
import { ChartCaption, ChartTable, chartLabel } from '../internal/parts'
import type { Point } from '../internal/scale'
import {
  areaPath,
  extent,
  f,
  formatNumber,
  isNum,
  linePath,
  makeScale,
  num,
  padDomain,
} from '../internal/scale'

export interface SparklineProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The trend. Non-finite entries are dropped before anything is drawn. */
  data?: readonly number[]
  /** Height of the internal coordinate space, in px. Default `32`. */
  height?: number
  /**
   * Width of the internal coordinate space. The sparkline stretches to fill its
   * container, so this only sets the aspect ratio the geometry is designed against.
   */
  width?: number
  /** Any CSS colour. Defaults to the `--vk-chart-1` token. */
  stroke?: string
  /** Fill under the line: `true` for a tint of `stroke`, or an explicit CSS colour. */
  fill?: boolean | string
  strokeWidth?: number
  /** Dot on the final value - the "where are we now" cue. */
  showLastPoint?: boolean
  curve?: 'linear' | 'smooth'
  title?: string
  description?: string
  /** Visually hidden `<table>` of the values. On by default. */
  accessibleTable?: boolean
  formatValue?: (value: number) => string
  xLabel?: string
  yLabel?: string
}

/**
 * A tiny, axis-free trend line meant to sit inside a sentence, a table cell or a stat
 * card. Pure SVG, no measurement, no dependencies.
 *
 * `preserveAspectRatio="none"` lets it fill any width; the line keeps an even weight
 * via `vector-effect="non-scaling-stroke"`, at the cost of the last-point dot going
 * slightly oval when the container is far from the `width`/`height` aspect.
 */
export const Sparkline = forwardRef<HTMLElement, SparklineProps>(function Sparkline(
  {
    data,
    height = 32,
    width = 120,
    stroke,
    fill,
    strokeWidth = 1.5,
    showLastPoint,
    curve = 'linear',
    title,
    description,
    accessibleTable = true,
    formatValue = formatNumber,
    xLabel = 'Index',
    yLabel = 'Value',
    className,
    style,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const values = (data ?? []).filter(isNum)
  const w = isNum(width) && width > 8 ? width : 120
  const h = isNum(height) && height > 4 ? height : 32
  const sw = isNum(strokeWidth) && strokeWidth > 0 ? strokeWidth : 1.5
  const dotR = Math.max(1.5, sw + 1)
  const inset = num(Math.max(sw, showLastPoint ? dotR : 0) + 0.5)

  const yScale = makeScale(padDomain(extent(values)), [h - inset, inset])
  const innerW = Math.max(1, w - inset * 2)
  const last = values.length - 1
  const points: Point[] = values.map((v, i) => [
    num(inset + (values.length <= 1 ? innerW / 2 : (i / last) * innerW)),
    yScale(v),
  ])

  const smooth = curve === 'smooth'
  const d = linePath(points, smooth, [inset, h - inset])
  const first = points[0]
  const lastPoint = points[last]
  const area =
    fill && first && lastPoint
      ? areaPath(
          points,
          [
            [lastPoint[0], h - inset],
            [first[0], h - inset],
          ],
          smooth,
          [inset, h - inset],
        )
      : ''

  const lastValue = values[last]
  const range = extent(values)
  const label = chartLabel(
    ariaLabel,
    title,
    values.length === 0
      ? 'Sparkline, no data'
      : `Sparkline of ${values.length} ${values.length === 1 ? 'value' : 'values'}${
          range ? `, from ${formatValue(range[0])} to ${formatValue(range[1])}` : ''
        }${lastValue === undefined ? '' : `, ending at ${formatValue(lastValue)}`}`,
  )

  // A <table> is flow content, so it cannot legally live inside a <span>. Swap the root
  // element rather than emit invalid markup; both render as inline-block.
  const showTable = accessibleTable && values.length > 0
  const Root = (showTable ? 'div' : 'span') as 'div'

  // Colours travel as custom properties, not as `stroke`/`fill` attributes: a
  // presentation attribute loses to any stylesheet rule, so the props would do nothing.
  const vars = { ...style } as Record<string, string | number | undefined>
  if (stroke) vars['--vk-sparkline-stroke'] = stroke
  if (typeof fill === 'string' && fill) vars['--vk-sparkline-area'] = fill

  return (
    <Root
      // TS cannot narrow a ref across a union of intrinsic tags; the runtime element is
      // whichever `Root` resolved to, and both are HTMLElements.
      ref={ref as Ref<HTMLDivElement>}
      className={cx('vk-chart', 'vk-sparkline', className)}
      data-fill={fill ? 'true' : undefined}
      style={vars as CSSProperties}
      {...rest}
    >
      <svg
        className="vk-chart__svg vk-sparkline__svg"
        viewBox={`0 0 ${f(w)} ${f(h)}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
        focusable="false"
        style={{ width: `${w}px`, height: `${h}px`, maxWidth: '100%' }}
      >
        <ChartCaption title={title} description={description} />
        {area ? <path className="vk-sparkline__area" d={area} /> : null}
        {d ? (
          <path
            className="vk-sparkline__line"
            d={d}
            strokeWidth={sw}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        {(showLastPoint || values.length === 1) && lastPoint ? (
          <circle
            className="vk-sparkline__point"
            cx={f(lastPoint[0])}
            cy={f(lastPoint[1])}
            r={f(dotR)}
          />
        ) : null}
      </svg>
      {showTable ? (
        <ChartTable
          caption={title ?? label}
          columns={[xLabel, yLabel]}
          rows={values.map((v, i) => ({
            key: `r${i}`,
            header: String(i),
            cells: [{ key: 'v', text: formatValue(v) }],
          }))}
        />
      ) : null}
    </Root>
  )
})
