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
                - link "Infinite scroll c" [ref=e119] [cursor=pointer]:
                  - /url: /docs/components/infinite-scroll
                  - generic [ref=e120]: Infinite scroll
                  - generic "Client component" [ref=e122]: c
              - listitem [ref=e123]:
                - link "Scroll area" [ref=e124] [cursor=pointer]:
                  - /url: /docs/components/scroll-area
              - listitem [ref=e126]:
                - link "Section" [ref=e127] [cursor=pointer]:
                  - /url: /docs/components/section
              - listitem [ref=e129]:
                - link "Stack" [ref=e130] [cursor=pointer]:
                  - /url: /docs/components/stack
          - generic [ref=e132]:
            - generic [ref=e133]: Typography
            - list "Typography" [ref=e134]:
              - listitem [ref=e135]:
                - link "Code" [ref=e136] [cursor=pointer]:
                  - /url: /docs/components/code
              - listitem [ref=e138]:
                - link "Heading" [ref=e139] [cursor=pointer]:
                  - /url: /docs/components/heading
              - listitem [ref=e141]:
                - link "Kbd" [ref=e142] [cursor=pointer]:
                  - /url: /docs/components/kbd
              - listitem [ref=e144]:
                - link "Prose" [ref=e145] [cursor=pointer]:
                  - /url: /docs/components/prose
              - listitem [ref=e147]:
                - link "Text" [ref=e148] [cursor=pointer]:
                  - /url: /docs/components/text
          - generic [ref=e150]:
            - generic [ref=e151]: Actions
            - list "Actions" [ref=e152]:
              - listitem [ref=e153]:
                - link "Button" [ref=e154] [cursor=pointer]:
                  - /url: /docs/components/button
              - listitem [ref=e156]:
                - link "Button group" [ref=e157] [cursor=pointer]:
                  - /url: /docs/components/button-group
              - listitem [ref=e159]:
                - link "Copy button c" [ref=e160] [cursor=pointer]:
                  - /url: /docs/components/copy-button
                  - generic [ref=e161]: Copy button
                  - generic "Client component" [ref=e163]: c
              - listitem [ref=e164]:
                - link "Icon button" [ref=e165] [cursor=pointer]:
                  - /url: /docs/components/icon-button
          - generic [ref=e167]:
            - generic [ref=e168]: Forms
            - list "Forms" [ref=e169]:
              - listitem [ref=e170]:
                - link "Calendar c" [ref=e171] [cursor=pointer]:
                  - /url: /docs/components/calendar
                  - generic [ref=e172]: Calendar
                  - generic "Client component" [ref=e174]: c
              - listitem [ref=e175]:
                - link "Checkbox" [ref=e176] [cursor=pointer]:
                  - /url: /docs/components/checkbox
              - listitem [ref=e178]:
                - link "Chip c" [ref=e179] [cursor=pointer]:
                  - /url: /docs/components/chip
                  - generic [ref=e180]: Chip
                  - generic "Client component" [ref=e182]: c
              - listitem [ref=e183]:
                - link "Combobox c" [ref=e184] [cursor=pointer]:
                  - /url: /docs/components/combobox
                  - generic [ref=e185]: Combobox
                  - generic "Client component" [ref=e187]: c
              - listitem [ref=e188]:
                - link "Date picker c" [ref=e189] [cursor=pointer]:
                  - /url: /docs/components/date-picker
                  - generic [ref=e190]: Date picker
                  - generic "Client component" [ref=e192]: c
              - listitem [ref=e193]:
                - link "Field c" [ref=e194] [cursor=pointer]:
                  - /url: /docs/components/field
                  - generic [ref=e195]: Field
                  - generic "Client component" [ref=e197]: c
              - listitem [ref=e198]:
                - link "File upload c" [ref=e199] [cursor=pointer]:
                  - /url: /docs/components/file-upload
                  - generic [ref=e200]: File upload
                  - generic "Client component" [ref=e202]: c
              - listitem [ref=e203]:
                - link "Form c" [ref=e204] [cursor=pointer]:
                  - /url: /docs/components/form
                  - generic [ref=e205]: Form
                  - generic "Client component" [ref=e207]: c
              - listitem [ref=e208]:
                - link "Input" [ref=e209] [cursor=pointer]:
                  - /url: /docs/components/input
              - listitem [ref=e211]:
                - link "Label" [ref=e212] [cursor=pointer]:
                  - /url: /docs/components/label
              - listitem [ref=e214]:
                - link "Number input c" [ref=e215] [cursor=pointer]:
                  - /url: /docs/components/number-input
                  - generic [ref=e216]: Number input
                  - generic "Client component" [ref=e218]: c
              - listitem [ref=e219]:
                - link "Otp input c" [ref=e220] [cursor=pointer]:
                  - /url: /docs/components/otp-input
                  - generic [ref=e221]: Otp input
                  - generic "Client component" [ref=e223]: c
              - listitem [ref=e224]:
                - link "Password input c" [ref=e225] [cursor=pointer]:
                  - /url: /docs/components/password-input
                  - generic [ref=e226]: Password input
                  - generic "Client component" [ref=e228]: c
              - listitem [ref=e229]:
                - link "Radio group" [ref=e230] [cursor=pointer]:
                  - /url: /docs/components/radio-group
              - listitem [ref=e232]:
                - link "Rating c" [ref=e233] [cursor=pointer]:
                  - /url: /docs/components/rating
                  - generic [ref=e234]: Rating
                  - generic "Client component" [ref=e236]: c
              - listitem [ref=e237]:
                - link "Segmented c" [ref=e238] [cursor=pointer]:
                  - /url: /docs/components/segmented
                  - generic [ref=e239]: Segmented
                  - generic "Client component" [ref=e241]: c
              - listitem [ref=e242]:
                - link "Select" [ref=e243] [cursor=pointer]:
                  - /url: /docs/components/select
              - listitem [ref=e245]:
                - link "Slider c" [ref=e246] [cursor=pointer]:
                  - /url: /docs/components/slider
                  - generic [ref=e247]: Slider
                  - generic "Client component" [ref=e249]: c
              - listitem [ref=e250]:
                - link "Switch" [ref=e251] [cursor=pointer]:
                  - /url: /docs/components/switch
              - listitem [ref=e253]:
                - link "Tag input c" [ref=e254] [cursor=pointer]:
                  - /url: /docs/components/tag-input
                  - generic [ref=e255]: Tag input
                  - generic "Client component" [ref=e257]: c
              - listitem [ref=e258]:
                - link "Textarea" [ref=e259] [cursor=pointer]:
                  - /url: /docs/components/textarea
          - generic [ref=e261]:
            - generic [ref=e262]: Overlays
            - list "Overlays" [ref=e263]:
              - listitem [ref=e264]:
                - link "Accordion c" [ref=e265] [cursor=pointer]:
                  - /url: /docs/components/accordion
                  - generic [ref=e266]: Accordion
                  - generic "Client component" [ref=e268]: c
              - listitem [ref=e269]:
                - link "Drawer c" [ref=e270] [cursor=pointer]:
                  - /url: /docs/components/drawer
                  - generic [ref=e271]: Drawer
                  - generic "Client component" [ref=e273]: c
              - listitem [ref=e274]:
                - link "Dropdown menu c" [ref=e275] [cursor=pointer]:
                  - /url: /docs/components/dropdown-menu
                  - generic [ref=e276]: Dropdown menu
                  - generic "Client component" [ref=e278]: c
              - listitem [ref=e279]:
                - link "Hover card c" [ref=e280] [cursor=pointer]:
                  - /url: /docs/components/hover-card
                  - generic [ref=e281]: Hover card
                  - generic "Client component" [ref=e283]: c
              - listitem [ref=e284]:
                - link "Modal c" [ref=e285] [cursor=pointer]:
                  - /url: /docs/components/modal
                  - generic [ref=e286]: Modal
                  - generic "Client component" [ref=e288]: c
              - listitem [ref=e289]:
                - link "Popover c" [ref=e290] [cursor=pointer]:
                  - /url: /docs/components/popover
                  - generic [ref=e291]: Popover
                  - generic "Client component" [ref=e293]: c
              - listitem [ref=e294]:
                - link "Portal c" [ref=e295] [cursor=pointer]:
                  - /url: /docs/components/portal
                  - generic [ref=e296]: Portal
                  - generic "Client component" [ref=e298]: c
              - listitem [ref=e299]:
                - link "Tabs c" [ref=e300] [cursor=pointer]:
                  - /url: /docs/components/tabs
                  - generic [ref=e301]: Tabs
                  - generic "Client component" [ref=e303]: c
              - listitem [ref=e304]:
                - link "Toast" [ref=e305] [cursor=pointer]:
                  - /url: /docs/components/toast
              - listitem [ref=e307]:
                - link "Tooltip c" [ref=e308] [cursor=pointer]:
                  - /url: /docs/components/tooltip
                  - generic [ref=e309]: Tooltip
                  - generic "Client component" [ref=e311]: c
          - generic [ref=e312]:
            - generic [ref=e313]: Navigation
            - list "Navigation" [ref=e314]:
              - listitem [ref=e315]:
                - link "Breadcrumb" [ref=e316] [cursor=pointer]:
                  - /url: /docs/components/breadcrumb
              - listitem [ref=e318]:
                - link "Command palette c" [ref=e319] [cursor=pointer]:
                  - /url: /docs/components/command-palette
                  - generic [ref=e320]: Command palette
                  - generic "Client component" [ref=e322]: c
              - listitem [ref=e323]:
                - link "Navbar c" [ref=e324] [cursor=pointer]:
                  - /url: /docs/components/navbar
                  - generic [ref=e325]: Navbar
                  - generic "Client component" [ref=e327]: c
              - listitem [ref=e328]:
                - link "Pagination c" [ref=e329] [cursor=pointer]:
                  - /url: /docs/components/pagination
                  - generic [ref=e330]: Pagination
                  - generic "Client component" [ref=e332]: c
              - listitem [ref=e333]:
                - link "Sidebar c" [ref=e334] [cursor=pointer]:
                  - /url: /docs/components/sidebar
                  - generic [ref=e335]: Sidebar
                  - generic "Client component" [ref=e337]: c
          - generic [ref=e338]:
            - generic [ref=e339]: Data display
            - list "Data display" [ref=e340]:
              - listitem [ref=e341]:
                - link "Avatar" [ref=e342] [cursor=pointer]:
                  - /url: /docs/components/avatar
              - listitem [ref=e344]:
                - link "Badge" [ref=e345] [cursor=pointer]:
                  - /url: /docs/components/badge
              - listitem [ref=e347]:
                - link "Card" [ref=e348] [cursor=pointer]:
                  - /url: /docs/components/card
              - listitem [ref=e350]:
                - link "Data table c" [ref=e351] [cursor=pointer]:
                  - /url: /docs/components/data-table
                  - generic [ref=e352]: Data table
                  - generic "Client component" [ref=e354]: c
              - listitem [ref=e355]:
                - link "Editable grid c" [ref=e356] [cursor=pointer]:
                  - /url: /docs/components/editable-grid
                  - generic [ref=e357]: Editable grid
                  - generic "Client component" [ref=e359]: c
              - listitem [ref=e360]:
                - link "File tree c" [ref=e361] [cursor=pointer]:
                  - /url: /docs/components/file-tree
                  - generic [ref=e362]: File tree
                  - generic "Client component" [ref=e364]: c
              - listitem [ref=e365]:
                - link "Kanban board c" [ref=e366] [cursor=pointer]:
                  - /url: /docs/components/kanban-board
                  - generic [ref=e367]: Kanban board
                  - generic "Client component" [ref=e369]: c
              - listitem [ref=e370]:
                - link "Scheduler c" [ref=e371] [cursor=pointer]:
                  - /url: /docs/components/scheduler
                  - generic [ref=e372]: Scheduler
                  - generic "Client component" [ref=e374]: c
              - listitem [ref=e375]:
                - link "Stepper c" [ref=e376] [cursor=pointer]:
                  - /url: /docs/components/stepper
                  - generic [ref=e377]: Stepper
                  - generic "Client component" [ref=e379]: c
              - listitem [ref=e380]:
                - link "Table" [ref=e381] [cursor=pointer]:
                  - /url: /docs/components/table
              - listitem [ref=e383]:
                - link "Timeline" [ref=e384] [cursor=pointer]:
                  - /url: /docs/components/timeline
              - listitem [ref=e386]:
                - link "Virtual list c" [ref=e387] [cursor=pointer]:
                  - /url: /docs/components/virtual-list
                  - generic [ref=e388]: Virtual list
                  - generic "Client component" [ref=e390]: c
          - generic [ref=e391]:
            - generic [ref=e392]: AI chat
            - list "AI chat" [ref=e393]:
              - listitem [ref=e394]:
                - link "Chat code block c" [ref=e395] [cursor=pointer]:
                  - /url: /docs/components/chat-code-block
                  - generic [ref=e396]: Chat code block
                  - generic "Client component" [ref=e398]: c
              - listitem [ref=e399]:
                - link "Chat input c" [ref=e400] [cursor=pointer]:
                  - /url: /docs/components/chat-input
                  - generic [ref=e401]: Chat input
                  - generic "Client component" [ref=e403]: c
              - listitem [ref=e404]:
                - link "Chat message" [ref=e405] [cursor=pointer]:
                  - /url: /docs/components/chat-message
              - listitem [ref=e407]:
                - link "Chat thread c" [ref=e408] [cursor=pointer]:
                  - /url: /docs/components/chat-thread
                  - generic [ref=e409]: Chat thread
                  - generic "Client component" [ref=e411]: c
              - listitem [ref=e412]:
                - link "Typing indicator" [ref=e413] [cursor=pointer]:
                  - /url: /docs/components/typing-indicator
          - generic [ref=e415]:
            - generic [ref=e416]: Feedback
            - list "Feedback" [ref=e417]:
              - listitem [ref=e418]:
                - link "Alert" [ref=e419] [cursor=pointer]:
                  - /url: /docs/components/alert
              - listitem [ref=e421]:
                - link "Empty state" [ref=e422] [cursor=pointer]:
                  - /url: /docs/components/empty-state
              - listitem [ref=e424]:
                - link "Progress" [ref=e425] [cursor=pointer]:
                  - /url: /docs/components/progress
              - listitem [ref=e427]:
                - link "Skeleton" [ref=e428] [cursor=pointer]:
                  - /url: /docs/components/skeleton
              - listitem [ref=e430]:
                - link "Spinner" [ref=e431] [cursor=pointer]:
                  - /url: /docs/components/spinner
          - generic [ref=e433]:
            - generic [ref=e434]: Sections
            - list "Sections" [ref=e435]:
              - listitem [ref=e436]:
                - link "Cta" [ref=e437] [cursor=pointer]:
                  - /url: /docs/components/cta
              - listitem [ref=e439]:
                - link "Faq" [ref=e440] [cursor=pointer]:
                  - /url: /docs/components/faq
              - listitem [ref=e442]:
                - link "Feature grid" [ref=e443] [cursor=pointer]:
                  - /url: /docs/components/feature-grid
              - listitem [ref=e445]:
                - link "Footer" [ref=e446] [cursor=pointer]:
                  - /url: /docs/components/footer
              - listitem [ref=e448]:
                - link "Hero" [ref=e449] [cursor=pointer]:
                  - /url: /docs/components/hero
              - listitem [ref=e451]:
                - link "Logo cloud" [ref=e452] [cursor=pointer]:
                  - /url: /docs/components/logo-cloud
              - listitem [ref=e454]:
                - link "Newsletter c" [ref=e455] [cursor=pointer]:
                  - /url: /docs/components/newsletter
                  - generic [ref=e456]: Newsletter
                  - generic "Client component" [ref=e458]: c
              - listitem [ref=e459]:
                - link "Pricing" [ref=e460] [cursor=pointer]:
                  - /url: /docs/components/pricing
              - listitem [ref=e462]:
                - link "Stats" [ref=e463] [cursor=pointer]:
                  - /url: /docs/components/stats
              - listitem [ref=e465]:
                - link "Testimonials" [ref=e466] [cursor=pointer]:
                  - /url: /docs/components/testimonials
          - generic [ref=e468]:
            - generic [ref=e469]: Media & time
            - list "Media & time" [ref=e470]:
              - listitem [ref=e471]:
                - link "Animated counter c" [ref=e472] [cursor=pointer]:
                  - /url: /docs/components/animated-counter
                  - generic [ref=e473]: Animated counter
                  - generic "Client component" [ref=e475]: c
              - listitem [ref=e476]:
                - link "Carousel" [ref=e477] [cursor=pointer]:
                  - /url: /docs/components/carousel
              - listitem [ref=e479]:
                - link "Clock c" [ref=e480] [cursor=pointer]:
                  - /url: /docs/components/clock
                  - generic [ref=e481]: Clock
                  - generic "Client component" [ref=e483]: c
              - listitem [ref=e484]:
                - link "Countdown c" [ref=e485] [cursor=pointer]:
                  - /url: /docs/components/countdown
                  - generic [ref=e486]: Countdown
                  - generic "Client component" [ref=e488]: c
              - listitem [ref=e489]:
                - link "Image c" [ref=e490] [cursor=pointer]:
                  - /url: /docs/components/image
                  - generic [ref=e491]: Image
                  - generic "Client component" [ref=e493]: c
              - listitem [ref=e494]:
                - link "Map embed c" [ref=e495] [cursor=pointer]:
                  - /url: /docs/components/map-embed
                  - generic [ref=e496]: Map embed
                  - generic "Client component" [ref=e498]: c
              - listitem [ref=e499]:
                - link "Marquee" [ref=e500] [cursor=pointer]:
                  - /url: /docs/components/marquee
              - listitem [ref=e502]:
                - link "Relative time c" [ref=e503] [cursor=pointer]:
                  - /url: /docs/components/relative-time
                  - generic [ref=e504]: Relative time
                  - generic "Client component" [ref=e506]: c
          - generic [ref=e507]:
            - generic [ref=e508]: Theming
            - list "Theming" [ref=e509]:
              - listitem [ref=e510]:
                - link "Theme provider c" [ref=e511] [cursor=pointer]:
                  - /url: /docs/components/theme-provider
                  - generic [ref=e512]: Theme provider
                  - generic "Client component" [ref=e514]: c
              - listitem [ref=e515]:
                - link "Theme toggle c" [ref=e516] [cursor=pointer]:
                  - /url: /docs/components/theme-toggle
                  - generic [ref=e517]: Theme toggle
                  - generic "Client component" [ref=e519]: c
          - generic [ref=e520]:
            - generic [ref=e521]: Charts
            - list "Charts" [ref=e522]:
              - listitem [ref=e523]:
                - link "AreaChart" [ref=e524] [cursor=pointer]:
                  - /url: /docs/charts/area-chart
              - listitem [ref=e526]:
                - link "BarChart" [ref=e527] [cursor=pointer]:
                  - /url: /docs/charts/bar-chart
              - listitem [ref=e529]:
                - link "Gauge" [ref=e530] [cursor=pointer]:
                  - /url: /docs/charts/gauge
              - listitem [ref=e532]:
                - link "Heatmap" [ref=e533] [cursor=pointer]:
                  - /url: /docs/charts/heatmap
              - listitem [ref=e535]:
                - link "LineChart" [ref=e536] [cursor=pointer]:
                  - /url: /docs/charts/line-chart
              - listitem [ref=e538]:
                - link "PieChart" [ref=e539] [cursor=pointer]:
                  - /url: /docs/charts/pie-chart
              - listitem [ref=e541]:
                - link "ProgressRing" [ref=e542] [cursor=pointer]:
                  - /url: /docs/charts/progress-ring
              - listitem [ref=e544]:
                - link "RadarChart" [ref=e545] [cursor=pointer]:
                  - /url: /docs/charts/radar-chart
              - listitem [ref=e547]:
                - link "ScatterChart" [ref=e548] [cursor=pointer]:
                  - /url: /docs/charts/scatter-chart
              - listitem [ref=e550]:
                - link "Sparkline" [ref=e551] [cursor=pointer]:
                  - /url: /docs/charts/sparkline
        - article [ref=e553]:
          - generic [ref=e554]:
            - paragraph [ref=e555]: Data display
            - heading "Scheduler" [level=1] [ref=e556]
            - paragraph [ref=e557]: A resource scheduler — people, rooms or machines down the side, time across the top.
            - generic [ref=e558]:
              - generic "Declares 'use client'" [ref=e559]: Client component
              - link "Source" [ref=e560] [cursor=pointer]:
                - /url: https://github.com/intellectwithvivek/vivek_UI/tree/main/packages/ui/src/components/scheduler
          - generic [ref=e561]:
            - heading "Import" [level=2] [ref=e562]
            - generic [ref=e563]:
              - generic [ref=e564]:
                - radiogroup "Code language" [ref=e565]:
                  - radio "TS" [checked] [ref=e567] [cursor=pointer]
                  - radio "JS" [ref=e569] [cursor=pointer]
                - generic [ref=e571]:
                  - button "Copy" [ref=e572] [cursor=pointer]
                  - status [ref=e573]
              - code [ref=e575]: "import { Scheduler } from '@the_viveksingh/vivek-ui'"
          - generic [ref=e576]:
            - heading "A resource timeline nobody else gives you for free" [level=2] [ref=e577]
            - paragraph [ref=e578]: Rooms, people or machines down the side and time across the top. shadcn/ui, Mantine and Radix ship nothing like it, and MUI puts theirs behind a paid licence. Overlapping bookings stack into lanes so a double-booking is visible rather than hidden underneath.
            - generic [ref=e580]:
              - paragraph [ref=e581]: "Tab into the board and use the arrow keys: left and right walk this resource in time order, up and down jump to the nearest booking on the resource above or below. Every booking carries its resource, its times and its duration in its accessible name, because a timeline says all of that through position alone."
              - group "Studio bookings, 12 March" [ref=e582]:
                - generic [ref=e584]:
                  - generic [ref=e587]:
                    - generic: 09:00
                    - generic: 10:00
                    - generic: 11:00
                    - generic: 12:00
                    - generic: 13:00
                    - generic: 14:00
                    - generic: 15:00
                    - generic: 16:00
                    - generic: 17:00
                  - generic [ref=e588]:
                    - generic [ref=e589]:
                      - generic [ref=e590]: Studio A
                      - generic [ref=e591]: Ground floor · 12 seats
                    - list "Studio A" [ref=e592]:
                      - listitem:
                        - button "Standup. Studio A, 09:00 to 09:30, 30 minutes." [ref=e593] [cursor=pointer]:
                          - generic [ref=e594]: Standup
                          - generic [ref=e595]: 09:00–09:30
                      - listitem:
                        - button "Podcast · episode 41. Studio A, 10:00 to 12:30, 2 hours 30 minutes." [ref=e596] [cursor=pointer]:
                          - generic [ref=e597]: Podcast · episode 41
                          - generic [ref=e598]: 10:00–12:30
                      - listitem:
                        - button "Mic check. Studio A, 11:30 to 12:00, 30 minutes." [ref=e599] [cursor=pointer]:
                          - generic [ref=e600]: Mic check
                          - generic [ref=e601]: 11:30–12:00
                      - listitem:
                        - button "Client call. Studio A, 14:00 to 15:00, 1 hour." [ref=e602] [cursor=pointer]:
                          - generic [ref=e603]: Client call
                          - generic [ref=e604]: 14:00–15:00
                  - generic [ref=e605]:
                    - generic [ref=e606]:
                      - generic [ref=e607]: Studio B
                      - generic [ref=e608]: First floor · 6 seats
                    - list "Studio B" [ref=e609]:
                      - listitem:
                        - button "Voiceover. Studio B, 09:30 to 11:00, 1 hour 30 minutes." [ref=e610] [cursor=pointer]:
                          - generic [ref=e611]: Voiceover
                          - generic [ref=e612]: 09:30–11:00
                      - listitem:
                        - button "Maintenance. Studio B, 13:00 to 16:00, 3 hours." [ref=e613] [cursor=pointer]:
                          - generic [ref=e614]: Maintenance
                          - generic [ref=e615]: 13:00–16:00
                  - generic [ref=e616]:
                    - generic [ref=e617]:
                      - generic [ref=e618]: Edit suite 1
                      - generic [ref=e619]: Colour grade
                    - list "Edit suite 1" [ref=e620]:
                      - listitem:
                        - button "Grade · trailer. Edit suite 1, 09:00 to 13:00, 4 hours." [ref=e621] [cursor=pointer]:
                          - generic [ref=e622]: Grade · trailer
                          - generic [ref=e623]: 09:00–13:00
                      - listitem:
                        - button "Grade · spot. Edit suite 1, 13:30 to 17:00, 3 hours 30 minutes." [ref=e624] [cursor=pointer]:
                          - generic [ref=e625]: Grade · spot
                          - generic [ref=e626]: 13:30–17:00
                  - generic [ref=e627]:
                    - generic [ref=e628]: Edit suite 2
                    - list "Edit suite 2" [ref=e630]:
                      - listitem [ref=e631]: Nothing scheduled
              - paragraph [ref=e632]: Nothing selected yet. Click or press Enter on a booking.
            - generic [ref=e633]:
              - generic [ref=e634]:
                - radiogroup "Code language" [ref=e635]:
                  - radio "TS" [checked] [ref=e637] [cursor=pointer]
                  - radio "JS" [ref=e639] [cursor=pointer]
                - generic [ref=e641]:
                  - button "Copy" [ref=e642] [cursor=pointer]
                  - status [ref=e643]
              - code [ref=e645]: "const resources = [ { id: 'studio-a', label: 'Studio A', sublabel: 'Ground floor - 12 seats' }, { id: 'studio-b', label: 'Studio B' }, ] const events = [ { id: '1', resourceId: 'studio-a', title: 'Standup', start: at(9), end: at(9, 30) }, { id: '2', resourceId: 'studio-a', title: 'Podcast', start: at(10), end: at(12, 30), tone: 'accent' }, // Overlaps the podcast, so it is packed into a second lane instead of being hidden. { id: '3', resourceId: 'studio-a', title: 'Mic check', start: at(11, 30), end: at(12) }, { id: '4', resourceId: 'studio-b', title: 'Maintenance', start: at(13), end: at(16), tone: 'warning' }, ] <Scheduler resources={resources} events={events} label=\"Studio bookings, 12 March\" start={at(9)} end={at(18)} // Nothing is mutated for you - the board reports, your state decides. onSelect={(event) => setSelected(event)} />"
          - generic [ref=e646]:
            - heading "The keyboard model, which is the whole point" [level=2] [ref=e647]
            - paragraph [ref=e648]: "A timeline conveys everything through position, and position is invisible to a screen reader. So the board is one tab stop with a roving focus, and every booking carries its resource, its times and its duration in its accessible name: \"Podcast. Studio A, 10:00 to 12:30, 2 hours 30 minutes.\""
            - generic [ref=e650]:
              - paragraph [ref=e651]: "Tab into the board and use the arrow keys: left and right walk this resource in time order, up and down jump to the nearest booking on the resource above or below. Every booking carries its resource, its times and its duration in its accessible name, because a timeline says all of that through position alone."
              - group "Studio bookings, 12 March" [ref=e652]:
                - generic [ref=e654]:
                  - generic [ref=e657]:
                    - generic: 09:00
                    - generic: 10:00
                    - generic: 11:00
                    - generic: 12:00
                    - generic: 13:00
                    - generic: 14:00
                    - generic: 15:00
                    - generic: 16:00
                    - generic: 17:00
                  - generic [ref=e658]:
                    - generic [ref=e659]:
                      - generic [ref=e660]: Studio A
                      - generic [ref=e661]: Ground floor · 12 seats
                    - list "Studio A" [ref=e662]:
                      - listitem:
                        - button "Standup. Studio A, 09:00 to 09:30, 30 minutes." [ref=e663] [cursor=pointer]:
                          - generic [ref=e664]: Standup
                          - generic [ref=e665]: 09:00–09:30
                      - listitem:
                        - button "Podcast · episode 41. Studio A, 10:00 to 12:30, 2 hours 30 minutes." [ref=e666] [cursor=pointer]:
                          - generic [ref=e667]: Podcast · episode 41
                          - generic [ref=e668]: 10:00–12:30
                      - listitem:
                        - button "Mic check. Studio A, 11:30 to 12:00, 30 minutes." [ref=e669] [cursor=pointer]:
                          - generic [ref=e670]: Mic check
                          - generic [ref=e671]: 11:30–12:00
                      - listitem:
                        - button "Client call. Studio A, 14:00 to 15:00, 1 hour." [ref=e672] [cursor=pointer]:
                          - generic [ref=e673]: Client call
                          - generic [ref=e674]: 14:00–15:00
                  - generic [ref=e675]:
                    - generic [ref=e676]:
                      - generic [ref=e677]: Studio B
                      - generic [ref=e678]: First floor · 6 seats
                    - list "Studio B" [ref=e679]:
                      - listitem:
                        - button "Voiceover. Studio B, 09:30 to 11:00, 1 hour 30 minutes." [ref=e680] [cursor=pointer]:
                          - generic [ref=e681]: Voiceover
                          - generic [ref=e682]: 09:30–11:00
                      - listitem:
                        - button "Maintenance. Studio B, 13:00 to 16:00, 3 hours." [ref=e683] [cursor=pointer]:
                          - generic [ref=e684]: Maintenance
                          - generic [ref=e685]: 13:00–16:00
                  - generic [ref=e686]:
                    - generic [ref=e687]:
                      - generic [ref=e688]: Edit suite 1
                      - generic [ref=e689]: Colour grade
                    - list "Edit suite 1" [ref=e690]:
                      - listitem:
                        - button "Grade · trailer. Edit suite 1, 09:00 to 13:00, 4 hours." [ref=e691] [cursor=pointer]:
                          - generic [ref=e692]: Grade · trailer
                          - generic [ref=e693]: 09:00–13:00
                      - listitem:
                        - button "Grade · spot. Edit suite 1, 13:30 to 17:00, 3 hours 30 minutes." [ref=e694] [cursor=pointer]:
                          - generic [ref=e695]: Grade · spot
                          - generic [ref=e696]: 13:30–17:00
                  - generic [ref=e697]:
                    - generic [ref=e698]: Edit suite 2
                    - list "Edit suite 2" [ref=e700]:
                      - listitem [ref=e701]: Nothing scheduled
              - paragraph [ref=e702]: Nothing selected yet. Click or press Enter on a booking.
            - generic [ref=e703]:
              - generic [ref=e704]:
                - radiogroup "Code language" [ref=e705]:
                  - radio "TS" [checked] [ref=e707] [cursor=pointer]
                  - radio "JS" [ref=e709] [cursor=pointer]
                - generic [ref=e711]:
                  - button "Copy" [ref=e712] [cursor=pointer]
                  - status [ref=e713]
              - code [ref=e715]: "// Left / Right - previous / next booking for this resource, in time order // Up / Down - the nearest booking in time on the resource above / below // Home / End - first / last booking for this resource // Enter, Space - select // Empty resources are skipped by Up and Down: stopping on a row with nothing // in it reads as a dead key. <Scheduler resources={resources} events={events} label=\"Bookings\" />"
          - generic [ref=e716]:
            - heading "The current-time marker, and why it is opt-in" [level=2] [ref=e717]
            - paragraph [ref=e718]: "Reading the clock during render gives the server one marker position and the browser another, which React reports as a hydration mismatch. So the component never does it: showNow reads the clock in an effect after mount, and now takes an explicit time for tests and demos."
            - generic [ref=e720]:
              - paragraph [ref=e721]: "Tab into the board and use the arrow keys: left and right walk this resource in time order, up and down jump to the nearest booking on the resource above or below. Every booking carries its resource, its times and its duration in its accessible name, because a timeline says all of that through position alone."
              - group "Studio bookings, 12 March" [ref=e722]:
                - generic [ref=e724]:
                  - generic [ref=e727]:
                    - generic: 09:00
                    - generic: 10:00
                    - generic: 11:00
                    - generic: 12:00
                    - generic: 13:00
                    - generic: 14:00
                    - generic: 15:00
                    - generic: 16:00
                    - generic: 17:00
                  - generic [ref=e728]:
                    - generic [ref=e729]:
                      - generic [ref=e730]: Studio A
                      - generic [ref=e731]: Ground floor · 12 seats
                    - list "Studio A" [ref=e732]:
                      - listitem:
                        - button "Standup. Studio A, 09:00 to 09:30, 30 minutes." [ref=e733] [cursor=pointer]:
                          - generic [ref=e734]: Standup
                          - generic [ref=e735]: 09:00–09:30
                      - listitem:
                        - button "Podcast · episode 41. Studio A, 10:00 to 12:30, 2 hours 30 minutes." [ref=e736] [cursor=pointer]:
                          - generic [ref=e737]: Podcast · episode 41
                          - generic [ref=e738]: 10:00–12:30
                      - listitem:
                        - button "Mic check. Studio A, 11:30 to 12:00, 30 minutes." [ref=e739] [cursor=pointer]:
                          - generic [ref=e740]: Mic check
                          - generic [ref=e741]: 11:30–12:00
                      - listitem:
                        - button "Client call. Studio A, 14:00 to 15:00, 1 hour." [ref=e742] [cursor=pointer]:
                          - generic [ref=e743]: Client call
                          - generic [ref=e744]: 14:00–15:00
                  - generic [ref=e745]:
                    - generic [ref=e746]:
                      - generic [ref=e747]: Studio B
                      - generic [ref=e748]: First floor · 6 seats
                    - list "Studio B" [ref=e749]:
                      - listitem:
                        - button "Voiceover. Studio B, 09:30 to 11:00, 1 hour 30 minutes." [ref=e750] [cursor=pointer]:
                          - generic [ref=e751]: Voiceover
                          - generic [ref=e752]: 09:30–11:00
                      - listitem:
                        - button "Maintenance. Studio B, 13:00 to 16:00, 3 hours." [ref=e753] [cursor=pointer]:
                          - generic [ref=e754]: Maintenance
                          - generic [ref=e755]: 13:00–16:00
                  - generic [ref=e756]:
                    - generic [ref=e757]:
                      - generic [ref=e758]: Edit suite 1
                      - generic [ref=e759]: Colour grade
                    - list "Edit suite 1" [ref=e760]:
                      - listitem:
                        - button "Grade · trailer. Edit suite 1, 09:00 to 13:00, 4 hours." [ref=e761] [cursor=pointer]:
                          - generic [ref=e762]: Grade · trailer
                          - generic [ref=e763]: 09:00–13:00
                      - listitem:
                        - button "Grade · spot. Edit suite 1, 13:30 to 17:00, 3 hours 30 minutes." [ref=e764] [cursor=pointer]:
                          - generic [ref=e765]: Grade · spot
                          - generic [ref=e766]: 13:30–17:00
                  - generic [ref=e767]:
                    - generic [ref=e768]: Edit suite 2
                    - list "Edit suite 2" [ref=e770]:
                      - listitem [ref=e771]: Nothing scheduled
              - paragraph [ref=e772]: Nothing selected yet. Click or press Enter on a booking.
            - generic [ref=e773]:
              - generic [ref=e774]:
                - radiogroup "Code language" [ref=e775]:
                  - radio "TS" [checked] [ref=e777] [cursor=pointer]
                  - radio "JS" [ref=e779] [cursor=pointer]
                - generic [ref=e781]:
                  - button "Copy" [ref=e782] [cursor=pointer]
                  - status [ref=e783]
              - code [ref=e785]: "// Reads the clock after mount, then ticks once a minute. <Scheduler resources={resources} events={events} label=\"Today\" showNow /> // Or pin it, which is what the demo above does so the docs never shift. <Scheduler resources={resources} events={events} label=\"Today\" now={at(13, 20)} /> // Times are written by a deterministic HH:MM formatter rather than // Intl.DateTimeFormat, whose output varies between Node builds and browsers. // Pass your own for a 12-hour clock: <Scheduler resources={resources} events={events} label=\"Today\" formatTime={(d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} />"
          - separator [ref=e786]
          - generic [ref=e787]:
            - heading "Props" [level=2] [ref=e788]
            - paragraph [ref=e789]: Generated from the package's own type declarations, so this table cannot drift from the code.
            - table [ref=e791]:
              - caption [ref=e792]: Props for Scheduler
              - rowgroup [ref=e793]:
                - row [ref=e794]:
                  - columnheader "Prop" [ref=e795]
                  - columnheader "Type" [ref=e796]
                  - columnheader "Default" [ref=e797]
                  - columnheader "Description" [ref=e798]
              - rowgroup [ref=e799]:
                - row [ref=e800]:
                  - cell "resources required" [ref=e801]:
                    - code [ref=e802]: resources
                    - generic [ref=e803]: required
                  - cell [ref=e804]:
                    - code [ref=e805]: readonly SchedulerResource[]
                  - cell "—" [ref=e806]
                  - cell "—" [ref=e807]
                - row [ref=e808]:
                  - cell "events required" [ref=e809]:
                    - code [ref=e810]: events
                    - generic [ref=e811]: required
                  - cell [ref=e812]:
                    - code [ref=e813]: readonly SchedulerEvent[]
                  - cell "—" [ref=e814]
                  - cell "—" [ref=e815]
                - row [ref=e816]:
                  - cell "label required" [ref=e817]:
                    - code [ref=e818]: label
                    - generic [ref=e819]: required
                  - cell [ref=e820]:
                    - code [ref=e821]: string
                  - cell "—" [ref=e822]
                  - cell "Required. A timeline with no accessible name is one more unlabelled region." [ref=e823]
                - row [ref=e824]:
                  - cell [ref=e825]:
                    - code [ref=e826]: start
                  - cell [ref=e827]:
                    - code [ref=e828]: Date | number
                  - cell "—" [ref=e829]
                  - cell "Window start. Defaults to the earliest event, floored to the step." [ref=e830]
                - row [ref=e831]:
                  - cell [ref=e832]:
                    - code [ref=e833]: end
                  - cell [ref=e834]:
                    - code [ref=e835]: Date | number
                  - cell "—" [ref=e836]
                  - cell "Window end. Defaults to the latest event, ceiled to the step." [ref=e837]
                - row [ref=e838]:
                  - cell [ref=e839]:
                    - code [ref=e840]: step
                  - cell [ref=e841]:
                    - code [ref=e842]: number
                  - cell "—" [ref=e843]
                  - cell "Minutes between axis ticks. Default 60." [ref=e844]
                - row [ref=e845]:
                  - cell [ref=e846]:
                    - code [ref=e847]: minTickWidth
                  - cell [ref=e848]:
                    - code [ref=e849]: number
                  - cell "—" [ref=e850]
                  - cell "Minimum pixels per tick. Below this the timeline scrolls rather than crushing." [ref=e851]
                - row [ref=e852]:
                  - cell [ref=e853]:
                    - code [ref=e854]: showNow
                  - cell [ref=e855]:
                    - code [ref=e856]: boolean
                  - cell "—" [ref=e857]
                  - cell "Draw the current-time marker. Left to itself this component never reads the clock during render — that would produce a different marker on the server and the client, which React reports as a hydration mismatch. The clock is read in an effect, after mount." [ref=e858]
                - row [ref=e859]:
                  - cell [ref=e860]:
                    - code [ref=e861]: now
                  - cell [ref=e862]:
                    - code [ref=e863]: Date | number
                  - cell "—" [ref=e864]
                  - 'cell "An explicit \"now\", which overrides {@link showNow}''s clock. Useful in tests and demos." [ref=e865]'
                - row [ref=e866]:
                  - cell [ref=e867]:
                    - code [ref=e868]: onSelect
                  - cell [ref=e869]:
                    - code [ref=e870]: "(event: SchedulerEvent) => void"
                  - cell "—" [ref=e871]
                  - cell "—" [ref=e872]
                - row [ref=e873]:
                  - cell [ref=e874]:
                    - code [ref=e875]: renderEvent
                  - cell [ref=e876]:
                    - code [ref=e877]: "(event: SchedulerEvent, resource: SchedulerResource) => ReactNode"
                  - cell "—" [ref=e878]
                  - cell "Rendered instead of the default title + time. The wrapper button stays ours." [ref=e879]
                - row [ref=e880]:
                  - cell [ref=e881]:
                    - code [ref=e882]: formatTime
                  - cell [ref=e883]:
                    - code [ref=e884]: "(value: Date) => string"
                  - cell "—" [ref=e885]
                  - 'cell "How a time is written, in the axis and in every accessible name. The default is a deterministic 24-hour `HH:MM` rather than `Intl.DateTimeFormat`, because ICU output varies between Node builds and browsers — the same code would render differently for two of your users. Pass your own for 12-hour clocks or other locales." [ref=e886]'
            - status [ref=e887]:
              - paragraph [ref=e890]:
                - text: Every remaining prop is spread onto the root element, so all standard HTML and ARIA attributes work.
                - code [ref=e891]: className
                - text: and
                - code [ref=e892]: style
                - text: are merged with the library's own, never replaced, and the ref forwards to the root DOM node.
          - generic [ref=e893]:
            - heading "Rendering" [level=2] [ref=e894]
            - alert [ref=e895]:
              - generic [ref=e896]: "!"
              - generic [ref=e897]:
                - generic [ref=e898]: Client component
                - paragraph [ref=e900]:
                  - code [ref=e901]: Scheduler
                  - text: declares
                  - code [ref=e902]: "'use client'"
                  - text: because it needs state, effects or event handlers. Importing it into a Server Component creates a client boundary at this component — everything above it stays on the server.
          - separator [ref=e903]
          - navigation "Adjacent components" [ref=e904]:
            - link "← Kanban board" [ref=e905] [cursor=pointer]:
              - /url: /docs/components/kanban-board
            - link "Stepper →" [ref=e906] [cursor=pointer]:
              - /url: /docs/components/stepper
  - alert [ref=e907]
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