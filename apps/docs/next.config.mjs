/** @type {import('next').NextConfig} */
const nextConfig = {
  // The library is a workspace dependency shipping per-file ESM + CJS. Nothing here
  // needs transpiling — if it did, that would be a bug in the package, not something to
  // paper over with transpilePackages.
  reactStrictMode: true,
  experimental: {
    // Keeps the barrel import from pulling all 83 components into every route's graph.
    optimizePackageImports: ['@the_viveksingh/vivek-ui'],
  },
}

export default nextConfig
