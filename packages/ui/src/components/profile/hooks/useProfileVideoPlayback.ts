import { useReducedMotion } from "@mantine/hooks";
import { useCallback, useEffect, useState, type RefCallback } from "react";

/**
 * Mounts the video before it is actually visible so it has time to load, while
 * still unmounting elements that are far from the viewport.
 */
export const PROFILE_VIDEO_ROOT_MARGIN = "200px";

export interface UseProfileVideoPlaybackOptions {
  /** Set to `false` when the slot has no published video. */
  enabled?: boolean;
  /** Overrides `PROFILE_VIDEO_ROOT_MARGIN`. */
  rootMargin?: string;
  /** Changes when a different file is rendered; clears the failure flag. */
  resetKey?: string;
}

export interface UseProfileVideoPlaybackResult {
  /** Attach to the element that stays mounted while the video is off. */
  containerRef: RefCallback<HTMLElement>;
  /** Attach to the `<video>` element. */
  videoRef: RefCallback<HTMLVideoElement>;
  /** `true` while the container is inside the viewport (plus `rootMargin`). */
  isNearViewport: boolean;
  /** `true` when the `<video>` element should be mounted and play. */
  shouldMountVideo: boolean;
  /** `true` after a rejected `play()` or a media `error` event. */
  hasFailed: boolean;
}

/**
 * Owns the viewport, reduced-motion and failure rules for profile videos.
 *
 * The element is only mounted once it approaches the viewport, never mounts
 * with reduced motion enabled, and unmounts for good when playback is rejected
 * or the media fails to load, leaving the poster image as the fallback.
 */
export function useProfileVideoPlayback({
  enabled = true,
  rootMargin = PROFILE_VIDEO_ROOT_MARGIN,
  resetKey,
}: UseProfileVideoPlaybackOptions = {}): UseProfileVideoPlaybackResult {
  const reducedMotion = useReducedMotion();
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );
  const [isNearViewport, setIsNearViewport] = useState(false);
  // Tags the failure with the file it belongs to, so a different file starts
  // from scratch without resetting state from an effect.
  const [failure, setFailure] = useState<{ key: string | undefined } | null>(
    null,
  );
  const hasFailed = failure !== null && failure.key === resetKey;

  const containerRef = useCallback((element: HTMLElement | null) => {
    setContainer(element);
  }, []);

  const videoRef = useCallback((element: HTMLVideoElement | null) => {
    setVideoElement(element);
  }, []);

  const markFailed = useCallback(() => {
    setFailure({ key: resetKey });
  }, [resetKey]);

  useEffect(() => {
    if (!enabled || container == null) return;
    // Older WebViews without IntersectionObserver keep the poster only.
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setIsNearViewport(entry.isIntersecting);
      },
      { rootMargin },
    );
    observer.observe(container);

    return () => observer.disconnect();
  }, [enabled, container, rootMargin]);

  useEffect(() => {
    if (videoElement == null) return;

    const handleError = () => markFailed();
    videoElement.addEventListener("error", handleError);

    try {
      // `autoplay` is set on the element too; calling `play()` exposes a
      // blocked autoplay as a rejected promise instead of a silent no-op.
      const playback = videoElement.play();
      playback?.catch(handleError);
    } catch {
      // Some engines throw synchronously when playback cannot start.
      void Promise.resolve().then(markFailed);
    }

    return () => videoElement.removeEventListener("error", handleError);
  }, [videoElement, markFailed]);

  const shouldMountVideo =
    enabled && !reducedMotion && !hasFailed && isNearViewport;

  return {
    containerRef,
    videoRef,
    isNearViewport,
    shouldMountVideo,
    hasFailed,
  };
}
