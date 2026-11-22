import { useGuildAccess, useRecapVisited, useSeasonEvents } from "@repo/ui";
import { buildDockGroups } from "./dockGroups";
import type { DockGroupDefinition } from "./dockItems";

/**
 * Dock groups with the seasonal entries (design §5).
 *
 * The "Nova" marker of the Retrospectiva is read through `useRecapVisited`, an
 * external-store snapshot: it refreshes when the viewer returns from the Recap
 * page (which writes it) without a hydration mismatch, because the seasonal
 * items only exist after the client-side season reads resolve.
 *
 * The Guild entry's early-access badge follows the public `useGuildAccess`
 * query, so it disappears when the server opens the Guild to everyone.
 */
export function useDockGroups(): DockGroupDefinition[] {
  const season = useSeasonEvents();
  const recapYear = season.recapEntry?.year ?? null;
  const recapVisited = useRecapVisited(recapYear);
  const guildAccess = useGuildAccess();

  return buildDockGroups(season, {
    recapVisited,
    guildEarlyAccess: guildAccess.data?.mode === "supporters",
  });
}
