import type { CSSProperties } from "react";
import { aboutAsset } from "./aboutAssets";

/**
 * Fixed values for the closing sections (Premium, supporters wall, promise and
 * final CTA). Game titles and usernames are proper names of the design and stay
 * literal; every piece of interface copy comes from the `about.*` namespace.
 */

type AboutPremiumCover = {
  id: string;
  title: string;
  cover: string;
};

const PREMIUM_PROFILE = {
  username: "ThePrado",
  premiumSinceYear: 2025,
  level: 14,
  followers: 10,
  following: 15,
  avatar: aboutAsset("avatar-hollow-knight.png"),
  backdrop: aboutAsset("premium-cover.png"),
  playing: {
    title: "Hades",
    cover: aboutAsset("cover-hades.png"),
  },
  covers: [
    {
      id: "elden-ring",
      title: "Elden Ring",
      cover: aboutAsset("cover-elden-ring.png"),
    },
    {
      id: "sekiro",
      title: "Sekiro",
      cover: aboutAsset("cover-sekiro.png"),
    },
    {
      id: "dead-cells",
      title: "Dead Cells",
      cover: aboutAsset("cover-dead-cells.png"),
    },
    {
      id: "disco-elysium",
      title: "Disco Elysium",
      cover: aboutAsset("cover-disco-elysium.png"),
    },
  ] as const satisfies readonly AboutPremiumCover[],
} as const;

/**
 * Premium benefits grouped exactly as the design reads them. The `id` maps to
 * the grid area used on wide screens.
 */
const PREMIUM_GROUPS = [
  {
    id: "profile",
    titleKey: "about.premium.groups.profile.title",
    items: [
      {
        id: "videoCover",
        labelKey: "about.premium.groups.profile.videoCover",
        icon: aboutAsset("icon-play.svg"),
      },
      {
        id: "animatedBorder",
        labelKey: "about.premium.groups.profile.animatedBorder",
        icon: aboutAsset("icon-sparkles-outline.svg"),
      },
      {
        id: "theme",
        labelKey: "about.premium.groups.profile.theme",
        icon: aboutAsset("icon-flame.svg"),
      },
    ],
  },
  {
    id: "library",
    titleKey: "about.premium.groups.library.title",
    items: [
      {
        id: "unlimitedCollections",
        labelKey: "about.premium.groups.library.unlimitedCollections",
        icon: aboutAsset("icon-layers-outline.svg"),
      },
    ],
  },
  {
    id: "live",
    titleKey: "about.premium.groups.live.title",
    items: [
      {
        id: "liveStatus",
        labelKey: "about.premium.groups.live.liveStatus",
        icon: aboutAsset("icon-link.svg"),
      },
    ],
  },
  {
    id: "supporter",
    titleKey: "about.premium.groups.supporter.title",
    items: [
      {
        id: "badge",
        labelKey: "about.premium.groups.supporter.badge",
        icon: aboutAsset("icon-crown-violet.svg"),
      },
      {
        id: "wall",
        labelKey: "about.premium.groups.supporter.wall",
        icon: aboutAsset("icon-heart-violet.svg"),
      },
    ],
  },
] as const;

const PREMIUM_GUARANTEES = [
  {
    id: "cancel",
    labelKey: "about.premium.guarantees.cancel",
  },
  {
    id: "downgrade",
    labelKey: "about.premium.guarantees.downgrade",
  },
] as const;

/** Page size that closes four rows of six cards on desktop (design D3). */
const WALL_LIMIT = 23;

/** Supporters revealed before "See more" on a single-column-width grid. */
const WALL_INITIAL_VISIBLE = 7;

/** Skeleton cards shown while the wall request resolves. */
const WALL_SKELETONS = 8;

/**
 * Wall columns per breakpoint (tablet, laptop, desktop) as the CSS grid
 * declares them. `getWallColumnStyle` may deviate by a column so the closing
 * "Your name here" card never sits alone on a last row.
 */
const WALL_BASE_COLUMNS = { md: 3, lg: 4, xl: 6 } as const;

const pickWallColumns = (total: number, base: number) => {
  const candidates = [
    base,
    ...(total <= base + 1 ? [base + 1] : []),
    base - 1,
    base - 2,
  ].filter((columns) => columns >= 2);

  const fit = candidates.find(
    (columns) => total <= columns || total % columns !== 1,
  );

  return fit ?? base;
};

/**
 * Inline CSS variables for the wall grid. `total` counts every tile,
 * including the closing CTA card.
 */
const getWallColumnStyle = (total: number): CSSProperties =>
  ({
    "--wall-cols-md": pickWallColumns(total, WALL_BASE_COLUMNS.md),
    "--wall-cols-lg": pickWallColumns(total, WALL_BASE_COLUMNS.lg),
    "--wall-cols-xl": pickWallColumns(total, WALL_BASE_COLUMNS.xl),
  }) as CSSProperties;

const ABOUT_CLOSING_LINKS = {
  github: "https://github.com/game-node-app",
  discord: "https://discord.gg/kcAT562B5A",
} as const;

export {
  ABOUT_CLOSING_LINKS,
  getWallColumnStyle,
  PREMIUM_GROUPS,
  PREMIUM_GUARANTEES,
  PREMIUM_PROFILE,
  WALL_INITIAL_VISIBLE,
  WALL_LIMIT,
  WALL_SKELETONS,
};
