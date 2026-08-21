import { createRequire } from 'node:module'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * The tests need the same version injection `next.config.mjs` performs, and from the same
 * source — otherwise `version.test.ts` would be comparing a stub against the package and
 * passing for the wrong reason.
 */
const require = createRequire(import.meta.url)
const { version } = require('@the_viveksingh/vivek-ui/package.json')

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NEXT_PUBLIC_LIBRARY_VERSION': JSON.stringify(version),
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['lib/**/*.test.ts', 'lib/**/*.test.tsx'],
  },
})
