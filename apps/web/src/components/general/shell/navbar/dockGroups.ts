import type { SeasonEvents } from "@repo/ui";
import { IconAward, IconHistory } from "@tabler/icons-react";
import {
  DOCK_GROUPS,
  type DockGroupDefinition,
  type DockItemDefinition,
  type DockLinkItem,
} from "./dockItems";

/** Reads of `useSeasonEvents()` the Dock entries depend on. */
export type DockSeasonState = Pick<
  SeasonEvents,
  "awardsEntry" | "awardsEvent" | "recapEntry" | "recapHref"
>;

export interface BuildDockGroupsOptions {
  /**
   * Whether the viewer already opened this year's Retrospectiva. The Dock only
   * reads the marker; the Recap page writes it.
   */
  recapVisited: boolean;
}

function insertAfter(
  items: DockItemDefinition[],
  anchorId: string,
  item: DockItemDefinition,
): DockItemDefinition[] {
  const anchorIndex = items.findIndex((candidate) => candidate.id === anchorId);

  if (anchorIndex === -1) {
    return [...items, item];
  }

  return [
    ...items.slice(0, anchorIndex + 1),
    item,
    ...items.slice(anchorIndex + 1),
  ];
}

/**
 * "Awards {ano}" entry for the "Descobrir" group, placed right after "Início"
 * (design §5, spec: Entradas no Dock web).
 *
 * It exists while the season rules return an Awards entry — that includes the
 * dead periods, where it is visible without a badge — and disappears before the
 * first phase and after the end of the season.
 */
export function getAwardsDockItem(
  season: DockSeasonState,
): DockLinkItem | null {
  const entry = season.awardsEntry;
  const event = season.awardsEvent;

  if (!entry || !event) {
    return null;
  }

  return {
    kind: "link",
    id: "awards",
    labelKey: "navigation.awards",
    labelParams: { year: event.year },
    icon: IconAward,
    href: entry.href,
    badge: entry.dockBadge ?? undefined,
  };
}

/**
 * "Retrospectiva" replaces "Wrapped" in "Seu espaço" while the Recap is in
 * season and the viewer has a created Recap (which also gives `recapHref`).
 * Visitors and the off-season keep the normal Wrapped item.
 */
export function getRecapDockItem(
  season: DockSeasonState,
  options: BuildDockGroupsOptions,
): DockLinkItem | null {
  if (!season.recapEntry || !season.recapHref) {
    return null;
  }

  return {
    kind: "link",
    id: "recap",
    labelKey: "navigation.recap",
    icon: IconHistory,
    href: season.recapHref,
    badge: options.recapVisited ? undefined : "newFeminine",
  };
}

/**
 * Applies the season entries to the static Dock groups. Pure so the visibility,
 * position, destination and badge of every phase can be unit-tested without
 * rendering the Dock.
 */
export function buildDockGroups(
  season: DockSeasonState,
  options: BuildDockGroupsOptions,
): DockGroupDefinition[] {
  const awardsItem = getAwardsDockItem(season);
  const recapItem = getRecapDockItem(season, options);

  return DOCK_GROUPS.map((group) => {
    if (group.id === "discover") {
      return awardsItem
        ? {
            ...group,
            items: insertAfter(group.items, "home", awardsItem),
          }
        : group;
    }

    if (group.id === "yourSpace" && recapItem) {
      return {
        ...group,
        items: group.items.map((item) =>
          item.id === "recap" ? recapItem : item,
        ),
      };
    }

    return group;
  });
}
