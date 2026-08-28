import {
  Badge,
  Button,
  CTA,
  FAQ,
  FeatureGrid,
  Footer,
  Hero,
  LogoCloud,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarLinks,
  NavbarToggle,
  Pricing,
  Stats,
  Testimonials,
} from '@the_viveksingh/vivek-ui'

/*
 * A whole marketing page with no layout code.
 *
 * Every section below is one component fed an array. That is the point of the exercise: if
 * a landing page needs hand-rolled grids and spacing, the section components are not doing
 * their job. The only bespoke markup on this page is the inline SVG for the feature icons.
 */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const Icon = ({ d }: { d: string }) => (
  <svg aria-hidden="true" height="22" viewBox="0 0 24 24" width="22">
    <path d={d} {...stroke} />
  </svg>
)

const FEATURES = [
  {
    id: 'speed',
    icon: <Icon d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
    title: 'Fast by default',
    description:
      'Static CSS and no runtime styling engine, so nothing recomputes a class name while your user is waiting.',
  },
  {
    id: 'a11y',
    icon: <Icon d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 8h16M12 8v6m0 0-3 8m3-8 3 8" />,
    title: 'Accessible on arrival',
    description:
      'Keyboard maps from the WAI-ARIA authoring practices, and an axe assertion in every component test.',
  },
  {
    id: 'deps',
    icon: <Icon d="M12 3 3 8v8l9 5 9-5V8l-9-5Zm0 0v18M3 8l9 5 9-5" />,
    title: 'Zero dependencies',
    description:
      'One package, nothing underneath it. No transitive advisories, no lockfile churn, no supply chain to audit.',
  },
  {
    id: 'themes',
    icon: <Icon d="M12 3a9 9 0 1 0 0 18 3 3 0 0 0 0-6 3 3 0 0 1 0-6 3 3 0 0 0 0-6Z" />,
    title: 'Themed with CSS variables',
    description:
      'Change one custom property and the whole system moves. No provider, no build step, no rebuild.',
  },
  {
    id: 'rsc',
    icon: <Icon d="M4 6h16M4 12h16M4 18h10" />,
    title: 'Server components first',
    description:
      "Only the components that genuinely need state carry 'use client'. The rest ship no JavaScript at all.",
  },
  {
    id: 'types',
    icon: <Icon d="m8 6-6 6 6 6M16 6l6 6-6 6" />,
    title: 'Types that mean something',
    description:
      'Strict TypeScript throughout, props tables generated from the declarations, so the docs cannot drift.',
  },
]

const PLANS = [
  {
    id: 'free',
    name: 'Open source',
    price: '$0',
    period: 'forever',
    description: 'Everything in the library, under MIT.',
    features: ['All 99 components', 'All 10 charts', 'Full source on GitHub', 'MIT licence'],
    cta: (
      <Button fullWidth variant="outline">
        Install it
      </Button>
    ),
  },
  {
    id: 'team',
    name: 'Team',
    price: '$0',
    period: 'also forever',
    description: 'The same thing. There is no paid tier.',
    features: [
      'Everything on the left',
      'Unlimited projects',
      'Unlimited developers',
      'No seat counting',
    ],
    cta: <Button fullWidth>Install it</Button>,
    highlighted: true,
    badge: 'Most popular',
  },
  {
    id: 'support',
    name: 'Sponsor',
    price: '$5',
    period: '/month',
    description: 'If it saved you a week, this is optional.',
    features: ['Funds the maintenance', 'Your name in the README', 'Nothing is gated behind it'],
    cta: (
      <Button fullWidth variant="outline">
        Sponsor
      </Button>
    ),
  },
]

export default function LandingPage() {
  return (
    <>
      <Navbar bordered container="lg" sticky>
        <NavbarBrand href="#">Northwind</NavbarBrand>
        <NavbarToggle />
        <NavbarLinks>
          <NavbarLink active href="#features">
            Features
          </NavbarLink>
          <NavbarLink href="#pricing">Pricing</NavbarLink>
          <NavbarLink href="#faq">FAQ</NavbarLink>
          <NavbarLink href="#docs">Docs</NavbarLink>
        </NavbarLinks>
        <NavbarActions>
          <Button size="sm" variant="ghost">
            Sign in
          </Button>
          <Button size="sm">Get started</Button>
        </NavbarActions>
      </Navbar>

      <Hero
        actions={
          <>
            <Button size="lg">Start building</Button>
            <Button size="lg" variant="outline">
              Read the docs
            </Button>
          </>
        }
        description="Ninety-nine components and ten charts, with no runtime dependencies, no CSS-in-JS, and no build plugin. Install one package and import a stylesheet."
        eyebrow={<Badge variant="soft">v1.0 is out</Badge>}
        title="Ship the interface, not the infrastructure"
      />

      <LogoCloud
        logos={[
          { alt: 'Meridian' },
          { alt: 'Halcyon' },
          { alt: 'Fieldwork' },
          { alt: 'Northgate' },
          { alt: 'Overtone' },
          { alt: 'Palisade' },
        ]}
        title="Trusted by teams shipping every day"
      />

      <div id="features">
        <FeatureGrid
          description="The parts you would otherwise rebuild on every project, done once and done properly."
          eyebrow="Why this one"
          features={FEATURES}
          title="Everything a product needs, nothing it does not"
        />
      </div>

      {/*
        Figures a demo can state without going stale. The first version quoted a bundle size
        and a test count, and both were wrong within a release - in a template people copy,
        which would have propagated the wrong numbers into their pages too.
      */}
      <Stats
        items={[
          { id: 'components', value: '91', label: 'Components', description: 'All MIT licensed' },
          { id: 'deps', value: '0', label: 'Runtime dependencies' },
          { id: 'licence', value: 'MIT', label: 'Licence', description: 'Commercial use included' },
          { id: 'a11y', value: 'AA', label: 'WCAG 2.1', description: 'Every component axe-tested' },
        ]}
      />

      <Testimonials
        eyebrow="What people say"
        items={[
          {
            id: 'a',
            quote:
              'We removed four dependencies the week we switched. The audit noise just stopped.',
            author: 'Priya Raman',
            role: 'Staff engineer, Meridian',
          },
          {
            id: 'b',
            quote:
              'The keyboard support is the part I did not expect. Our accessibility audit came back clean on the first pass.',
            author: 'Tom Okafor',
            role: 'Frontend lead, Halcyon',
          },
          {
            id: 'c',
            quote:
              'Theming is one CSS variable. I rebranded the whole admin panel on a Friday afternoon.',
            author: 'Elena Vasquez',
            role: 'Design engineer, Fieldwork',
          },
        ]}
        title="Teams that stopped fighting their component library"
      />

      <div id="pricing">
        <Pricing
          description="It is MIT licensed. The tiers below are a joke about pricing pages."
          eyebrow="Pricing"
          plans={PLANS}
          title="Free, and then free"
        />
      </div>

      <div id="faq">
        <FAQ
          eyebrow="Questions"
          items={[
            {
              id: 'deps',
              question: 'Really no runtime dependencies?',
              answer:
                'None. The package.json has no dependencies field at all. React and React DOM are peer dependencies, which you already have.',
            },
            {
              id: 'tailwind',
              question: 'Does it work alongside Tailwind?',
              answer:
                'Yes. Every selector in the library is wrapped in :where(), which gives it zero specificity, so any utility class you add wins without !important.',
            },
            {
              id: 'rsc',
              question: 'Does it work with React Server Components?',
              answer:
                "Yes. The build is unbundled, so each file keeps its own 'use client' directive and only the interactive components create a client boundary.",
            },
            {
              id: 'licence',
              question: 'What is the catch with the licence?',
              answer:
                'There is none. MIT, including commercial use, with no attribution requirement beyond the licence text.',
            },
          ]}
          name="Northwind FAQ"
          title="The ones people actually ask"
        />
      </div>

      <CTA
        actions={
          <>
            <Button size="lg">Install the package</Button>
            <Button size="lg" variant="outline">
              Browse components
            </Button>
          </>
        }
        description="One npm install and one stylesheet import. There is no configuration step."
        title="Start with a Button and see how far it goes"
        background="primary"
      />

      <Footer
        brand="Northwind"
        columns={[
          {
            title: 'Product',
            links: [
              { label: 'Components', href: '#' },
              { label: 'Charts', href: '#' },
              { label: 'Playground', href: '#' },
              { label: 'Changelog', href: '#' },
            ],
          },
          {
            title: 'Docs',
            links: [
              { label: 'Installation', href: '#' },
              { label: 'Theming', href: '#' },
              { label: 'Accessibility', href: '#' },
              { label: 'TypeScript', href: '#' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About', href: '#' },
              { label: 'Blog', href: '#' },
              { label: 'Careers', href: '#' },
              { label: 'Contact', href: '#' },
            ],
          },
        ]}
        copyright="© 2026 Northwind. MIT licensed."
      />
    </>
  )
}
