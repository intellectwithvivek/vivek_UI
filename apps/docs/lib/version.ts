/**
 * The library version the site is documenting.
 *
 * ONE source of truth: `next.config.mjs` reads it out of the library's `package.json` at
 * build time and inlines it here as a string literal. Bump the package version and the whole
 * site follows on the next build — the header badge, the landing hero, the structured data
 * and `llms.txt` — with no file to remember to edit.
 *
 * Why the environment variable rather than importing the JSON here: this value is used by
 * the site header, which is a Client Component. A JSON import would inline the entire
 * `package.json` — `devDependencies`, `size-limit` budgets, build script names — into a
 * public client chunk to get one string. It did, and it was visible in
 * `.next/static/chunks`.
 *
 * The version was hardcoded as `v0.2.2` in two places while the package was on 0.3.1.
 * Nobody spots that, because a version number always looks plausible.
 */
const RAW = process.env.NEXT_PUBLIC_LIBRARY_VERSION

/*
 * Fail loudly rather than render "vundefined" somewhere in the page.
 *
 * There is deliberately no fallback value. A default would make this module succeed while
 * the injection was broken, and the whole point is that the number cannot be wrong - a
 * plausible-looking wrong version is the failure mode being designed out. `vitest.config.ts`
 * injects the same value from the same source, so the tests exercise the real thing.
 */
if (!RAW) {
  throw new Error(
    'NEXT_PUBLIC_LIBRARY_VERSION is not set. next.config.mjs injects it from the library package.json, and vitest.config.ts does the same for tests. Reaching this means that wiring is broken.',
  )
}

export const LIBRARY_VERSION: string = RAW

/** `v0.3.1`, for display. One place decides whether the prefix is there. */
export const LIBRARY_VERSION_LABEL = `v${LIBRARY_VERSION}`
