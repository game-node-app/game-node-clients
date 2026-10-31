import {
  AchievementBadge,
  ActivityItemComments,
  ActivityItemLikes,
  ActivityItemProps,
  GameRating,
  ObtainedAchievementActivityContent,
  useAchievementsV2,
  useCollection,
  useCollectionEntry,
  useGame,
  useObtainedGameAchievementActivity,
  usePost,
  UserAvatar,
  useReview,
  useUserProfile,
} from "#@/components";
import { buildPresenterComponent } from "#@/context";
import { Link } from "#@/util";
import { Box, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { Activity } from "@repo/wrapper/server";
import { useMemo } from "react";
import { match } from "ts-pattern";

const DEFAULT_ActivityItem = ({ activity }: ActivityItemProps) => {
  const { t } = useTranslation();
  const collectionEntryQuery = useCollectionEntry(activity.collectionEntryId);
  const collectionQuery = useCollection(activity.collectionId);
  const reviewQuery = useReview(activity.reviewId);
  const postQuery = usePost(activity.postId);
  const profileQuery = useUserProfile(activity.profileUserId);
  const gameAchievementActivityQuery = useObtainedGameAchievementActivity(
    activity.obtainedGameAchievementActivityId,
  );

  const unlockedTier = activity.obtainedAchievement?.tier ?? 0;
  const achievementsQuery = useAchievementsV2(activity.profileUserId);
  const unlockedAchievement = achievementsQuery.data?.find(
    (a) => a.id === activity.obtainedAchievement?.achievementId,
  );

  const gameId =
    collectionEntryQuery.data?.gameId ||
    reviewQuery.data?.gameId ||
    postQuery.data?.gameId ||
    gameAchievementActivityQuery.data?.externalGame.gameId;

  const actionText = useMemo(() => {
    return match(activity.type)
      .with(Activity.type.COLLECTION_ENTRY, () => {
        return (
          <>
            {t("activity.items.addedTo", {
              collection: collectionQuery.data?.name ?? "",
            })}
          </>
        );
      })
      .with(Activity.type.REVIEW, () => {
        return <>{t("activity.items.reviewed")}</>;
      })
      .with(Activity.type.POST, () => {
        return <>{t("activity.items.postedAbout")}</>;
      })
      .with(Activity.type.FOLLOW, () => {
        return <>{t("activity.items.followed")}</>;
      })
      .with(Activity.type.OBTAINED_GAME_ACHIEVEMENT, () => (
        <ObtainedAchievementActivityContent
          activity={gameAchievementActivityQuery.data}
        />
      ))
      .with(Activity.type.ACHIEVEMENT_UNLOCKED, () =>
        unlockedAchievement
          ? t("activity.items.achievementUnlocked", {
              name: unlockedAchievement.name ?? "",
              tier: unlockedTier,
            })
          : t("activity.items.unknown"),
      )
      .otherwise(() => {
        return t("activity.items.unknown");
      });
  }, [
    activity.type,
    collectionQuery.data?.name,
    gameAchievementActivityQuery.data,
    unlockedAchievement,
    unlockedTier,
    t,
  ]);

  const gameQuery = useGame(gameId, {
    relations: {
      cover: true,
    },
  });

  return (
    <Box className={"w-full"}>
      <Group
        className={
          "w-full items-center flex-nowrap p-2 relative ion-activatable rounded bg-paper-2"
        }
      >
        <Box className={"flex max-w-96 items-center flex-nowrap gap-2"}>
          <UserAvatar userId={activity.profileUserId} size={"md"} />
          <Stack className={"gap-1"}>
            <Link href={`/profile/${activity.profileUserId}`}>
              <Text className={"text-xs text-[#808080] line-clamp-2"}>
                {profileQuery.data?.username}
              </Text>
            </Link>

            <Text className={"text-xs font-bold"}>{actionText}</Text>
          </Stack>
        </Box>
        {activity.type === Activity.type.ACHIEVEMENT_UNLOCKED ? (
          <Box className={"ms-auto"}>
            <AchievementBadge
              icon={unlockedAchievement?.icon}
              tier={unlockedTier}
            />
          </Box>
        ) : (
          <Link
            href={
              reviewQuery.data
                ? `/game/${gameId}?reviewId=${reviewQuery.data.id}`
                : `/game/${gameId}`
            }
            className={"flex flex-col w-fit items-center ms-auto"}
          >
            <Text
              className={"font-bold text-sm text-center max-w-20 text-wrap"}
            >
              {gameQuery.data?.name}
            </Text>
            {reviewQuery.data && (
              <GameRating size={"sm"} value={reviewQuery.data.rating} />
            )}
          </Link>
        )}

        <Group className={"flex-nowrap gap-1 items-start"}>
          {activity.type === Activity.type.ACHIEVEMENT_UNLOCKED && (
            <ActivityItemComments activity={activity} />
          )}
          <ActivityItemLikes activity={activity} />
        </Group>
      </Group>
    </Box>
  );
};

const ActivityItem = buildPresenterComponent(
  "ActivityItem",
  DEFAULT_ActivityItem,
);

export { ActivityItem };