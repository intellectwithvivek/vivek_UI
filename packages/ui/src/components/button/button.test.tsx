import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Button, type ButtonProps } from './button'

const VARIANTS: NonNullable<ButtonProps['variant']>[] = ['solid', 'outline', 'ghost', 'link']
const SIZES: NonNullable<ButtonProps['size']>[] = ['sm', 'md', 'lg']

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Get started</Button>)
    expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument()
  })

  it('renders sensibly with zero props', () => {
    render(<Button />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('vk-button')
    expect(button).toHaveAttribute('data-variant', 'solid')
    expect(button).toHaveAttribute('data-size', 'md')
    expect(button).not.toBeDisabled()
  })

  it.each(VARIANTS)('maps variant="%s" onto data-variant', (variant) => {
    render(<Button variant={variant}>Label</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant)
  })

  it.each(SIZES)('maps size="%s" onto data-size', (size) => {
    render(<Button size={size}>Label</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-size', size)
  })

  it('merges a consumer className instead of replacing vk-button', () => {
    render(<Button className="my-button promo">Label</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('vk-button', 'my-button', 'promo')
    expect(button.className).toBe('vk-button my-button promo')
  })

  it('merges a consumer style object', () => {
    render(<Button style={{ marginTop: '8px' }}>Label</Button>)
    expect(screen.getByRole('button')).toHaveStyle({ marginTop: '8px' })
  })

  it('forwards the ref to the underlying <button> element', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Label</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current).toBe(screen.getByRole('button'))
  })

  it('omits data-full-width and data-loading unless asked', () => {
    render(<Button>Label</Button>)
    const button = screen.getByRole('button')
    expect(button).not.toHaveAttribute('data-full-width')
    expect(button).not.toHaveAttribute('data-loading')
  })

  it('sets data-full-width when fullWidth is passed', () => {
    render(<Button fullWidth>Label</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-full-width', 'true')
  })

  describe('loading', () => {
    it('disables the button and renders an aria-hidden spinner', () => {
      render(<Button loading>Saving</Button>)
      const button = screen.getByRole('button', { name: 'Saving' })
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('data-loading', 'true')

      const spinner = button.querySelector('.vk-button__spinner')
      expect(spinner).not.toBeNull()
      expect(spinner).toHaveAttribute('aria-hidden', 'true')
    })

    it('does not render a spinner when idle', () => {
      render(<Button>Save</Button>)
      expect(screen.getByRole('button').querySelector('.vk-button__spinner')).toBeNull()
    })

    it('swallows clicks while loading', () => {
      const onClick = vi.fn()
      render(
        <Button loading onClick={onClick}>
          Saving
        </Button>,
      )
      screen.getByRole('button').click()
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  it('stays disabled when disabled is passed without loading', () => {
    render(<Button disabled>Label</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).not.toHaveAttribute('data-loading')
  })

  it('spreads arbitrary host props onto the root element', () => {
    render(
      <Button type="submit" aria-label="Submit the form" id="cta" data-testid="cta-button">
        Go
      </Button>,
    )
    const button = screen.getByTestId('cta-button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('aria-label', 'Submit the form')
    expect(button).toHaveAttribute('id', 'cta')
  })

  it('fires onClick when enabled', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Label</Button>)
    screen.getByRole('button').click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  describe('asChild', () => {
    // Found by building a real page: `Button` had no `asChild` while Navbar.Link,
    // Sidebar.Item and Breadcrumb.Item did, so "a button that navigates" - the single
    // most common need in any app - had no correct answer.
    it('renders the caller element instead of a button', () => {
      render(
        <Button asChild>
          <a href="/pricing">Pricing</a>
        </Button>,
      )
      const link = screen.getByRole('link', { name: 'Pricing' })
      expect(link.tagName).toBe('A')
      expect(screen.queryByRole('button')).toBeNull()
    })

    it('passes its styling onto the caller element', () => {
      render(
        <Button asChild variant="outline" size="lg" fullWidth>
          <a href="/x">Go</a>
        </Button>,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveClass('vk-button')
      expect(link).toHaveAttribute('data-variant', 'outline')
      expect(link).toHaveAttribute('data-size', 'lg')
      expect(link).toHaveAttribute('data-full-width', 'true')
    })

    it('merges the caller className rather than replacing it', () => {
      render(
        <Button asChild className="mine">
          <a className="theirs" href="/x">
            Go
          </a>
        </Button>,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveClass('vk-button', 'mine', 'theirs')
    })

    it('forwards the ref to the caller element', () => {
      const ref = createRef<HTMLButtonElement>()
      render(
        <Button asChild ref={ref}>
          <a href="/x">Go</a>
        </Button>,
      )
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
    })

    it('keeps the caller own handler working alongside ours', () => {
      const ours = vi.fn()
      const theirs = vi.fn()
      render(
        <Button asChild onClick={ours}>
          {/* biome-ignore lint/a11y/useValidAnchor: exercising handler composition, not navigation */}
          <a href="#x" onClick={theirs}>
            Go
          </a>
        </Button>,
      )
      screen.getByRole('link').click()
      expect(theirs).toHaveBeenCalledTimes(1)
      expect(ours).toHaveBeenCalledTimes(1)
    })

    it('does not put disabled or a spinner on a non-button element', () => {
      render(
        <Button asChild loading disabled>
          <a href="/x">Go</a>
        </Button>,
      )
      const link = screen.getByRole('link')
      // `disabled` is not valid on an anchor, and a spinner would fight the caller's
      // children. Documented on the prop: use a real button for pending states.
      expect(link).not.toHaveAttribute('disabled')
      expect(link.querySelector('.vk-button__spinner')).toBeNull()
    })

    it('has no axe violations as a link', async () => {
      const { container } = render(
        <Button asChild>
          <a href="/pricing">Pricing</a>
        </Button>,
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  describe('accessibility', () => {
    it('has no axe violations in its default state', async () => {
      const { container } = render(<Button>Get started</Button>)
      expect(await axe(container)).toHaveNoViolations()
    })

    it('has no axe violations when disabled', async () => {
      const { container } = render(<Button disabled>Get started</Button>)
      expect(await axe(container)).toHaveNoViolations()
    })

    it('has no axe violations while loading', async () => {
      const { container } = render(<Button loading>Saving</Button>)
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
