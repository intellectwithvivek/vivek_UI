# Security Policy

VivekUI (`@the_viveksingh/vivek-ui`) is a React component library with zero runtime
dependencies. It renders markup and ships CSS; it makes no network requests, stores
nothing, and reads no credentials. That keeps the attack surface small — but a component
library still sits directly in the render path of its consumers' applications, so
vulnerabilities here are inherited by everyone who installs it.

We take that seriously and we would rather hear from you than not.

## Supported versions

| Version | Supported |
|---|---|
| Latest `0.x` minor | Yes |
| Older `0.x` minors | No — upgrade to the latest minor |

Until `1.0.0`, security fixes land on the latest published minor only. Once `1.0.0`
ships, this table will name the maintained major lines.

The declared peer range is `react` / `react-dom` `^18.0.0 || ^19.0.0`. Where a mitigation
depends on the React version — React 19 blocks `javascript:` URLs in `href`, React 18
only warns — the advisory will say so explicitly.

## Reporting a vulnerability

**Please do not open a public issue, pull request, or discussion for a security report.**

Use one of these instead:

1. **GitHub private vulnerability reporting** (preferred) —
   [open a draft advisory](https://github.com/intellectwithvivek/vivek_UI/security/advisories/new).
   This is private to the maintainers and gives us a place to work with you on a fix and a
   CVE.
2. **Email** — `intellectwithvivek@gmail.com`, with `SECURITY` in the subject line.

You do not need to have a fix, a CVE, or a proof-of-concept exploit. A clear description
of the problem is enough to start.

### What to include

The more of this you have, the faster we can confirm and fix:

- The affected component, hook, or utility, and the file if you know it.
- The package version, and the React version you saw it on.
- A minimal reproduction — a small component tree, the props you passed, and what
  happened. A failing test against `packages/ui/src` is ideal.
- What an attacker controls in your scenario (a CMS field, an API response, a model's
  output, a URL parameter) and what the end user suffers.
- Any mitigation you have already found.

### What happens next

| When | What |
|---|---|
| Within 3 working days | We acknowledge your report. |
| Within 10 working days | We confirm or dispute it, and give you our severity assessment. |
| Target 30 days for high/critical | Fix released, advisory published. |
| Target 90 days for low/medium | Fix released, usually folded into a normal minor. |

We will keep you updated if a fix is going to take longer than that — silence is a bug in
this process, so chase us.

### Disclosure

We practise coordinated disclosure. We will agree a disclosure date with you, publish a
GitHub Security Advisory, and credit you by the name or handle you ask for (or keep you
anonymous — just say). Please give us a chance to ship a fix before going public. We will
not take legal action against anyone who reports a vulnerability in good faith under this
policy.

## Scope

### In scope

- Cross-site scripting or HTML injection from any prop or data value a component renders.
- A prop value reaching a URL-bearing attribute (`href`, `src`, `action`, `srcdoc`)
  without scheme validation, where a `javascript:` or `data:text/html` value could run.
- Prototype pollution reachable from props or data.
- CSV / formula injection in the export helpers (`utils/export.ts`).
- Catastrophic backtracking (ReDoS) in any regular expression applied to caller data.
- Unbounded work driven by a prop — a loop, recursion, or allocation that can hang the
  main thread on hostile input.
- Denial of interaction: any state in which a component leaves the page permanently
  `inert`, `aria-hidden`, focus-trapped, or scroll-locked after it has closed or
  unmounted.
- Clickjacking surfaces: an overlay that intercepts input when it should not.
- Anything in the published tarball that should not be there, or a build or release
  pipeline weakness (`.github/workflows/`, `scripts/`) that could let an attacker publish
  a malicious version.
- Loss of SSR safety in a way that crashes or leaks across a server render.

### Out of scope

- Vulnerabilities in `react` / `react-dom` themselves — report those to Meta. We will
  still document a version-specific mitigation if one is needed here.
- Vulnerabilities in our `devDependencies` that cannot affect the published package.
  `packages/ui` ships **no** runtime dependencies, so a dev-tool advisory does not reach
  consumers; tell us anyway and we will bump it as routine maintenance.
- A consumer passing markup they control into a `ReactNode` prop, or using
  `dangerouslySetInnerHTML` in their own code around our components. We render
  `ReactNode` children as React escapes them; we do not parse HTML anywhere.
- Missing security headers, CSP, or HTTPS configuration on a site that uses the library —
  that is the application's responsibility, not the library's.
- Accessibility defects with no security consequence. Those are ordinary bugs; please do
  open a public issue for them, we want them.
- The documentation site and playground apps (`apps/`), which are not published.

## Hardening notes for consumers

Not vulnerabilities, but worth knowing:

- **`href` is scheme-validated for you.** Every component that renders an `href` from your
  data — `Footer`, `Breadcrumb`, `Navbar`, `Sidebar`, `Prose.Link` — puts it through an
  allowlist of `http:`, `https:`, `mailto:` and `tel:`, and drops anything else. That
  includes `javascript:` and `data:`, and it survives the whitespace trick
  (`java&Tab;script:`) because control characters are stripped before the scheme is read.
  This matters because React 18 renders a `javascript:` URL verbatim — only React 19 blocks
  it — and `^18` is inside the supported peer range.

  Two places where the value is still yours to check: `Button asChild` and every other
  `asChild` slot render **your** element, so the `href` on it never passes through the
  library; and `isSafeHref` is exported if you want to run your own data through the same
  allowlist before it reaches anything else.
- **An `src` is not sanitised, and does not need to be.** `Avatar`, `LogoCloud` and `Image`
  pass `src` to an `<img>`, which cannot execute script in any modern browser — a
  `javascript:` URL is inert there, and an SVG loaded through `<img>` has scripting
  disabled. What an `src` *can* do is tell a third-party host that your visitor loaded the
  page, so host the file yourself if that matters to you. `MapEmbed` builds its own URL from
  the coordinates or query you pass and encodes every part, and its iframe is sandboxed
  without `allow-same-origin`.
- **`target="_blank"` needs `rel="noopener noreferrer"`.** `Prose.Link` adds it for you.
  Where you set `target` yourself — through `linkProps` or a spread — set `rel` too.
- **A CSV export is code on someone else's machine.** `toCsv` neutralises leading `=`,
  `+`, `-`, `@`, tab and CR so a cell cannot become a live formula. Do not pass
  `formulaGuard: false` on data you did not author.
- **Content Security Policy.** The library needs no `script-src` allowances of its own: it
  ships no inline scripts and evaluates no strings. One audited `dangerouslySetInnerHTML`
  exists — the FAQ component's JSON-LD block, which structured data requires (React escapes
  script text children, which would corrupt the JSON). Its payload is `JSON.stringify` output
  with `<` escaped to `<`, so item content cannot break out of the tag, and a test pins
  the budget to that single file. Component styling is static CSS plus
  custom properties, so a strict `style-src` works, though inline `style` attributes
  (used for CSS custom properties like `--vk-cols`) mean you may need `'unsafe-inline'`
  for `style-src` or a nonce/hash strategy for them.

## Verifying what you installed

Releases are published from GitHub Actions using **npm Trusted Publishing (OIDC)**. There is
no long-lived publish token anywhere: the package is configured to require two-factor
authentication and to disallow tokens outright, so even a compromised repository secret could
not publish. CI authenticates by exchanging a short-lived GitHub OIDC token, and npm attaches
a provenance attestation automatically.

You can verify any published version yourself:

```bash
npm view @the_viveksingh/vivek-ui --json | grep -i provenance
npm audit signatures
```

The published tarball contains `dist/` only. If you find anything else in it — source,
tests, config, credentials — that is a reportable problem.
