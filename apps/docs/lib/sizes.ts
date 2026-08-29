import snapshot from '../size-snapshot.json'

/**
 * What the library actually weighs, measured rather than remembered.
 *
 * The site used to state 40.8 kB for the whole core library while size-limit measured
 * 47.35 kB — and the test guarding it passed throughout, because it compared the stated
 * figure against the *budget* rather than against the measurement. Every understatement
 * passes a check like that.
 *
 * `scripts/size-snapshot.mjs` writes the file behind this, and the `size` script re-measures
 * and fails when it drifts. So a number quoted here is a number CI has confirmed.
 */
export interface SizeSnapshot {
  /** Brotli-compressed size of each size-limit entry point, in bytes. React excluded. */
  bundles: Record<string, number>
  css: Record<string, { raw: number; gzip: number; brotli: number }>
}

export const sizes = snapshot as SizeSnapshot

/** 771 -> "771 B"; 47354 -> "47.4 kB". Decimal kB, matching what size-limit reports. */
export function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`
  return `${(bytes / 1000).toFixed(1)} kB`
}

/**
 * A named bundle's size, formatted.
 *
 * Throws on an unknown name rather than rendering "undefined" or quietly falling back to
 * zero — a renamed size-limit entry should break the build, not put a wrong number on the
 * homepage.
 */
export function bundleSize(name: string): string {
  const bytes = sizes.bundles[name]
  if (typeof bytes !== 'number') {
    throw new Error(
      `No size recorded for "${name}". The size-limit entry was probably renamed; ` +
        'run `pnpm --filter @the_viveksingh/vivek-ui size:update`.',
    )
  }
  return formatBytes(bytes)
}

export function cssSize(
  file: 'styles.css' | 'charts.css' | 'a typical page (dist/css/*)',
  encoding: 'gzip' | 'brotli',
): string {
  const entry = sizes.css[file]
  if (!entry) throw new Error(`No size recorded for ${file}.`)
  return formatBytes(entry[encoding])
}
