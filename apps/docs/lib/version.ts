import pkg from '@the_viveksingh/vivek-ui/package.json'

/**
 * The library version, read from the package itself.
 *
 * It was hardcoded in the site header as `v0.2.2` and the package had moved on to 0.3.1 —
 * the kind of thing nobody notices, because the number looks plausible whatever it says.
 * A version badge that can be wrong is worse than no badge, so it is derived.
 *
 * `version.test.ts` asserts it is a real semver string, which catches the import silently
 * resolving to something unexpected.
 */
export const LIBRARY_VERSION: string = pkg.version
