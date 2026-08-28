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
                - link "Infinite scroll c" [ref=e109] [cursor=pointer]:
                  - /url: /docs/components/infinite-scroll
                  - generic [ref=e110]: Infinite scroll
                  - generic "Client component" [ref=e112]: c
              - listitem [ref=e113]:
                - link "Scroll area" [ref=e114] [cursor=pointer]:
                  - /url: /docs/components/scroll-area
              - listitem [ref=e116]:
                - link "Section" [ref=e117] [cursor=pointer]:
                  - /url: /docs/components/section
              - listitem [ref=e119]:
                - link "Stack" [ref=e120] [cursor=pointer]:
                  - /url: /docs/components/stack
          - generic [ref=e122]:
            - generic [ref=e123]: Typography
            - list "Typography" [ref=e124]:
              - listitem [ref=e125]:
                - link "Code" [ref=e126] [cursor=pointer]:
                  - /url: /docs/components/code
              - listitem [ref=e128]:
                - link "Heading" [ref=e129] [cursor=pointer]:
                  - /url: /docs/components/heading
              - listitem [ref=e131]:
                - link "Kbd" [ref=e132] [cursor=pointer]:
                  - /url: /docs/components/kbd
              - listitem [ref=e134]:
                - link "Prose" [ref=e135] [cursor=pointer]:
                  - /url: /docs/components/prose
              - listitem [ref=e137]:
                - link "Text" [ref=e138] [cursor=pointer]:
                  - /url: /docs/components/text
          - generic [ref=e140]:
            - generic [ref=e141]: Actions
            - list "Actions" [ref=e142]:
              - listitem [ref=e143]:
                - link "Button" [ref=e144] [cursor=pointer]:
                  - /url: /docs/components/button
              - listitem [ref=e146]:
                - link "Button group" [ref=e147] [cursor=pointer]:
                  - /url: /docs/components/button-group
              - listitem [ref=e149]:
                - link "Copy button c" [ref=e150] [cursor=pointer]:
                  - /url: /docs/components/copy-button
                  - generic [ref=e151]: Copy button
                  - generic "Client component" [ref=e153]: c
              - listitem [ref=e154]:
                - link "Icon button" [ref=e155] [cursor=pointer]:
                  - /url: /docs/components/icon-button
          - generic [ref=e157]:
            - generic [ref=e158]: Forms
            - list "Forms" [ref=e159]:
              - listitem [ref=e160]:
                - link "Calendar c" [ref=e161] [cursor=pointer]:
                  - /url: /docs/components/calendar
                  - generic [ref=e162]: Calendar
                  - generic "Client component" [ref=e164]: c
              - listitem [ref=e165]:
                - link "Checkbox" [ref=e166] [cursor=pointer]:
                  - /url: /docs/components/checkbox
              - listitem [ref=e168]:
                - link "Chip c" [ref=e169] [cursor=pointer]:
                  - /url: /docs/components/chip
                  - generic [ref=e170]: Chip
                  - generic "Client component" [ref=e172]: c
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
                - link "Form c" [ref=e194] [cursor=pointer]:
                  - /url: /docs/components/form
                  - generic [ref=e195]: Form
                  - generic "Client component" [ref=e197]: c
              - listitem [ref=e198]:
                - link "Input" [ref=e199] [cursor=pointer]:
                  - /url: /docs/components/input
              - listitem [ref=e201]:
                - link "Label" [ref=e202] [cursor=pointer]:
                  - /url: /docs/components/label
              - listitem [ref=e204]:
                - link "Number input c" [ref=e205] [cursor=pointer]:
                  - /url: /docs/components/number-input
                  - generic [ref=e206]: Number input
                  - generic "Client component" [ref=e208]: c
              - listitem [ref=e209]:
                - link "Otp input c" [ref=e210] [cursor=pointer]:
                  - /url: /docs/components/otp-input
                  - generic [ref=e211]: Otp input
                  - generic "Client component" [ref=e213]: c
              - listitem [ref=e214]:
                - link "Password input c" [ref=e215] [cursor=pointer]:
                  - /url: /docs/components/password-input
                  - generic [ref=e216]: Password input
                  - generic "Client component" [ref=e218]: c
              - listitem [ref=e219]:
                - link "Radio group" [ref=e220] [cursor=pointer]:
                  - /url: /docs/components/radio-group
              - listitem [ref=e222]:
                - link "Rating c" [ref=e223] [cursor=pointer]:
                  - /url: /docs/components/rating
                  - generic [ref=e224]: Rating
                  - generic "Client component" [ref=e226]: c
              - listitem [ref=e227]:
                - link "Segmented c" [ref=e228] [cursor=pointer]:
                  - /url: /docs/components/segmented
                  - generic [ref=e229]: Segmented
                  - generic "Client component" [ref=e231]: c
              - listitem [ref=e232]:
                - link "Select" [ref=e233] [cursor=pointer]:
                  - /url: /docs/components/select
              - listitem [ref=e235]:
                - link "Slider c" [ref=e236] [cursor=pointer]:
                  - /url: /docs/components/slider
                  - generic [ref=e237]: Slider
                  - generic "Client component" [ref=e239]: c
              - listitem [ref=e240]:
                - link "Switch" [ref=e241] [cursor=pointer]:
                  - /url: /docs/components/switch
              - listitem [ref=e243]:
                - link "Tag input c" [ref=e244] [cursor=pointer]:
                  - /url: /docs/components/tag-input
                  - generic [ref=e245]: Tag input
                  - generic "Client component" [ref=e247]: c
              - listitem [ref=e248]:
                - link "Textarea" [ref=e249] [cursor=pointer]:
                  - /url: /docs/components/textarea
          - generic [ref=e251]:
            - generic [ref=e252]: Overlays
            - list "Overlays" [ref=e253]:
              - listitem [ref=e254]:
                - link "Accordion c" [ref=e255] [cursor=pointer]:
                  - /url: /docs/components/accordion
                  - generic [ref=e256]: Accordion
                  - generic "Client component" [ref=e258]: c
              - listitem [ref=e259]:
                - link "Drawer c" [ref=e260] [cursor=pointer]:
                  - /url: /docs/components/drawer
                  - generic [ref=e261]: Drawer
                  - generic "Client component" [ref=e263]: c
              - listitem [ref=e264]:
                - link "Dropdown menu c" [ref=e265] [cursor=pointer]:
                  - /url: /docs/components/dropdown-menu
                  - generic [ref=e266]: Dropdown menu
                  - generic "Client component" [ref=e268]: c
              - listitem [ref=e269]:
                - link "Hover card c" [ref=e270] [cursor=pointer]:
                  - /url: /docs/components/hover-card
                  - generic [ref=e271]: Hover card
                  - generic "Client component" [ref=e273]: c
              - listitem [ref=e274]:
                - link "Modal c" [ref=e275] [cursor=pointer]:
                  - /url: /docs/components/modal
                  - generic [ref=e276]: Modal
                  - generic "Client component" [ref=e278]: c
              - listitem [ref=e279]:
                - link "Popover c" [ref=e280] [cursor=pointer]:
                  - /url: /docs/components/popover
                  - generic [ref=e281]: Popover
                  - generic "Client component" [ref=e283]: c
              - listitem [ref=e284]:
                - link "Portal c" [ref=e285] [cursor=pointer]:
                  - /url: /docs/components/portal
                  - generic [ref=e286]: Portal
                  - generic "Client component" [ref=e288]: c
              - listitem [ref=e289]:
                - link "Tabs c" [ref=e290] [cursor=pointer]:
                  - /url: /docs/components/tabs
                  - generic [ref=e291]: Tabs
                  - generic "Client component" [ref=e293]: c
              - listitem [ref=e294]:
                - link "Toast" [ref=e295] [cursor=pointer]:
                  - /url: /docs/components/toast
              - listitem [ref=e297]:
                - link "Tooltip c" [ref=e298] [cursor=pointer]:
                  - /url: /docs/components/tooltip
                  - generic [ref=e299]: Tooltip
                  - generic "Client component" [ref=e301]: c
          - generic [ref=e302]:
            - generic [ref=e303]: Navigation
            - list "Navigation" [ref=e304]:
              - listitem [ref=e305]:
                - link "Breadcrumb" [ref=e306] [cursor=pointer]:
                  - /url: /docs/components/breadcrumb
              - listitem [ref=e308]:
                - link "Command palette c" [ref=e309] [cursor=pointer]:
                  - /url: /docs/components/command-palette
                  - generic [ref=e310]: Command palette
                  - generic "Client component" [ref=e312]: c
              - listitem [ref=e313]:
                - link "Navbar c" [ref=e314] [cursor=pointer]:
                  - /url: /docs/components/navbar
                  - generic [ref=e315]: Navbar
                  - generic "Client component" [ref=e317]: c
              - listitem [ref=e318]:
                - link "Pagination c" [ref=e319] [cursor=pointer]:
                  - /url: /docs/components/pagination
                  - generic [ref=e320]: Pagination
                  - generic "Client component" [ref=e322]: c
              - listitem [ref=e323]:
                - link "Sidebar c" [ref=e324] [cursor=pointer]:
                  - /url: /docs/components/sidebar
                  - generic [ref=e325]: Sidebar
                  - generic "Client component" [ref=e327]: c
          - generic [ref=e328]:
            - generic [ref=e329]: Data display
            - list "Data display" [ref=e330]:
              - listitem [ref=e331]:
                - link "Avatar" [ref=e332] [cursor=pointer]:
                  - /url: /docs/components/avatar
              - listitem [ref=e334]:
                - link "Badge" [ref=e335] [cursor=pointer]:
                  - /url: /docs/components/badge
              - listitem [ref=e337]:
                - link "Card" [ref=e338] [cursor=pointer]:
                  - /url: /docs/components/card
              - listitem [ref=e340]:
                - link "Data table c" [ref=e341] [cursor=pointer]:
                  - /url: /docs/components/data-table
                  - generic [ref=e342]: Data table
                  - generic "Client component" [ref=e344]: c
              - listitem [ref=e345]:
                - link "Editable grid c" [ref=e346] [cursor=pointer]:
                  - /url: /docs/components/editable-grid
                  - generic [ref=e347]: Editable grid
                  - generic "Client component" [ref=e349]: c
              - listitem [ref=e350]:
                - link "File tree c" [ref=e351] [cursor=pointer]:
                  - /url: /docs/components/file-tree
                  - generic [ref=e352]: File tree
                  - generic "Client component" [ref=e354]: c
              - listitem [ref=e355]:
                - link "Kanban board c" [ref=e356] [cursor=pointer]:
                  - /url: /docs/components/kanban-board
                  - generic [ref=e357]: Kanban board
                  - generic "Client component" [ref=e359]: c
              - listitem [ref=e360]:
                - link "Scheduler c" [ref=e361] [cursor=pointer]:
                  - /url: /docs/components/scheduler
                  - generic [ref=e362]: Scheduler
                  - generic "Client component" [ref=e364]: c
              - listitem [ref=e365]:
                - link "Stepper c" [ref=e366] [cursor=pointer]:
                  - /url: /docs/components/stepper
                  - generic [ref=e367]: Stepper
                  - generic "Client component" [ref=e369]: c
              - listitem [ref=e370]:
                - link "Table" [ref=e371] [cursor=pointer]:
                  - /url: /docs/components/table
              - listitem [ref=e373]:
                - link "Timeline" [ref=e374] [cursor=pointer]:
                  - /url: /docs/components/timeline
              - listitem [ref=e376]:
                - link "Virtual list c" [ref=e377] [cursor=pointer]:
                  - /url: /docs/components/virtual-list
                  - generic [ref=e378]: Virtual list
                  - generic "Client component" [ref=e380]: c
          - generic [ref=e381]:
            - generic [ref=e382]: AI chat
            - list "AI chat" [ref=e383]:
              - listitem [ref=e384]:
                - link "Chat code block c" [ref=e385] [cursor=pointer]:
                  - /url: /docs/components/chat-code-block
                  - generic [ref=e386]: Chat code block
                  - generic "Client component" [ref=e388]: c
              - listitem [ref=e389]:
                - link "Chat input c" [ref=e390] [cursor=pointer]:
                  - /url: /docs/components/chat-input
                  - generic [ref=e391]: Chat input
                  - generic "Client component" [ref=e393]: c
              - listitem [ref=e394]:
                - link "Chat message" [ref=e395] [cursor=pointer]:
                  - /url: /docs/components/chat-message
              - listitem [ref=e397]:
                - link "Chat thread c" [ref=e398] [cursor=pointer]:
                  - /url: /docs/components/chat-thread
                  - generic [ref=e399]: Chat thread
                  - generic "Client component" [ref=e401]: c
              - listitem [ref=e402]:
                - link "Typing indicator" [ref=e403] [cursor=pointer]:
                  - /url: /docs/components/typing-indicator
          - generic [ref=e405]:
            - generic [ref=e406]: Feedback
            - list "Feedback" [ref=e407]:
              - listitem [ref=e408]:
                - link "Alert" [ref=e409] [cursor=pointer]:
                  - /url: /docs/components/alert
              - listitem [ref=e411]:
                - link "Empty state" [ref=e412] [cursor=pointer]:
                  - /url: /docs/components/empty-state
              - listitem [ref=e414]:
                - link "Progress" [ref=e415] [cursor=pointer]:
                  - /url: /docs/components/progress
              - listitem [ref=e417]:
                - link "Skeleton" [ref=e418] [cursor=pointer]:
                  - /url: /docs/components/skeleton
              - listitem [ref=e420]:
                - link "Spinner" [ref=e421] [cursor=pointer]:
                  - /url: /docs/components/spinner
          - generic [ref=e423]:
            - generic [ref=e424]: Sections
            - list "Sections" [ref=e425]:
              - listitem [ref=e426]:
                - link "Cta" [ref=e427] [cursor=pointer]:
                  - /url: /docs/components/cta
              - listitem [ref=e429]:
                - link "Faq" [ref=e430] [cursor=pointer]:
                  - /url: /docs/components/faq
              - listitem [ref=e432]:
                - link "Feature grid" [ref=e433] [cursor=pointer]:
                  - /url: /docs/components/feature-grid
              - listitem [ref=e435]:
                - link "Footer" [ref=e436] [cursor=pointer]:
                  - /url: /docs/components/footer
              - listitem [ref=e438]:
                - link "Hero" [ref=e439] [cursor=pointer]:
                  - /url: /docs/components/hero
              - listitem [ref=e441]:
                - link "Logo cloud" [ref=e442] [cursor=pointer]:
                  - /url: /docs/components/logo-cloud
              - listitem [ref=e444]:
                - link "Newsletter c" [ref=e445] [cursor=pointer]:
                  - /url: /docs/components/newsletter
                  - generic [ref=e446]: Newsletter
                  - generic "Client component" [ref=e448]: c
              - listitem [ref=e449]:
                - link "Pricing" [ref=e450] [cursor=pointer]:
                  - /url: /docs/components/pricing
              - listitem [ref=e452]:
                - link "Stats" [ref=e453] [cursor=pointer]:
                  - /url: /docs/components/stats
              - listitem [ref=e455]:
                - link "Testimonials" [ref=e456] [cursor=pointer]:
                  - /url: /docs/components/testimonials
          - generic [ref=e458]:
            - generic [ref=e459]: Media & time
            - list "Media & time" [ref=e460]:
              - listitem [ref=e461]:
                - link "Animated counter c" [ref=e462] [cursor=pointer]:
                  - /url: /docs/components/animated-counter
                  - generic [ref=e463]: Animated counter
                  - generic "Client component" [ref=e465]: c
              - listitem [ref=e466]:
                - link "Carousel" [ref=e467] [cursor=pointer]:
                  - /url: /docs/components/carousel
              - listitem [ref=e469]:
                - link "Clock c" [ref=e470] [cursor=pointer]:
                  - /url: /docs/components/clock
                  - generic [ref=e471]: Clock
                  - generic "Client component" [ref=e473]: c
              - listitem [ref=e474]:
                - link "Countdown c" [ref=e475] [cursor=pointer]:
                  - /url: /docs/components/countdown
                  - generic [ref=e476]: Countdown
                  - generic "Client component" [ref=e478]: c
              - listitem [ref=e479]:
                - link "Image c" [ref=e480] [cursor=pointer]:
                  - /url: /docs/components/image
                  - generic [ref=e481]: Image
                  - generic "Client component" [ref=e483]: c
              - listitem [ref=e484]:
                - link "Map embed c" [ref=e485] [cursor=pointer]:
                  - /url: /docs/components/map-embed
                  - generic [ref=e486]: Map embed
                  - generic "Client component" [ref=e488]: c
              - listitem [ref=e489]:
                - link "Marquee" [ref=e490] [cursor=pointer]:
                  - /url: /docs/components/marquee
              - listitem [ref=e492]:
                - link "Relative time c" [ref=e493] [cursor=pointer]:
                  - /url: /docs/components/relative-time
                  - generic [ref=e494]: Relative time
                  - generic "Client component" [ref=e496]: c
          - generic [ref=e497]:
            - generic [ref=e498]: Theming
            - list "Theming" [ref=e499]:
              - listitem [ref=e500]:
                - link "Theme provider c" [ref=e501] [cursor=pointer]:
                  - /url: /docs/components/theme-provider
                  - generic [ref=e502]: Theme provider
                  - generic "Client component" [ref=e504]: c
              - listitem [ref=e505]:
                - link "Theme toggle c" [ref=e506] [cursor=pointer]:
                  - /url: /docs/components/theme-toggle
                  - generic [ref=e507]: Theme toggle
                  - generic "Client component" [ref=e509]: c
          - generic [ref=e510]:
            - generic [ref=e511]: Charts
            - list "Charts" [ref=e512]:
              - listitem [ref=e513]:
                - link "AreaChart" [ref=e514] [cursor=pointer]:
                  - /url: /docs/charts/area-chart
              - listitem [ref=e516]:
                - link "BarChart" [ref=e517] [cursor=pointer]:
                  - /url: /docs/charts/bar-chart
              - listitem [ref=e519]:
                - link "Gauge" [ref=e520] [cursor=pointer]:
                  - /url: /docs/charts/gauge
              - listitem [ref=e522]:
                - link "Heatmap" [ref=e523] [cursor=pointer]:
                  - /url: /docs/charts/heatmap
              - listitem [ref=e525]:
                - link "LineChart" [ref=e526] [cursor=pointer]:
                  - /url: /docs/charts/line-chart
              - listitem [ref=e528]:
                - link "PieChart" [ref=e529] [cursor=pointer]:
                  - /url: /docs/charts/pie-chart
              - listitem [ref=e531]:
                - link "ProgressRing" [ref=e532] [cursor=pointer]:
                  - /url: /docs/charts/progress-ring
              - listitem [ref=e534]:
                - link "RadarChart" [ref=e535] [cursor=pointer]:
                  - /url: /docs/charts/radar-chart
              - listitem [ref=e537]:
                - link "ScatterChart" [ref=e538] [cursor=pointer]:
                  - /url: /docs/charts/scatter-chart
              - listitem [ref=e540]:
                - link "Sparkline" [ref=e541] [cursor=pointer]:
                  - /url: /docs/charts/sparkline
        - article [ref=e543]:
          - generic [ref=e544]:
            - heading "Installation" [level=1] [ref=e545]
            - paragraph [ref=e546]: Two steps. There is no third.
          - generic [ref=e547]:
            - heading "1. Install" [level=2] [ref=e548]
            - generic [ref=e549]:
              - tablist [ref=e550]:
                - tab "npm" [selected] [ref=e551] [cursor=pointer]
                - tab "pnpm" [ref=e552] [cursor=pointer]
                - tab "yarn" [ref=e553] [cursor=pointer]
                - tab "bun" [ref=e554] [cursor=pointer]
              - tabpanel "npm" [ref=e556]:
                - generic [ref=e557]:
                  - generic [ref=e558]:
                    - generic [ref=e559]: terminal
                    - generic [ref=e560]:
                      - button "Copy" [ref=e561] [cursor=pointer]
                      - status [ref=e562]
                  - code [ref=e564]: npm install @the_viveksingh/vivek-ui
            - paragraph [ref=e565]:
              - text: React 18 or 19 is a peer dependency. Nothing else is installed, because the package has no runtime dependencies of its own. Confirm it yourself with
              - code [ref=e566]: npm ls --omit=dev @the_viveksingh/vivek-ui
              - text: .
          - generic [ref=e567]:
            - heading "2. Import the stylesheet once" [level=2] [ref=e568]
            - generic [ref=e569]:
              - tablist [ref=e570]:
                - tab "Next.js App Router" [selected] [ref=e571] [cursor=pointer]
                - tab "Next.js Pages Router" [ref=e572] [cursor=pointer]
                - tab "Vite / CRA" [ref=e573] [cursor=pointer]
              - tabpanel "Next.js App Router" [ref=e575]:
                - generic [ref=e576]:
                  - generic [ref=e577]:
                    - generic [ref=e578]: app/layout.tsx
                    - radiogroup "Code language" [ref=e579]:
                      - radio "TS" [checked] [ref=e581] [cursor=pointer]
                      - radio "JS" [ref=e583] [cursor=pointer]
                    - generic [ref=e585]:
                      - button "Copy" [ref=e586] [cursor=pointer]
                      - status [ref=e587]
                  - code [ref=e589]: "import '@the_viveksingh/vivek-ui/styles.css' export default function RootLayout({ children }: { children: React.ReactNode }) { return ( <html lang=\"en\"> <body>{children}</body> </html> ) }"
          - generic [ref=e590]:
            - heading "Using charts" [level=2] [ref=e591]
            - paragraph [ref=e592]: Charts are a separate subpath with their own stylesheet, so an app that never draws one pays nothing for them.
            - generic [ref=e593]:
              - generic [ref=e594]:
                - radiogroup "Code language" [ref=e595]:
                  - radio "TS" [checked] [ref=e597] [cursor=pointer]
                  - radio "JS" [ref=e599] [cursor=pointer]
                - generic [ref=e601]:
                  - button "Copy" [ref=e602] [cursor=pointer]
                  - status [ref=e603]
              - code [ref=e605]: "import { LineChart } from '@the_viveksingh/vivek-ui/charts' import '@the_viveksingh/vivek-ui/charts.css'"
          - generic [ref=e606]:
            - heading "Compound components in Server Components" [level=2] [ref=e607]
            - alert [ref=e608]:
              - generic [ref=e609]: "!"
              - generic [ref=e610]:
                - generic [ref=e611]: Use the named part exports on the server
                - paragraph [ref=e613]:
                  - text: Interactive compound components —
                  - code [ref=e614]: Tabs
                  - text: ","
                  - code [ref=e615]: Accordion
                  - text: ","
                  - code [ref=e616]: Modal
                  - text: ","
                  - code [ref=e617]: Drawer
                  - text: ","
                  - code [ref=e618]: Navbar
                  - text: ","
                  - code [ref=e619]: Sidebar
                  - text: — are client components. From a Server Component they arrive as a client reference, and
                  - code [ref=e620]: Tabs.List
                  - text: reads
                  - code [ref=e621]: undefined
                  - text: off it. Import
                  - code [ref=e622]: TabsList
                  - text: instead. Inside a client component either form works. Server-safe compounds like
                  - code [ref=e623]: Card
                  - text: and
                  - code [ref=e624]: Table
                  - text: are unaffected.
            - generic [ref=e625]:
              - generic [ref=e626]:
                - radiogroup "Code language" [ref=e627]:
                  - radio "TS" [checked] [ref=e629] [cursor=pointer]
                  - radio "JS" [ref=e631] [cursor=pointer]
                - generic [ref=e633]:
                  - button "Copy" [ref=e634] [cursor=pointer]
                  - status [ref=e635]
              - code [ref=e637]: "// In a Server Component import { Tabs, TabsList, TabsTab } from '@the_viveksingh/vivek-ui' // In a client component, either works import { Tabs } from '@the_viveksingh/vivek-ui' <Tabs.List>...</Tabs.List>"
          - generic [ref=e638]:
            - heading "That is the whole setup" [level=2] [ref=e639]
            - status [ref=e640]:
              - paragraph [ref=e643]: No config file, no CLI, no Tailwind, no PostCSS plugin, no Babel plugin, and no required provider. If you needed a third step, that would be a bug in the library's design.
  - alert [ref=e644]
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