/**
 * ColorPicker. The maths is proven in `utils/color.test.ts`; this covers the control
 * contract: named sliders with spoken values, a hex field that commits and reverts,
 * presets, alpha, the pointer area, the popover variant, the form hook-up and Field's
 * injected props.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ColorPicker } from './color-picker'

const slider = (name: string) => screen.getByRole('slider', { name })
const hexField = () => screen.getByRole('textbox', { name: 'Hex colour' }) as HTMLInputElement
const root = () => screen.getByRole('group', { name: 'Colour picker' })

afterEach(() => vi.unstubAllGlobals())

describe('ColorPicker · structure', () => {
  it('renders with zero props: a named group, three named sliders and a hex field at the default blue', () => {
    render(<ColorPicker />)
    expect(root()).toBeInTheDocument()
    expect(slider('Hue')).toHaveValue('217')
    expect(slider('Hue')).toHaveAttribute('aria-valuetext', '217 degrees')
    expect(slider('Saturation')).toHaveAttribute('aria-valuetext', '76%')
    expect(slider('Brightness')).toHaveAttribute('aria-valuetext', '96%')
    expect(screen.queryByRole('slider', { name: 'Alpha' })).toBeNull()
    expect(hexField()).toHaveValue('#3b82f6')
    expect(root().style.getPropertyValue('--vk-color-picker-solid')).toBe('#3b82f6')
  })

  it('takes any parseable defaultValue and normalises it to lower-case hex', () => {
    render(<ColorPicker defaultValue="rgb(255, 0, 0)" />)
    expect(hexField()).toHaveValue('#ff0000')
    expect(slider('Hue')).toHaveValue('0')
  })

  it('label, size, className, style, rest and the Field-injected id / aria-describedby land where they should', () => {
    render(
      <>
        <p id="hint">Pick a brand colour</p>
        <ColorPicker
          label="Brand"
          size="sm"
          className="mine"
          style={{ margin: 4 }}
          data-x="y"
          id="brand"
          aria-describedby="hint"
          invalid
        />
      </>,
    )
    const group = screen.getByRole('group', { name: 'Brand' })
    expect(group).toHaveAttribute('data-size', 'sm')
    expect(group).toHaveClass('vk-color-picker', 'mine')
    expect(group).toHaveStyle({ margin: '4px' })
    expect(group).toHaveAttribute('data-x', 'y')
    expect(hexField()).toHaveAttribute('id', 'brand')
    expect(hexField()).toHaveAccessibleDescription('Pick a brand colour')
    expect(hexField()).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('ColorPicker · changing the colour', () => {
  it('the hue slider changes the colour and reports hex', () => {
    const onValueChange = vi.fn()
    render(<ColorPicker defaultValue="#ff0000" onValueChange={onValueChange} />)
    fireEvent.change(slider('Hue'), { target: { value: '120' } })
    expect(onValueChange).toHaveBeenLastCalledWith('#00ff00')
    expect(hexField()).toHaveValue('#00ff00')
    fireEvent.change(slider('Brightness'), { target: { value: '50' } })
    expect(onValueChange).toHaveBeenLastCalledWith('#008000')
    fireEvent.change(slider('Saturation'), { target: { value: '0' } })
    expect(onValueChange).toHaveBeenLastCalledWith('#808080')
    // Hue survives zero saturation, so raising saturation brings the green back.
    fireEvent.change(slider('Saturation'), { target: { value: '100' } })
    expect(onValueChange).toHaveBeenLastCalledWith('#008000')
  })

  it('the hex field commits on Enter or blur, accepts short forms, and reverts nonsense', () => {
    const onValueChange = vi.fn()
    render(<ColorPicker onValueChange={onValueChange} />)
    const field = hexField()
    fireEvent.focus(field)
    fireEvent.change(field, { target: { value: 'f00' } })
    expect(field).not.toHaveAttribute('aria-invalid')
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(onValueChange).toHaveBeenLastCalledWith('#ff0000')
    expect(slider('Hue')).toHaveValue('0')
    fireEvent.focus(field)
    fireEvent.change(field, { target: { value: 'not a colour' } })
    expect(field).toHaveAttribute('aria-invalid', 'true')
    fireEvent.blur(field)
    expect(field).toHaveValue('#ff0000')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    fireEvent.focus(field)
    fireEvent.change(field, { target: { value: '#00f' } })
    fireEvent.keyDown(field, { key: 'Escape' })
    expect(field).toHaveValue('#ff0000')
  })

  it('presets are pressed toggles that set the colour', () => {
    const onValueChange = vi.fn()
    render(<ColorPicker presets={['#ef4444', '#10b981', 'nope']} onValueChange={onValueChange} />)
    const group = screen.getByRole('group', { name: 'Presets' })
    expect(group.querySelectorAll('button')).toHaveLength(2) // the unparseable one is skipped
    fireEvent.click(screen.getByRole('button', { name: '#10b981' }))
    expect(onValueChange).toHaveBeenLastCalledWith('#10b981')
    expect(screen.getByRole('button', { name: '#10b981' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '#ef4444' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('alpha adds a slider and eight-digit output; the hidden input posts it', () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <ColorPicker alpha defaultValue="#3b82f6" name="brand" onValueChange={onValueChange} />,
    )
    expect(hexField()).toHaveValue('#3b82f6ff')
    fireEvent.change(slider('Alpha'), { target: { value: '50' } })
    expect(onValueChange).toHaveBeenLastCalledWith('#3b82f680')
    expect(slider('Alpha')).toHaveAttribute('aria-valuetext', '50%')
    expect(container.querySelector('input[type="hidden"][name="brand"]')).toHaveValue('#3b82f680')
  })

  it('the area follows the pointer within its box', () => {
    const onValueChange = vi.fn()
    render(<ColorPicker defaultValue="#ff0000" onValueChange={onValueChange} />)
    const area = root().querySelector('.vk-color-picker__area') as HTMLElement
    area.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect
    fireEvent.pointerDown(area, { clientX: 100, clientY: 0, pointerId: 1 })
    expect(onValueChange).toHaveBeenLastCalledWith('#ff8080') // s 50, v 100
    fireEvent.pointerMove(area, { clientX: 200, clientY: 50, pointerId: 1 })
    expect(onValueChange).toHaveBeenLastCalledWith('#800000') // s 100, v 50
    fireEvent.pointerUp(area, { pointerId: 1 })
    fireEvent.pointerMove(area, { clientX: 0, clientY: 0, pointerId: 1 })
    expect(onValueChange).toHaveBeenCalledTimes(2) // not dragging any more
  })

  it('is controllable: an outside value drives the sliders and the field', () => {
    function Harness() {
      const [v, setV] = useState('#ff0000')
      return (
        <>
          <ColorPicker value={v} onValueChange={setV} />
          <button type="button" onClick={() => setV('#0000ff')}>
            blue
          </button>
        </>
      )
    }
    render(<Harness />)
    fireEvent.click(screen.getByText('blue'))
    expect(hexField()).toHaveValue('#0000ff')
    expect(slider('Hue')).toHaveValue('240')
  })

  it('disabled disables every control and ignores the area', () => {
    const onValueChange = vi.fn()
    render(<ColorPicker disabled presets={['#fff']} onValueChange={onValueChange} />)
    expect(root()).toHaveAttribute('data-disabled')
    for (const s of screen.getAllByRole('slider')) expect(s).toBeDisabled()
    expect(hexField()).toBeDisabled()
    expect(screen.getByRole('button', { name: '#fff' })).toBeDisabled()
    const area = root().querySelector('.vk-color-picker__area') as HTMLElement
    area.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect
    fireEvent.pointerDown(area, { clientX: 10, clientY: 10, pointerId: 1 })
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('ColorPicker · eyedropper and popover', () => {
  it('offers the EyeDropper only where the browser has one, and commits its pick', async () => {
    const { unmount } = render(<ColorPicker />)
    expect(screen.queryByRole('button', { name: 'Pick a colour from the screen' })).toBeNull()
    unmount()
    const open = vi.fn().mockResolvedValue({ sRGBHex: '#123456' })
    vi.stubGlobal(
      'EyeDropper',
      class {
        open = open
      },
    )
    const onValueChange = vi.fn()
    render(<ColorPicker onValueChange={onValueChange} />)
    const pick = await screen.findByRole('button', { name: 'Pick a colour from the screen' })
    fireEvent.click(pick)
    await vi.waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith('#123456'))
    expect(open).toHaveBeenCalled()
  })

  it('the popover variant shows a swatch button that opens the panel', () => {
    render(<ColorPicker variant="popover" label="Accent" defaultValue="#10b981" />)
    expect(screen.queryByRole('slider')).toBeNull()
    const trigger = screen.getByRole('button', { name: 'Accent: #10b981' })
    expect(trigger).toHaveTextContent('#10b981')
    fireEvent.click(trigger)
    expect(slider('Hue')).toBeInTheDocument()
    fireEvent.change(slider('Hue'), { target: { value: '0' } })
    const changed = screen.getByRole('button', { name: /^Accent: #/ })
    expect(changed).not.toHaveTextContent('#10b981')
    expect(changed.textContent).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('has no axe violations, inline and with presets', async () => {
    const { container } = render(<ColorPicker alpha presets={['#ef4444', '#10b981']} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
