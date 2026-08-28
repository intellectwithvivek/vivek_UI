# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> accessibility of the composed pages >> /docs/components/scheduler has no axe violations
- Location: e2e\a11y.spec.ts:36:9

# Error details

```
Error: 
  [serious] scrollable-region-focusable: Scrollable region must have keyboard access
    <pre class="vk-code vk-code--block" data-size="sm">
    <div class="vk-table-wrap" data-bordered="true">

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 11

- Array []
+ Array [
+   Object {
+     "help": "Scrollable region must have keyboard access",
+     "id": "scrollable-region-focusable",
+     "impact": "serious",
+     "nodes": Array [
+       "<pre class=\"vk-code vk-code--block\" data-size=\"sm\">",
+       "<div class=\"vk-table-wrap\" data-bordered=\"true\">",
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
      - list [ref=e7]:
        - listitem [ref=e8]:
          - link "Docs" [ref=e9] [cursor=pointer]:
            - /url: /docs
        - listitem [ref=e10]:
          - link "Components" [ref=e11] [cursor=pointer]:
            - /url: /docs/components
        - listitem [ref=e12]:
          - link "Charts" [ref=e13] [cursor=pointer]:
            - /url: /docs/charts
        - listitem [ref=e14]:
          - link "Showcase" [ref=e15] [cursor=pointer]:
            - /url: /showcase
        - listitem [ref=e16]:
          - link "Pages" [ref=e17] [cursor=pointer]:
            - /url: /pages
        - listitem [ref=e18]:
          - link "Playground" [ref=e19] [cursor=pointer]:
            - /url: /playground
      - generic [ref=e20]:
        - 'button "Accent colour: Blue" [ref=e21] [cursor=pointer]'
        - button "Switch to light theme" [ref=e23] [cursor=pointer]
        - link "GitHub" [ref=e27] [cursor=pointer]:
          - /url: https://github.com/intellectwithvivek/vivek_UI
  - main [ref=e28]:
    - generic [ref=e29]:
      - button "Search documentation" [ref=e31] [cursor=pointer]:
        - text: Search
        - generic [ref=e32]: ⌘K
      - generic [ref=e33]:
        - navigation "Documentation" [ref=e36]:
          - generic [ref=e37]:
            - generic [ref=e38]: Getting started
            - list "Getting started" [ref=e39]:
              - listitem [ref=e40]:
                - link "Introduction" [ref=e41] [cursor=pointer]:
                  - /url: /docs
              - listitem [ref=e43]:
                - link "Installation" [ref=e44] [cursor=pointer]:
                  - /url: /docs/installation
              - listitem [ref=e46]:
                - link "Quick start" [ref=e47] [cursor=pointer]:
                  - /url: /docs/quick-start
          - generic [ref=e49]:
            - generic [ref=e50]: Core concepts
            - list "Core concepts" [ref=e51]:
              - listitem [ref=e52]:
                - link "Theming" [ref=e53] [cursor=pointer]:
                  - /url: /docs/theming
              - listitem [ref=e55]:
                - link "Dark mode" [ref=e56] [cursor=pointer]:
                  - /url: /docs/dark-mode
              - listitem [ref=e58]:
                - link "Overriding styles" [ref=e59] [cursor=pointer]:
                  - /url: /docs/styling
              - listitem [ref=e61]:
                - link "Responsive" [ref=e62] [cursor=pointer]:
                  - /url: /docs/responsive
              - listitem [ref=e64]:
                - link "Feeding it your data" [ref=e65] [cursor=pointer]:
                  - /url: /docs/data-mapping
              - listitem [ref=e67]:
                - link "Server Components" [ref=e68] [cursor=pointer]:
                  - /url: /docs/server-components
              - listitem [ref=e70]:
                - link "Accessibility" [ref=e71] [cursor=pointer]:
                  - /url: /docs/accessibility
              - listitem [ref=e73]:
                - link "Security" [ref=e74] [cursor=pointer]:
                  - /url: /docs/security
              - listitem [ref=e76]:
                - link "TypeScript" [ref=e77] [cursor=pointer]:
                  - /url: /docs/typescript
              - listitem [ref=e79]:
                - link "FAQ" [ref=e80] [cursor=pointer]:
                  - /url: /docs/faq
          - generic [ref=e82]:
            - generic [ref=e83]: Reference
            - list "Reference" [ref=e84]:
              - listitem [ref=e85]:
                - link "All components" [ref=e86] [cursor=pointer]:
                  - /url: /docs/components
              - listitem [ref=e88]:
                - link "All charts" [ref=e89] [cursor=pointer]:
                  - /url: /docs/charts
              - listitem [ref=e91]:
                - link "Page templates" [ref=e92] [cursor=pointer]:
                  - /url: /pages
              - listitem [ref=e94]:
                - link "Playground" [ref=e95] [cursor=pointer]:
                  - /url: /playground
          - generic [ref=e97]:
            - generic [ref=e98]: Layout
            - list "Layout" [ref=e99]:
              - listitem [ref=e100]:
                - link "Aspect ratio" [ref=e101] [cursor=pointer]:
                  - /url: /docs/components/aspect-ratio
              - listitem [ref=e103]:
                - link "Bento grid" [ref=e104] [cursor=pointer]:
                  - /url: /docs/components/bento-grid
              - listitem [ref=e106]:
                - link "Box" [ref=e107] [cursor=pointer]:
                  - /url: /docs/components/box
              - listitem [ref=e109]:
                - link "Container" [ref=e110] [cursor=pointer]:
                  - /url: /docs/components/container
              - listitem [ref=e112]:
                - link "Divider" [ref=e113] [cursor=pointer]:
                  - /url: /docs/components/divider
              - listitem [ref=e115]:
                - link "Grid" [ref=e116] [cursor=pointer]:
                  - /url: /docs/components/grid
              - listitem [ref=e118]:
                - link "Scroll area" [ref=e119] [cursor=pointer]:
                  - /url: /docs/components/scroll-area
              - listitem [ref=e121]:
                - link "Section" [ref=e122] [cursor=pointer]:
                  - /url: /docs/components/section
              - listitem [ref=e124]:
                - link "Stack" [ref=e125] [cursor=pointer]:
                  - /url: /docs/components/stack
          - generic [ref=e127]:
            - generic [ref=e128]: Typography
            - list "Typography" [ref=e129]:
              - listitem [ref=e130]:
                - link "Code" [ref=e131] [cursor=pointer]:
                  - /url: /docs/components/code
              - listitem [ref=e133]:
                - link "Heading" [ref=e134] [cursor=pointer]:
                  - /url: /docs/components/heading
              - listitem [ref=e136]:
                - link "Kbd" [ref=e137] [cursor=pointer]:
                  - /url: /docs/components/kbd
              - listitem [ref=e139]:
                - link "Prose" [ref=e140] [cursor=pointer]:
                  - /url: /docs/components/prose
              - listitem [ref=e142]:
                - link "Text" [ref=e143] [cursor=pointer]:
                  - /url: /docs/components/text
          - generic [ref=e145]:
            - generic [ref=e146]: Actions
            - list "Actions" [ref=e147]:
              - listitem [ref=e148]:
                - link "Button" [ref=e149] [cursor=pointer]:
                  - /url: /docs/components/button
              - listitem [ref=e151]:
                - link "Button group" [ref=e152] [cursor=pointer]:
                  - /url: /docs/components/button-group
              - listitem [ref=e154]:
                - link "Copy button c" [ref=e155] [cursor=pointer]:
                  - /url: /docs/components/copy-button
                  - generic [ref=e156]: Copy button
                  - generic "Client component" [ref=e158]: c
              - listitem [ref=e159]:
                - link "Icon button" [ref=e160] [cursor=pointer]:
                  - /url: /docs/components/icon-button
          - generic [ref=e162]:
            - generic [ref=e163]: Forms
            - list "Forms" [ref=e164]:
              - listitem [ref=e165]:
                - link "Calendar c" [ref=e166] [cursor=pointer]:
                  - /url: /docs/components/calendar
                  - generic [ref=e167]: Calendar
                  - generic "Client component" [ref=e169]: c
              - listitem [ref=e170]:
                - link "Checkbox" [ref=e171] [cursor=pointer]:
                  - /url: /docs/components/checkbox
              - listitem [ref=e173]:
                - link "Combobox c" [ref=e174] [cursor=pointer]:
                  - /url: /docs/components/combobox
                  - generic [ref=e175]: Combobox
                  - generic "Client component" [ref=e177]: c
              - listitem [ref=e178]:
                - link "Date picker c" [ref=e179] [cursor=pointer]:
                  - /url: /docs/components/date-picker
                  - generic [ref=e180]: Date picker
                  - generic "Client component" [ref=e182]: c
              - listitem [ref=e183]:
                - link "Field c" [ref=e184] [cursor=pointer]:
                  - /url: /docs/components/field
                  - generic [ref=e185]: Field
                  - generic "Client component" [ref=e187]: c
              - listitem [ref=e188]:
                - link "File upload c" [ref=e189] [cursor=pointer]:
                  - /url: /docs/components/file-upload
                  - generic [ref=e190]: File upload
                  - generic "Client component" [ref=e192]: c
              - listitem [ref=e193]:
                - link "Input" [ref=e194] [cursor=pointer]:
                  - /url: /docs/components/input
              - listitem [ref=e196]:
                - link "Label" [ref=e197] [cursor=pointer]:
                  - /url: /docs/components/label
              - listitem [ref=e199]:
                - link "Otp input c" [ref=e200] [cursor=pointer]:
                  - /url: /docs/components/otp-input
                  - generic [ref=e201]: Otp input
                  - generic "Client component" [ref=e203]: c
              - listitem [ref=e204]:
                - link "Password input c" [ref=e205] [cursor=pointer]:
                  - /url: /docs/components/password-input
                  - generic [ref=e206]: Password input
                  - generic "Client component" [ref=e208]: c
              - listitem [ref=e209]:
                - link "Radio group" [ref=e210] [cursor=pointer]:
                  - /url: /docs/components/radio-group
              - listitem [ref=e212]:
                - link "Rating c" [ref=e213] [cursor=pointer]:
                  - /url: /docs/components/rating
                  - generic [ref=e214]: Rating
                  - generic "Client component" [ref=e216]: c
              - listitem [ref=e217]:
                - link "Segmented c" [ref=e218] [cursor=pointer]:
                  - /url: /docs/components/segmented
                  - generic [ref=e219]: Segmented
                  - generic "Client component" [ref=e221]: c
              - listitem [ref=e222]:
                - link "Select" [ref=e223] [cursor=pointer]:
                  - /url: /docs/components/select
              - listitem [ref=e225]:
                - link "Slider c" [ref=e226] [cursor=pointer]:
                  - /url: /docs/components/slider
                  - generic [ref=e227]: Slider
                  - generic "Client component" [ref=e229]: c
              - listitem [ref=e230]:
                - link "Switch" [ref=e231] [cursor=pointer]:
                  - /url: /docs/components/switch
              - listitem [ref=e233]:
                - link "Tag input c" [ref=e234] [cursor=pointer]:
                  - /url: /docs/components/tag-input
                  - generic [ref=e235]: Tag input
                  - generic "Client component" [ref=e237]: c
              - listitem [ref=e238]:
                - link "Textarea" [ref=e239] [cursor=pointer]:
                  - /url: /docs/components/textarea
          - generic [ref=e241]:
            - generic [ref=e242]: Overlays
            - list "Overlays" [ref=e243]:
              - listitem [ref=e244]:
                - link "Accordion c" [ref=e245] [cursor=pointer]:
                  - /url: /docs/components/accordion
                  - generic [ref=e246]: Accordion
                  - generic "Client component" [ref=e248]: c
              - listitem [ref=e249]:
                - link "Drawer c" [ref=e250] [cursor=pointer]:
                  - /url: /docs/components/drawer
                  - generic [ref=e251]: Drawer
                  - generic "Client component" [ref=e253]: c
              - listitem [ref=e254]:
                - link "Dropdown menu c" [ref=e255] [cursor=pointer]:
                  - /url: /docs/components/dropdown-menu
                  - generic [ref=e256]: Dropdown menu
                  - generic "Client component" [ref=e258]: c
              - listitem [ref=e259]:
                - link "Hover card c" [ref=e260] [cursor=pointer]:
                  - /url: /docs/components/hover-card
                  - generic [ref=e261]: Hover card
                  - generic "Client component" [ref=e263]: c
              - listitem [ref=e264]:
                - link "Modal c" [ref=e265] [cursor=pointer]:
                  - /url: /docs/components/modal
                  - generic [ref=e266]: Modal
                  - generic "Client component" [ref=e268]: c
              - listitem [ref=e269]:
                - link "Popover c" [ref=e270] [cursor=pointer]:
                  - /url: /docs/components/popover
                  - generic [ref=e271]: Popover
                  - generic "Client component" [ref=e273]: c
              - listitem [ref=e274]:
                - link "Portal c" [ref=e275] [cursor=pointer]:
                  - /url: /docs/components/portal
                  - generic [ref=e276]: Portal
                  - generic "Client component" [ref=e278]: c
              - listitem [ref=e279]:
                - link "Tabs c" [ref=e280] [cursor=pointer]:
                  - /url: /docs/components/tabs
                  - generic [ref=e281]: Tabs
                  - generic "Client component" [ref=e283]: c
              - listitem [ref=e284]:
                - link "Toast" [ref=e285] [cursor=pointer]:
                  - /url: /docs/components/toast
              - listitem [ref=e287]:
                - link "Tooltip c" [ref=e288] [cursor=pointer]:
                  - /url: /docs/components/tooltip
                  - generic [ref=e289]: Tooltip
                  - generic "Client component" [ref=e291]: c
          - generic [ref=e292]:
            - generic [ref=e293]: Navigation
            - list "Navigation" [ref=e294]:
              - listitem [ref=e295]:
                - link "Breadcrumb" [ref=e296] [cursor=pointer]:
                  - /url: /docs/components/breadcrumb
              - listitem [ref=e298]:
                - link "Command palette c" [ref=e299] [cursor=pointer]:
                  - /url: /docs/components/command-palette
                  - generic [ref=e300]: Command palette
                  - generic "Client component" [ref=e302]: c
              - listitem [ref=e303]:
                - link "Navbar c" [ref=e304] [cursor=pointer]:
                  - /url: /docs/components/navbar
                  - generic [ref=e305]: Navbar
                  - generic "Client component" [ref=e307]: c
              - listitem [ref=e308]:
                - link "Pagination c" [ref=e309] [cursor=pointer]:
                  - /url: /docs/components/pagination
                  - generic [ref=e310]: Pagination
                  - generic "Client component" [ref=e312]: c
              - listitem [ref=e313]:
                - link "Sidebar c" [ref=e314] [cursor=pointer]:
                  - /url: /docs/components/sidebar
                  - generic [ref=e315]: Sidebar
                  - generic "Client component" [ref=e317]: c
          - generic [ref=e318]:
            - generic [ref=e319]: Data display
            - list "Data display" [ref=e320]:
              - listitem [ref=e321]:
                - link "Avatar" [ref=e322] [cursor=pointer]:
                  - /url: /docs/components/avatar
              - listitem [ref=e324]:
                - link "Badge" [ref=e325] [cursor=pointer]:
                  - /url: /docs/components/badge
              - listitem [ref=e327]:
                - link "Card" [ref=e328] [cursor=pointer]:
                  - /url: /docs/components/card
              - listitem [ref=e330]:
                - link "Data table c" [ref=e331] [cursor=pointer]:
                  - /url: /docs/components/data-table
                  - generic [ref=e332]: Data table
                  - generic "Client component" [ref=e334]: c
              - listitem [ref=e335]:
                - link "Editable grid c" [ref=e336] [cursor=pointer]:
                  - /url: /docs/components/editable-grid
                  - generic [ref=e337]: Editable grid
                  - generic "Client component" [ref=e339]: c
              - listitem [ref=e340]:
                - link "File tree c" [ref=e341] [cursor=pointer]:
                  - /url: /docs/components/file-tree
                  - generic [ref=e342]: File tree
                  - generic "Client component" [ref=e344]: c
              - listitem [ref=e345]:
                - link "Kanban board c" [ref=e346] [cursor=pointer]:
                  - /url: /docs/components/kanban-board
                  - generic [ref=e347]: Kanban board
                  - generic "Client component" [ref=e349]: c
              - listitem [ref=e350]:
                - link "Scheduler c" [ref=e351] [cursor=pointer]:
                  - /url: /docs/components/scheduler
                  - generic [ref=e352]: Scheduler
                  - generic "Client component" [ref=e354]: c
              - listitem [ref=e355]:
                - link "Stepper c" [ref=e356] [cursor=pointer]:
                  - /url: /docs/components/stepper
                  - generic [ref=e357]: Stepper
                  - generic "Client component" [ref=e359]: c
              - listitem [ref=e360]:
                - link "Table" [ref=e361] [cursor=pointer]:
                  - /url: /docs/components/table
              - listitem [ref=e363]:
                - link "Timeline" [ref=e364] [cursor=pointer]:
                  - /url: /docs/components/timeline
              - listitem [ref=e366]:
                - link "Virtual list c" [ref=e367] [cursor=pointer]:
                  - /url: /docs/components/virtual-list
                  - generic [ref=e368]: Virtual list
                  - generic "Client component" [ref=e370]: c
          - generic [ref=e371]:
            - generic [ref=e372]: AI chat
            - list "AI chat" [ref=e373]:
              - listitem [ref=e374]:
                - link "Chat code block c" [ref=e375] [cursor=pointer]:
                  - /url: /docs/components/chat-code-block
                  - generic [ref=e376]: Chat code block
                  - generic "Client component" [ref=e378]: c
              - listitem [ref=e379]:
                - link "Chat input c" [ref=e380] [cursor=pointer]:
                  - /url: /docs/components/chat-input
                  - generic [ref=e381]: Chat input
                  - generic "Client component" [ref=e383]: c
              - listitem [ref=e384]:
                - link "Chat message" [ref=e385] [cursor=pointer]:
                  - /url: /docs/components/chat-message
              - listitem [ref=e387]:
                - link "Chat thread c" [ref=e388] [cursor=pointer]:
                  - /url: /docs/components/chat-thread
                  - generic [ref=e389]: Chat thread
                  - generic "Client component" [ref=e391]: c
              - listitem [ref=e392]:
                - link "Typing indicator" [ref=e393] [cursor=pointer]:
                  - /url: /docs/components/typing-indicator
          - generic [ref=e395]:
            - generic [ref=e396]: Feedback
            - list "Feedback" [ref=e397]:
              - listitem [ref=e398]:
                - link "Alert" [ref=e399] [cursor=pointer]:
                  - /url: /docs/components/alert
              - listitem [ref=e401]:
                - link "Empty state" [ref=e402] [cursor=pointer]:
                  - /url: /docs/components/empty-state
              - listitem [ref=e404]:
                - link "Progress" [ref=e405] [cursor=pointer]:
                  - /url: /docs/components/progress
              - listitem [ref=e407]:
                - link "Skeleton" [ref=e408] [cursor=pointer]:
                  - /url: /docs/components/skeleton
              - listitem [ref=e410]:
                - link "Spinner" [ref=e411] [cursor=pointer]:
                  - /url: /docs/components/spinner
          - generic [ref=e413]:
            - generic [ref=e414]: Sections
            - list "Sections" [ref=e415]:
              - listitem [ref=e416]:
                - link "Cta" [ref=e417] [cursor=pointer]:
                  - /url: /docs/components/cta
              - listitem [ref=e419]:
                - link "Faq" [ref=e420] [cursor=pointer]:
                  - /url: /docs/components/faq
              - listitem [ref=e422]:
                - link "Feature grid" [ref=e423] [cursor=pointer]:
                  - /url: /docs/components/feature-grid
              - listitem [ref=e425]:
                - link "Footer" [ref=e426] [cursor=pointer]:
                  - /url: /docs/components/footer
              - listitem [ref=e428]:
                - link "Hero" [ref=e429] [cursor=pointer]:
                  - /url: /docs/components/hero
              - listitem [ref=e431]:
                - link "Logo cloud" [ref=e432] [cursor=pointer]:
                  - /url: /docs/components/logo-cloud
              - listitem [ref=e434]:
                - link "Newsletter c" [ref=e435] [cursor=pointer]:
                  - /url: /docs/components/newsletter
                  - generic [ref=e436]: Newsletter
                  - generic "Client component" [ref=e438]: c
              - listitem [ref=e439]:
                - link "Pricing" [ref=e440] [cursor=pointer]:
                  - /url: /docs/components/pricing
              - listitem [ref=e442]:
                - link "Stats" [ref=e443] [cursor=pointer]:
                  - /url: /docs/components/stats
              - listitem [ref=e445]:
                - link "Testimonials" [ref=e446] [cursor=pointer]:
                  - /url: /docs/components/testimonials
          - generic [ref=e448]:
            - generic [ref=e449]: Media & time
            - list "Media & time" [ref=e450]:
              - listitem [ref=e451]:
                - link "Animated counter c" [ref=e452] [cursor=pointer]:
                  - /url: /docs/components/animated-counter
                  - generic [ref=e453]: Animated counter
                  - generic "Client component" [ref=e455]: c
              - listitem [ref=e456]:
                - link "Carousel" [ref=e457] [cursor=pointer]:
                  - /url: /docs/components/carousel
              - listitem [ref=e459]:
                - link "Clock c" [ref=e460] [cursor=pointer]:
                  - /url: /docs/components/clock
                  - generic [ref=e461]: Clock
                  - generic "Client component" [ref=e463]: c
              - listitem [ref=e464]:
                - link "Countdown c" [ref=e465] [cursor=pointer]:
                  - /url: /docs/components/countdown
                  - generic [ref=e466]: Countdown
                  - generic "Client component" [ref=e468]: c
              - listitem [ref=e469]:
                - link "Image c" [ref=e470] [cursor=pointer]:
                  - /url: /docs/components/image
                  - generic [ref=e471]: Image
                  - generic "Client component" [ref=e473]: c
              - listitem [ref=e474]:
                - link "Map embed c" [ref=e475] [cursor=pointer]:
                  - /url: /docs/components/map-embed
                  - generic [ref=e476]: Map embed
                  - generic "Client component" [ref=e478]: c
              - listitem [ref=e479]:
                - link "Marquee" [ref=e480] [cursor=pointer]:
                  - /url: /docs/components/marquee
              - listitem [ref=e482]:
                - link "Relative time c" [ref=e483] [cursor=pointer]:
                  - /url: /docs/components/relative-time
                  - generic [ref=e484]: Relative time
                  - generic "Client component" [ref=e486]: c
          - generic [ref=e487]:
            - generic [ref=e488]: Theming
            - list "Theming" [ref=e489]:
              - listitem [ref=e490]:
                - link "Theme provider c" [ref=e491] [cursor=pointer]:
                  - /url: /docs/components/theme-provider
                  - generic [ref=e492]: Theme provider
                  - generic "Client component" [ref=e494]: c
              - listitem [ref=e495]:
                - link "Theme toggle c" [ref=e496] [cursor=pointer]:
                  - /url: /docs/components/theme-toggle
                  - generic [ref=e497]: Theme toggle
                  - generic "Client component" [ref=e499]: c
          - generic [ref=e500]:
            - generic [ref=e501]: Charts
            - list "Charts" [ref=e502]:
              - listitem [ref=e503]:
                - link "AreaChart" [ref=e504] [cursor=pointer]:
                  - /url: /docs/charts/area-chart
              - listitem [ref=e506]:
                - link "BarChart" [ref=e507] [cursor=pointer]:
                  - /url: /docs/charts/bar-chart
              - listitem [ref=e509]:
                - link "LineChart" [ref=e510] [cursor=pointer]:
                  - /url: /docs/charts/line-chart
              - listitem [ref=e512]:
                - link "PieChart" [ref=e513] [cursor=pointer]:
                  - /url: /docs/charts/pie-chart
              - listitem [ref=e515]:
                - link "ProgressRing" [ref=e516] [cursor=pointer]:
                  - /url: /docs/charts/progress-ring
              - listitem [ref=e518]:
                - link "Sparkline" [ref=e519] [cursor=pointer]:
                  - /url: /docs/charts/sparkline
        - article [ref=e521]:
          - generic [ref=e522]:
            - paragraph [ref=e523]: Data display
            - heading "Scheduler" [level=1] [ref=e524]
            - paragraph [ref=e525]: A resource scheduler — people, rooms or machines down the side, time across the top.
            - generic [ref=e526]:
              - generic "Declares 'use client'" [ref=e527]: Client component
              - link "Source" [ref=e528] [cursor=pointer]:
                - /url: https://github.com/intellectwithvivek/vivek_UI/tree/main/packages/ui/src/components/scheduler
          - generic [ref=e529]:
            - heading "Import" [level=2] [ref=e530]
            - generic [ref=e531]:
              - generic [ref=e532]:
                - radiogroup "Code language" [ref=e533]:
                  - radio "TS" [checked] [ref=e535] [cursor=pointer]
                  - radio "JS" [ref=e537] [cursor=pointer]
                - generic [ref=e539]:
                  - button "Copy" [ref=e540] [cursor=pointer]
                  - status [ref=e541]
              - code [ref=e543]: "import { Scheduler } from '@the_viveksingh/vivek-ui'"
          - generic [ref=e544]:
            - heading "A resource timeline nobody else gives you for free" [level=2] [ref=e545]
            - paragraph [ref=e546]: Rooms, people or machines down the side and time across the top. shadcn/ui, Mantine and Radix ship nothing like it, and MUI puts theirs behind a paid licence. Overlapping bookings stack into lanes so a double-booking is visible rather than hidden underneath.
            - generic [ref=e548]:
              - paragraph [ref=e549]: "Tab into the board and use the arrow keys: left and right walk this resource in time order, up and down jump to the nearest booking on the resource above or below. Every booking carries its resource, its times and its duration in its accessible name, because a timeline says all of that through position alone."
              - group "Studio bookings, 12 March" [ref=e550]:
                - generic [ref=e552]:
                  - generic [ref=e555]:
                    - generic: 09:00
                    - generic: 10:00
                    - generic: 11:00
                    - generic: 12:00
                    - generic: 13:00
                    - generic: 14:00
                    - generic: 15:00
                    - generic: 16:00
                    - generic: 17:00
                  - generic [ref=e556]:
                    - generic [ref=e557]:
                      - generic [ref=e558]: Studio A
                      - generic [ref=e559]: Ground floor · 12 seats
                    - list "Studio A" [ref=e560]:
                      - listitem:
                        - button "Standup. Studio A, 09:00 to 09:30, 30 minutes." [ref=e561] [cursor=pointer]:
                          - generic [ref=e562]: Standup
                          - generic [ref=e563]: 09:00–09:30
                      - listitem:
                        - button "Podcast · episode 41. Studio A, 10:00 to 12:30, 2 hours 30 minutes." [ref=e564] [cursor=pointer]:
                          - generic [ref=e565]: Podcast · episode 41
                          - generic [ref=e566]: 10:00–12:30
                      - listitem:
                        - button "Mic check. Studio A, 11:30 to 12:00, 30 minutes." [ref=e567] [cursor=pointer]:
                          - generic [ref=e568]: Mic check
                          - generic [ref=e569]: 11:30–12:00
                      - listitem:
                        - button "Client call. Studio A, 14:00 to 15:00, 1 hour." [ref=e570] [cursor=pointer]:
                          - generic [ref=e571]: Client call
                          - generic [ref=e572]: 14:00–15:00
                  - generic [ref=e573]:
                    - generic [ref=e574]:
                      - generic [ref=e575]: Studio B
                      - generic [ref=e576]: First floor · 6 seats
                    - list "Studio B" [ref=e577]:
                      - listitem:
                        - button "Voiceover. Studio B, 09:30 to 11:00, 1 hour 30 minutes." [ref=e578] [cursor=pointer]:
                          - generic [ref=e579]: Voiceover
                          - generic [ref=e580]: 09:30–11:00
                      - listitem:
                        - button "Maintenance. Studio B, 13:00 to 16:00, 3 hours." [ref=e581] [cursor=pointer]:
                          - generic [ref=e582]: Maintenance
                          - generic [ref=e583]: 13:00–16:00
                  - generic [ref=e584]:
                    - generic [ref=e585]:
                      - generic [ref=e586]: Edit suite 1
                      - generic [ref=e587]: Colour grade
                    - list "Edit suite 1" [ref=e588]:
                      - listitem:
                        - button "Grade · trailer. Edit suite 1, 09:00 to 13:00, 4 hours." [ref=e589] [cursor=pointer]:
                          - generic [ref=e590]: Grade · trailer
                          - generic [ref=e591]: 09:00–13:00
                      - listitem:
                        - button "Grade · spot. Edit suite 1, 13:30 to 17:00, 3 hours 30 minutes." [ref=e592] [cursor=pointer]:
                          - generic [ref=e593]: Grade · spot
                          - generic [ref=e594]: 13:30–17:00
                  - generic [ref=e595]:
                    - generic [ref=e596]: Edit suite 2
                    - list "Edit suite 2" [ref=e598]:
                      - listitem [ref=e599]: Nothing scheduled
              - paragraph [ref=e600]: Nothing selected yet. Click or press Enter on a booking.
            - generic [ref=e601]:
              - generic [ref=e602]:
                - radiogroup "Code language" [ref=e603]:
                  - radio "TS" [checked] [ref=e605] [cursor=pointer]
                  - radio "JS" [ref=e607] [cursor=pointer]
                - generic [ref=e609]:
                  - button "Copy" [ref=e610] [cursor=pointer]
                  - status [ref=e611]
              - code [ref=e613]: "const resources = [ { id: 'studio-a', label: 'Studio A', sublabel: 'Ground floor - 12 seats' }, { id: 'studio-b', label: 'Studio B' }, ] const events = [ { id: '1', resourceId: 'studio-a', title: 'Standup', start: at(9), end: at(9, 30) }, { id: '2', resourceId: 'studio-a', title: 'Podcast', start: at(10), end: at(12, 30), tone: 'accent' }, // Overlaps the podcast, so it is packed into a second lane instead of being hidden. { id: '3', resourceId: 'studio-a', title: 'Mic check', start: at(11, 30), end: at(12) }, { id: '4', resourceId: 'studio-b', title: 'Maintenance', start: at(13), end: at(16), tone: 'warning' }, ] <Scheduler resources={resources} events={events} label=\"Studio bookings, 12 March\" start={at(9)} end={at(18)} // Nothing is mutated for you - the board reports, your state decides. onSelect={(event) => setSelected(event)} />"
          - generic [ref=e614]:
            - heading "The keyboard model, which is the whole point" [level=2] [ref=e615]
            - paragraph [ref=e616]: "A timeline conveys everything through position, and position is invisible to a screen reader. So the board is one tab stop with a roving focus, and every booking carries its resource, its times and its duration in its accessible name: \"Podcast. Studio A, 10:00 to 12:30, 2 hours 30 minutes.\""
            - generic [ref=e618]:
              - paragraph [ref=e619]: "Tab into the board and use the arrow keys: left and right walk this resource in time order, up and down jump to the nearest booking on the resource above or below. Every booking carries its resource, its times and its duration in its accessible name, because a timeline says all of that through position alone."
              - group "Studio bookings, 12 March" [ref=e620]:
                - generic [ref=e622]:
                  - generic [ref=e625]:
                    - generic: 09:00
                    - generic: 10:00
                    - generic: 11:00
                    - generic: 12:00
                    - generic: 13:00
                    - generic: 14:00
                    - generic: 15:00
                    - generic: 16:00
                    - generic: 17:00
                  - generic [ref=e626]:
                    - generic [ref=e627]:
                      - generic [ref=e628]: Studio A
                      - generic [ref=e629]: Ground floor · 12 seats
                    - list "Studio A" [ref=e630]:
                      - listitem:
                        - button "Standup. Studio A, 09:00 to 09:30, 30 minutes." [ref=e631] [cursor=pointer]:
                          - generic [ref=e632]: Standup
                          - generic [ref=e633]: 09:00–09:30
                      - listitem:
                        - button "Podcast · episode 41. Studio A, 10:00 to 12:30, 2 hours 30 minutes." [ref=e634] [cursor=pointer]:
                          - generic [ref=e635]: Podcast · episode 41
                          - generic [ref=e636]: 10:00–12:30
                      - listitem:
                        - button "Mic check. Studio A, 11:30 to 12:00, 30 minutes." [ref=e637] [cursor=pointer]:
                          - generic [ref=e638]: Mic check
                          - generic [ref=e639]: 11:30–12:00
                      - listitem:
                        - button "Client call. Studio A, 14:00 to 15:00, 1 hour." [ref=e640] [cursor=pointer]:
                          - generic [ref=e641]: Client call
                          - generic [ref=e642]: 14:00–15:00
                  - generic [ref=e643]:
                    - generic [ref=e644]:
                      - generic [ref=e645]: Studio B
                      - generic [ref=e646]: First floor · 6 seats
                    - list "Studio B" [ref=e647]:
                      - listitem:
                        - button "Voiceover. Studio B, 09:30 to 11:00, 1 hour 30 minutes." [ref=e648] [cursor=pointer]:
                          - generic [ref=e649]: Voiceover
                          - generic [ref=e650]: 09:30–11:00
                      - listitem:
                        - button "Maintenance. Studio B, 13:00 to 16:00, 3 hours." [ref=e651] [cursor=pointer]:
                          - generic [ref=e652]: Maintenance
                          - generic [ref=e653]: 13:00–16:00
                  - generic [ref=e654]:
                    - generic [ref=e655]:
                      - generic [ref=e656]: Edit suite 1
                      - generic [ref=e657]: Colour grade
                    - list "Edit suite 1" [ref=e658]:
                      - listitem:
                        - button "Grade · trailer. Edit suite 1, 09:00 to 13:00, 4 hours." [ref=e659] [cursor=pointer]:
                          - generic [ref=e660]: Grade · trailer
                          - generic [ref=e661]: 09:00–13:00
                      - listitem:
                        - button "Grade · spot. Edit suite 1, 13:30 to 17:00, 3 hours 30 minutes." [ref=e662] [cursor=pointer]:
                          - generic [ref=e663]: Grade · spot
                          - generic [ref=e664]: 13:30–17:00
                  - generic [ref=e665]:
                    - generic [ref=e666]: Edit suite 2
                    - list "Edit suite 2" [ref=e668]:
                      - listitem [ref=e669]: Nothing scheduled
              - paragraph [ref=e670]: Nothing selected yet. Click or press Enter on a booking.
            - generic [ref=e671]:
              - generic [ref=e672]:
                - radiogroup "Code language" [ref=e673]:
                  - radio "TS" [checked] [ref=e675] [cursor=pointer]
                  - radio "JS" [ref=e677] [cursor=pointer]
                - generic [ref=e679]:
                  - button "Copy" [ref=e680] [cursor=pointer]
                  - status [ref=e681]
              - code [ref=e683]: "// Left / Right - previous / next booking for this resource, in time order // Up / Down - the nearest booking in time on the resource above / below // Home / End - first / last booking for this resource // Enter, Space - select // Empty resources are skipped by Up and Down: stopping on a row with nothing // in it reads as a dead key. <Scheduler resources={resources} events={events} label=\"Bookings\" />"
          - generic [ref=e684]:
            - heading "The current-time marker, and why it is opt-in" [level=2] [ref=e685]
            - paragraph [ref=e686]: "Reading the clock during render gives the server one marker position and the browser another, which React reports as a hydration mismatch. So the component never does it: showNow reads the clock in an effect after mount, and now takes an explicit time for tests and demos."
            - generic [ref=e688]:
              - paragraph [ref=e689]: "Tab into the board and use the arrow keys: left and right walk this resource in time order, up and down jump to the nearest booking on the resource above or below. Every booking carries its resource, its times and its duration in its accessible name, because a timeline says all of that through position alone."
              - group "Studio bookings, 12 March" [ref=e690]:
                - generic [ref=e692]:
                  - generic [ref=e695]:
                    - generic: 09:00
                    - generic: 10:00
                    - generic: 11:00
                    - generic: 12:00
                    - generic: 13:00
                    - generic: 14:00
                    - generic: 15:00
                    - generic: 16:00
                    - generic: 17:00
                  - generic [ref=e696]:
                    - generic [ref=e697]:
                      - generic [ref=e698]: Studio A
                      - generic [ref=e699]: Ground floor · 12 seats
                    - list "Studio A" [ref=e700]:
                      - listitem:
                        - button "Standup. Studio A, 09:00 to 09:30, 30 minutes." [ref=e701] [cursor=pointer]:
                          - generic [ref=e702]: Standup
                          - generic [ref=e703]: 09:00–09:30
                      - listitem:
                        - button "Podcast · episode 41. Studio A, 10:00 to 12:30, 2 hours 30 minutes." [ref=e704] [cursor=pointer]:
                          - generic [ref=e705]: Podcast · episode 41
                          - generic [ref=e706]: 10:00–12:30
                      - listitem:
                        - button "Mic check. Studio A, 11:30 to 12:00, 30 minutes." [ref=e707] [cursor=pointer]:
                          - generic [ref=e708]: Mic check
                          - generic [ref=e709]: 11:30–12:00
                      - listitem:
                        - button "Client call. Studio A, 14:00 to 15:00, 1 hour." [ref=e710] [cursor=pointer]:
                          - generic [ref=e711]: Client call
                          - generic [ref=e712]: 14:00–15:00
                  - generic [ref=e713]:
                    - generic [ref=e714]:
                      - generic [ref=e715]: Studio B
                      - generic [ref=e716]: First floor · 6 seats
                    - list "Studio B" [ref=e717]:
                      - listitem:
                        - button "Voiceover. Studio B, 09:30 to 11:00, 1 hour 30 minutes." [ref=e718] [cursor=pointer]:
                          - generic [ref=e719]: Voiceover
                          - generic [ref=e720]: 09:30–11:00
                      - listitem:
                        - button "Maintenance. Studio B, 13:00 to 16:00, 3 hours." [ref=e721] [cursor=pointer]:
                          - generic [ref=e722]: Maintenance
                          - generic [ref=e723]: 13:00–16:00
                  - generic [ref=e724]:
                    - generic [ref=e725]:
                      - generic [ref=e726]: Edit suite 1
                      - generic [ref=e727]: Colour grade
                    - list "Edit suite 1" [ref=e728]:
                      - listitem:
                        - button "Grade · trailer. Edit suite 1, 09:00 to 13:00, 4 hours." [ref=e729] [cursor=pointer]:
                          - generic [ref=e730]: Grade · trailer
                          - generic [ref=e731]: 09:00–13:00
                      - listitem:
                        - button "Grade · spot. Edit suite 1, 13:30 to 17:00, 3 hours 30 minutes." [ref=e732] [cursor=pointer]:
                          - generic [ref=e733]: Grade · spot
                          - generic [ref=e734]: 13:30–17:00
                  - generic [ref=e735]:
                    - generic [ref=e736]: Edit suite 2
                    - list "Edit suite 2" [ref=e738]:
                      - listitem [ref=e739]: Nothing scheduled
              - paragraph [ref=e740]: Nothing selected yet. Click or press Enter on a booking.
            - generic [ref=e741]:
              - generic [ref=e742]:
                - radiogroup "Code language" [ref=e743]:
                  - radio "TS" [checked] [ref=e745] [cursor=pointer]
                  - radio "JS" [ref=e747] [cursor=pointer]
                - generic [ref=e749]:
                  - button "Copy" [ref=e750] [cursor=pointer]
                  - status [ref=e751]
              - code [ref=e753]: "// Reads the clock after mount, then ticks once a minute. <Scheduler resources={resources} events={events} label=\"Today\" showNow /> // Or pin it, which is what the demo above does so the docs never shift. <Scheduler resources={resources} events={events} label=\"Today\" now={at(13, 20)} /> // Times are written by a deterministic HH:MM formatter rather than // Intl.DateTimeFormat, whose output varies between Node builds and browsers. // Pass your own for a 12-hour clock: <Scheduler resources={resources} events={events} label=\"Today\" formatTime={(d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} />"
          - separator [ref=e754]
          - generic [ref=e755]:
            - heading "Props" [level=2] [ref=e756]
            - paragraph [ref=e757]: Generated from the package's own type declarations, so this table cannot drift from the code.
            - table [ref=e759]:
              - caption [ref=e760]: Props for Scheduler
              - rowgroup [ref=e761]:
                - row [ref=e762]:
                  - columnheader "Prop" [ref=e763]
                  - columnheader "Type" [ref=e764]
                  - columnheader "Default" [ref=e765]
                  - columnheader "Description" [ref=e766]
              - rowgroup [ref=e767]:
                - row [ref=e768]:
                  - cell "resources required" [ref=e769]:
                    - code [ref=e770]: resources
                    - generic [ref=e771]: required
                  - cell [ref=e772]:
                    - code [ref=e773]: readonly SchedulerResource[]
                  - cell "—" [ref=e774]
                  - cell "—" [ref=e775]
                - row [ref=e776]:
                  - cell "events required" [ref=e777]:
                    - code [ref=e778]: events
                    - generic [ref=e779]: required
                  - cell [ref=e780]:
                    - code [ref=e781]: readonly SchedulerEvent[]
                  - cell "—" [ref=e782]
                  - cell "—" [ref=e783]
                - row [ref=e784]:
                  - cell "label required" [ref=e785]:
                    - code [ref=e786]: label
                    - generic [ref=e787]: required
                  - cell [ref=e788]:
                    - code [ref=e789]: string
                  - cell "—" [ref=e790]
                  - cell "Required. A timeline with no accessible name is one more unlabelled region." [ref=e791]
                - row [ref=e792]:
                  - cell [ref=e793]:
                    - code [ref=e794]: start
                  - cell [ref=e795]:
                    - code [ref=e796]: Date | number
                  - cell "—" [ref=e797]
                  - cell "Window start. Defaults to the earliest event, floored to the step." [ref=e798]
                - row [ref=e799]:
                  - cell [ref=e800]:
                    - code [ref=e801]: end
                  - cell [ref=e802]:
                    - code [ref=e803]: Date | number
                  - cell "—" [ref=e804]
                  - cell "Window end. Defaults to the latest event, ceiled to the step." [ref=e805]
                - row [ref=e806]:
                  - cell [ref=e807]:
                    - code [ref=e808]: step
                  - cell [ref=e809]:
                    - code [ref=e810]: number
                  - cell "—" [ref=e811]
                  - cell "Minutes between axis ticks. Default 60." [ref=e812]
                - row [ref=e813]:
                  - cell [ref=e814]:
                    - code [ref=e815]: minTickWidth
                  - cell [ref=e816]:
                    - code [ref=e817]: number
                  - cell "—" [ref=e818]
                  - cell "Minimum pixels per tick. Below this the timeline scrolls rather than crushing." [ref=e819]
                - row [ref=e820]:
                  - cell [ref=e821]:
                    - code [ref=e822]: showNow
                  - cell [ref=e823]:
                    - code [ref=e824]: boolean
                  - cell "—" [ref=e825]
                  - cell "Draw the current-time marker. Left to itself this component never reads the clock during render — that would produce a different marker on the server and the client, which React reports as a hydration mismatch. The clock is read in an effect, after mount." [ref=e826]
                - row [ref=e827]:
                  - cell [ref=e828]:
                    - code [ref=e829]: now
                  - cell [ref=e830]:
                    - code [ref=e831]: Date | number
                  - cell "—" [ref=e832]
                  - 'cell "An explicit \"now\", which overrides {@link showNow}''s clock. Useful in tests and demos." [ref=e833]'
                - row [ref=e834]:
                  - cell [ref=e835]:
                    - code [ref=e836]: onSelect
                  - cell [ref=e837]:
                    - code [ref=e838]: "(event: SchedulerEvent) => void"
                  - cell "—" [ref=e839]
                  - cell "—" [ref=e840]
                - row [ref=e841]:
                  - cell [ref=e842]:
                    - code [ref=e843]: renderEvent
                  - cell [ref=e844]:
                    - code [ref=e845]: "(event: SchedulerEvent, resource: SchedulerResource) => ReactNode"
                  - cell "—" [ref=e846]
                  - cell "Rendered instead of the default title + time. The wrapper button stays ours." [ref=e847]
                - row [ref=e848]:
                  - cell [ref=e849]:
                    - code [ref=e850]: formatTime
                  - cell [ref=e851]:
                    - code [ref=e852]: "(value: Date) => string"
                  - cell "—" [ref=e853]
                  - 'cell "How a time is written, in the axis and in every accessible name. The default is a deterministic 24-hour `HH:MM` rather than `Intl.DateTimeFormat`, because ICU output varies between Node builds and browsers — the same code would render differently for two of your users. Pass your own for 12-hour clocks or other locales." [ref=e854]'
            - status [ref=e855]:
              - paragraph [ref=e858]:
                - text: Every remaining prop is spread onto the root element, so all standard HTML and ARIA attributes work.
                - code [ref=e859]: className
                - text: and
                - code [ref=e860]: style
                - text: are merged with the library's own, never replaced, and the ref forwards to the root DOM node.
          - generic [ref=e861]:
            - heading "Rendering" [level=2] [ref=e862]
            - alert [ref=e863]:
              - generic [ref=e864]: "!"
              - generic [ref=e865]:
                - generic [ref=e866]: Client component
                - paragraph [ref=e868]:
                  - code [ref=e869]: Scheduler
                  - text: declares
                  - code [ref=e870]: "'use client'"
                  - text: because it needs state, effects or event handlers. Importing it into a Server Component creates a client boundary at this component — everything above it stays on the server.
          - separator [ref=e871]
          - navigation "Adjacent components" [ref=e872]:
            - link "← Kanban board" [ref=e873] [cursor=pointer]:
              - /url: /docs/components/kanban-board
            - link "Stepper →" [ref=e874] [cursor=pointer]:
              - /url: /docs/components/stepper
  - alert [ref=e875]
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