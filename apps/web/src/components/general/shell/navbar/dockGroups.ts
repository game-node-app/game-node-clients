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
  /** Whether the Guild still admits supporters only (spec guild-access). */
  guildEarlyAccess?: boolean;
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
 * "Retrospectiva" sits next to "Wrapped" in "Seu espaço" while the Recap is in
 * season and the viewer has a created Recap (which also gives `recapHref`).
 * Wrapped is a separate feature and is always kept.
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
 * Applies the early-access badge to the Guild entry while its server access
 * mode is `supporters` (spec guild-access). Every other item is untouched.
 */
function withGuildBadge(
  items: DockItemDefinition[],
  guildEarlyAccess: boolean,
): DockItemDefinition[] {
  if (!guildEarlyAccess) {
    return items;
  }

  return items.map((item) =>
    item.id === "guild" ? { ...item, badge: "earlyAccess" as const } : item,
  );
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
  const guildEarlyAccess = options.guildEarlyAccess === true;

  return DOCK_GROUPS.map((group) => {
    let items = group.items;

    if (group.id === "discover" && awardsItem) {
      items = insertAfter(items, "home", awardsItem);
    } else if (group.id === "yourSpace" && recapItem) {
      items = insertAfter(items, "wrapped", recapItem);
    }

    const decoratedItems = withGuildBadge(items, guildEarlyAccess);

    if (decoratedItems === items && items === group.items) {
      return group;
    }

    return { ...group, items: decoratedItems };
  });
}
