import type { Metadata } from 'next'
// The one setup step the library asks of any consumer. Imported once, here.
import '@the_viveksingh/vivek-ui/styles.css'
import '@the_viveksingh/vivek-ui/charts.css'
import { ThemeProvider, themeScript } from '@the_viveksingh/vivek-ui'
import type { ReactNode } from 'react'
import { SiteHeader } from './site-header'
import './docs.css'

export const metadata: Metadata = {
  title: {
    default: 'VivekUI — a zero-dependency React component library',
    template: '%s · VivekUI',
  },
  description:
    '83 accessible, server-safe React components and 6 SVG charts with zero runtime dependencies. One install, one CSS import, no configuration.',
  authors: [{ name: 'Vivek Kumar Singh', url: 'https://vivekkumarsingh.in' }],
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
