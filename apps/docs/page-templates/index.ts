/**
 * The page gallery.
 *
 * A component library is judged on whether you can build a page with it, not on whether
 * each part renders in isolation. These are whole pages, composed only of exports from the
 * published package — so the gallery doubles as the proof: if a page here needs something
 * hand-rolled, the library is missing a component.
 *
 * This file carries only the words. Everything mechanical — the source shown on the page,
 * which exports each template uses, whether it needs `'use client'` — is read out of the
 * template files themselves by `scripts/gen-page-sources.mjs`, because a hand-maintained
 * copy of the code is a copy that goes stale the first time someone edits the original.
 */
export type TemplateCategory = 'Marketing' | 'Application' | 'Account' | 'Commerce' | 'Content'

export interface TemplateMeta {
  slug: string
  title: string
  /** One line, for the gallery card and the meta description. */
  description: string
  /** The longer pitch on the template's own page. */
  detail: string
  category: TemplateCategory
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Marketing',
  'Application',
  'Account',
  'Commerce',
  'Content',
]

export const TEMPLATES: TemplateMeta[] = [
  {
    slug: 'landing',
    title: 'Landing page',
    description:
      'A full marketing page: nav, hero, logos, features, stats, testimonials, pricing, FAQ, call to action and footer. Free and MIT licensed.',
    detail:
      'The page most projects need first, and the one that takes longest to assemble by hand. Every section here is a single component with a data prop, so the whole page is roughly a hundred lines of content and no layout code. The FAQ emits FAQPage structured data on its own — the markup an answer engine quotes from — which is the part people forget.',
    category: 'Marketing',
  },
  {
    slug: 'pricing',
    title: 'Pricing page',
    description:
      'Three plans with a highlighted tier, a comparison table that stacks on a phone, and the questions buyers actually ask. Free and MIT licensed.',
    detail:
      'Pricing pages fail in two places: the comparison table is unreadable on a phone, and the FAQ is an accordion with no keyboard support. The table here switches to a stacked layout below its breakpoint rather than scrolling sideways, and the FAQ is native details/summary — keyboard-operable and screen-reader-correct with zero ARIA and zero JavaScript.',
    category: 'Marketing',
  },
  {
    slug: 'contact',
    title: 'Contact page',
    description:
      'A labelled contact form beside opening hours, an address and a cookie-free map. Free and MIT licensed.',
    detail:
      'The map is the interesting part. An embedded Google map sets cookies the moment it paints, which in the EU needs consent before it loads, not after — so this uses the OpenStreetMap provider, which sets none. Switch the provider and the component puts a consent step in front of the frame for you.',
    category: 'Marketing',
  },
  {
    slug: 'login',
    title: 'Sign in',
    description:
      'A centred sign-in card with real labels, a proper error state, autofill tokens and social buttons. Free and MIT licensed.',
    detail:
      'Sign-in forms are where placeholder-as-label does the most damage: the label vanishes the moment someone types, and it was never announced to a screen reader in the first place. Every field here has a real label, the error is tied to its input with aria-describedby, and the whole thing submits with Enter.',
    category: 'Account',
  },
  {
    slug: 'signup',
    title: 'Create account',
    description:
      'Registration with a password strength meter that is announced, not just coloured, and an inline terms checkbox. Free and MIT licensed.',
    detail:
      'The strength meter is announced, not just coloured — a bar that only changes hue tells a colour-blind user nothing, and tells a screen-reader user nothing at all. This one carries its rating in text and updates a live region as it changes.',
    category: 'Account',
  },
  {
    slug: 'dashboard',
    title: 'App dashboard',
    description:
      'A collapsible sidebar, KPI cards, an accessible chart, and a table that sorts, searches and paginates. Free and MIT licensed.',
    detail:
      'The shell every internal tool starts from. The sidebar collapses to an icon rail, the table sorts and searches and paginates without a data library, and the chart ships an accessible data table alongside the SVG so the figures are readable by something other than an eye.',
    category: 'Application',
  },
  {
    slug: 'settings',
    title: 'Settings',
    description:
      'Tabbed sections for profile, notifications and security, with a sticky save bar and a confirm dialog. Free and MIT licensed.',
    detail:
      'Settings pages are a keyboard test in disguise. The tabs implement the full WAI-ARIA tab pattern including arrow keys and Home/End, each switch is a real checkbox underneath, and the danger zone asks before it does anything.',
    category: 'Application',
  },
  {
    slug: 'checkout',
    title: 'Checkout',
    description:
      'A two-column checkout with a sticky order summary and the autocomplete tokens that make autofill work. Free and MIT licensed.',
    detail:
      'Payment forms fail on autofill more than anything else, and autofill is driven entirely by the autocomplete attribute. Every field here carries the right one — cc-number, cc-exp, cc-csc, postal-code — which is the difference between a browser filling the form in one tap and the customer typing sixteen digits on a phone.',
    category: 'Commerce',
  },
  {
    slug: 'product',
    title: 'Product detail',
    description:
      'A keyboard-navigable gallery, variant pickers, a rating summary and an add-to-cart bar. Free and MIT licensed.',
    detail:
      'A product page is mostly state: which image, which size, how many. All of it is held in one component with no store, and the gallery thumbnails are real buttons in a labelled group rather than clickable divs, so the whole picker works from the keyboard.',
    category: 'Commerce',
  },
  {
    slug: 'blog',
    title: 'Blog index',
    description:
      'A featured post, a card grid with correct link semantics, category filters and a newsletter box. Free and MIT licensed.',
    detail:
      'Card grids are where reading order quietly breaks: a card whose whole surface is a link puts the image, the tag and the date inside the link text, so a screen reader reads a paragraph where a title should be. Here the heading holds the link and the card stretches it, which keeps the announced name short.',
    category: 'Content',
  },
  {
    slug: 'team',
    title: 'About and team',
    description:
      'A story section, company stats, a timeline and a team grid with portraits. Free and MIT licensed.',
    detail:
      'Straightforward on purpose — the point is how little code a page like this needs when the sections are components. The portraits are generated gradients rather than stock photography, so nothing here depends on a third-party image host that can disappear or start logging your visitors.',
    category: 'Content',
  },
  {
    slug: 'not-found',
    title: '404',
    description:
      'A 404 that helps: search, popular destinations, and an error announced to assistive tech. Free and MIT licensed.',
    detail:
      'Most 404s are a shrug. This one gives the visitor somewhere to go, and it announces the error to assistive technology instead of relying on a large number being visible — the status code is not in the accessibility tree unless you put it there.',
    category: 'Content',
  },
]

export const templateBySlug = (slug: string): TemplateMeta | undefined =>
  TEMPLATES.find((template) => template.slug === slug)
