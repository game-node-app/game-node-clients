import { aboutAsset } from "./aboutAssets";

/**
 * Shared mock data for the About page. Section components extend this file with
 * their own fixed values; game covers live here so repeated covers stay in sync.
 */

/** Anchor ids shared by the About sections and the feature index (D6). */
const ABOUT_SECTION_IDS = {
  features: "features",
  library: "library",
  journal: "journal",
  progress: "progress",
  community: "community",
  connections: "connections",
  ai: "ai",
  daily: "daily",
  mobileApp: "mobile-app",
  premium: "premium",
} as const;

type AboutSectionId =
  (typeof ABOUT_SECTION_IDS)[keyof typeof ABOUT_SECTION_IDS];

type AboutMockGame = {
  id: string;
  title: string;
  /** Local cover under `public/img/about`, delivered by the assets task. */
  cover: string;
};

/**
 * Game covers reused across the About mockups. Titles are proper names and stay
 * literal, as the landing does; only interface copy is translated.
 */
const MOCK_GAMES = [
  {
    id: "hades",
    title: "Hades",
    cover: aboutAsset("cover-hades.png"),
  },
  {
    id: "celeste",
    title: "Celeste",
    cover: aboutAsset("cover-celeste.png"),
  },
  {
    id: "outer-wilds",
    title: "Outer Wilds",
    cover: aboutAsset("cover-outer-wilds.png"),
  },
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
  {
    id: "it-takes-two",
    title: "It Takes Two",
    cover: aboutAsset("cover-it-takes-two.png"),
  },
] as const satisfies readonly AboutMockGame[];

type AboutMockGameId = (typeof MOCK_GAMES)[number]["id"];

export { ABOUT_SECTION_IDS, MOCK_GAMES };
export type { AboutSectionId, AboutMockGame, AboutMockGameId };
