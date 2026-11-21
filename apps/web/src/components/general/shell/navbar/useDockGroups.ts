import { useRecapVisited, useSeasonEvents, useUserId } from "@repo/ui";
import { buildDockGroups } from "./dockGroups";
import type { DockGroupDefinition } from "./dockItems";

/**
 * Dock groups with the seasonal entries (design §5).
 *
 * Visitors do not get "Your space" (its pages need an account).
 *
 * The "Nova" marker of the Retrospectiva is read through `useRecapVisited`, an
 * external-store snapshot: it refreshes when the viewer returns from the Recap
 * page (which writes it) without a hydration mismatch, because the seasonal
 * items only exist after the client-side season reads resolve.
 */
export function useDockGroups(): DockGroupDefinition[] {
  const season = useSeasonEvents();
  const signedIn = Boolean(useUserId());
  const recapYear = season.recapEntry?.year ?? null;
  const recapVisited = useRecapVisited(recapYear);

  return buildDockGroups(season, { recapVisited, signedIn });
}
