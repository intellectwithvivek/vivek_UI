---
'@the_viveksingh/vivek-ui': patch
---

Point the package at the documentation site, now that it is live at
[ui.vivekkumarsingh.in](https://ui.vivekkumarsingh.in).

- `homepage` was a README anchor on GitHub, chosen before the site existed. npm renders this
  as the package's primary link, and a site with a page per component is a better destination
  than a heading.
- The README never linked the site at all. It now leads with it, above the install
  instructions, plus direct links to the component and chart indexes, the playground, the
  installation guide and the FAQ.
- The roadmap still listed the documentation site under "Next". It shipped several releases
  ago.
- The one-component badge said 198 B. `size-limit` measures 773 B.

`src/packaging.test.ts` asserts all of it, including that the size in the badge stays within
its own budget — the metadata a developer sees before installing is invisible from inside the
repo, which is exactly why it drifted.
