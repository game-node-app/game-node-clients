/**
 * Local "visited" mark of a Recap year (design §5).
 *
 * The Dock shows the "Nova" badge for the Recap until the owner opens their own
 * Recap page once. The mark is client-local, so both the page (writer) and the
 * Dock (reader) must use these helpers; every storage access is guarded because
 * `localStorage` can throw (private mode, disabled storage) or be absent during
 * SSR.
 */

export const RECAP_VISITED_STORAGE_PREFIX = "gamenode.recap.visited";

export function getRecapVisitedStorageKey(year: number): string {
  return `${RECAP_VISITED_STORAGE_PREFIX}.${year}`;
}

export function markRecapVisited(year: number): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(getRecapVisitedStorageKey(year), "1");
  } catch {
    // Without storage the badge simply stays until the season ends.
  }
}

export function isRecapVisited(year: number): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(getRecapVisitedStorageKey(year)) != null;
  } catch {
    return false;
  }
}
