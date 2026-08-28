/**
 * Comparison pages: "VivekUI vs X", for the search everyone types before choosing a library.
 *
 * The rule for these pages is that every claim about VivekUI is one this repository can
 * prove (a test, a gate, a file), and every statement about another library is a description
 * of how it works that its own documentation would agree with — never a judgement of its
 * quality. The other libraries are good; the point is the trade-offs are different.
 */
import { blocks } from './blocks'
import { templates } from './page-templates'
import { registry } from './registry'

const TOTAL = registry.components.length
const SERVER_SAFE = registry.components.filter((entry) => !entry.isClient).length

export interface ComparisonRow {
  aspect: string
  vivek: string
  other: string
}

export interface Comparison {
  slug: string
  /** The other library, as its authors write it. */
  name: string
  /** One sentence, ≤ 155 characters, for the meta description. */
  description: string
  /** How the other library approaches styling and distribution, in neutral terms. */
  summary: string
  /** When the other library is the right choice. Honest, or the page is worth nothing. */
  chooseOther: string[]
  /** When VivekUI is the right choice. */
  chooseVivek: string[]
  rows: ComparisonRow[]
}

const COMMON_ROWS: ComparisonRow[] = [
  {
    aspect: 'Runtime dependencies',
    vivek: 'None. `package.json` has no `dependencies` field; React and React DOM are peers.',
    other: '',
  },
  {
    aspect: 'Styling',
    vivek:
      'One static stylesheet, every selector in `:where()` (zero specificity), variants as `data-*` attributes, tokens as `--vk-*` custom properties.',
    other: '',
  },
  {
    aspect: 'Overriding a style',
    vivek: 'Any one class of yours wins — no `!important`, no specificity war.',
    other: '',
  },
  {
    aspect: 'Server Components',
    vivek: `Unbundled build; each file keeps its own 'use client'. ${SERVER_SAFE} of ${TOTAL} components ship no client JavaScript.`,
    other: '',
  },
  {
    aspect: 'Accessibility testing',
    vivek:
      'A `vitest-axe` assertion per component, browser axe on composed pages in three viewports, keyboard maps from the WAI-ARIA Authoring Practices.',
    other: '',
  },
  {
    aspect: 'Sections and pages',
    vivek: `Hero, Navbar, Pricing, FAQ, CTA, Footer, Stats, Testimonials as components; ${blocks.length} blocks and ${templates.length} whole pages to copy.`,
    other: '',
  },
]

function rows(other: Record<string, string>): ComparisonRow[] {
  return COMMON_ROWS.map((row) => ({ ...row, other: other[row.aspect] ?? '—' }))
}

export const COMPARISONS: Comparison[] = [
  {
    slug: 'shadcn-ui',
    name: 'shadcn/ui',
    description:
      'VivekUI and shadcn/ui both give you accessible React components; one is an installed package, the other is code copied into your repo. The trade-offs, plainly.',
    summary:
      'shadcn/ui is a collection of components you copy into your own project with a CLI, styled with Tailwind CSS utility classes and built on Radix UI primitives. You own the code and edit it directly; updates are re-copied by hand.',
    chooseOther: [
      'You already run Tailwind and want components written in it.',
      'You want to edit component source directly rather than compose props.',
      'You prefer Radix primitives as the behaviour layer.',
    ],
    chooseVivek: [
      'You want a versioned package with a changelog, so upgrades are `npm update` and a migration note.',
      'You do not use Tailwind, or you want components that work with any CSS approach.',
      'You want zero runtime dependencies for supply-chain or bundle reasons.',
      'You want marketing sections (Hero, Pricing, FAQ…) and whole page templates, not only primitives.',
    ],
    rows: rows({
      'Runtime dependencies':
        'Radix UI packages, class-variance-authority, clsx, tailwind-merge and Tailwind CSS as a build dependency.',
      Styling: 'Tailwind utility classes in the copied component files.',
      'Overriding a style': 'Edit the component file you own, or pass more utility classes.',
      'Server Components': "Components carry 'use client' where needed; you control the files.",
      'Accessibility testing': 'Inherits Radix behaviour; testing is up to your project.',
      'Sections and pages': 'Blocks are offered on the website; pages are assembled by you.',
    }),
  },
  {
    slug: 'material-ui',
    name: 'MUI (Material UI)',
    description:
      'VivekUI compared with MUI: static CSS and tokens against Emotion-based CSS-in-JS and the Material Design system. Where each one fits.',
    summary:
      "MUI implements Google's Material Design as React components, styled at runtime with Emotion (CSS-in-JS) through a `sx` prop and a theme object. It is large, mature and widely deployed in enterprise applications.",
    chooseOther: [
      'Material Design is the look you want, or your product already uses it.',
      'You rely on MUI X (data grid, date pickers with enterprise licensing).',
      'Your team is fluent in the `sx` prop and theme-object styling.',
    ],
    chooseVivek: [
      'You want your own visual identity rather than Material.',
      'You want static CSS with no runtime style computation and no Emotion in the bundle.',
      'You are building on React Server Components and want most components to ship no client JavaScript.',
      'You want zero runtime dependencies.',
    ],
    rows: rows({
      'Runtime dependencies':
        '@mui/material depends on Emotion (@emotion/react, @emotion/styled) and several MUI packages.',
      Styling:
        'CSS-in-JS via Emotion; styles computed at runtime from the theme and the `sx` prop.',
      'Overriding a style':
        '`sx`, `styled()`, or theme `components` overrides; class names are generated.',
      'Server Components':
        'Requires the Emotion cache/registry setup for the App Router; components are client components.',
      'Accessibility testing': 'Documented per component; testing is up to your project.',
      'Sections and pages':
        'Templates are offered separately; marketing sections are assembled from primitives.',
    }),
  },
  {
    slug: 'chakra-ui',
    name: 'Chakra UI',
    description:
      'VivekUI compared with Chakra UI: a static stylesheet and data-attribute variants against style props and a runtime theme. The differences that matter.',
    summary:
      'Chakra UI is a component library styled through style props (`<Box p={4} bg="gray.100">`) resolved against a theme at runtime. Version 3 moved to a static extraction approach with Panda-style recipes; earlier versions use Emotion.',
    chooseOther: [
      'You like styling with props on every element and want the theme in JavaScript.',
      'You already have a Chakra theme and component recipes.',
    ],
    chooseVivek: [
      'You want plain CSS you can read in DevTools, with class names that mean something.',
      'You want variants as `data-*` attributes and tokens as CSS custom properties you can set from any stylesheet.',
      'You want zero runtime dependencies and no style props in your JSX.',
    ],
    rows: rows({
      'Runtime dependencies':
        'Several @chakra-ui packages plus Emotion (v2) or its own styling runtime (v3).',
      Styling: 'Style props and recipes resolved against a JavaScript theme.',
      'Overriding a style': 'Style props, or theme recipes; generated class names.',
      'Server Components': 'Provider-based; components are client components.',
      'Accessibility testing': 'Documented per component; testing is up to your project.',
      'Sections and pages': 'Pro templates are a separate paid product.',
    }),
  },
  {
    slug: 'radix-ui',
    name: 'Radix UI',
    description:
      'VivekUI compared with Radix UI: unstyled behaviour primitives you style yourself against a styled, themed library with the behaviour built in.',
    summary:
      'Radix Primitives are unstyled, accessible behaviour components — Dialog, Popover, Select and so on — that you style entirely yourself. Radix Themes is the styled layer on top. Many libraries, including shadcn/ui, build on the primitives.',
    chooseOther: [
      'You want only behaviour and will design every pixel yourself.',
      'You are building your own design system and want primitives to wrap.',
    ],
    chooseVivek: [
      'You want components that look finished on install and can still be themed with tokens.',
      'You want the behaviour and the styling from one package with one changelog.',
      'You want sections and page templates, which a primitives library does not offer.',
    ],
    rows: rows({
      'Runtime dependencies':
        'One package per primitive (or the umbrella `radix-ui`), each with internal dependencies.',
      Styling: 'None in Primitives; you supply all CSS. Radix Themes ships its own stylesheet.',
      'Overriding a style': 'Everything is yours to style; there is nothing to override.',
      'Server Components': 'Primitives are client components; you control what wraps them.',
      'Accessibility testing': 'Primitives follow WAI-ARIA patterns and are tested upstream.',
      'Sections and pages': 'Not offered; primitives only.',
    }),
  },
  {
    slug: 'ant-design',
    name: 'Ant Design',
    description:
      'VivekUI compared with Ant Design: a compact, static-CSS library against a comprehensive enterprise design language with CSS-in-JS tokens.',
    summary:
      'Ant Design is a large, opinionated design system aimed at enterprise applications, with an extensive component set (tables, forms, date pickers) styled through its own CSS-in-JS token system since version 5.',
    chooseOther: [
      'You are building a dense back-office application and want its very large component catalogue.',
      'The Ant Design language is acceptable or desired for your product.',
    ],
    chooseVivek: [
      'You want your own visual identity and a smaller, tree-shakeable dependency.',
      'You want static CSS, zero runtime dependencies and Server Component friendliness.',
      'You want marketing sections and page templates alongside application components.',
    ],
    rows: rows({
      'Runtime dependencies': 'Many, including rc-* behaviour packages and @ant-design/cssinjs.',
      Styling: 'CSS-in-JS with design tokens, generated at runtime.',
      'Overriding a style': 'Token overrides via ConfigProvider, or className hooks on components.',
      'Server Components':
        'Requires a style registry for the App Router; components are client components.',
      'Accessibility testing': 'Varies by component; testing is up to your project.',
      'Sections and pages':
        'Pro templates are a separate product; the library targets applications.',
    }),
  },
]

export const comparisonBySlug = (slug: string): Comparison | undefined =>
  COMPARISONS.find((comparison) => comparison.slug === slug)
