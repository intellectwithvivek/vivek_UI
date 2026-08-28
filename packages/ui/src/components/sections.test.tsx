import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Button } from './button'
import { CTA } from './cta'
import { FAQ } from './faq'
import { FeatureGrid } from './feature-grid'
import { Footer } from './footer'
import { Hero } from './hero'
import { LogoCloud } from './logo-cloud'
import { Pricing } from './pricing'
import { Section } from './section'
import { Stats } from './stats'
import { Testimonials } from './testimonials'

/* ---------------------------------------------------------------- fixtures */

const features = [
  { title: 'Zero dependencies', description: 'Nothing to audit but React itself.' },
  { title: 'Server safe', description: 'Renders in a Server Component untouched.' },
  { title: 'Themeable', description: 'Every value is a CSS custom property.' },
]

const plans = [
  {
    name: 'Hobby',
    price: '$0',
    period: '/month',
    description: 'For side projects.',
    features: ['One project', 'Community support'],
    cta: <Button variant="outline">Start free</Button>,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: ['Unlimited projects', 'Email support'],
    cta: <Button>Upgrade</Button>,
    highlighted: true,
    badge: 'Most popular',
  },
]

const testimonials = [
  { quote: 'It replaced four packages.', author: 'Asha Menon', role: 'Staff engineer' },
  { quote: 'Shipped a landing page in a day.', author: 'Rohit Verma', role: 'Founder' },
]

const faqItems = [
  { question: 'Does it need JavaScript?', answer: 'No. The sections are static markup.' },
  { question: 'Can I theme it?', answer: 'Override the --vk-* custom properties.' },
]

const stats = [
  { value: '99.98%', label: 'Uptime', description: 'Rolling twelve months.' },
  { value: '12 kB', label: 'Bundle size' },
]

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Components', href: '/components' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  { title: 'Company', links: [{ label: 'About', href: '/about' }] },
]

const logos = [
  { alt: 'Northwind' },
  { alt: 'Initech', src: '/initech.svg' },
  { alt: 'Umbrella', node: <svg viewBox="0 0 10 10" aria-hidden="true" /> },
]

/* ------------------------------------------------------------------ Section */

describe('Section', () => {
  it('renders a section landmark with sensible defaults', () => {
    render(<Section aria-label="Plain">content</Section>)
    const el = screen.getByRole('region', { name: 'Plain' })
    expect(el.tagName).toBe('SECTION')
    expect(el).toHaveAttribute('data-padding', 'lg')
    expect(el).toHaveAttribute('data-background', 'default')
  })

  it('renders with zero props without throwing', () => {
    const { container } = render(<Section />)
    expect(container.querySelector('.vk-section')).not.toBeNull()
  })

  it('wraps children in a Container, and skips it when bleeding', () => {
    const { container: wrapped } = render(<Section>inner</Section>)
    expect(wrapped.querySelector('.vk-container')).not.toBeNull()
    const { container: bled } = render(<Section bleed>inner</Section>)
    expect(bled.querySelector('.vk-container')).toBeNull()
  })

  it('honours as, padding, background and align', () => {
    render(
      <Section as="aside" padding="xl" background="primary" align="center" aria-label="Aside">
        x
      </Section>,
    )
    const el = screen.getByRole('complementary')
    expect(el).toHaveAttribute('data-padding', 'xl')
    expect(el).toHaveAttribute('data-background', 'primary')
    expect(el).toHaveAttribute('data-align', 'center')
  })

  it('merges className and forwards its ref', () => {
    const ref = createRef<HTMLElement>()
    render(
      <Section ref={ref} className="mine" aria-label="R">
        x
      </Section>,
    )
    const el = screen.getByRole('region', { name: 'R' })
    expect(el).toHaveClass('vk-section', 'mine')
    expect(ref.current).toBe(el)
  })

  it('renders Section.Header at the requested heading level', () => {
    render(<Section.Header title="Why us" description="Because." headingLevel={4} />)
    expect(screen.getByRole('heading', { level: 4, name: 'Why us' })).toBeInTheDocument()
  })

  it('turns a string eyebrow into a badge and leaves a node alone', () => {
    const { container: fromString } = render(<Section.Header eyebrow="New" title="T" />)
    expect(fromString.querySelector('.vk-badge')).not.toBeNull()
    const { container: fromNode } = render(
      <Section.Header eyebrow={<span data-testid="own">New</span>} title="T" />,
    )
    expect(fromNode.querySelector('.vk-badge')).toBeNull()
    expect(screen.getByTestId('own')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Section aria-label="Features">
        <Section.Header title="Features" description="What you get." />
      </Section>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* --------------------------------------------------------------------- Hero */

describe('Hero', () => {
  it('renders from props alone', () => {
    render(
      <Hero
        eyebrow="v1.0"
        title="Ship the page, not the primitives"
        description="Sections you install."
        actions={<Button>Get started</Button>}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Ship the page, not the primitives' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Sections you install.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument()
  })

  it('renders with zero props without throwing', () => {
    const { container } = render(<Hero />)
    expect(container.querySelector('.vk-hero')).not.toBeNull()
  })

  it('names its landmark from a string title, with no id plumbing', () => {
    render(<Hero title="Ship faster" />)
    expect(screen.getByRole('region', { name: 'Ship faster' })).toBeInTheDocument()
  })

  it('lets a caller-supplied aria-label win over the derived name', () => {
    render(<Hero title="Ship faster" aria-label="Introduction" />)
    expect(screen.getByRole('region', { name: 'Introduction' })).toBeInTheDocument()
  })

  it('respects headingLevel', () => {
    render(<Hero title="Sub hero" headingLevel={3} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Sub hero' })).toBeInTheDocument()
  })

  it('centres by default and start-aligns a split layout', () => {
    const { container: centred } = render(<Hero title="A" />)
    expect(centred.querySelector('.vk-hero')).toHaveAttribute('data-align', 'center')
    const { container: split } = render(<Hero title="B" layout="split" media={<div />} />)
    const el = split.querySelector('.vk-hero')
    expect(el).toHaveAttribute('data-layout', 'split')
    expect(el).toHaveAttribute('data-align', 'start')
  })

  it('lets children take over the inner layout entirely', () => {
    render(
      <Hero title="Ignored" description="Ignored too">
        <p>Bespoke</p>
      </Hero>,
    )
    expect(screen.getByText('Bespoke')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Ignored' })).toBeNull()
    expect(screen.queryByText('Ignored too')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Hero
        eyebrow="Now in beta"
        title="Ship the page"
        description="Ten sections, no config."
        actions={<Button>Get started</Button>}
        layout="split"
        media={<img src="/hero.png" alt="The component gallery" />}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* --------------------------------------------------------------- FeatureGrid */

describe('FeatureGrid', () => {
  it('renders every feature from props alone', () => {
    render(<FeatureGrid title="Features" features={features} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByRole('heading', { level: 3, name: 'Server safe' })).toBeInTheDocument()
  })

  it('renders with zero props and with an empty array without throwing', () => {
    expect(() => render(<FeatureGrid />)).not.toThrow()
    const { container } = render(<FeatureGrid title="Nothing yet" features={[]} />)
    expect(container.querySelector('.vk-feature-grid__list')).toBeNull()
  })

  it('drops feature titles one level below the section title', () => {
    render(<FeatureGrid title="Features" headingLevel={2} features={features} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Features' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Themeable' })).toBeInTheDocument()
  })

  it('keeps feature titles at headingLevel when the section has no title', () => {
    render(<FeatureGrid headingLevel={2} features={features} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Themeable' })).toBeInTheDocument()
  })

  it('clamps the derived item level at 6', () => {
    render(<FeatureGrid title="Deep" headingLevel={6} features={features} />)
    expect(screen.getByRole('heading', { level: 6, name: 'Themeable' })).toBeInTheDocument()
  })

  it('hides a decorative icon from assistive technology', () => {
    const { container } = render(
      <FeatureGrid
        features={[{ icon: <svg viewBox="0 0 1 1" />, title: 'Fast', description: 'Very.' }]}
      />,
    )
    expect(container.querySelector('.vk-feature-grid__icon')).toHaveAttribute('aria-hidden', 'true')
  })

  it('passes columns through to the grid', () => {
    const { container } = render(<FeatureGrid features={features} columns={{ base: 1, md: 3 }} />)
    const grid = container.querySelector('.vk-grid')
    expect(grid).toHaveAttribute('data-mode', 'cols')
    expect(grid).toHaveStyle({ '--vk-cols': '1', '--vk-cols-md': '3' })
  })

  it('auto-fits when columns is omitted', () => {
    const { container } = render(<FeatureGrid features={features} />)
    expect(container.querySelector('.vk-grid')).toHaveAttribute('data-mode', 'auto')
  })

  it('lets children take over', () => {
    render(
      <FeatureGrid title="Ignored" features={features}>
        <p>Bespoke</p>
      </FeatureGrid>,
    )
    expect(screen.getByText('Bespoke')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Themeable' })).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <FeatureGrid
        eyebrow="Why"
        title="Everything a landing page needs"
        description="Composed from primitives you already have."
        features={features}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* ------------------------------------------------------------------ Pricing */

describe('Pricing', () => {
  it('renders plans, prices, periods and features from props alone', () => {
    render(<Pricing title="Pricing" plans={plans} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Hobby' })).toBeInTheDocument()
    expect(screen.getByText('$29')).toBeInTheDocument()
    expect(screen.getByText('Unlimited projects')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument()
  })

  it('renders with zero props and with an empty array without throwing', () => {
    expect(() => render(<Pricing />)).not.toThrow()
    const { container } = render(<Pricing plans={[]} />)
    expect(container.querySelector('.vk-pricing__plans')).toBeNull()
  })

  it('survives a plan with no features', () => {
    expect(() =>
      render(<Pricing plans={[{ name: 'Bare', price: '$1', features: [] }]} />),
    ).not.toThrow()
  })

  it('marks and badges the highlighted plan', () => {
    const { container } = render(<Pricing plans={plans} />)
    const cards = container.querySelectorAll('.vk-pricing__card')
    expect(cards[0]).not.toHaveAttribute('data-highlighted')
    expect(cards[1]).toHaveAttribute('data-highlighted', 'true')
    expect(cards[1]).toHaveAttribute('data-variant', 'elevated')
    expect(screen.getByText('Most popular')).toHaveClass('vk-badge')
  })

  it('respects headingLevel for the plan names', () => {
    render(<Pricing plans={plans} headingLevel={4} />)
    expect(screen.getByRole('heading', { level: 4, name: 'Pro' })).toBeInTheDocument()
  })

  it('lets children take over', () => {
    render(
      <Pricing title="Ignored" plans={plans}>
        <p>Bespoke</p>
      </Pricing>,
    )
    expect(screen.getByText('Bespoke')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Pro' })).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Pricing title="Simple pricing" description="No seats, no surprises." plans={plans} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* ------------------------------------------------------------- Testimonials */

describe('Testimonials', () => {
  it('renders each quote as a blockquote with a cited author', () => {
    const { container } = render(<Testimonials title="Loved" items={testimonials} />)
    const quotes = container.querySelectorAll('blockquote')
    expect(quotes).toHaveLength(2)
    expect(quotes[0]).toHaveTextContent('It replaced four packages.')
    expect(container.querySelectorAll('cite')[0]).toHaveTextContent('Asha Menon')
    // Attribution lives in the figcaption, not inside the quote.
    expect(quotes[0]?.querySelector('cite')).toBeNull()
    expect(container.querySelectorAll('figure figcaption')).toHaveLength(2)
  })

  it('renders with zero props and with an empty array without throwing', () => {
    expect(() => render(<Testimonials />)).not.toThrow()
    const { container } = render(<Testimonials items={[]} />)
    expect(container.querySelector('.vk-testimonials__list')).toBeNull()
  })

  it('turns a string avatar into an Avatar named after the author', () => {
    render(<Testimonials items={[{ quote: 'Great.', author: 'Asha Menon', avatar: '/a.png' }]} />)
    expect(screen.getByRole('img', { name: 'Asha Menon' })).toHaveAttribute('src', '/a.png')
  })

  it('renders a node avatar as given', () => {
    render(
      <Testimonials
        items={[{ quote: 'Great.', author: 'Asha', avatar: <span data-testid="own" /> }]}
      />,
    )
    expect(screen.getByTestId('own')).toBeInTheDocument()
  })

  it('respects headingLevel on its own title', () => {
    render(<Testimonials title="Loved by teams" headingLevel={3} items={testimonials} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Loved by teams' })).toBeInTheDocument()
  })

  it('lets children take over', () => {
    render(
      <Testimonials title="Ignored" items={testimonials}>
        <p>Bespoke</p>
      </Testimonials>,
    )
    expect(screen.getByText('Bespoke')).toBeInTheDocument()
    expect(screen.queryByText('It replaced four packages.')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Testimonials
        title="Loved by teams"
        items={[{ quote: 'It replaced four packages.', author: 'Asha Menon', avatar: '/a.png' }]}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* ---------------------------------------------------------------------- FAQ */

describe('FAQ', () => {
  describe('structured data', () => {
    const jsonOf = (container: HTMLElement) => {
      const script = container.querySelector('script[type="application/ld+json"]')
      return script ? JSON.parse(script.textContent ?? '') : null
    }

    it('emits FAQPage JSON-LD by default, derived from the visible items', () => {
      // The markup an answer engine reads to quote a question directly. Emitted on the
      // server, because several crawlers never run JavaScript.
      const { container } = render(<FAQ title="FAQ" items={faqItems} />)
      const data = jsonOf(container)
      expect(data['@type']).toBe('FAQPage')
      expect(data.mainEntity).toHaveLength(2)
      expect(data.mainEntity[0]['@type']).toBe('Question')
      expect(data.mainEntity[0].acceptedAnswer.text).toBeTruthy()
    })

    it('escapes </script> inside content, so CMS data cannot break out of the tag', () => {
      // The classic JSON-LD injection: a string containing </script> closes the block
      // early and everything after it parses as markup. FAQ content routinely comes
      // from a CMS, so this is the load-bearing test for the feature.
      const hostile = [
        { question: 'Safe?</script><img src=x onerror=alert(1)>', answer: 'Yes </script> it is.' },
      ]
      const { container } = render(<FAQ items={hostile} />)
      const raw = container.querySelector('script[type="application/ld+json"]')?.innerHTML ?? ''
      expect(raw).not.toContain('</script>')
      expect(raw).toContain('\\u003c')
      // Still valid JSON, and the original text survives the round trip.
      expect(JSON.parse(raw).mainEntity[0].name).toContain('</script>')
      expect(container.querySelector('img')).toBeNull()
    })

    it('uses answerText for JSX answers, and omits items with neither', () => {
      const items = [
        { question: 'Plain?', answer: 'A string answer.' },
        { question: 'Rich?', answer: <strong>bold</strong>, answerText: 'A bold answer.' },
        { question: 'Node only?', answer: <em>no text given</em> },
      ]
      const { container } = render(<FAQ items={items} />)
      const names = jsonOf(container).mainEntity.map((entry: { name: string }) => entry.name)
      // All three render visibly; only the serialisable two enter the schema.
      expect(container.querySelectorAll('details')).toHaveLength(3)
      expect(names).toEqual(['Plain?', 'Rich?'])
    })

    it('emits nothing when opted out, when no item is serialisable, or when children replace the layout', () => {
      // The children escape hatch replaces the visible list, and schema must describe
      // what is actually visible - Google's structured-data policy is explicit on this.
      const none = render(<FAQ items={faqItems} structuredData={false} />)
      expect(none.container.querySelector('script')).toBeNull()
      const jsxOnly = render(<FAQ items={[{ question: 'Q', answer: <em>x</em> }]} />)
      expect(jsxOnly.container.querySelector('script')).toBeNull()
      const custom = render(<FAQ items={faqItems}>custom layout</FAQ>)
      expect(custom.container.querySelector('script')).toBeNull()
    })
  })

  it('renders native details/summary pairs, closed by default', () => {
    const { container } = render(<FAQ title="FAQ" items={faqItems} />)
    const details = container.querySelectorAll('details')
    expect(details).toHaveLength(2)
    expect(details[0]).not.toHaveAttribute('open')
    expect(container.querySelectorAll('summary')).toHaveLength(2)
    expect(screen.getByText('Does it need JavaScript?')).toBeInTheDocument()
  })

  it('adds no ARIA of its own — details already exposes the state', () => {
    const { container } = render(<FAQ items={faqItems} />)
    expect(container.querySelector('details')?.getAttribute('role')).toBeNull()
    expect(container.querySelector('[aria-expanded]')).toBeNull()
    expect(container.querySelector('[aria-controls]')).toBeNull()
  })

  it('renders with zero props and with an empty array without throwing', () => {
    expect(() => render(<FAQ />)).not.toThrow()
    const { container } = render(<FAQ items={[]} />)
    expect(container.querySelector('.vk-faq__list')).toBeNull()
  })

  it('opens the requested item server-side, via the open attribute', () => {
    const { container } = render(<FAQ items={faqItems} defaultOpenIndex={1} />)
    const details = container.querySelectorAll('details')
    expect(details[0]).not.toHaveAttribute('open')
    expect(details[1]).toHaveAttribute('open')
  })

  it('shares a name across items to make the group exclusive natively', () => {
    const { container } = render(<FAQ items={faqItems} name="support-faq" />)
    for (const el of container.querySelectorAll('details')) {
      expect(el).toHaveAttribute('name', 'support-faq')
    }
  })

  it('puts the question in a heading one level below the section title', () => {
    render(<FAQ title="Questions" headingLevel={2} items={faqItems} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Questions' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Does it need JavaScript?' }),
    ).toBeInTheDocument()
  })

  it('lets children take over', () => {
    render(
      <FAQ title="Ignored" items={faqItems}>
        <p>Bespoke</p>
      </FAQ>,
    )
    expect(screen.getByText('Bespoke')).toBeInTheDocument()
    expect(screen.queryByText('Does it need JavaScript?')).toBeNull()
  })

  it('has no axe violations, open or closed', async () => {
    const closed = render(<FAQ title="Questions" items={faqItems} />)
    expect(await axe(closed.container)).toHaveNoViolations()
    const open = render(<FAQ title="More questions" items={faqItems} defaultOpenIndex={0} />)
    expect(await axe(open.container)).toHaveNoViolations()
  })
})

/* ---------------------------------------------------------------------- CTA */

describe('CTA', () => {
  it('renders from props alone', () => {
    render(
      <CTA
        title="Ready to ship?"
        description="Install it in a minute."
        actions={<Button>Install</Button>}
      />,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Ready to ship?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Install' })).toBeInTheDocument()
  })

  it('renders with zero props without throwing', () => {
    const { container } = render(<CTA />)
    expect(container.querySelector('.vk-cta')).not.toBeNull()
  })

  it('maps variant onto the section background, defaulting to muted', () => {
    const { container: fallback } = render(<CTA title="A" />)
    expect(fallback.querySelector('.vk-cta')).toHaveAttribute('data-background', 'muted')
    const { container: primary } = render(<CTA title="B" background="primary" />)
    expect(primary.querySelector('.vk-cta')).toHaveAttribute('data-background', 'primary')
  })

  it('respects headingLevel', () => {
    render(<CTA title="Ready?" headingLevel={3} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Ready?' })).toBeInTheDocument()
  })

  it('lets children take over', () => {
    render(
      <CTA title="Ignored">
        <p>Bespoke</p>
      </CTA>,
    )
    expect(screen.getByText('Bespoke')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Ignored' })).toBeNull()
  })

  it('has no axe violations on every variant', async () => {
    for (const variant of ['default', 'muted', 'primary'] as const) {
      const { container } = render(
        <CTA
          background={variant}
          title="Ready to ship?"
          description="Install it in a minute."
          actions={<Button>Install</Button>}
        />,
      )
      expect(await axe(container)).toHaveNoViolations()
    }
  })
})

/* -------------------------------------------------------------------- Stats */

describe('Stats', () => {
  it('pairs every figure with a label in a description list', () => {
    const { container } = render(<Stats items={stats} />)
    const list = container.querySelector('dl')
    expect(list).not.toBeNull()
    const terms = [...(list?.querySelectorAll('dt') ?? [])].map((el) => el.textContent)
    expect(terms).toEqual(['Uptime', 'Bundle size'])
    expect(screen.getByText('99.98%')).toBeInTheDocument()
  })

  it('puts the label before the figure in the DOM, so it is announced first', () => {
    const { container } = render(<Stats items={[{ value: '99.98%', label: 'Uptime' }]} />)
    const item = container.querySelector('.vk-stats__item')
    expect(item?.children[0]?.tagName).toBe('DT')
    expect(item?.children[1]?.tagName).toBe('DD')
  })

  it('renders with zero props and with an empty array without throwing', () => {
    expect(() => render(<Stats />)).not.toThrow()
    const { container } = render(<Stats items={[]} />)
    expect(container.querySelector('dl')).toBeNull()
  })

  it('respects headingLevel on its own title', () => {
    render(<Stats title="By the numbers" headingLevel={3} items={stats} />)
    expect(screen.getByRole('heading', { level: 3, name: 'By the numbers' })).toBeInTheDocument()
  })

  it('lets children take over', () => {
    render(
      <Stats title="Ignored" items={stats}>
        <p>Bespoke</p>
      </Stats>,
    )
    expect(screen.getByText('Bespoke')).toBeInTheDocument()
    expect(screen.queryByText('99.98%')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Stats title="By the numbers" description="Measured, not marketed." items={stats} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* ------------------------------------------------------------------- Footer */

describe('Footer', () => {
  it('is a contentinfo landmark with a named navigation region', () => {
    render(<Footer columns={footerColumns} copyright="(c) 2026 VivekUI" />)
    expect(screen.getByRole('contentinfo').tagName).toBe('FOOTER')
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute('href', '/components')
    expect(screen.getByText('(c) 2026 VivekUI')).toBeInTheDocument()
  })

  it('renders with zero props and with an empty array without throwing', () => {
    expect(() => render(<Footer />)).not.toThrow()
    const { container } = render(<Footer columns={[]} />)
    expect(container.querySelector('.vk-footer__nav')).toBeNull()
  })

  it('accepts a custom nav label', () => {
    render(<Footer columns={footerColumns} navLabel="Site links" />)
    expect(screen.getByRole('navigation', { name: 'Site links' })).toBeInTheDocument()
  })

  it('respects headingLevel for the column titles', () => {
    render(<Footer columns={footerColumns} headingLevel={3} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Product' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Company' })).toBeInTheDocument()
  })

  it('renders brand and social blocks', () => {
    render(
      <Footer
        brand={<span data-testid="brand">VivekUI</span>}
        social={<a href="/x">X</a>}
        columns={footerColumns}
      />,
    )
    expect(screen.getByTestId('brand')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'X' })).toBeInTheDocument()
  })

  it('lets children take over', () => {
    render(
      <Footer columns={footerColumns}>
        <p>Bespoke</p>
      </Footer>,
    )
    expect(screen.getByText('Bespoke')).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Footer
        brand={<p>VivekUI — sections you install.</p>}
        social={<a href="/github">GitHub</a>}
        columns={footerColumns}
        copyright="(c) 2026 Vivek Kumar Singh"
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* ---------------------------------------------------------------- LogoCloud */

describe('LogoCloud', () => {
  it('gives every logo an accessible name, in all three forms', () => {
    render(<LogoCloud title="Trusted by" logos={logos} />)
    expect(screen.getByRole('img', { name: 'Initech' }).tagName).toBe('IMG')
    expect(screen.getByRole('img', { name: 'Umbrella' }).tagName).toBe('SPAN')
    expect(screen.getByText('Northwind')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('renders with zero props and with an empty array without throwing', () => {
    expect(() => render(<LogoCloud />)).not.toThrow()
    const { container } = render(<LogoCloud logos={[]} />)
    expect(container.querySelector('.vk-logo-cloud__list')).toBeNull()
  })

  it('renders its title as a real heading at the requested level', () => {
    render(<LogoCloud title="Trusted by 4,000 teams" headingLevel={3} logos={logos} />)
    expect(
      screen.getByRole('heading', { level: 3, name: 'Trusted by 4,000 teams' }),
    ).toBeInTheDocument()
  })

  it('lets children take over', () => {
    render(
      <LogoCloud title="Ignored" logos={logos}>
        <p>Bespoke</p>
      </LogoCloud>,
    )
    expect(screen.getByText('Bespoke')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Ignored' })).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(<LogoCloud title="Trusted by" logos={logos} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* ------------------------------------------------------------- list roles */

describe('list semantics', () => {
  // Safari/VoiceOver drops the list role from a `list-style: none` list. Every
  // unbulleted list here therefore carries an explicit role="list" — the reason
  // reset.css has a `ul[role="list"]` selector at all. If a future tidy-up removes
  // the "redundant" roles, this fails.
  it('keeps an explicit list role on every unbulleted list', () => {
    const cases = [
      render(<FeatureGrid features={features} />),
      render(<Pricing plans={plans} />),
      render(<Testimonials items={testimonials} />),
      render(<Footer columns={footerColumns} />),
      render(<LogoCloud logos={logos} />),
    ]
    for (const { container } of cases) {
      const lists = container.querySelectorAll('ul')
      expect(lists.length).toBeGreaterThan(0)
      for (const list of lists) expect(list).toHaveAttribute('role', 'list')
    }
  })
})

/* ----------------------------------------------------- a whole landing page */

describe('a full assembled page', () => {
  it('has no axe violations, and keeps a valid heading outline', async () => {
    const { container } = render(
      <>
        <Hero
          eyebrow="Now in beta"
          title="Ship the page, not the primitives"
          description="Ten page sections, composed from primitives you already ship."
          actions={
            <>
              <Button>Get started</Button>
              <Button variant="outline">Read the docs</Button>
            </>
          }
          layout="split"
          media={<img src="/hero.png" alt="A gallery of the components" />}
        />
        <LogoCloud title="Trusted by" logos={logos} />
        <FeatureGrid
          title="Everything a landing page needs"
          description="No hand-written navbars."
          features={features}
        />
        <Pricing title="Simple pricing" description="No seats, no surprises." plans={plans} />
        <Testimonials title="Loved by teams" items={testimonials} />
        <Stats title="By the numbers" items={stats} />
        <FAQ title="Questions" items={faqItems} name="page-faq" defaultOpenIndex={0} />
        <CTA
          background="primary"
          title="Ready to ship?"
          description="One install, one CSS import."
          actions={<Button variant="outline">Install</Button>}
        />
        <Footer
          brand={<p>VivekUI</p>}
          columns={footerColumns}
          copyright="(c) 2026 Vivek Kumar Singh"
        />
      </>,
    )

    expect(await axe(container)).toHaveNoViolations()

    // Exactly one h1, and no level ever skipped on the way down.
    const levels = [...container.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((el) =>
      Number(el.tagName.slice(1)),
    )
    expect(levels.filter((level) => level === 1)).toHaveLength(1)
    expect(levels[0]).toBe(1)
    for (const [index, level] of levels.entries()) {
      const previous = levels[index - 1]
      if (previous !== undefined) expect(level).toBeLessThanOrEqual(previous + 1)
    }
  })
})
