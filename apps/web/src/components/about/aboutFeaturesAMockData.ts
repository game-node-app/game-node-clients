import { aboutAsset } from "./aboutAssets";
import { MOCK_GAMES, type AboutMockGameId } from "./aboutMockData";

/**
 * Fixed values for the library, journal, progress and community mockups.
 * Game titles, usernames and numeric mock values are proper names/literals from
 * the design; every piece of interface copy lives under `about.*`.
 */

const mockGame = (id: AboutMockGameId) => {
  const game = MOCK_GAMES.find((item) => item.id === id);
  if (!game) {
    throw new Error(`Unknown About mock game: ${id}`);
  }
  return game;
};

/* Library */

const LIBRARY_BULLET_KEYS = [
  "about.library.bullets.statuses",
  "about.library.bullets.collections",
  "about.library.bullets.dlc",
  "about.library.bullets.export",
] as const;

const LIBRARY_STATUS_KEYS = {
  playing: "about.library.mock.statuses.playing",
  planned: "about.library.mock.statuses.planned",
  finished: "about.library.mock.statuses.finished",
  dropped: "about.library.mock.statuses.dropped",
} as const;

type LibraryShelfGame = {
  title: string;
  /** Caption as drawn in the design: title plus playtime or completion. */
  caption: string;
  cover: string;
};

type LibraryShelf = {
  id: keyof typeof LIBRARY_STATUS_KEYS;
  labelKey: (typeof LIBRARY_STATUS_KEYS)[keyof typeof LIBRARY_STATUS_KEYS];
  dotColor: string;
  count: number;
  games: readonly LibraryShelfGame[];
};

const LIBRARY_SHELVES = [
  {
    id: "playing",
    labelKey: LIBRARY_STATUS_KEYS.playing,
    dotColor: "#3dd68c",
    count: 3,
    games: [
      {
        title: "Hades",
        caption: "Hades · 42 h",
        cover: mockGame("hades").cover,
      },
      {
        title: "Baldur's Gate 3",
        caption: "Baldur's Gate 3 · 18 h",
        cover: mockGame("baldurs-gate-3").cover,
      },
    ],
  },
  {
    id: "planned",
    labelKey: LIBRARY_STATUS_KEYS.planned,
    dotColor: "#5b9bff",
    count: 27,
    games: [
      {
        title: "Outer Wilds",
        caption: "Outer Wilds",
        cover: mockGame("outer-wilds").cover,
      },
      {
        title: "It Takes Two",
        caption: "It Takes Two",
        cover: mockGame("it-takes-two").cover,
      },
    ],
  },
  {
    id: "finished",
    labelKey: LIBRARY_STATUS_KEYS.finished,
    dotColor: "var(--gn-brand)",
    count: 64,
    games: [
      {
        title: "Celeste",
        caption: "Celeste · 100%",
        cover: mockGame("celeste").cover,
      },
      {
        title: "Hollow Knight",
        caption: "Hollow Knight",
        cover: mockGame("hollow-knight").cover,
      },
    ],
  },
  {
    id: "dropped",
    labelKey: LIBRARY_STATUS_KEYS.dropped,
    dotColor: "#6f6f6f",
    count: 5,
    games: [
      {
        title: "Cyberpunk 2077",
        caption: "Cyberpunk 2077",
        cover: aboutAsset("cover-cyberpunk-2077.png"),
      },
    ],
  },
] as const satisfies readonly LibraryShelf[];

/* Journal */

const DIARY_BARS = [
  {
    id: "mon",
    labelKey: "about.journal.weekdays.mon",
    desktopHeight: 60,
    mobileHeight: 36,
  },
  {
    id: "tue",
    labelKey: "about.journal.weekdays.tue",
    desktopHeight: 104,
    mobileHeight: 62,
  },
  {
    id: "wed",
    labelKey: "about.journal.weekdays.wed",
    desktopHeight: 36,
    mobileHeight: 22,
  },
  {
    id: "thu",
    labelKey: "about.journal.weekdays.thu",
    desktopHeight: 128,
    mobileHeight: 77,
  },
  {
    id: "fri",
    labelKey: "about.journal.weekdays.fri",
    desktopHeight: 178,
    mobileHeight: 98,
    highlighted: true,
  },
  {
    id: "sat",
    labelKey: "about.journal.weekdays.sat",
    desktopHeight: 160,
    mobileHeight: 96,
  },
  {
    id: "sun",
    labelKey: "about.journal.weekdays.sun",
    desktopHeight: 88,
    mobileHeight: 53,
  },
] as const;

const DIARY_SESSIONS = [
  {
    title: "Hades",
    metaKey: "about.journal.sessions.hades",
    cover: mockGame("hades").cover,
  },
  {
    title: "Baldur's Gate 3",
    metaKey: "about.journal.sessions.baldursGate",
    cover: mockGame("baldurs-gate-3").cover,
  },
  {
    title: "Celeste",
    metaKey: "about.journal.sessions.celeste",
    cover: mockGame("celeste").cover,
  },
] as const;

const TIME_TO_BEAT = [
  {
    id: "main",
    labelKey: "about.journal.timeToBeat.main",
    value: "27 h",
    width: "43%",
    color: "var(--gn-brand)",
  },
  {
    id: "extras",
    labelKey: "about.journal.timeToBeat.extras",
    value: "42 h",
    width: "67%",
    color: "#c2380f",
  },
  {
    id: "completionist",
    labelKey: "about.journal.timeToBeat.completionist",
    value: "63 h",
    width: "100%",
    color: "#7a1e0b",
  },
] as const;

const REVIEW = {
  username: "Lamarcke",
  avatar: aboutAsset("avatar-celeste.png"),
  stars: 5,
} as const;

/* Progress */

const PROGRESS_ACHIEVEMENTS = [
  {
    id: "reviewer",
    icon: aboutAsset("icon-pencil.svg"),
    titleKey: "about.progress.achievements.reviewer.title",
    requirementKey: "about.progress.achievements.reviewer.requirement",
    xpKey: "about.progress.achievements.reviewer.xp",
  },
  {
    id: "collector",
    icon: aboutAsset("icon-bookshelf.svg"),
    titleKey: "about.progress.achievements.collector.title",
    requirementKey: "about.progress.achievements.collector.requirement",
    xpKey: "about.progress.achievements.collector.xp",
  },
  {
    id: "voter",
    icon: aboutAsset("icon-medal-ribbon.svg"),
    titleKey: "about.progress.achievements.voter.title",
    requirementKey: "about.progress.achievements.voter.requirement",
    xpKey: "about.progress.achievements.voter.xp",
  },
] as const;

const RETROSPECTIVE_STATS = [
  {
    id: "hours",
    value: "312 h",
    labelKey: "about.progress.retrospective.stats.hours",
  },
  {
    id: "games",
    value: "41",
    labelKey: "about.progress.retrospective.stats.games",
  },
  {
    id: "reviews",
    value: "18",
    labelKey: "about.progress.retrospective.stats.reviews",
  },
  {
    id: "collections",
    value: "6",
    labelKey: "about.progress.retrospective.stats.collections",
  },
] as const;

const RETROSPECTIVE_GENRES = [
  "about.progress.retrospective.genres.roguelike",
  "about.progress.retrospective.genres.rpg",
  "about.progress.retrospective.genres.platform",
  "about.progress.retrospective.genres.metroidvania",
] as const;

/* Community */

type CommunityFeedItem = {
  id: string;
  username: string;
  avatar: string;
  actionKey: string;
  targetKey: string;
  suffixKey?: string;
  timeKey: string;
  cover?: string;
  achievementIcon?: string;
};

const COMMUNITY_FEED = [
  {
    id: "added",
    username: "ThePrado",
    avatar: aboutAsset("avatar-hollow-knight.png"),
    actionKey: "about.community.feed.items.added.action",
    targetKey: "about.community.feed.items.added.target",
    suffixKey: "about.community.feed.items.added.suffix",
    timeKey: "about.community.times.twelveMinutes",
    cover: mockGame("outer-wilds").cover,
    achievementIcon: undefined,
  },
  {
    id: "reviewed",
    username: "Lamarcke",
    avatar: aboutAsset("avatar-celeste.png"),
    actionKey: "about.community.feed.items.reviewed.action",
    targetKey: "about.community.feed.items.reviewed.target",
    suffixKey: "about.community.feed.items.reviewed.suffix",
    timeKey: "about.community.times.oneHour",
    cover: mockGame("celeste").cover,
    achievementIcon: undefined,
  },
  {
    id: "unlocked",
    username: "Kiss",
    avatar: aboutAsset("avatar-red-dead-redemption-2.png"),
    actionKey: "about.community.feed.items.unlocked.action",
    targetKey: "about.community.feed.items.unlocked.target",
    suffixKey: "about.community.feed.items.unlocked.suffix",
    timeKey: "about.community.times.threeHours",
    cover: undefined,
    achievementIcon: aboutAsset("icon-trophy-simple.svg"),
  },
  {
    id: "posted",
    username: "nina.cozy",
    avatar: aboutAsset("avatar-stardew-valley.png"),
    actionKey: "about.community.feed.items.posted.action",
    targetKey: "about.community.feed.items.posted.target",
    suffixKey: undefined,
    timeKey: "about.community.times.yesterday",
    cover: aboutAsset("cover-stardew-valley.png"),
    achievementIcon: undefined,
  },
] as const satisfies readonly CommunityFeedItem[];

const COMMUNITY_PERIODS = [
  {
    id: "week",
    labelKey: "about.community.explore.periods.week",
    active: true,
  },
  {
    id: "month",
    labelKey: "about.community.explore.periods.month",
    active: false,
  },
  {
    id: "threeMonths",
    labelKey: "about.community.explore.periods.threeMonths",
    active: false,
  },
  {
    id: "sixMonths",
    labelKey: "about.community.explore.periods.sixMonths",
    active: false,
  },
  {
    id: "year",
    labelKey: "about.community.explore.periods.year",
    active: false,
  },
] as const;

const EXPLORE_RANKING = [
  { rank: 1, title: "Balatro", cover: aboutAsset("cover-balatro.png") },
  { rank: 2, title: "Hi-Fi Rush", cover: aboutAsset("cover-hi-fi-rush.png") },
  { rank: 3, title: "Sekiro", cover: aboutAsset("cover-sekiro.png") },
  { rank: 4, title: "Dead Cells", cover: aboutAsset("cover-dead-cells.png") },
] as const;

const EXPLORE_FILTERS = [
  "about.community.explore.filters.genres",
  "about.community.explore.filters.platforms",
  "about.community.explore.filters.themes",
  "about.community.explore.filters.modes",
] as const;

export {
  COMMUNITY_FEED,
  COMMUNITY_PERIODS,
  DIARY_BARS,
  DIARY_SESSIONS,
  EXPLORE_FILTERS,
  EXPLORE_RANKING,
  LIBRARY_BULLET_KEYS,
  LIBRARY_SHELVES,
  PROGRESS_ACHIEVEMENTS,
  RETROSPECTIVE_GENRES,
  RETROSPECTIVE_STATS,
  REVIEW,
  TIME_TO_BEAT,
};
export type { CommunityFeedItem, LibraryShelf, LibraryShelfGame };
