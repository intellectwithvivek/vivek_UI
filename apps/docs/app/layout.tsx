import type { Metadata } from 'next'
// The one setup step the library asks of any consumer. Imported once, here.
import '@the_viveksingh/vivek-ui/styles.css'
import '@the_viveksingh/vivek-ui/charts.css'
import { ThemeProvider, themeScript } from '@the_viveksingh/vivek-ui'
import type { ReactNode } from 'react'
import { JsonLd } from '../components/json-ld'
import { accentScript } from '../lib/accents'
import { brandIcons } from '../lib/branding'
import { AUTHOR, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_URL, url } from '../lib/site'
import { softwareApplication, website } from '../lib/structured-data'
import { SiteHeader } from './site-header'
import './accent.css'
import './docs.css'

/**
 * Sitewide metadata.
 *
 * `metadataBase` is the important line: without it Next emits Open Graph and canonical
 * URLs as relative paths, which every crawler and every social scraper treats as invalid.
 * A site can look perfectly fine and be unshareable for exactly this reason.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — a free, zero-dependency React component library`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  creator: AUTHOR.name,
  publisher: AUTHOR.name,
  // Self-referencing canonical on the root. Each page sets its own; without one, a page
  // reachable at more than one URL competes with itself.
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — a free, zero-dependency React component library`,
    description: SITE_DESCRIPTION,
    url: url('/'),
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — a free, zero-dependency React component library`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google use the full snippet and a large image preview. The default caps the
      // snippet, which is the opposite of what a docs site wants.
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  category: 'technology',
  /*
   * Detected from `public/branding/` at build time, so dropping a file in there is the whole
   * setup. Returns undefined while the folder is empty, and `app/icon.tsx` then supplies a
   * generated favicon - so the site is never iconless, and no browser requests an icon that
   * does not exist.
   *
   * Note that a real `favicon.ico` in `public/branding/` takes precedence over the generated
   * one: Next emits the file-convention icon first and these links after, and a browser uses
   * the last usable `rel="icon"` it finds.
   */
  icons: brandIcons(),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Runs before first paint so a returning visitor never sees a flash of the wrong
          theme. React cannot fix this on its own: the server has no idea what the
          visitor picked last time, so the attribute has to be set synchronously in the
          document head, before the body paints.
        */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a build-time constant exported by the library, not user input */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/*
          Same reasoning as the theme script: the accent has to be on <html> before the
          body paints, or every reload flashes the default colour first. The script only
          applies a value from its own allow-list, since localStorage is writable by
          anything on the origin and this lands in a DOM attribute.
        */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a build-time constant built from an allow-list, not user input */}
        <script dangerouslySetInnerHTML={{ __html: accentScript }} />
        {/*
          Sitewide structured data: the library as a SoftwareApplication with a price of 0,
          and the site itself. Rendered on the server, because several crawlers - including
          some answer engines - never execute JavaScript.
        */}
        <JsonLd data={[softwareApplication(), website()]} />
      </head>
      <body>
        <ThemeProvider>
          <a className="skip-link" href="#content">
            Skip to content
          </a>
          <SiteHeader />
          <main id="content">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
