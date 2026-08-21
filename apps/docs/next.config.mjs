import { createRequire } from 'node:module'

/**
 * The library version, read once at config time.
 *
 * This is the ONLY place the docs site learns which version it documents. Everything else
 * reads `lib/version.ts`, which reads the environment variable set below.
 *
 * Why not `import pkg from '@the_viveksingh/vivek-ui/package.json'` in a component: the site
 * header is a Client Component, so that import inlines the WHOLE package.json into a public
 * client chunk — `devDependencies`, the `size-limit` budgets, build script names and all —
 * to obtain one string. Verified, not assumed: `grep '"size-limit"' .next/static/chunks/*.js`
 * matched before this change and does not after.
 *
 * `createRequire` rather than a JSON import so this file needs no assertion syntax and works
 * the same whatever Node decides about import attributes.
 */
const require = createRequire(import.meta.url)
const { version } = require('@the_viveksingh/vivek-ui/package.json')

if (!version) {
  // Fail the build rather than deploy a site that quietly claims no version at all.
  throw new Error('Could not read the version from @the_viveksingh/vivek-ui/package.json')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The library is a workspace dependency shipping per-file ESM + CJS. Nothing here
  // needs transpiling — if it did, that would be a bug in the package, not something to
  // paper over with transpilePackages.
  reactStrictMode: true,
  // optimizePackageImports is deliberately NOT used. It rewrites a barrel import into a
  // deep path, and this package's exports map exposes only '.', './charts' and the two
  // stylesheets - there are no per-component subpaths for it to rewrite to. The library
  // already ships per-file ESM with sideEffects:false, so tree-shaking works without it.
  env: {
    /*
     * Replaced with a string literal at build time, in both server and client bundles. A
     * version bump therefore reaches every corner of the site on the next build with no
     * file to remember to edit — which is the entire point.
     */
    NEXT_PUBLIC_LIBRARY_VERSION: version,
  },
}

export default nextConfig
