# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> accessibility of the composed pages >> /showcase/pulse-analytics has no axe violations
- Location: e2e\a11y.spec.ts:36:9

# Error details

```
Error: 
  [serious] scrollable-region-focusable: Scrollable region must have keyboard access
    <pre class="vk-code vk-code--block" data-size="sm"><code class="vk-code__inner">git clone https://github.com/intellectwi

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 10

- Array []
+ Array [
+   Object {
+     "help": "Scrollable region must have keyboard access",
+     "id": "scrollable-region-focusable",
+     "impact": "serious",
+     "nodes": Array [
+       "<pre class=\"vk-code vk-code--block\" data-size=\"sm\"><code class=\"vk-code__inner\">git clone https://github.com/intellectwi",
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
      - navigation "Breadcrumb" [ref=e20]:
        - list [ref=e21]:
          - listitem [ref=e22]:
            - link "Home" [ref=e23] [cursor=pointer]:
              - /url: /
          - listitem [ref=e24]
          - listitem [ref=e27]:
            - link "Showcase" [ref=e28] [cursor=pointer]:
              - /url: /showcase
          - listitem [ref=e29]
          - listitem [ref=e32]:
            - generic [ref=e33]: Pulse Analytics
      - generic [ref=e34]:
        - paragraph [ref=e35]: SaaS
        - heading "Pulse Analytics" [level=1] [ref=e36]
        - paragraph [ref=e37]: "A SaaS landing page plus a full analytics dashboard: all six VivekUI charts, a data table and a kanban board."
        - generic [ref=e38]:
          - link "Visit the live site ↗" [ref=e39] [cursor=pointer]:
            - /url: https://pulseanalytics.vivekkumarsingh.in
          - link "Source on GitHub ↗" [ref=e40] [cursor=pointer]:
            - /url: https://github.com/intellectwithvivek/Pulse-Analytics
          - generic [ref=e41]: MIT licensed
      - generic [ref=e42]:
        - heading "Live preview" [level=2] [ref=e43]
        - paragraph [ref=e44]: The real pulseanalytics.vivekkumarsingh.in, in a frame with its own viewport — so the phone and tablet widths below are the site's actual breakpoints, not this page's.
        - generic [ref=e45]:
          - generic [ref=e46]:
            - group "Preview width" [ref=e47]:
              - generic [ref=e48]:
                - button "Phone" [ref=e49] [cursor=pointer]
                - button "Tablet" [ref=e50] [cursor=pointer]
                - button "Desktop" [pressed] [ref=e51] [cursor=pointer]
            - paragraph [ref=e52]: Full width · the frame has its own viewport, so the breakpoints are real
          - generic [ref=e53]:
            - generic [ref=e54]:
              - generic [ref=e59]: pulseanalytics.vivekkumarsingh.in
              - link "Open live site ↗" [ref=e60] [cursor=pointer]:
                - /url: https://pulseanalytics.vivekkumarsingh.in
            - generic [ref=e62]:
              - generic [ref=e63]: Pulse Analytics
              - iframe [ref=e65]:
                - generic [ref=f1e1]:
                  - link "Skip to content" [ref=f1e2] [cursor=pointer]:
                    - /url: "#main"
                  - navigation "Main" [ref=f1e3]:
                    - generic [ref=f1e4]:
                      - link "Pulse" [ref=f1e5] [cursor=pointer]:
                        - /url: /
                      - generic [ref=f1e10]:
                        - button "Switch to light theme" [ref=f1e11] [cursor=pointer]
                        - link "Login" [ref=f1e15] [cursor=pointer]:
                          - /url: /dashboard
                      - button "Open menu" [ref=f1e16] [cursor=pointer]
                  - main [ref=f1e19]:
                    - region "Product analytics you can read at a glance" [ref=f1e20]:
                      - generic [ref=f1e22]:
                        - generic [ref=f1e23]:
                          - generic [ref=f1e24]: Free & open source · MIT
                          - heading "Product analytics you can read at a glance" [level=1] [ref=f1e26]
                          - paragraph [ref=f1e27]: Pulse turns your event stream into the four numbers your team actually argues about — and the six charts that explain them. This entire site, dashboard included, is a free Next.js template.
                          - generic [ref=f1e28]:
                            - link "Open the live dashboard" [ref=f1e29] [cursor=pointer]:
                              - /url: /dashboard
                            - link "See how it is built" [ref=f1e30] [cursor=pointer]:
                              - /url: /built-with
                        - generic [ref=f1e32]:
                          - generic [ref=f1e33]: pulse.app/dashboard
                          - generic [ref=f1e38]:
                            - generic [ref=f1e39]:
                              - generic [ref=f1e40]:
                                - paragraph [ref=f1e41]: Revenue · last 14 days
                                - paragraph [ref=f1e42]: $96.4k
                              - generic [ref=f1e43]: live
                            - generic [ref=f1e44]:
                              - img "Daily revenue over the last fourteen days" [ref=f1e45]:
                                - generic [ref=f1e46]:
                                  - generic [ref=f1e47]: "0"
                                  - generic [ref=f1e48]: "2"
                                  - generic [ref=f1e49]: "4"
                                  - generic [ref=f1e50]: "6"
                                  - generic [ref=f1e51]: "8"
                                  - generic [ref=f1e52]: Aug 11
                                  - generic [ref=f1e53]: Aug 13
                                  - generic [ref=f1e54]: Aug 15
                                  - generic [ref=f1e55]: Aug 17
                                  - generic [ref=f1e56]: Aug 19
                                  - generic [ref=f1e57]: Aug 21
                                  - generic [ref=f1e58]: Aug 23
                              - table [ref=f1e76]:
                                - caption [ref=f1e77]: Daily revenue over the last fourteen days
                                - rowgroup [ref=f1e78]:
                                  - row [ref=f1e79]:
                                    - columnheader "Day" [ref=f1e80]
                                    - columnheader "Revenue" [ref=f1e81]
                                - rowgroup [ref=f1e82]:
                                  - row [ref=f1e83]:
                                    - rowheader "Aug 11" [ref=f1e84]
                                    - cell "$3.6k" [ref=f1e85]
                                  - row [ref=f1e86]:
                                    - rowheader "Aug 12" [ref=f1e87]
                                    - cell "$3.2k" [ref=f1e88]
                                  - row [ref=f1e89]:
                                    - rowheader "Aug 13" [ref=f1e90]
                                    - cell "$6.9k" [ref=f1e91]
                                  - row [ref=f1e92]:
                                    - rowheader "Aug 14" [ref=f1e93]
                                    - cell "$7.2k" [ref=f1e94]
                                  - row [ref=f1e95]:
                                    - rowheader "Aug 15" [ref=f1e96]
                                    - cell "$7.0k" [ref=f1e97]
                                  - row [ref=f1e98]:
                                    - rowheader "Aug 16" [ref=f1e99]
                                    - cell "$7.5k" [ref=f1e100]
                                  - row [ref=f1e101]:
                                    - rowheader "Aug 17" [ref=f1e102]
                                    - cell "$7.8k" [ref=f1e103]
                                  - row [ref=f1e104]:
                                    - rowheader "Aug 18" [ref=f1e105]
                                    - cell "$4.1k" [ref=f1e106]
                                  - row [ref=f1e107]:
                                    - rowheader "Aug 19" [ref=f1e108]
                                    - cell "$3.7k" [ref=f1e109]
                                  - row [ref=f1e110]:
                                    - rowheader "Aug 20" [ref=f1e111]
                                    - cell "$8.0k" [ref=f1e112]
                                  - row [ref=f1e113]:
                                    - rowheader "Aug 21" [ref=f1e114]
                                    - cell "$8.3k" [ref=f1e115]
                                  - row [ref=f1e116]:
                                    - rowheader "Aug 22" [ref=f1e117]
                                    - cell "$8.1k" [ref=f1e118]
                                  - row [ref=f1e119]:
                                    - rowheader "Aug 23" [ref=f1e120]
                                    - cell "$8.6k" [ref=f1e121]
                                  - row [ref=f1e122]:
                                    - rowheader "Aug 24" [ref=f1e123]
                                    - cell "$9.0k" [ref=f1e124]
                            - generic [ref=f1e125]:
                              - generic [ref=f1e126]:
                                - paragraph [ref=f1e127]: MRR
                                - paragraph [ref=f1e128]: $148.2k
                                - img "Monthly recurring revenue trend" [ref=f1e130]
                              - generic [ref=f1e134]:
                                - paragraph [ref=f1e135]: Active users
                                - paragraph [ref=f1e136]: 38,914
                                - img "Weekly active users trend" [ref=f1e138]
                              - generic [ref=f1e142]:
                                - paragraph [ref=f1e143]: Churn
                                - paragraph [ref=f1e144]: 1.8%
                                - img "Net revenue churn trend" [ref=f1e146]
                              - generic [ref=f1e150]:
                                - paragraph [ref=f1e151]: NPS
                                - paragraph [ref=f1e152]: "61"
                                - img "Net promoter score trend" [ref=f1e154]
                    - region "Trusted by product teams at" [ref=f1e158]:
                      - generic [ref=f1e160]:
                        - heading "Trusted by product teams at" [level=2] [ref=f1e161]
                        - list [ref=f1e162]:
                          - listitem [ref=f1e163]:
                            - img "Northwind Labs" [ref=f1e164]:
                              - generic [ref=f1e165]: Northwind
                          - listitem [ref=f1e168]:
                            - img "Aster Financial" [ref=f1e169]:
                              - generic [ref=f1e170]: Aster
                          - listitem [ref=f1e174]:
                            - img "Fathom Robotics" [ref=f1e175]:
                              - generic [ref=f1e176]: Fathom
                          - listitem [ref=f1e180]:
                            - img "Orchid Biotech" [ref=f1e181]:
                              - generic [ref=f1e182]: Orchid
                          - listitem [ref=f1e185]:
                            - img "Meridian Legal" [ref=f1e186]:
                              - generic [ref=f1e187]: Meridian
                          - listitem [ref=f1e190]:
                            - img "Juniper Retail" [ref=f1e191]:
                              - generic [ref=f1e192]: Juniper
                    - region "Six things that make a metric useful" [ref=f1e195]:
                      - generic [ref=f1e196]:
                        - generic [ref=f1e197]:
                          - generic [ref=f1e198]: Why Pulse
                          - heading "Six things that make a metric useful" [level=2] [ref=f1e200]
                          - paragraph [ref=f1e201]: A number without context is trivia. Everything here exists to put a number next to the reason it moved.
                        - list [ref=f1e202]:
                          - listitem [ref=f1e203]:
                            - generic [ref=f1e204]: ◎
                            - heading "Autocapture, then narrow" [level=3] [ref=f1e205]
                            - paragraph [ref=f1e206]: Track every click and pageview on day one, then define the twelve events that actually matter once you know what people do.
                          - listitem [ref=f1e207]:
                            - generic [ref=f1e208]: ⤸
                            - heading "Funnels that explain themselves" [level=3] [ref=f1e209]
                            - paragraph [ref=f1e210]: Every step breaks down by plan, country or campaign without leaving the chart, so "why did it drop" takes one click, not a query.
                          - listitem [ref=f1e211]:
                            - generic [ref=f1e212]: ⊞
                            - heading "Retention by cohort" [level=3] [ref=f1e213]
                            - paragraph [ref=f1e214]: Compare the month you shipped onboarding against the month before it. Three cohorts on one axis, no spreadsheet export.
                          - listitem [ref=f1e215]:
                            - generic [ref=f1e216]: ◬
                            - heading "Alerts without thresholds" [level=3] [ref=f1e217]
                            - paragraph [ref=f1e218]: Pulse learns each metric baseline and flags the spike or the drop. You set no numbers and get no 3am false positives.
                          - listitem [ref=f1e219]:
                            - generic [ref=f1e220]: ▷
                            - heading "Replay the session behind a number" [level=3] [ref=f1e221]
                            - paragraph [ref=f1e222]: Click any point on any chart to watch the sessions that produced it. The number stops being an abstraction.
                          - listitem [ref=f1e223]:
                            - generic [ref=f1e224]: ⇄
                            - heading "Your warehouse stays the source" [level=3] [ref=f1e225]
                            - paragraph [ref=f1e226]: Two-way sync with Snowflake and BigQuery. Cohorts you define in Pulse land back in your own tables.
                    - region "Running quietly at scale" [ref=f1e227]:
                      - generic [ref=f1e228]:
                        - generic [ref=f1e229]:
                          - generic [ref=f1e230]: By the numbers
                          - heading "Running quietly at scale" [level=2] [ref=f1e232]
                          - paragraph [ref=f1e233]: Figures count up once when they scroll into view, and stay put under reduced-motion.
                        - generic [ref=f1e234]:
                          - generic [ref=f1e235]:
                            - term [ref=f1e236]: Events ingested each month
                            - definition [ref=f1e237]:
                              - generic [ref=f1e238]:
                                - generic [ref=f1e239]: 0.0B
                                - generic [ref=f1e240]: 4.2B
                            - definition [ref=f1e241]: Across every workspace on the platform.
                          - generic [ref=f1e242]:
                            - term [ref=f1e243]: Weekly active users
                            - definition [ref=f1e244]:
                              - generic [ref=f1e245]:
                                - generic [ref=f1e246]: "0"
                                - generic [ref=f1e247]: 38,914
                            - definition [ref=f1e248]: Product managers, engineers and analysts.
                          - generic [ref=f1e249]:
                            - term [ref=f1e250]: Median query latency
                            - definition [ref=f1e251]:
                              - generic [ref=f1e252]:
                                - generic [ref=f1e253]: 0ms
                                - generic [ref=f1e254]: 94ms
                            - definition [ref=f1e255]: p50 across all dashboard reads.
                          - generic [ref=f1e256]:
                            - term [ref=f1e257]: Uptime last 90 days
                            - definition [ref=f1e258]:
                              - generic [ref=f1e259]:
                                - generic [ref=f1e260]: 0.00%
                                - generic [ref=f1e261]: 99.98%
                            - definition [ref=f1e262]: Measured from outside our own network.
                    - region "What teams say once they have shipped with it" [ref=f1e263]:
                      - generic [ref=f1e264]:
                        - generic [ref=f1e265]:
                          - generic [ref=f1e266]: Customers
                          - heading "What teams say once they have shipped with it" [level=2] [ref=f1e268]
                        - list [ref=f1e269]:
                          - listitem [ref=f1e270]:
                            - figure "Mei Lin Chen Mei Lin Chen VP Product, Aster Financial" [ref=f1e272]:
                              - blockquote [ref=f1e273]: We replaced a dashboard nobody opened with four charts everybody argues about. That is the upgrade — the arguments are now about the product instead of about the data.
                              - generic [ref=f1e274]:
                                - img "Mei Lin Chen" [ref=f1e276]
                                - generic [ref=f1e277]:
                                  - generic [ref=f1e278]: Mei Lin Chen
                                  - generic [ref=f1e279]: VP Product, Aster Financial
                          - listitem [ref=f1e280]:
                            - figure "Jonas Weber Jonas Weber Head of Growth, Fathom Robotics" [ref=f1e282]:
                              - blockquote [ref=f1e283]: The cohort view found our onboarding regression in about nine minutes. Our previous tool had the same data and took a fortnight and a data scientist.
                              - generic [ref=f1e284]:
                                - img "Jonas Weber" [ref=f1e286]
                                - generic [ref=f1e287]:
                                  - generic [ref=f1e288]: Jonas Weber
                                  - generic [ref=f1e289]: Head of Growth, Fathom Robotics
                          - listitem [ref=f1e290]:
                            - figure "Amara Okafor Amara Okafor Staff Engineer, Northwind Labs" [ref=f1e292]:
                              - blockquote [ref=f1e293]: Anomaly alerts with no thresholds sounded like marketing. Six weeks in it has paged us twice, and both times it was right.
                              - generic [ref=f1e294]:
                                - img "Amara Okafor" [ref=f1e296]
                                - generic [ref=f1e297]:
                                  - generic [ref=f1e298]: Amara Okafor
                                  - generic [ref=f1e299]: Staff Engineer, Northwind Labs
                    - region "Three plans, no sales call to see the price" [ref=f1e300]:
                      - generic [ref=f1e301]:
                        - generic [ref=f1e302]:
                          - generic [ref=f1e303]: Pricing
                          - heading "Three plans, no sales call to see the price" [level=2] [ref=f1e305]
                          - paragraph [ref=f1e306]: Billed monthly or yearly. Every plan includes all six chart types — they are part of the component library, not an add-on.
                        - list [ref=f1e307]:
                          - listitem [ref=f1e308]:
                            - generic [ref=f1e309]:
                              - generic [ref=f1e310]:
                                - heading "Free" [level=3] [ref=f1e312]
                                - generic [ref=f1e313]:
                                  - generic [ref=f1e314]: $0
                                  - generic [ref=f1e315]: forever
                                - paragraph [ref=f1e316]: For a side project, or for finding out whether the numbers add up.
                              - list [ref=f1e318]:
                                - listitem [ref=f1e319]: 10,000 tracked events / month
                                - listitem [ref=f1e320]: 3 team members
                                - listitem [ref=f1e321]: 30-day data retention
                                - listitem [ref=f1e322]: All six chart types
                                - listitem [ref=f1e323]: Community support
                              - link "Start free" [ref=f1e325] [cursor=pointer]:
                                - /url: /pricing
                          - listitem [ref=f1e326]:
                            - generic [ref=f1e327]:
                              - generic [ref=f1e328]:
                                - generic [ref=f1e329]:
                                  - heading "Pro" [level=3] [ref=f1e330]
                                  - generic [ref=f1e331]: Most popular
                                - generic [ref=f1e332]:
                                  - generic [ref=f1e333]: $49
                                  - generic [ref=f1e334]: /month
                                - paragraph [ref=f1e335]: For a product team that needs to answer questions the same day.
                              - list [ref=f1e337]:
                                - listitem [ref=f1e338]: 1M tracked events / month
                                - listitem [ref=f1e339]: Unlimited team members
                                - listitem [ref=f1e340]: 12-month data retention
                                - listitem [ref=f1e341]: Funnels, cohorts and session replay
                                - listitem [ref=f1e342]: Anomaly alerts on any metric
                                - listitem [ref=f1e343]: Email and chat support
                              - link "Start 14-day trial" [ref=f1e345] [cursor=pointer]:
                                - /url: /pricing
                          - listitem [ref=f1e346]:
                            - generic [ref=f1e347]:
                              - generic [ref=f1e348]:
                                - heading "Team" [level=3] [ref=f1e350]
                                - generic [ref=f1e351]:
                                  - generic [ref=f1e352]: $149
                                  - generic [ref=f1e353]: /month
                                - paragraph [ref=f1e354]: For several product teams sharing one source of truth.
                              - list [ref=f1e356]:
                                - listitem [ref=f1e357]: 10M tracked events / month
                                - listitem [ref=f1e358]: SAML single sign-on
                                - listitem [ref=f1e359]: Unlimited data retention
                                - listitem [ref=f1e360]: Warehouse sync and raw event export
                                - listitem [ref=f1e361]: Audit log and role-based access
                                - listitem [ref=f1e362]: Dedicated Slack channel
                              - link "Talk to sales" [ref=f1e364] [cursor=pointer]:
                                - /url: /pricing
                    - paragraph [ref=f1e367]:
                      - text: Need the yearly discount, the feature-by-feature comparison, or the FAQ?
                      - link "See full pricing" [ref=f1e368] [cursor=pointer]:
                        - /url: /pricing
                      - text: .
                    - region "Questions about the template" [ref=f1e369]:
                      - generic [ref=f1e370]:
                        - generic [ref=f1e371]:
                          - generic [ref=f1e372]: FAQ
                          - heading "Questions about the template" [level=2] [ref=f1e374]
                        - generic [ref=f1e375]:
                          - group [ref=f1e376]:
                            - heading "Does this template include charts?" [level=3] [ref=f1e378] [cursor=pointer]
                            - paragraph [ref=f1e380]: Yes — all six of them, and no chart library is installed. The area, bar, line, pie, progress ring and sparkline charts on this site all come from @the_viveksingh/vivek-ui, which has zero runtime dependencies. They are pure SVG with no measurement step, so they render on the server and appear in the HTML before any JavaScript loads. There is no Recharts, no Chart.js and no D3 in package.json.
                          - group [ref=f1e381]:
                            - heading "Is the dashboard responsive?" [level=3] [ref=f1e383] [cursor=pointer]
                          - group [ref=f1e384]:
                            - heading "Can I connect a real backend?" [level=3] [ref=f1e386] [cursor=pointer]
                          - group [ref=f1e387]:
                            - heading "Is it free for commercial use?" [level=3] [ref=f1e389] [cursor=pointer]
                    - region "Clone it, rename it, ship it" [ref=f1e390]:
                      - generic [ref=f1e392]:
                        - generic [ref=f1e393]:
                          - generic [ref=f1e394]: Take the whole thing
                          - heading "Clone it, rename it, ship it" [level=2] [ref=f1e396]
                          - paragraph [ref=f1e397]: Marketing site, dashboard, six charts, sitemap, structured data and a README. MIT licensed.
                        - generic [ref=f1e398]:
                          - link "Use this template" [ref=f1e399] [cursor=pointer]:
                            - /url: https://github.com/intellectwithvivek/Pulse-Analytics
                          - link "Component map" [ref=f1e400] [cursor=pointer]:
                            - /url: /built-with
                    - generic [ref=f1e402]:
                      - generic [ref=f1e403]: Changelog
                      - generic [ref=f1e405]:
                        - generic [ref=f1e406]: Product changelog, once a fortnight
                        - paragraph [ref=f1e407]: What shipped, what broke, and the numbers behind both. No drip campaign.
                        - generic [ref=f1e408]:
                          - generic [ref=f1e409]: Email address
                          - textbox "Email address" [ref=f1e410]:
                            - /placeholder: you@company.com
                          - button "Subscribe" [ref=f1e411] [cursor=pointer]
                        - paragraph [ref=f1e412]: No backend in this template — the form resolves locally so you can see the states.
                  - contentinfo [ref=f1e413]:
                    - generic [ref=f1e414]:
                      - generic [ref=f1e415]:
                        - generic [ref=f1e417]:
                          - generic [ref=f1e418]: Pulse
                          - paragraph [ref=f1e422]: Built with ❤️ using VivekUI — 91 React components · 6 SVG charts · zero runtime dependencies. One install, one CSS import, no config.
                          - generic [ref=f1e424]:
                            - code [ref=f1e425]: npm i @the_viveksingh/vivek-ui
                            - generic [ref=f1e426]:
                              - button "Copy" [ref=f1e427] [cursor=pointer]
                              - status [ref=f1e428]
                        - navigation "Footer" [ref=f1e429]:
                          - generic [ref=f1e430]:
                            - heading "Product" [level=2] [ref=f1e431]
                            - list [ref=f1e432]:
                              - listitem [ref=f1e433]:
                                - link "Overview" [ref=f1e434] [cursor=pointer]:
                                  - /url: /
                              - listitem [ref=f1e435]:
                                - link "Pricing" [ref=f1e436] [cursor=pointer]:
                                  - /url: /pricing
                              - listitem [ref=f1e437]:
                                - link "Dashboard demo" [ref=f1e438] [cursor=pointer]:
                                  - /url: /dashboard
                              - listitem [ref=f1e439]:
                                - link "Customers" [ref=f1e440] [cursor=pointer]:
                                  - /url: /dashboard/customers
                          - generic [ref=f1e441]:
                            - heading "Template" [level=2] [ref=f1e442]
                            - list [ref=f1e443]:
                              - listitem [ref=f1e444]:
                                - link "Built with VivekUI" [ref=f1e445] [cursor=pointer]:
                                  - /url: /built-with
                              - listitem [ref=f1e446]:
                                - link "Roadmap board" [ref=f1e447] [cursor=pointer]:
                                  - /url: /dashboard/roadmap
                              - listitem [ref=f1e448]:
                                - link "Reports" [ref=f1e449] [cursor=pointer]:
                                  - /url: /dashboard/reports
                              - listitem [ref=f1e450]:
                                - link "Use this template" [ref=f1e451] [cursor=pointer]:
                                  - /url: https://github.com/intellectwithvivek/Pulse-Analytics
                          - generic [ref=f1e452]:
                            - heading "VivekUI" [level=2] [ref=f1e453]
                            - list [ref=f1e454]:
                              - listitem [ref=f1e455]:
                                - link "Documentation" [ref=f1e456] [cursor=pointer]:
                                  - /url: https://ui.vivekkumarsingh.in/docs?utm_source=vivekui-template&utm_campaign=saas&utm_medium=footer
                              - listitem [ref=f1e457]:
                                - link "npm package" [ref=f1e458] [cursor=pointer]:
                                  - /url: https://www.npmjs.com/package/@the_viveksingh/vivek-ui
                              - listitem [ref=f1e459]:
                                - link "GitHub" [ref=f1e460] [cursor=pointer]:
                                  - /url: https://github.com/intellectwithvivek/vivek_UI
                              - listitem [ref=f1e461]:
                                - link "Vivek Kumar Singh" [ref=f1e462] [cursor=pointer]:
                                  - /url: https://vivekkumarsingh.in/?utm_source=vivekui-template&utm_campaign=saas&utm_medium=footer
                      - separator [ref=f1e463]
                      - paragraph [ref=f1e465]: MIT licensed. Free for commercial use — the credit is removable, a star is appreciated.
                  - alert [ref=f1e466]
      - generic [ref=e66]:
        - heading "Clone it" [level=2] [ref=e67]
        - paragraph [ref=e68]: The most complete of the twelve, and the one to look at if you are evaluating the library for an internal tool. Every chart the library ships appears here in context, alongside a table that sorts, searches and paginates, and a board that can be driven entirely from the keyboard.
        - generic [ref=e69]:
          - generic [ref=e70]:
            - radiogroup "Code language" [ref=e71]:
              - radio "TS" [checked] [ref=e73] [cursor=pointer]
              - radio "JS" [ref=e75] [cursor=pointer]
            - generic [ref=e77]:
              - button "Copy" [ref=e78] [cursor=pointer]
              - status [ref=e79]
          - code [ref=e81]: git clone https://github.com/intellectwithvivek/Pulse-Analytics.git
      - generic [ref=e82]:
        - heading "What it demonstrates" [level=2] [ref=e83]
        - generic [ref=e84]:
          - list [ref=e85]:
            - listitem [ref=e86]:
              - paragraph [ref=e87]: Marketing site and app in one repo
            - listitem [ref=e88]:
              - paragraph [ref=e89]: All six charts in context
            - listitem [ref=e90]:
              - paragraph [ref=e91]: Sortable, searchable data table
            - listitem [ref=e92]:
              - paragraph [ref=e93]: Keyboard-drivable kanban board
          - generic [ref=e95]:
            - paragraph [ref=e96]: VivekUI components you can see working here
            - generic [ref=e97]:
              - link "LineChart" [ref=e98] [cursor=pointer]:
                - /url: /docs/charts/line-chart
              - link "AreaChart" [ref=e99] [cursor=pointer]:
                - /url: /docs/charts/area-chart
              - link "BarChart" [ref=e100] [cursor=pointer]:
                - /url: /docs/charts/bar-chart
              - link "PieChart" [ref=e101] [cursor=pointer]:
                - /url: /docs/charts/pie-chart
              - link "Sparkline" [ref=e102] [cursor=pointer]:
                - /url: /docs/charts/sparkline
              - link "ProgressRing" [ref=e103] [cursor=pointer]:
                - /url: /docs/charts/progress-ring
              - link "DataTable" [ref=e104] [cursor=pointer]:
                - /url: /docs/components/data-table
              - link "KanbanBoard" [ref=e105] [cursor=pointer]:
                - /url: /docs/components/kanban-board
      - separator [ref=e106]
      - navigation "Adjacent showcase sites" [ref=e107]:
        - link "← Wanderly" [ref=e108] [cursor=pointer]:
          - /url: /showcase/wanderly
        - link "Saffron House →" [ref=e109] [cursor=pointer]:
          - /url: /showcase/saffron-house
      - link "← All 12 showcase sites" [ref=e111] [cursor=pointer]:
        - /url: /showcase
  - alert [ref=e112]
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