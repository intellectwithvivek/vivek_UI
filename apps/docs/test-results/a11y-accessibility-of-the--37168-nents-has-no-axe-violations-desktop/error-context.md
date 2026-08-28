# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> accessibility of the composed pages >> /docs/components has no axe violations
- Location: e2e\a11y.spec.ts:36:9

# Error details

```
Error: 
  [serious] color-contrast: Elements must meet minimum color contrast ratio thresholds
    <span class="vk-sidebar__label">All components</span>
  [moderate] landmark-unique: Landmarks should have a unique role or role/label/title (i.e. accessible name) combination
    <nav aria-label="Documentation" class="docs-shell__nav">

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 18

- Array []
+ Array [
+   Object {
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       "<span class=\"vk-sidebar__label\">All components</span>",
+     ],
+   },
+   Object {
+     "help": "Landmarks should have a unique role or role/label/title (i.e. accessible name) combination",
+     "id": "landmark-unique",
+     "impact": "moderate",
+     "nodes": Array [
+       "<nav aria-label=\"Documentation\" class=\"docs-shell__nav\">",
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
      - button "Search documentation" [ref=e33] [cursor=pointer]:
        - text: Search
        - generic [ref=e34]: ⌘K
      - generic [ref=e35]:
        - navigation "Documentation" [ref=e36]:
          - navigation "Documentation" [ref=e38]:
            - generic [ref=e39]:
              - generic [ref=e40]: Getting started
              - list "Getting started" [ref=e41]:
                - listitem [ref=e42]:
                  - link "Introduction" [ref=e43] [cursor=pointer]:
                    - /url: /docs
                - listitem [ref=e45]:
                  - link "Installation" [ref=e46] [cursor=pointer]:
                    - /url: /docs/installation
                - listitem [ref=e48]:
                  - link "Quick start" [ref=e49] [cursor=pointer]:
                    - /url: /docs/quick-start
            - generic [ref=e51]:
              - generic [ref=e52]: Core concepts
              - list "Core concepts" [ref=e53]:
                - listitem [ref=e54]:
                  - link "Theming" [ref=e55] [cursor=pointer]:
                    - /url: /docs/theming
                - listitem [ref=e57]:
                  - link "Dark mode" [ref=e58] [cursor=pointer]:
                    - /url: /docs/dark-mode
                - listitem [ref=e60]:
                  - link "Overriding styles" [ref=e61] [cursor=pointer]:
                    - /url: /docs/styling
                - listitem [ref=e63]:
                  - link "Responsive" [ref=e64] [cursor=pointer]:
                    - /url: /docs/responsive
                - listitem [ref=e66]:
                  - link "Feeding it your data" [ref=e67] [cursor=pointer]:
                    - /url: /docs/data-mapping
                - listitem [ref=e69]:
                  - link "Server Components" [ref=e70] [cursor=pointer]:
                    - /url: /docs/server-components
                - listitem [ref=e72]:
                  - link "Accessibility" [ref=e73] [cursor=pointer]:
                    - /url: /docs/accessibility
                - listitem [ref=e75]:
                  - link "Security" [ref=e76] [cursor=pointer]:
                    - /url: /docs/security
                - listitem [ref=e78]:
                  - link "TypeScript" [ref=e79] [cursor=pointer]:
                    - /url: /docs/typescript
                - listitem [ref=e81]:
                  - link "FAQ" [ref=e82] [cursor=pointer]:
                    - /url: /docs/faq
            - generic [ref=e84]:
              - generic [ref=e85]: Reference
              - list "Reference" [ref=e86]:
                - listitem [ref=e87]:
                  - link "All components" [ref=e88] [cursor=pointer]:
                    - /url: /docs/components
                - listitem [ref=e90]:
                  - link "All charts" [ref=e91] [cursor=pointer]:
                    - /url: /docs/charts
                - listitem [ref=e93]:
                  - link "Page templates" [ref=e94] [cursor=pointer]:
                    - /url: /pages
                - listitem [ref=e96]:
                  - link "Playground" [ref=e97] [cursor=pointer]:
                    - /url: /playground
            - generic [ref=e99]:
              - generic [ref=e100]: Layout
              - list "Layout" [ref=e101]:
                - listitem [ref=e102]:
                  - link "Aspect ratio" [ref=e103] [cursor=pointer]:
                    - /url: /docs/components/aspect-ratio
                - listitem [ref=e105]:
                  - link "Bento grid" [ref=e106] [cursor=pointer]:
                    - /url: /docs/components/bento-grid
                - listitem [ref=e108]:
                  - link "Box" [ref=e109] [cursor=pointer]:
                    - /url: /docs/components/box
                - listitem [ref=e111]:
                  - link "Container" [ref=e112] [cursor=pointer]:
                    - /url: /docs/components/container
                - listitem [ref=e114]:
                  - link "Divider" [ref=e115] [cursor=pointer]:
                    - /url: /docs/components/divider
                - listitem [ref=e117]:
                  - link "Grid" [ref=e118] [cursor=pointer]:
                    - /url: /docs/components/grid
                - listitem [ref=e120]:
                  - link "Scroll area" [ref=e121] [cursor=pointer]:
                    - /url: /docs/components/scroll-area
                - listitem [ref=e123]:
                  - link "Section" [ref=e124] [cursor=pointer]:
                    - /url: /docs/components/section
                - listitem [ref=e126]:
                  - link "Stack" [ref=e127] [cursor=pointer]:
                    - /url: /docs/components/stack
            - generic [ref=e129]:
              - generic [ref=e130]: Typography
              - list "Typography" [ref=e131]:
                - listitem [ref=e132]:
                  - link "Code" [ref=e133] [cursor=pointer]:
                    - /url: /docs/components/code
                - listitem [ref=e135]:
                  - link "Heading" [ref=e136] [cursor=pointer]:
                    - /url: /docs/components/heading
                - listitem [ref=e138]:
                  - link "Kbd" [ref=e139] [cursor=pointer]:
                    - /url: /docs/components/kbd
                - listitem [ref=e141]:
                  - link "Prose" [ref=e142] [cursor=pointer]:
                    - /url: /docs/components/prose
                - listitem [ref=e144]:
                  - link "Text" [ref=e145] [cursor=pointer]:
                    - /url: /docs/components/text
            - generic [ref=e147]:
              - generic [ref=e148]: Actions
              - list "Actions" [ref=e149]:
                - listitem [ref=e150]:
                  - link "Button" [ref=e151] [cursor=pointer]:
                    - /url: /docs/components/button
                - listitem [ref=e153]:
                  - link "Button group" [ref=e154] [cursor=pointer]:
                    - /url: /docs/components/button-group
                - listitem [ref=e156]:
                  - link "Copy button c" [ref=e157] [cursor=pointer]:
                    - /url: /docs/components/copy-button
                    - generic [ref=e158]: Copy button
                    - generic "Client component" [ref=e160]: c
                - listitem [ref=e161]:
                  - link "Icon button" [ref=e162] [cursor=pointer]:
                    - /url: /docs/components/icon-button
            - generic [ref=e164]:
              - generic [ref=e165]: Forms
              - list "Forms" [ref=e166]:
                - listitem [ref=e167]:
                  - link "Calendar c" [ref=e168] [cursor=pointer]:
                    - /url: /docs/components/calendar
                    - generic [ref=e169]: Calendar
                    - generic "Client component" [ref=e171]: c
                - listitem [ref=e172]:
                  - link "Checkbox" [ref=e173] [cursor=pointer]:
                    - /url: /docs/components/checkbox
                - listitem [ref=e175]:
                  - link "Combobox c" [ref=e176] [cursor=pointer]:
                    - /url: /docs/components/combobox
                    - generic [ref=e177]: Combobox
                    - generic "Client component" [ref=e179]: c
                - listitem [ref=e180]:
                  - link "Date picker c" [ref=e181] [cursor=pointer]:
                    - /url: /docs/components/date-picker
                    - generic [ref=e182]: Date picker
                    - generic "Client component" [ref=e184]: c
                - listitem [ref=e185]:
                  - link "Field c" [ref=e186] [cursor=pointer]:
                    - /url: /docs/components/field
                    - generic [ref=e187]: Field
                    - generic "Client component" [ref=e189]: c
                - listitem [ref=e190]:
                  - link "File upload c" [ref=e191] [cursor=pointer]:
                    - /url: /docs/components/file-upload
                    - generic [ref=e192]: File upload
                    - generic "Client component" [ref=e194]: c
                - listitem [ref=e195]:
                  - link "Input" [ref=e196] [cursor=pointer]:
                    - /url: /docs/components/input
                - listitem [ref=e198]:
                  - link "Label" [ref=e199] [cursor=pointer]:
                    - /url: /docs/components/label
                - listitem [ref=e201]:
                  - link "Otp input c" [ref=e202] [cursor=pointer]:
                    - /url: /docs/components/otp-input
                    - generic [ref=e203]: Otp input
                    - generic "Client component" [ref=e205]: c
                - listitem [ref=e206]:
                  - link "Password input c" [ref=e207] [cursor=pointer]:
                    - /url: /docs/components/password-input
                    - generic [ref=e208]: Password input
                    - generic "Client component" [ref=e210]: c
                - listitem [ref=e211]:
                  - link "Radio group" [ref=e212] [cursor=pointer]:
                    - /url: /docs/components/radio-group
                - listitem [ref=e214]:
                  - link "Rating c" [ref=e215] [cursor=pointer]:
                    - /url: /docs/components/rating
                    - generic [ref=e216]: Rating
                    - generic "Client component" [ref=e218]: c
                - listitem [ref=e219]:
                  - link "Select" [ref=e220] [cursor=pointer]:
                    - /url: /docs/components/select
                - listitem [ref=e222]:
                  - link "Slider c" [ref=e223] [cursor=pointer]:
                    - /url: /docs/components/slider
                    - generic [ref=e224]: Slider
                    - generic "Client component" [ref=e226]: c
                - listitem [ref=e227]:
                  - link "Switch" [ref=e228] [cursor=pointer]:
                    - /url: /docs/components/switch
                - listitem [ref=e230]:
                  - link "Tag input c" [ref=e231] [cursor=pointer]:
                    - /url: /docs/components/tag-input
                    - generic [ref=e232]: Tag input
                    - generic "Client component" [ref=e234]: c
                - listitem [ref=e235]:
                  - link "Textarea" [ref=e236] [cursor=pointer]:
                    - /url: /docs/components/textarea
            - generic [ref=e238]:
              - generic [ref=e239]: Overlays
              - list "Overlays" [ref=e240]:
                - listitem [ref=e241]:
                  - link "Accordion c" [ref=e242] [cursor=pointer]:
                    - /url: /docs/components/accordion
                    - generic [ref=e243]: Accordion
                    - generic "Client component" [ref=e245]: c
                - listitem [ref=e246]:
                  - link "Drawer c" [ref=e247] [cursor=pointer]:
                    - /url: /docs/components/drawer
                    - generic [ref=e248]: Drawer
                    - generic "Client component" [ref=e250]: c
                - listitem [ref=e251]:
                  - link "Dropdown menu c" [ref=e252] [cursor=pointer]:
                    - /url: /docs/components/dropdown-menu
                    - generic [ref=e253]: Dropdown menu
                    - generic "Client component" [ref=e255]: c
                - listitem [ref=e256]:
                  - link "Modal c" [ref=e257] [cursor=pointer]:
                    - /url: /docs/components/modal
                    - generic [ref=e258]: Modal
                    - generic "Client component" [ref=e260]: c
                - listitem [ref=e261]:
                  - link "Popover c" [ref=e262] [cursor=pointer]:
                    - /url: /docs/components/popover
                    - generic [ref=e263]: Popover
                    - generic "Client component" [ref=e265]: c
                - listitem [ref=e266]:
                  - link "Portal c" [ref=e267] [cursor=pointer]:
                    - /url: /docs/components/portal
                    - generic [ref=e268]: Portal
                    - generic "Client component" [ref=e270]: c
                - listitem [ref=e271]:
                  - link "Tabs c" [ref=e272] [cursor=pointer]:
                    - /url: /docs/components/tabs
                    - generic [ref=e273]: Tabs
                    - generic "Client component" [ref=e275]: c
                - listitem [ref=e276]:
                  - link "Toast" [ref=e277] [cursor=pointer]:
                    - /url: /docs/components/toast
                - listitem [ref=e279]:
                  - link "Tooltip c" [ref=e280] [cursor=pointer]:
                    - /url: /docs/components/tooltip
                    - generic [ref=e281]: Tooltip
                    - generic "Client component" [ref=e283]: c
            - generic [ref=e284]:
              - generic [ref=e285]: Navigation
              - list "Navigation" [ref=e286]:
                - listitem [ref=e287]:
                  - link "Breadcrumb" [ref=e288] [cursor=pointer]:
                    - /url: /docs/components/breadcrumb
                - listitem [ref=e290]:
                  - link "Command palette c" [ref=e291] [cursor=pointer]:
                    - /url: /docs/components/command-palette
                    - generic [ref=e292]: Command palette
                    - generic "Client component" [ref=e294]: c
                - listitem [ref=e295]:
                  - link "Navbar c" [ref=e296] [cursor=pointer]:
                    - /url: /docs/components/navbar
                    - generic [ref=e297]: Navbar
                    - generic "Client component" [ref=e299]: c
                - listitem [ref=e300]:
                  - link "Pagination c" [ref=e301] [cursor=pointer]:
                    - /url: /docs/components/pagination
                    - generic [ref=e302]: Pagination
                    - generic "Client component" [ref=e304]: c
                - listitem [ref=e305]:
                  - link "Sidebar c" [ref=e306] [cursor=pointer]:
                    - /url: /docs/components/sidebar
                    - generic [ref=e307]: Sidebar
                    - generic "Client component" [ref=e309]: c
            - generic [ref=e310]:
              - generic [ref=e311]: Data display
              - list "Data display" [ref=e312]:
                - listitem [ref=e313]:
                  - link "Avatar" [ref=e314] [cursor=pointer]:
                    - /url: /docs/components/avatar
                - listitem [ref=e316]:
                  - link "Badge" [ref=e317] [cursor=pointer]:
                    - /url: /docs/components/badge
                - listitem [ref=e319]:
                  - link "Card" [ref=e320] [cursor=pointer]:
                    - /url: /docs/components/card
                - listitem [ref=e322]:
                  - link "Data table c" [ref=e323] [cursor=pointer]:
                    - /url: /docs/components/data-table
                    - generic [ref=e324]: Data table
                    - generic "Client component" [ref=e326]: c
                - listitem [ref=e327]:
                  - link "Editable grid c" [ref=e328] [cursor=pointer]:
                    - /url: /docs/components/editable-grid
                    - generic [ref=e329]: Editable grid
                    - generic "Client component" [ref=e331]: c
                - listitem [ref=e332]:
                  - link "File tree c" [ref=e333] [cursor=pointer]:
                    - /url: /docs/components/file-tree
                    - generic [ref=e334]: File tree
                    - generic "Client component" [ref=e336]: c
                - listitem [ref=e337]:
                  - link "Kanban board c" [ref=e338] [cursor=pointer]:
                    - /url: /docs/components/kanban-board
                    - generic [ref=e339]: Kanban board
                    - generic "Client component" [ref=e341]: c
                - listitem [ref=e342]:
                  - link "Scheduler c" [ref=e343] [cursor=pointer]:
                    - /url: /docs/components/scheduler
                    - generic [ref=e344]: Scheduler
                    - generic "Client component" [ref=e346]: c
                - listitem [ref=e347]:
                  - link "Stepper c" [ref=e348] [cursor=pointer]:
                    - /url: /docs/components/stepper
                    - generic [ref=e349]: Stepper
                    - generic "Client component" [ref=e351]: c
                - listitem [ref=e352]:
                  - link "Table" [ref=e353] [cursor=pointer]:
                    - /url: /docs/components/table
                - listitem [ref=e355]:
                  - link "Timeline" [ref=e356] [cursor=pointer]:
                    - /url: /docs/components/timeline
                - listitem [ref=e358]:
                  - link "Virtual list c" [ref=e359] [cursor=pointer]:
                    - /url: /docs/components/virtual-list
                    - generic [ref=e360]: Virtual list
                    - generic "Client component" [ref=e362]: c
            - generic [ref=e363]:
              - generic [ref=e364]: AI chat
              - list "AI chat" [ref=e365]:
                - listitem [ref=e366]:
                  - link "Chat code block c" [ref=e367] [cursor=pointer]:
                    - /url: /docs/components/chat-code-block
                    - generic [ref=e368]: Chat code block
                    - generic "Client component" [ref=e370]: c
                - listitem [ref=e371]:
                  - link "Chat input c" [ref=e372] [cursor=pointer]:
                    - /url: /docs/components/chat-input
                    - generic [ref=e373]: Chat input
                    - generic "Client component" [ref=e375]: c
                - listitem [ref=e376]:
                  - link "Chat message" [ref=e377] [cursor=pointer]:
                    - /url: /docs/components/chat-message
                - listitem [ref=e379]:
                  - link "Chat thread c" [ref=e380] [cursor=pointer]:
                    - /url: /docs/components/chat-thread
                    - generic [ref=e381]: Chat thread
                    - generic "Client component" [ref=e383]: c
                - listitem [ref=e384]:
                  - link "Typing indicator" [ref=e385] [cursor=pointer]:
                    - /url: /docs/components/typing-indicator
            - generic [ref=e387]:
              - generic [ref=e388]: Feedback
              - list "Feedback" [ref=e389]:
                - listitem [ref=e390]:
                  - link "Alert" [ref=e391] [cursor=pointer]:
                    - /url: /docs/components/alert
                - listitem [ref=e393]:
                  - link "Empty state" [ref=e394] [cursor=pointer]:
                    - /url: /docs/components/empty-state
                - listitem [ref=e396]:
                  - link "Progress" [ref=e397] [cursor=pointer]:
                    - /url: /docs/components/progress
                - listitem [ref=e399]:
                  - link "Skeleton" [ref=e400] [cursor=pointer]:
                    - /url: /docs/components/skeleton
                - listitem [ref=e402]:
                  - link "Spinner" [ref=e403] [cursor=pointer]:
                    - /url: /docs/components/spinner
            - generic [ref=e405]:
              - generic [ref=e406]: Sections
              - list "Sections" [ref=e407]:
                - listitem [ref=e408]:
                  - link "Cta" [ref=e409] [cursor=pointer]:
                    - /url: /docs/components/cta
                - listitem [ref=e411]:
                  - link "Faq" [ref=e412] [cursor=pointer]:
                    - /url: /docs/components/faq
                - listitem [ref=e414]:
                  - link "Feature grid" [ref=e415] [cursor=pointer]:
                    - /url: /docs/components/feature-grid
                - listitem [ref=e417]:
                  - link "Footer" [ref=e418] [cursor=pointer]:
                    - /url: /docs/components/footer
                - listitem [ref=e420]:
                  - link "Hero" [ref=e421] [cursor=pointer]:
                    - /url: /docs/components/hero
                - listitem [ref=e423]:
                  - link "Logo cloud" [ref=e424] [cursor=pointer]:
                    - /url: /docs/components/logo-cloud
                - listitem [ref=e426]:
                  - link "Newsletter c" [ref=e427] [cursor=pointer]:
                    - /url: /docs/components/newsletter
                    - generic [ref=e428]: Newsletter
                    - generic "Client component" [ref=e430]: c
                - listitem [ref=e431]:
                  - link "Pricing" [ref=e432] [cursor=pointer]:
                    - /url: /docs/components/pricing
                - listitem [ref=e434]:
                  - link "Stats" [ref=e435] [cursor=pointer]:
                    - /url: /docs/components/stats
                - listitem [ref=e437]:
                  - link "Testimonials" [ref=e438] [cursor=pointer]:
                    - /url: /docs/components/testimonials
            - generic [ref=e440]:
              - generic [ref=e441]: Media & time
              - list "Media & time" [ref=e442]:
                - listitem [ref=e443]:
                  - link "Animated counter c" [ref=e444] [cursor=pointer]:
                    - /url: /docs/components/animated-counter
                    - generic [ref=e445]: Animated counter
                    - generic "Client component" [ref=e447]: c
                - listitem [ref=e448]:
                  - link "Carousel" [ref=e449] [cursor=pointer]:
                    - /url: /docs/components/carousel
                - listitem [ref=e451]:
                  - link "Clock c" [ref=e452] [cursor=pointer]:
                    - /url: /docs/components/clock
                    - generic [ref=e453]: Clock
                    - generic "Client component" [ref=e455]: c
                - listitem [ref=e456]:
                  - link "Countdown c" [ref=e457] [cursor=pointer]:
                    - /url: /docs/components/countdown
                    - generic [ref=e458]: Countdown
                    - generic "Client component" [ref=e460]: c
                - listitem [ref=e461]:
                  - link "Image c" [ref=e462] [cursor=pointer]:
                    - /url: /docs/components/image
                    - generic [ref=e463]: Image
                    - generic "Client component" [ref=e465]: c
                - listitem [ref=e466]:
                  - link "Map embed c" [ref=e467] [cursor=pointer]:
                    - /url: /docs/components/map-embed
                    - generic [ref=e468]: Map embed
                    - generic "Client component" [ref=e470]: c
                - listitem [ref=e471]:
                  - link "Marquee" [ref=e472] [cursor=pointer]:
                    - /url: /docs/components/marquee
                - listitem [ref=e474]:
                  - link "Relative time c" [ref=e475] [cursor=pointer]:
                    - /url: /docs/components/relative-time
                    - generic [ref=e476]: Relative time
                    - generic "Client component" [ref=e478]: c
            - generic [ref=e479]:
              - generic [ref=e480]: Theming
              - list "Theming" [ref=e481]:
                - listitem [ref=e482]:
                  - link "Theme provider c" [ref=e483] [cursor=pointer]:
                    - /url: /docs/components/theme-provider
                    - generic [ref=e484]: Theme provider
                    - generic "Client component" [ref=e486]: c
                - listitem [ref=e487]:
                  - link "Theme toggle c" [ref=e488] [cursor=pointer]:
                    - /url: /docs/components/theme-toggle
                    - generic [ref=e489]: Theme toggle
                    - generic "Client component" [ref=e491]: c
            - generic [ref=e492]:
              - generic [ref=e493]: Charts
              - list "Charts" [ref=e494]:
                - listitem [ref=e495]:
                  - link "AreaChart" [ref=e496] [cursor=pointer]:
                    - /url: /docs/charts/area-chart
                - listitem [ref=e498]:
                  - link "BarChart" [ref=e499] [cursor=pointer]:
                    - /url: /docs/charts/bar-chart
                - listitem [ref=e501]:
                  - link "LineChart" [ref=e502] [cursor=pointer]:
                    - /url: /docs/charts/line-chart
                - listitem [ref=e504]:
                  - link "PieChart" [ref=e505] [cursor=pointer]:
                    - /url: /docs/charts/pie-chart
                - listitem [ref=e507]:
                  - link "ProgressRing" [ref=e508] [cursor=pointer]:
                    - /url: /docs/charts/progress-ring
                - listitem [ref=e510]:
                  - link "Sparkline" [ref=e511] [cursor=pointer]:
                    - /url: /docs/charts/sparkline
        - article [ref=e513]:
          - generic [ref=e514]:
            - heading "All components" [level=1] [ref=e515]
            - paragraph [ref=e516]:
              - text: 91 components. 49 render in a Server Component with no client JavaScript; the other 42 declare
              - code [ref=e517]: "'use client'"
              - text: because they genuinely need state, effects or event handlers.
          - generic [ref=e518]:
            - heading "Layout (9)" [level=2] [ref=e519]:
              - text: Layout
              - generic [ref=e520]: (9)
            - generic [ref=e521]:
              - generic [ref=e522] [cursor=pointer]:
                - generic [ref=e524]:
                  - heading [level=3] [ref=e525]:
                    - link "Aspect ratio" [ref=e526]:
                      - /url: /docs/components/aspect-ratio
                  - generic "Renders on the server" [ref=e527]: server
                - paragraph [ref=e529]: Reserves space at a fixed ratio so media cannot cause layout shift.
              - generic [ref=e530] [cursor=pointer]:
                - generic [ref=e532]:
                  - heading [level=3] [ref=e533]:
                    - link "Bento grid" [ref=e534]:
                      - /url: /docs/components/bento-grid
                  - generic "Renders on the server" [ref=e535]: server
                - paragraph [ref=e537]: "Compound component: `BentoGrid` and `BentoGrid.Item`."
              - generic [ref=e538] [cursor=pointer]:
                - generic [ref=e540]:
                  - heading [level=3] [ref=e541]:
                    - link "Box" [ref=e542]:
                      - /url: /docs/components/box
                  - generic "Renders on the server" [ref=e543]: server
                - paragraph [ref=e545]: "The lowest-level layout primitive: a styled `div` you can retag."
              - generic [ref=e546] [cursor=pointer]:
                - generic [ref=e548]:
                  - heading [level=3] [ref=e549]:
                    - link "Container" [ref=e550]:
                      - /url: /docs/components/container
                  - generic "Renders on the server" [ref=e551]: server
                - paragraph [ref=e553]: Centres content and caps its width, with a responsive gutter.
              - generic [ref=e554] [cursor=pointer]:
                - generic [ref=e556]:
                  - heading [level=3] [ref=e557]:
                    - link "Divider" [ref=e558]:
                      - /url: /docs/components/divider
                  - generic "Renders on the server" [ref=e559]: server
                - paragraph [ref=e561]: A separator.
              - generic [ref=e562] [cursor=pointer]:
                - generic [ref=e564]:
                  - heading [level=3] [ref=e565]:
                    - link "Grid" [ref=e566]:
                      - /url: /docs/components/grid
                  - generic "Renders on the server" [ref=e567]: server
                - paragraph [ref=e569]: "Responsive grid at zero runtime cost. Responsive `cols` become inline custom properties that the static stylesheet reads inside fixed media queries — no style computation, no CSS generation, SSR-identical."
              - generic [ref=e570] [cursor=pointer]:
                - generic [ref=e572]:
                  - heading [level=3] [ref=e573]:
                    - link "Scroll area" [ref=e574]:
                      - /url: /docs/components/scroll-area
                  - generic "Renders on the server" [ref=e575]: server
                - paragraph [ref=e577]: A styled overflow container.
              - generic [ref=e578] [cursor=pointer]:
                - generic [ref=e580]:
                  - heading [level=3] [ref=e581]:
                    - link "Section" [ref=e582]:
                      - /url: /docs/components/section
                  - generic "Renders on the server" [ref=e583]: server
                - paragraph [ref=e585]: "Compound component: `Section` and `Section.Header`."
              - generic [ref=e586] [cursor=pointer]:
                - generic [ref=e588]:
                  - heading [level=3] [ref=e589]:
                    - link "Stack" [ref=e590]:
                      - /url: /docs/components/stack
                  - generic "Renders on the server" [ref=e591]: server
                - paragraph [ref=e593]: "Flex container with a token-based gap. `Flex` is the horizontal alias."
          - generic [ref=e594]:
            - heading "Typography (5)" [level=2] [ref=e595]:
              - text: Typography
              - generic [ref=e596]: (5)
            - generic [ref=e597]:
              - generic [ref=e598] [cursor=pointer]:
                - generic [ref=e600]:
                  - heading [level=3] [ref=e601]:
                    - link "Code" [ref=e602]:
                      - /url: /docs/components/code
                  - generic "Renders on the server" [ref=e603]: server
                - paragraph [ref=e605]: "Monospaced code. Inline by default; `block` wraps it in a scrollable `pre`."
              - generic [ref=e606] [cursor=pointer]:
                - generic [ref=e608]:
                  - heading [level=3] [ref=e609]:
                    - link "Heading" [ref=e610]:
                      - /url: /docs/components/heading
                  - generic "Renders on the server" [ref=e611]: server
                - paragraph [ref=e613]: "A heading, `h1` through `h6`."
              - generic [ref=e614] [cursor=pointer]:
                - generic [ref=e616]:
                  - heading [level=3] [ref=e617]:
                    - link "Kbd" [ref=e618]:
                      - /url: /docs/components/kbd
                  - generic "Renders on the server" [ref=e619]: server
                - paragraph [ref=e621]: A keyboard key, for documenting shortcuts.
              - generic [ref=e622] [cursor=pointer]:
                - generic [ref=e624]:
                  - heading [level=3] [ref=e625]:
                    - link "Prose" [ref=e626]:
                      - /url: /docs/components/prose
                  - generic "Renders on the server" [ref=e627]: server
                - paragraph [ref=e629]: "Compound component: `Prose` and `Prose.Link`."
              - generic [ref=e630] [cursor=pointer]:
                - generic [ref=e632]:
                  - heading [level=3] [ref=e633]:
                    - link "Text" [ref=e634]:
                      - /url: /docs/components/text
                  - generic "Renders on the server" [ref=e635]: server
                - paragraph [ref=e637]: Body text.
          - generic [ref=e638]:
            - heading "Actions (4)" [level=2] [ref=e639]:
              - text: Actions
              - generic [ref=e640]: (4)
            - generic [ref=e641]:
              - generic [ref=e642] [cursor=pointer]:
                - generic [ref=e644]:
                  - heading [level=3] [ref=e645]:
                    - link "Button" [ref=e646]:
                      - /url: /docs/components/button
                  - generic "Renders on the server" [ref=e647]: server
                - paragraph [ref=e649]: A button.
              - generic [ref=e650] [cursor=pointer]:
                - generic [ref=e652]:
                  - heading [level=3] [ref=e653]:
                    - link "Button group" [ref=e654]:
                      - /url: /docs/components/button-group
                  - generic "Renders on the server" [ref=e655]: server
                - paragraph [ref=e657]: "Groups related buttons. `attached` joins them into a single segmented control."
              - generic [ref=e658] [cursor=pointer]:
                - generic [ref=e660]:
                  - heading [level=3] [ref=e661]:
                    - link "Copy button" [ref=e662]:
                      - /url: /docs/components/copy-button
                  - generic "Declares 'use client'" [ref=e663]: client
                - paragraph [ref=e665]: Copy to clipboard, with a transient confirmation.
              - generic [ref=e666] [cursor=pointer]:
                - generic [ref=e668]:
                  - heading [level=3] [ref=e669]:
                    - link "Icon button" [ref=e670]:
                      - /url: /docs/components/icon-button
                  - generic "Renders on the server" [ref=e671]: server
                - paragraph [ref=e673]: A square button holding a single icon.
          - generic [ref=e674]:
            - heading "Forms (17)" [level=2] [ref=e675]:
              - text: Forms
              - generic [ref=e676]: (17)
            - generic [ref=e677]:
              - generic [ref=e678] [cursor=pointer]:
                - generic [ref=e680]:
                  - heading [level=3] [ref=e681]:
                    - link "Calendar" [ref=e682]:
                      - /url: /docs/components/calendar
                  - generic "Declares 'use client'" [ref=e683]: client
                - paragraph [ref=e685]: A month grid, keyboard-navigable per the WAI-ARIA Authoring Practices grid pattern.
              - generic [ref=e686] [cursor=pointer]:
                - generic [ref=e688]:
                  - heading [level=3] [ref=e689]:
                    - link "Checkbox" [ref=e690]:
                      - /url: /docs/components/checkbox
                  - generic "Renders on the server" [ref=e691]: server
                - paragraph [ref=e693]: A checkbox built on the native input.
              - generic [ref=e694] [cursor=pointer]:
                - generic [ref=e696]:
                  - heading [level=3] [ref=e697]:
                    - link "Combobox" [ref=e698]:
                      - /url: /docs/components/combobox
                  - generic "Declares 'use client'" [ref=e699]: client
                - paragraph [ref=e701]: A filterable select, following the ARIA combobox pattern.
              - generic [ref=e702] [cursor=pointer]:
                - generic [ref=e704]:
                  - heading [level=3] [ref=e705]:
                    - link "Date picker" [ref=e706]:
                      - /url: /docs/components/date-picker
                  - generic "Declares 'use client'" [ref=e707]: client
                - paragraph [ref=e709]: "A text input with a `Calendar` in a popup."
              - generic [ref=e710] [cursor=pointer]:
                - generic [ref=e712]:
                  - heading [level=3] [ref=e713]:
                    - link "Field" [ref=e714]:
                      - /url: /docs/components/field
                  - generic "Declares 'use client'" [ref=e715]: client
                - paragraph [ref=e717]: Wires a label, hint and error message to a form control.
              - generic [ref=e718] [cursor=pointer]:
                - generic [ref=e720]:
                  - heading [level=3] [ref=e721]:
                    - link "File upload" [ref=e722]:
                      - /url: /docs/components/file-upload
                  - generic "Declares 'use client'" [ref=e723]: client
                - paragraph [ref=e725]: "A dropzone over a real `<input type=\"file\">`."
              - generic [ref=e726] [cursor=pointer]:
                - generic [ref=e728]:
                  - heading [level=3] [ref=e729]:
                    - link "Input" [ref=e730]:
                      - /url: /docs/components/input
                  - generic "Renders on the server" [ref=e731]: server
                - paragraph [ref=e733]: "A text input. Native by design: no wrapper element, so `type`, `pattern`, `autoComplete`, form validation and the browser's own UI all keep working."
              - generic [ref=e734] [cursor=pointer]:
                - generic [ref=e736]:
                  - heading [level=3] [ref=e737]:
                    - link "Label" [ref=e738]:
                      - /url: /docs/components/label
                  - generic "Renders on the server" [ref=e739]: server
                - paragraph [ref=e741]: A form label.
              - generic [ref=e742] [cursor=pointer]:
                - generic [ref=e744]:
                  - heading [level=3] [ref=e745]:
                    - link "Otp input" [ref=e746]:
                      - /url: /docs/components/otp-input
                  - generic "Declares 'use client'" [ref=e747]: client
                - paragraph [ref=e749]: "A one-time-code field: one box per character, one string of state."
              - generic [ref=e750] [cursor=pointer]:
                - generic [ref=e752]:
                  - heading [level=3] [ref=e753]:
                    - link "Password input" [ref=e754]:
                      - /url: /docs/components/password-input
                  - generic "Declares 'use client'" [ref=e755]: client
                - paragraph [ref=e757]: A password field with a reveal toggle and an optional strength meter.
              - generic [ref=e758] [cursor=pointer]:
                - generic [ref=e760]:
                  - heading [level=3] [ref=e761]:
                    - link "Radio group" [ref=e762]:
                      - /url: /docs/components/radio-group
                  - generic "Renders on the server" [ref=e763]: server
                - paragraph [ref=e765]: A group of radios.
              - generic [ref=e766] [cursor=pointer]:
                - generic [ref=e768]:
                  - heading [level=3] [ref=e769]:
                    - link "Rating" [ref=e770]:
                      - /url: /docs/components/rating
                  - generic "Declares 'use client'" [ref=e771]: client
                - paragraph [ref=e773]: A star rating that is a real radio group.
              - generic [ref=e774] [cursor=pointer]:
                - generic [ref=e776]:
                  - heading [level=3] [ref=e777]:
                    - link "Select" [ref=e778]:
                      - /url: /docs/components/select
                  - generic "Renders on the server" [ref=e779]: server
                - paragraph [ref=e781]: "A native `<select>`."
              - generic [ref=e782] [cursor=pointer]:
                - generic [ref=e784]:
                  - heading [level=3] [ref=e785]:
                    - link "Slider" [ref=e786]:
                      - /url: /docs/components/slider
                  - generic "Declares 'use client'" [ref=e787]: client
                - paragraph [ref=e789]: "A slider built on `<input type=\"range\">`."
              - generic [ref=e790] [cursor=pointer]:
                - generic [ref=e792]:
                  - heading [level=3] [ref=e793]:
                    - link "Switch" [ref=e794]:
                      - /url: /docs/components/switch
                  - generic "Renders on the server" [ref=e795]: server
                - paragraph [ref=e797]: An on/off toggle.
              - generic [ref=e798] [cursor=pointer]:
                - generic [ref=e800]:
                  - heading [level=3] [ref=e801]:
                    - link "Tag input" [ref=e802]:
                      - /url: /docs/components/tag-input
                  - generic "Declares 'use client'" [ref=e803]: client
                - paragraph [ref=e805]: A list of tags with a text field on the end.
              - generic [ref=e806] [cursor=pointer]:
                - generic [ref=e808]:
                  - heading [level=3] [ref=e809]:
                    - link "Textarea" [ref=e810]:
                      - /url: /docs/components/textarea
                  - generic "Renders on the server" [ref=e811]: server
                - paragraph [ref=e813]: A multi-line text input.
          - generic [ref=e814]:
            - heading "Overlays (9)" [level=2] [ref=e815]:
              - text: Overlays
              - generic [ref=e816]: (9)
            - generic [ref=e817]:
              - generic [ref=e818] [cursor=pointer]:
                - generic [ref=e820]:
                  - heading [level=3] [ref=e821]:
                    - link "Accordion" [ref=e822]:
                      - /url: /docs/components/accordion
                  - generic "Declares 'use client'" [ref=e823]: client
                - paragraph [ref=e825]: "Accordion — `Accordion`, `Accordion.Item`, `Accordion.Trigger`, `Accordion.Content`."
              - generic [ref=e826] [cursor=pointer]:
                - generic [ref=e828]:
                  - heading [level=3] [ref=e829]:
                    - link "Drawer" [ref=e830]:
                      - /url: /docs/components/drawer
                  - generic "Declares 'use client'" [ref=e831]: client
                - paragraph [ref=e833]: A modal dialog attached to an edge of the viewport.
              - generic [ref=e834] [cursor=pointer]:
                - generic [ref=e836]:
                  - heading [level=3] [ref=e837]:
                    - link "Dropdown menu" [ref=e838]:
                      - /url: /docs/components/dropdown-menu
                  - generic "Declares 'use client'" [ref=e839]: client
                - paragraph [ref=e841]: A button that opens a list of commands.
              - generic [ref=e842] [cursor=pointer]:
                - generic [ref=e844]:
                  - heading [level=3] [ref=e845]:
                    - link "Modal" [ref=e846]:
                      - /url: /docs/components/modal
                  - generic "Declares 'use client'" [ref=e847]: client
                - paragraph [ref=e849]: A centred modal dialog.
              - generic [ref=e850] [cursor=pointer]:
                - generic [ref=e852]:
                  - heading [level=3] [ref=e853]:
                    - link "Popover" [ref=e854]:
                      - /url: /docs/components/popover
                  - generic "Declares 'use client'" [ref=e855]: client
                - paragraph [ref=e857]: A click-triggered non-modal dialog anchored to its trigger.
              - generic [ref=e858] [cursor=pointer]:
                - generic [ref=e860]:
                  - heading [level=3] [ref=e861]:
                    - link "Portal" [ref=e862]:
                      - /url: /docs/components/portal
                  - generic "Declares 'use client'" [ref=e863]: client
                - paragraph [ref=e865]: "Renders its children somewhere else in the DOM — the escape hatch every overlay needs to get out from under `overflow: hidden` and a parent's stacking context."
              - generic [ref=e866] [cursor=pointer]:
                - generic [ref=e868]:
                  - heading [level=3] [ref=e869]:
                    - link "Tabs" [ref=e870]:
                      - /url: /docs/components/tabs
                  - generic "Declares 'use client'" [ref=e871]: client
                - paragraph [ref=e873]: "Tabs — `Tabs`, `Tabs.List`, `Tabs.Tab`, `Tabs.Panels`, `Tabs.Panel`."
              - generic [ref=e874] [cursor=pointer]:
                - generic [ref=e876]:
                  - heading [level=3] [ref=e877]:
                    - link "Toast" [ref=e878]:
                      - /url: /docs/components/toast
                  - generic "Renders on the server" [ref=e879]: server
                - paragraph [ref=e881]: "One notification. `ToastProvider` renders these for you, but it is exported so a static toast can be dropped into a docs page or a form's inline slot."
              - generic [ref=e882] [cursor=pointer]:
                - generic [ref=e884]:
                  - heading [level=3] [ref=e885]:
                    - link "Tooltip" [ref=e886]:
                      - /url: /docs/components/tooltip
                  - generic "Declares 'use client'" [ref=e887]: client
                - paragraph [ref=e889]: A description that appears on hover and on focus.
          - generic [ref=e890]:
            - heading "Navigation (5)" [level=2] [ref=e891]:
              - text: Navigation
              - generic [ref=e892]: (5)
            - generic [ref=e893]:
              - generic [ref=e894] [cursor=pointer]:
                - generic [ref=e896]:
                  - heading [level=3] [ref=e897]:
                    - link "Breadcrumb" [ref=e898]:
                      - /url: /docs/components/breadcrumb
                  - generic "Renders on the server" [ref=e899]: server
                - paragraph [ref=e901]: "Compound component: `Breadcrumb`, `Breadcrumb.Item`, `Breadcrumb.Separator`."
              - generic [ref=e902] [cursor=pointer]:
                - generic [ref=e904]:
                  - heading [level=3] [ref=e905]:
                    - link "Command palette" [ref=e906]:
                      - /url: /docs/components/command-palette
                  - generic "Declares 'use client'" [ref=e907]: client
                - paragraph [ref=e909]: "The ⌘K palette: a search box over a flat list of commands."
              - generic [ref=e910] [cursor=pointer]:
                - generic [ref=e912]:
                  - heading [level=3] [ref=e913]:
                    - link "Navbar" [ref=e914]:
                      - /url: /docs/components/navbar
                  - generic "Declares 'use client'" [ref=e915]: client
                - paragraph [ref=e917]: "Compound component: `Navbar`, `Navbar.Brand`, `Navbar.Links`, `Navbar.Link`, `Navbar.Actions`, `Navbar.Toggle`."
              - generic [ref=e918] [cursor=pointer]:
                - generic [ref=e920]:
                  - heading [level=3] [ref=e921]:
                    - link "Pagination" [ref=e922]:
                      - /url: /docs/components/pagination
                  - generic "Declares 'use client'" [ref=e923]: client
                - paragraph [ref=e925]: Page-by-page navigation.
              - generic [ref=e926] [cursor=pointer]:
                - generic [ref=e928]:
                  - heading [level=3] [ref=e929]:
                    - link "Sidebar" [ref=e930]:
                      - /url: /docs/components/sidebar
                  - generic "Declares 'use client'" [ref=e931]: client
                - paragraph [ref=e933]: "Compound component: `Sidebar`, `Sidebar.Section`, `Sidebar.Item`, `Sidebar.Toggle`."
          - generic [ref=e934]:
            - heading "Data display (12)" [level=2] [ref=e935]:
              - text: Data display
              - generic [ref=e936]: (12)
            - generic [ref=e937]:
              - generic [ref=e938] [cursor=pointer]:
                - generic [ref=e940]:
                  - heading [level=3] [ref=e941]:
                    - link "Avatar" [ref=e942]:
                      - /url: /docs/components/avatar
                  - generic "Renders on the server" [ref=e943]: server
                - paragraph [ref=e945]: "Compound component: `Avatar` and `Avatar.Group`."
              - generic [ref=e946] [cursor=pointer]:
                - generic [ref=e948]:
                  - heading [level=3] [ref=e949]:
                    - link "Badge" [ref=e950]:
                      - /url: /docs/components/badge
                  - generic "Renders on the server" [ref=e951]: server
                - paragraph [ref=e953]: A small status or category label.
              - generic [ref=e954] [cursor=pointer]:
                - generic [ref=e956]:
                  - heading [level=3] [ref=e957]:
                    - link "Card" [ref=e958]:
                      - /url: /docs/components/card
                  - generic "Renders on the server" [ref=e959]: server
                - paragraph [ref=e961]: "Compound component: `Card`, `Card.Header`, `Card.Body`, `Card.Footer`."
              - generic [ref=e962] [cursor=pointer]:
                - generic [ref=e964]:
                  - heading [level=3] [ref=e965]:
                    - link "Data table" [ref=e966]:
                      - /url: /docs/components/data-table
                  - generic "Declares 'use client'" [ref=e967]: client
                - paragraph [ref=e969]: A table with sorting, search, pagination and row selection built in.
              - generic [ref=e970] [cursor=pointer]:
                - generic [ref=e972]:
                  - heading [level=3] [ref=e973]:
                    - link "Editable grid" [ref=e974]:
                      - /url: /docs/components/editable-grid
                  - generic "Declares 'use client'" [ref=e975]: client
                - paragraph [ref=e977]: A spreadsheet-style editable grid.
              - generic [ref=e978] [cursor=pointer]:
                - generic [ref=e980]:
                  - heading [level=3] [ref=e981]:
                    - link "File tree" [ref=e982]:
                      - /url: /docs/components/file-tree
                  - generic "Declares 'use client'" [ref=e983]: client
                - paragraph [ref=e985]: A file tree, implementing the WAI-ARIA treeview pattern.
              - generic [ref=e986] [cursor=pointer]:
                - generic [ref=e988]:
                  - heading [level=3] [ref=e989]:
                    - link "Kanban board" [ref=e990]:
                      - /url: /docs/components/kanban-board
                  - generic "Declares 'use client'" [ref=e991]: client
                - paragraph [ref=e993]: A Kanban board that a keyboard can actually use.
              - generic [ref=e994] [cursor=pointer]:
                - generic [ref=e996]:
                  - heading [level=3] [ref=e997]:
                    - link "Scheduler" [ref=e998]:
                      - /url: /docs/components/scheduler
                  - generic "Declares 'use client'" [ref=e999]: client
                - paragraph [ref=e1001]: A resource scheduler — people, rooms or machines down the side, time across the top.
              - generic [ref=e1002] [cursor=pointer]:
                - generic [ref=e1004]:
                  - heading [level=3] [ref=e1005]:
                    - link "Stepper" [ref=e1006]:
                      - /url: /docs/components/stepper
                  - generic "Declares 'use client'" [ref=e1007]: client
                - paragraph [ref=e1009]: Where the user is in a multi-step flow.
              - generic [ref=e1010] [cursor=pointer]:
                - generic [ref=e1012]:
                  - heading [level=3] [ref=e1013]:
                    - link "Table" [ref=e1014]:
                      - /url: /docs/components/table
                  - generic "Renders on the server" [ref=e1015]: server
                - paragraph [ref=e1017]: "Compound component: `Table`, `Table.Head`, `Table.Body`, `Table.Foot`, `Table.Row`, `Table.Cell`, `Table.HeaderCell`, `Table.Caption`."
              - generic [ref=e1018] [cursor=pointer]:
                - generic [ref=e1020]:
                  - heading [level=3] [ref=e1021]:
                    - link "Timeline" [ref=e1022]:
                      - /url: /docs/components/timeline
                  - generic "Renders on the server" [ref=e1023]: server
                - paragraph [ref=e1025]: "Compound component: `Timeline` and `Timeline.Item`."
              - generic [ref=e1026] [cursor=pointer]:
                - generic [ref=e1028]:
                  - heading [level=3] [ref=e1029]:
                    - link "Virtual list" [ref=e1030]:
                      - /url: /docs/components/virtual-list
                  - generic "Declares 'use client'" [ref=e1031]: client
                - paragraph [ref=e1033]: "Windowed list: renders only the rows on screen."
          - generic [ref=e1034]:
            - heading "AI chat (5)" [level=2] [ref=e1035]:
              - text: AI chat
              - generic [ref=e1036]: (5)
            - generic [ref=e1037]:
              - generic [ref=e1038] [cursor=pointer]:
                - generic [ref=e1040]:
                  - heading [level=3] [ref=e1041]:
                    - link "Chat code block" [ref=e1042]:
                      - /url: /docs/components/chat-code-block
                  - generic "Declares 'use client'" [ref=e1043]: client
                - paragraph [ref=e1045]: "A fenced code block with a copy button, built on `Code`."
              - generic [ref=e1046] [cursor=pointer]:
                - generic [ref=e1048]:
                  - heading [level=3] [ref=e1049]:
                    - link "Chat input" [ref=e1050]:
                      - /url: /docs/components/chat-input
                  - generic "Declares 'use client'" [ref=e1051]: client
                - paragraph [ref=e1053]: "The composer: an auto-growing textarea, an attachment slot, and a send button."
              - generic [ref=e1054] [cursor=pointer]:
                - generic [ref=e1056]:
                  - heading [level=3] [ref=e1057]:
                    - link "Chat message" [ref=e1058]:
                      - /url: /docs/components/chat-message
                  - generic "Renders on the server" [ref=e1059]: server
                - paragraph [ref=e1061]: One turn in a conversation.
              - generic [ref=e1062] [cursor=pointer]:
                - generic [ref=e1064]:
                  - heading [level=3] [ref=e1065]:
                    - link "Chat thread" [ref=e1066]:
                      - /url: /docs/components/chat-thread
                  - generic "Declares 'use client'" [ref=e1067]: client
                - paragraph [ref=e1069]: "Compound component: `ChatThread`, `ChatThread.Message`, `ChatThread.Empty`."
              - generic [ref=e1070] [cursor=pointer]:
                - generic [ref=e1072]:
                  - heading [level=3] [ref=e1073]:
                    - link "Typing indicator" [ref=e1074]:
                      - /url: /docs/components/typing-indicator
                  - generic "Renders on the server" [ref=e1075]: server
                - paragraph [ref=e1077]: Three animated dots meaning "a reply is coming".
          - generic [ref=e1078]:
            - heading "Feedback (5)" [level=2] [ref=e1079]:
              - text: Feedback
              - generic [ref=e1080]: (5)
            - generic [ref=e1081]:
              - generic [ref=e1082] [cursor=pointer]:
                - generic [ref=e1084]:
                  - heading [level=3] [ref=e1085]:
                    - link "Alert" [ref=e1086]:
                      - /url: /docs/components/alert
                  - generic "Renders on the server" [ref=e1087]: server
                - paragraph [ref=e1089]: "A static, inline message. `danger` and `warning` get `role=\"alert\"` so screen readers interrupt for them; `info` and `success` use `role=\"status\"`, which waits for a pause instead of talking over the user."
              - generic [ref=e1090] [cursor=pointer]:
                - generic [ref=e1092]:
                  - heading [level=3] [ref=e1093]:
                    - link "Empty state" [ref=e1094]:
                      - /url: /docs/components/empty-state
                  - generic "Renders on the server" [ref=e1095]: server
                - paragraph [ref=e1097]: "The \"nothing here yet\" block: a glyph, a line explaining what is missing, and the action that fixes it."
              - generic [ref=e1098] [cursor=pointer]:
                - generic [ref=e1100]:
                  - heading [level=3] [ref=e1101]:
                    - link "Progress" [ref=e1102]:
                      - /url: /docs/components/progress
                  - generic "Renders on the server" [ref=e1103]: server
                - paragraph [ref=e1105]: A determinate or indeterminate progress bar.
              - generic [ref=e1106] [cursor=pointer]:
                - generic [ref=e1108]:
                  - heading [level=3] [ref=e1109]:
                    - link "Skeleton" [ref=e1110]:
                      - /url: /docs/components/skeleton
                  - generic "Renders on the server" [ref=e1111]: server
                - paragraph [ref=e1113]: A loading placeholder. Hidden from assistive tech — the live region announces state.
              - generic [ref=e1114] [cursor=pointer]:
                - generic [ref=e1116]:
                  - heading [level=3] [ref=e1117]:
                    - link "Spinner" [ref=e1118]:
                      - /url: /docs/components/spinner
                  - generic "Renders on the server" [ref=e1119]: server
                - paragraph [ref=e1121]: "An indeterminate loading indicator. Inherits `currentColor`."
          - generic [ref=e1122]:
            - heading "Sections (10)" [level=2] [ref=e1123]:
              - text: Sections
              - generic [ref=e1124]: (10)
            - generic [ref=e1125]:
              - generic [ref=e1126] [cursor=pointer]:
                - generic [ref=e1128]:
                  - heading [level=3] [ref=e1129]:
                    - link "Cta" [ref=e1130]:
                      - /url: /docs/components/cta
                  - generic "Renders on the server" [ref=e1131]: server
                - paragraph [ref=e1133]: The closing ask.
              - generic [ref=e1134] [cursor=pointer]:
                - generic [ref=e1136]:
                  - heading [level=3] [ref=e1137]:
                    - link "Faq" [ref=e1138]:
                      - /url: /docs/components/faq
                  - generic "Renders on the server" [ref=e1139]: server
                - paragraph [ref=e1141]: "A frequently-asked-questions list built on native `<details>`/`<summary>`."
              - generic [ref=e1142] [cursor=pointer]:
                - generic [ref=e1144]:
                  - heading [level=3] [ref=e1145]:
                    - link "Feature grid" [ref=e1146]:
                      - /url: /docs/components/feature-grid
                  - generic "Renders on the server" [ref=e1147]: server
                - paragraph [ref=e1149]: A responsive grid of icon + title + description cells.
              - generic [ref=e1150] [cursor=pointer]:
                - generic [ref=e1152]:
                  - heading [level=3] [ref=e1153]:
                    - link "Footer" [ref=e1154]:
                      - /url: /docs/components/footer
                  - generic "Renders on the server" [ref=e1155]: server
                - paragraph [ref=e1157]: The site footer.
              - generic [ref=e1158] [cursor=pointer]:
                - generic [ref=e1160]:
                  - heading [level=3] [ref=e1161]:
                    - link "Hero" [ref=e1162]:
                      - /url: /docs/components/hero
                  - generic "Renders on the server" [ref=e1163]: server
                - paragraph [ref=e1165]: "The top-of-page pitch. Renders from props alone; pass `children` to take the inner layout over completely."
              - generic [ref=e1166] [cursor=pointer]:
                - generic [ref=e1168]:
                  - heading [level=3] [ref=e1169]:
                    - link "Logo cloud" [ref=e1170]:
                      - /url: /docs/components/logo-cloud
                  - generic "Renders on the server" [ref=e1171]: server
                - paragraph [ref=e1173]: A row of customer or partner logos.
              - generic [ref=e1174] [cursor=pointer]:
                - generic [ref=e1176]:
                  - heading [level=3] [ref=e1177]:
                    - link "Newsletter" [ref=e1178]:
                      - /url: /docs/components/newsletter
                  - generic "Declares 'use client'" [ref=e1179]: client
                - paragraph [ref=e1181]: An email capture form.
              - generic [ref=e1182] [cursor=pointer]:
                - generic [ref=e1184]:
                  - heading [level=3] [ref=e1185]:
                    - link "Pricing" [ref=e1186]:
                      - /url: /docs/components/pricing
                  - generic "Renders on the server" [ref=e1187]: server
                - paragraph [ref=e1189]: "A plan comparison table built out of `Card`s."
              - generic [ref=e1190] [cursor=pointer]:
                - generic [ref=e1192]:
                  - heading [level=3] [ref=e1193]:
                    - link "Stats" [ref=e1194]:
                      - /url: /docs/components/stats
                  - generic "Renders on the server" [ref=e1195]: server
                - paragraph [ref=e1197]: A row of headline figures.
              - generic [ref=e1198] [cursor=pointer]:
                - generic [ref=e1200]:
                  - heading [level=3] [ref=e1201]:
                    - link "Testimonials" [ref=e1202]:
                      - /url: /docs/components/testimonials
                  - generic "Renders on the server" [ref=e1203]: server
                - paragraph [ref=e1205]: Customer quotes.
          - generic [ref=e1206]:
            - heading "Media & time (8)" [level=2] [ref=e1207]:
              - text: Media & time
              - generic [ref=e1208]: (8)
            - generic [ref=e1209]:
              - generic [ref=e1210] [cursor=pointer]:
                - generic [ref=e1212]:
                  - heading [level=3] [ref=e1213]:
                    - link "Animated counter" [ref=e1214]:
                      - /url: /docs/components/animated-counter
                  - generic "Declares 'use client'" [ref=e1215]: client
                - paragraph [ref=e1217]: A number that counts up to its value the first time it is scrolled into view.
              - generic [ref=e1218] [cursor=pointer]:
                - generic [ref=e1220]:
                  - heading [level=3] [ref=e1221]:
                    - link "Carousel" [ref=e1222]:
                      - /url: /docs/components/carousel
                  - generic "Renders on the server" [ref=e1223]: server
                - paragraph [ref=e1225]: A carousel built on CSS scroll-snap.
              - generic [ref=e1226] [cursor=pointer]:
                - generic [ref=e1228]:
                  - heading [level=3] [ref=e1229]:
                    - link "Clock" [ref=e1230]:
                      - /url: /docs/components/clock
                  - generic "Declares 'use client'" [ref=e1231]: client
                - paragraph [ref=e1233]: "The current time, ticking, via `Intl.DateTimeFormat` — no date library."
              - generic [ref=e1234] [cursor=pointer]:
                - generic [ref=e1236]:
                  - heading [level=3] [ref=e1237]:
                    - link "Countdown" [ref=e1238]:
                      - /url: /docs/components/countdown
                  - generic "Declares 'use client'" [ref=e1239]: client
                - paragraph [ref=e1241]: A countdown to a fixed moment.
              - generic [ref=e1242] [cursor=pointer]:
                - generic [ref=e1244]:
                  - heading [level=3] [ref=e1245]:
                    - link "Image" [ref=e1246]:
                      - /url: /docs/components/image
                  - generic "Declares 'use client'" [ref=e1247]: client
                - paragraph [ref=e1249]: An image with the box reserved, a loading state, and a failure state.
              - generic [ref=e1250] [cursor=pointer]:
                - generic [ref=e1252]:
                  - heading [level=3] [ref=e1253]:
                    - link "Map embed" [ref=e1254]:
                      - /url: /docs/components/map-embed
                  - generic "Declares 'use client'" [ref=e1255]: client
                - paragraph [ref=e1257]: An embedded map, without the privacy footgun.
              - generic [ref=e1258] [cursor=pointer]:
                - generic [ref=e1260]:
                  - heading [level=3] [ref=e1261]:
                    - link "Marquee" [ref=e1262]:
                      - /url: /docs/components/marquee
                  - generic "Renders on the server" [ref=e1263]: server
                - paragraph [ref=e1265]: "An infinite ticker: the content, then an `aria-hidden` copy of it, translated by exactly half the track so the seam is invisible."
              - generic [ref=e1266] [cursor=pointer]:
                - generic [ref=e1268]:
                  - heading [level=3] [ref=e1269]:
                    - link "Relative time" [ref=e1270]:
                      - /url: /docs/components/relative-time
                  - generic "Declares 'use client'" [ref=e1271]: client
                - paragraph [ref=e1273]: "\"3 minutes ago\", via `Intl.RelativeTimeFormat` — no date library."
          - generic [ref=e1274]:
            - heading "Theming (2)" [level=2] [ref=e1275]:
              - text: Theming
              - generic [ref=e1276]: (2)
            - generic [ref=e1277]:
              - generic [ref=e1278] [cursor=pointer]:
                - generic [ref=e1280]:
                  - heading [level=3] [ref=e1281]:
                    - link "Theme provider" [ref=e1282]:
                      - /url: /docs/components/theme-provider
                  - generic "Declares 'use client'" [ref=e1283]: client
                - paragraph [ref=e1285]: "Owns the theme: resolves it, applies it to `<html>`, persists it, and follows the OS."
              - generic [ref=e1286] [cursor=pointer]:
                - generic [ref=e1288]:
                  - heading [level=3] [ref=e1289]:
                    - link "Theme toggle" [ref=e1290]:
                      - /url: /docs/components/theme-toggle
                  - generic "Declares 'use client'" [ref=e1291]: client
                - paragraph [ref=e1293]: The theme switch every consumer asks for.
  - alert [ref=e1294]
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