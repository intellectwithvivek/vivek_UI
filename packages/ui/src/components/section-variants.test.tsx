/**
 * The 1.0 section variants: Hero backdrops and heights, Navbar surfaces and link
 * placement, FAQ columns and side layout, CTA inset cards. Each is a data attribute the
 * stylesheet keys on, so the tests pin the attributes and the DOM they imply; the visual
 * side is the e2e suite's job.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { CTA } from './cta'
import { FAQ } from './faq'
import { Hero } from './hero'
import { Navbar, NavbarBrand, NavbarLink, NavbarLinks } from './navbar'

const ITEMS = [
  { id: 'a', question: 'A?', answer: 'Yes.' },
  { id: 'b', question: 'B?', answer: 'Also yes.' },
]

describe('Hero variants', () => {
  it('renders a decorative backdrop layer and records the overlay', () => {
    render(
      <Hero
        title="Over a photo"
        backdrop={<img src="/sky.jpg" alt="" data-testid="bg" />}
        overlay="gradient"
      />,
    )
    const hero = screen.getByRole('region', { name: 'Over a photo' })
    expect(hero).toHaveAttribute('data-overlay', 'gradient')
    const layer = hero.querySelector('.vk-hero__backdrop') as HTMLElement
    expect(layer).toHaveAttribute('aria-hidden', 'true')
    expect(layer.contains(screen.getByTestId('bg'))).toBe(true)
    // Inside the container (so the section's own box is what it fills) and before the copy,
    // so it paints under the content in source order too.
    expect(layer.nextElementSibling).toHaveClass('vk-hero__inner')
  })

  it('records no overlay without a backdrop, and defaults to none with one', () => {
    const { rerender } = render(<Hero title="Plain" />)
    expect(screen.getByRole('region')).not.toHaveAttribute('data-overlay')
    expect(document.querySelector('.vk-hero__backdrop')).toBeNull()
    rerender(<Hero title="Plain" backdrop={<div />} />)
    expect(screen.getByRole('region')).toHaveAttribute('data-overlay', 'none')
  })

  it('places media at the start on request, and only records it when there is media', () => {
    const { rerender } = render(<Hero title="T" layout="split" mediaPosition="start" />)
    expect(screen.getByRole('region')).not.toHaveAttribute('data-media')
    rerender(<Hero title="T" layout="split" mediaPosition="start" media={<div>pic</div>} />)
    expect(screen.getByRole('region')).toHaveAttribute('data-media', 'start')
    rerender(<Hero title="T" layout="split" media={<div>pic</div>} />)
    expect(screen.getByRole('region')).toHaveAttribute('data-media', 'end')
  })

  it('records the minimum height', () => {
    const { rerender } = render(<Hero title="T" />)
    expect(screen.getByRole('region')).not.toHaveAttribute('data-height')
    rerender(<Hero title="T" minHeight="screen" />)
    expect(screen.getByRole('region')).toHaveAttribute('data-height', 'screen')
  })

  it('has no axe violations over a dark backdrop', async () => {
    const { container } = render(
      <Hero
        title="Dark"
        description="Copy on a photo."
        backdrop={<div style={{ background: '#123' }} />}
        overlay="dark"
        minHeight="half"
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Navbar variants', () => {
  it('defaults to a solid bar with links at the start', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('data-variant', 'solid')
    expect(nav).toHaveAttribute('data-layout', 'start')
  })

  it('records transparent and floating variants and centred or end-placed links', () => {
    const { rerender } = render(
      <Navbar variant="transparent" layout="center">
        <NavbarBrand href="/">Brand</NavbarBrand>
        <NavbarLinks>
          <NavbarLink href="/a">A</NavbarLink>
        </NavbarLinks>
      </Navbar>,
    )
    expect(screen.getByRole('navigation')).toHaveAttribute('data-variant', 'transparent')
    expect(screen.getByRole('navigation')).toHaveAttribute('data-layout', 'center')
    rerender(<Navbar variant="floating" layout="end" sticky />)
    expect(screen.getByRole('navigation')).toHaveAttribute('data-variant', 'floating')
    expect(screen.getByRole('navigation')).toHaveAttribute('data-layout', 'end')
    expect(screen.getByRole('navigation')).toHaveAttribute('data-sticky')
  })
})

describe('FAQ variants', () => {
  it('wraps header and list in a body that records the layout; the list records its columns', () => {
    render(<FAQ title="Questions" items={ITEMS} layout="side" columns={2} />)
    const body = document.querySelector('.vk-faq__body') as HTMLElement
    expect(body).toHaveAttribute('data-layout', 'side')
    expect(body.querySelector('.vk-section__header')).toBeInTheDocument()
    expect(body.querySelector('.vk-faq__list')).toHaveAttribute('data-columns', '2')
    expect(screen.getAllByRole('group')).toHaveLength(2)
  })

  it('defaults to one stacked column and keeps the structured data', () => {
    render(<FAQ items={ITEMS} />)
    expect(document.querySelector('.vk-faq__body')).toHaveAttribute('data-layout', 'stack')
    expect(document.querySelector('.vk-faq__list')).toHaveAttribute('data-columns', '1')
    expect(document.querySelector('script[type="application/ld+json"]')).toBeInTheDocument()
  })

  it('has no axe violations in the side layout', async () => {
    const { container } = render(<FAQ title="Q" items={ITEMS} layout="side" columns={2} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('CTA variants', () => {
  it('inset keeps the section on the page background and moves the tone to the card', () => {
    render(<CTA title="Go" background="primary" inset />)
    const section = screen.getByRole('region', { name: 'Go' })
    expect(section).toHaveAttribute('data-inset')
    expect(section).toHaveAttribute('data-tone', 'primary')
    expect(section).toHaveAttribute('data-background', 'default')
  })

  it('a full-bleed CTA records neither inset nor tone; layout is recorded either way', () => {
    render(<CTA title="Go" background="primary" layout="split" />)
    const section = screen.getByRole('region', { name: 'Go' })
    expect(section).not.toHaveAttribute('data-inset')
    expect(section).not.toHaveAttribute('data-tone')
    expect(section).toHaveAttribute('data-background', 'primary')
    expect(section).toHaveAttribute('data-layout', 'split')
  })

  it('has no axe violations as an inset primary card', async () => {
    const { container } = render(
      <CTA
        title="Go"
        description="Now."
        background="primary"
        inset
        layout="split"
        actions={<button type="button">Start</button>}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
