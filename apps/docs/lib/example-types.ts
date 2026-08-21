/**
 * The shape of a documented example.
 *
 * It lives in its own module so the per-domain example sets in `example-sets/` and the
 * `examples.ts` aggregator can both import it without a cycle.
 */
export interface Example {
  /** Section heading. */
  title: string
  /** Optional sentence of context. */
  description?: string
  /** Key into `previews/<slug>` — the branch the preview module renders. */
  name: string
  /** TypeScript source. The JS tab is derived from it. */
  code: string
}

export type ExampleSet = Record<string, Example[]>
