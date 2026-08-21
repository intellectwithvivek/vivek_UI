---
'@the_viveksingh/vivek-ui': minor
---

Export the parts of client compound components as named exports:
`TabsList`, `TabsTab`, `TabsPanels`, `TabsPanel`, `AccordionItem`, `AccordionTrigger`,
`AccordionContent`, `ModalHeader`, `ModalBody`, `ModalFooter`, `ModalTitle`,
`ModalCloseButton`, the `Drawer*` equivalents, `NavbarBrand`, `NavbarLinks`, `NavbarLink`,
`NavbarActions`, `NavbarToggle`, `SidebarSection`, `SidebarItem`, `SidebarToggle` and
`ChatThreadEmpty`.

**This fixes a hard failure in React Server Components.** `Tabs` is a client component, so
a Server Component receives it as a client *reference* — and reading `Tabs.List` off a
client reference yields `undefined`, so the render dies with "Element type is invalid:
expected a string or a class/function but got: undefined". Dot access still works inside
client components; the named exports are what a Server Component needs.

`Popover` and `DropdownMenu` already exported their parts individually, which is exactly
why those two worked. The rest now match.

Found by building the documentation site: the first page to put `Tabs` in a Server
Component failed the Next.js prerender outright.
