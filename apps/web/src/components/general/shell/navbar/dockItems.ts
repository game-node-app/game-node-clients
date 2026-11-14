import {
  type NavIconProps,
  NavAchievementsIcon,
  NavActivityIcon,
  NavAiIcon,
  NavBlogIcon,
  NavCollectionsIcon,
  NavDailyIcon,
  NavExploreIcon,
  NavFeatsIcon,
  NavHomeIcon,
  NavJournalIcon,
  NavLibraryIcon,
  NavPremiumIcon,
  NavUserIcon,
  NavWrappedIcon,
} from "@repo/ui";
import type { ComponentType } from "react";

/**
 * Download page of the Android app. Moved here from the old user menu and
 * consumed by `DockAccount` (task 5.5 removes the original declaration).
 */
export const GAMENODE_ANDROID_URL =
  "https://play.google.com/store/apps/details?id=app.gamenode";

export type DockLabelKey =
  | "navigation.dock.groups.discover"
  | "navigation.dock.groups.yourSpace"
  | "navigation.home"
  | "navigation.explore"
  | "navigation.dailyNodes"
  | "navigation.ai"
  | "navigation.activity"
  | "navigation.blog"
  | "navigation.profile"
  | "navigation.library"
  | "navigation.collections"
  | "navigation.journal"
  | "navigation.achievements"
  | "navigation.feats"
  | "navigation.wrapped"
  | "navigation.premium";

export type DockProfileTab = "main" | "collections" | "journal";

interface DockItemBase {
  id: string;
  labelKey: DockLabelKey;
  /**
   * Glyph from the Figma `Icons/Nav/*` export (file `ikcThguwowTdynGz0L2YkS`),
   * kept in `@repo/ui` → `general/icons/nav` so each path matches the design.
   */
  icon: ComponentType<NavIconProps>;
  isNew?: boolean;
}

export interface DockLinkItem extends DockItemBase {
  kind: "link";
  href: string;
  /** Marks the profile tabs, whose active state also depends on `?tab=`. */
  profileTab?: DockProfileTab;
}

export interface DockActionItem extends DockItemBase {
  kind: "action";
  action: "wrapped" | "premium";
}

export type DockItemDefinition = DockLinkItem | DockActionItem;

export interface DockGroupDefinition {
  id: "discover" | "yourSpace";
  labelKey: Extract<
    DockLabelKey,
    "navigation.dock.groups.discover" | "navigation.dock.groups.yourSpace"
  >;
  items: DockItemDefinition[];
}

/**
 * Destinations of the Dock, in the order defined by the design table.
 * Wrapped belongs to "Your space" per the spec; Premium is the untitled
 * utility item pinned above the account block.
 */
export const DOCK_GROUPS: DockGroupDefinition[] = [
  {
    id: "discover",
    labelKey: "navigation.dock.groups.discover",
    items: [
      {
        kind: "link",
        id: "home",
        labelKey: "navigation.home",
        icon: NavHomeIcon,
        href: "/home",
      },
      {
        kind: "link",
        id: "explore",
        labelKey: "navigation.explore",
        icon: NavExploreIcon,
        href: "/explore",
      },
      {
        kind: "link",
        id: "daily",
        labelKey: "navigation.dailyNodes",
        icon: NavDailyIcon,
        href: "/daily",
        isNew: true,
      },
      {
        kind: "link",
        id: "ai",
        labelKey: "navigation.ai",
        icon: NavAiIcon,
        href: "/mcp",
        isNew: true,
      },
      {
        kind: "link",
        id: "activity",
        labelKey: "navigation.activity",
        icon: NavActivityIcon,
        href: "/activity",
      },
      {
        kind: "link",
        id: "blog",
        labelKey: "navigation.blog",
        icon: NavBlogIcon,
        href: "/blog",
      },
    ],
  },
  {
    id: "yourSpace",
    labelKey: "navigation.dock.groups.yourSpace",
    items: [
      {
        kind: "link",
        id: "profile",
        labelKey: "navigation.profile",
        icon: NavUserIcon,
        href: "/profile",
        profileTab: "main",
      },
      {
        kind: "link",
        id: "library",
        labelKey: "navigation.library",
        icon: NavLibraryIcon,
        href: "/library",
      },
      {
        kind: "link",
        id: "collections",
        labelKey: "navigation.collections",
        icon: NavCollectionsIcon,
        href: "/profile?tab=collections",
        profileTab: "collections",
      },
      {
        kind: "link",
        id: "journal",
        labelKey: "navigation.journal",
        icon: NavJournalIcon,
        href: "/profile?tab=journal",
        profileTab: "journal",
      },
      {
        kind: "link",
        id: "achievements",
        labelKey: "navigation.achievements",
        icon: NavAchievementsIcon,
        href: "/achievements",
      },
      {
        kind: "link",
        id: "feats",
        labelKey: "navigation.feats",
        icon: NavFeatsIcon,
        href: "/feats",
      },
      {
        kind: "action",
        id: "wrapped",
        labelKey: "navigation.wrapped",
        icon: NavWrappedIcon,
        action: "wrapped",
      },
    ],
  },
];

export const DOCK_UTILITY_ITEMS: DockItemDefinition[] = [
  {
    kind: "action",
    id: "premium",
    labelKey: "navigation.premium",
    icon: NavPremiumIcon,
    action: "premium",
  },
];

export type DockQuery = {
  [key: string]: string | string[] | undefined;
};

/**
 * Design §4: profile items are active based on the `tab` query, every other
 * link is active on an exact match or a child route. Action items are never
 * active.
 */
export function isDockItemActive(
  item: DockItemDefinition,
  pathname: string,
  query: DockQuery = {},
): boolean {
  if (item.kind !== "link") {
    return false;
  }

  if (item.profileTab) {
    if (!pathname.startsWith("/profile")) {
      return false;
    }

    const tab = Array.isArray(query.tab) ? query.tab[0] : query.tab;

    if (item.profileTab === "main") {
      return !tab || tab === "main";
    }

    return tab === item.profileTab;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
