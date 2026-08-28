'use client'

import {
  type ChangeEvent,
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { type HSVA, hsvToRgb, parseColor, rgbToHsv, toHex } from '../../utils/color'
import { cx } from '../../utils/cx'
import { Popover } from '../popover'

export interface ColorPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Hex, `#rrggbb` (or `#rrggbbaa` with `alpha`). Any parseable colour is accepted on the way in. */
  value?: string
  defaultValue?: string
  /** Receives lower-case hex: `#rrggbb`, or `#rrggbbaa` with `alpha`. */
  onValueChange?: (hex: string) => void
  /** Show an alpha slider and emit eight-digit hex. Default `false`. */
  alpha?: boolean
  /** Swatches to offer under the sliders. */
  presets?: string[]
  /** Accessible name of the picker. Default `'Colour picker'`. */
  label?: string
  /** `inline` renders the panel in place; `popover` renders a swatch button that opens it. Default `inline`. */
  variant?: 'inline' | 'popover'
  size?: 'sm' | 'md'
  /** Emits a hidden input so the colour posts with a plain form. */
  name?: string
  disabled?: boolean
  /** Sets `aria-invalid` on the hex input. Injected by `Field`. */
  invalid?: boolean
  required?: boolean
  /** Offer the EyeDropper button where the browser supports it. Default `true`. */
  eyedropper?: boolean
  /** Extra content under the panel — a "Reset" button, a contrast readout. */
  children?: ReactNode
}

interface EyeDropperLike {
  open(): Promise<{ sRGBHex: string }>
}

const FALLBACK = '#3b82f6'
const FALLBACK_RGB = parseColor(FALLBACK) ?? { r: 59, g: 130, b: 246, a: 1 }
const FALLBACK_HSV = rgbToHsv(FALLBACK_RGB)

function hsvFrom(text: string | undefined): HSVA {
  const rgb = text ? parseColor(text) : null
  return rgb ? rgbToHsv(rgb) : FALLBACK_HSV
}

/**
 * A colour picker with real controls: hue, saturation, brightness (and alpha) are
 * `<input type="range">`s with names and spoken values; the hex field is a text input
 * that commits on Enter or blur and reverts what it cannot parse; presets are toggle
 * buttons. The two-dimensional area is a pointer convenience over the same state, hidden
 * from assistive tech because the sliders already say everything it shows.
 *
 * Emits lower-case hex and accepts anything `parseColor` reads (`#rgb`, `#rrggbbaa`,
 * `rgb()`…). `variant="popover"` puts the panel behind a swatch button. Where the browser
 * has an EyeDropper, a button offers it. With `name`, a hidden input posts the value.
 */
export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(function ColorPicker(
  {
    value,
    defaultValue,
    onValueChange,
    alpha = false,
    presets,
    label = 'Colour picker',
    variant = 'inline',
    size = 'md',
    name,
    disabled = false,
    invalid,
    required,
    eyedropper = true,
    children,
    className,
    style,
    id: idProp,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const baseId = useIsomorphicId()
  const hexId = idProp ?? `${baseId}-hex`

  const [hex, setHex] = useControllableState<string>({
    value: value === undefined ? undefined : toHex(parseColor(value) ?? FALLBACK_RGB, alpha),
    defaultValue: toHex(parseColor(defaultValue ?? FALLBACK) ?? FALLBACK_RGB, alpha),
    onChange: onValueChange,
  })

  // HSV is the working state: hex loses hue at zero saturation and zero brightness, so the
  // sliders would jump if they were derived from hex alone. It is re-derived only when hex
  // changed from outside — a commit from a control updates both together, so it matches.
  const [hsv, setHsv] = useState<HSVA>(() => hsvFrom(hex))
  const lastHex = useRef(hex)
  if (lastHex.current !== hex) {
    lastHex.current = hex
    if (toHex(hsvToRgb(hsv), alpha) !== hex) setHsv(hsvFrom(hex))
  }

  const commit = (next: HSVA) => {
    if (disabled) return
    setHsv(next)
    setHex(toHex(hsvToRgb(next), alpha))
  }

  // Hex text field: type freely, commit on Enter/blur, revert what does not parse.
  const [draft, setDraft] = useState(hex)
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (!editing) setDraft(hex)
  }, [hex, editing])
  const draftValid = parseColor(draft) !== null
  const commitDraft = () => {
    setEditing(false)
    const rgb = parseColor(draft)
    if (rgb) commit({ ...rgbToHsv(rgb), a: alpha ? rgb.a : 1 })
    else setDraft(hex)
  }

  // EyeDropper, where it exists — decided after mount so the server never guesses.
  const [canPick, setCanPick] = useState(false)
  useEffect(() => {
    setCanPick(eyedropper && typeof window !== 'undefined' && 'EyeDropper' in window)
  }, [eyedropper])
  const pickFromScreen = async () => {
    const Ctor = (window as unknown as { EyeDropper?: new () => EyeDropperLike }).EyeDropper
    if (!Ctor) return
    try {
      const { sRGBHex } = await new Ctor().open()
      const rgb = parseColor(sRGBHex)
      if (rgb) commit({ ...rgbToHsv(rgb), a: hsv.a })
    } catch {
      // The user pressed Escape; nothing to do.
    }
  }

  // Saturation/brightness area: pointer only, hidden from AT (the sliders say the same).
  const areaRef = useRef<HTMLDivElement | null>(null)
  const dragging = useRef(false)
  const pointAt = (event: PointerEvent<HTMLDivElement>) => {
    const rect = areaRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return
    const s = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100))
    const v = Math.min(100, Math.max(0, 100 - ((event.clientY - rect.top) / rect.height) * 100))
    commit({ ...hsv, s: Math.round(s * 100) / 100, v: Math.round(v * 100) / 100 })
  }
  const onAreaPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    dragging.current = true
    event.currentTarget.setPointerCapture?.(event.pointerId)
    pointAt(event)
  }
  const onAreaPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) pointAt(event)
  }
  const onAreaPointerUp = () => {
    dragging.current = false
  }

  const range = (
    field: 'h' | 's' | 'v' | 'a',
    ariaLabel: string,
    max: number,
    valueText: string,
    modifier: string,
  ) => (
    <input
      type="range"
      className={`vk-color-picker__range vk-color-picker__range--${modifier}`}
      aria-label={ariaLabel}
      aria-valuetext={valueText}
      min={0}
      max={max}
      step={1}
      value={Math.round(field === 'a' ? hsv.a * 100 : hsv[field])}
      disabled={disabled}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        const n = Number(event.target.value)
        commit(field === 'a' ? { ...hsv, a: n / 100 } : { ...hsv, [field]: n })
      }}
    />
  )

  const rgb = hsvToRgb(hsv)
  const solid = toHex({ ...rgb, a: 1 })
  const vars = {
    '--vk-color-picker-hue': `${Math.round(hsv.h)}`,
    '--vk-color-picker-x': `${hsv.s}%`,
    '--vk-color-picker-y': `${100 - hsv.v}%`,
    '--vk-color-picker-solid': solid,
    '--vk-color-picker-current': `rgb(${Math.round(rgb.r)} ${Math.round(rgb.g)} ${Math.round(rgb.b)} / ${hsv.a})`,
  } as CSSProperties

  const panel = (
    <div className="vk-color-picker__panel">
      <div
        ref={areaRef}
        className="vk-color-picker__area"
        aria-hidden="true"
        onPointerDown={onAreaPointerDown}
        onPointerMove={onAreaPointerMove}
        onPointerUp={onAreaPointerUp}
        onPointerCancel={onAreaPointerUp}
      >
        <span className="vk-color-picker__thumb" />
      </div>
      <div className="vk-color-picker__sliders">
        {range('h', 'Hue', 360, `${Math.round(hsv.h)} degrees`, 'hue')}
        {range('s', 'Saturation', 100, `${Math.round(hsv.s)}%`, 'saturation')}
        {range('v', 'Brightness', 100, `${Math.round(hsv.v)}%`, 'brightness')}
        {alpha ? range('a', 'Alpha', 100, `${Math.round(hsv.a * 100)}%`, 'alpha') : null}
      </div>
      <div className="vk-color-picker__row">
        <span className="vk-color-picker__preview" aria-hidden="true" />
        <input
          id={hexId}
          type="text"
          className="vk-color-picker__hex"
          aria-label="Hex colour"
          aria-invalid={invalid || !draftValid || undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          value={draft}
          disabled={disabled}
          onFocus={() => setEditing(true)}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commitDraft()
              event.currentTarget.blur()
            } else if (event.key === 'Escape') {
              setDraft(hex)
              setEditing(false)
            }
          }}
        />
        {canPick ? (
          <button
            type="button"
            className="vk-color-picker__eyedropper"
            aria-label="Pick a colour from the screen"
            disabled={disabled}
            onClick={pickFromScreen}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 9l4 4M3 21l1-4 9-9 3 3-9 9-4 1zM15 5l2-2a2 2 0 0 1 3 3l-2 2" />
            </svg>
          </button>
        ) : null}
      </div>
      {presets && presets.length > 0 ? (
        <div className="vk-color-picker__presets" role="group" aria-label="Presets">
          {presets.map((preset) => {
            const rgbPreset = parseColor(preset)
            if (!rgbPreset) return null
            const presetHex = toHex(rgbPreset, alpha)
            const selected = presetHex === hex
            return (
              <button
                key={preset}
                type="button"
                className="vk-color-picker__swatch"
                aria-label={preset}
                aria-pressed={selected}
                disabled={disabled}
                style={{ '--vk-color-picker-swatch': preset } as CSSProperties}
                onClick={() => commit({ ...rgbToHsv(rgbPreset), a: alpha ? rgbPreset.a : 1 })}
              />
            )
          })}
        </div>
      ) : null}
      {children}
    </div>
  )

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className={cx('vk-color-picker', className)}
      data-variant={variant}
      data-size={size}
      data-disabled={disabled ? '' : undefined}
      data-alpha={alpha ? '' : undefined}
      style={{ ...vars, ...style }}
      {...rest}
    >
      {variant === 'popover' ? (
        <Popover>
          <Popover.Trigger
            className="vk-color-picker__trigger"
            aria-label={`${label}: ${hex}`}
            disabled={disabled}
          >
            <span className="vk-color-picker__preview" aria-hidden="true" />
            <span className="vk-color-picker__trigger-text">{hex}</span>
          </Popover.Trigger>
          <Popover.Content className="vk-color-picker__popover" style={vars}>
            {panel}
          </Popover.Content>
        </Popover>
      ) : (
        panel
      )}
      {name ? <input type="hidden" name={name} value={hex} /> : null}
    </div>
  )
})
