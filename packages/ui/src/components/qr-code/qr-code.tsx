import { type CSSProperties, forwardRef, type SVGAttributes, useMemo } from 'react'
import { cx } from '../../utils/cx'
import { encodeQr, type QrLevel } from '../../utils/qr'

export interface QRCodeImage {
  src: string
  /** Fraction of the code's side the image covers. Default `0.2`; keep it under `0.3`. */
  size?: number
}

export interface QRCodeProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  /** The text or URL to encode. Encoded as UTF-8 in byte mode. */
  value?: string
  /**
   * Error-correction level. Default `M` (15 % recoverable). Use `H` (30 %) when placing
   * an `image` over the code. The level is raised for free when the chosen version has room.
   */
  level?: QrLevel
  /** Rendered side in CSS pixels. The SVG scales; `style={{ width: '100%' }}` also works. Default `160`. */
  size?: number
  /** Quiet zone in modules. Scanners want 4; use less only inside a generous light frame. Default `4`. */
  margin?: number
  /** Accessible name. Default `QR code: {value}`. */
  label?: string
  /** `round` draws each module as a dot. Default `square`. */
  moduleShape?: 'square' | 'round'
  /** A logo in the centre. Modules underneath are cleared; pair it with `level="H"`. */
  image?: QRCodeImage
  /** Dark module colour. Default `#000`. Scanners want strong contrast, so the theme is not consulted. */
  fg?: string
  /** Background colour. Default `#fff`. */
  bg?: string
}

/**
 * A QR code, rendered as crisp SVG from an in-house encoder — no dependency, no canvas.
 *
 * It is an image with a name: `role="img"` and an `aria-label` that says what it encodes,
 * so a screen-reader user learns the URL instead of "graphic". Sizing is by `size`, and
 * the SVG scales cleanly to any width. Defaults are the ones that scan: black on white, a
 * four-module quiet zone, level M with a free upgrade when the version has room.
 *
 * Byte mode, versions 1–40. Text that does not fit at the requested level throws a
 * `RangeError` at render — 2,953 bytes at level L is the ceiling.
 */
export const QRCode = forwardRef<SVGSVGElement, QRCodeProps>(function QRCode(
  {
    value = '',
    level = 'M',
    size = 160,
    margin = 4,
    label,
    moduleShape = 'square',
    image,
    fg,
    bg,
    className,
    style,
    ...rest
  },
  ref,
) {
  const code = useMemo(() => encodeQr(value, level), [value, level])
  const quiet = Math.max(0, Math.floor(margin))
  const side = code.size + quiet * 2

  // Modules under a centre image are cleared so the logo does not fight the data.
  const cutout = useMemo(() => {
    if (!image) return null
    const fraction = Math.min(0.3, Math.max(0.05, image.size ?? 0.2))
    const modules = Math.max(1, Math.round(code.size * fraction))
    const start = Math.floor((code.size - modules) / 2)
    return { start, end: start + modules, modules }
  }, [image, code.size])

  const path = useMemo(() => {
    const parts: string[] = []
    for (let y = 0; y < code.size; y += 1) {
      const row = code.modules[y]
      if (!row) continue
      for (let x = 0; x < code.size; x += 1) {
        if (!row[x]) continue
        if (cutout && x >= cutout.start && x < cutout.end && y >= cutout.start && y < cutout.end) {
          continue
        }
        const px = x + quiet
        const py = y + quiet
        if (moduleShape === 'round') {
          parts.push(`M${px + 0.5} ${py + 0.1}a.4 .4 0 1 0 0 .8a.4 .4 0 1 0 0-.8z`)
        } else {
          parts.push(`M${px} ${py}h1v1h-1z`)
        }
      }
    }
    return parts.join('')
  }, [code, quiet, moduleShape, cutout])

  const vars: Record<string, string> = {}
  if (fg) vars['--vk-qr-fg'] = fg
  if (bg) vars['--vk-qr-bg'] = bg

  return (
    <svg
      ref={ref}
      role="img"
      aria-label={label ?? `QR code: ${value}`}
      viewBox={`0 0 ${side} ${side}`}
      width={size}
      height={size}
      shapeRendering={moduleShape === 'round' ? 'geometricPrecision' : 'crispEdges'}
      className={cx('vk-qr-code', className)}
      data-version={code.version}
      data-level={code.level}
      style={{ ...vars, ...style } as CSSProperties}
      {...rest}
    >
      <rect width={side} height={side} fill="var(--vk-qr-bg, #fff)" />
      <path d={path} fill="var(--vk-qr-fg, #000)" />
      {image && cutout ? (
        <image
          href={image.src}
          x={cutout.start + quiet}
          y={cutout.start + quiet}
          width={cutout.modules}
          height={cutout.modules}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : null}
    </svg>
  )
})
