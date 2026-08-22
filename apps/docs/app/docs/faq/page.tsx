import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Heading,
  Text,
} from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import { JsonLd } from '../../../components/json-ld'
import { SupportCta } from '../../../components/support-cta'
import { FAQ_ENTRIES } from '../../../lib/faq'
import { pageMeta } from '../../../lib/page-meta'
import { breadcrumbs, faqPage, techArticle } from '../../../lib/structured-data'

const DESCRIPTION =
  'Common questions about VivekUI: is it free, does it need Tailwind, how does it compare to shadcn/ui, and does it work with React Server Components?'

export const metadata: Metadata = pageMeta({
  title: 'FAQ',
  description: DESCRIPTION,
  path: '/docs/faq',
  keywords: [
    'is vivekui free',
    'vivekui vs shadcn',
    'react component library without tailwind',
    'zero dependency react ui library',
  ],
})

/**
 * The FAQ.
 *
 * Every answer is rendered as visible text AND emitted as `FAQPage` structured data from
 * the same array. Google's policy requires the marked-up answer to be present on the page,
 * and two hand-maintained copies is precisely how that stops being true.
 *
 * The headings are questions verbatim, phrased the way someone types them, because that is
 * what both a search index and an answer engine match against.
 */
export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          faqPage(FAQ_ENTRIES),
          techArticle({
            title: 'VivekUI FAQ',
            description: DESCRIPTION,
            path: '/docs/faq',
          }),
          breadcrumbs([
            { name: 'Docs', path: '/docs' },
            { name: 'FAQ', path: '/docs/faq' },
          ]),
        ]}
      />

      <header className="doc-header">
        <Heading level={1}>Frequently asked questions</Heading>
        <Text tone="muted">{DESCRIPTION}</Text>
      </header>

      <section>
        <Accordion collapsible defaultValue="q-0" headingLevel={2}>
          {FAQ_ENTRIES.map((entry, index) => (
            <AccordionItem key={entry.question} value={`q-${index}`}>
              <AccordionTrigger>{entry.question}</AccordionTrigger>
              <AccordionContent>
                <Text>{entry.answer}</Text>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <SupportCta />
    </>
  )
}
