import type { TranslationSchema } from "@repo/locales";
import { aboutAsset } from "./aboutAssets";
import { ABOUT_SECTION_IDS } from "./aboutMockData";

/**
 * Fixed values for the top sections (hero, manifesto and feature index).
 * Game titles and icon files are proper names of the design; interface copy
 * comes from the `about.*` translation namespace.
 */

type AboutCoverPreview = {
  id: string;
  title: string;
  cover: string;
};

/** Covers of the hero mosaic, column by column, in the design order. */
const ABOUT_HERO_MOSAIC = [
  [
    {
      id: "hades",
      title: "Hades",
      cover: aboutAsset("cover-hades.png"),
    },
    {
      id: "outer-wilds",
      title: "Outer Wilds",
      cover: aboutAsset("cover-outer-wilds.png"),
    },
  ],
  [
    {
      id: "elden-ring",
      title: "Elden Ring",
      cover: aboutAsset("cover-elden-ring.png"),
    },
    {
      id: "celeste",
      title: "Celeste",
      cover: aboutAsset("cover-celeste.png"),
    },
  ],
  [
    {
      id: "hollow-knight",
      title: "Hollow Knight",
      cover: aboutAsset("cover-hollow-knight.png"),
    },
    {
      id: "baldurs-gate-3",
      title: "Baldur's Gate 3",
      cover: aboutAsset("cover-baldurs-gate-3.png"),
    },
  ],
] as const satisfies readonly (readonly AboutCoverPreview[])[];

const ABOUT_HERO_PLAYING = {
  title: "Hades",
  cover: aboutAsset("cover-hades.png"),
} as const;

const ABOUT_HERO_COMPLETED = {
  cover: aboutAsset("cover-celeste.png"),
} as const;

/** Number of filled stars in the floating "Concluído" card. */
const ABOUT_HERO_RATING = 5;

type AboutManifestoItemKey =
  keyof TranslationSchema["about"]["manifesto"]["items"];

type AboutManifestoItem = {
  id: AboutManifestoItemKey;
  titleKey: `about.manifesto.items.${AboutManifestoItemKey}.title`;
  descriptionKey: `about.manifesto.items.${AboutManifestoItemKey}.description`;
  icon: string;
};

const ABOUT_MANIFESTO_ITEMS = [
  {
    id: "free",
    titleKey: "about.manifesto.items.free.title",
    descriptionKey: "about.manifesto.items.free.description",
    icon: aboutAsset("icon-heart-outline.svg"),
  },
  {
    id: "openSource",
    titleKey: "about.manifesto.items.openSource.title",
    descriptionKey: "about.manifesto.items.openSource.description",
    icon: aboutAsset("icon-github-outline.svg"),
  },
  {
    id: "community",
    titleKey: "about.manifesto.items.community.title",
    descriptionKey: "about.manifesto.items.community.description",
    icon: aboutAsset("icon-crown-outline.svg"),
  },
] as const satisfies readonly AboutManifestoItem[];

type AboutIndexItemKey = keyof TranslationSchema["about"]["index"]["items"];

type AboutFeatureIndexItem = {
  id: AboutIndexItemKey;
  titleKey: `about.index.items.${AboutIndexItemKey}.title`;
  descriptionKey: `about.index.items.${AboutIndexItemKey}.description`;
  icon: string;
  /** Section anchor from D6; items without a section stay as plain text. */
  href?: string;
};

const ABOUT_FEATURE_INDEX_ITEMS: readonly AboutFeatureIndexItem[] = [
  {
    id: "library",
    titleKey: "about.index.items.library.title",
    descriptionKey: "about.index.items.library.description",
    icon: aboutAsset("icon-library.svg"),
    href: `#${ABOUT_SECTION_IDS.library}`,
  },
  {
    id: "sync",
    titleKey: "about.index.items.sync.title",
    descriptionKey: "about.index.items.sync.description",
    icon: aboutAsset("icon-refresh.svg"),
    href: `#${ABOUT_SECTION_IDS.connections}`,
  },
  {
    id: "collections",
    titleKey: "about.index.items.collections.title",
    descriptionKey: "about.index.items.collections.description",
    icon: aboutAsset("icon-layers.svg"),
    href: `#${ABOUT_SECTION_IDS.library}`,
  },
  {
    id: "explore",
    titleKey: "about.index.items.explore.title",
    descriptionKey: "about.index.items.explore.description",
    icon: aboutAsset("icon-compass.svg"),
    href: `#${ABOUT_SECTION_IDS.community}`,
  },
  {
    id: "reviews",
    titleKey: "about.index.items.reviews.title",
    descriptionKey: "about.index.items.reviews.description",
    icon: aboutAsset("icon-star-outline.svg"),
    href: `#${ABOUT_SECTION_IDS.journal}`,
  },
  {
    id: "activity",
    titleKey: "about.index.items.activity.title",
    descriptionKey: "about.index.items.activity.description",
    icon: aboutAsset("icon-users.svg"),
    href: `#${ABOUT_SECTION_IDS.community}`,
  },
  {
    id: "journal",
    titleKey: "about.index.items.journal.title",
    descriptionKey: "about.index.items.journal.description",
    icon: aboutAsset("icon-calendar-clock.svg"),
    href: `#${ABOUT_SECTION_IDS.journal}`,
  },
  {
    id: "ai",
    titleKey: "about.index.items.ai.title",
    descriptionKey: "about.index.items.ai.description",
    icon: aboutAsset("icon-sparkles.svg"),
    href: `#${ABOUT_SECTION_IDS.ai}`,
  },
  {
    id: "timeToBeat",
    titleKey: "about.index.items.timeToBeat.title",
    descriptionKey: "about.index.items.timeToBeat.description",
    icon: aboutAsset("icon-hourglass.svg"),
    href: `#${ABOUT_SECTION_IDS.journal}`,
  },
  {
    id: "daily",
    titleKey: "about.index.items.daily.title",
    descriptionKey: "about.index.items.daily.description",
    icon: aboutAsset("icon-puzzle.svg"),
    href: `#${ABOUT_SECTION_IDS.daily}`,
  },
  {
    id: "achievements",
    titleKey: "about.index.items.achievements.title",
    descriptionKey: "about.index.items.achievements.description",
    icon: aboutAsset("icon-trophy.svg"),
    href: `#${ABOUT_SECTION_IDS.progress}`,
  },
  {
    id: "awards",
    titleKey: "about.index.items.awards.title",
    descriptionKey: "about.index.items.awards.description",
    icon: aboutAsset("icon-medal.svg"),
    href: `#${ABOUT_SECTION_IDS.daily}`,
  },
  {
    id: "retrospective",
    titleKey: "about.index.items.retrospective.title",
    descriptionKey: "about.index.items.retrospective.description",
    icon: aboutAsset("icon-chart.svg"),
    href: `#${ABOUT_SECTION_IDS.progress}`,
  },
  {
    id: "mobile",
    titleKey: "about.index.items.mobile.title",
    descriptionKey: "about.index.items.mobile.description",
    icon: aboutAsset("icon-smartphone.svg"),
    href: `#${ABOUT_SECTION_IDS.mobileApp}`,
  },
  {
    id: "notifications",
    titleKey: "about.index.items.notifications.title",
    descriptionKey: "about.index.items.notifications.description",
    icon: aboutAsset("icon-bell.svg"),
  },
  {
    id: "premium",
    titleKey: "about.index.items.premium.title",
    descriptionKey: "about.index.items.premium.description",
    icon: aboutAsset("icon-crown-outline.svg"),
    href: `#${ABOUT_SECTION_IDS.premium}`,
  },
];

export {
  ABOUT_FEATURE_INDEX_ITEMS,
  ABOUT_HERO_COMPLETED,
  ABOUT_HERO_MOSAIC,
  ABOUT_HERO_PLAYING,
  ABOUT_HERO_RATING,
  ABOUT_MANIFESTO_ITEMS,
};
export type { AboutCoverPreview, AboutFeatureIndexItem, AboutManifestoItem };
