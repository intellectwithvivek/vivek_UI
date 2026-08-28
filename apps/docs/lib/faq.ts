/**
 * The questions people actually ask, with answers written to be lifted.
 *
 * This feeds both the visible FAQ and the `FAQPage` JSON-LD, from one source — Google's
 * structured-data policy requires the marked-up answer to be present on the page, and
 * keeping two copies is how that quietly stops being true.
 *
 * Each answer is written to survive being quoted alone: it restates enough of the question
 * to make sense with no context, leads with the direct answer, and gives the reason second.
 * An answer engine shows one paragraph, not a page.
 */
import { bundleSize, cssSize } from './sizes'

export interface FaqEntry {
  question: string
  answer: string
}

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    question: 'What is VivekUI?',
    answer:
      'VivekUI is a free, MIT-licensed React component library with 104 accessible components and 10 SVG charts. It has zero runtime dependencies: React and React DOM are peer dependencies, and everything else is written in-house. It is installed as @the_viveksingh/vivek-ui from npm.',
  },
  {
    question: 'Is VivekUI free for commercial use?',
    answer:
      'Yes. VivekUI is MIT licensed, which permits commercial use, modification and redistribution with no fee, no licence key and no attribution requirement. There is no paid tier and no account to create.',
  },
  {
    question: 'Does VivekUI really have zero dependencies?',
    answer:
      'Yes. The published package.json has no dependencies field at all. React and React DOM are declared as peer dependencies supporting version 18 or 19. Utilities that libraries usually pull in — class-name merging, ref merging, focus trapping, positioning and the chart maths — are implemented inside the package, so installing it adds one entry to your lockfile.',
  },
  {
    question: 'Do I need Tailwind CSS to use VivekUI?',
    answer:
      'No. VivekUI ships static CSS and design tokens as CSS custom properties, so it needs no Tailwind, no CSS-in-JS runtime and no build plugin. You import one stylesheet once. It does work alongside Tailwind: every VivekUI selector is wrapped in :where(), which gives it zero specificity, so a Tailwind utility on the same element wins without !important.',
  },
  {
    question: 'How do I override VivekUI styles?',
    answer:
      'Pass a className. Every VivekUI selector is wrapped in :where(), so it has a specificity of zero and any single plain class of your own overrides it without !important. For sitewide changes, redefine the --vk-* custom properties in your own :root — for example --vk-color-primary or --vk-radius-md — and every component follows.',
  },
  {
    question: 'Does VivekUI work with React Server Components and the Next.js App Router?',
    answer:
      'Yes. 49 of the 104 components render in a Server Component with no client boundary, so they add nothing to your JavaScript bundle. The rest declare their own use client directive, which the unbundled per-file build preserves in both the ESM and CommonJS output. No wrapper or provider is required for a component to work on the server.',
  },
  {
    question: 'How accessible is VivekUI?',
    answer:
      'Every component has an automated vitest-axe assertion in its test suite, interactive components implement the keyboard map from the WAI-ARIA Authoring Practices, and the colour palette is verified arithmetically: each token pair is checked against WCAG 2.1 contrast ratios, and the chart palette is additionally checked for separation under simulated protanopia, deuteranopia and tritanopia.',
  },
  {
    question: 'How is VivekUI different from shadcn/ui?',
    answer:
      'shadcn/ui copies component source into your project, where you own and maintain it, and it depends on Tailwind CSS and Radix UI. VivekUI is a versioned npm package you install and upgrade, with zero runtime dependencies and no Tailwind requirement. VivekUI also ships charts in the same package. The trade-off is real: copied source is maximally editable, while a package upgrades in one step.',
  },
  {
    question: 'Does VivekUI include charts?',
    answer:
      'Yes. Six chart types — line, area, bar, pie and donut, sparkline and progress ring — ship in the same package under @the_viveksingh/vivek-ui/charts, with no charting dependency. They are inline SVG, render on the server, and each one emits an accessible HTML table containing the underlying numbers for screen-reader users.',
  },
  {
    question: 'How big is VivekUI?',
    // Derived from the size-limit measurement rather than written down. This answer said
    // 41 kB and 23 kB while the real figures were 47.4 kB and 27.0 kB.
    answer: `The entire library is ${bundleSize(
      'Whole core library',
    )} minified and compressed, and it is tree-shakeable, so you pay only for what you import — a single Button is ${bundleSize(
      'Button only',
    )}. The stylesheet is ${cssSize(
      'styles.css',
      'gzip',
    )} gzipped. Size budgets are enforced in CI, so a change that exceeds them fails the build.`,
  },
  {
    question: 'Does VivekUI have ready-made page templates?',
    answer:
      'Yes. Twelve complete pages — landing, pricing, contact, sign in, create account, dashboard, settings, checkout, product detail, blog index, about and 404 — are published at /pages with a live demo and the full source for each. They are built only from exports of the published package, which a build step enforces, so the code shown runs as-is once you install VivekUI and import its stylesheet. Everything is MIT licensed with no attribution requirement.',
  },
  {
    question: 'What does VivekUI have that shadcn/ui, Mantine and MUI do not?',
    answer:
      'Five controls no other free React library ships: EditableGrid, VirtualList, FileTree, KanbanBoard and Scheduler. In each case what is missing elsewhere is the keyboard support. The clearest example is the Kanban board — the HTML5 drag-and-drop API has no keyboard equivalent at all, so a board built on it cannot be used without a mouse, and almost every board on the web is. VivekUI ships two complete input paths: dragging, and a pick-up / move / drop model announced through a live region. MUI does have a scheduler, but it is behind a paid licence.',
  },
]
