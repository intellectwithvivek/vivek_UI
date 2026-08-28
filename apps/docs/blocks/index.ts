/**
 * The block gallery.
 *
 * A block is a section of a page — a hero, a header, a pricing table — built only from
 * exports of the published package, so it can be pasted into any project and run. Where the
 * page-template gallery proves the library can build whole pages, this one answers the
 * question people arrive with: "show me ten heroes, I will pick one".
 *
 * This file carries only the words. The source shown on each block's page, the exports it
 * uses and whether it is a client component are read out of the block files themselves by
 * `scripts/gen-page-sources.mjs --dir blocks`, so nothing here can drift from the code.
 */
export type BlockCategory =
  | 'Heroes'
  | 'Headers'
  | 'Features'
  | 'Pricing'
  | 'Testimonials'
  | 'CTAs'
  | 'FAQs'
  | 'Footers'
  | 'Stats'
  | 'Forms'

export interface BlockMeta {
  slug: string
  title: string
  /** One sentence, for the gallery card and the meta description. */
  description: string
  category: BlockCategory
  /** Height of the live frame, in pixels. */
  height: number
}

export const BLOCK_CATEGORIES: BlockCategory[] = [
  'Heroes',
  'Headers',
  'Features',
  'Pricing',
  'Testimonials',
  'CTAs',
  'FAQs',
  'Footers',
  'Stats',
  'Forms',
]

export const BLOCKS: BlockMeta[] = [
  {
    slug: 'hero-centered',
    title: 'Centred hero',
    description:
      'The classic: eyebrow, headline, one paragraph and two buttons, centred with a capped measure so the lead stays readable.',
    category: 'Heroes',
    height: 480,
  },
  {
    slug: 'hero-split-media',
    title: 'Split hero with media',
    description:
      'Copy on the left, a product image on the right. Below 48rem the image stacks under the text without a breakpoint of yours.',
    category: 'Heroes',
    height: 520,
  },
  {
    slug: 'hero-media-first',
    title: 'Media-first hero',
    description:
      'The same split, with the picture before the copy. mediaPosition="start" moves it on wide screens; on phones it still stacks under the text.',
    category: 'Heroes',
    height: 520,
  },
  {
    slug: 'hero-backdrop-gradient',
    title: 'Hero over a photo',
    description:
      'A full-bleed photograph behind the copy with a gradient scrim. The dark overlay switches the text to light for you.',
    category: 'Heroes',
    height: 560,
  },
  {
    slug: 'hero-fullscreen-dark',
    title: 'Full-screen dark hero',
    description:
      'A viewport-height hero on a dark gradient with a light headline. minHeight="screen" centres the copy vertically.',
    category: 'Heroes',
    height: 600,
  },
  {
    slug: 'hero-with-logos',
    title: 'Hero with a logo strip',
    description:
      'A centred hero followed immediately by the companies that already use the product — social proof before the fold ends.',
    category: 'Heroes',
    height: 620,
  },
  {
    slug: 'hero-with-stats',
    title: 'Hero with stats',
    description:
      'A start-aligned hero with three numbers underneath it. The figures do the persuading the adjectives would have done.',
    category: 'Heroes',
    height: 620,
  },
  {
    slug: 'hero-product-launch',
    title: 'Product launch hero',
    description:
      'Announcement badge, headline, and a screenshot on a soft gradient card. For the day a new version goes out.',
    category: 'Heroes',
    height: 640,
  },
  {
    slug: 'hero-app-store',
    title: 'App hero with store buttons',
    description:
      'A mobile app hero: phone screenshot beside the copy and two store badges rendered as outline buttons.',
    category: 'Heroes',
    height: 560,
  },
  {
    slug: 'hero-newsletter',
    title: 'Hero with an email form',
    description:
      'A hero whose only action is an email field: for a launch page, a waitlist or a newsletter with nothing else to sell yet.',
    category: 'Heroes',
    height: 480,
  },
  {
    slug: 'header-simple',
    title: 'Simple header',
    description:
      'Brand, four links and two actions. The toggle handles the phone menu with aria-expanded and aria-controls already wired.',
    category: 'Headers',
    height: 200,
  },
  {
    slug: 'header-centered-links',
    title: 'Header with centred links',
    description:
      'layout="center" puts the links in the middle of a wide bar, brand on one side and the action on the other.',
    category: 'Headers',
    height: 200,
  },
  {
    slug: 'header-links-end',
    title: 'Header with links at the end',
    description:
      'layout="end" pushes the links up against the actions, leaving the brand alone on the start edge.',
    category: 'Headers',
    height: 200,
  },
  {
    slug: 'header-transparent',
    title: 'Transparent header over a hero',
    description:
      'variant="transparent" drops the surface and border so the bar sits on the hero backdrop. The dark overlay lights the text.',
    category: 'Headers',
    height: 520,
  },
  {
    slug: 'header-floating',
    title: 'Floating header',
    description:
      'variant="floating" insets the bar with a radius and a shadow, and keeps a matching offset when sticky.',
    category: 'Headers',
    height: 220,
  },
  {
    slug: 'header-with-search',
    title: 'Header with search',
    description:
      'A search field in the actions slot for a docs or commerce site, with a keyboard hint so people learn the shortcut.',
    category: 'Headers',
    height: 200,
  },
  {
    slug: 'header-with-theme-toggle',
    title: 'Header with theme toggle',
    description:
      'A ThemeToggle in the actions slot beside the primary button. It reads and writes the same theme your ThemeProvider does.',
    category: 'Headers',
    height: 200,
  },
  {
    slug: 'header-with-avatar',
    title: 'App header with account menu',
    description:
      "An application header: product links, a feedback button and the signed-in user's avatar opening a dropdown menu.",
    category: 'Headers',
    height: 260,
  },
  {
    slug: 'header-large-brand',
    title: 'Large header',
    description:
      'size="lg" for a taller bar with a logo mark and wordmark, the kind a publication or agency site wants.',
    category: 'Headers',
    height: 220,
  },
  {
    slug: 'header-announcement',
    title: 'Header with an announcement bar',
    description:
      'A slim announcement strip above the header for a launch, a sale or an incident notice, with the bar itself unchanged.',
    category: 'Headers',
    height: 240,
  },
  {
    slug: 'features-grid-3',
    title: 'Three-column feature grid',
    description:
      'Six features with icons in a three-column grid that drops to two and then one as the section narrows.',
    category: 'Features',
    height: 560,
  },
  {
    slug: 'features-grid-4-icons',
    title: 'Four-up features, start-aligned',
    description:
      'A tighter four-column grid with a left-aligned header. For the "how it works" band under a hero.',
    category: 'Features',
    height: 480,
  },
  {
    slug: 'features-bento',
    title: 'Bento feature grid',
    description:
      'Features of unequal weight in a bento layout: one large card, two tall, two small. Built with BentoGrid and Card.',
    category: 'Features',
    height: 640,
  },
  {
    slug: 'features-split-image',
    title: 'Feature split with image',
    description:
      'A single feature explained at length beside a screenshot, with three check-marked points. Alternate the side for the next one.',
    category: 'Features',
    height: 560,
  },
  {
    slug: 'features-list-checks',
    title: 'Feature checklist',
    description:
      'A two-column checklist of everything included, for the plan comparison or the "what you get" band.',
    category: 'Features',
    height: 480,
  },
  {
    slug: 'features-tabs',
    title: 'Features in tabs',
    description:
      'One feature area per tab, each with copy and an image. Arrow keys move between tabs; the panel is announced.',
    category: 'Features',
    height: 600,
  },
  {
    slug: 'pricing-three',
    title: 'Three-tier pricing',
    description:
      'Three plans with the middle one highlighted and badged. The columns stack on narrow screens.',
    category: 'Pricing',
    height: 640,
  },
  {
    slug: 'pricing-two',
    title: 'Two-tier pricing',
    description:
      'Free and paid, side by side, with a note under the grid. Two columns are easier to choose between than three.',
    category: 'Pricing',
    height: 560,
  },
  {
    slug: 'pricing-with-toggle',
    title: 'Pricing with a billing toggle',
    description:
      'A monthly / yearly switch above the plans. The prices are computed from one number each, so the copy cannot drift.',
    category: 'Pricing',
    height: 700,
  },
  {
    slug: 'pricing-comparison-table',
    title: 'Plan comparison table',
    description:
      'A feature-by-plan matrix in a real table with a caption, header cells and a sticky header, for the page under the cards.',
    category: 'Pricing',
    height: 560,
  },
  {
    slug: 'pricing-single',
    title: 'Single-plan pricing',
    description:
      'One price, one card, one button. For products that refuse to have tiers and want to say so.',
    category: 'Pricing',
    height: 480,
  },
  {
    slug: 'pricing-with-faq',
    title: 'Pricing with its FAQ',
    description:
      'The plans and the questions they raise on one screen, the FAQ in two columns beneath.',
    category: 'Pricing',
    height: 900,
  },
  {
    slug: 'testimonials-grid',
    title: 'Testimonial grid',
    description:
      'Three quotes with names and roles in a grid. Avatars are optional; initials render when there is no photo.',
    category: 'Testimonials',
    height: 480,
  },
  {
    slug: 'testimonials-single-quote',
    title: 'Single large quote',
    description:
      'One quote given the whole width, in a large type size with the author beneath. For the one customer who said it best.',
    category: 'Testimonials',
    height: 400,
  },
  {
    slug: 'testimonials-marquee',
    title: 'Scrolling testimonials',
    description:
      'Quote cards in a marquee that pauses on hover and stops under prefers-reduced-motion. Good for a long list nobody would scroll.',
    category: 'Testimonials',
    height: 420,
  },
  {
    slug: 'testimonials-with-logos',
    title: 'Testimonials with a logo cloud',
    description:
      'Quotes above, the companies behind them below. The logo strip closes the section with breadth after the depth.',
    category: 'Testimonials',
    height: 620,
  },
  {
    slug: 'testimonials-two-column',
    title: 'Two-column testimonials',
    description:
      'A start-aligned header in one column and the quotes stacked in the other, for a quieter, editorial feel.',
    category: 'Testimonials',
    height: 520,
  },
  {
    slug: 'cta-band-primary',
    title: 'Primary call-to-action band',
    description:
      'A full-bleed band in the brand colour with two buttons. The palette is re-pointed so the outline button stays legible.',
    category: 'CTAs',
    height: 300,
  },
  {
    slug: 'cta-inset-card',
    title: 'Inset call-to-action card',
    description:
      'The same call to action as a rounded card inside the container, which sits better between two white sections.',
    category: 'CTAs',
    height: 320,
  },
  {
    slug: 'cta-split',
    title: 'Split call to action',
    description:
      'Copy on the start edge, actions on the end edge, on one line once there is room. For the foot of a long page.',
    category: 'CTAs',
    height: 280,
  },
  {
    slug: 'cta-with-newsletter',
    title: 'Newsletter call to action',
    description:
      'An email capture with the inline layout, a note about frequency, and the success and error states already handled.',
    category: 'CTAs',
    height: 320,
  },
  {
    slug: 'cta-app-download',
    title: 'App download call to action',
    description:
      'An inset card with the phone beside the copy and the two store buttons, for the bottom of a mobile product page.',
    category: 'CTAs',
    height: 420,
  },
  {
    slug: 'cta-muted-bordered',
    title: 'Quiet call to action',
    description:
      'A muted inset card with a single link-style action, for pages where a loud band would be out of place.',
    category: 'CTAs',
    height: 260,
  },
  {
    slug: 'faq-stack',
    title: 'Stacked FAQ',
    description:
      'Questions in one column with the first open. Each item is a native details element, so it works before JavaScript.',
    category: 'FAQs',
    height: 560,
  },
  {
    slug: 'faq-two-columns',
    title: 'Two-column FAQ',
    description:
      'The same questions in two columns once the section is wide enough, so six answers fit above the fold.',
    category: 'FAQs',
    height: 480,
  },
  {
    slug: 'faq-side',
    title: 'FAQ with the header beside',
    description:
      'layout="side" puts the header in a narrow column with the questions beside it — an editorial layout for a support page.',
    category: 'FAQs',
    height: 560,
  },
  {
    slug: 'faq-with-contact',
    title: 'FAQ with a contact card',
    description:
      'Questions above, and a card beneath for the one that was not answered, with a button to reach a person.',
    category: 'FAQs',
    height: 700,
  },
  {
    slug: 'faq-categorised',
    title: 'FAQ by category',
    description:
      'Two FAQ blocks under one header, grouped by topic, each its own details group so one open answer per group.',
    category: 'FAQs',
    height: 720,
  },
  {
    slug: 'footer-columns',
    title: 'Footer with link columns',
    description:
      'Brand, three link columns and a copyright line. The columns wrap to two and then one as the width shrinks.',
    category: 'Footers',
    height: 380,
  },
  {
    slug: 'footer-minimal',
    title: 'Minimal footer',
    description:
      'One line: brand on the start edge, a few links and the copyright. For app shells and short pages.',
    category: 'Footers',
    height: 200,
  },
  {
    slug: 'footer-with-newsletter',
    title: 'Footer with a newsletter form',
    description:
      'Link columns with an email capture in the brand slot, so the last thing on the page is an invitation to stay in touch.',
    category: 'Footers',
    height: 460,
  },
  {
    slug: 'footer-social',
    title: 'Footer with social links',
    description:
      'The social slot filled with icon buttons for the networks you actually post on, each with a real name for assistive tech.',
    category: 'Footers',
    height: 400,
  },
  {
    slug: 'footer-centered',
    title: 'Centred footer',
    description:
      'Everything centred: wordmark, one row of links, a copyright line. For landing pages with little to link to.',
    category: 'Footers',
    height: 260,
  },
  {
    slug: 'footer-with-badges',
    title: 'Footer with trust badges',
    description:
      'Link columns plus a row of compliance badges in the copyright slot, for products sold to procurement.',
    category: 'Footers',
    height: 420,
  },
  {
    slug: 'stats-band',
    title: 'Stats band',
    description:
      'Four numbers in a row on a muted band. The values are strings, so units and formatting are yours.',
    category: 'Stats',
    height: 260,
  },
  {
    slug: 'stats-with-title',
    title: 'Stats with a heading',
    description:
      'A header above the figures, so the numbers answer a stated question rather than floating on their own.',
    category: 'Stats',
    height: 360,
  },
  {
    slug: 'stats-in-cards',
    title: 'Stats in cards',
    description:
      'Each figure in its own outlined card with a trend line of text beneath it — the dashboard KPI row, on a marketing page.',
    category: 'Stats',
    height: 320,
  },
  {
    slug: 'stats-primary',
    title: 'Stats on the brand colour',
    description:
      'The figures on a primary band, palette re-pointed so the numbers and labels stay legible.',
    category: 'Stats',
    height: 260,
  },
  {
    slug: 'form-contact',
    title: 'Contact form',
    description:
      'Name, email, topic and message in labelled fields with help text, and a submit button. Field wires every id and description.',
    category: 'Forms',
    height: 620,
  },
  {
    slug: 'form-signup-card',
    title: 'Sign-up card',
    description:
      'A centred card with email, password and a consent checkbox. The password field shows and hides itself.',
    category: 'Forms',
    height: 600,
  },
  {
    slug: 'form-newsletter-inline',
    title: 'Inline newsletter form',
    description:
      'The one-line email capture for a footer or a sidebar: field and button on one row, note beneath.',
    category: 'Forms',
    height: 260,
  },
  {
    slug: 'form-settings-row',
    title: 'Settings rows',
    description:
      'Preference rows with a label, a description and a switch on the end edge — the shape of every settings page.',
    category: 'Forms',
    height: 460,
  },
]
