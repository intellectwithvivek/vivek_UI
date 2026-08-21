import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { AspectRatio } from './aspect-ratio'
import { Box } from './box'
import { Container } from './container'
import { Divider } from './divider'
import { Grid } from './grid'
import { Flex, Stack } from './stack'

describe('Box', () => {
  it('renders a div by default and merges className', () => {
    render(
      <Box className="mine" data-testid="b">
        content
      </Box>,
    )
    const el = screen.getByTestId('b')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toBe('vk-box mine')
  })

  it('retags via `as` and forwards the ref to the rendered element', () => {
    const ref = createRef<HTMLElement>()
    render(
      <Box as="section" ref={ref} data-testid="b">
        x
      </Box>,
    )
    expect(screen.getByTestId('b').tagName).toBe('SECTION')
    expect(ref.current).toBe(screen.getByTestId('b'))
  })
})

describe('Stack', () => {
  it('defaults to a vertical stack with gap 4', () => {
    render(<Stack data-testid="s">x</Stack>)
    const el = screen.getByTestId('s')
    expect(el).toHaveAttribute('data-direction', 'vertical')
    expect(el).toHaveAttribute('data-gap', '4')
  })

  it('maps align, justify and wrap onto data attributes', () => {
    render(
      <Stack align="center" justify="between" wrap gap={8} data-testid="s">
        x
      </Stack>,
    )
    const el = screen.getByTestId('s')
    expect(el).toHaveAttribute('data-align', 'center')
    expect(el).toHaveAttribute('data-justify', 'between')
    expect(el).toHaveAttribute('data-wrap', 'true')
    expect(el).toHaveAttribute('data-gap', '8')
  })

  it('omits optional attributes when not supplied', () => {
    render(<Stack data-testid="s">x</Stack>)
    const el = screen.getByTestId('s')
    expect(el).not.toHaveAttribute('data-align')
    expect(el).not.toHaveAttribute('data-wrap')
  })
})

describe('Flex', () => {
  it('is a horizontal Stack', () => {
    render(<Flex data-testid="f">x</Flex>)
    expect(screen.getByTestId('f')).toHaveAttribute('data-direction', 'horizontal')
    expect(screen.getByTestId('f')).toHaveClass('vk-stack')
  })

  it('still honours an explicit direction', () => {
    render(
      <Flex direction="vertical" data-testid="f">
        x
      </Flex>,
    )
    expect(screen.getByTestId('f')).toHaveAttribute('data-direction', 'vertical')
  })
})

describe('Grid', () => {
  it('auto-fits when no cols are given', () => {
    render(<Grid data-testid="g">x</Grid>)
    expect(screen.getByTestId('g')).toHaveAttribute('data-mode', 'auto')
  })

  it('sets --vk-cols for a fixed column count', () => {
    render(
      <Grid cols={3} data-testid="g">
        x
      </Grid>,
    )
    const el = screen.getByTestId('g')
    expect(el).toHaveAttribute('data-mode', 'cols')
    expect(el.style.getPropertyValue('--vk-cols')).toBe('3')
  })

  it('emits one custom property per responsive breakpoint', () => {
    render(
      <Grid cols={{ base: 1, md: 2, xl: 4 }} data-testid="g">
        x
      </Grid>,
    )
    const { style } = screen.getByTestId('g')
    expect(style.getPropertyValue('--vk-cols')).toBe('1')
    expect(style.getPropertyValue('--vk-cols-md')).toBe('2')
    expect(style.getPropertyValue('--vk-cols-xl')).toBe('4')
    // Unspecified breakpoints must not be emitted; CSS falls back down the chain.
    expect(style.getPropertyValue('--vk-cols-sm')).toBe('')
    expect(style.getPropertyValue('--vk-cols-lg')).toBe('')
  })

  it('passes minItemWidth through as --vk-item-min', () => {
    render(
      <Grid minItemWidth="20rem" data-testid="g">
        x
      </Grid>,
    )
    expect(screen.getByTestId('g').style.getPropertyValue('--vk-item-min')).toBe('20rem')
  })

  it('lets a consumer style override survive alongside the generated vars', () => {
    render(
      <Grid cols={2} style={{ padding: '4px' }} data-testid="g">
        x
      </Grid>,
    )
    const el = screen.getByTestId('g')
    expect(el.style.getPropertyValue('--vk-cols')).toBe('2')
    expect(el).toHaveStyle({ padding: '4px' })
  })
})

describe('Container', () => {
  it('defaults to size lg and is not flush', () => {
    render(<Container data-testid="c">x</Container>)
    const el = screen.getByTestId('c')
    expect(el).toHaveAttribute('data-size', 'lg')
    expect(el).not.toHaveAttribute('data-flush')
  })
})

describe('AspectRatio', () => {
  it('defaults to 16/9 as a custom property', () => {
    render(<AspectRatio data-testid="a" />)
    expect(screen.getByTestId('a').style.getPropertyValue('--vk-aspect-ratio')).toBe(String(16 / 9))
  })

  it('accepts a custom ratio', () => {
    render(<AspectRatio ratio={1} data-testid="a" />)
    expect(screen.getByTestId('a').style.getPropertyValue('--vk-aspect-ratio')).toBe('1')
  })
})

describe('Divider', () => {
  it('renders a real <hr> when unlabelled, for the implicit separator role', () => {
    render(<Divider data-testid="d" />)
    const el = screen.getByTestId('d')
    expect(el.tagName).toBe('HR')
    expect(el).not.toHaveAttribute('data-labelled')
    // <hr> maps to role="separator" with no hand-written ARIA.
    expect(screen.getByRole('separator')).toBe(el)
  })

  it('renders the label inline when given one', () => {
    render(<Divider label="or" data-testid="d" />)
    const el = screen.getByTestId('d')
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveAttribute('data-labelled', 'true')
    expect(el).toHaveTextContent('or')
  })

  it('honours a vertical orientation', () => {
    render(<Divider orientation="vertical" data-testid="d" />)
    expect(screen.getByTestId('d')).toHaveAttribute('data-orientation', 'vertical')
  })

  it('has no axe violations in either form', async () => {
    const plain = render(<Divider />)
    expect(await axe(plain.container)).toHaveNoViolations()
    const labelled = render(<Divider label="or" />)
    expect(await axe(labelled.container)).toHaveNoViolations()
  })
})
