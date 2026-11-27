// @vitest-environment jsdom
import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import { GuildRewardDescriptorDto } from "@repo/wrapper/server";

import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import ptBRTranslations from "../../../../../packages/locales/src/translations/json/pt-BR.json";
import guildClasses from "../../../../../packages/ui/src/components/guild/guild.module.css";
import { GUILD_ASSETS } from "../../../../../packages/ui/src/components/guild/scene/assets";
import {
  getChestAsset,
  getConsumableAsset,
  getDecorAsset,
  getFrameClass,
  getLicenseThemeClass,
  getRarityClass,
  getStampStyleClass,
} from "../../../../../packages/ui/src/components/guild/scene/cosmeticAssets";
import {
  getLinaLine,
  getQuestCopy,
  getQuestMetaCaptions,
  getRewardLabel,
} from "../../../../../packages/ui/src/components/guild/util";

/** Every tavern decor key of hand-off 8.7 and the artwork it resolves to. */
const DECOR_ASSETS: Record<string, string> = {
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

const CHEST_ASSETS: Record<string, string> = {
  chest_bronze: "chest-bronze",
  chest_silver: "chest-silver",
  chest_gold: "chest-gold",
  chest_relic: "chest-relic",
  weekly_chest: "chest-silver",
};

const CONSUMABLE_ASSETS: Record<string, string> = {
  hourglass: "hourglass",
  reroll_charter: "reroll-charter",
  extra_slot_permit: "extra-slot-permit",
};

const LICENSE_THEME_KEYS = [
  "license_travelers_ledger",
  "license_mapmakers_ledger",
  "license_royal_archive",
  "license_tavern_ledger",
  "license_autumn_ledger",
  "license_obsidian_ledger",
  "license_winter_ledger",
  "license_gilded_ledger",
];

const STAMP_STYLE_KEYS = [
  "stamp_inkwell",
  "stamp_silver_quill",
  "stamp_pumpkin_wax",
  "stamp_ember_wax",
  "stamp_royal_wax",
  "stamp_frost_seal",
  "stamp_gold_seal",
  "stamp_obsidian_seal",
];

const FRAME_KEYS = [
  "frame_parchment_seal",
  "frame_lantern_glow",
  "frame_ember_rune",
  "frame_moonlit_ivy",
  "frame_gilded_compass",
  "frame_wooden_badge",
  "frame_candle_glow",
  "frame_copper_compass",
  "frame_silver_laurel",
  "frame_owl_wing",
  "frame_ruby_sigil",
  "frame_forged_steel",
  "frame_dragonbone",
  "frame_harvest_crown",
  "frame_astral_crown",
  "frame_celestial_compass",
];

const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"];

describe("cosmeticAssets", () => {
  it("maps every seeded tavern decor key to existing artwork", () => {
    for (const [key, asset] of Object.entries(DECOR_ASSETS)) {
      expect(getDecorAsset(key), key).toBe(asset);
      expect(GUILD_ASSETS[asset as keyof typeof GUILD_ASSETS]).toBeDefined();
    }
  });

  it("maps every chest tier and the legacy weekly chest", () => {
    for (const [kind, asset] of Object.entries(CHEST_ASSETS)) {
      expect(getChestAsset(kind), kind).toBe(asset);
      expect(GUILD_ASSETS[asset as keyof typeof GUILD_ASSETS]).toBeDefined();
    }
    // The legacy weekly chest is a silver chest with the old key.
    expect(getChestAsset("weekly_chest")).toBe("chest-silver");
  });

  it("maps every consumable key", () => {
    for (const [key, asset] of Object.entries(CONSUMABLE_ASSETS)) {
      expect(getConsumableAsset(key), key).toBe(asset);
      expect(GUILD_ASSETS[asset as keyof typeof GUILD_ASSETS]).toBeDefined();
    }
  });

  it("returns the generic artwork for unknown and missing keys", () => {
    expect(getDecorAsset("decor_new_relic")).toBe("decor-generic");
    expect(getDecorAsset(null)).toBe("decor-generic");
    expect(getDecorAsset(undefined)).toBe("decor-generic");
    expect(getDecorAsset("toString")).toBe("decor-generic");
    expect(getChestAsset("chest_mythic")).toBe("chest");
    expect(getChestAsset(null)).toBe("chest");
    expect(getChestAsset("constructor")).toBe("chest");
    expect(getConsumableAsset("mystery_tonic")).toBe("scroll");
    expect(getConsumableAsset(null)).toBe("scroll");
  });

  it("returns the license theme class for every license key", () => {
    for (const key of LICENSE_THEME_KEYS) {
      expect(getLicenseThemeClass(key), key).toBe(
        guildClasses[`licenseTheme-${key}`],
      );
    }
    expect(getLicenseThemeClass("license_unknown")).toBeUndefined();
    expect(getLicenseThemeClass(null)).toBeUndefined();
  });

  it("returns the stamp style class for every stamp key", () => {
    for (const key of STAMP_STYLE_KEYS) {
      expect(getStampStyleClass(key), key).toBe(
        guildClasses[`stampStyle-${key}`],
      );
    }
    expect(getStampStyleClass("stamp_unknown")).toBeUndefined();
    expect(getStampStyleClass(undefined)).toBeUndefined();
  });

  it("returns the frame class for every frame key", () => {
    for (const key of FRAME_KEYS) {
      expect(getFrameClass(key), key).toBe(guildClasses[`frame-${key}`]);
    }
    expect(getFrameClass("frame_unknown")).toBeUndefined();
    expect(getFrameClass(null)).toBeUndefined();
  });

  it("returns the rarity class for every rarity", () => {
    for (const rarity of RARITIES) {
      expect(getRarityClass(rarity), rarity).toBe(
        guildClasses[`rarity-${rarity}`],
      );
    }
    expect(getRarityClass("mythic")).toBeUndefined();
    expect(getRarityClass(null)).toBeUndefined();
  });
});

/** Translator backed by a real locale JSON, like `guild-utils.test.ts`. */
function createJsonTranslator(dictionary: unknown): TFunction {
  const translate = (key: string, options: Record<string, unknown> = {}) => {
    let value: unknown = dictionary;

    for (const part of key.split(".")) {
      value =
        typeof value === "object" && value !== null
          ? (value as Record<string, unknown>)[part]
          : undefined;
    }

    if (typeof value !== "string") return key;

    return value.replace(
      /\{\{\s*(\w+)\s*\}\}/g,
      (match: string, name: string) =>
        options[name] !== undefined ? String(options[name]) : match,
    );
  };

  return translate as unknown as TFunction;
}

const EN = createJsonTranslator(enTranslations);
const PT_BR = createJsonTranslator(ptBRTranslations);

/** The 31 `templateKey`s of hand-off 8.1, 24 weekly-pool + 7 monthly. */
const TEMPLATE_KEYS = [
  "recent_dust",
  "forgotten_relic",
  "deep_dive",
  "off_the_map",
  "continue_the_saga",
  "time_machine",
  "return_to_the_world",
  "hidden_gem",
  "short_caravan",
  "weekend_sprint",
  "double_feature",
  "field_vigil",
  "backlog_taste_test",
  "campaign_rhythm",
  "trophy_hunter",
  "captains_log",
  "quick_take",
  "on_duty_critic",
  "deep_critic",
  "guild_oracle",
  "eagle_eye",
  "cartographer",
  "expedition_log",
  "pack_cleanup",
  "the_colossus",
  "ancient_fossil",
  "genre_marathon",
  "deep_critic_anthology",
  "platinum_crown",
  "colossus_legend",
  "saga_trilogy",
];

/** The 78 seeded reward keys of hand-off 8.7, grouped by kind. */
const REWARD_KEYS_BY_KIND: Record<string, string[]> = {
  badge: ["badge_archaeologist"],
  title: [
    "title_chronist",
    "title_backlog_slayer",
    "title_guild_veteran",
    "title_relic_hunter",
    "title_night_owl",
    "title_completionist",
    "title_tavern_regular",
    "title_weekend_warrior",
    "title_pixel_pilgrim",
    "title_guild_initiate",
    "title_field_scout",
    "title_swift_scholar",
    "title_dungeon_cartographer",
    "title_seasonal_explorer",
    "title_arcane_archivist",
    "title_pathfinder",
    "title_master_adventurer",
    "title_curator_prime",
    "title_realm_warden",
    "title_guild_legend",
    "title_relic_warden",
    "title_lina_chosen",
  ],
  avatar_frame: [
    "frame_parchment_seal",
    "frame_lantern_glow",
    "frame_ember_rune",
    "frame_moonlit_ivy",
    "frame_gilded_compass",
    "frame_wooden_badge",
    "frame_candle_glow",
    "frame_copper_compass",
    "frame_silver_laurel",
    "frame_owl_wing",
    "frame_ruby_sigil",
    "frame_forged_steel",
    "frame_dragonbone",
    "frame_harvest_crown",
    "frame_astral_crown",
    "frame_celestial_compass",
  ],
  license_theme: [
    "license_travelers_ledger",
    "license_mapmakers_ledger",
    "license_royal_archive",
    "license_tavern_ledger",
    "license_autumn_ledger",
    "license_obsidian_ledger",
    "license_winter_ledger",
    "license_gilded_ledger",
  ],
  stamp_style: [
    "stamp_inkwell",
    "stamp_silver_quill",
    "stamp_pumpkin_wax",
    "stamp_ember_wax",
    "stamp_royal_wax",
    "stamp_frost_seal",
    "stamp_gold_seal",
    "stamp_obsidian_seal",
  ],
  tavern_decor: [
    "decor_mug_of_ale",
    "decor_brass_astrolabe",
    "decor_herb_planter",
    "decor_oak_barrel",
    "decor_crystal_chandelier",
    "decor_ancient_globe",
    "decor_tavern_lantern",
    "decor_curators_shelf",
    "decor_snowglobe",
    "decor_sleeping_cat",
    "decor_autumn_wreath",
    "decor_compass_rose",
    "decor_enchanted_tapestry",
    "decor_golden_griffin",
    "decor_relic_plinth",
  ],
  consumable: ["hourglass", "reroll_charter", "extra_slot_permit"],
  weekly_chest: ["weekly_chest"],
  chest_bronze: ["chest_bronze"],
  chest_silver: ["chest_silver"],
  chest_gold: ["chest_gold"],
  chest_relic: ["chest_relic"],
};

/** Generic fallback of every reward kind (design D3). */
const GENERIC_REWARD_LABELS: Record<string, string> = {
  badge: "Badge",
  title: "Guild title",
  avatar_frame: "Avatar frame",
  license_theme: "License theme",
  stamp_style: "Stamp style",
  tavern_decor: "Tavern decor",
  consumable: "Consumable",
  weekly_chest: "Weekly chest",
  chest_bronze: "Weekly chest",
  chest_silver: "Weekly chest",
  chest_gold: "Weekly chest",
  chest_relic: "Weekly chest",
};

function reward(
  key: string,
  kind: string,
  rarity: GuildRewardDescriptorDto.rarity = GuildRewardDescriptorDto.rarity
    .COMMON,
): GuildRewardDescriptorDto {
  return {
    id: `reward-${key}`,
    key,
    kind: kind as GuildRewardDescriptorDto.kind,
    achievementId: null,
    inChestPool: true,
    chestBonusXp: 0,
    chestBonusSeals: 0,
    rarity,
    consumableKey: null,
  };
}

function localizedRewardName(dictionary: unknown, key: string): string {
  const rewards = (dictionary as { guild: { rewards: Record<string, string> } })
    .guild.rewards;

  return rewards[key];
}

describe("board expansion copy", () => {
  it("localizes every one of the 31 system quest templates", () => {
    expect(TEMPLATE_KEYS).toHaveLength(31);

    for (const templateKey of TEMPLATE_KEYS) {
      for (const [locale, translator] of [
        ["en", EN],
        ["pt-BR", PT_BR],
      ] as const) {
        const copy = getQuestCopy({ templateKey }, translator, locale);

        expect(copy.title, `${locale} ${templateKey} title`).not.toBe("");
        expect(
          copy.description,
          `${locale} ${templateKey} description`,
        ).not.toBe("");
        expect(copy.title, `${locale} ${templateKey}`).not.toBe(templateKey);
        expect(
          copy.description,
          `${locale} ${templateKey} description`,
        ).not.toContain("guild.templates");
      }
    }
  });

  it("renders the procedural meta captions of design D6", () => {
    const meta = {
      genreName: "Metroidvania",
      franchiseName: "Hollow Knight",
      themeName: "Ruined Kingdom",
      decade: "2010s",
      staleDays: 412,
    };

    expect(getQuestMetaCaptions(meta, EN)).toEqual([
      "Genre: Metroidvania",
      "Franchise: Hollow Knight",
      "Theme: Ruined Kingdom",
      "Decade: 2010s",
      "Untouched for 412 days",
    ]);
    expect(getQuestMetaCaptions(meta, PT_BR)).toEqual([
      "Gênero: Metroidvania",
      "Franquia: Hollow Knight",
      "Tema: Ruined Kingdom",
      "Década: 2010s",
      "Parado há 412 dias",
    ]);
  });

  it("skips missing meta values", () => {
    expect(getQuestMetaCaptions(null, EN)).toEqual([]);
    expect(getQuestMetaCaptions(undefined, EN)).toEqual([]);
    expect(getQuestMetaCaptions({}, EN)).toEqual([]);
    expect(getQuestMetaCaptions({ genreName: "RPG" }, EN)).toEqual([
      "Genre: RPG",
    ]);
  });

  it("resolves all 78 seeded reward keys to their own label", () => {
    let count = 0;

    for (const [kind, keys] of Object.entries(REWARD_KEYS_BY_KIND)) {
      for (const key of keys) {
        count += 1;

        const enLabel = getRewardLabel(reward(key, kind), EN);
        const ptLabel = getRewardLabel(reward(key, kind), PT_BR);

        expect(enLabel, key).toBe(localizedRewardName(enTranslations, key));
        expect(ptLabel, key).toBe(localizedRewardName(ptBRTranslations, key));
        expect(enLabel, key).not.toBe(GENERIC_REWARD_LABELS[kind]);
        expect(enLabel, key).not.toBe(key);
      }
    }

    expect(count).toBe(78);
  });

  it("falls back to the generic label of all 12 reward kinds", () => {
    for (const [kind, genericLabel] of Object.entries(GENERIC_REWARD_LABELS)) {
      expect(getRewardLabel(reward("future_reward_key", kind), EN), kind).toBe(
        genericLabel,
      );
    }

    // A kind the client does not know yet keeps the oldest generic label.
    expect(getRewardLabel(reward("future_reward_key", "future_kind"), EN)).toBe(
      "Badge",
    );
  });

  it("localizes the four new Lina triggers", () => {
    const triggers = [
      "rank_promoted",
      "chain_completed",
      "community_bounty_ready",
      "monthly_expedition_refreshed",
    ];

    for (const trigger of triggers) {
      expect(
        getLinaLine({ trigger, pose: "happy", context: {} }, EN),
        trigger,
      ).toEqual([
        {
          text: (
            enTranslations.guild.lina as unknown as Record<string, string>
          )[trigger],
        },
      ]);
      expect(
        getLinaLine({ trigger, pose: "neutral", context: {} }, PT_BR),
        trigger,
      ).toEqual([
        {
          text: (
            ptBRTranslations.guild.lina as unknown as Record<string, string>
          )[trigger],
        },
      ]);
    }
  });

  it("keeps the default line for unknown Lina triggers", () => {
    expect(
      getLinaLine({ trigger: "future_lina_trigger", context: {} }, EN),
    ).toEqual([{ text: enTranslations.guild.lina.default }]);
  });
});

describe("chain stage contract copy", () => {
  it("resolves a chain stage template key to the stage copy", () => {
    expect(
      getQuestCopy({ templateKey: "pathfinders_arc:trail_head" }, EN, "en"),
    ).toEqual({
      title: "Trail Head",
      description: "Play 2 hours of the chosen game.",
    });

    expect(
      getQuestCopy(
        { templateKey: "pathfinders_arc:trail_head" },
        PT_BR,
        "pt-BR",
      ),
    ).toEqual({
      title: "Início da Trilha",
      description: "Jogue 2 horas do jogo escolhido.",
    });
  });

  it("uses only the stage part, whatever the chain prefix is", () => {
    expect(
      getQuestCopy({ templateKey: "future_arc:trail_head" }, EN, "en").title,
    ).toBe("Trail Head");
  });

  it("humanizes an unknown chain stage key", () => {
    expect(
      getQuestCopy({ templateKey: "foo_arc:bar_stage" }, EN, "en"),
    ).toEqual({
      title: "bar stage",
      description: "",
    });
  });

  it("keeps the regular template keys untouched", () => {
    const copy = getQuestCopy({ templateKey: "deep_dive" }, EN, "en");

    expect(copy.title).toBe(enTranslations.guild.templates.deep_dive.title);
    expect(copy.description).toBe(
      enTranslations.guild.templates.deep_dive.description,
    );
  });
});
