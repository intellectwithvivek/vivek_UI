---
'@the_viveksingh/vivek-ui': minor
---

`Button` now supports `asChild`, so a button that navigates can render a real `<a>`:

```tsx
<Button asChild><Link href="/pricing">Pricing</Link></Button>
```

A link styled as a button has to be an anchor, not a `<button>` with an `onClick` — otherwise
middle-click, cmd-click, "open in new tab" and "copy link address" all break, and a screen reader
announces the wrong role. `Navbar.Link`, `Sidebar.Item` and `Breadcrumb.Item` already had `asChild`;
`Button`, the most common case of all, did not.

**Fixed: `asChild` crashed React Server Components.** `Slot` attached a merged `ref` unconditionally,
and React counts `ref={null}` as using a ref — which is forbidden in a Server Component. Any
`asChild` usage in an RSC failed the prerender with "Refs cannot be used in Server Components". The
ref is now attached only when one exists.

This had gone unnoticed because every component with `asChild` was previously a client component, so
the pattern had never actually run in a Server Component.
