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
  [critical] aria-valid-attr-value: ARIA attributes must conform to valid values
    <button type="button" role="tab" id="_R_2elbsnpftb_-tab-ts" class="vk-tabs__tab" aria-selected="true" aria-controls="_R_

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 10

- Array []
+ Array [
+   Object {
+     "help": "ARIA attributes must conform to valid values",
+     "id": "aria-valid-attr-value",
+     "impact": "critical",
+     "nodes": Array [
+       "<button type=\"button\" role=\"tab\" id=\"_R_2elbsnpftb_-tab-ts\" class=\"vk-tabs__tab\" aria-selected=\"true\" aria-controls=\"_R_",
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
      - navigation "Breadcrumb" [ref=e32]:
        - list [ref=e33]:
          - listitem [ref=e34]:
            - link "Home" [ref=e35] [cursor=pointer]:
              - /url: /
          - listitem [ref=e36]
          - listitem [ref=e39]:
            - link "Showcase" [ref=e40] [cursor=pointer]:
              - /url: /showcase
          - listitem [ref=e41]
          - listitem [ref=e44]:
            - generic [ref=e45]: Pulse Analytics
      - generic [ref=e46]:
        - paragraph [ref=e47]: SaaS
        - heading "Pulse Analytics" [level=1] [ref=e48]
        - paragraph [ref=e49]: "A SaaS landing page plus a full analytics dashboard: all six VivekUI charts, a data table and a kanban board."
        - generic [ref=e50]:
          - link "Visit the live site ↗" [ref=e51] [cursor=pointer]:
            - /url: https://pulseanalytics.vivekkumarsingh.in
          - link "Source on GitHub ↗" [ref=e52] [cursor=pointer]:
            - /url: https://github.com/intellectwithvivek/Pulse-Analytics
          - generic [ref=e53]: MIT licensed
      - generic [ref=e54]:
        - heading "Live preview" [level=2] [ref=e55]
        - paragraph [ref=e56]: The real pulseanalytics.vivekkumarsingh.in, in a frame with its own viewport — so the phone and tablet widths below are the site's actual breakpoints, not this page's.
        - generic [ref=e57]:
          - generic [ref=e58]:
            - group "Preview width" [ref=e59]:
              - generic [ref=e60]:
                - button "Phone" [ref=e61] [cursor=pointer]
                - button "Tablet" [ref=e62] [cursor=pointer]
                - button "Desktop" [pressed] [ref=e63] [cursor=pointer]
            - paragraph [ref=e64]: Full width · the frame has its own viewport, so the breakpoints are real
          - generic [ref=e65]:
            - generic [ref=e66]:
              - generic [ref=e71]: pulseanalytics.vivekkumarsingh.in
              - link "Open live site ↗" [ref=e72] [cursor=pointer]:
                - /url: https://pulseanalytics.vivekkumarsingh.in
            - generic [ref=e74]:
              - generic [ref=e75]: Pulse Analytics
              - iframe [ref=e77]:
                - generic [ref=f1e1]:
                  - link "Skip to content" [ref=f1e2] [cursor=pointer]:
                    - /url: "#main"
                  - navigation "Main" [ref=f1e3]:
                    - generic [ref=f1e4]:
                      - link "Pulse" [ref=f1e5] [cursor=pointer]:
                        - /url: /
                      - list [ref=f1e10]:
                        - listitem [ref=f1e11]:
                          - link "Product" [ref=f1e12] [cursor=pointer]:
                            - /url: /
                        - listitem [ref=f1e13]:
                          - link "Pricing" [ref=f1e14] [cursor=pointer]:
                            - /url: /pricing
                        - listitem [ref=f1e15]:
                          - link "Built with" [ref=f1e16] [cursor=pointer]:
                            - /url: /built-with
                      - generic [ref=f1e17]:
                        - link "⚡ Built with VivekUI" [ref=f1e18] [cursor=pointer]:
                          - /url: https://ui.vivekkumarsingh.in/docs?utm_source=vivekui-template&utm_campaign=saas&utm_medium=navbar
                        - button "Switch to light theme" [ref=f1e20] [cursor=pointer]
                        - link "Login" [ref=f1e24] [cursor=pointer]:
                          - /url: /dashboard
                  - main [ref=f1e25]:
                    - region "Product analytics you can read at a glance" [ref=f1e26]:
                      - generic [ref=f1e28]:
                        - generic [ref=f1e29]:
                          - generic [ref=f1e30]: Free & open source · MIT
                          - heading "Product analytics you can read at a glance" [level=1] [ref=f1e32]
                          - paragraph [ref=f1e33]: Pulse turns your event stream into the four numbers your team actually argues about — and the six charts that explain them. This entire site, dashboard included, is a free Next.js template.
                          - generic [ref=f1e34]:
                            - link "Open the live dashboard" [ref=f1e35] [cursor=pointer]:
                              - /url: /dashboard
                            - link "See how it is built" [ref=f1e36] [cursor=pointer]:
                              - /url: /built-with
                        - generic [ref=f1e38]:
                          - generic [ref=f1e39]: pulse.app/dashboard
                          - generic [ref=f1e44]:
                            - generic [ref=f1e45]:
                              - generic [ref=f1e46]:
                                - paragraph [ref=f1e47]: Revenue · last 14 days
                                - paragraph [ref=f1e48]: $96.4k
                              - generic [ref=f1e49]: live
                            - generic [ref=f1e50]:
                              - img "Daily revenue over the last fourteen days" [ref=f1e51]:
                                - generic [ref=f1e52]:
                                  - generic [ref=f1e53]: "0"
                                  - generic [ref=f1e54]: "2"
                                  - generic [ref=f1e55]: "4"
                                  - generic [ref=f1e56]: "6"
                                  - generic [ref=f1e57]: "8"
                                  - generic [ref=f1e58]: Aug 11
                                  - generic [ref=f1e59]: Aug 13
                                  - generic [ref=f1e60]: Aug 15
                                  - generic [ref=f1e61]: Aug 17
                                  - generic [ref=f1e62]: Aug 19
                                  - generic [ref=f1e63]: Aug 21
                                  - generic [ref=f1e64]: Aug 23
                              - table [ref=f1e82]:
                                - caption [ref=f1e83]: Daily revenue over the last fourteen days
                                - rowgroup [ref=f1e84]:
                                  - row [ref=f1e85]:
                                    - columnheader "Day" [ref=f1e86]
                                    - columnheader "Revenue" [ref=f1e87]
                                - rowgroup [ref=f1e88]:
                                  - row [ref=f1e89]:
                                    - rowheader "Aug 11" [ref=f1e90]
                                    - cell "$3.6k" [ref=f1e91]
                                  - row [ref=f1e92]:
                                    - rowheader "Aug 12" [ref=f1e93]
                                    - cell "$3.2k" [ref=f1e94]
                                  - row [ref=f1e95]:
                                    - rowheader "Aug 13" [ref=f1e96]
                                    - cell "$6.9k" [ref=f1e97]
                                  - row [ref=f1e98]:
                                    - rowheader "Aug 14" [ref=f1e99]
                                    - cell "$7.2k" [ref=f1e100]
                                  - row [ref=f1e101]:
                                    - rowheader "Aug 15" [ref=f1e102]
                                    - cell "$7.0k" [ref=f1e103]
                                  - row [ref=f1e104]:
                                    - rowheader "Aug 16" [ref=f1e105]
                                    - cell "$7.5k" [ref=f1e106]
                                  - row [ref=f1e107]:
                                    - rowheader "Aug 17" [ref=f1e108]
                                    - cell "$7.8k" [ref=f1e109]
                                  - row [ref=f1e110]:
                                    - rowheader "Aug 18" [ref=f1e111]
                                    - cell "$4.1k" [ref=f1e112]
                                  - row [ref=f1e113]:
                                    - rowheader "Aug 19" [ref=f1e114]
                                    - cell "$3.7k" [ref=f1e115]
                                  - row [ref=f1e116]:
                                    - rowheader "Aug 20" [ref=f1e117]
                                    - cell "$8.0k" [ref=f1e118]
                                  - row [ref=f1e119]:
                                    - rowheader "Aug 21" [ref=f1e120]
                                    - cell "$8.3k" [ref=f1e121]
                                  - row [ref=f1e122]:
                                    - rowheader "Aug 22" [ref=f1e123]
                                    - cell "$8.1k" [ref=f1e124]
                                  - row [ref=f1e125]:
                                    - rowheader "Aug 23" [ref=f1e126]
                                    - cell "$8.6k" [ref=f1e127]
                                  - row [ref=f1e128]:
                                    - rowheader "Aug 24" [ref=f1e129]
                                    - cell "$9.0k" [ref=f1e130]
                            - generic [ref=f1e131]:
                              - generic [ref=f1e132]:
                                - paragraph [ref=f1e133]: MRR
                                - paragraph [ref=f1e134]: $148.2k
                                - img "Monthly recurring revenue trend" [ref=f1e136]
                              - generic [ref=f1e140]:
                                - paragraph [ref=f1e141]: Active users
                                - paragraph [ref=f1e142]: 38,914
                                - img "Weekly active users trend" [ref=f1e144]
                              - generic [ref=f1e148]:
                                - paragraph [ref=f1e149]: Churn
                                - paragraph [ref=f1e150]: 1.8%
                                - img "Net revenue churn trend" [ref=f1e152]
                              - generic [ref=f1e156]:
                                - paragraph [ref=f1e157]: NPS
                                - paragraph [ref=f1e158]: "61"
                                - img "Net promoter score trend" [ref=f1e160]
                    - region "Trusted by product teams at" [ref=f1e164]:
                      - generic [ref=f1e166]:
                        - heading "Trusted by product teams at" [level=2] [ref=f1e167]
                        - list [ref=f1e168]:
                          - listitem [ref=f1e169]:
                            - img "Northwind Labs" [ref=f1e170]:
                              - generic [ref=f1e171]: Northwind
                          - listitem [ref=f1e174]:
                            - img "Aster Financial" [ref=f1e175]:
                              - generic [ref=f1e176]: Aster
                          - listitem [ref=f1e180]:
                            - img "Fathom Robotics" [ref=f1e181]:
                              - generic [ref=f1e182]: Fathom
                          - listitem [ref=f1e186]:
                            - img "Orchid Biotech" [ref=f1e187]:
                              - generic [ref=f1e188]: Orchid
                          - listitem [ref=f1e191]:
                            - img "Meridian Legal" [ref=f1e192]:
                              - generic [ref=f1e193]: Meridian
                          - listitem [ref=f1e196]:
                            - img "Juniper Retail" [ref=f1e197]:
                              - generic [ref=f1e198]: Juniper
                    - region "Six things that make a metric useful" [ref=f1e201]:
                      - generic [ref=f1e202]:
                        - generic [ref=f1e203]:
                          - generic [ref=f1e204]: Why Pulse
                          - heading "Six things that make a metric useful" [level=2] [ref=f1e206]
                          - paragraph [ref=f1e207]: A number without context is trivia. Everything here exists to put a number next to the reason it moved.
                        - list [ref=f1e208]:
                          - listitem [ref=f1e209]:
                            - generic [ref=f1e210]: ◎
                            - heading "Autocapture, then narrow" [level=3] [ref=f1e211]
                            - paragraph [ref=f1e212]: Track every click and pageview on day one, then define the twelve events that actually matter once you know what people do.
                          - listitem [ref=f1e213]:
                            - generic [ref=f1e214]: ⤸
                            - heading "Funnels that explain themselves" [level=3] [ref=f1e215]
                            - paragraph [ref=f1e216]: Every step breaks down by plan, country or campaign without leaving the chart, so "why did it drop" takes one click, not a query.
                          - listitem [ref=f1e217]:
                            - generic [ref=f1e218]: ⊞
                            - heading "Retention by cohort" [level=3] [ref=f1e219]
                            - paragraph [ref=f1e220]: Compare the month you shipped onboarding against the month before it. Three cohorts on one axis, no spreadsheet export.
                          - listitem [ref=f1e221]:
                            - generic [ref=f1e222]: ◬
                            - heading "Alerts without thresholds" [level=3] [ref=f1e223]
                            - paragraph [ref=f1e224]: Pulse learns each metric baseline and flags the spike or the drop. You set no numbers and get no 3am false positives.
                          - listitem [ref=f1e225]:
                            - generic [ref=f1e226]: ▷
                            - heading "Replay the session behind a number" [level=3] [ref=f1e227]
                            - paragraph [ref=f1e228]: Click any point on any chart to watch the sessions that produced it. The number stops being an abstraction.
                          - listitem [ref=f1e229]:
                            - generic [ref=f1e230]: ⇄
                            - heading "Your warehouse stays the source" [level=3] [ref=f1e231]
                            - paragraph [ref=f1e232]: Two-way sync with Snowflake and BigQuery. Cohorts you define in Pulse land back in your own tables.
                    - region "Running quietly at scale" [ref=f1e233]:
                      - generic [ref=f1e234]:
                        - generic [ref=f1e235]:
                          - generic [ref=f1e236]: By the numbers
                          - heading "Running quietly at scale" [level=2] [ref=f1e238]
                          - paragraph [ref=f1e239]: Figures count up once when they scroll into view, and stay put under reduced-motion.
                        - generic [ref=f1e240]:
                          - generic [ref=f1e241]:
                            - term [ref=f1e242]: Events ingested each month
                            - definition [ref=f1e243]:
                              - generic [ref=f1e244]:
                                - generic [ref=f1e245]: 0.0B
                                - generic [ref=f1e246]: 4.2B
                            - definition [ref=f1e247]: Across every workspace on the platform.
                          - generic [ref=f1e248]:
                            - term [ref=f1e249]: Weekly active users
                            - definition [ref=f1e250]:
                              - generic [ref=f1e251]:
                                - generic [ref=f1e252]: "0"
                                - generic [ref=f1e253]: 38,914
                            - definition [ref=f1e254]: Product managers, engineers and analysts.
                          - generic [ref=f1e255]:
                            - term [ref=f1e256]: Median query latency
                            - definition [ref=f1e257]:
                              - generic [ref=f1e258]:
                                - generic [ref=f1e259]: 0ms
                                - generic [ref=f1e260]: 94ms
                            - definition [ref=f1e261]: p50 across all dashboard reads.
                          - generic [ref=f1e262]:
                            - term [ref=f1e263]: Uptime last 90 days
                            - definition [ref=f1e264]:
                              - generic [ref=f1e265]:
                                - generic [ref=f1e266]: 0.00%
                                - generic [ref=f1e267]: 99.98%
                            - definition [ref=f1e268]: Measured from outside our own network.
                    - region "What teams say once they have shipped with it" [ref=f1e269]:
                      - generic [ref=f1e270]:
                        - generic [ref=f1e271]:
                          - generic [ref=f1e272]: Customers
                          - heading "What teams say once they have shipped with it" [level=2] [ref=f1e274]
                        - list [ref=f1e275]:
                          - listitem [ref=f1e276]:
                            - figure "Mei Lin Chen Mei Lin Chen VP Product, Aster Financial" [ref=f1e278]:
                              - blockquote [ref=f1e279]: We replaced a dashboard nobody opened with four charts everybody argues about. That is the upgrade — the arguments are now about the product instead of about the data.
                              - generic [ref=f1e280]:
                                - img "Mei Lin Chen" [ref=f1e282]
                                - generic [ref=f1e283]:
                                  - generic [ref=f1e284]: Mei Lin Chen
                                  - generic [ref=f1e285]: VP Product, Aster Financial
                          - listitem [ref=f1e286]:
                            - figure "Jonas Weber Jonas Weber Head of Growth, Fathom Robotics" [ref=f1e288]:
                              - blockquote [ref=f1e289]: The cohort view found our onboarding regression in about nine minutes. Our previous tool had the same data and took a fortnight and a data scientist.
                              - generic [ref=f1e290]:
                                - img "Jonas Weber" [ref=f1e292]
                                - generic [ref=f1e293]:
                                  - generic [ref=f1e294]: Jonas Weber
                                  - generic [ref=f1e295]: Head of Growth, Fathom Robotics
                          - listitem [ref=f1e296]:
                            - figure "Amara Okafor Amara Okafor Staff Engineer, Northwind Labs" [ref=f1e298]:
                              - blockquote [ref=f1e299]: Anomaly alerts with no thresholds sounded like marketing. Six weeks in it has paged us twice, and both times it was right.
                              - generic [ref=f1e300]:
                                - img "Amara Okafor" [ref=f1e302]
                                - generic [ref=f1e303]:
                                  - generic [ref=f1e304]: Amara Okafor
                                  - generic [ref=f1e305]: Staff Engineer, Northwind Labs
                    - region "Three plans, no sales call to see the price" [ref=f1e306]:
                      - generic [ref=f1e307]:
                        - generic [ref=f1e308]:
                          - generic [ref=f1e309]: Pricing
                          - heading "Three plans, no sales call to see the price" [level=2] [ref=f1e311]
                          - paragraph [ref=f1e312]: Billed monthly or yearly. Every plan includes all six chart types — they are part of the component library, not an add-on.
                        - list [ref=f1e313]:
                          - listitem [ref=f1e314]:
                            - generic [ref=f1e315]:
                              - generic [ref=f1e316]:
                                - heading "Free" [level=3] [ref=f1e318]
                                - generic [ref=f1e319]:
                                  - generic [ref=f1e320]: $0
                                  - generic [ref=f1e321]: forever
                                - paragraph [ref=f1e322]: For a side project, or for finding out whether the numbers add up.
                              - list [ref=f1e324]:
                                - listitem [ref=f1e325]: 10,000 tracked events / month
                                - listitem [ref=f1e326]: 3 team members
                                - listitem [ref=f1e327]: 30-day data retention
                                - listitem [ref=f1e328]: All six chart types
                                - listitem [ref=f1e329]: Community support
                              - link "Start free" [ref=f1e331] [cursor=pointer]:
                                - /url: /pricing
                          - listitem [ref=f1e332]:
                            - generic [ref=f1e333]:
                              - generic [ref=f1e334]:
                                - generic [ref=f1e335]:
                                  - heading "Pro" [level=3] [ref=f1e336]
                                  - generic [ref=f1e337]: Most popular
                                - generic [ref=f1e338]:
                                  - generic [ref=f1e339]: $49
                                  - generic [ref=f1e340]: /month
                                - paragraph [ref=f1e341]: For a product team that needs to answer questions the same day.
                              - list [ref=f1e343]:
                                - listitem [ref=f1e344]: 1M tracked events / month
                                - listitem [ref=f1e345]: Unlimited team members
                                - listitem [ref=f1e346]: 12-month data retention
                                - listitem [ref=f1e347]: Funnels, cohorts and session replay
                                - listitem [ref=f1e348]: Anomaly alerts on any metric
                                - listitem [ref=f1e349]: Email and chat support
                              - link "Start 14-day trial" [ref=f1e351] [cursor=pointer]:
                                - /url: /pricing
                          - listitem [ref=f1e352]:
                            - generic [ref=f1e353]:
                              - generic [ref=f1e354]:
                                - heading "Team" [level=3] [ref=f1e356]
                                - generic [ref=f1e357]:
                                  - generic [ref=f1e358]: $149
                                  - generic [ref=f1e359]: /month
                                - paragraph [ref=f1e360]: For several product teams sharing one source of truth.
                              - list [ref=f1e362]:
                                - listitem [ref=f1e363]: 10M tracked events / month
                                - listitem [ref=f1e364]: SAML single sign-on
                                - listitem [ref=f1e365]: Unlimited data retention
                                - listitem [ref=f1e366]: Warehouse sync and raw event export
                                - listitem [ref=f1e367]: Audit log and role-based access
                                - listitem [ref=f1e368]: Dedicated Slack channel
                              - link "Talk to sales" [ref=f1e370] [cursor=pointer]:
                                - /url: /pricing
                    - paragraph [ref=f1e373]:
                      - text: Need the yearly discount, the feature-by-feature comparison, or the FAQ?
                      - link "See full pricing" [ref=f1e374] [cursor=pointer]:
                        - /url: /pricing
                      - text: .
                    - region "Questions about the template" [ref=f1e375]:
                      - generic [ref=f1e376]:
                        - generic [ref=f1e377]:
                          - generic [ref=f1e378]: FAQ
                          - heading "Questions about the template" [level=2] [ref=f1e380]
                        - generic [ref=f1e381]:
                          - group [ref=f1e382]:
                            - heading "Does this template include charts?" [level=3] [ref=f1e384] [cursor=pointer]
                            - paragraph [ref=f1e386]: Yes — all six of them, and no chart library is installed. The area, bar, line, pie, progress ring and sparkline charts on this site all come from @the_viveksingh/vivek-ui, which has zero runtime dependencies. They are pure SVG with no measurement step, so they render on the server and appear in the HTML before any JavaScript loads. There is no Recharts, no Chart.js and no D3 in package.json.
                          - group [ref=f1e387]:
                            - heading "Is the dashboard responsive?" [level=3] [ref=f1e389] [cursor=pointer]
                          - group [ref=f1e390]:
                            - heading "Can I connect a real backend?" [level=3] [ref=f1e392] [cursor=pointer]
                          - group [ref=f1e393]:
                            - heading "Is it free for commercial use?" [level=3] [ref=f1e395] [cursor=pointer]
                    - region "Clone it, rename it, ship it" [ref=f1e396]:
                      - generic [ref=f1e398]:
                        - generic [ref=f1e399]:
                          - generic [ref=f1e400]: Take the whole thing
                          - heading "Clone it, rename it, ship it" [level=2] [ref=f1e402]
                          - paragraph [ref=f1e403]: Marketing site, dashboard, six charts, sitemap, structured data and a README. MIT licensed.
                        - generic [ref=f1e404]:
                          - link "Use this template" [ref=f1e405] [cursor=pointer]:
                            - /url: https://github.com/intellectwithvivek/Pulse-Analytics
                          - link "Component map" [ref=f1e406] [cursor=pointer]:
                            - /url: /built-with
                    - generic [ref=f1e408]:
                      - generic [ref=f1e409]: Changelog
                      - generic [ref=f1e411]:
                        - generic [ref=f1e412]: Product changelog, once a fortnight
                        - paragraph [ref=f1e413]: What shipped, what broke, and the numbers behind both. No drip campaign.
                        - generic [ref=f1e414]:
                          - generic [ref=f1e415]: Email address
                          - textbox "Email address" [ref=f1e416]:
                            - /placeholder: you@company.com
                          - button "Subscribe" [ref=f1e417] [cursor=pointer]
                        - paragraph [ref=f1e418]: No backend in this template — the form resolves locally so you can see the states.
                  - contentinfo [ref=f1e419]:
                    - generic [ref=f1e420]:
                      - generic [ref=f1e421]:
                        - generic [ref=f1e423]:
                          - generic [ref=f1e424]: Pulse
                          - paragraph [ref=f1e428]: Built with ❤️ using VivekUI — 91 React components · 6 SVG charts · zero runtime dependencies. One install, one CSS import, no config.
                          - generic [ref=f1e430]:
                            - code [ref=f1e431]: npm i @the_viveksingh/vivek-ui
                            - generic [ref=f1e432]:
                              - button "Copy" [ref=f1e433] [cursor=pointer]
                              - status [ref=f1e434]
                        - navigation "Footer" [ref=f1e435]:
                          - generic [ref=f1e436]:
                            - heading "Product" [level=2] [ref=f1e437]
                            - list [ref=f1e438]:
                              - listitem [ref=f1e439]:
                                - link "Overview" [ref=f1e440] [cursor=pointer]:
                                  - /url: /
                              - listitem [ref=f1e441]:
                                - link "Pricing" [ref=f1e442] [cursor=pointer]:
                                  - /url: /pricing
                              - listitem [ref=f1e443]:
                                - link "Dashboard demo" [ref=f1e444] [cursor=pointer]:
                                  - /url: /dashboard
                              - listitem [ref=f1e445]:
                                - link "Customers" [ref=f1e446] [cursor=pointer]:
                                  - /url: /dashboard/customers
                          - generic [ref=f1e447]:
                            - heading "Template" [level=2] [ref=f1e448]
                            - list [ref=f1e449]:
                              - listitem [ref=f1e450]:
                                - link "Built with VivekUI" [ref=f1e451] [cursor=pointer]:
                                  - /url: /built-with
                              - listitem [ref=f1e452]:
                                - link "Roadmap board" [ref=f1e453] [cursor=pointer]:
                                  - /url: /dashboard/roadmap
                              - listitem [ref=f1e454]:
                                - link "Reports" [ref=f1e455] [cursor=pointer]:
                                  - /url: /dashboard/reports
                              - listitem [ref=f1e456]:
                                - link "Use this template" [ref=f1e457] [cursor=pointer]:
                                  - /url: https://github.com/intellectwithvivek/Pulse-Analytics
                          - generic [ref=f1e458]:
                            - heading "VivekUI" [level=2] [ref=f1e459]
                            - list [ref=f1e460]:
                              - listitem [ref=f1e461]:
                                - link "Documentation" [ref=f1e462] [cursor=pointer]:
                                  - /url: https://ui.vivekkumarsingh.in/docs?utm_source=vivekui-template&utm_campaign=saas&utm_medium=footer
                              - listitem [ref=f1e463]:
                                - link "npm package" [ref=f1e464] [cursor=pointer]:
                                  - /url: https://www.npmjs.com/package/@the_viveksingh/vivek-ui
                              - listitem [ref=f1e465]:
                                - link "GitHub" [ref=f1e466] [cursor=pointer]:
                                  - /url: https://github.com/intellectwithvivek/vivek_UI
                              - listitem [ref=f1e467]:
                                - link "Vivek Kumar Singh" [ref=f1e468] [cursor=pointer]:
                                  - /url: https://vivekkumarsingh.in/?utm_source=vivekui-template&utm_campaign=saas&utm_medium=footer
                      - separator [ref=f1e469]
                      - paragraph [ref=f1e471]: MIT licensed. Free for commercial use — the credit is removable, a star is appreciated.
                  - alert [ref=f1e472]
      - generic [ref=e78]:
        - heading "Clone it" [level=2] [ref=e79]
        - paragraph [ref=e80]: The most complete of the twelve, and the one to look at if you are evaluating the library for an internal tool. Every chart the library ships appears here in context, alongside a table that sorts, searches and paginates, and a board that can be driven entirely from the keyboard.
        - generic [ref=e81]:
          - generic [ref=e82]:
            - tablist [ref=e84]:
              - tab "TS" [selected] [ref=e85] [cursor=pointer]
              - tab "JS" [ref=e86] [cursor=pointer]
            - generic [ref=e87]:
              - button "Copy" [ref=e88] [cursor=pointer]
              - status [ref=e89]
          - code [ref=e91]: git clone https://github.com/intellectwithvivek/Pulse-Analytics.git
      - generic [ref=e92]:
        - heading "What it demonstrates" [level=2] [ref=e93]
        - generic [ref=e94]:
          - list [ref=e95]:
            - listitem [ref=e96]:
              - paragraph [ref=e97]: Marketing site and app in one repo
            - listitem [ref=e98]:
              - paragraph [ref=e99]: All six charts in context
            - listitem [ref=e100]:
              - paragraph [ref=e101]: Sortable, searchable data table
            - listitem [ref=e102]:
              - paragraph [ref=e103]: Keyboard-drivable kanban board
          - generic [ref=e105]:
            - paragraph [ref=e106]: VivekUI components you can see working here
            - generic [ref=e107]:
              - link "LineChart" [ref=e108] [cursor=pointer]:
                - /url: /docs/charts/line-chart
              - link "AreaChart" [ref=e109] [cursor=pointer]:
                - /url: /docs/charts/area-chart
              - link "BarChart" [ref=e110] [cursor=pointer]:
                - /url: /docs/charts/bar-chart
              - link "PieChart" [ref=e111] [cursor=pointer]:
                - /url: /docs/charts/pie-chart
              - link "Sparkline" [ref=e112] [cursor=pointer]:
                - /url: /docs/charts/sparkline
              - link "ProgressRing" [ref=e113] [cursor=pointer]:
                - /url: /docs/charts/progress-ring
              - link "DataTable" [ref=e114] [cursor=pointer]:
                - /url: /docs/components/data-table
              - link "KanbanBoard" [ref=e115] [cursor=pointer]:
                - /url: /docs/components/kanban-board
      - separator [ref=e116]
      - navigation "Adjacent showcase sites" [ref=e117]:
        - link "← Wanderly" [ref=e118] [cursor=pointer]:
          - /url: /showcase/wanderly
        - link "Saffron House →" [ref=e119] [cursor=pointer]:
          - /url: /showcase/saffron-house
      - link "← All 12 showcase sites" [ref=e121] [cursor=pointer]:
        - /url: /showcase
  - alert [ref=e122]
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