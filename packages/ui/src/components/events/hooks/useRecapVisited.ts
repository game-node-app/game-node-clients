import { isRecapVisited } from "#@/components/recap/year/util/recapVisited";
import { useSyncExternalStore } from "react";

/**
 * `localStorage` is an external store: reading it directly during render lets
 * the React Compiler memoize the value, so the "Nova" badge would not clear
 * after the Recap page writes the marker and the viewer comes back. This hook
 * reads the snapshot on every render and subscribes to cross-tab changes.
 */
function subscribeToRecapVisited(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

/** Whether this year's Retrospectiva was already opened by the viewer. */
export function useRecapVisited(year: number | null | undefined): boolean {
  return useSyncExternalStore(
    subscribeToRecapVisited,
    () => (year != null ? isRecapVisited(year) : false),
    () => false,
  );
}
