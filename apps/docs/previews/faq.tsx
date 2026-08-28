import { FAQ } from '@the_viveksingh/vivek-ui'

const ITEMS = [
  {
    id: 'deps',
    question: 'Does it really have zero runtime dependencies?',
    answer:
      'Yes. There is no dependencies field in package.json. react and react-dom are peers, and every utility - class merging, refs, focus trapping, positioning - is written in-house.',
  },
  {
    id: 'override',
    question: 'Can I override the styles?',
    answer:
      'Every library selector is wrapped in :where(), so it has zero specificity. A single flat class of yours beats it without !important.',
  },
  {
    id: 'rsc',
    question: 'Does it work with React Server Components?',
    answer:
      'Forty-four components render on the server with no client boundary at all. The rest carry their own directive, preserved file by file by an unbundled build.',
  },
  {
    id: 'cost',
    question: 'What does it cost?',
    answer: 'Nothing. It is MIT licensed, including for commercial work.',
  },
]

export default function FAQPreview() {
  return (
    <FAQ
      padding="md"
      eyebrow="FAQ"
      title="Questions people actually ask"
      items={ITEMS}
      defaultOpenIndex={0}
    />
  )
}
