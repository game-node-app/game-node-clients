import { useEffect, useRef, useState } from "react";

export interface UseDelayedLoadingIndicatorOptions {
  /**
   * How long `isLoading` has to stay true before the indicator becomes visible.
   * Requests that finish sooner never render it, avoiding flashes.
   * @default 300
   */
  showDelayMs?: number;
  /**
   * How long the indicator stays visible once shown, even if loading already
   * finished, so it doesn't blink for a single frame.
   * @default 500
   */
  minVisibleMs?: number;
}

/**
 * Turns a fast-changing loading flag into a stable visibility flag:
 * the indicator only shows when loading lasts longer than `showDelayMs`, and
 * once shown it stays visible for at least `minVisibleMs`.
 */
export function useDelayedLoadingIndicator(
  isLoading: boolean,
  {
    showDelayMs = 300,
    minVisibleMs = 500,
  }: UseDelayedLoadingIndicatorOptions = {},
): boolean {
  const [isVisible, setIsVisible] = useState(false);
  const visibleSinceRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      if (isVisible) {
        return;
      }

      const timeout = setTimeout(() => {
        visibleSinceRef.current = Date.now();
        setIsVisible(true);
      }, showDelayMs);

      return () => clearTimeout(timeout);
    }

    if (!isVisible) {
      return;
    }

    const elapsed = Date.now() - (visibleSinceRef.current ?? Date.now());
    const timeout = setTimeout(
      () => {
        visibleSinceRef.current = null;
        setIsVisible(false);
      },
      Math.max(0, minVisibleMs - elapsed),
    );

    return () => clearTimeout(timeout);
  }, [isLoading, isVisible, showDelayMs, minVisibleMs]);

  return isVisible;
}
