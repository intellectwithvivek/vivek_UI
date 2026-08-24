/**
 * The showcase: twelve complete, deployed websites built with this library.
 *
 * The page gallery answers "can I build a page with it". This answers the question that
 * actually decides adoption — "has anyone shipped a whole site with it" — and the answer is
 * twelve, each with running source under MIT.
 *
 * **`components` lists only what the site's own description names.** It drives real internal
 * links to the docs page for each one, so it has to be accurate rather than aspirational;
 * `showcase.test.ts` fails the build if a name here does not exist in the registry. Where a
 * feature does not name a component — "BMI calculator", "mock checkout" — nothing is
 * inferred, because a guessed list read as fact is worse than a short one.
 */
export type ShowcaseCategory =
  | 'Portfolio'
  | 'Booking'
  | 'Commerce'
  | 'SaaS'
  | 'Learning & events'
  | 'Publishing'

export interface ShowcaseSite {
  slug: string
  name: string
  /** One line for the card and the meta description. */
  tagline: string
  /** The longer pitch on the site's own page. */
  detail: string
  category: ShowcaseCategory
  /** Deployed URL. Framed in the preview and linked as the primary action. */
  live: string
  /** Repository URL, without the trailing `.git`. */
  repo: string
  /** What the site demonstrates, in the author's words. */
  highlights: string[]
  /** Library exports the description explicitly names. Checked against the registry. */
  components: string[]
}

export const SHOWCASE_CATEGORIES: ShowcaseCategory[] = [
  'Portfolio',
  'Booking',
  'Commerce',
  'SaaS',
  'Learning & events',
  'Publishing',
]

export const SHOWCASE: ShowcaseSite[] = [
  {
    slug: 'devfolio',
    name: 'DevFolio',
    tagline:
      'A clean developer portfolio with bento-grid projects, an experience timeline and live open-source download stats.',
    detail:
      'The portfolio most developers end up hand-rolling. The project wall is a bento grid rather than a uniform card grid, so a flagship project can take the space it deserves, and the download figures are real numbers pulled at build time rather than a screenshot of a badge.',
    category: 'Portfolio',
    live: 'https://devfolio.vivekkumarsingh.in',
    repo: 'https://github.com/intellectwithvivek/devfolio',
    highlights: ['Bento-grid project wall', 'Experience timeline', 'Live OSS download stats'],
    components: ['BentoGrid', 'Timeline', 'Stats'],
  },
  {
    slug: 'medicare-plus',
    name: 'MediCare Plus',
    tagline:
      'A clinic website with a complete booking flow: pick a doctor, choose a slot, verify with an OTP.',
    detail:
      'A booking flow is where a component library is really tested — three steps, each with its own validation, and a one-time code field that has to be usable on a phone with a code arriving by SMS. The whole flow is keyboard-navigable end to end.',
    category: 'Booking',
    live: 'https://medicare.vivekkumarsingh.in',
    repo: 'https://github.com/intellectwithvivek/MediCare-Plus',
    highlights: ['Doctor directory', 'Slot picker', 'OTP verification step'],
    components: ['OTPInput', 'Calendar', 'Avatar'],
  },
  {
    slug: 'shopkit',
    name: 'ShopKit',
    tagline:
      'A minimal storefront with a cart drawer, ⌘K product search, price-history sparklines and a mock checkout.',
    detail:
      'Everything a small storefront needs and nothing it does not. The command palette turns product search into a keystroke, and each product carries a sparkline of its own price history — the kind of detail that usually means adding a charting library.',
    category: 'Commerce',
    live: 'https://shopkit.vivekkumarsingh.in',
    repo: 'https://github.com/intellectwithvivek/shopkit',
    highlights: ['Cart drawer', '⌘K product search', 'Price-history sparklines', 'Mock checkout'],
    components: ['Drawer', 'CommandPalette', 'Sparkline'],
  },
  {
    slug: 'wanderly',
    name: 'Wanderly',
    tagline:
      'A tour booking site with day-by-day itineraries and best-time-to-visit climate charts for every destination.',
    detail:
      'Travel sites live or die on how readable the itinerary is. Each day is a disclosure you can open without losing your place, and every destination carries a climate chart so "best time to visit" is a figure rather than a claim.',
    category: 'Booking',
    live: 'https://wanderly.vivekkumarsingh.in',
    repo: 'https://github.com/intellectwithvivek/wanderly',
    highlights: ['Day-by-day itineraries', 'Climate charts per destination', 'Enquiry flow'],
    components: ['BarChart'],
  },
  {
    slug: 'pulse-analytics',
    name: 'Pulse Analytics',
    tagline:
      'A SaaS landing page plus a full analytics dashboard: all six VivekUI charts, a data table and a kanban board.',
    detail:
      'The most complete of the twelve, and the one to look at if you are evaluating the library for an internal tool. Every chart the library ships appears here in context, alongside a table that sorts, searches and paginates, and a board that can be driven entirely from the keyboard.',
    category: 'SaaS',
    live: 'https://pulseanalytics.vivekkumarsingh.in',
    repo: 'https://github.com/intellectwithvivek/Pulse-Analytics',
    highlights: [
      'Marketing site and app in one repo',
      'All six charts in context',
      'Sortable, searchable data table',
      'Keyboard-drivable kanban board',
    ],
    components: [
      'LineChart',
      'AreaChart',
      'BarChart',
      'PieChart',
      'Sparkline',
      'ProgressRing',
      'DataTable',
      'KanbanBoard',
    ],
  },
  {
    slug: 'saffron-house',
    name: 'Saffron House',
    tagline:
      'A restaurant site with online table reservations and a popular-times chart for picking a quiet slot.',
    detail:
      'The popular-times chart is the idea worth stealing: instead of making someone guess, the booking form shows how busy each slot usually is, so choosing a quiet table is a glance rather than a phone call.',
    category: 'Booking',
    live: 'https://saffronhouse.vivekkumarsingh.in',
    repo: 'https://github.com/intellectwithvivek/Saffron-House',
    highlights: ['Table reservations', 'Popular-times chart', 'Menu with dietary filters'],
    components: ['BarChart'],
  },
  {
    slug: 'nestfind',
    name: 'NestFind',
    tagline: 'Property listings with locality price-trend charts and a live EMI calculator.',
    detail:
      'Property search is a filtering problem and a maths problem. The listings filter without a page reload, the price-trend chart puts an asking price in context, and the EMI figure updates as you drag rather than after you submit.',
    category: 'Commerce',
    live: 'https://nestfind.vivekkumarsingh.in',
    repo: 'https://github.com/intellectwithvivek/NestFind',
    highlights: ['Locality price-trend charts', 'Live EMI calculator', 'Filterable listings'],
    components: ['LineChart'],
  },
  {
    slug: 'skillforge',
    name: 'SkillForge',
    tagline:
      'A course platform with an accordion curriculum, progress rings and a learner dashboard.',
    detail:
      'Course pages are long by nature, so the curriculum is a disclosure list rather than a wall — and the progress rings mean a learner can see where they are from the dashboard without opening anything.',
    category: 'Learning & events',
    live: 'https://skillforge.vivekkumarsingh.in',
    repo: 'https://github.com/intellectwithvivek/SkillForge',
    highlights: ['Accordion curriculum', 'Progress rings', 'Learner dashboard'],
    components: ['Accordion', 'ProgressRing'],
  },
  {
    slug: 'ironpulse',
    name: 'IronPulse',
    tagline: 'A gym website with a weekly class timetable, a BMI calculator and membership plans.',
    detail:
      'A weekly timetable is a scheduling grid, which is exactly the thing most libraries make you build yourself. Here it is a component, and it reads correctly on a phone as well as on the wall-mounted screen in reception.',
    category: 'Booking',
    live: 'https://ironpulse.vivekkumarsingh.in',
    repo: 'https://github.com/intellectwithvivek/ironpulse',
    highlights: ['Weekly class timetable', 'BMI calculator', 'Membership tiers'],
    components: ['Pricing'],
  },
  {
    slug: 'devsummit',
    name: 'DevSummit 2026',
    tagline: 'A conference site with a countdown hero, a two-day agenda timeline and ticket tiers.',
    detail:
      'Conference sites have a deadline built into them, and the countdown is the whole hero. The two-day agenda is a timeline you can scan for one talk rather than a table you have to read in full.',
    category: 'Learning & events',
    live: 'https://devsummit.vivekkumarsingh.in',
    repo: 'https://github.com/intellectwithvivek/devsummit',
    highlights: ['Countdown hero', 'Two-day agenda timeline', 'Ticket tiers'],
    components: ['Countdown', 'Timeline', 'Pricing'],
  },
  {
    slug: 'theledger',
    name: 'The Ledger',
    tagline:
      'A typography-first magazine with a reading-progress bar and a data story with charts inside the article.',
    detail:
      'Built to test the type scale rather than the widgets. Long-form measure, a progress bar that tells you how much is left, and charts set inline in the prose — which is where a data story actually needs them.',
    category: 'Publishing',
    live: 'https://theledger.vivekkumarsingh.in',
    repo: 'https://github.com/intellectwithvivek/theledger',
    highlights: ['Typography-first layout', 'Reading-progress bar', 'Charts inside the article'],
    components: ['Prose', 'Progress'],
  },
  {
    slug: 'chatterbox',
    name: 'ChatterBox AI',
    tagline:
      'An AI chat interface with a typing indicator, code blocks and charts that render inside chat messages.',
    detail:
      'The chat components exist because every product is growing an assistant, and the hard parts are the ones nobody demos: a typing indicator that is announced rather than just animated, and code blocks that never reach for dangerouslySetInnerHTML on model output.',
    category: 'SaaS',
    live: 'https://chatterbox.vivekkumarsingh.in',
    repo: 'https://github.com/intellectwithvivek/chatterbox',
    highlights: ['Typing indicator', 'Streaming-style code blocks', 'Charts inside chat messages'],
    components: ['ChatThread', 'ChatMessage', 'ChatInput', 'TypingIndicator', 'ChatCodeBlock'],
  },
]

export const showcaseBySlug = (slug: string): ShowcaseSite | undefined =>
  SHOWCASE.find((site) => site.slug === slug)

/** `git clone` line for the card and the detail page. */
export const cloneCommand = (site: ShowcaseSite): string => `git clone ${site.repo}.git`

/** Host only, for the browser chrome's URL pill. */
export const displayUrl = (site: ShowcaseSite): string => site.live.replace(/^https?:\/\//, '')

export function neighbouringSites(slug: string): {
  previous?: ShowcaseSite
  next?: ShowcaseSite
} {
  const index = SHOWCASE.findIndex((site) => site.slug === slug)
  if (index === -1) return {}
  return { previous: SHOWCASE[index - 1], next: SHOWCASE[index + 1] }
}
