/**
 * QRCode. The encoder is proven against a real decoder in `utils/qr.test.ts`; this suite
 * covers the rendering contract: an image with a name, the quiet zone, colours, the
 * centre cut-out, and the §4.1 basics.
 */
import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { QRCode } from './qr-code'

const svg = () => screen.getByRole('img')
const darkModules = () =>
  (svg().querySelector('path')?.getAttribute('d') ?? '').split('M').length - 1

describe('QRCode', () => {
  it('renders with zero props as a named version-1 image', () => {
    render(<QRCode />)
    expect(svg()).toHaveAttribute('aria-label', 'QR code: ')
    expect(svg()).toHaveAttribute('data-version', '1')
    expect(svg()).toHaveAttribute('viewBox', '0 0 29 29') // 21 + 4 + 4
    expect(svg()).toHaveAttribute('width', '160')
    expect(svg()).toHaveAttribute('height', '160')
  })

  it('names itself after the value, or the label', () => {
    const { rerender } = render(<QRCode value="https://ui.vivekkumarsingh.in" />)
    expect(
      screen.getByRole('img', { name: 'QR code: https://ui.vivekkumarsingh.in' }),
    ).toBeInTheDocument()
    rerender(<QRCode value="https://ui.vivekkumarsingh.in" label="Scan to open the docs" />)
    expect(screen.getByRole('img', { name: 'Scan to open the docs' })).toBeInTheDocument()
  })

  it('margin sets the quiet zone; size sets the rendered side; the SVG scales by viewBox', () => {
    render(<QRCode value="hi" margin={0} size={96} />)
    expect(svg()).toHaveAttribute('viewBox', '0 0 21 21')
    expect(svg()).toHaveAttribute('width', '96')
    const rect = svg().querySelector('rect')
    expect(rect).toHaveAttribute('width', '21')
  })

  it('reports the level actually used, honouring the free boost', () => {
    const { rerender } = render(<QRCode value="hi" level="L" />)
    expect(svg()).toHaveAttribute('data-level', 'H')
    rerender(<QRCode value={'x'.repeat(17)} level="L" />)
    expect(svg()).toHaveAttribute('data-level', 'L')
    expect(svg()).toHaveAttribute('data-version', '1')
  })

  it('defaults to black on white and takes fg/bg as variables', () => {
    const { rerender } = render(<QRCode value="hi" />)
    expect(svg().querySelector('rect')).toHaveAttribute('fill', 'var(--vk-qr-bg, #fff)')
    expect(svg().querySelector('path')).toHaveAttribute('fill', 'var(--vk-qr-fg, #000)')
    expect(svg().style.getPropertyValue('--vk-qr-fg')).toBe('')
    rerender(<QRCode value="hi" fg="#123" bg="#fed" />)
    expect(svg().style.getPropertyValue('--vk-qr-fg')).toBe('#123')
    expect(svg().style.getPropertyValue('--vk-qr-bg')).toBe('#fed')
  })

  it('round modules draw arcs instead of squares', () => {
    const { rerender } = render(<QRCode value="hi" />)
    expect(svg().querySelector('path')?.getAttribute('d')).toContain('h1v1h-1z')
    expect(svg()).toHaveAttribute('shape-rendering', 'crispEdges')
    rerender(<QRCode value="hi" moduleShape="round" />)
    expect(svg().querySelector('path')?.getAttribute('d')).toContain('a.4 .4 0 1 0')
    expect(svg()).toHaveAttribute('shape-rendering', 'geometricPrecision')
  })

  it('an image clears the modules beneath it and is placed in the centre', () => {
    const { rerender } = render(<QRCode value="https://ui.vivekkumarsingh.in" level="H" />)
    const before = darkModules()
    rerender(
      <QRCode value="https://ui.vivekkumarsingh.in" level="H" image={{ src: '/logo.svg' }} />,
    )
    expect(darkModules()).toBeLessThan(before)
    const image = svg().querySelector('image')
    expect(image).toHaveAttribute('href', '/logo.svg')
    // 29 bytes at H needs v4 (33 modules): 20 % is 7 modules, starting at 13; plus the 4-module quiet zone.
    expect(svg()).toHaveAttribute('data-version', '4')
    expect(image).toHaveAttribute('width', '7')
    expect(image).toHaveAttribute('x', '17')
    expect(image).toHaveAttribute('y', '17')
  })

  it('throws a RangeError when the value cannot fit', () => {
    expect(() => render(<QRCode value={'a'.repeat(3000)} level="L" />)).toThrow(RangeError)
  })

  it('forwards the ref, merges className and style, spreads rest', () => {
    const ref = createRef<SVGSVGElement>()
    render(<QRCode ref={ref} value="hi" className="mine" style={{ margin: 8 }} data-x="y" />)
    expect(ref.current).toBe(svg())
    expect(svg()).toHaveClass('vk-qr-code', 'mine')
    expect(svg()).toHaveStyle({ margin: '8px' })
    expect(svg()).toHaveAttribute('data-x', 'y')
  })

  it('has no axe violations', async () => {
    const { container } = render(<QRCode value="https://ui.vivekkumarsingh.in" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
