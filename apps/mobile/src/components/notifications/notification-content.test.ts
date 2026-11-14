import { describe, expect, it } from "vitest";
import {
  NotificationAchievementTargetDto,
  NotificationActivityTargetDto,
  NotificationConnectionTargetDto,
  NotificationContentTargetDto,
  NotificationImporterTargetDto,
  NotificationImportPreviewDto,
  NotificationInboxItemDto,
  NotificationProfileTargetDto,
  NotificationTextPreviewDto,
} from "@repo/wrapper/server";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import ptTranslations from "../../../../../packages/locales/src/translations/json/pt-BR.json";
import {
  getNotificationContent,
  type NotificationContent,
} from "../../../../../packages/ui/src/components/notifications/util/getNotificationContent";

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
    let value = lookup(dictionary, key);

    if (typeof value !== "string") {
      const count = Number(options?.count ?? 0);
      value = lookup(dictionary, `${key}_${count === 1 ? "one" : "other"}`);
    }

    if (typeof value !== "string") return key;

    return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
      String(options?.[name] ?? ""),
    );
  };

  return translate as unknown as Translate;
}

const en = createTranslator("en");
const ptBR = createTranslator("pt-BR");

const alice = {
  userId: "u1",
  username: "alice",
  avatar: { id: 10, filename: "alice_avatar", extension: "png" },
};

function makeItem(
  overrides: Partial<NotificationInboxItemDto>,
): NotificationInboxItemDto {
  return {
    id: 1,
    type: "content.liked",
    actors: [],
    actorCount: 0,
    eventCount: 1,
    preview: null,
    target: null,
    lastEventAt: "2026-11-11T10:00:00.000Z",
    version: 1,
    readVersion: 0,
    ...overrides,
  };
}

function content(overrides: Partial<NotificationInboxItemDto>) {
  return getNotificationContent(makeItem(overrides), en);
}

const textPreview = (text: string): NotificationTextPreviewDto => ({ text });

describe("getNotificationContent - profile.followed", () => {
  it("uses the lead actor name and avatar and offers follow back when not followed", () => {
    const result = content({
      type: "profile.followed",
      actors: [{ ...alice, isFollowedByRecipient: false }],
      actorCount: 1,
      target: {
        type: NotificationProfileTargetDto.type.PROFILE,
        id: "u1",
      },
    });

    expect(result).toEqual<NotificationContent>({
      name: "alice",
      message: "started following you.",
      leading: { kind: "avatar", avatar: alice.avatar },
      action: { kind: "followBack", userId: "u1" },
    });
  });

  it("adds the remaining actor count to the name and pluralizes pt-BR", () => {
    const result = getNotificationContent(
      makeItem({
        type: "profile.followed",
        actors: [alice],
        actorCount: 3,
        target: {
          type: NotificationProfileTargetDto.type.PROFILE,
          id: "u1",
        },
      }),
      ptBR,
    );

    expect(result.name).toBe("alice e mais 2");
    expect(result.message).toBe("começaram a seguir você.");
  });

  it.each([[true], [undefined]])(
    "does not offer follow back when isFollowedByRecipient is %s",
    (isFollowedByRecipient) => {
      const result = content({
        type: "profile.followed",
        actors: [{ ...alice, isFollowedByRecipient }],
        actorCount: 1,
      });

      expect(result.action).toBeUndefined();
    },
  );
});

describe("getNotificationContent - content.liked", () => {
  it("uses the review message and the avatar", () => {
    const result = content({
      actors: [alice],
      actorCount: 1,
      target: {
        type: NotificationContentTargetDto.type.REVIEW,
        id: "rev-1",
      },
    });

    expect(result.name).toBe("alice");
    expect(result.message).toBe("liked your review.");
    expect(result.leading).toEqual({
      kind: "avatar",
      avatar: alice.avatar,
    });
  });

  it.each([
    [NotificationContentTargetDto.type.POST, "liked your post."],
    [NotificationContentTargetDto.type.REVIEW, "liked your review."],
  ])("uses the message for %s targets", (targetType, expected) => {
    const result = content({
      actors: [alice],
      actorCount: 1,
      target: { type: targetType, id: "content-1" },
    });

    expect(result.message).toBe(expected);
  });

  it("uses the comment message for comment targets", () => {
    const result = content({
      actors: [alice],
      actorCount: 1,
      target: {
        type: "comment",
        id: "comment-1",
      } as unknown as NotificationInboxItemDto["target"],
    });

    expect(result.message).toBe("liked your comment.");
  });

  it("falls back to the generic message when the target is missing", () => {
    const result = content({ actors: [alice], actorCount: 1, target: null });

    expect(result.message).toBe("liked your content.");
  });

  it("uses the game cover and appends the game suffix for activity targets", () => {
    const result = content({
      actors: [alice],
      actorCount: 2,
      target: {
        type: NotificationActivityTargetDto.type.ACTIVITY,
        id: "act-1",
        activityType: "play",
        game: {
          id: 99,
          name: "Elden Ring",
          slug: "elden-ring",
          coverUrl:
            "https://images.igdb.com/igdb/image/upload/t_cover_big/co2l7z.jpg",
        },
      },
    });

    expect(result.message).toBe("liked your activity of Elden Ring.");
    expect(result.leading).toEqual({
      kind: "cover",
      url: "https://images.igdb.com/igdb/image/upload/t_cover_small/co2l7z.jpg",
      alt: "Elden Ring",
      avatar: alice.avatar,
    });
  });

  it("pluralizes and translates the liked review message with the game suffix", () => {
    const result = getNotificationContent(
      makeItem({
        actors: [alice],
        actorCount: 3,
        target: {
          type: NotificationActivityTargetDto.type.ACTIVITY,
          id: "act-1",
          activityType: "play",
          game: {
            id: 99,
            name: "Elden Ring",
            slug: "elden-ring",
            coverUrl: null,
          },
        },
      }),
      ptBR,
    );

    expect(result.name).toBe("alice e mais 2");
    expect(result.message).toBe("curtiram sua atividade de Elden Ring.");
    expect(result.leading).toEqual({
      kind: "avatar",
      avatar: alice.avatar,
    });
  });

  it.each([
    ["missing cover", { id: 99, name: "Celeste", slug: null, coverUrl: null }],
    ["missing game", undefined],
  ])("falls back to the avatar when the activity has a %s", (_, game) => {
    const result = content({
      actors: [alice],
      actorCount: 1,
      target: {
        type: NotificationActivityTargetDto.type.ACTIVITY,
        id: "act-1",
        activityType: "play",
        game,
      },
    });

    expect(result.leading.kind).toBe("avatar");
  });
});

describe("getNotificationContent - comments", () => {
  it("quotes the comment text on created comments", () => {
    const result = content({
      type: "comment.created",
      actors: [alice],
      actorCount: 1,
      preview: textPreview("Great review!"),
      target: {
        type: NotificationContentTargetDto.type.REVIEW,
        id: "rev-1",
      },
    });

    expect(result.name).toBe("alice");
    expect(result.message).toBe('commented on your review: "Great review!"');
    expect(result.leading.kind).toBe("avatar");
  });

  it("omits the quote for the materialized placeholder text", () => {
    const result = content({
      type: "comment.created",
      actors: [alice],
      actorCount: 1,
      preview: textPreview("Shared a comment"),
      target: {
        type: NotificationContentTargetDto.type.POST,
        id: "post-1",
      },
    });

    expect(result.message).toBe("commented on your post.");
  });

  it("uses the content target label when the target is missing", () => {
    const result = content({
      type: "comment.created",
      actors: [alice],
      actorCount: 1,
      preview: null,
      target: null,
    });

    expect(result.message).toBe("commented on your content.");
  });

  it("pluralizes and translates pt-BR comment messages", () => {
    const result = getNotificationContent(
      makeItem({
        type: "comment.created",
        actors: [alice],
        actorCount: 2,
        preview: textPreview("Bom!"),
        target: {
          type: NotificationContentTargetDto.type.POST,
          id: "post-1",
        },
      }),
      ptBR,
    );

    expect(result.message).toBe('comentaram na sua publicação: "Bom!"');
  });

  it("uses the cover for comment targets on activities", () => {
    const result = content({
      type: "comment.created",
      actors: [alice],
      actorCount: 1,
      preview: textPreview("Nice"),
      target: {
        type: NotificationActivityTargetDto.type.ACTIVITY,
        id: "act-1",
        activityType: "play",
        game: {
          id: 99,
          name: "Elden Ring",
          slug: "elden-ring",
          coverUrl:
            "https://images.igdb.com/igdb/image/upload/t_cover_big/co2l7z.jpg",
        },
      },
    });

    expect(result.leading.kind).toBe("cover");
  });

  it("quotes the reply text on replied comments", () => {
    const result = content({
      type: "comment.replied",
      actors: [alice],
      actorCount: 1,
      preview: textPreview("I agree"),
      target: {
        type: NotificationContentTargetDto.type.POST,
        id: "post-1",
      },
    });

    expect(result.message).toBe('replied to your comment: "I agree"');
  });

  it("omits the quote for the materialized reply placeholder", () => {
    const result = content({
      type: "comment.replied",
      actors: [alice],
      actorCount: 1,
      preview: textPreview("Replied to your comment"),
      target: {
        type: NotificationContentTargetDto.type.POST,
        id: "post-1",
      },
    });

    expect(result.message).toBe("replied to your comment.");
  });

  it("pluralizes replies in pt-BR", () => {
    const result = getNotificationContent(
      makeItem({
        type: "comment.replied",
        actors: [alice],
        actorCount: 2,
        preview: textPreview("Concordo"),
        target: null,
      }),
      ptBR,
    );

    expect(result.message).toBe('responderam seu comentário: "Concordo"');
  });
});

describe("getNotificationContent - system notifications", () => {
  it("describes an unlocked achievement with the trophy icon", () => {
    const result = content({
      type: "achievement.unlocked",
      preview: textPreview("Horror critic"),
      target: {
        type: NotificationAchievementTargetDto.type.ACHIEVEMENT,
        id: "horror-critic",
        tier: 2,
      },
    });

    expect(result.name).toBe("Achievement");
    expect(result.message).toBe("Unlocked Horror critic (tier 2)");
    expect(result.leading).toEqual({ kind: "icon", icon: "trophy" });
  });

  it("describes a discovery with counts, provider and download icon", () => {
    const result = content({
      type: "import.discovery-completed",
      preview: {
        provider: NotificationImportPreviewDto.provider.STEAM,
        gameCount: 15,
        importedCount: 5,
        skippedCount: 8,
        failedCount: 2,
        gameSample: [
          { id: 1, title: "Hades" },
          { id: 2, title: "Celeste" },
        ],
      },
      target: {
        type: NotificationImporterTargetDto.type.IMPORTER,
        id: "imp-1",
        provider: NotificationImporterTargetDto.provider.STEAM,
      },
    });

    expect(result.name).toBe("Discovery completed");
    expect(result.message).toBe(
      "We've found 15 new games ready to be imported from your Steam connection. 5 automatically imported, 8 already in your library, 2 failed. (Hades, Celeste)",
    );
    expect(result.leading).toEqual({ kind: "icon", icon: "download" });
  });

  it("translates the discovery summary to pt-BR", () => {
    const result = getNotificationContent(
      makeItem({
        type: "import.discovery-completed",
        preview: {
          provider: NotificationImportPreviewDto.provider.STEAM,
          gameCount: 15,
          importedCount: 5,
          skippedCount: 8,
          failedCount: 2,
          gameSample: [],
        },
        target: {
          type: NotificationImporterTargetDto.type.IMPORTER,
          id: "imp-1",
          provider: NotificationImporterTargetDto.provider.STEAM,
        },
      }),
      ptBR,
    );

    expect(result.message).toBe(
      "Encontramos 15 novos jogos prontos para serem importados da sua conexão com Steam. 5 importados automaticamente, 8 já na sua biblioteca, 2 com falha.",
    );
  });

  it("names the provider in a reauthentication notification", () => {
    const result = content({
      type: "connection.reauth-required",
      target: {
        type: NotificationConnectionTargetDto.type.CONNECTION,
        id: "7",
        provider: NotificationConnectionTargetDto.provider.XBOX,
      },
    });

    expect(result.name).toBe("Xbox Live connection");
    expect(result.message).toBe(
      "Your Xbox Live connection needs to be reconnected.",
    );
    expect(result.leading).toEqual({ kind: "icon", icon: "connection" });
  });

  it("falls back for a connection notification without a connection target", () => {
    const result = content({
      type: "connection.reauth-required",
      preview: textPreview("Your connection needs to be reconnected."),
      target: null,
    });

    expect(result.message).toBe("Your connection needs to be reconnected.");
    expect(result.leading).toEqual({ kind: "icon", icon: "notification" });
  });

  it.each([
    [NotificationTextPreviewDto.action.SUSPENSION, "Suspension"],
    [NotificationTextPreviewDto.action.BAN, "Ban"],
    [NotificationTextPreviewDto.action.ALERT, "Notice"],
    [undefined, "Notice"],
  ])("titles moderation actions as %s", (action, expectedName) => {
    const result = content({
      type: "moderation.applied",
      preview: {
        text: "",
        action,
        reason: "Inappropriate review text",
      },
    });

    expect(result.name).toBe(expectedName);
    expect(result.message).toContain("Inappropriate review text");
    expect(result.message).toContain(
      "The reported content may have been deleted.",
    );
    expect(result.message).toContain("If you think this is a mistake.");
    expect(result.leading).toEqual({ kind: "icon", icon: "alert" });
  });

  it("translates the moderation title to pt-BR", () => {
    const result = getNotificationContent(
      makeItem({
        type: "moderation.applied",
        preview: {
          text: "",
          action: NotificationTextPreviewDto.action.SUSPENSION,
          reason: "Conteúdo impróprio",
        },
      }),
      ptBR,
    );

    expect(result.name).toBe("Suspensão");
    expect(result.message).toContain("Conteúdo impróprio");
  });
});

describe("getNotificationContent - unknown types", () => {
  it("falls back to the actor and the preview text", () => {
    const result = content({
      type: "something.new",
      actors: [alice],
      actorCount: 1,
      preview: textPreview("Something happened"),
    });

    expect(result.name).toBe("alice");
    expect(result.message).toBe("Something happened");
    expect(result.leading).toEqual({
      kind: "avatar",
      avatar: alice.avatar,
    });
  });

  it("uses the notification icon when there is no actor", () => {
    const result = content({
      type: "something.new",
      preview: textPreview("Something happened"),
    });

    expect(result.name).toBe("");
    expect(result.message).toBe("Something happened");
    expect(result.leading).toEqual({ kind: "icon", icon: "notification" });
  });
});
