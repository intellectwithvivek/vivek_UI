---
'@the_viveksingh/vivek-ui': minor
---

`Form` — validation and submission orchestration with zero dependencies, built on the
principle that **the browser already knows how to validate; it just reports badly.**

`required`, `minLength`, `type="email"` and `pattern` work exactly as on plain HTML. Form
intercepts submit, collects every failure through the constraint validation API, swaps in
readable `messages` (per field, per failure kind), **focuses the first invalid control in
document order**, and hands `{ errors, submitting, submitError }` to the layout — plain
children or a render function. `validate` adds cross-field rules, with native failures
winning per field. Async `onSubmit` drives `submitting`; a rejected submit lands in
`submitError` for the layout to render instead of dying as an unhandled rejection in the
console. Errors clear on the next attempt, not per keystroke — messages should not vanish
while they are being read.

No context, no controller, no field registration: state lives in the DOM, where the values
already are.
