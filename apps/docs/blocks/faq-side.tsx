import { FAQ } from '@the_viveksingh/vivek-ui'

const FAQS = [
  {
    id: 'deps',
    question: 'Really no runtime dependencies?',
    answer:
      'None. The package.json has no dependencies field at all. React and React DOM are peers you already have.',
  },
  {
    id: 'tailwind',
    question: 'Does it work alongside Tailwind?',
    answer:
      'Yes. Every selector is wrapped in :where(), so any utility class you add wins without !important.',
  },
  {
    id: 'rsc',
    question: 'Does it work with React Server Components?',
    answer: "Yes. The build is unbundled, so each file keeps its own 'use client' directive.",
  },
  {
    id: 'licence',
    question: 'What is the catch with the licence?',
    answer:
      'There is none. MIT, including commercial use, with no attribution beyond the licence text.',
  },
  {
    id: 'browsers',
    question: 'Which browsers?',
    answer:
      'The last two versions of everything evergreen. Container queries and :has() are the floor.',
  },
  {
    id: 'a11y',
    question: 'How is accessibility tested?',
    answer:
      'Every component test has an axe assertion, and the browser suite runs axe on the composed pages in three viewports.',
  },
]

export default function FaqSide() {
  return (
    <FAQ
      layout="side"
      eyebrow="Support"
      title="Before you write in"
      description="The answers to the questions we get every week. If yours is not here, the form is at the bottom."
      items={FAQS}
    />
  )
}
