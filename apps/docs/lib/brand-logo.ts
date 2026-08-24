/**
 * The brand mark's path, on its own so a client component can read it.
 *
 * It would naturally live in `branding.ts`, but that module reads the filesystem to detect
 * which icons are present — and importing it from the header, which is a client component,
 * pulls `node:fs` into the browser bundle. Turbopack does not warn about that; it panics
 * during the build with "the chunking context does not support external modules".
 *
 * A constant with no imports is safe from either side.
 */
export const BRAND_LOGO = '/branding/vivek-ui-logo.png'

/** Just the filename, for the branding folder's recognised-file list. */
export const BRAND_LOGO_FILE = 'vivek-ui-logo.png'
