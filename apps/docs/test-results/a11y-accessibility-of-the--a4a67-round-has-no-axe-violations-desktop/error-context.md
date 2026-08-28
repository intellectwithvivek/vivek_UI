# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> accessibility of the composed pages >> /playground has no axe violations
- Location: e2e\a11y.spec.ts:36:9

# Error details

```
Error: 
  [moderate] heading-order: Heading levels should only increase by one
    <h3 class="vk-heading" data-size="xl">Counter</h3>

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 10

- Array []
+ Array [
+   Object {
+     "help": "Heading levels should only increase by one",
+     "id": "heading-order",
+     "impact": "moderate",
+     "nodes": Array [
+       "<h3 class=\"vk-heading\" data-size=\"xl\">Counter</h3>",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#content"
  - navigation "Main" [ref=e3]:
    - generic [ref=e4]:
      - link "VivekUI v0.5.0" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e6]: VivekUI
        - generic [ref=e7]: v0.5.0
      - list [ref=e8]:
        - listitem [ref=e9]:
          - link "Docs" [ref=e10] [cursor=pointer]:
            - /url: /docs
        - listitem [ref=e11]:
          - link "Components" [ref=e12] [cursor=pointer]:
            - /url: /docs/components
        - listitem [ref=e13]:
          - link "Charts" [ref=e14] [cursor=pointer]:
            - /url: /docs/charts
        - listitem [ref=e15]:
          - link "Showcase" [ref=e16] [cursor=pointer]:
            - /url: /showcase
        - listitem [ref=e17]:
          - link "Pages" [ref=e18] [cursor=pointer]:
            - /url: /pages
        - listitem [ref=e19]:
          - link "Playground" [ref=e20] [cursor=pointer]:
            - /url: /playground
      - generic [ref=e21]:
        - 'button "Accent colour: Blue" [ref=e22] [cursor=pointer]'
        - button "Switch to light theme" [ref=e24] [cursor=pointer]
        - link "Buy me a coffee" [ref=e28] [cursor=pointer]:
          - /url: https://www.buymeacoffee.com/theviveksingh
          - text: ☕
        - link "GitHub" [ref=e29] [cursor=pointer]:
          - /url: https://github.com/intellectwithvivek/vivek_UI
  - main [ref=e30]:
    - generic [ref=e31]:
      - generic [ref=e32]:
        - heading "Playground" [level=1] [ref=e33]
        - paragraph [ref=e34]: Every export from the library and its charts is already in scope. Edit the code and it renders as you type. Your draft is kept in this browser, and the URL is shareable.
      - generic [ref=e35]:
        - generic [ref=e36]:
          - generic [ref=e37]:
            - combobox "Starter template" [ref=e39] [cursor=pointer]:
              - option "Welcome" [selected]
              - option "Login form"
              - option "Dashboard with charts"
              - option "AI chat panel"
              - option "Landing page"
              - option "Settings page"
            - generic [ref=e40]: Live
            - status [ref=e41]: Compiled
          - generic [ref=e42]:
            - group "Preview width" [ref=e43]:
              - button "S" [ref=e45] [cursor=pointer]
              - button "M" [ref=e46] [cursor=pointer]
              - button "L" [pressed] [ref=e47] [cursor=pointer]
            - button "Light" [ref=e48] [cursor=pointer]
            - button "Copy code" [ref=e49] [cursor=pointer]
            - button "Share" [ref=e50] [cursor=pointer]
            - button "Reset" [ref=e51] [cursor=pointer]
        - generic [ref=e52]:
          - region "Source code" [ref=e53]:
            - generic [ref=e54]:
              - paragraph [ref=e55]: TypeScript
              - paragraph [ref=e56]: 25 lines
            - generic [ref=e57]:
              - generic [ref=e58]:
                - generic [ref=e59]: "1"
                - generic [ref=e60]: "2"
                - generic [ref=e61]: "3"
                - generic [ref=e62]: "4"
                - generic [ref=e63]: "5"
                - generic [ref=e64]: "6"
                - generic [ref=e65]: "7"
                - generic [ref=e66]: "8"
                - generic [ref=e67]: "9"
                - generic [ref=e68]: "10"
                - generic [ref=e69]: "11"
                - generic [ref=e70]: "12"
                - generic [ref=e71]: "13"
                - generic [ref=e72]: "14"
                - generic [ref=e73]: "15"
                - generic [ref=e74]: "16"
                - generic [ref=e75]: "17"
                - generic [ref=e76]: "18"
                - generic [ref=e77]: "19"
                - generic [ref=e78]: "20"
                - generic [ref=e79]: "21"
                - generic [ref=e80]: "22"
                - generic [ref=e81]: "23"
                - generic [ref=e82]: "24"
                - generic [ref=e83]: "25"
              - textbox "Playground source code" [ref=e84]: "function App() { const [count, setCount] = React.useState(0) return ( <Stack gap={6}> <Heading level={1}>Hello from the playground</Heading> <Text tone=\"muted\"> Every export is already in scope. Edit this and it re-renders. </Text> <Card variant=\"elevated\" padding=\"lg\"> <Card.Header> <Heading level={3}>Counter</Heading> </Card.Header> <Card.Body> <Text>Clicked {count} times.</Text> </Card.Body> <Card.Footer> <Button onClick={() => setCount(count + 1)}>Click me</Button> <Button variant=\"outline\" onClick={() => setCount(0)}>Reset</Button> </Card.Footer> </Card> </Stack> ) }"
            - paragraph [ref=e85]: Tab indents, Shift+Tab outdents, Ctrl+Enter runs now, Escape leaves the editor.
          - region "Result" [ref=e86]:
            - tablist [ref=e88]:
              - tab "Preview" [selected] [ref=e89] [cursor=pointer]
              - tab "Compiled JS" [ref=e90] [cursor=pointer]
            - generic [ref=e93]:
              - heading "Hello from the playground" [level=1] [ref=e94]
              - paragraph [ref=e95]: Every export is already in scope. Edit this and it re-renders.
              - generic [ref=e96]:
                - heading "Counter" [level=3] [ref=e98]
                - paragraph [ref=e100]: Clicked 0 times.
                - generic [ref=e101]:
                  - button "Click me" [ref=e102] [cursor=pointer]
                  - button "Reset" [ref=e103] [cursor=pointer]
  - alert [ref=e104]
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test'
  2   | import { axeViolations, KEY_ROUTES } from './helpers'
  3   | 
  4   | /**
  5   |  * axe against whole pages, in a real browser.
  6   |  *
  7   |  * The unit suite already runs axe on every component — but in isolation, in jsdom. That
  8   |  * misses everything that only exists once a page is assembled, and everything that needs
  9   |  * layout to detect:
  10  |  *
  11  |  *   - two landmarks of the same kind with no distinguishing label
  12  |  *   - a second `<h1>`, or an outline that jumps a level, once sections are composed
  13  |  *   - **colour contrast**, which axe skips entirely in jsdom because it has to sample the
  14  |  *     rendered pixels of an element against whatever is actually painted behind it
  15  |  *
  16  |  * That last one is the reason this file earns its keep. Every contrast claim the library
  17  |  * makes has been checked against token pairs in the abstract; this is the first thing that
  18  |  * checks the colours as a browser really paints them, on a real background, at a real
  19  |  * font size.
  20  |  */
  21  | 
  22  | /*
  23  |  * Rules disabled, with the reason each one is not ours to fix.
  24  |  *
  25  |  * Nothing to do with severity — an unexplained disabled rule is how an accessibility suite
  26  |  * quietly stops testing anything.
  27  |  */
  28  | const NOT_OURS = [
  29  |   // The showcase embeds twelve third-party sites. axe walks into same-origin frames and
  30  |   // reports their problems as ours; we cannot fix another site's markup from here.
  31  |   'frame-tested',
  32  | ]
  33  | 
  34  | test.describe('accessibility of the composed pages', () => {
  35  |   for (const route of KEY_ROUTES) {
  36  |     test(`${route} has no axe violations`, async ({ page }) => {
  37  |       await page.goto(route)
  38  |       await page.waitForLoadState('networkidle')
  39  | 
  40  |       const violations = await axeViolations(page, NOT_OURS)
  41  |       const report = violations
  42  |         .map((v) => `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes.join('\n    ')}`)
  43  |         .join('\n')
> 44  |       expect(violations, `\n${report}`).toEqual([])
      |                                         ^ Error: 
  45  |     })
  46  |   }
  47  | })
  48  | 
  49  | test.describe('accessibility in dark mode', () => {
  50  |   // Contrast is the failure mode that flips between themes: a pairing that clears 4.5:1 on
  51  |   // white can fall under it on the dark surface, and nothing about the markup changes.
  52  |   for (const route of ['/', '/docs/components/button', '/showcase'] as const) {
  53  |     test(`${route} has no axe violations in dark mode`, async ({ page }) => {
  54  |       await page.goto(route)
  55  |       await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
  56  |       await page.waitForLoadState('networkidle')
  57  | 
  58  |       const violations = await axeViolations(page, NOT_OURS)
  59  |       const report = violations
  60  |         .map((v) => `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes.join('\n    ')}`)
  61  |         .join('\n')
  62  |       expect(violations, `\n${report}`).toEqual([])
  63  |     })
  64  |   }
  65  | })
  66  | 
  67  | test.describe('keyboard reachability', () => {
  68  |   test('tabbing from the top reaches the main content quickly', async ({ page }) => {
  69  |     // A skip link exists so a keyboard user does not walk the whole nav on every page. If it
  70  |     // is not the first stop, it is not doing its job.
  71  |     await page.goto('/')
  72  |     await page.keyboard.press('Tab')
  73  | 
  74  |     const focused = await page.evaluate(() => {
  75  |       const el = document.activeElement
  76  |       return { text: (el?.textContent ?? '').trim(), href: el?.getAttribute('href') ?? '' }
  77  |     })
  78  |     expect(focused.text).toMatch(/skip/i)
  79  |     expect(focused.href).toBe('#content')
  80  |   })
  81  | 
  82  |   test('every focused control shows a visible focus ring', async ({ page }) => {
  83  |     /*
  84  |      * WCAG 2.4.7. A control that can be focused but shows nothing leaves a keyboard user
  85  |      * with no idea where they are — and it is invisible to every other kind of test, because
  86  |      * the element is present, enabled and correctly labelled.
  87  |      */
  88  |     await page.goto('/')
  89  |     await page.waitForLoadState('networkidle')
  90  | 
  91  |     const invisible: string[] = []
  92  |     for (let step = 0; step < 12; step++) {
  93  |       await page.keyboard.press('Tab')
  94  |       const result = await page.evaluate(() => {
  95  |         const el = document.activeElement as HTMLElement | null
  96  |         if (!el || el === document.body) return null
  97  |         const style = getComputedStyle(el)
  98  |         const ring =
  99  |           (style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0) ||
  100 |           style.boxShadow !== 'none'
  101 |         return {
  102 |           ring,
  103 |           label: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24)}"`,
  104 |         }
  105 |       })
  106 |       if (result && !result.ring) invisible.push(result.label)
  107 |     }
  108 |     expect(invisible, `no focus indicator on:\n  ${invisible.join('\n  ')}`).toEqual([])
  109 |   })
  110 | })
  111 | 
```