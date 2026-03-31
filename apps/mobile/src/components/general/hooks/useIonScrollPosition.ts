import { useCallback, useSyncExternalStore } from "react";
import { useIonRouter } from "@ionic/react";
import {
  ScrollToOptions,
  ScrollPosition,
  UseScrollPositionReturn,
} from "@repo/ui";

type Listener = () => void;

/**
 * Map of scroll positions for each pathname. This is used to persist scroll position across navigations.
 */
const positions = new Map<string, ScrollPosition>();
/**
 * Set of listeners to notify when scroll positions change. This is used to trigger re-renders in components that use the `useScrollPosition` hook.
 */
const listeners = new Set<Listener>();

// one-shot scroll commands per pathname
const scrollToCommands = new Map<string, ScrollToOptions>();

const EMPTY_POSITION: ScrollPosition = { x: 0, y: 0 };

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(pathname: string): ScrollPosition {
  return positions.get(pathname) ?? EMPTY_POSITION;
}

function getScrollToSnapshot(pathname: string): ScrollToOptions | null {
  return scrollToCommands.get(pathname) ?? null;
}

export function setScrollPosition(pathname: string, position: ScrollPosition) {
  const prev = positions.get(pathname);
  if (prev?.x === position.x && prev?.y === position.y) return;
  positions.set(pathname, position);
  emit();
}

export function clearScrollPosition(pathname: string) {
  if (!positions.has(pathname)) return;

  positions.delete(pathname);
  emit();
}

export function requestScrollTo(pathname: string, options: ScrollToOptions) {
  const prev = scrollToCommands.get(pathname);
  if (
    prev?.x === options.x &&
    prev?.y === options.y &&
    prev?.duration === options.duration
  ) {
    return;
  }

  scrollToCommands.set(pathname, options);
  emit();
}

export function clearScrollTo(pathname: string) {
  if (!scrollToCommands.has(pathname)) return;
  scrollToCommands.delete(pathname);
  emit();
}

export function useScrollPositionForPathname(pathname: string): ScrollPosition {
  const getPathSnapshot = () => getSnapshot(pathname);

  return useSyncExternalStore(subscribe, getPathSnapshot, getPathSnapshot);
}

export function useScrollToForPathname(pathname: string) {
  const getSnapshot = () => getScrollToSnapshot(pathname);
  const scrollTo = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    scrollTo: scrollTo,
    clear: () => clearScrollTo(pathname),
  };
}

/**
 * Hooks that returns current scroll position and a function to scroll to a position. <br />
 * The scroll position is persisted across navigations based on the pathname. <br />
 * It's mandatory to have a {@link ScrollableIonContent} has parent for this to work. <br />
 */
export function useIonScrollPosition(): UseScrollPositionReturn {
  const router = useIonRouter();
  const pathname = router.routeInfo.pathname;

  const getPathSnapshot = () => getSnapshot(pathname);

  const position = useSyncExternalStore(
    subscribe,
    getPathSnapshot,
    getPathSnapshot,
  );

  const scrollTo = useCallback(
    (options: ScrollToOptions) => {
      requestScrollTo(pathname, options);
    },
    [pathname],
  );

  return [position, scrollTo];
}
