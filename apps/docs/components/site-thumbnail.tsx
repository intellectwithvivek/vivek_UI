import type { ShowcaseSite } from '../lib/showcase'

/**
 * A live thumbnail of a showcase site.
 *
 * A gradient with the site's name on it is not a showcase — it tells a visitor nothing about
 * what the site looks like, which is the only reason they are on this page. So this is the
 * real site, rendered at a desktop width and scaled down.
 *
 * **`loading="lazy"` is doing the heavy lifting.** Twelve full applications is a lot to ask of
 * a page, and the reason it is defensible is that the browser only fetches the frames near
 * the viewport — on a phone that is one or two, not twelve. Without the lazy attribute this
 * would be indefensible and should not ship.
 *
 * The frame is fixed at a desktop viewport and scaled with a transform rather than simply
 * being made narrow, because a narrow iframe renders the site's *mobile* layout — which is
 * a fine thing to look at but not what a 16:10 landscape card is promising.
 *
 * It is decorative: `aria-hidden` and `tabIndex={-1}` keep it out of the accessibility tree
 * and the tab order, and `pointer-events: none` in the CSS means a click lands on the card's
 * link rather than inside someone else's website.
 */
export function SiteThumbnail({ site }: { site: ShowcaseSite }) {
  return (
    <div className="site-thumb">
      <iframe
        aria-hidden="true"
        className="site-thumb__frame"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        // Same reasoning as the full preview: without `allow-same-origin` the frame has an
        // opaque origin, `localStorage` throws, and these sites render blank.
        sandbox="allow-scripts allow-same-origin"
        src={site.live}
        tabIndex={-1}
        // `aria-hidden` already removes it from the accessibility tree, so this is never
        // announced — but an empty title on an iframe is a lint error and, more to the
        // point, a browser that ignores `aria-hidden` here would otherwise announce the
        // frame as "blank".
        title={`${site.name}, preview`}
      />
      {/* Sits over the frame so a click always reaches the card's link underneath. */}
      <span aria-hidden="true" className="site-thumb__shield" />
    </div>
  )
}
