import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Avatar } from './avatar'
import { Badge } from './badge'
import { Button } from './button'
import { ButtonGroup } from './button-group'
import { Card } from './card'
import { IconButton } from './icon-button'

describe('IconButton', () => {
  it('exposes its aria-label as the accessible name', () => {
    render(<IconButton aria-label="Close dialog">x</IconButton>)
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument()
  })

  it('defaults to the ghost variant at size md', () => {
    render(<IconButton aria-label="Act">x</IconButton>)
    const el = screen.getByRole('button')
    expect(el).toHaveAttribute('data-variant', 'ghost')
    expect(el).toHaveAttribute('data-size', 'md')
  })

  it('replaces its children with a spinner while loading, and disables', () => {
    render(
      <IconButton aria-label="Save" loading>
        <span data-testid="glyph">x</span>
      </IconButton>,
    )
    const el = screen.getByRole('button')
    expect(el).toBeDisabled()
    expect(screen.queryByTestId('glyph')).toBeNull()
    expect(el.querySelector('.vk-icon-button__spinner')).not.toBeNull()
  })

  it('does not fire onClick while loading', () => {
    const onClick = vi.fn()
    render(<IconButton aria-label="Save" loading onClick={onClick} />)
    screen.getByRole('button').click()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('forwards its ref', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<IconButton aria-label="Act" ref={ref} />)
    expect(ref.current).toBe(screen.getByRole('button'))
  })

  it('has no axe violations', async () => {
    const { container } = render(<IconButton aria-label="Download report">D</IconButton>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ButtonGroup', () => {
  it('is a group and takes an accessible name from label', () => {
    render(
      <ButtonGroup label="Text alignment">
        <Button>Left</Button>
        <Button>Right</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group', { name: 'Text alignment' })).toBeInTheDocument()
  })

  it('marks the attached and vertical variants', () => {
    render(
      <ButtonGroup attached orientation="vertical" label="G">
        <Button>A</Button>
      </ButtonGroup>,
    )
    const el = screen.getByRole('group')
    expect(el).toHaveAttribute('data-attached', 'true')
    expect(el).toHaveAttribute('data-orientation', 'vertical')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ButtonGroup label="Actions">
        <Button>Save</Button>
        <Button variant="outline">Cancel</Button>
      </ButtonGroup>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Badge', () => {
  it('defaults to a soft primary badge', () => {
    render(<Badge data-testid="b">New</Badge>)
    const el = screen.getByTestId('b')
    expect(el).toHaveAttribute('data-variant', 'soft')
    expect(el).toHaveAttribute('data-tone', 'primary')
  })

  it.each(['primary', 'neutral', 'success', 'warning', 'danger'] as const)(
    'maps tone %s',
    (tone) => {
      render(
        <Badge tone={tone} data-testid="b">
          x
        </Badge>,
      )
      expect(screen.getByTestId('b')).toHaveAttribute('data-tone', tone)
    },
  )
})

describe('Card', () => {
  it('renders with defaults', () => {
    render(<Card data-testid="c">body</Card>)
    const el = screen.getByTestId('c')
    expect(el).toHaveAttribute('data-variant', 'outline')
    expect(el).toHaveAttribute('data-padding', 'md')
    expect(el).not.toHaveAttribute('data-interactive')
  })

  it('exposes Header, Body and Footer sub-components', () => {
    render(
      <Card data-testid="c">
        <Card.Header data-testid="h">head</Card.Header>
        <Card.Body data-testid="b">body</Card.Body>
        <Card.Footer data-testid="f">foot</Card.Footer>
      </Card>,
    )
    expect(screen.getByTestId('h')).toHaveClass('vk-card__header')
    expect(screen.getByTestId('b')).toHaveClass('vk-card__body')
    expect(screen.getByTestId('f')).toHaveClass('vk-card__footer')
  })

  it('has no axe violations as a composed card', async () => {
    const { container } = render(
      <Card>
        <Card.Header>
          <h3>Plan</h3>
        </Card.Header>
        <Card.Body>Everything you need.</Card.Body>
        <Card.Footer>
          <Button>Choose</Button>
        </Card.Footer>
      </Card>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Avatar', () => {
  it('renders an image with the name as alt text', () => {
    render(<Avatar src="/me.png" name="Vivek Kumar Singh" />)
    const img = screen.getByRole('img', { name: 'Vivek Kumar Singh' })
    expect(img).toHaveAttribute('src', '/me.png')
  })

  it('derives two initials from a full name when there is no image', () => {
    render(<Avatar name="Vivek Kumar Singh" data-testid="a" />)
    expect(screen.getByTestId('a')).toHaveTextContent('VS')
  })

  it('takes the first two letters of a single-word name', () => {
    render(<Avatar name="Vivek" data-testid="a" />)
    expect(screen.getByTestId('a')).toHaveTextContent('VI')
  })

  it('is a named img role when falling back to initials', () => {
    render(<Avatar name="Vivek Kumar Singh" />)
    expect(screen.getByRole('img', { name: 'Vivek Kumar Singh' })).toBeInTheDocument()
  })

  it('lets an explicit fallback win over derived initials', () => {
    render(<Avatar name="Vivek Kumar Singh" fallback="??" data-testid="a" />)
    expect(screen.getByTestId('a')).toHaveTextContent('??')
  })

  it('survives an empty or whitespace-only name', () => {
    render(<Avatar name="   " data-testid="a" />)
    expect(screen.getByTestId('a')).toHaveTextContent('')
  })

  it('groups avatars', () => {
    render(
      <Avatar.Group data-testid="g">
        <Avatar name="A B" />
        <Avatar name="C D" />
      </Avatar.Group>,
    )
    expect(screen.getByTestId('g')).toHaveClass('vk-avatar-group')
    expect(screen.getByTestId('g')).toHaveAttribute('data-spacing', 'md')
  })

  it('has no axe violations for image and fallback forms', async () => {
    const withImage = render(<Avatar src="/me.png" name="Vivek Kumar Singh" />)
    expect(await axe(withImage.container)).toHaveNoViolations()
    const withInitials = render(<Avatar name="Vivek Kumar Singh" />)
    expect(await axe(withInitials.container)).toHaveNoViolations()
  })
})
