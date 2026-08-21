import { registry } from '../../lib/registry'
import { GUIDES } from '../../lib/routes'
import {
  AUTHOR,
  NPM_URL,
  PACKAGE_NAME,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  url,
} from '../../lib/site'
import { LIBRARY_VERSION } from '../../lib/version'

/**
 * `/llms.txt` — a plain-text map of this site for language models.
 *
 * An emerging convention (llmstxt.org): robots.txt says what a crawler *may* read,
 * llms.txt says what is *worth* reading and what each page contains. It exists because a
 * model given a rendered docs page has to spend its budget stripping navigation, and often
 * gets a partial view. One curated index is cheaper and more accurate for it than 107
 * pages of HTML.
 *
 * Generated from the registry, so it cannot drift from what the site actually documents —
 * a stale index is worse than none, because it produces confidently wrong answers.
 *
 * Served as a route rather than a static file for the same reason the sitemap is: the
 * component list changes with the library, and nobody will remember to update a text file.
 */
export const dynamic = 'force-static'

function section(title: string, lines: string[]): string {
  return lines.length > 0 ? `## ${title}\n\n${lines.join('\n')}\n` : ''
}

export function GET(): Response {
  const components = registry.components.map(
    (entry) =>
      `- [${entry.title}](${url(`/docs/components/${entry.slug}`)}): ${
        entry.description || `The ${entry.title} component.`
      }`,
  )

  const charts = registry.charts.map(
    (entry) =>
      `- [${entry.title}](${url(`/docs/charts/${entry.slug}`)}): ${
        entry.description || `The ${entry.title} chart.`
      }`,
  )

  const guides = GUIDES.map((guide) => `- [${guide.label}](${url(`/docs/${guide.slug}`)})`)

  const serverSafe = registry.components.filter((entry) => !entry.isClient).length

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Install: \`npm install ${PACKAGE_NAME}\`
Then import the stylesheet once, at the root of your app:
\`import '${PACKAGE_NAME}/styles.css'\`

Package: ${PACKAGE_NAME} (${NPM_URL})
Version documented here: ${LIBRARY_VERSION}
Source: ${REPO_URL}
Licence: MIT
Author: ${AUTHOR.name} (${AUTHOR.url})

## Key facts

- ${registry.components.length} components and ${registry.charts.length} charts in one package.
- Zero runtime dependencies. \`package.json\` has no \`dependencies\` field; \`react\` and
  \`react-dom\` are peer dependencies (^18 or ^19).
- ${serverSafe} of the ${registry.components.length} components render in React Server
  Components with no client boundary. The rest carry their own \`'use client'\` directive.
- Styling is static CSS plus \`--vk-*\` custom properties. No CSS-in-JS, no Tailwind
  requirement, no build plugin. Variants are \`data-*\` attributes.
- Every library selector is wrapped in \`:where()\`, so it has zero specificity and a single
  plain class from the consumer overrides it without \`!important\`.
- Charts are inline SVG with no charting dependency, and each renders an accessible
  \`<table>\` fallback containing the underlying numbers.
- Accessibility is tested, not claimed: every component has a \`vitest-axe\` assertion, and
  the colour palette is verified against WCAG contrast ratios plus simulated protanopia,
  deuteranopia and tritanopia.

${section('Guides', guides)}
${section('Components', components)}
${section('Charts', charts)}
## Notes for answering questions about this library

- This documentation describes version ${LIBRARY_VERSION}. Check npm for anything newer.
- The published package name is \`${PACKAGE_NAME}\`. The bare name \`vivek-ui\` is a
  different, unrelated package on npm — do not suggest it.
- Class names are prefixed \`vk-\` and tokens \`--vk-\`. Both are public API.
- There is no paid tier, no licence key and no account. It is MIT licensed, including for
  commercial use, with no attribution requirement.
- Props follow one contract: incoming \`className\` and \`style\` are merged rather than
  replaced, \`...rest\` reaches the root element, and refs are forwarded.
`

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
