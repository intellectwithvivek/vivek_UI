import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Alert } from './alert'
import { Progress } from './progress'
import { Skeleton } from './skeleton'
import { Spinner } from './spinner'

describe('Spinner', () => {
  it('announces itself as a status by default', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading')
  })

  it('accepts a custom label', () => {
    render(<Spinner label="Saving your work" />)
    expect(screen.getByRole('status')).toHaveTextContent('Saving your work')
  })

  it('goes fully decorative when label is null', () => {
    render(<Spinner label={null} data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).not.toHaveAttribute('role')
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(<Spinner />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Skeleton', () => {
  it('is hidden from assistive technology', () => {
    render(<Skeleton data-testid="s" />)
    expect(screen.getByTestId('s')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders one node for a single line', () => {
    render(<Skeleton data-testid="s" />)
    expect(screen.getByTestId('s')).toHaveClass('vk-skeleton')
  })

  it('renders a group of n nodes for multiple lines', () => {
    render(<Skeleton lines={3} data-testid="s" />)
    const group = screen.getByTestId('s')
    expect(group).toHaveClass('vk-skeleton-group')
    expect(group.querySelectorAll('.vk-skeleton')).toHaveLength(3)
  })

  it('applies width and height', () => {
    render(<Skeleton variant="rect" width="10rem" height={40} data-testid="s" />)
    const el = screen.getByTestId('s')
    // Assert the inline declaration, not computed style: jsdom resolves 10rem to 160px.
    expect(el.style.width).toBe('10rem')
    expect(el.style.height).toBe('40px')
  })

  it('can opt out of the shimmer', () => {
    render(<Skeleton static data-testid="s" />)
    expect(screen.getByTestId('s')).toHaveAttribute('data-static', 'true')
  })
})

describe('Alert', () => {
  it('uses role=status for non-urgent tones', () => {
    render(<Alert tone="info">Heads up</Alert>)
    expect(screen.getByRole('status')).toHaveTextContent('Heads up')
  })

  it.each(['danger', 'warning'] as const)('uses role=alert for the %s tone', (tone) => {
    render(<Alert tone={tone}>Careful</Alert>)
    expect(screen.getByRole('alert')).toHaveTextContent('Careful')
  })

  it('renders a title alongside the description', () => {
    render(<Alert title="Payment failed">Try another card.</Alert>)
    const el = screen.getByRole('status')
    expect(el).toHaveTextContent('Payment failed')
    expect(el).toHaveTextContent('Try another card.')
  })

  it('hides the decorative icon from screen readers', () => {
    render(<Alert data-testid="a">Note</Alert>)
    const icon = screen.getByTestId('a').querySelector('.vk-alert__icon')
    expect(icon).not.toBeNull()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('drops the icon entirely when icon is null', () => {
    render(
      <Alert icon={null} data-testid="a">
        Note
      </Alert>,
    )
    expect(screen.getByTestId('a').querySelector('.vk-alert__icon')).toBeNull()
  })

  it('has no axe violations across tones', async () => {
    for (const tone of ['info', 'success', 'warning', 'danger'] as const) {
      const { container } = render(
        <Alert tone={tone} title="Title">
          Description
        </Alert>,
      )
      expect(await axe(container)).toHaveNoViolations()
    }
  })
})

describe('Progress', () => {
  it('reports value and max to assistive tech', () => {
    render(<Progress value={40} label="Upload" />)
    const el = screen.getByRole('progressbar', { name: 'Upload' })
    expect(el).toHaveAttribute('aria-valuenow', '40')
    expect(el).toHaveAttribute('aria-valuemax', '100')
    expect(el.style.getPropertyValue('--vk-progress')).toBe('40%')
  })

  it('is indeterminate with no value, and omits valuenow', () => {
    render(<Progress label="Working" />)
    const el = screen.getByRole('progressbar')
    expect(el).toHaveAttribute('data-indeterminate', 'true')
    expect(el).not.toHaveAttribute('aria-valuenow')
  })

  it('scales the percentage against a custom max', () => {
    render(<Progress value={25} max={50} label="P" />)
    const el = screen.getByRole('progressbar')
    expect(el.style.getPropertyValue('--vk-progress')).toBe('50%')
    expect(el).toHaveAttribute('aria-valuemax', '50')
  })

  it('clamps values above max and below zero', () => {
    const over = render(<Progress value={500} label="P" />)
    expect(
      within(over.container).getByRole('progressbar').style.getPropertyValue('--vk-progress'),
    ).toBe('100%')

    const under = render(<Progress value={-20} label="P" />)
    expect(
      within(under.container).getByRole('progressbar').style.getPropertyValue('--vk-progress'),
    ).toBe('0%')
  })

  it('survives a non-finite value instead of emitting NaN%', () => {
    render(<Progress value={Number.NaN} label="P" />)
    expect(screen.getByRole('progressbar').style.getPropertyValue('--vk-progress')).toBe('0%')
  })

  it('falls back to a sane max when given zero or negative', () => {
    render(<Progress value={50} max={0} label="P" />)
    const el = screen.getByRole('progressbar')
    expect(el).toHaveAttribute('aria-valuemax', '100')
    expect(el.style.getPropertyValue('--vk-progress')).toBe('50%')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Progress value={60} label="Upload progress" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
