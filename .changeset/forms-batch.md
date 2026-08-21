---
'@the_viveksingh/vivek-ui': minor
---

Add eight form components: `Field`, `Label`, `Input`, `Textarea`, `Select`, `Checkbox`,
`RadioGroup` (with `Radio`) and `Switch`.

`Field` wires a label, hint and error message to its child control from a single id, pointing
`aria-describedby` at the error when there is one and the hint when there is not, and announcing the
error as a live region. Controls stay native underneath: `Select` is a real `<select>`, `RadioGroup`
is a `<fieldset>` with a `<legend>`, and `Checkbox`/`Switch` are real inputs that are visually hidden
but never removed from the focus order or from form submission.

`Field` is the library's first client component, since `useId` is a hook. Everything else remains
server-safe.
