import { Avatar, Testimonials } from '@the_viveksingh/vivek-ui'

const QUOTES = [
  {
    id: 'a',
    quote: 'We removed four dependencies the week we switched. The audit noise just stopped.',
    author: 'Priya Raman',
    role: 'Staff engineer, Meridian',
  },
  {
    id: 'b',
    quote:
      'The keyboard support is the part I did not expect. Our accessibility audit came back clean first time.',
    author: 'Tom Okafor',
    role: 'Frontend lead, Halcyon',
  },
  {
    id: 'c',
    quote: 'Theming is one CSS variable. I rebranded the whole admin panel on a Friday afternoon.',
    author: 'Elena Vasquez',
    role: 'Design engineer, Fieldwork',
  },
]

export default function TestimonialsGrid() {
  return (
    <Testimonials
      eyebrow="What people say"
      title="Teams that stopped fighting their component library"
      items={QUOTES.map((q) => ({ ...q, avatar: <Avatar name={q.author} size="sm" /> }))}
    />
  )
}
