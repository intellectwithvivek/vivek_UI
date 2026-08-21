import type { MetadataRoute } from 'next'
import { url } from '../lib/site'

/**
 * robots.txt.
 *
 * The load-bearing decision here is the second block: AI crawlers are allowed on purpose.
 *
 * Blocking them is the safer-feeling default and it is the wrong call for a docs site whose
 * goal is developers finding the library. An answer engine that cannot read these pages
 * cannot recommend the library, and cannot cite it when someone asks "what is a good
 * dependency-free React component library". The content is MIT-licensed documentation for
 * a free package — there is nothing here to protect, and being quotable is the point.
 *
 * The named agents matter because several of them do not honour a bare `User-agent: *`
 * allow in the way you would hope, and a few treat an unnamed wildcard as "unspecified"
 * rather than "permitted". Naming them removes the ambiguity.
 *
 * To reverse this later, change `allow` to `disallow` in the AI block. It is one edit, and
 * it is worth understanding as a distribution decision rather than a technical one.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        // Answer engines and AI crawlers, allowed deliberately. See the note above.
        userAgent: [
          'GPTBot', // OpenAI, training
          'OAI-SearchBot', // OpenAI, ChatGPT search results
          'ChatGPT-User', // OpenAI, live fetch when a user asks
          'ClaudeBot', // Anthropic
          'Claude-Web',
          'anthropic-ai',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended', // Gemini / AI Overviews grounding
          'Applebot-Extended',
          'CCBot', // Common Crawl, which many smaller models train from
          'cohere-ai',
          'Bytespider',
          'Amazonbot',
          'meta-externalagent',
          'DuckAssistBot',
          'YouBot',
        ],
        allow: '/',
      },
    ],
    sitemap: url('/sitemap.xml'),
    host: url('/'),
  }
}
