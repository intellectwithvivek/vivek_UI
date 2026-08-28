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
  [critical] aria-valid-attr-value: ARIA attributes must conform to valid values
    <button type="button" role="tab" id="_R_j3av5ubt9ftb_-tab-ts" class="vk-tabs__tab" aria-selected="true" aria-controls="_
    <button type="button" role="tab" id="_R_4okav5ubt9ftb_-tab-ts" class="vk-tabs__tab" aria-selected="true" aria-controls="
    <button type="button" role="tab" id="_R_4p4av5ubt9ftb_-tab-ts" class="vk-tabs__tab" aria-selected="true" aria-controls="
  [serious] color-contrast: Elements must meet minimum color contrast ratio thresholds
    <span class="vk-sidebar__label">Scheduler</span>
    <span aria-hidden="true" class="vk-scheduler__time">10:00<!-- -->–<!-- -->12:30</span>
    <span aria-hidden="true" class="vk-scheduler__time">09:30<!-- -->–<!-- -->11:00</span>
  [moderate] landmark-unique: Landmarks should have a unique role or role/label/title (i.e. accessible name) combination
    <nav aria-label="Documentation" class="docs-shell__nav">

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 30

- Array []
+ Array [
+   Object {
+     "help": "ARIA attributes must conform to valid values",
+     "id": "aria-valid-attr-value",
+     "impact": "critical",
+     "nodes": Array [
+       "<button type=\"button\" role=\"tab\" id=\"_R_j3av5ubt9ftb_-tab-ts\" class=\"vk-tabs__tab\" aria-selected=\"true\" aria-controls=\"_",
+       "<button type=\"button\" role=\"tab\" id=\"_R_4okav5ubt9ftb_-tab-ts\" class=\"vk-tabs__tab\" aria-selected=\"true\" aria-controls=\"",
+       "<button type=\"button\" role=\"tab\" id=\"_R_4p4av5ubt9ftb_-tab-ts\" class=\"vk-tabs__tab\" aria-selected=\"true\" aria-controls=\"",
+     ],
+   },
+   Object {
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       "<span class=\"vk-sidebar__label\">Scheduler</span>",
+       "<span aria-hidden=\"true\" class=\"vk-scheduler__time\">10:00<!-- -->–<!-- -->12:30</span>",
+       "<span aria-hidden=\"true\" class=\"vk-scheduler__time\">09:30<!-- -->–<!-- -->11:00</span>",
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
            - paragraph [ref=e515]: Data display
            - heading "Scheduler" [level=1] [ref=e516]
            - paragraph [ref=e517]: A resource scheduler — people, rooms or machines down the side, time across the top.
            - generic [ref=e518]:
              - generic "Declares 'use client'" [ref=e519]: Client component
              - link "Source" [ref=e520] [cursor=pointer]:
                - /url: https://github.com/intellectwithvivek/vivek_UI/tree/main/packages/ui/src/components/scheduler
          - generic [ref=e521]:
            - heading "Import" [level=2] [ref=e522]
            - generic [ref=e523]:
              - generic [ref=e524]:
                - tablist [ref=e526]:
                  - tab "TS" [selected] [ref=e527] [cursor=pointer]
                  - tab "JS" [ref=e528] [cursor=pointer]
                - generic [ref=e529]:
                  - button "Copy" [ref=e530] [cursor=pointer]
                  - status [ref=e531]
              - code [ref=e533]: "import { Scheduler } from '@the_viveksingh/vivek-ui'"
          - generic [ref=e534]:
            - heading "A resource timeline nobody else gives you for free" [level=2] [ref=e535]
            - paragraph [ref=e536]: Rooms, people or machines down the side and time across the top. shadcn/ui, Mantine and Radix ship nothing like it, and MUI puts theirs behind a paid licence. Overlapping bookings stack into lanes so a double-booking is visible rather than hidden underneath.
            - generic [ref=e538]:
              - paragraph [ref=e539]: "Tab into the board and use the arrow keys: left and right walk this resource in time order, up and down jump to the nearest booking on the resource above or below. Every booking carries its resource, its times and its duration in its accessible name, because a timeline says all of that through position alone."
              - group "Studio bookings, 12 March" [ref=e540]:
                - generic [ref=e542]:
                  - generic [ref=e545]:
                    - generic: 09:00
                    - generic: 10:00
                    - generic: 11:00
                    - generic: 12:00
                    - generic: 13:00
                    - generic: 14:00
                    - generic: 15:00
                    - generic: 16:00
                    - generic: 17:00
                  - generic [ref=e546]:
                    - generic [ref=e547]:
                      - generic [ref=e548]: Studio A
                      - generic [ref=e549]: Ground floor · 12 seats
                    - list "Studio A" [ref=e550]:
                      - listitem:
                        - button "Standup. Studio A, 09:00 to 09:30, 30 minutes." [ref=e551] [cursor=pointer]:
                          - generic [ref=e552]: Standup
                          - generic [ref=e553]: 09:00–09:30
                      - listitem:
                        - button "Podcast · episode 41. Studio A, 10:00 to 12:30, 2 hours 30 minutes." [ref=e554] [cursor=pointer]:
                          - generic [ref=e555]: Podcast · episode 41
                          - generic [ref=e556]: 10:00–12:30
                      - listitem:
                        - button "Mic check. Studio A, 11:30 to 12:00, 30 minutes." [ref=e557] [cursor=pointer]:
                          - generic [ref=e558]: Mic check
                          - generic [ref=e559]: 11:30–12:00
                      - listitem:
                        - button "Client call. Studio A, 14:00 to 15:00, 1 hour." [ref=e560] [cursor=pointer]:
                          - generic [ref=e561]: Client call
                          - generic [ref=e562]: 14:00–15:00
                  - generic [ref=e563]:
                    - generic [ref=e564]:
                      - generic [ref=e565]: Studio B
                      - generic [ref=e566]: First floor · 6 seats
                    - list "Studio B" [ref=e567]:
                      - listitem:
                        - button "Voiceover. Studio B, 09:30 to 11:00, 1 hour 30 minutes." [ref=e568] [cursor=pointer]:
                          - generic [ref=e569]: Voiceover
                          - generic [ref=e570]: 09:30–11:00
                      - listitem:
                        - button "Maintenance. Studio B, 13:00 to 16:00, 3 hours." [ref=e571] [cursor=pointer]:
                          - generic [ref=e572]: Maintenance
                          - generic [ref=e573]: 13:00–16:00
                  - generic [ref=e574]:
                    - generic [ref=e575]:
                      - generic [ref=e576]: Edit suite 1
                      - generic [ref=e577]: Colour grade
                    - list "Edit suite 1" [ref=e578]:
                      - listitem:
                        - button "Grade · trailer. Edit suite 1, 09:00 to 13:00, 4 hours." [ref=e579] [cursor=pointer]:
                          - generic [ref=e580]: Grade · trailer
                          - generic [ref=e581]: 09:00–13:00
                      - listitem:
                        - button "Grade · spot. Edit suite 1, 13:30 to 17:00, 3 hours 30 minutes." [ref=e582] [cursor=pointer]:
                          - generic [ref=e583]: Grade · spot
                          - generic [ref=e584]: 13:30–17:00
                  - generic [ref=e585]:
                    - generic [ref=e586]: Edit suite 2
                    - list "Edit suite 2" [ref=e588]:
                      - listitem [ref=e589]: Nothing scheduled
              - paragraph [ref=e590]: Nothing selected yet. Click or press Enter on a booking.
            - generic [ref=e591]:
              - generic [ref=e592]:
                - tablist [ref=e594]:
                  - tab "TS" [selected] [ref=e595] [cursor=pointer]
                  - tab "JS" [ref=e596] [cursor=pointer]
                - generic [ref=e597]:
                  - button "Copy" [ref=e598] [cursor=pointer]
                  - status [ref=e599]
              - code [ref=e601]: "const resources = [ { id: 'studio-a', label: 'Studio A', sublabel: 'Ground floor - 12 seats' }, { id: 'studio-b', label: 'Studio B' }, ] const events = [ { id: '1', resourceId: 'studio-a', title: 'Standup', start: at(9), end: at(9, 30) }, { id: '2', resourceId: 'studio-a', title: 'Podcast', start: at(10), end: at(12, 30), tone: 'accent' }, // Overlaps the podcast, so it is packed into a second lane instead of being hidden. { id: '3', resourceId: 'studio-a', title: 'Mic check', start: at(11, 30), end: at(12) }, { id: '4', resourceId: 'studio-b', title: 'Maintenance', start: at(13), end: at(16), tone: 'warning' }, ] <Scheduler resources={resources} events={events} label=\"Studio bookings, 12 March\" start={at(9)} end={at(18)} // Nothing is mutated for you - the board reports, your state decides. onEventSelect={(event) => setSelected(event)} />"
          - generic [ref=e602]:
            - heading "The keyboard model, which is the whole point" [level=2] [ref=e603]
            - paragraph [ref=e604]: "A timeline conveys everything through position, and position is invisible to a screen reader. So the board is one tab stop with a roving focus, and every booking carries its resource, its times and its duration in its accessible name: \"Podcast. Studio A, 10:00 to 12:30, 2 hours 30 minutes.\""
            - generic [ref=e606]:
              - paragraph [ref=e607]: "Tab into the board and use the arrow keys: left and right walk this resource in time order, up and down jump to the nearest booking on the resource above or below. Every booking carries its resource, its times and its duration in its accessible name, because a timeline says all of that through position alone."
              - group "Studio bookings, 12 March" [ref=e608]:
                - generic [ref=e610]:
                  - generic [ref=e613]:
                    - generic: 09:00
                    - generic: 10:00
                    - generic: 11:00
                    - generic: 12:00
                    - generic: 13:00
                    - generic: 14:00
                    - generic: 15:00
                    - generic: 16:00
                    - generic: 17:00
                  - generic [ref=e614]:
                    - generic [ref=e615]:
                      - generic [ref=e616]: Studio A
                      - generic [ref=e617]: Ground floor · 12 seats
                    - list "Studio A" [ref=e618]:
                      - listitem:
                        - button "Standup. Studio A, 09:00 to 09:30, 30 minutes." [ref=e619] [cursor=pointer]:
                          - generic [ref=e620]: Standup
                          - generic [ref=e621]: 09:00–09:30
                      - listitem:
                        - button "Podcast · episode 41. Studio A, 10:00 to 12:30, 2 hours 30 minutes." [ref=e622] [cursor=pointer]:
                          - generic [ref=e623]: Podcast · episode 41
                          - generic [ref=e624]: 10:00–12:30
                      - listitem:
                        - button "Mic check. Studio A, 11:30 to 12:00, 30 minutes." [ref=e625] [cursor=pointer]:
                          - generic [ref=e626]: Mic check
                          - generic [ref=e627]: 11:30–12:00
                      - listitem:
                        - button "Client call. Studio A, 14:00 to 15:00, 1 hour." [ref=e628] [cursor=pointer]:
                          - generic [ref=e629]: Client call
                          - generic [ref=e630]: 14:00–15:00
                  - generic [ref=e631]:
                    - generic [ref=e632]:
                      - generic [ref=e633]: Studio B
                      - generic [ref=e634]: First floor · 6 seats
                    - list "Studio B" [ref=e635]:
                      - listitem:
                        - button "Voiceover. Studio B, 09:30 to 11:00, 1 hour 30 minutes." [ref=e636] [cursor=pointer]:
                          - generic [ref=e637]: Voiceover
                          - generic [ref=e638]: 09:30–11:00
                      - listitem:
                        - button "Maintenance. Studio B, 13:00 to 16:00, 3 hours." [ref=e639] [cursor=pointer]:
                          - generic [ref=e640]: Maintenance
                          - generic [ref=e641]: 13:00–16:00
                  - generic [ref=e642]:
                    - generic [ref=e643]:
                      - generic [ref=e644]: Edit suite 1
                      - generic [ref=e645]: Colour grade
                    - list "Edit suite 1" [ref=e646]:
                      - listitem:
                        - button "Grade · trailer. Edit suite 1, 09:00 to 13:00, 4 hours." [ref=e647] [cursor=pointer]:
                          - generic [ref=e648]: Grade · trailer
                          - generic [ref=e649]: 09:00–13:00
                      - listitem:
                        - button "Grade · spot. Edit suite 1, 13:30 to 17:00, 3 hours 30 minutes." [ref=e650] [cursor=pointer]:
                          - generic [ref=e651]: Grade · spot
                          - generic [ref=e652]: 13:30–17:00
                  - generic [ref=e653]:
                    - generic [ref=e654]: Edit suite 2
                    - list "Edit suite 2" [ref=e656]:
                      - listitem [ref=e657]: Nothing scheduled
              - paragraph [ref=e658]: Nothing selected yet. Click or press Enter on a booking.
            - generic [ref=e659]:
              - generic [ref=e660]:
                - tablist [ref=e662]:
                  - tab "TS" [selected] [ref=e663] [cursor=pointer]
                  - tab "JS" [ref=e664] [cursor=pointer]
                - generic [ref=e665]:
                  - button "Copy" [ref=e666] [cursor=pointer]
                  - status [ref=e667]
              - code [ref=e669]: "// Left / Right - previous / next booking for this resource, in time order // Up / Down - the nearest booking in time on the resource above / below // Home / End - first / last booking for this resource // Enter, Space - select // Empty resources are skipped by Up and Down: stopping on a row with nothing // in it reads as a dead key. <Scheduler resources={resources} events={events} label=\"Bookings\" />"
          - generic [ref=e670]:
            - heading "The current-time marker, and why it is opt-in" [level=2] [ref=e671]
            - paragraph [ref=e672]: "Reading the clock during render gives the server one marker position and the browser another, which React reports as a hydration mismatch. So the component never does it: showNow reads the clock in an effect after mount, and now takes an explicit time for tests and demos."
            - generic [ref=e674]:
              - paragraph [ref=e675]: "Tab into the board and use the arrow keys: left and right walk this resource in time order, up and down jump to the nearest booking on the resource above or below. Every booking carries its resource, its times and its duration in its accessible name, because a timeline says all of that through position alone."
              - group "Studio bookings, 12 March" [ref=e676]:
                - generic [ref=e678]:
                  - generic [ref=e681]:
                    - generic: 09:00
                    - generic: 10:00
                    - generic: 11:00
                    - generic: 12:00
                    - generic: 13:00
                    - generic: 14:00
                    - generic: 15:00
                    - generic: 16:00
                    - generic: 17:00
                  - generic [ref=e682]:
                    - generic [ref=e683]:
                      - generic [ref=e684]: Studio A
                      - generic [ref=e685]: Ground floor · 12 seats
                    - list "Studio A" [ref=e686]:
                      - listitem:
                        - button "Standup. Studio A, 09:00 to 09:30, 30 minutes." [ref=e687] [cursor=pointer]:
                          - generic [ref=e688]: Standup
                          - generic [ref=e689]: 09:00–09:30
                      - listitem:
                        - button "Podcast · episode 41. Studio A, 10:00 to 12:30, 2 hours 30 minutes." [ref=e690] [cursor=pointer]:
                          - generic [ref=e691]: Podcast · episode 41
                          - generic [ref=e692]: 10:00–12:30
                      - listitem:
                        - button "Mic check. Studio A, 11:30 to 12:00, 30 minutes." [ref=e693] [cursor=pointer]:
                          - generic [ref=e694]: Mic check
                          - generic [ref=e695]: 11:30–12:00
                      - listitem:
                        - button "Client call. Studio A, 14:00 to 15:00, 1 hour." [ref=e696] [cursor=pointer]:
                          - generic [ref=e697]: Client call
                          - generic [ref=e698]: 14:00–15:00
                  - generic [ref=e699]:
                    - generic [ref=e700]:
                      - generic [ref=e701]: Studio B
                      - generic [ref=e702]: First floor · 6 seats
                    - list "Studio B" [ref=e703]:
                      - listitem:
                        - button "Voiceover. Studio B, 09:30 to 11:00, 1 hour 30 minutes." [ref=e704] [cursor=pointer]:
                          - generic [ref=e705]: Voiceover
                          - generic [ref=e706]: 09:30–11:00
                      - listitem:
                        - button "Maintenance. Studio B, 13:00 to 16:00, 3 hours." [ref=e707] [cursor=pointer]:
                          - generic [ref=e708]: Maintenance
                          - generic [ref=e709]: 13:00–16:00
                  - generic [ref=e710]:
                    - generic [ref=e711]:
                      - generic [ref=e712]: Edit suite 1
                      - generic [ref=e713]: Colour grade
                    - list "Edit suite 1" [ref=e714]:
                      - listitem:
                        - button "Grade · trailer. Edit suite 1, 09:00 to 13:00, 4 hours." [ref=e715] [cursor=pointer]:
                          - generic [ref=e716]: Grade · trailer
                          - generic [ref=e717]: 09:00–13:00
                      - listitem:
                        - button "Grade · spot. Edit suite 1, 13:30 to 17:00, 3 hours 30 minutes." [ref=e718] [cursor=pointer]:
                          - generic [ref=e719]: Grade · spot
                          - generic [ref=e720]: 13:30–17:00
                  - generic [ref=e721]:
                    - generic [ref=e722]: Edit suite 2
                    - list "Edit suite 2" [ref=e724]:
                      - listitem [ref=e725]: Nothing scheduled
              - paragraph [ref=e726]: Nothing selected yet. Click or press Enter on a booking.
            - generic [ref=e727]:
              - generic [ref=e728]:
                - tablist [ref=e730]:
                  - tab "TS" [selected] [ref=e731] [cursor=pointer]
                  - tab "JS" [ref=e732] [cursor=pointer]
                - generic [ref=e733]:
                  - button "Copy" [ref=e734] [cursor=pointer]
                  - status [ref=e735]
              - code [ref=e737]: "// Reads the clock after mount, then ticks once a minute. <Scheduler resources={resources} events={events} label=\"Today\" showNow /> // Or pin it, which is what the demo above does so the docs never shift. <Scheduler resources={resources} events={events} label=\"Today\" now={at(13, 20)} /> // Times are written by a deterministic HH:MM formatter rather than // Intl.DateTimeFormat, whose output varies between Node builds and browsers. // Pass your own for a 12-hour clock: <Scheduler resources={resources} events={events} label=\"Today\" formatTime={(d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} />"
          - separator [ref=e738]
          - generic [ref=e739]:
            - heading "Props" [level=2] [ref=e740]
            - paragraph [ref=e741]: Generated from the package's own type declarations, so this table cannot drift from the code.
            - table [ref=e743]:
              - caption [ref=e744]: Props for Scheduler
              - rowgroup [ref=e745]:
                - row [ref=e746]:
                  - columnheader "Prop" [ref=e747]
                  - columnheader "Type" [ref=e748]
                  - columnheader "Default" [ref=e749]
                  - columnheader "Description" [ref=e750]
              - rowgroup [ref=e751]:
                - row [ref=e752]:
                  - cell "resources required" [ref=e753]:
                    - code [ref=e754]: resources
                    - generic [ref=e755]: required
                  - cell [ref=e756]:
                    - code [ref=e757]: readonly SchedulerResource[]
                  - cell "—" [ref=e758]
                  - cell "—" [ref=e759]
                - row [ref=e760]:
                  - cell "events required" [ref=e761]:
                    - code [ref=e762]: events
                    - generic [ref=e763]: required
                  - cell [ref=e764]:
                    - code [ref=e765]: readonly SchedulerEvent[]
                  - cell "—" [ref=e766]
                  - cell "—" [ref=e767]
                - row [ref=e768]:
                  - cell "label required" [ref=e769]:
                    - code [ref=e770]: label
                    - generic [ref=e771]: required
                  - cell [ref=e772]:
                    - code [ref=e773]: string
                  - cell "—" [ref=e774]
                  - cell "Required. A timeline with no accessible name is one more unlabelled region." [ref=e775]
                - row [ref=e776]:
                  - cell [ref=e777]:
                    - code [ref=e778]: start
                  - cell [ref=e779]:
                    - code [ref=e780]: Date | number
                  - cell "—" [ref=e781]
                  - cell "Window start. Defaults to the earliest event, floored to the step." [ref=e782]
                - row [ref=e783]:
                  - cell [ref=e784]:
                    - code [ref=e785]: end
                  - cell [ref=e786]:
                    - code [ref=e787]: Date | number
                  - cell "—" [ref=e788]
                  - cell "Window end. Defaults to the latest event, ceiled to the step." [ref=e789]
                - row [ref=e790]:
                  - cell [ref=e791]:
                    - code [ref=e792]: step
                  - cell [ref=e793]:
                    - code [ref=e794]: number
                  - cell "—" [ref=e795]
                  - cell "Minutes between axis ticks. Default 60." [ref=e796]
                - row [ref=e797]:
                  - cell [ref=e798]:
                    - code [ref=e799]: minTickWidth
                  - cell [ref=e800]:
                    - code [ref=e801]: number
                  - cell "—" [ref=e802]
                  - cell "Minimum pixels per tick. Below this the timeline scrolls rather than crushing." [ref=e803]
                - row [ref=e804]:
                  - cell [ref=e805]:
                    - code [ref=e806]: showNow
                  - cell [ref=e807]:
                    - code [ref=e808]: boolean
                  - cell "—" [ref=e809]
                  - cell "Draw the current-time marker. Left to itself this component never reads the clock during render — that would produce a different marker on the server and the client, which React reports as a hydration mismatch. The clock is read in an effect, after mount." [ref=e810]
                - row [ref=e811]:
                  - cell [ref=e812]:
                    - code [ref=e813]: now
                  - cell [ref=e814]:
                    - code [ref=e815]: Date | number
                  - cell "—" [ref=e816]
                  - 'cell "An explicit \"now\", which overrides {@link showNow}''s clock. Useful in tests and demos." [ref=e817]'
                - row [ref=e818]:
                  - cell [ref=e819]:
                    - code [ref=e820]: onEventSelect
                  - cell [ref=e821]:
                    - code [ref=e822]: "(event: SchedulerEvent) => void"
                  - cell "—" [ref=e823]
                  - cell "—" [ref=e824]
                - row [ref=e825]:
                  - cell [ref=e826]:
                    - code [ref=e827]: renderEvent
                  - cell [ref=e828]:
                    - code [ref=e829]: "(event: SchedulerEvent, resource: SchedulerResource) => ReactNode"
                  - cell "—" [ref=e830]
                  - cell "Rendered instead of the default title + time. The wrapper button stays ours." [ref=e831]
                - row [ref=e832]:
                  - cell [ref=e833]:
                    - code [ref=e834]: formatTime
                  - cell [ref=e835]:
                    - code [ref=e836]: "(value: Date) => string"
                  - cell "—" [ref=e837]
                  - 'cell "How a time is written, in the axis and in every accessible name. The default is a deterministic 24-hour `HH:MM` rather than `Intl.DateTimeFormat`, because ICU output varies between Node builds and browsers — the same code would render differently for two of your users. Pass your own for 12-hour clocks or other locales." [ref=e838]'
                - row [ref=e839]:
                  - cell [ref=e840]:
                    - code [ref=e841]: className
                  - cell [ref=e842]:
                    - code [ref=e843]: string
                  - cell "—" [ref=e844]
                  - cell "—" [ref=e845]
          - generic [ref=e846]:
            - heading "Rendering" [level=2] [ref=e847]
            - alert [ref=e848]:
              - generic [ref=e849]: "!"
              - generic [ref=e850]:
                - generic [ref=e851]: Client component
                - paragraph [ref=e853]:
                  - code [ref=e854]: Scheduler
                  - text: declares
                  - code [ref=e855]: "'use client'"
                  - text: because it needs state, effects or event handlers. Importing it into a Server Component creates a client boundary at this component — everything above it stays on the server.
          - separator [ref=e856]
          - navigation "Adjacent components" [ref=e857]:
            - link "← Kanban board" [ref=e858] [cursor=pointer]:
              - /url: /docs/components/kanban-board
            - link "Stepper →" [ref=e859] [cursor=pointer]:
              - /url: /docs/components/stepper
  - alert [ref=e860]
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