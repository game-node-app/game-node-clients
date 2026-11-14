import type { TFunction } from "i18next";
import {
  NotificationActivityTargetDto,
  NotificationAvatarDto,
  NotificationInboxItemDto,
  NotificationImportPreviewDto,
  NotificationTextPreviewDto,
  UserConnectionDto,
} from "@repo/wrapper/server";
import { getConnectionName } from "#@/components/connections/util/getConnectionName";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";

/**
 * Icons a notification can show as its leading element. The UI maps each
 * identifier to the matching Tabler icon.
 */
export type NotificationLeadingIcon =
  | "trophy"
  | "download"
  | "alert"
  | "connection"
  | "notification";

/**
 * Descriptive leading data for a notification item.
 *
 * - `avatar`: circular avatar built from the actor DTO (no profile request).
 * - `cover`: game cover for activity targets. `avatar` is the fallback to use
 *   when the image fails to load.
 * - `icon`: one of the identifiers above.
 */
export type NotificationLeading =
  | { kind: "avatar"; avatar: NotificationAvatarDto | null }
  | {
      kind: "cover";
      url: string;
      alt: string;
      avatar: NotificationAvatarDto | null;
    }
  | { kind: "icon"; icon: NotificationLeadingIcon };

export interface NotificationFollowBackAction {
  kind: "followBack";
  userId: string;
}

export interface NotificationContent {
  name: string;
  message: string;
  leading: NotificationLeading;
  action?: NotificationFollowBackAction;
}

type NotificationTarget = NotificationInboxItemDto["target"];

function getLeadActor(item: NotificationInboxItemDto) {
  return item.actors?.[0];
}

function getLeadAvatar(
  item: NotificationInboxItemDto,
): NotificationAvatarDto | null {
  return getLeadActor(item)?.avatar ?? null;
}

function getPluralCount(item: NotificationInboxItemDto): number {
  return Math.max(item.actorCount ?? 0, item.actors?.length ?? 0, 1);
}

function getActorName(item: NotificationInboxItemDto, t: TFunction): string {
  const leadActor = getLeadActor(item);
  if (!leadActor) return "";

  const otherActors = Math.max((item.actorCount ?? 1) - 1, 0);
  if (otherActors === 0) return leadActor.username;

  return t("notifications.actors.andOthers", {
    name: leadActor.username,
    count: otherActors,
  });
}

function getTextPreview(
  item: NotificationInboxItemDto,
): NotificationTextPreviewDto | null {
  const preview = item.preview;
  if (!preview || !("text" in preview)) return null;
  return preview;
}

function getImportPreview(
  item: NotificationInboxItemDto,
): NotificationImportPreviewDto | null {
  const preview = item.preview;
  if (!preview || "text" in preview) return null;
  return preview;
}

function getActivityGame(target: NotificationTarget) {
  if (target?.type === NotificationActivityTargetDto.type.ACTIVITY) {
    return target.game;
  }
  return undefined;
}

function getGameSuffix(target: NotificationTarget, t: TFunction): string {
  const game = getActivityGame(target);
  if (!game?.name) return "";

  return ` ${t("notifications.messages.gameSuffix", { name: game.name })}`;
}

function getSocialLeading(
  item: NotificationInboxItemDto,
  target: NotificationTarget,
): NotificationLeading {
  const avatar = getLeadAvatar(item);
  const game = getActivityGame(target);

  if (game?.coverUrl) {
    const sizedUrl = getSizedImageUrl(game.coverUrl, ImageSize.COVER_SMALL);
    return {
      kind: "cover",
      url: sizedUrl?.startsWith("http") ? sizedUrl : game.coverUrl,
      alt: game.name,
      avatar,
    };
  }

  return { kind: "avatar", avatar };
}

function getTargetLabel(target: NotificationTarget, t: TFunction): string {
  switch (target?.type) {
    case "review":
      return t("notifications.targets.review");
    case "post":
      return t("notifications.targets.post");
    case "activity":
      return t("notifications.targets.activity");
    default:
      return t("notifications.targets.content");
  }
}

function getFallbackContent(
  item: NotificationInboxItemDto,
  t: TFunction,
): NotificationContent {
  const textPreview = getTextPreview(item);
  const avatar = getLeadAvatar(item);

  return {
    name: getActorName(item, t),
    message: textPreview?.text ?? "",
    leading: avatar
      ? { kind: "avatar", avatar }
      : { kind: "icon", icon: "notification" },
  };
}

/**
 * Builds the display content of a notification from its materialized DTO.
 *
 * Reads only `type`, `actors`, `actorCount`, `preview` and `target`; it never
 * performs a request and never resolves the actor profile.
 */
export function getNotificationContent(
  item: NotificationInboxItemDto,
  t: TFunction,
): NotificationContent {
  const textPreview = getTextPreview(item);
  const pluralCount = getPluralCount(item);

  switch (item.type) {
    case "profile.followed": {
      const leadActor = getLeadActor(item);
      const action =
        leadActor?.isFollowedByRecipient === false
          ? { kind: "followBack" as const, userId: leadActor.userId }
          : undefined;

      return {
        name: getActorName(item, t),
        message: t("notifications.messages.followed", { count: pluralCount }),
        leading: { kind: "avatar", avatar: getLeadAvatar(item) },
        action,
      };
    }

    case "content.liked": {
      const target = item.target;
      const gameSuffix = getGameSuffix(target, t);
      const targetType = target?.type as string | undefined;

      let message: string;
      switch (targetType) {
        case "review":
          message = t("notifications.messages.likedReview", {
            count: pluralCount,
            game: gameSuffix,
          });
          break;
        case "activity":
          message = t("notifications.messages.likedActivity", {
            count: pluralCount,
            game: gameSuffix,
          });
          break;
        case "post":
          message = t("notifications.messages.likedPost", {
            count: pluralCount,
          });
          break;
        case "comment":
          message = t("notifications.messages.likedComment", {
            count: pluralCount,
          });
          break;
        default:
          message = t("notifications.messages.liked", {
            count: pluralCount,
          });
      }

      return {
        name: getActorName(item, t),
        message,
        leading: getSocialLeading(item, target),
      };
    }

    case "comment.created": {
      const target = item.target;
      const hasCustomPreview =
        !!textPreview?.text && textPreview.text !== "Shared a comment";

      return {
        name: getActorName(item, t),
        message: hasCustomPreview
          ? t("notifications.messages.commented", {
              count: pluralCount,
              target: getTargetLabel(target, t),
              text: textPreview.text,
            })
          : t("notifications.messages.commentedNoText", {
              count: pluralCount,
              target: getTargetLabel(target, t),
            }),
        leading: getSocialLeading(item, target),
      };
    }

    case "comment.replied": {
      const hasCustomPreview =
        !!textPreview?.text && textPreview.text !== "Replied to your comment";

      return {
        name: getActorName(item, t),
        message: hasCustomPreview
          ? t("notifications.messages.replied", {
              count: pluralCount,
              text: textPreview.text,
            })
          : t("notifications.messages.repliedNoText", {
              count: pluralCount,
            }),
        leading: getSocialLeading(item, item.target),
      };
    }

    case "achievement.unlocked": {
      const tier =
        (item.target && "tier" in item.target ? item.target.tier : 1) ?? 1;

      return {
        name: t("notifications.achievement.title"),
        message: t("notifications.achievementUnlocked", {
          name: textPreview?.text ?? "",
          tier,
        }),
        leading: { kind: "icon", icon: "trophy" },
      };
    }

    case "import.discovery-completed": {
      const preview = getImportPreview(item);
      const provider = preview?.provider ?? "steam";
      const sourceName = getConnectionName(
        provider as unknown as UserConnectionDto.type,
      );
      const gamesCount = preview?.gameCount ?? 0;
      const importedCount = preview?.importedCount ?? 0;
      const skippedCount = preview?.skippedCount ?? 0;
      const failedCount = preview?.failedCount ?? 0;

      const baseMessage = t("notifications.discovery.baseMessage", {
        gamesCount,
        sourceName,
      });
      const parts: string[] = [];
      if (importedCount > 0) {
        parts.push(
          t("notifications.discovery.importedPart", { count: importedCount }),
        );
      }
      if (skippedCount > 0) {
        parts.push(
          t("notifications.discovery.skippedPart", { count: skippedCount }),
        );
      }
      if (failedCount > 0) {
        parts.push(
          t("notifications.discovery.failedPart", { count: failedCount }),
        );
      }
      const sample =
        preview?.gameSample && preview.gameSample.length > 0
          ? ` (${preview.gameSample.map((game) => game.title).join(", ")})`
          : "";

      return {
        name: t("notifications.discovery.title"),
        message:
          parts.length > 0
            ? `${baseMessage} ${parts.join(", ")}.${sample}`
            : `${baseMessage}${sample}`,
        leading: { kind: "icon", icon: "download" },
      };
    }

    case "connection.reauth-required": {
      const target = item.target;
      if (target?.type === "connection") {
        const providerName = getConnectionName(
          target.provider as unknown as UserConnectionDto.type,
        );

        return {
          name: t("notifications.connection.title", {
            provider: providerName,
          }),
          message: t("notifications.connectionReauthRequired", {
            provider: providerName,
          }),
          leading: { kind: "icon", icon: "connection" },
        };
      }
      break;
    }

    case "moderation.applied": {
      const action = textPreview?.action;
      const name =
        action === "suspension"
          ? t("notifications.moderation.suspension")
          : action === "ban"
            ? t("notifications.moderation.ban")
            : t("notifications.moderation.alert");

      const parts = [
        textPreview?.reason,
        t("reports.messages.contentDeleted"),
        t("reports.messages.appeal"),
      ].filter((part): part is string => !!part);

      return {
        name,
        message: parts.join(" "),
        leading: { kind: "icon", icon: "alert" },
      };
    }
  }

  return getFallbackContent(item, t);
}
