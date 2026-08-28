# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> accessibility in dark mode >> /docs/components/button has no axe violations in dark mode
- Location: e2e\a11y.spec.ts:55:9

# Error details

```
Error: 
  [serious] scrollable-region-focusable: Scrollable region must have keyboard access
    <pre class="vk-code vk-code--block" data-size="sm"><code class="vk-code__inner">import { Button } from '@the_viveksingh/
    <pre class="vk-code vk-code--block" data-size="sm"><code class="vk-code__inner">&lt;Button loading&gt;Saving changes&lt;
    <pre class="vk-code vk-code--block" data-size="sm"><code class="vk-code__inner">import Link from 'next/link'

&lt;Button

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 14

- Array []
+ Array [
+   Object {
+     "help": "Scrollable region must have keyboard access",
+     "id": "scrollable-region-focusable",
+     "impact": "serious",
+     "nodes": Array [
+       "<pre class=\"vk-code vk-code--block\" data-size=\"sm\"><code class=\"vk-code__inner\">import { Button } from '@the_viveksingh/",
+       "<pre class=\"vk-code vk-code--block\" data-size=\"sm\"><code class=\"vk-code__inner\">&lt;Button loading&gt;Saving changes&lt;",
+       "<pre class=\"vk-code vk-code--block\" data-size=\"sm\"><code class=\"vk-code__inner\">import Link from 'next/link'
+
+ &lt;Button",
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
            - paragraph [ref=e513]: Actions
            - heading "Button" [level=1] [ref=e514]
            - paragraph [ref=e515]: A button.
            - generic [ref=e516]:
              - generic "Renders in a Server Component" [ref=e517]: Server safe
              - link "Source" [ref=e518] [cursor=pointer]:
                - /url: https://github.com/intellectwithvivek/vivek_UI/tree/main/packages/ui/src/components/button
          - generic [ref=e519]:
            - heading "Import" [level=2] [ref=e520]
            - generic [ref=e521]:
              - generic [ref=e522]:
                - radiogroup "Code language" [ref=e523]:
                  - radio "TS" [checked] [ref=e525] [cursor=pointer]
                  - radio "JS" [ref=e527] [cursor=pointer]
                - generic [ref=e529]:
                  - button "Copy" [ref=e530] [cursor=pointer]
                  - status [ref=e531]
              - code [ref=e533]: "import { Button } from '@the_viveksingh/vivek-ui'"
          - generic [ref=e534]:
            - heading "Variants" [level=2] [ref=e535]
            - paragraph [ref=e536]: Four variants, mapped to a data attribute rather than a class-name string.
            - generic [ref=e538]:
              - button "Solid" [ref=e539] [cursor=pointer]
              - button "Outline" [ref=e540] [cursor=pointer]
              - button "Ghost" [ref=e541] [cursor=pointer]
              - button "Link" [ref=e542] [cursor=pointer]
            - generic [ref=e543]:
              - generic [ref=e544]:
                - radiogroup "Code language" [ref=e545]:
                  - radio "TS" [checked] [ref=e547] [cursor=pointer]
                  - radio "JS" [ref=e549] [cursor=pointer]
                - generic [ref=e551]:
                  - button "Copy" [ref=e552] [cursor=pointer]
                  - status [ref=e553]
              - code [ref=e555]: <Button>Solid</Button> <Button variant="outline">Outline</Button> <Button variant="ghost">Ghost</Button> <Button variant="link">Link</Button>
          - generic [ref=e556]:
            - heading "Sizes and full width" [level=2] [ref=e557]
            - generic [ref=e559]:
              - generic [ref=e560]:
                - button "Small" [ref=e561] [cursor=pointer]
                - button "Medium" [ref=e562] [cursor=pointer]
                - button "Large" [ref=e563] [cursor=pointer]
              - button "Full width" [ref=e564] [cursor=pointer]
            - generic [ref=e565]:
              - generic [ref=e566]:
                - radiogroup "Code language" [ref=e567]:
                  - radio "TS" [checked] [ref=e569] [cursor=pointer]
                  - radio "JS" [ref=e571] [cursor=pointer]
                - generic [ref=e573]:
                  - button "Copy" [ref=e574] [cursor=pointer]
                  - status [ref=e575]
              - code [ref=e577]: <Button size="sm">Small</Button> <Button size="md">Medium</Button> <Button size="lg">Large</Button> <Button fullWidth>Full width</Button>
          - generic [ref=e578]:
            - heading "Loading" [level=2] [ref=e579]
            - paragraph [ref=e580]: loading also disables the button, so a submit cannot fire twice while a request is in flight.
            - generic [ref=e582]:
              - button "Saving changes" [disabled] [ref=e583]
              - button "Loading" [disabled] [ref=e585]
              - button "Disabled" [disabled] [ref=e587]
            - generic [ref=e588]:
              - generic [ref=e589]:
                - radiogroup "Code language" [ref=e590]:
                  - radio "TS" [checked] [ref=e592] [cursor=pointer]
                  - radio "JS" [ref=e594] [cursor=pointer]
                - generic [ref=e596]:
                  - button "Copy" [ref=e597] [cursor=pointer]
                  - status [ref=e598]
              - code [ref=e600]: <Button loading>Saving changes</Button> <Button loading variant="outline">Loading</Button> <Button disabled>Disabled</Button>
          - generic [ref=e601]:
            - heading "As a link" [level=2] [ref=e602]
            - paragraph [ref=e603]: asChild renders your element instead of a <button>. A link that looks like a button must be an anchor — otherwise middle-click, cmd-click and "open in new tab" all break, and a screen reader announces the wrong role.
            - link "Get started" [ref=e605] [cursor=pointer]:
              - /url: /docs/installation
            - generic [ref=e606]:
              - generic [ref=e607]:
                - radiogroup "Code language" [ref=e608]:
                  - radio "TS" [checked] [ref=e610] [cursor=pointer]
                  - radio "JS" [ref=e612] [cursor=pointer]
                - generic [ref=e614]:
                  - button "Copy" [ref=e615] [cursor=pointer]
                  - status [ref=e616]
              - code [ref=e618]: import Link from 'next/link' <Button asChild> <Link href="/docs/installation">Get started</Link> </Button>
          - generic [ref=e619]:
            - heading "Overriding styles" [level=2] [ref=e620]
            - paragraph [ref=e621]: Every library selector is wrapped in :where(), which has specificity zero — so one flat class of your own wins, with no !important.
            - button "Beats the library" [ref=e623] [cursor=pointer]
            - generic [ref=e624]:
              - generic [ref=e625]:
                - radiogroup "Code language" [ref=e626]:
                  - radio "TS" [checked] [ref=e628] [cursor=pointer]
                  - radio "JS" [ref=e630] [cursor=pointer]
                - generic [ref=e632]:
                  - button "Copy" [ref=e633] [cursor=pointer]
                  - status [ref=e634]
              - code [ref=e636]: "/* your stylesheet */ .my-cta { background: #db2777; border-radius: 999px; } <Button className=\"my-cta\">Beats the library</Button>"
          - separator [ref=e637]
          - generic [ref=e638]:
            - heading "Props" [level=2] [ref=e639]
            - paragraph [ref=e640]: Generated from the package's own type declarations, so this table cannot drift from the code.
            - table [ref=e642]:
              - caption [ref=e643]: Props for Button
              - rowgroup [ref=e644]:
                - row [ref=e645]:
                  - columnheader "Prop" [ref=e646]
                  - columnheader "Type" [ref=e647]
                  - columnheader "Default" [ref=e648]
                  - columnheader "Description" [ref=e649]
              - rowgroup [ref=e650]:
                - row [ref=e651]:
                  - cell [ref=e652]:
                    - code [ref=e653]: variant
                  - cell [ref=e654]:
                    - code [ref=e655]: "'solid' | 'outline' | 'ghost' | 'link'"
                  - cell "—" [ref=e656]
                  - cell "—" [ref=e657]
                - row [ref=e658]:
                  - cell [ref=e659]:
                    - code [ref=e660]: size
                  - cell [ref=e661]:
                    - code [ref=e662]: "'sm' | 'md' | 'lg'"
                  - cell "—" [ref=e663]
                  - cell "—" [ref=e664]
                - row [ref=e665]:
                  - cell [ref=e666]:
                    - code [ref=e667]: fullWidth
                  - cell [ref=e668]:
                    - code [ref=e669]: boolean
                  - cell "—" [ref=e670]
                  - cell "—" [ref=e671]
                - row [ref=e672]:
                  - cell [ref=e673]:
                    - code [ref=e674]: loading
                  - cell [ref=e675]:
                    - code [ref=e676]: boolean
                  - cell "—" [ref=e677]
                  - cell "—" [ref=e678]
                - row [ref=e679]:
                  - cell [ref=e680]:
                    - code [ref=e681]: asChild
                  - cell [ref=e682]:
                    - code [ref=e683]: boolean
                  - cell "—" [ref=e684]
                  - 'cell "Render the caller''s element instead of a `<button>`, keeping every style and data attribute. This is how a button navigates without the library depending on a router: ```tsx <Button asChild><Link href=\"/pricing\">Pricing</Link></Button> ``` A link that looks like a button must be an `<a>`, not a `<button>` with an onClick — otherwise middle-click, cmd-click, \"open in new tab\" and \"copy link address\" all break, and a screen reader announces the wrong role. `loading` and `disabled` are ignored when `asChild` is set: `disabled` is not a valid attribute on an anchor, and a spinner inside someone else''s element would fight their children. Use a real `<button>` for anything with a pending state." [ref=e685]'
            - status [ref=e686]:
              - paragraph [ref=e689]:
                - text: Every remaining prop is spread onto the root element, so all standard HTML and ARIA attributes work.
                - code [ref=e690]: className
                - text: and
                - code [ref=e691]: style
                - text: are merged with the library's own, never replaced, and the ref forwards to the root DOM node.
          - generic [ref=e692]:
            - heading "Rendering" [level=2] [ref=e693]
            - status [ref=e694]:
              - generic [ref=e695]: ✓
              - generic [ref=e696]:
                - generic [ref=e697]: Server safe
                - paragraph [ref=e699]:
                  - code [ref=e700]: Button
                  - text: carries no
                  - code [ref=e701]: "'use client'"
                  - text: directive and renders directly in a React Server Component. No client JavaScript is shipped for it.
          - separator [ref=e702]
          - navigation "Adjacent components" [ref=e703]:
            - link "← Text" [ref=e704] [cursor=pointer]:
              - /url: /docs/components/text
            - link "Button group →" [ref=e705] [cursor=pointer]:
              - /url: /docs/components/button-group
  - alert [ref=e706]
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
  46  |       expect(violations, `\n${report}`).toEqual([])
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
> 64  |       expect(violations, `\n${report}`).toEqual([])
      |                                         ^ Error: 
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