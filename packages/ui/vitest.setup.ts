import '@testing-library/jest-dom/vitest'
import { expect } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers'

// vitest-axe ships its matchers separately from its `axe()` runner.
expect.extend(axeMatchers)
