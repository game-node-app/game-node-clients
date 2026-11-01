import React from "react";
import {
  NotificationActivityTargetDto,
  NotificationInboxItemDto,
  NotificationImportPreviewDto,
  NotificationTextPreviewDto,
  ReviewsService,
  UserConnectionDto,
} from "@repo/wrapper/server";
import {
  Avatar,
  Group,
  Image,
  Notification,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconAlertCircleFilled, IconTrophy } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import {
  getS3StoredUpload,
  getServerStoredIcon,
} from "#@/util/getServerStoredImages";
import { useRouter } from "#@/util/link";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { getConnectionName } from "#@/components/connections/util/getConnectionName";

export interface AggregatedNotificationProps {
  aggregatedNotification: NotificationInboxItemDto;
  onClick: () => void;
  backgroundColor: "normal" | "darker";
}

export interface AggregatedNotificationContentProps {
  aggregatedNotification: NotificationInboxItemDto;
}

const AggregatedNotification = ({
  aggregatedNotification,
  onClick,
  backgroundColor,
}: AggregatedNotificationProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useUserId();

  const handleItemClick = async () => {
    onClick?.();

    const target = aggregatedNotification.target;
    if (!target) return;

    if (target.type === "review") {
      try {
        const review = await ReviewsService.reviewsControllerFindOneByIdV1(
          target.id,
        );
        if (review?.gameId) {
          await router.push(
            `/game/${review.gameId}?tab=reviews&reviewId=${review.id}`,
          );
        }
      } catch (err) {
        console.error(err);
      }
      return;
    }

    if (target.type === "post") {
      await router.push(`/posts?postId=${target.id}`);
    } else if (target.type === "activity") {
      await router.push(`/activity/detail/${target.id}`);
    } else if (target.type === "profile") {
      await router.push(`/profile/${target.id}`);
    } else if (target.type === "importer") {
      await router.push(`/importer/${target.provider}`);
    } else if (target.type === "connection") {
      await router.push("/preferences/connections");
    } else if (target.type === "achievement" && userId) {
      await router.push(`/feats/${userId}`);
    }
  };

  if (aggregatedNotification.type === "moderation.applied") {
    const preview =
      aggregatedNotification.preview as NotificationTextPreviewDto | null;
    let alertShortText = t("reports.messages.alert");
    if (preview?.action === "suspension") {
      alertShortText = t("reports.messages.suspend");
    } else if (preview?.action === "ban") {
      alertShortText = t("reports.messages.ban");
    }

    return (
      <Notification
        color="rgba(255, 255, 255, 0)"
        className={`w-full ${backgroundColor === "normal" ? "bg-[#262626]" : "bg-[#171717]"} cursor-pointer`}
        withCloseButton={false}
        onClick={handleItemClick}
        radius={0}
        styles={{
          root: {
            paddingLeft: 10,
            paddingRight: 10,
          },
        }}
      >
        <Group className={"w-full flex-nowrap"}>
          <ThemeIcon variant={"transparent"} c={"red"} size={"lg"}>
            <IconAlertCircleFilled className={"w-full h-auto"} />
          </ThemeIcon>
          <div>
            <Text>{alertShortText}</Text>
            {preview?.reason && <Text>{preview.reason}</Text>}
            <Text>{t("reports.messages.contentDeleted")}</Text>
            <Text className={"italic"}>{t("reports.messages.appeal")}</Text>
          </div>
        </Group>
      </Notification>
    );
  }

  if (aggregatedNotification.type === "achievement.unlocked") {
    const preview =
      aggregatedNotification.preview as NotificationTextPreviewDto | null;
    const tier =
      (aggregatedNotification.target as { tier?: number })?.tier ?? 1;

    return (
      <Notification
        color="rgba(255, 255, 255, 0)"
        className={`w-full ${backgroundColor === "normal" ? "bg-[#262626]" : "bg-[#171717]"} cursor-pointer`}
        withCloseButton={false}
        onClick={handleItemClick}
        radius={0}
        styles={{
          root: {
            paddingLeft: 10,
            paddingRight: 10,
          },
        }}
      >
        <Group className={"w-full flex-nowrap items-center"}>
          <ThemeIcon variant={"transparent"} c={"yellow"} size={"lg"}>
            <IconTrophy className={"w-full h-auto"} />
          </ThemeIcon>
          <Text>
            {t("notifications.achievementUnlocked", {
              name: preview?.text ?? "",
              tier,
            })}
          </Text>
        </Group>
      </Notification>
    );
  }

  if (aggregatedNotification.type === "import.discovery-completed") {
    const preview =
      aggregatedNotification.preview as NotificationImportPreviewDto | null;
    const provider = preview?.provider || "steam";
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
        ? ` (${preview.gameSample.map((g) => g.title).join(", ")})`
        : "";

    const message =
      parts.length > 0
        ? `${baseMessage} ${parts.join(", ")}.${sample}`
        : `${baseMessage}${sample}`;

    return (
      <Notification
        color="rgba(255, 255, 255, 0)"
        className={`w-full ${backgroundColor === "normal" ? "bg-[#262626]" : "bg-[#171717]"} cursor-pointer`}
        withCloseButton={false}
        onClick={handleItemClick}
        aria-label={t("notifications.discovery.title")}
        radius={0}
        styles={{
          root: {
            paddingLeft: 10,
            paddingRight: 10,
          },
        }}
      >
        <Group className={"w-full flex-nowrap justify-center items-center"}>
          <Image
            alt={t("notifications.discovery.sourceIconAlt", {
              source: sourceName,
            })}
            src={getServerStoredIcon(provider)}
            w={38}
            h={38}
          />
          <Text>{message}</Text>
        </Group>
      </Notification>
    );
  }

  if (
    aggregatedNotification.type === "connection.reauth-required" &&
    aggregatedNotification.target?.type === "connection"
  ) {
    const provider = aggregatedNotification.target.provider;
    const providerName = getConnectionName(
      provider as unknown as UserConnectionDto.type,
    );

    return (
      <Notification
        color="rgba(255, 255, 255, 0)"
        className={`w-full ${backgroundColor === "normal" ? "bg-[#262626]" : "bg-[#171717]"} cursor-pointer`}
        withCloseButton={false}
        onClick={handleItemClick}
        radius={0}
        styles={{
          root: {
            paddingLeft: 10,
            paddingRight: 10,
          },
        }}
      >
        <Group className={"w-full flex-nowrap items-center"}>
          {/* decorative: the adjacent text already names the provider */}
          <Image alt="" src={getServerStoredIcon(provider)} w={38} h={38} />
          <Text>
            {t("notifications.connectionReauthRequired", {
              provider: providerName,
            })}
          </Text>
        </Group>
      </Notification>
    );
  }

  const actors = aggregatedNotification.actors || [];
  const leadActor = actors[0];
  const leadAvatarSrc = leadActor?.avatar?.filename
    ? getS3StoredUpload(leadActor.avatar.filename)
    : undefined;

  const actorNames = actors
    .slice(0, 2)
    .map((a) => a.username)
    .join(", ");
  const remainingActors = Math.max(
    0,
    aggregatedNotification.actorCount - Math.min(actors.length, 2),
  );

  const preview =
    aggregatedNotification.preview as NotificationTextPreviewDto | null;
  const target = aggregatedNotification.target;

  let bodyContent: React.ReactNode = null;

  if (aggregatedNotification.type === "profile.followed") {
    bodyContent = "has started following you.";
  } else if (aggregatedNotification.type === "content.liked") {
    const rawText = preview?.text
      ? preview.text.toLowerCase()
      : "liked your content";
    const activityGameName =
      target?.type === "activity"
        ? (target as NotificationActivityTargetDto).game?.name
        : undefined;

    bodyContent = (
      <>
        {rawText}
        {activityGameName ? ` of ${activityGameName}` : ""}.
      </>
    );
  } else if (aggregatedNotification.type === "comment.created") {
    const targetType = target?.type || "content";
    const hasCustomPreview =
      preview?.text && preview.text !== "Shared a comment";
    bodyContent = hasCustomPreview
      ? `commented on your ${targetType}: "${preview.text}"`
      : `commented on your ${targetType}.`;
  } else if (aggregatedNotification.type === "comment.replied") {
    const hasCustomPreview =
      preview?.text && preview.text !== "Replied to your comment";
    bodyContent = hasCustomPreview
      ? `replied to your comment: "${preview.text}"`
      : `replied to your comment.`;
  } else {
    bodyContent = preview?.text || "";
  }

  return (
    <Notification
      color="rgba(255, 255, 255, 0)"
      className={`w-full ${backgroundColor === "normal" ? "bg-[#262626]" : "bg-[#171717]"} cursor-pointer`}
      withCloseButton={false}
      onClick={handleItemClick}
      radius={0}
      styles={{
        root: {
          paddingLeft: 10,
          paddingRight: 10,
        },
      }}
    >
      <Group wrap={"nowrap"} className={"w-full"}>
        <Avatar src={leadAvatarSrc} size={"md"} radius={"xl"} />
        <Text lineClamp={4}>
          <strong>{actorNames}</strong>{" "}
          {remainingActors > 0 && <span>and {remainingActors} others </span>}
          {bodyContent}
        </Text>
      </Group>
    </Notification>
  );
};

export { AggregatedNotification };
