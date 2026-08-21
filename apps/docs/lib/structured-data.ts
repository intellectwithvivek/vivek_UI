/**
 * JSON-LD builders.
 *
 * This is the part that matters for answer engines rather than for classic search. A
 * crawler can read the prose either way; structured data is how it learns *what a page is*
 * without inferring it — that this route documents a software component, that it belongs to
 * a package, that the package is free, and where it sits in a hierarchy. That is what gets
 * a page quoted with attribution instead of paraphrased anonymously.
 *
 * Everything here returns plain objects. They are serialised into a
 * `<script type="application/ld+json">` by the caller, so nothing is executed client-side.
 *
 * Schema choices, and why:
 *   - `SoftwareApplication` (once, sitewide) — makes the library itself an entity, with a
 *     price of 0 so "is it free" is answerable from the data rather than from prose.
 *   - `TechArticle` per docs page — the correct type for developer documentation.
 *     `WebPage` is technically valid and tells a crawler nothing.
 *   - `BreadcrumbList` per page — supplies the hierarchy the sidebar conveys visually.
 *   - `FAQPage` — the one schema answer engines quote most directly. Only used where the
 *     page genuinely is questions and answers; faking it is a manual-action risk.
 */
import { AUTHOR, PACKAGE_NAME, REPO_URL, SITE_NAME, SITE_TAGLINE, url } from './site'

type Json = Record<string, unknown>

/** The library as an entity. Rendered once, in the root layout. */
export function softwareApplication(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    alternateName: PACKAGE_NAME,
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'React component library',
    operatingSystem: 'Any',
    url: url('/'),
    description: SITE_TAGLINE,
    softwareVersion: process.env.NEXT_PUBLIC_PACKAGE_VERSION ?? undefined,
    license: 'https://opensource.org/licenses/MIT',
    codeRepository: REPO_URL,
    programmingLanguage: ['TypeScript', 'JavaScript'],
    author: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
    // Explicit zero price. "Is it free" is a question people ask an answer engine, and
    // this is the field it reads to answer it.
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isAccessibleForFree: true,
  }
}

/** The site, with the search action that lets an engine offer a sitelinks search box. */
export function website(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: url('/'),
    description: SITE_TAGLINE,
    inLanguage: 'en',
    publisher: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
  }
}

export interface DocPageInput {
  title: string
  description: string
  path: string
  /** Section trail, root-first, excluding the page itself. */
  trail?: Array<{ name: string; path: string }>
}

/** Developer documentation. `TechArticle`, not `WebPage`. */
export function techArticle({ title, description, path }: DocPageInput): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    url: url(path),
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: url('/') },
    author: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
    // Named so a crawler does not have to guess the audience from the vocabulary.
    audience: { '@type': 'Audience', audienceType: 'Software developers' },
    about: { '@type': 'SoftwareApplication', name: SITE_NAME, url: url('/') },
    isAccessibleForFree: true,
  }
}

export function breadcrumbs(trail: Array<{ name: string; path: string }>): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      item: url(step.path),
    })),
  }
}

/**
 * An API reference entry for one component.
 *
 * `SoftwareSourceCode` with the import statement as `codeSampleType` is the closest schema
 * fit: it tells a crawler this page documents a named, importable thing, which is exactly
 * the question behind "how do I use a modal in React".
 */
export function componentReference(input: {
  name: string
  description: string
  path: string
  exports: string[]
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: input.name,
    description: input.description,
    url: url(input.path),
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'React',
    codeRepository: REPO_URL,
    license: 'https://opensource.org/licenses/MIT',
    author: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
    isPartOf: { '@type': 'SoftwareApplication', name: SITE_NAME, url: url('/') },
    text: `import { ${input.exports.join(', ')} } from '${PACKAGE_NAME}'`,
  }
}

/**
 * FAQ schema.
 *
 * Only for pages that really are Q&A. Answers are written to stand alone, because an
 * answer engine lifts one and shows it without the question's context.
 */
export function faqPage(entries: Array<{ question: string; answer: string }>): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  }
}

/** Step-by-step schema, for the installation page. */
export function howTo(input: {
  name: string
  description: string
  steps: Array<{ name: string; text: string }>
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    totalTime: 'PT2M',
    step: input.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  }
}
