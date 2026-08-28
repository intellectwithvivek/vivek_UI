# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> accessibility of the composed pages >> /docs/installation has no axe violations
- Location: e2e\a11y.spec.ts:36:9

# Error details

```
Error: 
  [serious] scrollable-region-focusable: Scrollable region must have keyboard access
    <pre class="vk-code vk-code--block" data-size="sm">
    <pre class="vk-code vk-code--block" data-size="sm"><code class="vk-code__inner">import { LineChart } from '@the_viveksin
    <pre class="vk-code vk-code--block" data-size="sm">

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 12

- Array []
+ Array [
+   Object {
+     "help": "Scrollable region must have keyboard access",
+     "id": "scrollable-region-focusable",
+     "impact": "serious",
+     "nodes": Array [
+       "<pre class=\"vk-code vk-code--block\" data-size=\"sm\">",
+       "<pre class=\"vk-code vk-code--block\" data-size=\"sm\"><code class=\"vk-code__inner\">import { LineChart } from '@the_viveksin",
+       "<pre class=\"vk-code vk-code--block\" data-size=\"sm\">",
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
      - link "VivekUI" [ref=e5] [cursor=pointer]:
        - /url: /
      - generic [ref=e7]:
        - 'button "Accent colour: Blue" [ref=e8] [cursor=pointer]'
        - button "Switch to light theme" [ref=e10] [cursor=pointer]
        - link "GitHub" [ref=e14] [cursor=pointer]:
          - /url: https://github.com/intellectwithvivek/vivek_UI
      - button "Open menu" [ref=e15] [cursor=pointer]
  - main [ref=e18]:
    - generic [ref=e19]:
      - button "Search documentation" [ref=e21] [cursor=pointer]:
        - text: Search
        - generic [ref=e22]: ⌘K
      - generic [ref=e23]:
        - navigation "Documentation" [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]: Getting started
            - list "Getting started" [ref=e29]:
              - listitem [ref=e30]:
                - link "Introduction" [ref=e31] [cursor=pointer]:
                  - /url: /docs
              - listitem [ref=e33]:
                - link "Installation" [ref=e34] [cursor=pointer]:
                  - /url: /docs/installation
              - listitem [ref=e36]:
                - link "Quick start" [ref=e37] [cursor=pointer]:
                  - /url: /docs/quick-start
          - generic [ref=e39]:
            - generic [ref=e40]: Core concepts
            - list "Core concepts" [ref=e41]:
              - listitem [ref=e42]:
                - link "Theming" [ref=e43] [cursor=pointer]:
                  - /url: /docs/theming
              - listitem [ref=e45]:
                - link "Dark mode" [ref=e46] [cursor=pointer]:
                  - /url: /docs/dark-mode
              - listitem [ref=e48]:
                - link "Overriding styles" [ref=e49] [cursor=pointer]:
                  - /url: /docs/styling
              - listitem [ref=e51]:
                - link "Responsive" [ref=e52] [cursor=pointer]:
                  - /url: /docs/responsive
              - listitem [ref=e54]:
                - link "Feeding it your data" [ref=e55] [cursor=pointer]:
                  - /url: /docs/data-mapping
              - listitem [ref=e57]:
                - link "Server Components" [ref=e58] [cursor=pointer]:
                  - /url: /docs/server-components
              - listitem [ref=e60]:
                - link "Accessibility" [ref=e61] [cursor=pointer]:
                  - /url: /docs/accessibility
              - listitem [ref=e63]:
                - link "Security" [ref=e64] [cursor=pointer]:
                  - /url: /docs/security
              - listitem [ref=e66]:
                - link "TypeScript" [ref=e67] [cursor=pointer]:
                  - /url: /docs/typescript
              - listitem [ref=e69]:
                - link "FAQ" [ref=e70] [cursor=pointer]:
                  - /url: /docs/faq
          - generic [ref=e72]:
            - generic [ref=e73]: Reference
            - list "Reference" [ref=e74]:
              - listitem [ref=e75]:
                - link "All components" [ref=e76] [cursor=pointer]:
                  - /url: /docs/components
              - listitem [ref=e78]:
                - link "All charts" [ref=e79] [cursor=pointer]:
                  - /url: /docs/charts
              - listitem [ref=e81]:
                - link "Page templates" [ref=e82] [cursor=pointer]:
                  - /url: /pages
              - listitem [ref=e84]:
                - link "Playground" [ref=e85] [cursor=pointer]:
                  - /url: /playground
          - generic [ref=e87]:
            - generic [ref=e88]: Layout
            - list "Layout" [ref=e89]:
              - listitem [ref=e90]:
                - link "Aspect ratio" [ref=e91] [cursor=pointer]:
                  - /url: /docs/components/aspect-ratio
              - listitem [ref=e93]:
                - link "Bento grid" [ref=e94] [cursor=pointer]:
                  - /url: /docs/components/bento-grid
              - listitem [ref=e96]:
                - link "Box" [ref=e97] [cursor=pointer]:
                  - /url: /docs/components/box
              - listitem [ref=e99]:
                - link "Container" [ref=e100] [cursor=pointer]:
                  - /url: /docs/components/container
              - listitem [ref=e102]:
                - link "Divider" [ref=e103] [cursor=pointer]:
                  - /url: /docs/components/divider
              - listitem [ref=e105]:
                - link "Grid" [ref=e106] [cursor=pointer]:
                  - /url: /docs/components/grid
              - listitem [ref=e108]:
                - link "Scroll area" [ref=e109] [cursor=pointer]:
                  - /url: /docs/components/scroll-area
              - listitem [ref=e111]:
                - link "Section" [ref=e112] [cursor=pointer]:
                  - /url: /docs/components/section
              - listitem [ref=e114]:
                - link "Stack" [ref=e115] [cursor=pointer]:
                  - /url: /docs/components/stack
          - generic [ref=e117]:
            - generic [ref=e118]: Typography
            - list "Typography" [ref=e119]:
              - listitem [ref=e120]:
                - link "Code" [ref=e121] [cursor=pointer]:
                  - /url: /docs/components/code
              - listitem [ref=e123]:
                - link "Heading" [ref=e124] [cursor=pointer]:
                  - /url: /docs/components/heading
              - listitem [ref=e126]:
                - link "Kbd" [ref=e127] [cursor=pointer]:
                  - /url: /docs/components/kbd
              - listitem [ref=e129]:
                - link "Prose" [ref=e130] [cursor=pointer]:
                  - /url: /docs/components/prose
              - listitem [ref=e132]:
                - link "Text" [ref=e133] [cursor=pointer]:
                  - /url: /docs/components/text
          - generic [ref=e135]:
            - generic [ref=e136]: Actions
            - list "Actions" [ref=e137]:
              - listitem [ref=e138]:
                - link "Button" [ref=e139] [cursor=pointer]:
                  - /url: /docs/components/button
              - listitem [ref=e141]:
                - link "Button group" [ref=e142] [cursor=pointer]:
                  - /url: /docs/components/button-group
              - listitem [ref=e144]:
                - link "Copy button c" [ref=e145] [cursor=pointer]:
                  - /url: /docs/components/copy-button
                  - generic [ref=e146]: Copy button
                  - generic "Client component" [ref=e148]: c
              - listitem [ref=e149]:
                - link "Icon button" [ref=e150] [cursor=pointer]:
                  - /url: /docs/components/icon-button
          - generic [ref=e152]:
            - generic [ref=e153]: Forms
            - list "Forms" [ref=e154]:
              - listitem [ref=e155]:
                - link "Calendar c" [ref=e156] [cursor=pointer]:
                  - /url: /docs/components/calendar
                  - generic [ref=e157]: Calendar
                  - generic "Client component" [ref=e159]: c
              - listitem [ref=e160]:
                - link "Checkbox" [ref=e161] [cursor=pointer]:
                  - /url: /docs/components/checkbox
              - listitem [ref=e163]:
                - link "Combobox c" [ref=e164] [cursor=pointer]:
                  - /url: /docs/components/combobox
                  - generic [ref=e165]: Combobox
                  - generic "Client component" [ref=e167]: c
              - listitem [ref=e168]:
                - link "Date picker c" [ref=e169] [cursor=pointer]:
                  - /url: /docs/components/date-picker
                  - generic [ref=e170]: Date picker
                  - generic "Client component" [ref=e172]: c
              - listitem [ref=e173]:
                - link "Field c" [ref=e174] [cursor=pointer]:
                  - /url: /docs/components/field
                  - generic [ref=e175]: Field
                  - generic "Client component" [ref=e177]: c
              - listitem [ref=e178]:
                - link "File upload c" [ref=e179] [cursor=pointer]:
                  - /url: /docs/components/file-upload
                  - generic [ref=e180]: File upload
                  - generic "Client component" [ref=e182]: c
              - listitem [ref=e183]:
                - link "Input" [ref=e184] [cursor=pointer]:
                  - /url: /docs/components/input
              - listitem [ref=e186]:
                - link "Label" [ref=e187] [cursor=pointer]:
                  - /url: /docs/components/label
              - listitem [ref=e189]:
                - link "Otp input c" [ref=e190] [cursor=pointer]:
                  - /url: /docs/components/otp-input
                  - generic [ref=e191]: Otp input
                  - generic "Client component" [ref=e193]: c
              - listitem [ref=e194]:
                - link "Password input c" [ref=e195] [cursor=pointer]:
                  - /url: /docs/components/password-input
                  - generic [ref=e196]: Password input
                  - generic "Client component" [ref=e198]: c
              - listitem [ref=e199]:
                - link "Radio group" [ref=e200] [cursor=pointer]:
                  - /url: /docs/components/radio-group
              - listitem [ref=e202]:
                - link "Rating c" [ref=e203] [cursor=pointer]:
                  - /url: /docs/components/rating
                  - generic [ref=e204]: Rating
                  - generic "Client component" [ref=e206]: c
              - listitem [ref=e207]:
                - link "Segmented c" [ref=e208] [cursor=pointer]:
                  - /url: /docs/components/segmented
                  - generic [ref=e209]: Segmented
                  - generic "Client component" [ref=e211]: c
              - listitem [ref=e212]:
                - link "Select" [ref=e213] [cursor=pointer]:
                  - /url: /docs/components/select
              - listitem [ref=e215]:
                - link "Slider c" [ref=e216] [cursor=pointer]:
                  - /url: /docs/components/slider
                  - generic [ref=e217]: Slider
                  - generic "Client component" [ref=e219]: c
              - listitem [ref=e220]:
                - link "Switch" [ref=e221] [cursor=pointer]:
                  - /url: /docs/components/switch
              - listitem [ref=e223]:
                - link "Tag input c" [ref=e224] [cursor=pointer]:
                  - /url: /docs/components/tag-input
                  - generic [ref=e225]: Tag input
                  - generic "Client component" [ref=e227]: c
              - listitem [ref=e228]:
                - link "Textarea" [ref=e229] [cursor=pointer]:
                  - /url: /docs/components/textarea
          - generic [ref=e231]:
            - generic [ref=e232]: Overlays
            - list "Overlays" [ref=e233]:
              - listitem [ref=e234]:
                - link "Accordion c" [ref=e235] [cursor=pointer]:
                  - /url: /docs/components/accordion
                  - generic [ref=e236]: Accordion
                  - generic "Client component" [ref=e238]: c
              - listitem [ref=e239]:
                - link "Drawer c" [ref=e240] [cursor=pointer]:
                  - /url: /docs/components/drawer
                  - generic [ref=e241]: Drawer
                  - generic "Client component" [ref=e243]: c
              - listitem [ref=e244]:
                - link "Dropdown menu c" [ref=e245] [cursor=pointer]:
                  - /url: /docs/components/dropdown-menu
                  - generic [ref=e246]: Dropdown menu
                  - generic "Client component" [ref=e248]: c
              - listitem [ref=e249]:
                - link "Hover card c" [ref=e250] [cursor=pointer]:
                  - /url: /docs/components/hover-card
                  - generic [ref=e251]: Hover card
                  - generic "Client component" [ref=e253]: c
              - listitem [ref=e254]:
                - link "Modal c" [ref=e255] [cursor=pointer]:
                  - /url: /docs/components/modal
                  - generic [ref=e256]: Modal
                  - generic "Client component" [ref=e258]: c
              - listitem [ref=e259]:
                - link "Popover c" [ref=e260] [cursor=pointer]:
                  - /url: /docs/components/popover
                  - generic [ref=e261]: Popover
                  - generic "Client component" [ref=e263]: c
              - listitem [ref=e264]:
                - link "Portal c" [ref=e265] [cursor=pointer]:
                  - /url: /docs/components/portal
                  - generic [ref=e266]: Portal
                  - generic "Client component" [ref=e268]: c
              - listitem [ref=e269]:
                - link "Tabs c" [ref=e270] [cursor=pointer]:
                  - /url: /docs/components/tabs
                  - generic [ref=e271]: Tabs
                  - generic "Client component" [ref=e273]: c
              - listitem [ref=e274]:
                - link "Toast" [ref=e275] [cursor=pointer]:
                  - /url: /docs/components/toast
              - listitem [ref=e277]:
                - link "Tooltip c" [ref=e278] [cursor=pointer]:
                  - /url: /docs/components/tooltip
                  - generic [ref=e279]: Tooltip
                  - generic "Client component" [ref=e281]: c
          - generic [ref=e282]:
            - generic [ref=e283]: Navigation
            - list "Navigation" [ref=e284]:
              - listitem [ref=e285]:
                - link "Breadcrumb" [ref=e286] [cursor=pointer]:
                  - /url: /docs/components/breadcrumb
              - listitem [ref=e288]:
                - link "Command palette c" [ref=e289] [cursor=pointer]:
                  - /url: /docs/components/command-palette
                  - generic [ref=e290]: Command palette
                  - generic "Client component" [ref=e292]: c
              - listitem [ref=e293]:
                - link "Navbar c" [ref=e294] [cursor=pointer]:
                  - /url: /docs/components/navbar
                  - generic [ref=e295]: Navbar
                  - generic "Client component" [ref=e297]: c
              - listitem [ref=e298]:
                - link "Pagination c" [ref=e299] [cursor=pointer]:
                  - /url: /docs/components/pagination
                  - generic [ref=e300]: Pagination
                  - generic "Client component" [ref=e302]: c
              - listitem [ref=e303]:
                - link "Sidebar c" [ref=e304] [cursor=pointer]:
                  - /url: /docs/components/sidebar
                  - generic [ref=e305]: Sidebar
                  - generic "Client component" [ref=e307]: c
          - generic [ref=e308]:
            - generic [ref=e309]: Data display
            - list "Data display" [ref=e310]:
              - listitem [ref=e311]:
                - link "Avatar" [ref=e312] [cursor=pointer]:
                  - /url: /docs/components/avatar
              - listitem [ref=e314]:
                - link "Badge" [ref=e315] [cursor=pointer]:
                  - /url: /docs/components/badge
              - listitem [ref=e317]:
                - link "Card" [ref=e318] [cursor=pointer]:
                  - /url: /docs/components/card
              - listitem [ref=e320]:
                - link "Data table c" [ref=e321] [cursor=pointer]:
                  - /url: /docs/components/data-table
                  - generic [ref=e322]: Data table
                  - generic "Client component" [ref=e324]: c
              - listitem [ref=e325]:
                - link "Editable grid c" [ref=e326] [cursor=pointer]:
                  - /url: /docs/components/editable-grid
                  - generic [ref=e327]: Editable grid
                  - generic "Client component" [ref=e329]: c
              - listitem [ref=e330]:
                - link "File tree c" [ref=e331] [cursor=pointer]:
                  - /url: /docs/components/file-tree
                  - generic [ref=e332]: File tree
                  - generic "Client component" [ref=e334]: c
              - listitem [ref=e335]:
                - link "Kanban board c" [ref=e336] [cursor=pointer]:
                  - /url: /docs/components/kanban-board
                  - generic [ref=e337]: Kanban board
                  - generic "Client component" [ref=e339]: c
              - listitem [ref=e340]:
                - link "Scheduler c" [ref=e341] [cursor=pointer]:
                  - /url: /docs/components/scheduler
                  - generic [ref=e342]: Scheduler
                  - generic "Client component" [ref=e344]: c
              - listitem [ref=e345]:
                - link "Stepper c" [ref=e346] [cursor=pointer]:
                  - /url: /docs/components/stepper
                  - generic [ref=e347]: Stepper
                  - generic "Client component" [ref=e349]: c
              - listitem [ref=e350]:
                - link "Table" [ref=e351] [cursor=pointer]:
                  - /url: /docs/components/table
              - listitem [ref=e353]:
                - link "Timeline" [ref=e354] [cursor=pointer]:
                  - /url: /docs/components/timeline
              - listitem [ref=e356]:
                - link "Virtual list c" [ref=e357] [cursor=pointer]:
                  - /url: /docs/components/virtual-list
                  - generic [ref=e358]: Virtual list
                  - generic "Client component" [ref=e360]: c
          - generic [ref=e361]:
            - generic [ref=e362]: AI chat
            - list "AI chat" [ref=e363]:
              - listitem [ref=e364]:
                - link "Chat code block c" [ref=e365] [cursor=pointer]:
                  - /url: /docs/components/chat-code-block
                  - generic [ref=e366]: Chat code block
                  - generic "Client component" [ref=e368]: c
              - listitem [ref=e369]:
                - link "Chat input c" [ref=e370] [cursor=pointer]:
                  - /url: /docs/components/chat-input
                  - generic [ref=e371]: Chat input
                  - generic "Client component" [ref=e373]: c
              - listitem [ref=e374]:
                - link "Chat message" [ref=e375] [cursor=pointer]:
                  - /url: /docs/components/chat-message
              - listitem [ref=e377]:
                - link "Chat thread c" [ref=e378] [cursor=pointer]:
                  - /url: /docs/components/chat-thread
                  - generic [ref=e379]: Chat thread
                  - generic "Client component" [ref=e381]: c
              - listitem [ref=e382]:
                - link "Typing indicator" [ref=e383] [cursor=pointer]:
                  - /url: /docs/components/typing-indicator
          - generic [ref=e385]:
            - generic [ref=e386]: Feedback
            - list "Feedback" [ref=e387]:
              - listitem [ref=e388]:
                - link "Alert" [ref=e389] [cursor=pointer]:
                  - /url: /docs/components/alert
              - listitem [ref=e391]:
                - link "Empty state" [ref=e392] [cursor=pointer]:
                  - /url: /docs/components/empty-state
              - listitem [ref=e394]:
                - link "Progress" [ref=e395] [cursor=pointer]:
                  - /url: /docs/components/progress
              - listitem [ref=e397]:
                - link "Skeleton" [ref=e398] [cursor=pointer]:
                  - /url: /docs/components/skeleton
              - listitem [ref=e400]:
                - link "Spinner" [ref=e401] [cursor=pointer]:
                  - /url: /docs/components/spinner
          - generic [ref=e403]:
            - generic [ref=e404]: Sections
            - list "Sections" [ref=e405]:
              - listitem [ref=e406]:
                - link "Cta" [ref=e407] [cursor=pointer]:
                  - /url: /docs/components/cta
              - listitem [ref=e409]:
                - link "Faq" [ref=e410] [cursor=pointer]:
                  - /url: /docs/components/faq
              - listitem [ref=e412]:
                - link "Feature grid" [ref=e413] [cursor=pointer]:
                  - /url: /docs/components/feature-grid
              - listitem [ref=e415]:
                - link "Footer" [ref=e416] [cursor=pointer]:
                  - /url: /docs/components/footer
              - listitem [ref=e418]:
                - link "Hero" [ref=e419] [cursor=pointer]:
                  - /url: /docs/components/hero
              - listitem [ref=e421]:
                - link "Logo cloud" [ref=e422] [cursor=pointer]:
                  - /url: /docs/components/logo-cloud
              - listitem [ref=e424]:
                - link "Newsletter c" [ref=e425] [cursor=pointer]:
                  - /url: /docs/components/newsletter
                  - generic [ref=e426]: Newsletter
                  - generic "Client component" [ref=e428]: c
              - listitem [ref=e429]:
                - link "Pricing" [ref=e430] [cursor=pointer]:
                  - /url: /docs/components/pricing
              - listitem [ref=e432]:
                - link "Stats" [ref=e433] [cursor=pointer]:
                  - /url: /docs/components/stats
              - listitem [ref=e435]:
                - link "Testimonials" [ref=e436] [cursor=pointer]:
                  - /url: /docs/components/testimonials
          - generic [ref=e438]:
            - generic [ref=e439]: Media & time
            - list "Media & time" [ref=e440]:
              - listitem [ref=e441]:
                - link "Animated counter c" [ref=e442] [cursor=pointer]:
                  - /url: /docs/components/animated-counter
                  - generic [ref=e443]: Animated counter
                  - generic "Client component" [ref=e445]: c
              - listitem [ref=e446]:
                - link "Carousel" [ref=e447] [cursor=pointer]:
                  - /url: /docs/components/carousel
              - listitem [ref=e449]:
                - link "Clock c" [ref=e450] [cursor=pointer]:
                  - /url: /docs/components/clock
                  - generic [ref=e451]: Clock
                  - generic "Client component" [ref=e453]: c
              - listitem [ref=e454]:
                - link "Countdown c" [ref=e455] [cursor=pointer]:
                  - /url: /docs/components/countdown
                  - generic [ref=e456]: Countdown
                  - generic "Client component" [ref=e458]: c
              - listitem [ref=e459]:
                - link "Image c" [ref=e460] [cursor=pointer]:
                  - /url: /docs/components/image
                  - generic [ref=e461]: Image
                  - generic "Client component" [ref=e463]: c
              - listitem [ref=e464]:
                - link "Map embed c" [ref=e465] [cursor=pointer]:
                  - /url: /docs/components/map-embed
                  - generic [ref=e466]: Map embed
                  - generic "Client component" [ref=e468]: c
              - listitem [ref=e469]:
                - link "Marquee" [ref=e470] [cursor=pointer]:
                  - /url: /docs/components/marquee
              - listitem [ref=e472]:
                - link "Relative time c" [ref=e473] [cursor=pointer]:
                  - /url: /docs/components/relative-time
                  - generic [ref=e474]: Relative time
                  - generic "Client component" [ref=e476]: c
          - generic [ref=e477]:
            - generic [ref=e478]: Theming
            - list "Theming" [ref=e479]:
              - listitem [ref=e480]:
                - link "Theme provider c" [ref=e481] [cursor=pointer]:
                  - /url: /docs/components/theme-provider
                  - generic [ref=e482]: Theme provider
                  - generic "Client component" [ref=e484]: c
              - listitem [ref=e485]:
                - link "Theme toggle c" [ref=e486] [cursor=pointer]:
                  - /url: /docs/components/theme-toggle
                  - generic [ref=e487]: Theme toggle
                  - generic "Client component" [ref=e489]: c
          - generic [ref=e490]:
            - generic [ref=e491]: Charts
            - list "Charts" [ref=e492]:
              - listitem [ref=e493]:
                - link "AreaChart" [ref=e494] [cursor=pointer]:
                  - /url: /docs/charts/area-chart
              - listitem [ref=e496]:
                - link "BarChart" [ref=e497] [cursor=pointer]:
                  - /url: /docs/charts/bar-chart
              - listitem [ref=e499]:
                - link "LineChart" [ref=e500] [cursor=pointer]:
                  - /url: /docs/charts/line-chart
              - listitem [ref=e502]:
                - link "PieChart" [ref=e503] [cursor=pointer]:
                  - /url: /docs/charts/pie-chart
              - listitem [ref=e505]:
                - link "ProgressRing" [ref=e506] [cursor=pointer]:
                  - /url: /docs/charts/progress-ring
              - listitem [ref=e508]:
                - link "Sparkline" [ref=e509] [cursor=pointer]:
                  - /url: /docs/charts/sparkline
        - article [ref=e511]:
          - generic [ref=e512]:
            - heading "Installation" [level=1] [ref=e513]
            - paragraph [ref=e514]: Two steps. There is no third.
          - generic [ref=e515]:
            - heading "1. Install" [level=2] [ref=e516]
            - generic [ref=e517]:
              - tablist [ref=e518]:
                - tab "npm" [selected] [ref=e519] [cursor=pointer]
                - tab "pnpm" [ref=e520] [cursor=pointer]
                - tab "yarn" [ref=e521] [cursor=pointer]
                - tab "bun" [ref=e522] [cursor=pointer]
              - tabpanel "npm" [ref=e524]:
                - generic [ref=e525]:
                  - generic [ref=e526]:
                    - generic [ref=e527]: terminal
                    - generic [ref=e528]:
                      - button "Copy" [ref=e529] [cursor=pointer]
                      - status [ref=e530]
                  - code [ref=e532]: npm install @the_viveksingh/vivek-ui
            - paragraph [ref=e533]:
              - text: React 18 or 19 is a peer dependency. Nothing else is installed, because the package has no runtime dependencies of its own. Confirm it yourself with
              - code [ref=e534]: npm ls --omit=dev @the_viveksingh/vivek-ui
              - text: .
          - generic [ref=e535]:
            - heading "2. Import the stylesheet once" [level=2] [ref=e536]
            - generic [ref=e537]:
              - tablist [ref=e538]:
                - tab "Next.js App Router" [selected] [ref=e539] [cursor=pointer]
                - tab "Next.js Pages Router" [ref=e540] [cursor=pointer]
                - tab "Vite / CRA" [ref=e541] [cursor=pointer]
              - tabpanel "Next.js App Router" [ref=e543]:
                - generic [ref=e544]:
                  - generic [ref=e545]:
                    - generic [ref=e546]: app/layout.tsx
                    - radiogroup "Code language" [ref=e547]:
                      - radio "TS" [checked] [ref=e549] [cursor=pointer]
                      - radio "JS" [ref=e551] [cursor=pointer]
                    - generic [ref=e553]:
                      - button "Copy" [ref=e554] [cursor=pointer]
                      - status [ref=e555]
                  - code [ref=e557]: "import '@the_viveksingh/vivek-ui/styles.css' export default function RootLayout({ children }: { children: React.ReactNode }) { return ( <html lang=\"en\"> <body>{children}</body> </html> ) }"
          - generic [ref=e558]:
            - heading "Using charts" [level=2] [ref=e559]
            - paragraph [ref=e560]: Charts are a separate subpath with their own stylesheet, so an app that never draws one pays nothing for them.
            - generic [ref=e561]:
              - generic [ref=e562]:
                - radiogroup "Code language" [ref=e563]:
                  - radio "TS" [checked] [ref=e565] [cursor=pointer]
                  - radio "JS" [ref=e567] [cursor=pointer]
                - generic [ref=e569]:
                  - button "Copy" [ref=e570] [cursor=pointer]
                  - status [ref=e571]
              - code [ref=e573]: "import { LineChart } from '@the_viveksingh/vivek-ui/charts' import '@the_viveksingh/vivek-ui/charts.css'"
          - generic [ref=e574]:
            - heading "Compound components in Server Components" [level=2] [ref=e575]
            - alert [ref=e576]:
              - generic [ref=e577]: "!"
              - generic [ref=e578]:
                - generic [ref=e579]: Use the named part exports on the server
                - paragraph [ref=e581]:
                  - text: Interactive compound components —
                  - code [ref=e582]: Tabs
                  - text: ","
                  - code [ref=e583]: Accordion
                  - text: ","
                  - code [ref=e584]: Modal
                  - text: ","
                  - code [ref=e585]: Drawer
                  - text: ","
                  - code [ref=e586]: Navbar
                  - text: ","
                  - code [ref=e587]: Sidebar
                  - text: — are client components. From a Server Component they arrive as a client reference, and
                  - code [ref=e588]: Tabs.List
                  - text: reads
                  - code [ref=e589]: undefined
                  - text: off it. Import
                  - code [ref=e590]: TabsList
                  - text: instead. Inside a client component either form works. Server-safe compounds like
                  - code [ref=e591]: Card
                  - text: and
                  - code [ref=e592]: Table
                  - text: are unaffected.
            - generic [ref=e593]:
              - generic [ref=e594]:
                - radiogroup "Code language" [ref=e595]:
                  - radio "TS" [checked] [ref=e597] [cursor=pointer]
                  - radio "JS" [ref=e599] [cursor=pointer]
                - generic [ref=e601]:
                  - button "Copy" [ref=e602] [cursor=pointer]
                  - status [ref=e603]
              - code [ref=e605]: "// In a Server Component import { Tabs, TabsList, TabsTab } from '@the_viveksingh/vivek-ui' // In a client component, either works import { Tabs } from '@the_viveksingh/vivek-ui' <Tabs.List>...</Tabs.List>"
          - generic [ref=e606]:
            - heading "That is the whole setup" [level=2] [ref=e607]
            - status [ref=e608]:
              - paragraph [ref=e611]: No config file, no CLI, no Tailwind, no PostCSS plugin, no Babel plugin, and no required provider. If you needed a third step, that would be a bug in the library's design.
  - alert [ref=e612]
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
  38  |       // 'load', never 'networkidle': the showcase page lazy-loads twelve live iframes that
  39  |       // trickle requests indefinitely, so networkidle times the test out on a healthy page.
  40  |       await page.waitForLoadState('load')
  41  | 
  42  |       const violations = await axeViolations(page, NOT_OURS)
  43  |       const report = violations
  44  |         .map((v) => `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes.join('\n    ')}`)
  45  |         .join('\n')
> 46  |       expect(violations, `\n${report}`).toEqual([])
      |                                         ^ Error: 
  47  |     })
  48  |   }
  49  | })
  50  | 
  51  | test.describe('accessibility in dark mode', () => {
  52  |   // Contrast is the failure mode that flips between themes: a pairing that clears 4.5:1 on
  53  |   // white can fall under it on the dark surface, and nothing about the markup changes.
  54  |   for (const route of ['/', '/docs/components/button', '/showcase'] as const) {
  55  |     test(`${route} has no axe violations in dark mode`, async ({ page }) => {
  56  |       await page.goto(route)
  57  |       await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
  58  |       await page.waitForLoadState('load')
  59  | 
  60  |       const violations = await axeViolations(page, NOT_OURS)
  61  |       const report = violations
  62  |         .map((v) => `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes.join('\n    ')}`)
  63  |         .join('\n')
  64  |       expect(violations, `\n${report}`).toEqual([])
  65  |     })
  66  |   }
  67  | })
  68  | 
  69  | test.describe('keyboard reachability', () => {
  70  |   test('tabbing from the top reaches the main content quickly', async ({ page }) => {
  71  |     // A skip link exists so a keyboard user does not walk the whole nav on every page. If it
  72  |     // is not the first stop, it is not doing its job.
  73  |     await page.goto('/')
  74  |     await page.keyboard.press('Tab')
  75  | 
  76  |     const focused = await page.evaluate(() => {
  77  |       const el = document.activeElement
  78  |       return { text: (el?.textContent ?? '').trim(), href: el?.getAttribute('href') ?? '' }
  79  |     })
  80  |     expect(focused.text).toMatch(/skip/i)
  81  |     expect(focused.href).toBe('#content')
  82  |   })
  83  | 
  84  |   test('every focused control shows a visible focus ring', async ({ page }) => {
  85  |     /*
  86  |      * WCAG 2.4.7. A control that can be focused but shows nothing leaves a keyboard user
  87  |      * with no idea where they are — and it is invisible to every other kind of test, because
  88  |      * the element is present, enabled and correctly labelled.
  89  |      */
  90  |     await page.goto('/')
  91  |     await page.waitForLoadState('load')
  92  | 
  93  |     const invisible: string[] = []
  94  |     for (let step = 0; step < 12; step++) {
  95  |       await page.keyboard.press('Tab')
  96  |       const result = await page.evaluate(() => {
  97  |         const el = document.activeElement as HTMLElement | null
  98  |         if (!el || el === document.body) return null
  99  |         const style = getComputedStyle(el)
  100 |         const ring =
  101 |           (style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0) ||
  102 |           style.boxShadow !== 'none'
  103 |         return {
  104 |           ring,
  105 |           label: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24)}"`,
  106 |         }
  107 |       })
  108 |       if (result && !result.ring) invisible.push(result.label)
  109 |     }
  110 |     expect(invisible, `no focus indicator on:\n  ${invisible.join('\n  ')}`).toEqual([])
  111 |   })
  112 | })
  113 | 
```