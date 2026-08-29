/**
 * The security headers the deployment actually sends.
 *
 * Two rules, both learned from the live site rather than from a checklist:
 *
 * 1. The set of headers a reviewer looks for is present. `vercel.json` is the only place
 *    they are declared, and nothing else in the repo would notice if one were dropped.
 * 2. A `Content-Security-Policy-Report-Only` header must name somewhere to report. Without
 *    `report-uri` or `report-to` it enforces nothing and collects nothing — its entire
 *    effect is an error in the console of every Safari and Firefox visitor, which is how
 *    this was found: the live smoke test saw it on production.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

interface HeaderRule {
  source: string
  headers: Array<{ key: string; value: string }>
}

const config = JSON.parse(readFileSync(join(__dirname, '..', 'vercel.json'), 'utf8')) as {
  headers?: HeaderRule[]
}

const forEveryPath = (config.headers ?? []).find((rule) => rule.source === '/(.*)')
const headers = new Map((forEveryPath?.headers ?? []).map((h) => [h.key, h.value]))

describe('deployed security headers', () => {
  it('sends the ones a security review asks for', () => {
    for (const key of [
      'X-Content-Type-Options',
      'Referrer-Policy',
      'X-Frame-Options',
      'Strict-Transport-Security',
      'Permissions-Policy',
      'Content-Security-Policy',
    ]) {
      expect(headers.has(key), `${key} is not sent`).toBe(true)
    }
  })

  it('enforces the CSP directives that do not need a nonce', () => {
    const csp = headers.get('Content-Security-Policy') ?? ''
    for (const directive of ['base-uri', 'form-action', 'frame-ancestors', 'object-src']) {
      expect(csp, `${directive} missing`).toContain(directive)
    }
    // `upgrade-insecure-requests` is ignored in a report-only policy, so it belongs here.
    expect(csp).toContain('upgrade-insecure-requests')
  })

  it('never ships a report-only policy with nowhere to report', () => {
    const reportOnly = headers.get('Content-Security-Policy-Report-Only')
    if (!reportOnly) return
    expect(
      /report-uri|report-to/.test(reportOnly),
      'report-only CSP with no report-uri/report-to: it collects nothing and logs an error in every Safari and Firefox console',
    ).toBe(true)
  })

  it('preloads HSTS for at least a year', () => {
    const hsts = headers.get('Strict-Transport-Security') ?? ''
    const maxAge = Number(hsts.match(/max-age=(\d+)/)?.[1] ?? 0)
    expect(maxAge).toBeGreaterThanOrEqual(31536000)
    expect(hsts).toContain('includeSubDomains')
  })
})
