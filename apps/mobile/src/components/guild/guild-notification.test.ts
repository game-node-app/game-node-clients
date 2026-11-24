import { describe, expect, it, vi } from "vitest";
import {
  NotificationGuildTargetDto,
  NotificationInboxItemDto,
} from "@repo/wrapper/server";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import ptTranslations from "../../../../../packages/locales/src/translations/json/pt-BR.json";
import { getNotificationContent } from "../../../../../packages/ui/src/components/notifications/util/getNotificationContent";
import { navigateToNotificationTarget } from "../../../../../packages/ui/src/components/notifications/util/navigateToNotificationTarget";

type Translate = Parameters<typeof getNotificationContent>[1];

function lookup(dictionary: unknown, key: string): unknown {
  let value: unknown = dictionary;
  for (const part of key.split(".")) {
    value =
      typeof value === "object" && value !== null
        ? (value as Record<string, unknown>)[part]
        : undefined;
  }
  return value;
}

function createTranslator(language: "en" | "pt-BR"): Translate {
  const dictionary = language === "pt-BR" ? ptTranslations : enTranslations;

  const translate = (key: string, options?: Record<string, unknown>) => {
    const value = lookup(dictionary, key);

    if (typeof value !== "string") return key;

    return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
      String(options?.[name] ?? ""),
    );
  };

  return translate as unknown as Translate;
}

const en = createTranslator("en");
const ptBR = createTranslator("pt-BR");

const hollowKnight = {
  id: 1029,
  name: "Hollow Knight",
  slug: "hollow-knight",
  coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1.jpg",
};

function makeItem(
  overrides: Partial<NotificationInboxItemDto>,
): NotificationInboxItemDto {
  return {
    id: 1,
    type: "guild.contract-ready",
    actors: [],
    actorCount: 0,
    eventCount: 1,
    preview: null,
    target: null,
    lastEventAt: "2026-11-21T12:00:00.000Z",
    version: 1,
    readVersion: 0,
    ...overrides,
  };
}

const guildTarget = {
  type: NotificationGuildTargetDto.type.GUILD,
  contractId: "contract-1",
} satisfies NotificationGuildTargetDto;

describe("guild.contract-ready content", () => {
  it("uses the target game cover and name when preview.game is present", () => {
    const result = getNotificationContent(
      makeItem({
        preview: {
          text: "A Guild contract is ready to turn in.",
          game: hollowKnight,
        },
        target: guildTarget,
      }),
      en,
    );

    expect(result.name).toBe("Adventurers Guild");
    expect(result.message).toBe(
      "Your Guild contract for Hollow Knight is ready to turn in.",
    );
    expect(result.leading).toEqual({
      kind: "cover",
      url: "https://images.igdb.com/igdb/image/upload/t_cover_small/co1.jpg",
      alt: "Hollow Knight",
      avatar: null,
    });
  });

  it("falls back to the Guild shield and generic copy without preview.game", () => {
    const result = getNotificationContent(
      makeItem({
        preview: { text: "A Guild contract is ready to turn in." },
        target: guildTarget,
      }),
      en,
    );

    expect(result.name).toBe("Adventurers Guild");
    expect(result.message).toBe("Your Guild contract is ready to turn in.");
    expect(result.leading).toEqual({ kind: "icon", icon: "guild" });
  });

  it("falls back to the shield when the game has no cover", () => {
    const result = getNotificationContent(
      makeItem({
        preview: {
          text: "A Guild contract is ready to turn in.",
          game: { ...hollowKnight, coverUrl: null },
        },
        target: guildTarget,
      }),
      en,
    );

    expect(result.message).toBe(
      "Your Guild contract for Hollow Knight is ready to turn in.",
    );
    expect(result.leading).toEqual({ kind: "icon", icon: "guild" });
  });

  it("translates the copy to pt-BR", () => {
    const result = getNotificationContent(
      makeItem({
        preview: {
          text: "A Guild contract is ready to turn in.",
          game: hollowKnight,
        },
        target: guildTarget,
      }),
      ptBR,
    );

    expect(result.name).toBe("Guilda dos Aventureiros");
    expect(result.message).toBe(
      "Seu contrato da Guilda para Hollow Knight está pronto para entregar.",
    );
  });
});

describe("guild.contract-ready navigation", () => {
  it("opens the accepted contracts tab of the Guild", async () => {
    const router = { push: vi.fn().mockResolvedValue(undefined) };

    await navigateToNotificationTarget(guildTarget, router, "user-1");

    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith("/guild?tab=accepted");
  });
});

describe("guild.contract-expiring content", () => {
  it("uses the target game cover and name when preview.game is present", () => {
    const result = getNotificationContent(
      makeItem({
        type: "guild.contract-expiring",
        preview: {
          text: "A Guild contract expires in less than 24 hours.",
          game: hollowKnight,
        },
        target: guildTarget,
      }),
      en,
    );

    expect(result.name).toBe("Adventurers Guild");
    expect(result.message).toBe(
      "Your Guild contract for Hollow Knight expires in less than 24 hours.",
    );
    expect(result.leading).toEqual({
      kind: "cover",
      url: "https://images.igdb.com/igdb/image/upload/t_cover_small/co1.jpg",
      alt: "Hollow Knight",
      avatar: null,
    });
  });

  it("falls back to the Guild shield and generic copy without preview.game", () => {
    const result = getNotificationContent(
      makeItem({
        type: "guild.contract-expiring",
        preview: {
          text: "A Guild contract expires in less than 24 hours.",
        },
        target: guildTarget,
      }),
      en,
    );

    expect(result.name).toBe("Adventurers Guild");
    expect(result.message).toBe(
      "Your Guild contract expires in less than 24 hours.",
    );
    expect(result.leading).toEqual({ kind: "icon", icon: "guild" });
  });
});

describe("guild.contract-expiring navigation", () => {
  it("opens the accepted contracts tab of the Guild", async () => {
    const router = { push: vi.fn().mockResolvedValue(undefined) };

    await navigateToNotificationTarget(guildTarget, router, "user-1");

    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith("/guild?tab=accepted");
  });
});
