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
            - paragraph [ref=e545]: Actions
            - heading "Button" [level=1] [ref=e546]
            - paragraph [ref=e547]: A button.
            - generic [ref=e548]:
              - generic "Renders in a Server Component" [ref=e549]: Server safe
              - link "Source" [ref=e550] [cursor=pointer]:
                - /url: https://github.com/intellectwithvivek/vivek_UI/tree/main/packages/ui/src/components/button
          - generic [ref=e551]:
            - heading "Import" [level=2] [ref=e552]
            - generic [ref=e553]:
              - generic [ref=e554]:
                - radiogroup "Code language" [ref=e555]:
                  - radio "TS" [checked] [ref=e557] [cursor=pointer]
                  - radio "JS" [ref=e559] [cursor=pointer]
                - generic [ref=e561]:
                  - button "Copy" [ref=e562] [cursor=pointer]
                  - status [ref=e563]
              - code [ref=e565]: "import { Button } from '@the_viveksingh/vivek-ui'"
          - generic [ref=e566]:
            - heading "Variants" [level=2] [ref=e567]
            - paragraph [ref=e568]: Four variants, mapped to a data attribute rather than a class-name string.
            - generic [ref=e570]:
              - button "Solid" [ref=e571] [cursor=pointer]
              - button "Outline" [ref=e572] [cursor=pointer]
              - button "Ghost" [ref=e573] [cursor=pointer]
              - button "Link" [ref=e574] [cursor=pointer]
            - generic [ref=e575]:
              - generic [ref=e576]:
                - radiogroup "Code language" [ref=e577]:
                  - radio "TS" [checked] [ref=e579] [cursor=pointer]
                  - radio "JS" [ref=e581] [cursor=pointer]
                - generic [ref=e583]:
                  - button "Copy" [ref=e584] [cursor=pointer]
                  - status [ref=e585]
              - code [ref=e587]: <Button>Solid</Button> <Button variant="outline">Outline</Button> <Button variant="ghost">Ghost</Button> <Button variant="link">Link</Button>
          - generic [ref=e588]:
            - heading "Sizes and full width" [level=2] [ref=e589]
            - generic [ref=e591]:
              - generic [ref=e592]:
                - button "Small" [ref=e593] [cursor=pointer]
                - button "Medium" [ref=e594] [cursor=pointer]
                - button "Large" [ref=e595] [cursor=pointer]
              - button "Full width" [ref=e596] [cursor=pointer]
            - generic [ref=e597]:
              - generic [ref=e598]:
                - radiogroup "Code language" [ref=e599]:
                  - radio "TS" [checked] [ref=e601] [cursor=pointer]
                  - radio "JS" [ref=e603] [cursor=pointer]
                - generic [ref=e605]:
                  - button "Copy" [ref=e606] [cursor=pointer]
                  - status [ref=e607]
              - code [ref=e609]: <Button size="sm">Small</Button> <Button size="md">Medium</Button> <Button size="lg">Large</Button> <Button fullWidth>Full width</Button>
          - generic [ref=e610]:
            - heading "Loading" [level=2] [ref=e611]
            - paragraph [ref=e612]: loading also disables the button, so a submit cannot fire twice while a request is in flight.
            - generic [ref=e614]:
              - button "Saving changes" [disabled] [ref=e615]
              - button "Loading" [disabled] [ref=e617]
              - button "Disabled" [disabled] [ref=e619]
            - generic [ref=e620]:
              - generic [ref=e621]:
                - radiogroup "Code language" [ref=e622]:
                  - radio "TS" [checked] [ref=e624] [cursor=pointer]
                  - radio "JS" [ref=e626] [cursor=pointer]
                - generic [ref=e628]:
                  - button "Copy" [ref=e629] [cursor=pointer]
                  - status [ref=e630]
              - code [ref=e632]: <Button loading>Saving changes</Button> <Button loading variant="outline">Loading</Button> <Button disabled>Disabled</Button>
          - generic [ref=e633]:
            - heading "As a link" [level=2] [ref=e634]
            - paragraph [ref=e635]: asChild renders your element instead of a <button>. A link that looks like a button must be an anchor — otherwise middle-click, cmd-click and "open in new tab" all break, and a screen reader announces the wrong role.
            - link "Get started" [ref=e637] [cursor=pointer]:
              - /url: /docs/installation
            - generic [ref=e638]:
              - generic [ref=e639]:
                - radiogroup "Code language" [ref=e640]:
                  - radio "TS" [checked] [ref=e642] [cursor=pointer]
                  - radio "JS" [ref=e644] [cursor=pointer]
                - generic [ref=e646]:
                  - button "Copy" [ref=e647] [cursor=pointer]
                  - status [ref=e648]
              - code [ref=e650]: import Link from 'next/link' <Button asChild> <Link href="/docs/installation">Get started</Link> </Button>
          - generic [ref=e651]:
            - heading "Overriding styles" [level=2] [ref=e652]
            - paragraph [ref=e653]: Every library selector is wrapped in :where(), which has specificity zero — so one flat class of your own wins, with no !important.
            - button "Beats the library" [ref=e655] [cursor=pointer]
            - generic [ref=e656]:
              - generic [ref=e657]:
                - radiogroup "Code language" [ref=e658]:
                  - radio "TS" [checked] [ref=e660] [cursor=pointer]
                  - radio "JS" [ref=e662] [cursor=pointer]
                - generic [ref=e664]:
                  - button "Copy" [ref=e665] [cursor=pointer]
                  - status [ref=e666]
              - code [ref=e668]: "/* your stylesheet */ .my-cta { background: #db2777; border-radius: 999px; } <Button className=\"my-cta\">Beats the library</Button>"
          - separator [ref=e669]
          - generic [ref=e670]:
            - heading "Props" [level=2] [ref=e671]
            - paragraph [ref=e672]: Generated from the package's own type declarations, so this table cannot drift from the code.
            - table [ref=e674]:
              - caption [ref=e675]: Props for Button
              - rowgroup [ref=e676]:
                - row [ref=e677]:
                  - columnheader "Prop" [ref=e678]
                  - columnheader "Type" [ref=e679]
                  - columnheader "Default" [ref=e680]
                  - columnheader "Description" [ref=e681]
              - rowgroup [ref=e682]:
                - row [ref=e683]:
                  - cell [ref=e684]:
                    - code [ref=e685]: variant
                  - cell [ref=e686]:
                    - code [ref=e687]: "'solid' | 'outline' | 'ghost' | 'link'"
                  - cell "—" [ref=e688]
                  - cell "—" [ref=e689]
                - row [ref=e690]:
                  - cell [ref=e691]:
                    - code [ref=e692]: size
                  - cell [ref=e693]:
                    - code [ref=e694]: "'sm' | 'md' | 'lg'"
                  - cell "—" [ref=e695]
                  - cell "—" [ref=e696]
                - row [ref=e697]:
                  - cell [ref=e698]:
                    - code [ref=e699]: fullWidth
                  - cell [ref=e700]:
                    - code [ref=e701]: boolean
                  - cell "—" [ref=e702]
                  - cell "—" [ref=e703]
                - row [ref=e704]:
                  - cell [ref=e705]:
                    - code [ref=e706]: loading
                  - cell [ref=e707]:
                    - code [ref=e708]: boolean
                  - cell "—" [ref=e709]
                  - cell "—" [ref=e710]
                - row [ref=e711]:
                  - cell [ref=e712]:
                    - code [ref=e713]: asChild
                  - cell [ref=e714]:
                    - code [ref=e715]: boolean
                  - cell "—" [ref=e716]
                  - 'cell "Render the caller''s element instead of a `<button>`, keeping every style and data attribute. This is how a button navigates without the library depending on a router: ```tsx <Button asChild><Link href=\"/pricing\">Pricing</Link></Button> ``` A link that looks like a button must be an `<a>`, not a `<button>` with an onClick — otherwise middle-click, cmd-click, \"open in new tab\" and \"copy link address\" all break, and a screen reader announces the wrong role. `loading` and `disabled` are ignored when `asChild` is set: `disabled` is not a valid attribute on an anchor, and a spinner inside someone else''s element would fight their children. Use a real `<button>` for anything with a pending state." [ref=e717]'
            - status [ref=e718]:
              - paragraph [ref=e721]:
                - text: Every remaining prop is spread onto the root element, so all standard HTML and ARIA attributes work.
                - code [ref=e722]: className
                - text: and
                - code [ref=e723]: style
                - text: are merged with the library's own, never replaced, and the ref forwards to the root DOM node.
          - generic [ref=e724]:
            - heading "Rendering" [level=2] [ref=e725]
            - status [ref=e726]:
              - generic [ref=e727]: ✓
              - generic [ref=e728]:
                - generic [ref=e729]: Server safe
                - paragraph [ref=e731]:
                  - code [ref=e732]: Button
                  - text: carries no
                  - code [ref=e733]: "'use client'"
                  - text: directive and renders directly in a React Server Component. No client JavaScript is shipped for it.
          - separator [ref=e734]
          - navigation "Adjacent components" [ref=e735]:
            - link "← Text" [ref=e736] [cursor=pointer]:
              - /url: /docs/components/text
            - link "Button group →" [ref=e737] [cursor=pointer]:
              - /url: /docs/components/button-group
  - alert [ref=e738]
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