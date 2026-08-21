import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@the_viveksingh/vivek-ui'

const ITEMS = [
  {
    value: 'deps',
    question: 'Does it really have zero dependencies?',
    answer:
      'Yes. package.json has no dependencies field at all. react and react-dom are peers, and every utility the library needs is written in-house.',
  },
  {
    value: 'styling',
    question: 'How do I override a style?',
    answer:
      'Pass a className. Every library selector is wrapped in :where(), so it carries zero specificity and one flat class of yours always wins.',
  },
  {
    value: 'rsc',
    question: 'Does it work in Server Components?',
    answer:
      'Forty-four of the components render on the server with no client boundary. The rest carry their own "use client" directive, preserved per file by an unbundled build.',
  },
]

export default function AccordionPreview({ name }: { name: string }) {
  if (name === 'multiple') {
    return (
      <Accordion type="multiple" defaultValue={['deps', 'styling']} variant="contained">
        {ITEMS.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )
  }
  return (
    <Accordion defaultValue="deps" collapsible>
      {ITEMS.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
