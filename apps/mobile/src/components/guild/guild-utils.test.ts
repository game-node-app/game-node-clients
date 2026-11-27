import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import { ApiError } from "@repo/wrapper/server";
import type {
  GuildLicenseDto,
  GuildRewardDescriptorDto,
} from "@repo/wrapper/server";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import ptBRTranslations from "../../../../../packages/locales/src/translations/json/pt-BR.json";
import {
  formatLicenseNumber,
  formatTimeLeft,
  getGuildErrorCode,
  getLinaLine,
  getQuestCopy,
  getRankProgress,
  getRewardLabel,
  isGuildEarlyAccessError,
} from "../../../../../packages/ui/src/components/guild/util";
import type { GuildRankProgressLicense } from "../../../../../packages/ui/src/components/guild/util/getRankProgress";

function createTranslator(messages: Record<string, string>): TFunction {
  const translate = (key: string, options?: Record<string, unknown>) => {
    const template = messages[key];
    if (template === undefined) return key;

    return template.replace(
      /\{\{\s*(\w+)\s*\}\}/g,
      (match: string, name: string) => {
        if (!options || !(name in options)) return match;
        return String(options[name]);
      },
    );
  };

  return translate as unknown as TFunction;
}

/** Translator backed by a real locale JSON, so the label tests read the shipped copy. */
function createJsonTranslator(dictionary: unknown): TFunction {
  const translate = (key: string, options?: Record<string, unknown>) => {
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
        options && name in options ? String(options[name]) : match,
    );
  };

  return translate as unknown as TFunction;
}

function apiError(status: number, body: unknown): ApiError {
  return new ApiError(
    {} as unknown as ConstructorParameters<typeof ApiError>[0],
    {
      status,
      statusText: "",
      url: "/v1/guild",
      body,
      ok: false,
    },
    "guild error",
  );
}

const RANK_C_LICENSE: GuildRankProgressLicense = {
  rank: "C" as GuildLicenseDto["rank"],
  xp: 1240,
  currentRankMinXp: 800,
  nextRank: "B" as GuildLicenseDto["nextRank"],
  nextRankXp: 2000,
  xpToNextRank: 760,
};

const RANK_S_LICENSE: GuildRankProgressLicense = {
  rank: "S" as GuildLicenseDto["rank"],
  xp: 7500,
  currentRankMinXp: 7500,
  nextRank: null,
  nextRankXp: null,
  xpToNextRank: 0,
};

describe("formatLicenseNumber", () => {
  it("renders the Guild License as Nº plus four zero-padded digits", () => {
    expect(formatLicenseNumber(47)).toBe("Nº 0047");
    expect(formatLicenseNumber(7)).toBe("Nº 0007");
    expect(formatLicenseNumber(12345)).toBe("Nº 12345");
  });
});

describe("getRankProgress", () => {
  it("formats the XP label with the pt-BR number format", () => {
    const progress = getRankProgress(RANK_C_LICENSE, "pt-BR");

    expect(progress.xpLabel).toBe("1.240 / 2.000 XP");
    expect(progress.xpToNextRankLabel).toBe("760 XP");
    expect(progress.nextRank).toBe("B");
    expect(progress.percent).toBeCloseTo((440 / 1200) * 100, 5);
    expect(progress.isMaxRank).toBe(false);
  });

  it("keeps rank S full with no next rank", () => {
    const progress = getRankProgress(RANK_S_LICENSE, "pt-BR");

    expect(progress.isMaxRank).toBe(true);
    expect(progress.nextRank).toBeNull();
    expect(progress.percent).toBe(100);
    expect(progress.xpToNextRank).toBe(0);
    expect(progress.xpLabel).toBe("7.500 XP");
  });
});

describe("formatTimeLeft", () => {
  it("renders days and hours until the next refresh", () => {
    expect(
      formatTimeLeft(
        "2026-11-23T03:00:00.000Z",
        new Date("2026-11-19T13:00:00.000Z"),
      ),
    ).toBe("3d 14h");
  });

  it("falls back to hours/minutes and clamps past dates", () => {
    expect(
      formatTimeLeft(
        "2026-11-19T18:20:00.000Z",
        new Date("2026-11-19T13:00:00.000Z"),
      ),
    ).toBe("5h 20m");
    expect(
      formatTimeLeft(
        "2026-11-19T13:00:00.000Z",
        new Date("2026-11-19T13:30:00.000Z"),
      ),
    ).toBe("0m");
  });
});

describe("getQuestCopy", () => {
  const templates = createTranslator({
    "guild.templates.forgotten_relic.title": "Relíquia Esquecida",
    "guild.templates.forgotten_relic.description":
      "Zere um jogo que está no seu backlog há mais de um ano sem ser tocado.",
  });

  it("localizes system templates from guild.templates.<key>", () => {
    const copy = getQuestCopy(
      { templateKey: "forgotten_relic" },
      templates,
      "pt-BR",
    );

    expect(copy).toEqual({
      title: "Relíquia Esquecida",
      description:
        "Zere um jogo que está no seu backlog há mais de um ano sem ser tocado.",
    });
  });

  it("uses the event translation for the current locale", () => {
    const event = {
      templateKey: null,
      title: "Metroidvania Month",
      description: "Finish a Metroidvania this month.",
      translations: [
        {
          locale: "pt-BR",
          title: "Mês do Metroidvania",
          description: "Finalize um Metroidvania neste mês.",
        },
      ],
    };

    expect(getQuestCopy(event, templates, "pt-BR")).toEqual({
      title: "Mês do Metroidvania",
      description: "Finalize um Metroidvania neste mês.",
    });
  });

  it("falls back to the event base copy when the locale has no translation", () => {
    const event = {
      templateKey: null,
      title: "Metroidvania Month",
      description: "Finish a Metroidvania this month.",
      translations: [
        {
          locale: "pt-BR",
          title: "Mês do Metroidvania",
          description: "Finalize um Metroidvania neste mês.",
        },
      ],
    };

    expect(getQuestCopy(event, templates, "en")).toEqual({
      title: "Metroidvania Month",
      description: "Finish a Metroidvania this month.",
    });
  });

  it("humanizes unknown template keys instead of hiding the quest", () => {
    expect(
      getQuestCopy({ templateKey: "mystery_quest" }, templates, "en"),
    ).toEqual({ title: "mystery quest", description: "" });
  });

  it("reads the event summary of a contract when present", () => {
    const contract = {
      templateKey: null,
      event: {
        title: "Metroidvania Month",
        description: "Finish a Metroidvania this month.",
        translations: [
          {
            locale: "pt-BR",
            title: "Mês do Metroidvania",
            description: "Finalize um Metroidvania neste mês.",
          },
        ],
      },
    };

    expect(getQuestCopy(contract, templates, "pt-BR")).toEqual({
      title: "Mês do Metroidvania",
      description: "Finalize um Metroidvania neste mês.",
    });
  });
});

describe("getRewardLabel", () => {
  const templates = createTranslator({
    "guild.rewards.badge_archaeologist": "Arqueólogo",
    "guild.rewards.generic.badge": "Insígnia",
    "guild.rewards.generic.title": "Título",
    "guild.rewards.generic.frame": "Moldura",
    "guild.rewards.generic.chest": "Baú",
  });

  it("localizes known reward keys", () => {
    expect(
      getRewardLabel(
        {
          id: "reward-1",
          key: "badge_archaeologist",
          kind: "badge" as never,
          achievementId: "guild-archaeologist",
          inChestPool: false,
          chestBonusXp: 0,
          chestBonusSeals: 0,
          rarity: "rare" as never,
          consumableKey: null,
        },
        templates,
      ),
    ).toBe("Arqueólogo");
  });

  it("falls back to the generic label of the reward kind", () => {
    expect(
      getRewardLabel(
        {
          id: "reward-2",
          key: "frame_new_key",
          kind: "avatar_frame" as never,
          achievementId: null,
          inChestPool: true,
          chestBonusXp: 0,
          chestBonusSeals: 0,
          rarity: "common" as never,
          consumableKey: null,
        },
        templates,
      ),
    ).toBe("Moldura");
  });

  it("returns an empty label without a reward", () => {
    expect(getRewardLabel(null, templates)).toBe("");
  });
});

describe("getRewardLabel for the hand-off table 11.4", () => {
  const en = createJsonTranslator(enTranslations);
  const ptBR = createJsonTranslator(ptBRTranslations);

  type RewardKind = `${GuildRewardDescriptorDto.kind}`;

  const starterRewards: Array<{
    key: string;
    kind: RewardKind;
    en: string;
    ptBR: string;
  }> = [
    {
      key: "badge_archaeologist",
      kind: "badge",
      en: "Archaeologist",
      ptBR: "Arqueólogo",
    },
    {
      key: "title_chronist",
      kind: "title",
      en: "Chronicler",
      ptBR: "Cronista",
    },
    {
      key: "weekly_chest",
      kind: "weekly_chest",
      en: "Weekly Chest",
      ptBR: "Baú Semanal",
    },
    {
      key: "title_backlog_slayer",
      kind: "title",
      en: "Backlog Slayer",
      ptBR: "Caçador de Backlog",
    },
    {
      key: "title_guild_veteran",
      kind: "title",
      en: "Guild Veteran",
      ptBR: "Veterano da Guilda",
    },
    {
      key: "frame_parchment_seal",
      kind: "avatar_frame",
      en: "Parchment Seal",
      ptBR: "Selo de Pergaminho",
    },
    {
      key: "frame_lantern_glow",
      kind: "avatar_frame",
      en: "Lantern Glow",
      ptBR: "Brilho de Lanterna",
    },
    {
      key: "title_relic_hunter",
      kind: "title",
      en: "Relic Hunter",
      ptBR: "Caçador de Relíquias",
    },
    {
      key: "title_night_owl",
      kind: "title",
      en: "Night Owl",
      ptBR: "Coruja Noturna",
    },
    {
      key: "title_completionist",
      kind: "title",
      en: "Completionist",
      ptBR: "Completista",
    },
    {
      key: "frame_ember_rune",
      kind: "avatar_frame",
      en: "Ember Rune",
      ptBR: "Runa de Brasa",
    },
    {
      key: "frame_moonlit_ivy",
      kind: "avatar_frame",
      en: "Moonlit Ivy",
      ptBR: "Hera Enluarada",
    },
    {
      key: "frame_gilded_compass",
      kind: "avatar_frame",
      en: "Gilded Compass",
      ptBR: "Bússola Dourada",
    },
  ];

  const genericLabels: Record<string, string> = {
    badge: "Badge",
    title: "Guild title",
    avatar_frame: "Avatar frame",
    weekly_chest: "Weekly chest",
  };

  function reward(key: string, kind: RewardKind): GuildRewardDescriptorDto {
    return {
      id: `reward-${key}`,
      key,
      kind: kind as GuildRewardDescriptorDto.kind,
      achievementId: null,
      inChestPool: true,
      chestBonusXp: 0,
      chestBonusSeals: 0,
      rarity: "common" as GuildRewardDescriptorDto.rarity,
      consumableKey: null,
    };
  }

  it("covers every starter key of table 11.4", () => {
    expect(starterRewards).toHaveLength(13);
  });

  it("resolves every starter key to its own en label", () => {
    for (const entry of starterRewards) {
      const label = getRewardLabel(reward(entry.key, entry.kind), en);

      expect(label, entry.key).toBe(entry.en);
      expect(label, entry.key).not.toBe(entry.key);
      expect(label, entry.key).not.toBe(genericLabels[entry.kind]);
    }
  });

  it("spot-checks the chest-pool cosmetics in pt-BR", () => {
    for (const key of [
      "title_relic_hunter",
      "title_night_owl",
      "title_completionist",
      "frame_ember_rune",
      "frame_moonlit_ivy",
      "frame_gilded_compass",
    ]) {
      const entry = starterRewards.find((reward) => reward.key === key);
      if (!entry) throw new Error(`missing starter reward ${key}`);

      expect(getRewardLabel(reward(entry.key, entry.kind), ptBR), key).toBe(
        entry.ptBR,
      );
    }
  });
});

describe("getLinaLine", () => {
  const templates = createTranslator({
    "guild.lina.stale_backlog_game":
      "Oi! Vi aqui que {{gameName}} tá no seu backlog desde {{sinceYear}}. Que tal tirar a poeira dele?",
    "guild.lina.contract_accepted":
      "Tudo certo! Quando terminar {{gameName}}, passa aqui no balcão pra pegar sua recompensa.",
    "guild.lina.contract_accepted_no_game":
      "Tudo certo! Assim que concluir esse pedido, passa aqui no balcão pra pegar sua recompensa.",
    "guild.lina.contract_ready_to_claim":
      "Ei, você concluiu o pedido de {{gameName}}! Pode entregar aqui no balcão.",
    "guild.lina.contract_ready_to_claim_no_game":
      "Ei, você tem um contrato pronto pra entregar! Passa aqui no balcão pra pegar sua recompensa.",
    "guild.lina.default":
      "Oi! Pode ficar à vontade, o quadro de pedidos tá logo ali.",
  });

  it("splits a stale backlog game name into a gold highlight segment", () => {
    const segments = getLinaLine(
      {
        trigger: "stale_backlog_game",
        context: { gameId: 1029, gameName: "Hollow Knight", sinceYear: 2023 },
      },
      templates,
    );

    expect(segments).toEqual([
      { text: "Oi! Vi aqui que " },
      { text: "Hollow Knight", highlight: true },
      { text: " tá no seu backlog desde 2023. Que tal tirar a poeira dele?" },
    ]);
  });

  it("uses the no-game variant of contract_accepted without a target", () => {
    const segments = getLinaLine(
      { trigger: "contract_accepted", context: { contractId: "c1" } },
      templates,
    );

    expect(segments).toEqual([
      {
        text: "Tudo certo! Assim que concluir esse pedido, passa aqui no balcão pra pegar sua recompensa.",
      },
    ]);
  });

  it("highlights the game name or uses the no-game variant for contract_ready_to_claim", () => {
    expect(
      getLinaLine(
        {
          trigger: "contract_ready_to_claim",
          context: { contractId: "c1", targetGameName: "Hollow Knight" },
        },
        templates,
      ),
    ).toEqual([
      { text: "Ei, você concluiu o pedido de " },
      { text: "Hollow Knight", highlight: true },
      { text: "! Pode entregar aqui no balcão." },
    ]);

    expect(
      getLinaLine(
        { trigger: "contract_ready_to_claim", context: { contractId: "c1" } },
        templates,
      ),
    ).toEqual([
      {
        text: "Ei, você tem um contrato pronto pra entregar! Passa aqui no balcão pra pegar sua recompensa.",
      },
    ]);
  });

  it("falls back to the default line for unknown triggers", () => {
    expect(
      getLinaLine({ trigger: "brand_new_trigger", context: {} }, templates),
    ).toEqual([
      { text: "Oi! Pode ficar à vontade, o quadro de pedidos tá logo ali." },
    ]);
  });

  it("uses the default line for a missing lina payload", () => {
    expect(getLinaLine(null, templates)).toEqual([
      { text: "Oi! Pode ficar à vontade, o quadro de pedidos tá logo ali." },
    ]);
  });
});

describe("Guild early-access errors", () => {
  it("recognizes the 403 guild_early_access_required gate", () => {
    const earlyAccess = apiError(403, {
      message: "Adventurers Guild is currently in early access for supporters.",
      code: "guild_early_access_required",
    });

    expect(getGuildErrorCode(earlyAccess)).toBe("guild_early_access_required");
    expect(isGuildEarlyAccessError(earlyAccess)).toBe(true);
  });

  it("does not treat other codes or other statuses as the gate", () => {
    const otherCode = apiError(403, { code: "guild_cosmetic_not_owned" });
    const otherStatus = apiError(409, {
      code: "guild_active_contract_limit_reached",
    });
    const noCode = apiError(403, { message: "Forbidden" });

    expect(isGuildEarlyAccessError(otherCode)).toBe(false);
    expect(isGuildEarlyAccessError(otherStatus)).toBe(false);
    expect(isGuildEarlyAccessError(noCode)).toBe(false);
    expect(getGuildErrorCode(noCode)).toBeUndefined();
    expect(isGuildEarlyAccessError(new Error("network"))).toBe(false);
  });
});
