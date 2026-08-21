'use client'

/**
 * The one interactive piece in the charts tree, and the only file here with a
 * `'use client'` directive - which is why it lives on its own. A chart that does not
 * set `tooltip` never pulls this module into the client bundle.
 *
 * The tooltip is plain SVG (rect + text), sized from character counts rather than
 * measured text, so nothing here needs the DOM either.
 */

import { useState } from 'react'
import type { PlotRect } from './cartesian'
import { LABEL_SIZE } from './cartesian'
import { clamp, f } from './scale'

export interface HoverRow {
  key: string
  name: string
  value: string
  color: string
}

export interface HoverSlot {
  key: string
  /** Where the crosshair sits, in viewBox units. */
  x: number
  /** Hit band for this slot. */
  x0: number
  x1: number
  label: string
  rows: HoverRow[]
}

export interface ChartHoverLayerProps {
  slots: HoverSlot[]
  plot: PlotRect
  crosshair?: boolean
}

const CHAR = 6.2
const ROW_H = LABEL_SIZE + 5
const PAD = 8

export function ChartHoverLayer({ slots, plot, crosshair = true }: ChartHoverLayerProps) {
  const [active, setActive] = useState<string | null>(null)
  const slot = slots.find((s) => s.key === active)

  const longest = slot
    ? Math.max(slot.label.length, ...slot.rows.map((r) => r.name.length + r.value.length + 2))
    : 0
  const boxW = Math.min(plot.width, longest * CHAR + PAD * 2 + 12)
  const boxH = PAD * 2 + ROW_H * ((slot?.rows.length ?? 0) + 1)
  const flip = slot ? slot.x + 12 + boxW > plot.x + plot.width : false
  const boxX = slot
    ? clamp(flip ? slot.x - 12 - boxW : slot.x + 12, plot.x, plot.x + plot.width - boxW)
    : 0
  const boxY = clamp(plot.y + 6, plot.y, plot.y + plot.height - boxH)

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: a hover affordance over a role="img" chart; the keyboard/AT path is the chart data table, not this layer.
    <g className="vk-chart__hover" onMouseLeave={() => setActive(null)}>
      {slots.map((s) => (
        // biome-ignore lint/a11y/noStaticElementInteractions: hit areas exist only for pointer hover; they carry no information the data table does not.
        <rect
          className="vk-chart__hit"
          key={s.key}
          x={f(s.x0)}
          y={f(plot.y)}
          width={f(Math.max(0, s.x1 - s.x0))}
          height={f(plot.height)}
          fill="transparent"
          pointerEvents="all"
          onMouseEnter={() => setActive(s.key)}
          onMouseMove={() => setActive(s.key)}
        />
      ))}

      {slot ? (
        <g className="vk-chart__tooltip" pointerEvents="none">
          {crosshair ? (
            <line
              className="vk-chart__crosshair"
              x1={f(slot.x)}
              y1={f(plot.y)}
              x2={f(slot.x)}
              y2={f(plot.y + plot.height)}
            />
          ) : null}
          <rect
            className="vk-chart__tooltip-box"
            x={f(boxX)}
            y={f(boxY)}
            width={f(boxW)}
            height={f(boxH)}
            rx="6"
          />
          <text
            className="vk-chart__tooltip-title"
            x={f(boxX + PAD)}
            y={f(boxY + PAD + LABEL_SIZE - 2)}
            fontSize={LABEL_SIZE}
          >
            {slot.label}
          </text>
          {slot.rows.map((row, i) => (
            <g key={row.key}>
              <rect
                x={f(boxX + PAD)}
                y={f(boxY + PAD + ROW_H * (i + 1) + 2)}
                width="8"
                height="8"
                rx="2"
                fill={row.color}
              />
              <text
                className="vk-chart__tooltip-row"
                x={f(boxX + PAD + 14)}
                y={f(boxY + PAD + ROW_H * (i + 1) + LABEL_SIZE - 2)}
                fontSize={LABEL_SIZE}
              >
                {`${row.name}: ${row.value}`}
              </text>
            </g>
          ))}
        </g>
      ) : null}
    </g>
  )
}
