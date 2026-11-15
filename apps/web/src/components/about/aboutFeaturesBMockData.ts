import { aboutAsset, LANDING_ASSETS, PLATFORM_ICONS } from "./aboutAssets";

/**
 * Fixed content for the Connections, AI, Daily/Awards/Blog and mobile app
 * sections. Proper nouns (games, assistant names, mock values) stay literal;
 * interface copy is referenced through `about.*` translation keys.
 */

/** Six connections shown around the GameNode hub, in the design order. */
const CONNECTION_PLATFORMS = [
  {
    id: "steam",
    label: "about.connections.platforms.steam",
    icon: PLATFORM_ICONS.steam,
  },
  {
    id: "playstation",
    label: "about.connections.platforms.playstation",
    icon: PLATFORM_ICONS.playstation,
  },
  {
    id: "xbox",
    label: "about.connections.platforms.xbox",
    icon: PLATFORM_ICONS.xbox,
  },
  {
    id: "epicGames",
    label: "about.connections.platforms.epicGames",
    icon: PLATFORM_ICONS.epicGames,
  },
  {
    id: "nintendo",
    label: "about.connections.platforms.nintendo",
    icon: aboutAsset("icon-nintendo.svg"),
  },
  {
    id: "gog",
    label: "about.connections.platforms.gog",
    icon: PLATFORM_ICONS.gog,
  },
] as const;

const CONNECTION_HUB = {
  logo: LANDING_ASSETS.logo,
  chips: [
    { id: "library", label: "about.connections.chips.library" },
    { id: "playtime", label: "about.connections.chips.playtime" },
    { id: "achievements", label: "about.connections.chips.achievements" },
  ],
} as const;

/** Assistants named in the design; only the chips' labels are translated. */
const AI_ASSISTANTS = [
  { id: "claude", label: "about.ai.assistants.claude" },
  { id: "chatgpt", label: "about.ai.assistants.chatgpt" },
  { id: "codex", label: "about.ai.assistants.codex" },
  { id: "claudeCode", label: "about.ai.assistants.claudeCode" },
] as const;

/** Decorative permission switches: the last one is drawn off in the design. */
const AI_PERMISSIONS = [
  {
    id: "library",
    label: "about.ai.permissions.library",
    enabled: true,
  },
  {
    id: "libraryWrite",
    label: "about.ai.permissions.libraryWrite",
    enabled: true,
  },
  {
    id: "reviews",
    label: "about.ai.permissions.reviews",
    enabled: true,
  },
  {
    id: "publish",
    label: "about.ai.permissions.publish",
    enabled: false,
  },
] as const;

/** Game card returned by the illustrative assistant reply. */
const AI_GAME = {
  title: "It Takes Two",
  cover: aboutAsset("cover-it-takes-two.png"),
} as const;

const DAILY_MODES = [
  {
    id: "cover",
    title: "about.beyond.daily.modes.cover.title",
    description: "about.beyond.daily.modes.cover.description",
    preview: "cover",
  },
  {
    id: "artwork",
    title: "about.beyond.daily.modes.artwork.title",
    description: "about.beyond.daily.modes.artwork.description",
    preview: "artwork",
  },
  {
    id: "keywords",
    title: "about.beyond.daily.modes.keywords.title",
    description: "about.beyond.daily.modes.keywords.description",
    preview: "keywords",
  },
  {
    id: "specs",
    title: "about.beyond.daily.modes.specs.title",
    description: "about.beyond.daily.modes.specs.description",
    preview: "specs",
  },
] as const;

const DAILY_COVERS = {
  cover: aboutAsset("cover-pixelated.png"),
  artwork: aboutAsset("cover-outer-wilds.png"),
} as const;

const DAILY_KEYWORDS = [
  "about.beyond.daily.keywords.exploration",
  "about.beyond.daily.keywords.space",
  "about.beyond.daily.keywords.timeLoop",
  "about.beyond.daily.keywords.mystery",
] as const;

/** Unknown keyword slots in the mockup are a literal, as in the design. */
const DAILY_UNKNOWN_KEYWORD_COUNT = 2;

/** Colored comparison cells of the specs mode, row by row. */
const DAILY_SPEC_ROWS = [
  [
    { label: "about.beyond.daily.specs.action", tone: "green" },
    { label: "about.beyond.daily.specs.year", tone: "yellow" },
  ],
  [
    { label: "about.beyond.daily.specs.ps4", tone: "red" },
    { label: "about.beyond.daily.specs.indie", tone: "green" },
  ],
  [
    { label: "about.beyond.daily.specs.twoD", tone: "yellow" },
    { label: "about.beyond.daily.specs.solo", tone: "green" },
  ],
  [
    { label: "about.beyond.daily.specs.unity", tone: "red" },
    { label: "about.beyond.daily.specs.metroid", tone: "green" },
  ],
] as const;

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=app.gamenode";

export {
  AI_ASSISTANTS,
  AI_GAME,
  AI_PERMISSIONS,
  CONNECTION_HUB,
  CONNECTION_PLATFORMS,
  DAILY_COVERS,
  DAILY_KEYWORDS,
  DAILY_MODES,
  DAILY_SPEC_ROWS,
  DAILY_UNKNOWN_KEYWORD_COUNT,
  GOOGLE_PLAY_URL,
};
