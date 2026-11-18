import { useCallback, useEffect, useState } from "react";

interface Options {
  /**
   * Items rendered on the first paint.
   */
  initialCount?: number;
  /**
   * Items added each time the sentinel approaches the viewport.
   */
  step?: number;
  /**
   * How far (CSS margin) below the viewport the sentinel starts revealing more items.
   */
  rootMargin?: string;
}

/**
 * Renders a long list in batches: only the first `initialCount` items are mounted,
 * and more are revealed as a sentinel element (placed after the last rendered item)
 * gets close to the viewport. Keeps the DOM, image loads and per-item queries
 * proportional to what the user actually scrolls through.
 *
 * Works with any scroll container (window on web, `ion-content` on mobile), since
 * the observer uses the viewport as root.
 *
 * @example
 * const { visibleCount, sentinelRef, hasMore } = useProgressiveRender(items.length);
 * items.slice(0, visibleCount).map(...)
 * {hasMore && <div ref={sentinelRef} />}
 */
export function useProgressiveRender(
  totalCount: number,
  { initialCount = 15, step = 15, rootMargin = "800px" }: Options = {},
) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);
  const hasMore = visibleCount < totalCount;

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      // Older WebViews and jsdom may not provide IntersectionObserver: render
      // everything. Handled on attach rather than in the effect below so the
      // server render stays at `initialCount` and hydration matches it.
      if (node != null && typeof IntersectionObserver === "undefined") {
        setVisibleCount(totalCount);
      }
      setSentinel(node);
    },
    [totalCount],
  );

  useEffect(() => {
    if (!sentinel || !hasMore || typeof IntersectionObserver === "undefined") {
      return;
    }

    // Recreated after each reveal, so a sentinel that is still visible
    // (short items) triggers the next batch immediately.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => count + step);
        }
      },
      { rootMargin: `0px 0px ${rootMargin} 0px` },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, rootMargin, sentinel, step, visibleCount]);

  return { visibleCount, sentinelRef, hasMore };
}
