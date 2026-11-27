import styles from "../guild.module.css";

import type { GuildAssetName } from "./assets";

/**
 * Reward cosmetic artwork and class mapping (design D4).
 *
 * Keys come from the seeded reward catalog (hand-off 8.7) and can grow on the
 * server, so every helper accepts any string and degrades to generic artwork
 * or `undefined` instead of throwing.
 */

/** Own-property lookup: `toString`/`constructor` must not resolve to a map value. */
function pick<T>(map: Record<string, T>, key: string): T | undefined {
  return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined;
}

const DECOR_ASSETS: Record<string, GuildAssetName> = {
  decor_mug_of_ale: "mug",
  decor_brass_astrolabe: "decor-brass-astrolabe",
  decor_herb_planter: "plant",
  decor_oak_barrel: "decor-oak-barrel",
  decor_crystal_chandelier: "decor-crystal-chandelier",
  decor_ancient_globe: "decor-ancient-globe",
  decor_tavern_lantern: "lantern",
  decor_curators_shelf: "decor-curators-shelf",
  decor_snowglobe: "decor-snowglobe",
  decor_sleeping_cat: "decor-sleeping-cat",
  decor_autumn_wreath: "decor-autumn-wreath",
  decor_compass_rose: "decor-compass-rose",
  decor_enchanted_tapestry: "decor-enchanted-tapestry",
  decor_golden_griffin: "decor-golden-griffin",
  decor_relic_plinth: "decor-relic-plinth",
};

const CHEST_ASSETS: Record<string, GuildAssetName> = {
  chest_bronze: "chest-bronze",
  chest_silver: "chest-silver",
  chest_gold: "chest-gold",
  chest_relic: "chest-relic",
  // The legacy weekly chest is a silver chest with the old key.
  weekly_chest: "chest-silver",
};

const CONSUMABLE_ASSETS: Record<string, GuildAssetName> = {
  hourglass: "hourglass",
  reroll_charter: "reroll-charter",
  extra_slot_permit: "extra-slot-permit",
};

/** Tavern decor asset; unknown or missing keys show the generic crate. */
export function getDecorAsset(key: string | null | undefined): GuildAssetName {
  if (!key) return "decor-generic";
  return pick(DECOR_ASSETS, key) ?? "decor-generic";
}

/** Chest tier artwork; `weekly_chest` reuses the silver chest. */
export function getChestAsset(kind: string | null | undefined): GuildAssetName {
  if (!kind) return "chest";
  return pick(CHEST_ASSETS, kind) ?? "chest";
}

/** Consumable artwork; unknown keys show the generic scroll item. */
export function getConsumableAsset(
  key: string | null | undefined,
): GuildAssetName {
  if (!key) return "scroll";
  return pick(CONSUMABLE_ASSETS, key) ?? "scroll";
}

const LICENSE_THEME_CLASSES: Record<string, string> = {
  license_travelers_ledger: styles["licenseTheme-license_travelers_ledger"],
  license_mapmakers_ledger: styles["licenseTheme-license_mapmakers_ledger"],
  license_royal_archive: styles["licenseTheme-license_royal_archive"],
  license_tavern_ledger: styles["licenseTheme-license_tavern_ledger"],
  license_autumn_ledger: styles["licenseTheme-license_autumn_ledger"],
  license_obsidian_ledger: styles["licenseTheme-license_obsidian_ledger"],
  license_winter_ledger: styles["licenseTheme-license_winter_ledger"],
  license_gilded_ledger: styles["licenseTheme-license_gilded_ledger"],
};

const STAMP_STYLE_CLASSES: Record<string, string> = {
  stamp_inkwell: styles["stampStyle-stamp_inkwell"],
  stamp_silver_quill: styles["stampStyle-stamp_silver_quill"],
  stamp_pumpkin_wax: styles["stampStyle-stamp_pumpkin_wax"],
  stamp_ember_wax: styles["stampStyle-stamp_ember_wax"],
  stamp_royal_wax: styles["stampStyle-stamp_royal_wax"],
  stamp_frost_seal: styles["stampStyle-stamp_frost_seal"],
  stamp_gold_seal: styles["stampStyle-stamp_gold_seal"],
  stamp_obsidian_seal: styles["stampStyle-stamp_obsidian_seal"],
};

const FRAME_CLASSES: Record<string, string> = {
  frame_parchment_seal: styles["frame-frame_parchment_seal"],
  frame_lantern_glow: styles["frame-frame_lantern_glow"],
  frame_ember_rune: styles["frame-frame_ember_rune"],
  frame_moonlit_ivy: styles["frame-frame_moonlit_ivy"],
  frame_gilded_compass: styles["frame-frame_gilded_compass"],
  frame_wooden_badge: styles["frame-frame_wooden_badge"],
  frame_candle_glow: styles["frame-frame_candle_glow"],
  frame_copper_compass: styles["frame-frame_copper_compass"],
  frame_silver_laurel: styles["frame-frame_silver_laurel"],
  frame_owl_wing: styles["frame-frame_owl_wing"],
  frame_ruby_sigil: styles["frame-frame_ruby_sigil"],
  frame_forged_steel: styles["frame-frame_forged_steel"],
  frame_dragonbone: styles["frame-frame_dragonbone"],
  frame_harvest_crown: styles["frame-frame_harvest_crown"],
  frame_astral_crown: styles["frame-frame_astral_crown"],
  frame_celestial_compass: styles["frame-frame_celestial_compass"],
};

const RARITY_CLASSES: Record<string, string> = {
  common: styles["rarity-common"],
  uncommon: styles["rarity-uncommon"],
  rare: styles["rarity-rare"],
  epic: styles["rarity-epic"],
  legendary: styles["rarity-legendary"],
};

/** Card accent class for an equipped License theme; `undefined` when unknown. */
export function getLicenseThemeClass(
  key: string | null | undefined,
): string | undefined {
  if (!key) return undefined;
  return pick(LICENSE_THEME_CLASSES, key);
}

/** RankStamp border/ink class for an equipped stamp style. */
export function getStampStyleClass(
  key: string | null | undefined,
): string | undefined {
  if (!key) return undefined;
  return pick(STAMP_STYLE_CLASSES, key);
}

/** Avatar frame class for an equipped frame; `undefined` when unknown. */
export function getFrameClass(
  key: string | null | undefined,
): string | undefined {
  if (!key) return undefined;
  return pick(FRAME_CLASSES, key);
}

/**
 * Border/tag class for a reward rarity; also sets `--guild-rarity` and
 * `--guild-rarity-tint` so consumers can paint a tag without new colours.
 */
export function getRarityClass(
  rarity: string | null | undefined,
): string | undefined {
  if (!rarity) return undefined;
  return pick(RARITY_CLASSES, rarity);
}
