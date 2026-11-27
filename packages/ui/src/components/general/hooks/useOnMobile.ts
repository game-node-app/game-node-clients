import { useMantineTheme } from "@mantine/core";
import { useSyncExternalStore } from "react";

type MediaQueryStore = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => boolean;
};

const stores = new Map<string, MediaQueryStore>();

const hasMatchMedia = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function";

/**
 * One `matchMedia` listener per query, shared by every consumer, so all of them
 * update in a single React commit. Grids call this hook several times per cover:
 * with a listener each, crossing the breakpoint ran one nested commit per
 * listener and hit React's "Maximum update depth exceeded".
 */
function getStore(query: string): MediaQueryStore {
  const existing = stores.get(query);
  if (existing) return existing;

  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  let mediaQuery: MediaQueryList | undefined;

  const store: MediaQueryStore = {
    subscribe(listener) {
      if (!hasMatchMedia()) return () => {};
      if (listeners.size === 0) {
        mediaQuery = window.matchMedia(query);
        mediaQuery.addEventListener?.("change", notify);
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          mediaQuery?.removeEventListener?.("change", notify);
        }
      };
    },
    getSnapshot: () =>
      hasMatchMedia() ? Boolean(window.matchMedia(query)?.matches) : true,
  };
  stores.set(query, store);
  return store;
}

const getServerSnapshot = () => true;

/**
 * Checks if the user is on a mobile device, using media queries.
 * WARNING: On by default (for SSR).
 */
export function useOnMobile() {
  const theme = useMantineTheme();
  const store = getStore(`(max-width: ${theme.breakpoints.sm})`);
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    getServerSnapshot,
  );
}
