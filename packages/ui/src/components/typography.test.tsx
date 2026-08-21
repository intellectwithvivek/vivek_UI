import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Code } from './code'
import { Heading } from './heading'
import { Kbd } from './kbd'
import { Text } from './text'

describe('Heading', () => {
  it('renders an h2 by default', () => {
    render(<Heading>Title</Heading>)
    expect(screen.getByRole('heading', { level: 2, name: 'Title' })).toBeInTheDocument()
  })

  it.each([1, 2, 3, 4, 5, 6] as const)('renders level %s as the matching tag', (level) => {
    render(<Heading level={level}>T</Heading>)
    expect(screen.getByRole('heading', { level })).toBeInTheDocument()
  })

  it('derives a default visual size per level', () => {
    render(<Heading level={1}>T</Heading>)
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('data-size', 'hero')
  })

  it('decouples visual size from semantic level', () => {
    render(
      <Heading level={1} size="md">
        T
      </Heading>,
    )
    const el = screen.getByRole('heading', { level: 1 })
    expect(el.tagName).toBe('H1')
    expect(el).toHaveAttribute('data-size', 'md')
  })

  it('merges className and spreads host props', () => {
    render(
      <Heading className="mine" id="t">
        T
      </Heading>,
    )
    const el = screen.getByRole('heading')
    expect(el.className).toBe('vk-heading mine')
    expect(el).toHaveAttribute('id', 't')
  })
})

describe('Text', () => {
  it('renders a p with sensible defaults', () => {
    render(<Text data-testid="t">copy</Text>)
    const el = screen.getByTestId('t')
    expect(el.tagName).toBe('P')
    expect(el).toHaveAttribute('data-size', 'md')
    expect(el).toHaveAttribute('data-tone', 'default')
  })

  it('retags via `as`', () => {
    render(
      <Text as="span" data-testid="t">
        copy
      </Text>,
    )
    expect(screen.getByTestId('t').tagName).toBe('SPAN')
  })

  it('maps tone and weight onto data attributes', () => {
    render(
      <Text tone="danger" weight="bold" data-testid="t">
        copy
      </Text>,
    )
    expect(screen.getByTestId('t')).toHaveAttribute('data-tone', 'danger')
    expect(screen.getByTestId('t')).toHaveAttribute('data-weight', 'bold')
  })

  it('sets --vk-line-clamp only when lineClamp is given', () => {
    const { rerender } = render(<Text data-testid="t">copy</Text>)
    expect(screen.getByTestId('t')).not.toHaveAttribute('data-line-clamp')

    rerender(
      <Text lineClamp={3} data-testid="t">
        copy
      </Text>,
    )
    const el = screen.getByTestId('t')
    expect(el).toHaveAttribute('data-line-clamp', 'true')
    expect(el.style.getPropertyValue('--vk-line-clamp')).toBe('3')
  })
})

describe('Code', () => {
  it('renders inline code by default', () => {
    render(<Code data-testid="c">npm i</Code>)
    const el = screen.getByTestId('c')
    expect(el.tagName).toBe('CODE')
    expect(el).toHaveTextContent('npm i')
  })

  it('wraps block code in a pre so it can scroll', () => {
    render(
      <Code block data-testid="c">
        {'line 1\nline 2'}
      </Code>,
    )
    const el = screen.getByTestId('c')
    expect(el.tagName).toBe('PRE')
    expect(el).toHaveClass('vk-code--block')
    expect(el.querySelector('code')).not.toBeNull()
  })
})

describe('Kbd', () => {
  it('renders a kbd element', () => {
    render(<Kbd data-testid="k">Esc</Kbd>)
    expect(screen.getByTestId('k').tagName).toBe('KBD')
  })
})

describe('typography a11y', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <article>
        <Heading level={1}>Page title</Heading>
        <Text>
          Body copy with <Code>inline code</Code> and <Kbd>Esc</Kbd>.
        </Text>
        <Code block>const x = 1</Code>
      </article>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
