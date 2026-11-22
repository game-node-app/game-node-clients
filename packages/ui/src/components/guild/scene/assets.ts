/**
 * Every SVG exported from Figma for the Guild, with the intrinsic size taken
 * from each file's root width/height (design D4). Paths are served by both
 * apps from `public/img/guild`; the files are artwork and are never edited.
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
