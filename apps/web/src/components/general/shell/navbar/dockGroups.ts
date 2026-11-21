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
  /**
   * Whether the viewer is signed in. "Your space" only makes sense for an
   * account, so visitors do not get that group. Defaults to true.
   */
  signedIn?: boolean;
  /** Reference date for expiring badges (`badgeUntil`). Defaults to now. */
  now?: Date;
}

/** Drops the badge of an item once its `badgeUntil` day has passed. */
function withActiveBadge(
  item: DockItemDefinition,
  now: Date,
): DockItemDefinition {
  if (!item.badge || !item.badgeUntil) {
    return item;
  }

  const lastDay = new Date(`${item.badgeUntil}T23:59:59`);

  return now > lastDay ? { ...item, badge: undefined } : item;
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

  const now = options.now ?? new Date();
  const signedIn = options.signedIn ?? true;

  return DOCK_GROUPS.filter((group) => signedIn || group.id !== "yourSpace")
    .map((group) => {
      if (group.id === "discover" && awardsItem) {
        return {
          ...group,
          items: insertAfter(group.items, "home", awardsItem),
        };
      }

      if (group.id === "yourSpace" && recapItem) {
        return {
          ...group,
          items: insertAfter(group.items, "wrapped", recapItem),
        };
      }

      return group;
    })
    .map((group) => ({
      ...group,
      items: group.items.map((item) => withActiveBadge(item, now)),
    }));
}
