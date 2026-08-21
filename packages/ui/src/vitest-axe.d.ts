/// <reference types="vitest/globals" />

// vitest-axe does not augment Vitest's Assertion interface itself, so we do it here.
import type { AxeMatchers } from 'vitest-axe/matchers'

declare module 'vitest' {
  interface Assertion<T = unknown> extends AxeMatchers {
    _type?: T
  }
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
