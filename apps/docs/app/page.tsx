import {
  Button,
  Code,
  CTA,
  FAQ,
  FeatureGrid,
  Footer,
  Hero,
  Pricing,
  Section,
  Stats,
  Testimonials,
} from '@the_viveksingh/vivek-ui'
import Link from 'next/link'
import { SupportCta } from '../components/support-cta'
import { registry } from '../lib/registry'
import { LIBRARY_VERSION } from '../lib/version'

/*
 * Facts about the library, derived rather than typed.
 *
 * The page previously claimed 44 server-safe components when the real number was 49, and
 * 198 B for Button when size-limit reported 773 B. Both were true once. A landing page full
 * of specific, checkable numbers is only an asset while the numbers are right - and these
 * are the first thing an evaluating engineer verifies.
 *
 * The byte figures come from `pnpm --filter @the_viveksingh/vivek-ui size` and are asserted
 * against the real budgets in `lib/landing-facts.test.ts`.
 */
const COMPONENT_COUNT = registry.components.length
const CHART_COUNT = registry.charts.length
const SERVER_SAFE = registry.components.filter((entry) => !entry.isClient).length

/**
 * The landing page.
 *
 * Deliberately assembled almost entirely from the library's own section components —
 * `Hero`, `FeatureGrid`, `Stats`, `Pricing`, `Testimonials`, `FAQ`, `CTA`, `Footer`.
 * The claim the library makes is "assemble a page from imports alone"; this page is
 * either evidence for that claim or evidence against it.
 *
 * No `'use client'`: this whole page is a Server Component.
 */
export default function HomePage() {
  return (
    <>
      <Hero
        eyebrow={`v${LIBRARY_VERSION} · MIT`}
        title="Every building block of a website. Zero dependencies."
        description={`${COMPONENT_COUNT} accessible React components and ${CHART_COUNT} SVG charts. One install, one CSS import, no configuration. Works in React 18 and 19, and in Next.js with both routers.`}
        actions={
          <>
            <Button size="lg" asChild>
              <Link href="/docs/installation">Get started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs/components">Browse components</Link>
            </Button>
          </>
        }
      />

      <Stats
        title="Measured, not claimed"
        description="size-limit figures from the published build, minified and brotlied, React excluded."
        items={[
          { id: 'btn', value: '773 B', label: 'One component', description: 'importing Button' },
          {
            id: 'all',
            value: '40.8 kB',
            label: `All ${COMPONENT_COUNT} components`,
            description: 'if you import everything',
          },
          {
            id: 'deps',
            value: '0',
            label: 'Runtime dependencies',
            description: 'verifiable with npm ls',
          },
          {
            id: 'rsc',
            value: String(SERVER_SAFE),
            label: 'Server-safe components',
            description: 'no client boundary needed',
          },
        ]}
      />

      <FeatureGrid
        eyebrow="Why this exists"
        title="A dependency, not a copy-paste snippet"
        description="Copy-paste kits hand you the source and the maintenance burden with it. This is a normal package: npm update and you have the fixes."
        features={[
          {
            id: 'deps',
            title: 'Zero runtime dependencies',
            description:
              'No Tailwind, no Radix, no clsx, no Emotion. react and react-dom are peers and are never bundled, so you cannot end up with two copies of React.',
          },
          {
            id: 'rsc',
            title: 'Server-safe by default',
            description: `${SERVER_SAFE} of ${COMPONENT_COUNT} components carry no use-client directive. The build is unbundled per file so each one keeps its own, and CI proves it survives in both ESM and CJS.`,
          },
          {
            id: 'css',
            title: 'Your CSS always wins',
            description:
              'Every selector is wrapped in :where(), which has specificity zero. One flat class of your own beats the library — no !important, ever.',
          },
          {
            id: 'responsive',
            title: 'Responsive with no props',
            description:
              'Container queries, not viewport queries. A card grid inside a narrow sidebar stacks exactly as it would on a phone, even on a 27-inch display.',
          },
          {
            id: 'a11y',
            title: 'Accessible by construction',
            description:
              'IconButton requires aria-label at the type level. Alert picks alert vs status by tone. Every component is covered by automated axe assertions.',
          },
          {
            id: 'charts',
            title: 'Charts with no chart library',
            description: `${CHART_COUNT} chart types in pure SVG, 8.14 kB for all of them. Each renders a real table fallback, and never encodes a series by colour alone.`,
          },
        ]}
      />

      <Testimonials
        title="What it replaces"
        items={[
          {
            id: 't1',
            quote:
              'A pricing table, a command palette, a data table, a chart and a chat panel — from one install, with nothing else in package.json.',
            author: 'The point',
            role: 'in one sentence',
          },
        ]}
      />

      <Pricing
        eyebrow="Pricing"
        title="Free. All of it. Forever."
        description="MIT licensed. There is no paid tier, no pro components, and no telemetry."
        plans={[
          {
            id: 'oss',
            name: 'Open source',
            price: '$0',
            description: 'Everything, for any use including commercial.',
            features: [
              `All ${COMPONENT_COUNT} components`,
              `All ${CHART_COUNT} charts`,
              'Full TypeScript types',
              'Server Components support',
              'MIT licence',
            ],
            highlighted: true,
            badge: 'Only tier',
            cta: (
              <Button fullWidth asChild>
                <Link href="/docs/installation">Install it</Link>
              </Button>
            ),
          },
        ]}
      />

      <FAQ
        title="Questions"
        items={[
          {
            id: 'q1',
            question: 'How is it genuinely zero-dependency?',
            answer:
              'The published package has no dependencies field at all — run npm ls --omit=dev to confirm. Utilities other libraries pull in, like clsx or a focus trap, are written in-house. CI fails the build if a runtime dependency ever appears.',
          },
          {
            id: 'q2',
            question: 'Does it work with Next.js App Router?',
            answer:
              'Yes, and this site is the proof — it is a Next.js App Router app whose landing page is a Server Component built from these section components. Only genuinely interactive components carry use-client.',
          },
          {
            id: 'q3',
            question: 'How do I use my own colours and fonts?',
            answer:
              'Override the --vk-* custom properties in your own stylesheet. There is no config file, no theme object and no build step — it is plain CSS you already know.',
          },
          {
            id: 'q4',
            question: 'What is the catch?',
            answer:
              'The CSS is one stylesheet, so an app using five components still downloads all 23 kB gzipped. That is the trade for one import and no build configuration. Chart CSS is a separate import.',
          },
        ]}
      />

      <CTA
        title="Install it and see"
        description={
          <>
            <Code>npm install @the_viveksingh/vivek-ui</Code> — then one CSS import, and you are
            done.
          </>
        }
        actions={
          <>
            <Button size="lg" asChild>
              <Link href="/docs/installation">Read the docs</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/playground">Try the playground</Link>
            </Button>
          </>
        }
      />

      <Section padding="lg">
        <SupportCta />
      </Section>

      <Footer
        brand={
          <>
            <strong>VivekUI</strong> — by Vivek Kumar Singh
          </>
        }
        copyright="MIT licensed. © 2026 Vivek Kumar Singh."
        columns={[
          {
            title: 'Docs',
            links: [
              { label: 'Installation', href: '/docs/installation' },
              { label: 'Components', href: '/docs/components' },
              { label: 'Charts', href: '/docs/charts' },
              { label: 'Playground', href: '/playground' },
            ],
          },
          {
            title: 'Project',
            links: [
              {
                label: 'GitHub',
                href: 'https://github.com/intellectwithvivek/vivek_UI',
                target: '_blank',
              },
              {
                label: 'npm',
                href: 'https://www.npmjs.com/package/@the_viveksingh/vivek-ui',
                target: '_blank',
              },
            ],
          },
          {
            title: 'Support',
            links: [
              {
                label: 'Buy me a coffee',
                href: 'https://www.buymeacoffee.com/theviveksingh',
                target: '_blank',
              },
              {
                label: 'GitHub Sponsors',
                href: 'https://github.com/sponsors/intellectwithvivek',
                target: '_blank',
              },
            ],
          },
          {
            title: 'Author',
            links: [
              { label: 'Website', href: 'https://vivekkumarsingh.in', target: '_blank' },
              { label: 'GitHub', href: 'https://github.com/intellectwithvivek', target: '_blank' },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/singhvvk/',
                target: '_blank',
              },
            ],
          },
        ]}
      />
    </>
  )
}
