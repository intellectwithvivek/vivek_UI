import { render, screen, within } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Checkbox } from './checkbox'
import { Field } from './field'
import { Input } from './input'
import { Label } from './label'
import { Radio, RadioGroup } from './radio-group'
import { Select } from './select'
import { Switch } from './switch'
import { Textarea } from './textarea'

describe('Label', () => {
  it('associates with a control via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <Input id="email" />
      </>,
    )
    expect(screen.getByLabelText('Email')).toBe(screen.getByRole('textbox'))
  })

  it('hides the required marker from assistive tech', () => {
    render(<Label required>Email</Label>)
    // The control's own `required` is what gets announced; the asterisk would
    // otherwise be read as "star" on every single field.
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Input', () => {
  it('defaults to a text input at size md', () => {
    render(<Input aria-label="Name" />)
    const el = screen.getByRole('textbox', { name: 'Name' })
    expect(el).toHaveAttribute('type', 'text')
    expect(el).toHaveAttribute('data-size', 'md')
  })

  it('sets aria-invalid only when invalid', () => {
    const { rerender } = render(<Input aria-label="Name" />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
    rerender(<Input aria-label="Name" invalid />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('passes native attributes straight through', () => {
    render(
      <Input
        aria-label="Email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        maxLength={64}
      />,
    )
    const el = screen.getByRole('textbox', { name: 'Email' })
    expect(el).toHaveAttribute('type', 'email')
    expect(el).toHaveAttribute('autocomplete', 'email')
    expect(el).toHaveAttribute('maxlength', '64')
    expect(el).toBeRequired()
  })

  it('forwards its ref and merges className', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input aria-label="Name" ref={ref} className="mine" />)
    expect(ref.current).toBe(screen.getByRole('textbox'))
    expect(ref.current?.className).toBe('vk-input mine')
  })
})

describe('Textarea', () => {
  it('renders with sensible defaults', () => {
    render(<Textarea aria-label="Bio" />)
    const el = screen.getByRole('textbox', { name: 'Bio' })
    expect(el.tagName).toBe('TEXTAREA')
    expect(el).toHaveAttribute('rows', '3')
    expect(el).toHaveAttribute('data-resize', 'vertical')
  })
})

describe('Select', () => {
  it('renders options from data', () => {
    render(
      <Select
        aria-label="Role"
        options={[
          { value: 'dev', label: 'Developer' },
          { value: 'des', label: 'Designer' },
        ]}
      />,
    )
    const el = screen.getByRole('combobox', { name: 'Role' })
    expect(within(el).getAllByRole('option')).toHaveLength(2)
    expect(screen.getByRole('option', { name: 'Developer' })).toHaveValue('dev')
  })

  it('adds a disabled placeholder option', () => {
    render(
      <Select aria-label="Role" placeholder="Choose one" options={[{ value: 'a', label: 'A' }]} />,
    )
    const placeholder = screen.getByRole('option', { name: 'Choose one' })
    expect(placeholder).toBeDisabled()
    expect(placeholder).toHaveValue('')
  })

  it('honours a disabled option', () => {
    render(
      <Select
        aria-label="Role"
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B', disabled: true },
        ]}
      />,
    )
    expect(screen.getByRole('option', { name: 'B' })).toBeDisabled()
  })

  it('lets children override the options prop', () => {
    render(
      <Select aria-label="Role" options={[{ value: 'ignored', label: 'Ignored' }]}>
        <option value="custom">Custom</option>
      </Select>,
    )
    expect(screen.queryByRole('option', { name: 'Ignored' })).toBeNull()
    expect(screen.getByRole('option', { name: 'Custom' })).toBeInTheDocument()
  })

  it('forwards the ref to the select itself, not the wrapper', () => {
    const ref = createRef<HTMLSelectElement>()
    render(<Select aria-label="Role" ref={ref} options={[]} />)
    expect(ref.current).toBeInstanceOf(HTMLSelectElement)
  })
})

describe('Checkbox', () => {
  it('is labelled by its label prop', () => {
    render(<Checkbox label="Subscribe" />)
    expect(screen.getByRole('checkbox', { name: 'Subscribe' })).toBeInTheDocument()
  })

  it('toggles like a native checkbox', () => {
    const onChange = vi.fn()
    render(<Checkbox label="Subscribe" onChange={onChange} />)
    const box = screen.getByRole('checkbox')
    expect(box).not.toBeChecked()
    box.click()
    expect(box).toBeChecked()
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('supports uncontrolled defaultChecked', () => {
    render(<Checkbox label="Subscribe" defaultChecked />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('does not toggle when disabled', () => {
    render(<Checkbox label="Subscribe" disabled />)
    const box = screen.getByRole('checkbox')
    box.click()
    expect(box).not.toBeChecked()
  })

  it('keeps the input focusable rather than display:none', () => {
    render(<Checkbox label="Subscribe" />)
    const box = screen.getByRole('checkbox')
    box.focus()
    expect(box).toHaveFocus()
  })

  it('renders a description alongside the label', () => {
    render(<Checkbox label="Subscribe" description="Weekly, no spam." />)
    expect(screen.getByText('Weekly, no spam.')).toBeInTheDocument()
  })
})

describe('Switch', () => {
  it('exposes the switch role, not checkbox', () => {
    render(<Switch label="Dark mode" />)
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).toBeNull()
  })

  it('toggles on and off', () => {
    render(<Switch label="Dark mode" />)
    const toggle = screen.getByRole('switch')
    expect(toggle).not.toBeChecked()
    toggle.click()
    expect(toggle).toBeChecked()
  })

  it('participates in a form by name and value', () => {
    render(
      <form data-testid="f">
        <Switch label="Dark mode" name="theme" defaultChecked />
      </form>,
    )
    const form = screen.getByTestId('f') as HTMLFormElement
    expect(new FormData(form).get('theme')).toBe('on')
  })
})

describe('Radio', () => {
  // `Radio` is exported, so it is public API, but every RadioGroup test used the `options`
  // prop - which means the `children` path, the whole reason `Radio` is exported, had never
  // been rendered by anything.
  it('renders inside a RadioGroup and takes part in the same native group', () => {
    render(
      <RadioGroup label="Delivery" name="delivery">
        <Radio value="standard" label="Standard" />
        <Radio value="express" label="Express" description="Next working day" />
      </RadioGroup>,
    )
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
    // The shared name is what makes them mutually exclusive without any JavaScript.
    for (const radio of radios) expect(radio).toHaveAttribute('name', 'delivery')
  })

  it('labels itself from its label and description together', () => {
    // The description sits inside the `<label>`, so it lands in the accessible *name*
    // rather than in `aria-describedby`. That is consistent across Checkbox, Switch and
    // Radio, and the wording is announced either way - pinned here so the choice is
    // deliberate rather than accidental.
    render(
      <RadioGroup label="Delivery" name="delivery">
        <Radio value="express" label="Express" description="Next working day" />
      </RadioGroup>,
    )
    // Matched loosely rather than exactly: jsdom concatenates adjacent spans with no
    // separator, while a real browser inserts a space between block-level boxes. Both
    // strings being in the name is the part that matters.
    expect(screen.getByRole('radio', { name: /Express/ })).toHaveAccessibleName(
      /Express\s*Next working day/,
    )
  })

  it('selects on click and reports through the group', () => {
    const onChange = vi.fn()
    render(
      <RadioGroup label="Delivery" name="delivery" onChange={onChange}>
        <Radio value="standard" label="Standard" />
        <Radio value="express" label="Express" />
      </RadioGroup>,
    )
    screen.getByRole('radio', { name: /Express/ }).click()
    expect(onChange).toHaveBeenCalledWith('express')
  })

  it('forwards a ref to the input, so a form library can register it', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <RadioGroup label="Delivery" name="delivery">
        <Radio ref={ref} value="standard" label="Standard" />
      </RadioGroup>,
    )
    expect(ref.current?.tagName).toBe('INPUT')
    expect(ref.current?.type).toBe('radio')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <RadioGroup label="Delivery" name="delivery">
        <Radio value="standard" label="Standard" />
        <Radio value="express" label="Express" description="Next working day" />
      </RadioGroup>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('RadioGroup', () => {
  it('names the group with a legend and no ARIA', () => {
    render(
      <RadioGroup
        name="plan"
        label="Choose a plan"
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
        ]}
      />,
    )
    expect(screen.getByRole('group', { name: 'Choose a plan' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
  })

  it('shares one name so the browser enforces single selection', () => {
    render(
      <RadioGroup
        name="plan"
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
        ]}
      />,
    )
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toHaveAttribute('name', 'plan')
    }
  })

  it('honours defaultValue when uncontrolled', () => {
    render(
      <RadioGroup
        name="plan"
        defaultValue="pro"
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
        ]}
      />,
    )
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Free' })).not.toBeChecked()
  })

  it('reports the selected value through onChange', () => {
    const onChange = vi.fn()
    render(
      <RadioGroup
        name="plan"
        onChange={onChange}
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
        ]}
      />,
    )
    screen.getByRole('radio', { name: 'Pro' }).click()
    expect(onChange).toHaveBeenCalledWith('pro')
  })

  it('reflects a controlled value', () => {
    render(
      <RadioGroup
        name="plan"
        value="free"
        onChange={() => {}}
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
        ]}
      />,
    )
    expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked()
  })

  it('disables every radio when the fieldset is disabled', () => {
    render(
      <RadioGroup
        name="plan"
        disabled
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
        ]}
      />,
    )
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled()
  })
})

describe('Field', () => {
  it('labels the control it wraps, with no manual id', () => {
    render(
      <Field label="Email address">
        <Input />
      </Field>,
    )
    expect(screen.getByLabelText('Email address')).toBe(screen.getByRole('textbox'))
  })

  it('wires help text through aria-describedby', () => {
    render(
      <Field label="Email" help="We will never share it.">
        <Input />
      </Field>,
    )
    const input = screen.getByRole('textbox')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy as string)).toHaveTextContent(
      'We will never share it.',
    )
  })

  it('describes by the error instead of the help when invalid', () => {
    render(
      <Field label="Email" help="We will never share it." error="That is not an email.">
        <Input />
      </Field>,
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')

    const describedBy = input.getAttribute('aria-describedby') as string
    const message = document.getElementById(describedBy)
    // The user needs the reason their input was rejected, not the hint.
    expect(message).toHaveTextContent('That is not an email.')
    expect(screen.queryByText('We will never share it.')).toBeNull()
  })

  it('announces the error as a live region', () => {
    render(
      <Field label="Email" error="Required.">
        <Input />
      </Field>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Required.')
  })

  it('propagates required to both the marker and the control', () => {
    render(
      <Field label="Email" required>
        <Input />
      </Field>,
    )
    expect(screen.getByRole('textbox')).toBeRequired()
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
  })

  it('respects an explicit id over the generated one', () => {
    render(
      <Field label="Email" id="my-email">
        <Input />
      </Field>,
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'my-email')
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'my-email')
  })

  it('generates distinct ids for sibling fields', () => {
    render(
      <>
        <Field label="First">
          <Input />
        </Field>
        <Field label="Last">
          <Input />
        </Field>
      </>,
    )
    const [first, last] = screen.getAllByRole('textbox')
    expect(first?.id).toBeTruthy()
    expect(first?.id).not.toBe(last?.id)
  })

  it('preserves a consumer aria-describedby alongside its own', () => {
    render(
      <>
        <span id="outside">Extra context</span>
        <Field label="Email" help="Hint">
          <Input aria-describedby="outside" />
        </Field>
      </>,
    )
    const ids = screen.getByRole('textbox').getAttribute('aria-describedby')?.split(' ')
    expect(ids).toContain('outside')
    expect(ids?.length).toBe(2)
  })

  it('works with Textarea and Select too', () => {
    render(
      <>
        <Field label="Bio">
          <Textarea />
        </Field>
        <Field label="Role">
          <Select options={[{ value: 'a', label: 'A' }]} />
        </Field>
      </>,
    )
    expect(screen.getByLabelText('Bio').tagName).toBe('TEXTAREA')
    expect(screen.getByLabelText('Role').tagName).toBe('SELECT')
  })
})

describe('forms a11y', () => {
  it('has no axe violations for a complete form', async () => {
    const { container } = render(
      <form>
        <Field label="Full name" required>
          <Input autoComplete="name" />
        </Field>
        <Field label="Email" help="We will never share it.">
          <Input type="email" autoComplete="email" />
        </Field>
        <Field label="Message" error="Please tell us something.">
          <Textarea />
        </Field>
        <Field label="Role">
          <Select placeholder="Choose" options={[{ value: 'dev', label: 'Developer' }]} />
        </Field>
        <RadioGroup
          name="plan"
          label="Plan"
          options={[
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro', description: 'Everything included' },
          ]}
        />
        <Checkbox label="Subscribe" description="Weekly, no spam." />
        <Switch label="Dark mode" />
      </form>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations for invalid and disabled states', async () => {
    const { container } = render(
      <form>
        <Field label="Email" error="Invalid address.">
          <Input type="email" />
        </Field>
        <Checkbox label="Disabled option" disabled />
        <Switch label="Disabled toggle" disabled />
        <RadioGroup
          name="p"
          label="Disabled group"
          disabled
          options={[{ value: 'a', label: 'A' }]}
        />
      </form>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
