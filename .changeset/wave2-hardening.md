---
'@the_viveksingh/vivek-ui': patch
---

Security and accessibility hardening, from a browser-level audit.

- **Breadcrumb could render a `javascript:` URL.** `linkProps` is typed as full anchor
  attributes and was spread *after* the sanitised `href`, so a CMS-fed `linkProps.href`
  replaced the validated value with a raw one. Spread order is the fix: `linkProps` can add
  rels and targets, never the URL.
- **TagInput's paste handler compiled delimiters into a RegExp** with only the first
  character escaped — a multi-character delimiter crashed the paste handler, and a crafted
  one could build a catastrophic-backtracking pattern run against clipboard text. Splitting
  is now a character scan; there is no pattern to poison.
- **`isSafeHref` is one function again.** The exported predicate and the one the nav
  components use had quietly diverged (Prose kept a stricter local copy) — meaning
  SECURITY.md's "the same allowlist" claim was false, and a future bypass fix could land in
  one copy and not the other. Prose's stricter policy is now a *parameter set* of the shared
  function, not a fork of it.
- **MapEmbed leaked full page URLs** to map providers via `no-referrer-when-downgrade` —
  inconsistent with its own consent gate. Now `strict-origin-when-cross-origin`.
- **Two contrast failures measured by browser axe**, invisible to token arithmetic: the
  active sidebar link painted the accent on its own subtle wash (~4.0:1), and Scheduler's
  tone timestamps were faded with `opacity: 0.75` (~3.4:1). The `-subtle-fg` tokens exist
  precisely as text partners for the `-subtle` surfaces; both use them now, full strength.
- **RTL is enforced, not hoped for.** The library is logical-properties throughout, and a
  new source gate bans physical direction properties — with a four-entry allowlist where
  physical is *correct* (viewport-coordinate anchors for JS-positioned overlays, and a
  rotated-border chevron whose "down" is down in every script). Each entry carries its
  reason, and the gate fails if an entry stops matching real code.
