import {
  AchievementBadge,
  ActivityItemLikes,
  ActivityItemProps,
  GameRating,
  ObtainedAchievementActivityContent,
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
import { AchievementIconDto, Activity } from "@repo/wrapper/server";
import { useMemo } from "react";
import { match } from "ts-pattern";

const DEFAULT_ActivityItem = ({ activity }: ActivityItemProps) => {
  const { t } = useTranslation();

  const hasEmbeddedProfile = activity.profile !== undefined;
  const hasEmbeddedCollectionEntry = activity.collectionEntry !== undefined;
  const hasEmbeddedCollection = activity.collection !== undefined;
  const hasEmbeddedReview = activity.review !== undefined;
  const hasEmbeddedPost = activity.post !== undefined;
  const hasEmbeddedGameAchievementActivity =
    activity.obtainedGameAchievementActivity !== undefined;
  const hasEmbeddedGame = activity.game !== undefined;

  const collectionEntryQuery = useCollectionEntry(activity.collectionEntryId, {
    enabled: !hasEmbeddedCollectionEntry,
  });
  const collectionQuery = useCollection(activity.collectionId, {
    enabled: !hasEmbeddedCollection,
  });
  const reviewQuery = useReview(activity.reviewId, {
    enabled: !hasEmbeddedReview,
  });
  const postQuery = usePost(activity.postId, {
    enabled: !hasEmbeddedPost,
  });
  const profileQuery = useUserProfile(activity.profileUserId, {
    enabled: !hasEmbeddedProfile,
  });
  const gameAchievementActivityQuery = useObtainedGameAchievementActivity(
    activity.obtainedGameAchievementActivityId,
    { enabled: !hasEmbeddedGameAchievementActivity },
  );

  const profile = hasEmbeddedProfile ? activity.profile : profileQuery.data;
  const collectionEntry = hasEmbeddedCollectionEntry
    ? activity.collectionEntry
    : collectionEntryQuery.data;
  const collection = hasEmbeddedCollection
    ? activity.collection
    : collectionQuery.data;
  const review = hasEmbeddedReview ? activity.review : reviewQuery.data;
  const post = hasEmbeddedPost ? activity.post : postQuery.data;
  const gameAchievementActivity = hasEmbeddedGameAchievementActivity
    ? activity.obtainedGameAchievementActivity
    : gameAchievementActivityQuery.data;

  const unlockedTier = activity.obtainedAchievement?.tier ?? 0;
  const unlockedAchievement = activity.obtainedAchievement?.definition;

  const gameId =
    collectionEntry?.gameId ||
    review?.gameId ||
    post?.gameId ||
    gameAchievementActivity?.externalGame?.gameId ||
    activity.game?.id;

  const actionText = useMemo(() => {
    return match(activity.type)
      .with(Activity.type.COLLECTION_ENTRY, () => {
        return (
          <>
            {t("activity.items.addedTo", {
              collection: collection?.name ?? "",
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
          activity={gameAchievementActivity ?? undefined}
          hasEmbeddedGame={hasEmbeddedGame}
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
    collection?.name,
    gameAchievementActivity,
    hasEmbeddedGame,
    unlockedAchievement,
    unlockedTier,
    t,
  ]);

  const gameQuery = useGame(
    gameId,
    {
      relations: {
        cover: true,
      },
    },
    "off",
    { enabled: !hasEmbeddedGame },
  );

  const game = hasEmbeddedGame ? activity.game : gameQuery.data;

  return (
    <Box className={"w-full"}>
      <Group
        className={
          "w-full items-center flex-nowrap p-2 relative ion-activatable rounded bg-paper-2"
        }
      >
        <Box className={"flex max-w-96 items-center flex-nowrap gap-2"}>
          <UserAvatar
            userId={activity.profileUserId}
            profile={activity.profile}
            size={"md"}
          />
          <Stack className={"gap-1"}>
            <Link href={`/profile/${activity.profileUserId}`}>
              <Text className={"text-xs text-[#808080] line-clamp-2"}>
                {profile?.username}
              </Text>
            </Link>

            <Text className={"text-xs font-bold"}>{actionText}</Text>
          </Stack>
        </Box>
        {activity.type === Activity.type.ACHIEVEMENT_UNLOCKED ? (
          <Box className={"ms-auto"}>
            <AchievementBadge
              icon={
                unlockedAchievement?.icon as
                  | AchievementIconDto
                  | null
                  | undefined
              }
              tier={unlockedTier}
            />
          </Box>
        ) : (
          <Link
            href={
              review
                ? `/game/${gameId}?reviewId=${review.id}`
                : `/game/${gameId}`
            }
            className={"flex flex-col w-fit items-center ms-auto"}
          >
            <Text
              className={"font-bold text-sm text-center max-w-20 text-wrap"}
            >
              {game?.name}
            </Text>
            {review && <GameRating size={"sm"} value={review.rating} />}
          </Link>
        )}

        <Group className={"flex-nowrap gap-1 items-start"}>
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
