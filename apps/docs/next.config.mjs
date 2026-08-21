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
}

export default nextConfig
