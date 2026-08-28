'use client'

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { cx } from '../../utils/cx'

export interface InfiniteScrollProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Required. Called when the sentinel scrolls into view (or the fallback button is
   * pressed). Return a promise and the component holds off until it settles — the
   * classic infinite-scroll bug is one scroll event firing five overlapping fetches
   * for the same page, and the guard here is what makes that impossible.
   */
  onLoadMore: () => void | Promise<void>
  /**
   * Required. While `true` the sentinel is armed; when it turns `false` the observer
   * disconnects and `endContent` renders instead. An explicit prop rather than an
   * inference, because only the caller knows whether the last response was the last page.
   */
  hasMore: boolean
  /** Shown while a load is pending. Defaults to a small indeterminate indicator. */
  loader?: ReactNode
  /**
   * Rendered once `hasMore` is `false`. Make it visible text ("You're all caught up") —
   * a list that simply stops loading is indistinguishable from a list that broke.
   */
  endContent?: ReactNode
  /**
   * Put the sentinel at the START of the content instead of the end — chat history,
   * where scrolling *up* fetches older messages. Pairs with `ChatThread`.
   */
  inverse?: boolean
  /**
   * How far outside the viewport the sentinel counts as "in view". Default `'256px'`,
   * so the next page starts loading before the user reaches the edge and never actually
   * sees the loader on a fast connection.
   */
  rootMargin?: string
  /**
   * Render a real "Load more" button that shares the pending guard. Defaults to `true`
   * exactly when `IntersectionObserver` is missing, so a broken or absent observer
   * degrades to a working control instead of a list that silently ends. Force it `true`
   * to offer both paths, or `false` to suppress the fallback entirely.
   */
  loadMoreButton?: boolean
}

/**
 * An `IntersectionObserver` sentinel: the "reached the edge of the list" event, as a
 * component.
 *
 * Scroll listeners are the traditional implementation and every part of them is a
 * liability — they fire hundreds of times per second, they need throttling that is
 * always slightly wrong, and they read layout on the main thread. An observer fires
 * exactly when the sentinel's visibility changes, asynchronously, and the default
 * `rootMargin` of `256px` means the fetch starts a screen early, so pagination is
 * invisible when the network keeps up.
 *
 * Re-entry is guarded: while a returned promise is pending the observer can fire as
 * often as it likes and `onLoadMore` runs once. When the load settles, the sentinel is
 * re-observed — the browser then delivers a fresh entry, so a page too short to push
 * the sentinel out of view keeps loading until it isn't. A rejected promise also
 * releases the guard: a failed fetch must leave retry possible, not wedge the list.
 *
 * The wrapper is deliberately NOT a live region — announcing every page of an infinite
 * list is noise, and the APG "feed" pattern says the same. What assistive technology
 * gets instead: an always-mounted `role="status"` that says "Loading more" only while a
 * load is genuinely pending, and an `endContent` slot for visible, readable end-of-list
 * text.
 *
 * Where `IntersectionObserver` does not exist (jsdom, ancient browsers, some embedded
 * webviews) nothing observes — and instead a real "Load more" button renders, so no
 * user is ever stranded on a broken observer:
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | Tab | Reaches "Load more" when the button is rendered |
 * | Enter / Space | Loads the next page |
 */
export const InfiniteScroll = forwardRef<HTMLDivElement, InfiniteScrollProps>(
  function InfiniteScroll(
    {
      onLoadMore,
      hasMore,
      loader,
      endContent,
      inverse,
      rootMargin = '256px',
      loadMoreButton,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const [pending, setPending] = useState(false)
    // The render-state `pending` drives the loader; this ref is the actual guard. An
    // observer can fire twice before React re-renders, so the guard must advance
    // synchronously, outside the state queue.
    const pendingRef = useRef(false)
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    // Bumped when a load settles, to tear down and re-create the observer. Observing
    // again forces the browser to deliver an initial entry, which is how a still-visible
    // sentinel (page shorter than the viewport) triggers the next page with no scroll.
    const [epoch, setEpoch] = useState(0)

    // Mirrors, assigned during render (the useControllableState pattern), so `load`
    // stays identity-stable while always reading this render's props.
    const onLoadMoreRef = useRef(onLoadMore)
    const hasMoreRef = useRef(hasMore)
    onLoadMoreRef.current = onLoadMore
    hasMoreRef.current = hasMore

    const load = useCallback(() => {
      if (pendingRef.current || !hasMoreRef.current) return
      pendingRef.current = true
      setPending(true)
      const settle = () => {
        pendingRef.current = false
        setPending(false)
        setEpoch((e) => e + 1)
      }
      let result: void | Promise<void>
      try {
        result = onLoadMoreRef.current()
      } catch (error) {
        // A synchronous throw must still release the guard — a wedged list cannot
        // retry — but the error stays the caller's to see, so it is rethrown.
        settle()
        throw error
      }
      // Both arms settle: a failed page is done loading too. The rejection itself is
      // the caller's async function's to handle; this component only reacts to "over".
      Promise.resolve(result).then(settle, settle)
    }, [])

    useEffect(() => {
      if (!hasMore) return
      const node = sentinelRef.current
      if (!node || typeof IntersectionObserver !== 'function') return
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              load()
              return
            }
          }
        },
        { rootMargin },
      )
      observer.observe(node)
      return () => observer.disconnect()
    }, [hasMore, rootMargin, epoch, load])

    // Decided in an effect, never at render time: the server has no observer either,
    // so a render-time check would put the button in the server HTML and not in the
    // hydrated client tree — a guaranteed hydration mismatch.
    const [observerMissing, setObserverMissing] = useState(false)
    useEffect(() => {
      if (typeof IntersectionObserver !== 'function') setObserverMissing(true)
    }, [])

    const showButton = (loadMoreButton ?? observerMissing) && hasMore
    const showLoader = pending && hasMore

    const tail = (
      <>
        <div ref={sentinelRef} className="vk-infinite-scroll__sentinel" aria-hidden="true" />
        {/*
          Always mounted, populated only while pending: a live region inserted at the
          moment it should speak is exactly the live region screen readers miss.
        */}
        <div role="status" className="vk-infinite-scroll__status">
          {showLoader ? (
            <>
              {loader ?? <span className="vk-infinite-scroll__spinner" aria-hidden="true" />}
              <span className="vk-infinite-scroll__sr">Loading more</span>
            </>
          ) : null}
        </div>
        {showButton ? (
          <button
            type="button"
            className="vk-infinite-scroll__more"
            disabled={pending}
            onClick={load}
          >
            Load more
          </button>
        ) : null}
        {!hasMore && endContent !== undefined ? (
          <div className="vk-infinite-scroll__end">{endContent}</div>
        ) : null}
      </>
    )

    return (
      <div
        ref={ref}
        className={cx('vk-infinite-scroll', className)}
        data-inverse={inverse || undefined}
        data-pending={pending || undefined}
        {...rest}
      >
        {inverse ? tail : null}
        {children}
        {inverse ? null : tail}
      </div>
    )
  },
)
