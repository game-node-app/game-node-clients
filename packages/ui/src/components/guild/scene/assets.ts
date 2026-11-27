/**
 * Every Guild SVG, with the intrinsic size taken from each file's root
 * width/height (design D4). Paths are served by both apps from
 * `public/img/guild`; the files are artwork and are never edited (the
 * expansion assets are hand-authored in the same pixel-art style).
 */
export const GUILD_ASSETS = {
  // Lina sprites (one 32x34 sprite at 6x).
  "lina-body": { src: "/img/guild/lina-body.svg", width: 192, height: 204 },
  "lina-braids": { src: "/img/guild/lina-braids.svg", width: 192, height: 204 },
  "lina-eyes-closed": {
    src: "/img/guild/lina-eyes-closed.svg",
    width: 192,
    height: 204,
  },
  "lina-eyes-happy": {
    src: "/img/guild/lina-eyes-happy.svg",
    width: 192,
    height: 204,
  },
  "lina-mouth-open": {
    src: "/img/guild/lina-mouth-open.svg",
    width: 192,
    height: 204,
  },
  "lina-smile": { src: "/img/guild/lina-smile.svg", width: 192, height: 204 },

  // Hall props.
  lantern: { src: "/img/guild/lantern.svg", width: 48, height: 66 },
  "lantern-glow": {
    src: "/img/guild/lantern-glow.svg",
    width: 220,
    height: 220,
  },
  "accepted-glow": {
    src: "/img/guild/accepted-glow.svg",
    width: 300,
    height: 300,
  },
  "alert-bubble": {
    src: "/img/guild/alert-bubble.svg",
    width: 42,
    height: 66,
  },
  ledger: { src: "/img/guild/ledger.svg", width: 96, height: 60 },
  inkpot: { src: "/img/guild/inkpot.svg", width: 48, height: 60 },
  stamp: { src: "/img/guild/stamp.svg", width: 42, height: 42 },
  milk: { src: "/img/guild/milk.svg", width: 36, height: 60 },
  bell: { src: "/img/guild/bell.svg", width: 48, height: 48 },
  mug: { src: "/img/guild/mug.svg", width: 54, height: 48 },
  plant: { src: "/img/guild/plant.svg", width: 48, height: 48 },

  // Currency, chest tiers and consumables (design D4).
  seal: { src: "/img/guild/seal.svg", width: 18, height: 18 },
  "chest-bronze": { src: "/img/guild/chest-bronze.svg", width: 30, height: 24 },
  "chest-silver": { src: "/img/guild/chest-silver.svg", width: 30, height: 24 },
  "chest-gold": { src: "/img/guild/chest-gold.svg", width: 30, height: 24 },
  "chest-relic": { src: "/img/guild/chest-relic.svg", width: 30, height: 24 },
  "reroll-charter": {
    src: "/img/guild/reroll-charter.svg",
    width: 24,
    height: 27,
  },
  "extra-slot-permit": {
    src: "/img/guild/extra-slot-permit.svg",
    width: 24,
    height: 27,
  },

  // Tavern decor (design D4); the three props at the top reuse hall artwork.
  "decor-brass-astrolabe": {
    src: "/img/guild/decor-brass-astrolabe.svg",
    width: 48,
    height: 48,
  },
  "decor-oak-barrel": {
    src: "/img/guild/decor-oak-barrel.svg",
    width: 48,
    height: 48,
  },
  "decor-crystal-chandelier": {
    src: "/img/guild/decor-crystal-chandelier.svg",
    width: 48,
    height: 48,
  },
  "decor-ancient-globe": {
    src: "/img/guild/decor-ancient-globe.svg",
    width: 48,
    height: 48,
  },
  "decor-curators-shelf": {
    src: "/img/guild/decor-curators-shelf.svg",
    width: 48,
    height: 48,
  },
  "decor-snowglobe": {
    src: "/img/guild/decor-snowglobe.svg",
    width: 48,
    height: 48,
  },
  "decor-sleeping-cat": {
    src: "/img/guild/decor-sleeping-cat.svg",
    width: 54,
    height: 36,
  },
  "decor-autumn-wreath": {
    src: "/img/guild/decor-autumn-wreath.svg",
    width: 48,
    height: 48,
  },
  "decor-compass-rose": {
    src: "/img/guild/decor-compass-rose.svg",
    width: 48,
    height: 48,
  },
  "decor-enchanted-tapestry": {
    src: "/img/guild/decor-enchanted-tapestry.svg",
    width: 48,
    height: 60,
  },
  "decor-golden-griffin": {
    src: "/img/guild/decor-golden-griffin.svg",
    width: 48,
    height: 48,
  },
  "decor-relic-plinth": {
    src: "/img/guild/decor-relic-plinth.svg",
    width: 48,
    height: 48,
  },
  // Unknown decor keys degrade to the crate so the counter never shows a hole.
  "decor-generic": {
    src: "/img/guild/decor-generic.svg",
    width: 48,
    height: 48,
  },

  // Progression.
  "prestige-star": {
    src: "/img/guild/prestige-star.svg",
    width: 14,
    height: 14,
  },

  // Icons.
  book: { src: "/img/guild/book.svg", width: 30, height: 27 },
  scroll: { src: "/img/guild/scroll.svg", width: 30, height: 27 },
  hourglass: { src: "/img/guild/hourglass.svg", width: 24, height: 27 },
  trophy: { src: "/img/guild/trophy.svg", width: 30, height: 30 },
  quill: { src: "/img/guild/quill.svg", width: 24, height: 27 },
  chest: { src: "/img/guild/chest.svg", width: 30, height: 24 },
  coin: { src: "/img/guild/coin.svg", width: 16, height: 14 },
  star: { src: "/img/guild/star.svg", width: 28, height: 28 },
  "alert-icon": { src: "/img/guild/alert-icon.svg", width: 14, height: 22 },
  shield: { src: "/img/guild/shield.svg", width: 22, height: 24 },
  silhouette: { src: "/img/guild/silhouette.svg", width: 30, height: 36 },
  cursor: { src: "/img/guild/cursor.svg", width: 10, height: 12 },
  // The Figma export is 16x16 (D4's 12x12 is the rendered size; wave 2 scales).
  pin: { src: "/img/guild/pin.svg", width: 16, height: 16 },
  "pin-highlight": {
    src: "/img/guild/pin-highlight.svg",
    width: 16,
    height: 16,
  },
} as const;

export type GuildAssetName = keyof typeof GUILD_ASSETS;
export type GuildAsset = (typeof GUILD_ASSETS)[GuildAssetName];
