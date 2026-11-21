import { premiumAsset } from "./premiumAssets";

export const HERO_PROFILE = {
  username: "ThePrado",
  banner: premiumAsset("d1476.jpg"),
  avatar: premiumAsset("9a908.jpg"),
  steamCover: premiumAsset("414e0.jpg"),
  steamTitle: "Hades",
  duration: "0:04",
  covers: [
    premiumAsset("6aabc.jpg"),
    premiumAsset("09953.jpg"),
    premiumAsset("f2027.jpg"),
    premiumAsset("7f694.jpg"),
  ],
  // theme-exempt: demo accent chips are illustrative profile artwork
  chipColors: [
    "var(--gn-premium)",
    "var(--gn-brand)",
    "var(--gn-status-success-text)",
    "#2f9bff",
  ],
} as const;

export const EXTRAS_ITEMS = [
  { id: "video", icon: premiumAsset("a45ad.svg") },
  { id: "border", icon: premiumAsset("8ad27.svg") },
  { id: "theme", icon: premiumAsset("9fefa.svg") },
  { id: "badge", icon: premiumAsset("fa82c.svg") },
  { id: "title", icon: premiumAsset("3e964.svg") },
  { id: "steam", icon: premiumAsset("e9e86.svg") },
  { id: "collections", icon: premiumAsset("85111.svg") },
  { id: "wall", icon: premiumAsset("0a4e8.svg") },
] as const;

export const VIDEO_FEATURE_FORMATS = ["MP4", "MOV", "WebM", "Matroska"] as const;

export const ACCENT_PROFILES = [
  {
    id: "prado",
    username: "ThePrado",
    titleKey: "completionist",
    avatar: premiumAsset("9a908.jpg"),
    color: "var(--gn-premium)",
    tint: "color-mix(in srgb, var(--gn-premium) 15%, transparent)",
    border: "color-mix(in srgb, var(--gn-premium) 45%, transparent)",
    desktopOnly: false,
  },
  {
    id: "nina",
    username: "nina.cozy",
    titleKey: "cozy",
    avatar: premiumAsset("c393a.jpg"),
    color: "var(--gn-status-success-text)",
    tint: "color-mix(in srgb, var(--gn-status-success-text) 15%, transparent)",
    border:
      "color-mix(in srgb, var(--gn-status-success-text) 45%, transparent)",
    desktopOnly: false,
  },
  {
    id: "rafa",
    username: "rafa_speed",
    titleKey: "speedrunner",
    avatar: premiumAsset("16ccc.jpg"),
    // theme-exempt: demo accent option is an illustrative blue swatch
    color: "#2f9bff",
    tint: "rgba(47, 155, 255, 0.15)", // theme-exempt: tint of the blue demo accent swatch
    border: "rgba(47, 155, 255, 0.45)", // theme-exempt: border of the blue demo accent swatch
    desktopOnly: true,
  },
] as const;

export const ACCENT_SWATCHES = [
  "var(--gn-premium)",
  "var(--gn-brand)",
  "var(--gn-status-success-text)",
  "#2f9bff", // theme-exempt: selectable accent swatch is demo artwork
  "#ffc53d", // theme-exempt: selectable accent swatch is demo artwork
  "#ff4fa3", // theme-exempt: selectable accent swatch is demo artwork
] as const;

// theme-exempt: displayed label of the default accent hex in the demo pill
export const ACCENT_DEFAULT_HEX = "#9747FF";

export const BADGE_TITLE_OPTIONS = [
  { id: "none", selected: false, desktopOnly: false },
  { id: "patron", selected: false, desktopOnly: false },
  { id: "collector", selected: false, desktopOnly: false },
  { id: "completionist", selected: true, desktopOnly: false },
  { id: "explorer", selected: false, desktopOnly: false },
  { id: "critic", selected: false, desktopOnly: false },
  { id: "nightOwl", selected: false, desktopOnly: true },
  { id: "retroFan", selected: false, desktopOnly: true },
  { id: "speedrunner", selected: false, desktopOnly: true },
  { id: "cozyGamer", selected: false, desktopOnly: true },
] as const;

export const BADGE_REVIEW_FIXTURE = {
  author: "ThePrado",
  authorAvatar: premiumAsset("9a908.jpg"),
  gameTitle: "Hollow Knight",
  gameCover: premiumAsset("0a24f.jpg"),
  stars: 5,
  replyAuthor: "sofia.quest",
  replyAvatar: premiumAsset("16ccc.jpg"),
} as const;
